import { env } from "@/lib/env";

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Normalizes input phone numbers into 10-digit Indian mobile format.
 */
export function sanitizeIndianPhone(rawPhone: string): string | null {
  const digitsOnly = rawPhone.replace(/\D/g, "");

  if (digitsOnly.length === 10) {
    return digitsOnly;
  }

  if (digitsOnly.length === 12 && digitsOnly.startsWith("91")) {
    return digitsOnly.slice(2);
  }

  if (digitsOnly.length === 11 && digitsOnly.startsWith("0")) {
    return digitsOnly.slice(1);
  }

  return null;
}

/**
 * Dispatches a 6-digit OTP via Fast2SMS DLT transactional route.
 * Template format: "Your verification code for Drone Store is {#var#}. Valid for 5 minutes. Do not share this OTP with anyone."
 */
export async function sendOtpSms(
  phone: string,
  otpCode: string
): Promise<SendSmsResult> {
  const sanitizedPhone = sanitizeIndianPhone(phone);

  if (!sanitizedPhone) {
    return { success: false, error: "Invalid 10-digit Indian phone number" };
  }

  try {
    const payload = {
      route: "dlt",
      sender_id: env.FAST2SMS_SENDER_ID,
      message: env.FAST2SMS_DLT_TEMPLATE_ID,
      variables_values: otpCode,
      flash: 0,
      numbers: sanitizedPhone,
    };

    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: env.FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || data.return === false) {
      console.error("[Fast2SMS Delivery Error]:", data.message || data);
      return {
        success: false,
        error:
          "SMS dispatch failed. Please try again or use email verification.",
      };
    }

    return {
      success: true,
      messageId: data.request_id || undefined,
    };
  } catch (error) {
    // Map network failures to user-friendly messages without leaking provider errors
    console.error("[Fast2SMS Request Failure]:", error);
    return {
      success: false,
      error: "Temporary network failure sending SMS. Please retry shortly.",
    };
  }
}
