"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { identifierOtpRateLimiter, ipOtpRateLimiter } from "@/lib/redis";
import {
  createAndStoreOtp,
  consumeVerifiedRegistration,
  markRegistrationVerified,
  verifyAndInvalidateOtp,
} from "@/server/services/otp";
import {
  dispatchOtpNotification,
  parseIdentifier,
} from "@/server/services/notifications";
import {
  createSessionCookie,
  deleteSessionCookie,
  getCurrentSession,
} from "@/server/services/session";
import {
  requestOtpSchema,
  verifyOtpSchema,
  type RequestOtpInput,
  type VerifyOtpInput,
} from "@/lib/validations/auth";

export interface ActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

function getClientIp(headerStore: { get(name: string): string | null }): string {
  const cfIp = headerStore.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const vercelIp = headerStore.get("x-vercel-forwarded-for")?.split(",")[0]?.trim();
  if (vercelIp) return vercelIp;

  const realIp = headerStore.get("x-real-ip")?.trim();
  if (realIp) return realIp;

  const forwarded = headerStore.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (forwarded) return forwarded;

  return "unknown-client";
}

/**
 * Initiates the passwordless OTP login/registration flow.
 * Does not enumerate existing users in the response.
 */
export async function requestOtpAction(
  rawInput: RequestOtpInput
): Promise<ActionResponse<void>> {
  const parsed = requestOtpSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const { identifier } = parsed.data;
  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);

  // 1. IP-Level Sliding Window Check (5 requests / 10 min)
  const ipRate = await ipOtpRateLimiter.limit(clientIp);
  if (!ipRate.success) {
    return {
      success: false,
      message:
        "Too many verification requests from this device. Please wait 10 minutes.",
    };
  }

  const parsedIdent = parseIdentifier(identifier);
  const normalized = parsedIdent.normalized;

  // 2. Identifier-Level Check (3 requests / 15 min)
  const targetRate = await identifierOtpRateLimiter.limit(normalized);
  if (!targetRate.success) {
    return {
      success: false,
      message:
        "Too many OTP requests for this account. Please wait 15 minutes.",
    };
  }

  // 3. Generate & Cache SHA-256 OTP Digest in Redis
  const otpResult = await createAndStoreOtp(normalized);

  // 4. Dispatch via Fast2SMS (DLT) or Resend (Email)
  const dispatchResult = await dispatchOtpNotification(
    normalized,
    otpResult.code
  );
  if (!dispatchResult.success) {
    return {
      success: false,
      message: dispatchResult.error || "Failed to dispatch verification code.",
    };
  }

  return {
    success: true,
    message: `Verification code sent successfully to ${normalized}`,
  };
}

/**
 * Validates the submitted OTP, provisions new profiles, and mints session cookies.
 */
export async function verifyOtpAction(
  rawInput: VerifyOtpInput
): Promise<
  ActionResponse<{
    userId?: string;
    role?: string;
    requiresName?: boolean;
  }>
> {
  const headerStore = await headers();
  const clientIp = getClientIp(headerStore);

  // IP rate limiting for OTP verification attempts (anti-brute-force)
  const ipRate = await ipOtpRateLimiter.limit(`verify:${clientIp}`);
  if (!ipRate.success) {
    return {
      success: false,
      message:
        "Too many verification attempts from this device. Please wait 10 minutes.",
    };
  }

  const parsed = verifyOtpSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid verification code",
    };
  }

  const { identifier, otp, fullName } = parsed.data;
  const parsedIdent = parseIdentifier(identifier);
  const normalized = parsedIdent.normalized;

  // 1. Atomic Verification & Invalidation in Redis
  const verifyResult = await verifyAndInvalidateOtp(normalized, otp);
  if (!verifyResult.success) {
    if (verifyResult.reason === "EXPIRED_OR_NOT_FOUND") {
      return {
        success: false,
        message:
          "Code has expired or does not exist. Please request a new OTP.",
      };
    }
    if (verifyResult.reason === "MAX_ATTEMPTS_EXCEEDED") {
      return {
        success: false,
        message:
          "Too many incorrect attempts. This OTP has been invalidated for security.",
      };
    }
    return {
      success: false,
      message: "Incorrect verification code. Please check and try again.",
    };
  }

  // 2. Query Existing User or Insert New Customer Record
  const phoneVariant =
    parsedIdent.type === "phone" ? normalized.replace("+91", "") : null;
  let user = await db.query.users.findFirst({
    where:
      parsedIdent.type === "phone"
        ? or(eq(users.phone, normalized), eq(users.phone, phoneVariant!))
        : eq(users.email, normalized),
  });

  if (!user) {
    if (!fullName || fullName.trim().length < 2) {
      await markRegistrationVerified(normalized);
      return {
        success: true,
        message: "OTP verified. Please enter your name to complete registration.",
        data: { requiresName: true },
      };
    }

    const [newUser] = await db
      .insert(users)
      .values({
        fullName: fullName.trim(),
        phone: parsedIdent.type === "phone" ? normalized : null,
        email: parsedIdent.type === "email" ? normalized : null,
        role: "customer",
      })
      .returning();

    user = newUser;
  }

  // 3. Issue Encrypted HttpOnly Session Cookie (jose A256GCM)
  await createSessionCookie({
    id: user.id,
    fullName: user.fullName,
    role: user.role,
  });

  return {
    success: true,
    message: "Authentication successful",
    data: {
      userId: user.id,
      role: user.role,
    },
  };
}

