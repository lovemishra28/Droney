"use server";

import { z } from "zod";

const NewsletterSchema = z.object({
  email: z.string().email("Please provide a valid email address"),
});

export async function subscribeNewsletter(email: string) {
  try {
    const validated = NewsletterSchema.parse({ email });
    return {
      success: true,
      message: `You're on the flight list! Watch your inbox for VIP drops.`,
      email: validated.email,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Invalid email address",
    };
  }
}
