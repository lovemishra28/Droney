import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies, headers } from "next/headers";

export const SESSION_COOKIE_NAME = "aero_session";

export interface SessionPayload {
  sub: string;
  role: "customer" | "admin" | string;
  fullName: string;
  name?: string;
}

export function getEncryptionKey(): Uint8Array {
  const secret =
    process.env.SESSION_SECRET || "default_local_dev_secret_key_32_chars!";
  return new TextEncoder().encode(secret.padEnd(32, "!").slice(0, 32));
}

/**
 * Encrypts user identity into a compact JWE token with A256GCM direct encryption.
 */
export async function encryptSessionToken(payload: {
  id: string;
  fullName: string;
  role: string;
}): Promise<string> {
  const secretKey = getEncryptionKey();
  return await new EncryptJWT({
    fullName: payload.fullName,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setSubject(payload.id)
    .setIssuedAt()
    .setExpirationTime("30d")
    .encrypt(secretKey);
}

/**
 * Decrypts and validates a session JWE token.
 */
export async function decryptSessionToken(
  token: string
): Promise<SessionPayload | null> {
  try {
    const secretKey = getEncryptionKey();
    const { payload } = await jwtDecrypt(token, secretKey, {
      clockTolerance: 15,
    });
    return {
      sub: (payload.sub as string) || "",
      role: (payload.role as string) || "customer",
      fullName: (payload.fullName as string) || "",
      name: (payload.fullName as string) || "",
    };
  } catch {
    return null;
  }
}

/**
 * Creates an encrypted HttpOnly session cookie on the active response.
 */
export async function createSessionCookie(user: {
  id: string;
  fullName: string;
  role: string;
}): Promise<string> {
  const token = await encryptSessionToken(user);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  });
  return token;
}

/**
 * Destroys the active session cookie across domain paths.
 */
export async function deleteSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
  cookieStore.delete("aerostore_session");
}

/**
 * Retrieves and decrypts the active session payload from cookies if present.
 */
export async function getCurrentSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  let token =
    cookieStore.get(SESSION_COOKIE_NAME)?.value ||
    cookieStore.get("aerostore_session")?.value;

  if (!token) {
    try {
      const headerList = await headers();
      const auth = headerList.get("authorization");
      if (auth && auth.startsWith("Bearer ")) {
        token = auth.slice(7).trim();
      }
    } catch {
      // headers() might be called outside request scope
    }
  }

  if (!token) return null;

  // Staging / Test Load Testing Bypass fallback for synthetic k6 suites
  if (
    process.env.NODE_ENV !== "production" &&
    (token === "YOUR_STAGING_SESSION_TOKEN" || token.startsWith("test-stress-"))
  ) {
    return {
      sub: "00000000-0000-0000-0000-000000000001",
      role: "customer",
      fullName: "Stress Tester",
      name: "Stress Tester",
    };
  }

  return await decryptSessionToken(token);
}

// Backward-compatible aliases
export const verifySessionToken = decryptSessionToken;

export async function createSessionToken(payload: {
  sub: string;
  role: "customer" | "admin";
  name: string;
}): Promise<string> {
  return await encryptSessionToken({
    id: payload.sub,
    fullName: payload.name,
    role: payload.role,
  });
}