export async function completeRegistrationAction(
  rawInput: { identifier: string; fullName: string }
): Promise<ActionResponse<{ userId: string; role: string }>> {
  const parsedIdentifier = requestOtpSchema.shape.identifier.safeParse(
    rawInput.identifier
  );
  const fullName = rawInput.fullName?.trim();

  if (!parsedIdentifier.success || !fullName || fullName.length < 2) {
    return { success: false, message: "Please provide a valid name and identifier." };
  }

  const parsedIdent = parseIdentifier(parsedIdentifier.data);
  const normalized = parsedIdent.normalized;
  if (!(await consumeVerifiedRegistration(normalized))) {
    return {
      success: false,
      message: "Registration verification expired. Please request a new OTP.",
    };
  }

  const phoneVariant =
    parsedIdent.type === "phone" ? normalized.replace("+91", "") : null;
  let user = await db.query.users.findFirst({
    where:
      parsedIdent.type === "phone"
        ? or(eq(users.phone, normalized), eq(users.phone, phoneVariant!))
        : eq(users.email, normalized),
  });

  if (!user) {
    const [newUser] = await db
      .insert(users)
      .values({
        fullName,
        phone: parsedIdent.type === "phone" ? normalized : null,
        email: parsedIdent.type === "email" ? normalized : null,
        role: "customer",
      })
      .returning();
    user = newUser;
  }

  await createSessionCookie({
    id: user.id,
    fullName: user.fullName,
    role: user.role,
  });

  return {
    success: true,
    message: "Registration complete.",
    data: { userId: user.id, role: user.role },
  };
}

/**
 * Destroys the active session cookie.
 */
export async function logoutAction(): Promise<ActionResponse> {
  await deleteSessionCookie();
  return {
    success: true,
    message: "Logged out successfully",
  };
}

export async function logoutAndRedirectAction(): Promise<void> {
  await deleteSessionCookie();
  redirect("/");
}

// Backward-compatible wrappers for client components
export async function requestOtp(identifier: string) {
  const result = await requestOtpAction({ identifier });
  if (!result.success) {
    throw new Error(result.message || "Failed to request verification code");
  }
  return result;
}

export async function verifyOtpAndLogin(
  identifier: string,
  enteredOtp: string,
  fullName?: string
) {
  const result = await verifyOtpAction({
    identifier,
    otp: enteredOtp,
    fullName,
  });
  if (!result.success) {
    throw new Error(result.message || "Failed to verify code");
  }
  return result;
}

/**
 * Lightweight safe session info for client-side authorization and restrictions.
 */
export async function getClientSessionAction(): Promise<{
  isAuthenticated: boolean;
  role: "customer" | "admin" | null;
  userId: string | null;
  fullName: string | null;
}> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      isAuthenticated: false,
      role: null,
      userId: null,
      fullName: null,
    };
  }
  return {
    isAuthenticated: true,
    role: session.role === "admin" ? "admin" : "customer",
    userId: session.sub,
    fullName: session.fullName || null,
  };
}
