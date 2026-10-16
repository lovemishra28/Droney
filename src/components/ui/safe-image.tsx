"use client";

import React, { useState, useEffect } from "react";
import Image, { ImageProps } from "next/image";

export interface SafeImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string;
}

export function SafeImage({
  src,
  alt,
  fallbackSrc = "/images/altitude-hero-bg.jpg",
  unoptimized,
  ...rest
}: SafeImageProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  // For Cloudflare R2 dev domains, bypassing the Node server proxy (unoptimized=true)
  // allows the browser to stream directly from Cloudflare's edge network, avoiding
  // Next.js server-side 504 gateway timeouts.
  const isR2Dev = typeof imgSrc === "string" && imgSrc.includes("r2.dev");
  const shouldBypass = unoptimized !== undefined ? unoptimized : isR2Dev;

  return (
    <Image
      {...rest}
      src={hasError ? fallbackSrc : imgSrc}
      alt={alt}
      unoptimized={shouldBypass}
      onError={() => {
        if (!hasError) {
          setHasError(true);
          setImgSrc(fallbackSrc);
        }
      }}
    />
  );
}
