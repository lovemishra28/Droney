"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PlayCircle, ShieldCheck } from "lucide-react";
import { HlsPlayer } from "@/components/storefront/hls-player";
import { resolveImageUrl } from "@/lib/media";

export interface MediaAssetItem {
  id: string;
  mediaType: "image" | "video";
  url: string;
  displayOrder: number;
}

interface MediaGalleryProps {
  productName?: string;
  media?: MediaAssetItem[];
  isSecondHand?: boolean;
}

export function MediaGallery({
  productName = "Altitude Flight Hardware",
  media = [],
  isSecondHand = false,
}: MediaGalleryProps) {
  const sortedMedia = [...(media || [])].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeAsset = sortedMedia[selectedIndex] || {
    id: "fallback",
    mediaType: "image" as const,
    url: "/images/altitude-hero-bg.jpg",
    displayOrder: 0,
  };

  const primaryPoster = resolveImageUrl(
    sortedMedia.find((m) => m.mediaType === "image")?.url
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Display Stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs">
        {isSecondHand && (
          <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Certified Pre-Owned</span>
          </div>
        )}

        {activeAsset.mediaType === "video" ? (
          <div className="h-full w-full p-2 bg-black">
            <HlsPlayer
              manifestUrl={activeAsset.url}
              posterUrl={primaryPoster}
              title={`${productName} Flight Demo`}
              autoPlay={false}
            />
          </div>
        ) : (
          <div className="relative h-full w-full bg-zinc-50/50">
            <Image
              src={resolveImageUrl(activeAsset.url)}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Strip */}
      {sortedMedia.length > 1 && (
        <div className="flex scrollbar-none gap-3 overflow-x-auto pb-1">
          {sortedMedia.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border bg-white transition-all ${
                  isSelected
                    ? "border-black ring-2 ring-black"
                    : "border-zinc-200 opacity-70 hover:opacity-100 hover:border-zinc-400"
                }`}
              >
                {item.mediaType === "video" ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-black text-white">
                    <PlayCircle className="h-5 w-5 text-[#c8f33b]" />
                    <span className="mt-1 text-[9px] font-bold tracking-wider uppercase font-mono">
                      Reel
                    </span>
                  </div>
                ) : (
                  <Image
                    src={resolveImageUrl(item.url)}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
