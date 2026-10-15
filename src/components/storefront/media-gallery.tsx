"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Heart, PlayCircle, ShieldCheck } from "lucide-react";
import { HlsPlayer } from "@/components/storefront/hls-player";
import { resolveImageUrl } from "@/lib/media";
import { useWishlistStore } from "@/stores/wishlist-store";

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
  productId?: string;
  productSlug?: string;
  basePricePaise?: number;
}

export function MediaGallery({
  productName = "Altitude Flight Hardware",
  media = [],
  isSecondHand = false,
  productId,
  productSlug,
  basePricePaise = 0,
}: MediaGalleryProps) {
  const { isInWishlist, toggleItem } = useWishlistStore();
  const isWishlisted = productId ? isInWishlist(productId) : false;
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

  const handlePrev = () => {
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : sortedMedia.length - 1));
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev < sortedMedia.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-4 items-start">
      {/* Left Column: Vertical Thumbnails Strip (Desktop) / Horizontal Strip (Mobile) */}
      {sortedMedia.length > 1 && (
        <div className="flex md:flex-col gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[580px] w-full md:w-20 shrink-0 scrollbar-none pb-2 md:pb-0">
          {sortedMedia.map((item, index) => {
            const isSelected = index === selectedIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative h-18 w-18 md:h-20 md:w-20 shrink-0 overflow-hidden rounded-xl border bg-white transition-all cursor-pointer ${
                  isSelected
                    ? "border-black ring-2 ring-black shadow-xs"
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

      {/* Main Display Stage with Arrows */}
      <div className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-xs group">
        {/* Top Badges (Left) */}
        {isSecondHand && (
          <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-mono font-bold text-emerald-800 shadow-xs">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Certified Pre-Owned</span>
          </div>
        )}

        {/* Wishlist Heart Mark (Top Right Corner) */}
        {productId && (
          <button
            type="button"
            onClick={() =>
              toggleItem({
                productId,
                slug: productSlug || "",
                name: productName,
                basePricePaise,
                thumbnailUrl: activeAsset.url,
                isSecondHand,
              })
            }
            className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 backdrop-blur-xs text-zinc-600 shadow-md hover:bg-white hover:text-red-500 transition-all cursor-pointer group/wish"
            title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            aria-label="Wishlist"
          >
            <Heart
              className={`h-4.5 w-4.5 transition-transform group-hover/wish:scale-110 active:scale-90 ${
                isWishlisted ? "fill-red-500 text-red-500" : ""
              }`}
            />
          </button>
        )}

        {/* Previous & Next Carousel Arrows */}
        {sortedMedia.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrev}
              title="Previous photo"
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black hover:scale-105 shadow-md cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              title="Next photo"
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black hover:scale-105 shadow-md cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Image / Video Canvas */}
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
              className="object-contain p-4 transition-transform duration-500 hover:scale-105"
            />
          </div>
        )}
      </div>
    </div>
  );
}
