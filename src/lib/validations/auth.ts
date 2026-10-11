import { z } from "zod";
import { parseIdentifier } from "@/server/services/notifications";

export const requestOtpSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(3, "Identifier must be at least 3 characters")
    .refine((val) => parseIdentifier(val).isValid, {
      message:
        "Please enter a valid 10-digit Indian phone number or email address",
    }),
});

export const verifyOtpSchema = z.object({
  identifier: z
    .string()
    .trim()
    .refine((val) => parseIdentifier(val).isValid, {
      message: "Invalid phone number or email address",
    }),
  otp: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^[0-9]+$/, "Verification code must contain only numbers"),
  fullName: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name cannot exceed 100 characters")
    .optional(),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
