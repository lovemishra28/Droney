"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import {
  UploadCloud,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Link as LinkIcon,
  X,
  Sparkles,
} from "lucide-react";
import { getStorefrontImageUploadUrlAction } from "@/server/actions/media";

interface StorefrontImageUploaderProps {
  currentUrl: string;
  onImageChange: (url: string) => void;
  sectionName?: string;
  label?: string;
  aspectRatio?: string; // e.g. "aspect-[21/9]" or "aspect-[16/10]" or "aspect-square"
}

export function StorefrontImageUploader({
  currentUrl,
  onImageChange,
  sectionName = "hero",
  label = "Slide Graphic",
  aspectRatio = "aspect-[16/9]",
}: StorefrontImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showUrlModal, setShowUrlModal] = useState(false);
  const [customUrl, setCustomUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Compress image to optimized WebP in browser before direct R2 PUT
  const compressToWebP = async (file: File): Promise<File> => {
    if (file.type === "image/webp" && file.size < 300 * 1024) {
      return file;
    }
    return new Promise((resolve) => {
      const img = new window.Image();
      const objectUrl = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement("canvas");
        let { width, height } = img;
        const maxDim = 2560; // crisp 2K / 4K hero slides
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(
                  new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                    type: "image/webp",
                  })
                );
              } else {
                resolve(file);
              }
            },
            "image/webp",
            0.88
          );
        } else {
          resolve(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
      img.src = objectUrl;
    });
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const optimizedFile = await compressToWebP(file);

      // 1. Request presigned upload URL from server
      const presignRes = await getStorefrontImageUploadUrlAction({
        section: sectionName,
        filename: optimizedFile.name,
        contentType: "image/webp",
      });

      if (!presignRes.success || !presignRes.data) {
        throw new Error(presignRes.message || "Failed to authorize upload.");
      }

      const { uploadUrl, publicUrl } = presignRes.data;

      // 2. Direct PUT to Cloudflare R2 Edge
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "image/webp",
        },
        body: optimizedFile,
      });

      if (!putRes.ok) {
        throw new Error(`Upload failed with status code ${putRes.status}`);
      }

      // 3. Notify parent component with new live public image URL
      onImageChange(publicUrl);
    } catch (err) {
      console.error("[Storefront Upload Error]:", err);
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowUrlModal(!showUrlModal)}
            className="inline-flex items-center gap-1 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition"
          >
            <LinkIcon className="h-3 w-3" />
            <span>Paste Image URL</span>
          </button>
        </div>
      </div>

      {showUrlModal && (
        <div className="flex items-center gap-2 p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/60 text-xs">
          <input
            type="text"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="Paste image link: https://... or /images/..."
            className="flex-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2.5 py-1 text-zinc-800 dark:text-zinc-200 outline-none"
          />
          <button
            type="button"
            onClick={() => {
              if (customUrl.trim()) {
                onImageChange(customUrl.trim());
                setShowUrlModal(false);
                setCustomUrl("");
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-black text-white dark:bg-white dark:text-black font-semibold hover:opacity-90"
          >
            Apply
          </button>
        </div>
      )}

      {/* Image Preview Box & Upload Button */}
      <div
        className={`relative w-full ${aspectRatio} rounded-xl overflow-hidden bg-zinc-950 border border-zinc-200 dark:border-zinc-800 group`}
      >
        {currentUrl ? (
          <Image
            src={currentUrl}
            alt="Slide visual"
            fill
            className="object-cover object-center transition duration-300 group-hover:scale-105"
            unoptimized={currentUrl.startsWith("http")}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-500 gap-1.5 p-4 text-center">
            <UploadCloud className="h-6 w-6" />
            <span className="text-xs font-medium">No graphic assigned</span>
          </div>
        )}

        {/* Hover Overlay with Upload Trigger */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#c8f33b] hover:bg-[#b8e530] text-black font-extrabold text-xs shadow-md transition active:scale-95 disabled:opacity-50"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Optimizing & Uploading...</span>
              </>
            ) : (
              <>
                <UploadCloud className="h-3.5 w-3.5" />
                <span>Change Image</span>
              </>
            )}
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelected}
        />
      </div>

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-500 font-medium">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
