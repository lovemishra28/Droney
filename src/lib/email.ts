import { Resend } from "resend";
import { env } from "@/lib/env";

export const resend = new Resend(env.RESEND_API_KEY);

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Generates branded HTML template for the 6-digit OTP email.
 */
function renderOtpEmailHtml(otpCode: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Verification Code</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #09090b; color: #f4f4f5; margin: 0; padding: 40px 16px;">
        <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 480px; background-color: #18181b; border: 1px solid #27272a; border-radius: 8px; overflow: hidden; padding: 32px;">
          <tr>
            <td align="center" style="padding-bottom: 24px;">
              <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 0.5px;">AEROSTORE</h1>
              <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0;">Drones & Flight Components</p>
            </td>
          </tr>
          <tr>
            <td>
              <p style="color: #e4e4e7; font-size: 15px; line-height: 24px; margin: 0 0 16px;">Here is your single-use verification code to log in or register your account:</p>
              <div style="background-color: #09090b; border: 1px solid #3f3f46; border-radius: 6px; padding: 18px; text-align: center; margin-bottom: 20px;">
                <span style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #ffffff; font-family: monospace;">${otpCode}</span>
              </div>
              <p style="color: #a1a1aa; font-size: 13px; line-height: 20px; margin: 0 0 8px;">This code is valid for <strong>5 minutes</strong>. Never share this code with anyone.</p>
              <p style="color: #71717a; font-size: 12px; margin: 0;">If you did not request this login attempt, you can safely ignore this email.</p>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;
}

/**
 * Dispatches transactional email containing the OTP via the Resend API.
 */
export async function sendOtpEmail(
  toEmail: string,
  otpCode: string
): Promise<SendEmailResult> {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM_ADDRESS,
      to: toEmail.trim().toLowerCase(),
      subject: `Your AeroStore verification code: ${otpCode}`,
      html: renderOtpEmailHtml(otpCode),
    });

    if (error) {
      console.error("[Resend Delivery Error]:", error);
      return {
        success: false,
        error: "Email delivery failed. Please verify your address and retry.",
      };
    }

    return {
      success: true,
      messageId: data?.id,
    };
  } catch (error) {
    console.error("[Resend API Failure]:", error);
    return {
      success: false,
      error: "Unable to send verification email. Please try again later.",
    };
  }
}
