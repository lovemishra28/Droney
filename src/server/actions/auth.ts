"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, or } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { identifierOtpRateLimiter, ipOtpRateLimiter } from "@/lib/redis";
import {
  createAndStoreOtp,
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

/**
 * Initiates the passwordless OTP login/registration flow.
 */
export async function requestOtpAction(
  rawInput: RequestOtpInput
): Promise<ActionResponse<{ isNewUser: boolean }>> {
  const parsed = requestOtpSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input",
    };
  }

  const { identifier } = parsed.data;
  const headerStore = await headers();
  const clientIp =
    headerStore.get("cf-connecting-ip") ||
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "127.0.0.1";

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

  // 3. Inspect if user exists in PostgreSQL to prompt full name if new
  const phoneVariant =
    parsedIdent.type === "phone" ? normalized.replace("+91", "") : null;
  const existingUser = await db.query.users.findFirst({
    where:
      parsedIdent.type === "phone"
        ? or(eq(users.phone, normalized), eq(users.phone, phoneVariant!))
        : eq(users.email, normalized),
    columns: { id: true },
  });

  const isNewUser = !existingUser;

  // 4. Generate & Cache SHA-256 OTP Digest in Redis
  const otpResult = await createAndStoreOtp(normalized);

  // 5. Dispatch via Fast2SMS (DLT) or Resend (Email)
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
    data: { isNewUser },
  };
}

/**
 * Validates the submitted OTP, provisions new profiles, and mints session cookies.
 */
export async function verifyOtpAction(
  rawInput: VerifyOtpInput
): Promise<ActionResponse<{ userId: string; role: string }>> {
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
      return {
        success: false,
        message: "Full name is required for new accounts.",
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

