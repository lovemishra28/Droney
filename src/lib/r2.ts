import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/lib/env";

/**
 * Cloudflare R2 S3-compatible client instance.
 * Uses Cloudflare account ID to construct the endpoint route.
 */
export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export interface PresignedUrlResult {
  uploadUrl: string;
  storageKey: string;
  publicUrl: string;
}

/**
 * Generates a presigned PUT URL with a 5-minute (300 seconds) expiration window.
 */
export async function createPresignedUploadUrl(
  key: string,
  contentType: string
): Promise<PresignedUrlResult> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 300, // 5 minutes validity
  });

  const publicUrl = `${env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${key}`;

  return {
    uploadUrl,
    storageKey: key,
    publicUrl,
  };
}

export function getPublicR2Url(key: string): string {
  return `${env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${key}`;
}

export async function getPresignedUploadUrl(
  key: string,
  contentType: string,
  expiresInSeconds: number = 300
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(r2Client, command, {
    expiresIn: expiresInSeconds,
  });
}
