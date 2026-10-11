import crypto from "node:crypto";
import { redis } from "@/lib/redis";
import { env } from "@/lib/env";

const OTP_TTL_SECONDS = 300; // 5 Minutes TTL
const MAX_VERIFY_ATTEMPTS = 5; // Maximum incorrect attempts before invalidation

export interface OtpGenerateResult {
  code: string;
  expiresInSeconds: number;
}

export type OtpVerificationResult =
  | { success: true }
  | {
      success: false;
      reason: "EXPIRED_OR_NOT_FOUND" | "INVALID_CODE" | "MAX_ATTEMPTS_EXCEEDED";
    };

/**
 * Produces a SHA-256 hash using the raw OTP and secret salt.
 * Plaintext OTPs are never stored in cache or database.
 */
function hashOtp(identifier: string, code: string): string {
  return crypto
    .createHash("sha256")
    .update(`${identifier}:${code}:${env.OTP_SECRET_SALT}`)
    .digest("hex");
}

/**
 * Generates a 6-digit numeric OTP and stores its SHA-256 hash in Redis.
 */
export async function createAndStoreOtp(
  identifier: string
): Promise<OtpGenerateResult> {
  const normalizedIdentifier = identifier.trim().toLowerCase();

  // Cryptographically secure 6-digit generation (100000 - 999999)
  const rawCode = crypto.randomInt(100000, 1000000).toString();
  const hashedCode = hashOtp(normalizedIdentifier, rawCode);

  const otpKey = `otp:token:${normalizedIdentifier}`;
  const attemptsKey = `otp:attempts:${normalizedIdentifier}`;

  // Store hashed OTP with a strict 300-second TTL
  await redis.set(otpKey, hashedCode, { ex: OTP_TTL_SECONDS });
  // Reset failure attempt counter with the same TTL
  await redis.set(attemptsKey, 0, { ex: OTP_TTL_SECONDS });

  return {
    code: rawCode,
    expiresInSeconds: OTP_TTL_SECONDS,
  };
}

/**
 * Verifies the submitted OTP against Redis with atomic invalidation and attempt enforcement.
 */
export async function verifyAndInvalidateOtp(
  identifier: string,
  submittedCode: string
): Promise<OtpVerificationResult> {
  const normalizedIdentifier = identifier.trim().toLowerCase();
  const otpKey = `otp:token:${normalizedIdentifier}`;
  const attemptsKey = `otp:attempts:${normalizedIdentifier}`;

  // Retrieve stored hash and current failure attempt count
  const [storedHash, attempts] = await Promise.all([
    redis.get<string>(otpKey),
    redis.get<number>(attemptsKey),
  ]);

  if (!storedHash) {
    return { success: false, reason: "EXPIRED_OR_NOT_FOUND" };
  }

  // Purge token immediately if brute-force threshold is breached
  if ((attempts ?? 0) >= MAX_VERIFY_ATTEMPTS) {
    await Promise.all([redis.del(otpKey), redis.del(attemptsKey)]);
    return { success: false, reason: "MAX_ATTEMPTS_EXCEEDED" };
  }

  const candidateHash = hashOtp(normalizedIdentifier, submittedCode.trim());

  // Timing-safe buffer comparison to prevent timing attacks
  const isMatch =
    storedHash.length === candidateHash.length &&
    crypto.timingSafeEqual(
      Buffer.from(storedHash, "utf-8"),
      Buffer.from(candidateHash, "utf-8")
    );

  if (!isMatch) {
    // Increment failure attempt counter
    const updatedAttempts = await redis.incr(attemptsKey);
    if (updatedAttempts >= MAX_VERIFY_ATTEMPTS) {
      await Promise.all([redis.del(otpKey), redis.del(attemptsKey)]);
      return { success: false, reason: "MAX_ATTEMPTS_EXCEEDED" };
    }
    return { success: false, reason: "INVALID_CODE" };
  }

  // Atomic invalidation upon successful verification to block replay attacks
  await Promise.all([redis.del(otpKey), redis.del(attemptsKey)]);

  return { success: true };
}
