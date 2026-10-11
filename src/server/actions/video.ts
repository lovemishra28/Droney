"use server";

import { z } from "zod";
import { getCurrentSession } from "@/server/services/session";
import {
  createBunnyVideoEntry,
  generateBunnyTusAuth,
  type BunnyTusAuthCredentials,
} from "@/lib/bunny";
import type { ActionResponse } from "@/server/actions/auth";

const initVideoUploadSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  sku: z.string().min(1, "SKU is required"),
  fileName: z.string().min(1, "File name is required"),
});

/**
 * Initializes a Bunny.net Stream upload session with TUS authorization headers (Admin only).
 */
export async function initBunnyVideoUploadAction(
  rawInput: z.infer<typeof initVideoUploadSchema>
): Promise<ActionResponse<BunnyTusAuthCredentials>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  const parsed = initVideoUploadSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input parameters.",
    };
  }

  const { sku, fileName } = parsed.data;
  const videoTitle = `${sku}_flight_demo_${fileName}`;

  try {
    // 1. Create container in Bunny Stream
    const bunnyVideo = await createBunnyVideoEntry(videoTitle);

    // 2. Generate signed TUS upload credentials
    const tusAuth = generateBunnyTusAuth(bunnyVideo.id);

    return {
      success: true,
      data: tusAuth,
    };
  } catch (error) {
    console.error("[Bunny Video Initialization Error]:", error);
    return {
      success: false,
      message: "Failed to initialize video upload session with Bunny.net.",
    };
  }
}
