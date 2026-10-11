"use client";

import { useState } from "react";
import type { ProductMedia } from "@/types";
import { Play, Image as ImageIcon } from "lucide-react";

interface MediaGalleryProps {
  media: ProductMedia[];
}

export function MediaGallery({ media }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/50 text-sm text-zinc-500">
        No media assets loaded for this SKU.
      </div>
    );
  }

  const activeAsset = media[selectedIndex];

  return (
    <div className="space-y-4">
      <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
        {activeAsset.mediaType === "video" ? (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Play className="ml-0.5 h-6 w-6" />
            </div>
            <span className="text-xs">
              Bunny.net Stream HLS Adaptive Player
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-400">
            <ImageIcon className="h-10 w-10 text-zinc-600" />
            <span className="text-xs text-zinc-500">
              Cloudflare R2 WebP Asset
            </span>
          </div>
        )}
      </div>

      {media.length > 1 && (
        <div className="flex gap-2.5 overflow-x-auto pb-1">
          {media.map((item, idx) => (
            <button
              key={item.id}
              onClick={() => setSelectedIndex(idx)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border transition-all ${
                idx === selectedIndex
                  ? "border-emerald-500 ring-2 ring-emerald-500/20"
                  : "border-zinc-800 opacity-60 hover:border-zinc-700 hover:opacity-100"
              }`}
            >
              <div className="flex h-full w-full items-center justify-center bg-zinc-900 text-zinc-400">
                {item.mediaType === "video" ? (
                  <Play className="h-4 w-4 text-emerald-400" />
                ) : (
                  <ImageIcon className="h-4 w-4" />
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
