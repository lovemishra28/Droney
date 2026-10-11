"use server";

import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productMedia, products } from "@/lib/db/schema";
import { getCurrentSession } from "@/server/services/session";
import type { ActionResponse } from "@/server/actions/auth";

const attachVideoSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  videoId: z.string().min(1, "Bunny Video ID is required"),
  displayOrder: z.number().int().default(1),
});

/**
 * Creates a placeholder product_media entry linking the Bunny video UUID.
 * The webhook marks the status live once transcoding completes.
 */
export async function attachBunnyVideoToProductAction(
  rawInput: z.infer<typeof attachVideoSchema>
): Promise<ActionResponse<{ mediaId: string }>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  const parsed = attachVideoSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid payload.",
    };
  }

  const { productId, videoId, displayOrder } = parsed.data;

  // Verify product exists
  const productExists = await db.query.products.findFirst({
    where: eq(products.id, productId),
    columns: { id: true },
  });

  if (!productExists) {
    return {
      success: false,
      message: "Target product does not exist.",
    };
  }

  // Insert media record with a pending placeholder URL
  const [createdMedia] = await db
    .insert(productMedia)
    .values({
      productId,
      mediaType: "video",
      storageProvider: "bunny",
      playbackId: videoId,
      url: "PENDING_TRANSCODE",
      displayOrder,
    })
    .returning({ id: productMedia.id });

  return {
    success: true,
    data: { mediaId: createdMedia.id },
  };
}
