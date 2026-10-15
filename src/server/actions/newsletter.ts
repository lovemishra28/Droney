"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";

const NewsletterSchema = z.object({
  email: z.string().trim().email("Please provide a valid email address"),
});

export async function subscribeNewsletter(email: string) {
  try {
    const validated = NewsletterSchema.parse({ email });
    await db.insert(inquiries).values({
      type: "newsletter",
      email: validated.email.toLowerCase(),
      payload: { source: "storefront_footer" },
    });

    return {
      success: true,
      message: "You're on the flight list! Watch your inbox for VIP drops.",
      email: validated.email,
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Invalid email address",
    };
  }
}
