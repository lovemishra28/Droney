import { sendOtpSms, sanitizeIndianPhone } from "@/lib/sms";
import { sendOtpEmail } from "@/lib/email";

export type IdentifierType = "phone" | "email";

export interface IdentifierParseResult {
  isValid: boolean;
  type: IdentifierType | null;
  normalized: string;
}

/**
 * Analyzes string patterns to identify whether the target is an Indian mobile number or an email address.
 */
export function parseIdentifier(rawInput: string): IdentifierParseResult {
  const trimmed = rawInput.trim();

  // Test standard RFC 5322 email pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) {
    return {
      isValid: true,
      type: "email",
      normalized: trimmed.toLowerCase(),
    };
  }

  // Test Indian mobile format
  const sanitizedPhone = sanitizeIndianPhone(trimmed);
  if (sanitizedPhone) {
    return {
      isValid: true,
      type: "phone",
      normalized: `+91${sanitizedPhone}`,
    };
  }

  return {
    isValid: false,
    type: null,
    normalized: trimmed,
  };
}

/**
 * Unified dispatch handler routing the OTP code to SMS or Email.
 */
export async function dispatchOtpNotification(
  identifier: string,
  otpCode: string
): Promise<{ success: boolean; error?: string }> {
  const parsed = parseIdentifier(identifier);

  if (!parsed.isValid || !parsed.type) {
    return {
      success: false,
      error:
        "Please enter a valid 10-digit Indian phone number or email address.",
    };
  }

  if (parsed.type === "phone") {
    const smsResult = await sendOtpSms(parsed.normalized, otpCode);
    return smsResult;
  }

  const emailResult = await sendOtpEmail(parsed.normalized, otpCode);
  return emailResult;
}

// Backward-compatible alias
export async function dispatchOtp(identifier: string, otpCode: string) {
  const result = await dispatchOtpNotification(identifier, otpCode);
  if (!result.success) {
    throw new Error(result.error || "Failed to dispatch verification code");
  }
  return result;
}
