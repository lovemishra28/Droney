import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { env } from "@/lib/env";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

/**
 * IP-level sliding-window rate limiter:
 * Maximum 5 OTP requests per 10 minutes per public client IP.
 */
export const ipOtpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  analytics: true,
  prefix: "ratelimit:otp:ip",
});

/**
 * Identifier-level sliding-window rate limiter:
 * Maximum 3 OTP requests per 15 minutes per phone number or email address.
 */
export const identifierOtpRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "15 m"),
  analytics: true,
  prefix: "ratelimit:otp:target",
});

// Backward-compatible alias exports
export const ipRatelimit = ipOtpRateLimiter;
export const identifierRatelimit = identifierOtpRateLimiter;
