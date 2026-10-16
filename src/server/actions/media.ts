"use server";

import crypto from "node:crypto";
import { z } from "zod";
import { getCurrentSession } from "@/server/services/session";
import { createPresignedUploadUrl, type PresignedUrlResult } from "@/lib/r2";
import type { ActionResponse } from "@/server/actions/auth";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

const presignedProductImageSchema = z.object({
  productId: z.string().uuid("Invalid product ID").optional(),
  filename: z.string().min(1, "Filename is required"),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    message:
      "Unsupported file type. Only JPEG, PNG, WebP, and AVIF are allowed.",
  }),
});

const presignedPaymentProofSchema = z.object({
  orderReference: z.string().min(3, "Order reference is required"),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: "Unsupported file type. Upload a JPG, PNG, or WebP screenshot.",
  }),
});

/**
 * Issues an upload signature for product hardware photography (Admin only).
 */
export async function getProductImageUploadUrlAction(
  rawInput: z.infer<typeof presignedProductImageSchema>
): Promise<ActionResponse<PresignedUrlResult>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  const parsed = presignedProductImageSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input parameters.",
    };
  }

  const { productId, filename, contentType } = parsed.data;
  const fileExt = filename.split(".").pop()?.toLowerCase() || "webp";
  const uniqueId = crypto.randomUUID();
  const targetId = productId || uniqueId;

  // Deterministic file key: products/{productId}/images/{uuid}.{ext}
  const storageKey = `products/${targetId}/images/${uniqueId}.${fileExt}`;

  try {
    const result = await createPresignedUploadUrl(storageKey, contentType);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[R2 Presign Error]:", error);
    return {
      success: false,
      message: "Failed to create upload authorization token.",
    };
  }
}

/**
 * Issues an upload signature for UPI payment confirmation screenshots (Customer checkout flow).
 * Requires active session and ownership of the order reference.
 */
export async function getPaymentProofUploadUrlAction(
  rawInput: z.infer<typeof presignedPaymentProofSchema>
): Promise<ActionResponse<PresignedUrlResult>> {
  const session = await getCurrentSession();
  if (!session) {
    return {
      success: false,
      message: "Unauthorized: Active session required to upload payment proof.",
    };
  }

  const parsed = presignedPaymentProofSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid file format.",
    };
  }

  const { orderReference, contentType } = parsed.data;

  // Verify ownership: must match pending checkout in Redis or owned order in Postgres (or admin)
  let isOwned = session.role === "admin";
  if (!isOwned) {
    const pendingDirect = await redis.get<{ userId: string }>(`checkout:${orderReference}`);
    const pendingScoped = await redis.get<{ userId: string }>(`checkout:${session.sub}:${orderReference}`);
    const pending = pendingDirect || pendingScoped;

    if (pending?.userId === session.sub) {
      isOwned = true;
    } else {
      const ownedOrder = await db.query.orders.findFirst({
        where: and(
          eq(orders.orderReference, orderReference),
          eq(orders.userId, session.sub)
        ),
      });
      if (ownedOrder) {
        isOwned = true;
      }
    }
  }

  if (!isOwned) {
    return {
      success: false,
      message: "Unauthorized: You do not have permission to upload proof for this order.",
    };
  }

  const fileExt = contentType.split("/")[1] || "jpeg";
  const uniqueId = crypto.randomUUID();

  // Deterministic file key: payments/{orderReference}/{uuid}.{ext}
  const storageKey = `payments/${orderReference}/${uniqueId}.${fileExt}`;

  try {
    const result = await createPresignedUploadUrl(storageKey, contentType);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[R2 Payment Proof Presign Error]:", error);
    return {
      success: false,
      message: "Unable to authorize payment screenshot upload.",
    };
  }
}

const presignedStorefrontImageSchema = z.object({
  section: z.string().min(1).default("hero"),
  filename: z.string().min(1, "Filename is required"),
  contentType: z.enum(ALLOWED_IMAGE_TYPES, {
    message: "Unsupported file type. Only JPEG, PNG, WebP, and AVIF are allowed.",
  }),
});

/**
 * Issues an upload signature for Storefront CMS banners and sliders (Admin only).
 */
export async function getStorefrontImageUploadUrlAction(
  rawInput: z.infer<typeof presignedStorefrontImageSchema>
): Promise<ActionResponse<PresignedUrlResult>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  const parsed = presignedStorefrontImageSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input parameters.",
    };
  }

  const { section, filename, contentType } = parsed.data;
  const fileExt = filename.split(".").pop()?.toLowerCase() || "webp";
  const uniqueId = crypto.randomUUID();
  const storageKey = `storefront/${section}/${uniqueId}.${fileExt}`;

  try {
    const result = await createPresignedUploadUrl(storageKey, contentType);
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("[R2 Storefront Presign Error]:", error);
    return {
      success: false,
      message: "Failed to create upload authorization token.",
    };
  }
}


