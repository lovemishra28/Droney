import type { NextConfig } from "next";

const publicR2Domain = new URL(
  process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN!
);
const publicBunnyDomain = new URL(
  process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST!
);
const r2StorageHost = process.env.R2_STORAGE_HOST_PATTERN || "";
const bunnyStorageHost = process.env.BUNNY_STORAGE_HOST_PATTERN || "";
const supabaseHost = process.env.SUPABASE_HOST_PATTERN || "";
const upstashHost = process.env.UPSTASH_HOST_PATTERN || "";
const bunnyApiOrigin = process.env.BUNNY_API_ORIGIN || "";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: ${r2StorageHost} ${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || ""} ${bunnyStorageHost} ${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST || ""} https:;
  media-src 'self' blob: ${bunnyStorageHost} ${process.env.NEXT_PUBLIC_BUNNY_STREAM_CDN_HOST || ""} https:;
  connect-src 'self' ${supabaseHost} ${upstashHost} ${bunnyApiOrigin} ${r2StorageHost};
  font-src 'self' data:;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false, // Suppresses X-Powered-By: Next.js to eliminate runtime fingerprinting

  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  images: {
    formats: ["image/avif", "image/webp"],
    localPatterns: [
      {
        pathname: "/images/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: r2StorageHost,
      },
      {
        protocol: publicR2Domain.protocol.replace(":", "") as "http" | "https",
        hostname: publicR2Domain.hostname,
      },
      {
        protocol: publicBunnyDomain.protocol.replace(":", "") as "http" | "https",
        hostname: publicBunnyDomain.hostname,
      },
      {
        protocol: "https",
        hostname: bunnyStorageHost,
      },
    ],
  },

  async redirects() {
    return [
      {
        source: "/products/:slug",
        destination: "/product/:slug",
        permanent: true,
      },
      {
        source: "/product/dji-air-3s-fly-more-combo",
        destination: "/product/dji-air-3s",
        permanent: false,
      },
      {
        source: "/product/dji-air-3s-combo",
        destination: "/product/dji-air-3s",
        permanent: false,
      },
      {
        source: "/product/dji-mavic-3-pro-cine",
        destination: "/product/dji-mavic-3-pro",
        permanent: false,
      },
      {
        source: "/product/dji-neo-palm-drone",
        destination: "/product/dji-neo",
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
