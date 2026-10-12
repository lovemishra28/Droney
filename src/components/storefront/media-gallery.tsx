"use client";

import React, { useState } from "react";
import Image from "next/image";
import { PlayCircle, ShieldCheck } from "lucide-react";
import { HlsPlayer } from "@/components/storefront/hls-player";

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
  productName = "AeroStore Flight Hardware",
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
    url: "/placeholders/drone-placeholder.webp",
    displayOrder: 0,
  };

  const primaryPoster = sortedMedia.find((m) => m.mediaType === "image")?.url;

  return (
    <div className="flex flex-col gap-4">
      {/* Primary Display Stage */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        {isSecondHand && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 rounded-md border border-amber-500/30 bg-amber-950/80 px-2.5 py-1 text-xs font-semibold text-amber-300 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Certified Pre-Owned</span>
          </div>
        )}

        {activeAsset.mediaType === "video" ? (
          <div className="h-full w-full p-2">
            <HlsPlayer
              manifestUrl={activeAsset.url}
              posterUrl={primaryPoster}
              title={`${productName} Flight Demo`}
              autoPlay={false}
            />
          </div>
        ) : (
          <div className="relative h-full w-full">
            <Image
              src={activeAsset.url}
              alt={productName}
              fill
              priority
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-contain p-4 transition-transform duration-300 hover:scale-105"
            />
          </div>
        )}
      </div>

      {/* Thumbnails Navigation Strip */}
      {sortedMedia.length > 1 && (
        <div className="flex scrollbar-none gap-2.5 overflow-x-auto pb-1">
          {sortedMedia.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-18 w-18 flex-shrink-0 overflow-hidden rounded-lg border bg-zinc-900/60 transition-all ${
                  isSelected
                    ? "border-zinc-200 ring-2 ring-zinc-400"
                    : "border-zinc-800 opacity-70 hover:border-zinc-600 hover:opacity-100"
                }`}
              >
                {item.mediaType === "video" ? (
                  <div className="flex h-full w-full flex-col items-center justify-center bg-zinc-950 text-zinc-300">
                    <PlayCircle className="h-5 w-5 text-indigo-400" />
                    <span className="mt-1 text-[10px] font-semibold tracking-wider uppercase">
                      Demo
                    </span>
                  </div>
                ) : (
                  <Image
                    src={item.url}
                    alt={`${productName} thumbnail ${index + 1}`}
                    fill
                    sizes="72px"
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
