import crypto from "node:crypto";
import { env } from "@/lib/env";

export interface BunnyVideoResponse {
  id: string;
  guid?: string;
  videoLibraryId: number;
  title: string;
  dateUploaded: string;
  views: number;
  isPublic: boolean;
  length: number;
  status: number; // 0 = Created, 1 = Uploaded, 2 = Processing, 3 = Transcoding Complete, 4 = Failed
  framerate: number;
  width: number;
  height: number;
  availableResolutions: string;
  thumbnailCount: number;
  encodeProgress: number;
  storageSize: number;
  hasMP4Fallback: boolean;
}

export interface BunnyTusAuthCredentials {
  videoId: string;
  libraryId: string;
  tusEndpoint: string;
  authorizationSignature: string;
  authorizationExpire: number;
  hlsPlaylistUrl: string;
}

/**
 * Creates a video entry in Bunny.net Stream to reserve a unique video ID.
 */
export async function createBunnyVideoEntry(
  title: string
): Promise<BunnyVideoResponse> {
  const url = `${env.BUNNY_API_BASE_URL.replace(/\/$/, "")}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      AccessKey: env.BUNNY_STREAM_API_KEY,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Bunny API error (${response.status}): ${errorBody}`);
  }

  const data = (await response.json()) as BunnyVideoResponse;
  if (!data.id && data.guid) {
    data.id = data.guid;
  }
  return data;
}

/**
 * Generates SHA-256 cryptographic TUS authentication headers for client-side chunked streaming.
 * Signature Algorithm: sha256(library_id + api_key + expiration_time + video_id)
 */
export function generateBunnyTusAuth(
  videoId: string,
  expiresInSeconds = 7200 // 2 hours validity window
): BunnyTusAuthCredentials {
  const expirationTimestamp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const rawSignatureString = `${env.BUNNY_STREAM_LIBRARY_ID}${env.BUNNY_STREAM_API_KEY}${expirationTimestamp}${videoId}`;

  const authorizationSignature = crypto
    .createHash("sha256")
    .update(rawSignatureString)
    .digest("hex");

  const cdnHost = env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST.replace(/\/$/, "");
  const hlsPlaylistUrl = `${cdnHost}/${videoId}/playlist.m3u8`;

  return {
    videoId,
    libraryId: env.BUNNY_STREAM_LIBRARY_ID,
    tusEndpoint: env.BUNNY_TUS_ENDPOINT_URL,
    authorizationSignature,
    authorizationExpire: expirationTimestamp,
    hlsPlaylistUrl,
  };
}

/**
 * Queries the current encoding and transcoding progress for a given video ID.
 */
export async function getBunnyVideoStatus(
  videoId: string
): Promise<BunnyVideoResponse> {
  const url = `${env.BUNNY_API_BASE_URL.replace(/\/$/, "")}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      AccessKey: env.BUNNY_STREAM_API_KEY,
      Accept: "application/json",
    },
    next: { revalidate: 0 }, // Do not cache polling checks
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch video status for ID: ${videoId}`);
  }

  return (await response.json()) as BunnyVideoResponse;
}

/**
 * Permanently removes a video from the Bunny.net Stream library.
 */
export async function deleteBunnyVideo(videoId: string): Promise<boolean> {
  const url = `${env.BUNNY_API_BASE_URL.replace(/\/$/, "")}/library/${env.BUNNY_STREAM_LIBRARY_ID}/videos/${videoId}`;

  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      AccessKey: env.BUNNY_STREAM_API_KEY,
    },
  });

  return response.ok;
}

// Backward-compatible utilities
export async function createBunnyVideo(title: string) {
  const res = await createBunnyVideoEntry(title);
  return { guid: res.id || res.guid || "", title: res.title };
}

export function verifyBunnyWebhook(
  rawBody: string,
  signature: string,
  secret: string
): boolean {
  const hash = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");
  return hash === signature;
}

export function getBunnyHlsUrl(videoId: string): string {
  const cdnHost = env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST.replace(/\/$/, "");
  return `${cdnHost}/${videoId}/playlist.m3u8`;
}
