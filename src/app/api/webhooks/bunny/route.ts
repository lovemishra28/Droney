import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse, type NextRequest } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { productMedia } from "@/lib/db/schema";
import { env } from "@/lib/env";

interface BunnyWebhookPayload {
  VideoId: string;
  VideoLibraryId: number;
  Status: number; // 3 = Transcoding Complete, 4 = Failed
}

/**
 * Validates request signatures to guarantee payloads originate strictly from Bunny.net.
 * Expected Signature: sha256(webhook_secret + video_id).
 */
function verifyBunnySignature(
  signatureHeader: string | null,
  videoId: string
): boolean {
  if (!signatureHeader) {
    return false;
  }

  const expectedSignature = crypto
    .createHash("sha256")
    .update(`${env.BUNNY_WEBHOOK_SECRET}${videoId}`)
    .digest("hex");

  // Timing-safe buffer comparison to prevent timing side-channel attacks
  return (
    signatureHeader.length === expectedSignature.length &&
    crypto.timingSafeEqual(
      Buffer.from(signatureHeader, "utf-8"),
      Buffer.from(expectedSignature, "utf-8")
    )
  );
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let payload: BunnyWebhookPayload;

    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { VideoId, Status } = payload;

    if (!VideoId) {
      return NextResponse.json(
        { error: "Missing VideoId in payload" },
        { status: 400 }
      );
    }

    // 1. Verify Webhook Authenticity
    const incomingSignature =
      request.headers.get("bunny-signature") ||
      request.headers.get("x-bunny-signature") ||
      request.nextUrl.searchParams.get("token");

    const isValid = verifyBunnySignature(incomingSignature, VideoId);
    if (!isValid) {
      console.warn(
        `[Bunny Webhook]: Unauthorized callback rejected for VideoId: ${VideoId}`
      );
      return NextResponse.json(
        { error: "Invalid cryptographic signature" },
        { status: 401 }
      );
    }

    // 2. Filter for Status 3 (Transcoding Complete)
    if (Status !== 3) {
      // Acknowledge non-completion events (e.g., Status 2 encoding in progress) without mutation
      return NextResponse.json({
        message: "Status acknowledged",
        status: Status,
      });
    }

    // 3. Resolve Media Record in PostgreSQL via Drizzle
    const existingMedia = await db.query.productMedia.findFirst({
      where: eq(productMedia.playbackId, VideoId),
      columns: { id: true, productId: true },
    });

    if (!existingMedia) {
      console.warn(
        `[Bunny Webhook]: No matching product_media record found for VideoId: ${VideoId}`
      );
      return NextResponse.json(
        { message: "VideoId not associated with any catalog product" },
        { status: 200 }
      );
    }

    // 4. Construct Public HLS Streaming URL and Update DB
    const cdnHost = env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST.replace(/\/$/, "");
    const hlsPlaylistUrl = `${cdnHost}/${VideoId}/playlist.m3u8`;

    await db
      .update(productMedia)
      .set({
        url: hlsPlaylistUrl,
      })
      .where(eq(productMedia.id, existingMedia.id));

    // 5. Purge Next.js Edge Caches for Instant Storefront Propagation
    try {
      const purge = revalidateTag as (tag: string, profile?: any) => void;
      purge("catalog", "max");
      purge(`product-${existingMedia.productId}`, "max");
    } catch {
      // Ignore cache invalidation errors in environments without active tag store
    }

    return NextResponse.json({
      success: true,
      message: "Video HLS stream activated and cache invalidated.",
      url: hlsPlaylistUrl,
    });
  } catch (error) {
    console.error("[Bunny Webhook Execution Error]:", error);
    return NextResponse.json(
      { error: "Internal server error processing webhook" },
      { status: 500 }
    );
  }
}
