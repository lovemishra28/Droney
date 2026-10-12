import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    DATABASE_URL: z
      .string()
      .url("DATABASE_URL must be a valid PostgreSQL connection string"),
    DIRECT_URL: z
      .string()
      .url("DIRECT_URL must be a valid PostgreSQL connection string"),
    R2_S3_ENDPOINT: z.string().url(),
    BUNNY_API_BASE_URL: z.string().url(),
    BUNNY_TUS_ENDPOINT_URL: z.string().url(),
    FAST2SMS_API_URL: z.string().url(),

    // Upstash Redis
    UPSTASH_REDIS_REST_URL: z.string().url(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1),

    // Cloudflare R2
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),

    // Bunny.net Stream
    BUNNY_STREAM_API_KEY: z.string().min(1),
    BUNNY_STREAM_LIBRARY_ID: z.string().min(1),
    BUNNY_WEBHOOK_SECRET: z.string().min(1),

    // Communication Gateways
    FAST2SMS_API_KEY: z.string().min(1),
    FAST2SMS_SENDER_ID: z.string().max(6).default("AEROIN"),
    FAST2SMS_DLT_TEMPLATE_ID: z.string().min(1),
    RESEND_API_KEY: z.string().startsWith("re_"),
    EMAIL_FROM_ADDRESS: z.string().email(),

    // Security & Cryptography
    SESSION_SECRET: z
      .string()
      .min(32, "SESSION_SECRET must be at least 32 characters long"),
    OTP_SECRET_SALT: z
      .string()
      .min(16, "OTP_SECRET_SALT must be at least 16 characters long"),
    CRON_SECRET: z.string().optional(),
  },
  client: {
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_MEDIA_MODE: z.enum(["local", "remote"]).default("local"),
    NEXT_PUBLIC_R2_PUBLIC_DOMAIN: z.string().url(),
    NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST: z.string().url(),
    NEXT_PUBLIC_WHATSAPP_BUSINESS_URL: z.string().url(),
    NEXT_PUBLIC_CLIENT_UPI_ID: z.string().min(3).includes("@"),
    NEXT_PUBLIC_CLIENT_PAYEE_NAME: z.string().min(1),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_MEDIA_MODE: process.env.NEXT_PUBLIC_MEDIA_MODE,
    NEXT_PUBLIC_R2_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN,
    NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST:
      process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST,
    NEXT_PUBLIC_WHATSAPP_BUSINESS_URL:
      process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_URL,
    NEXT_PUBLIC_CLIENT_UPI_ID: process.env.NEXT_PUBLIC_CLIENT_UPI_ID,
    NEXT_PUBLIC_CLIENT_PAYEE_NAME: process.env.NEXT_PUBLIC_CLIENT_PAYEE_NAME,
  },
});
