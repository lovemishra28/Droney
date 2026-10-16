"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Star,
  ChevronLeft,
  ChevronRight,
  Plus,
  Link as LinkIcon,
} from "lucide-react";
import { getProductImageUploadUrlAction } from "@/server/actions/media";

interface ImageUploaderProps {
  initialUrls?: string[];
  initialUrl?: string; // backwards compatibility
  onImagesChange?: (urls: string[]) => void;
  onUploadComplete?: (primaryUrl: string) => void;
  onRemove?: () => void;
  label?: string;
  maxFiles?: number;
  productId?: string;
}

export function ImageUploader({
  initialUrls = [],
  initialUrl = "",
  onImagesChange,
  onUploadComplete,
  onRemove,
  label = "Product Image Gallery (Cloudflare R2)",
  maxFiles = 10,
  productId,
}: ImageUploaderProps) {
  // Combine initialUrl into initialUrls if provided
  const startingList = initialUrls.length > 0
    ? initialUrls
    : initialUrl
    ? [initialUrl]
    : [];

  const [images, setImages] = useState<string[]>(startingList);
  const [uploadingCount, setUploadingCount] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [manualUrl, setManualUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const notifyChange = (updated: string[]) => {
    setImages(updated);
    if (onImagesChange) {
      onImagesChange(updated);
    }
    if (onUploadComplete) {
      onUploadComplete(updated[0] || "");
    }
    if (updated.length === 0 && onRemove) {
      onRemove();
    }
  };

  const compressImageToWebP = async (
    file: File,
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.85
  ): Promise<File> => {
    // If it's already a small WebP (< 250KB), no re-compression needed
    if (file.type === "image/webp" && file.size < 250 * 1024) {
      return file;
    }

    if (!file.type.startsWith("image/")) {
      return file;
    }

    return new Promise((resolve) => {
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(file);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              resolve(file);
              return;
            }
            const baseName =
              file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const cleanName = `${baseName.replace(/\s+/g, "-").toLowerCase()}.webp`;
            const compressedFile = new File([blob], cleanName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          "image/webp",
          quality
        );
      };

      img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };

      img.src = objectUrl;
    });
  };

  const uploadSingleFile = async (rawFile: File): Promise<string> => {
    // Auto-compress to modern WebP format for fast loading and reduced payload
    const file = await compressImageToWebP(rawFile);

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
    if (!ALLOWED_TYPES.includes(file.type as any)) {
      throw new Error(`File "${file.name}" has unsupported type. Only JPEG, PNG, WebP, and AVIF are allowed.`);
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error(`File "${file.name}" exceeds 15MB limit.`);
    }

    const presignRes = await getProductImageUploadUrlAction({
      productId,
      filename: file.name,
      contentType: file.type as (typeof ALLOWED_TYPES)[number],
    });

    if (!presignRes.success || !presignRes.data) {
      throw new Error(presignRes.message || "Failed to authorize image upload.");
    }

    const { uploadUrl, publicUrl } = presignRes.data;

    const res = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    if (!res.ok) {
      const responseBody = await res.text();
      const detail = responseBody.replace(/\s+/g, " ").trim();
      throw new Error(
        `Cloudflare R2 rejected upload (${res.status} ${res.statusText})${
          detail ? `: ${detail}` : "."
        }`
      );
    }

    return publicUrl;
  };

  const handleFiles = async (files: FileList | File[]) => {
    const fileList = Array.from(files);
    if (fileList.length === 0) return;

    if (images.length + fileList.length > maxFiles) {
      setUploadError(`Maximum ${maxFiles} photos allowed per product listing.`);
      return;
    }

    setUploadError(null);
    setUploadingCount(fileList.length);

    try {
      const uploadPromises = fileList.map((file) => uploadSingleFile(file));
      const newUrls = await Promise.all(uploadPromises);
      const combined = [...images, ...newUrls];
      notifyChange(combined);
    } catch (err) {
      console.error("[R2 Direct Upload Error]:", err);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Failed to upload one or more photos to Cloudflare R2."
      );
    } finally {
      setUploadingCount(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleRemove = (index: number) => {
    const updated = images.filter((_, i) => i !== index);
    notifyChange(updated);
  };

  const handleMakeCover = (index: number) => {
    if (index === 0) return;
    const target = images[index];
    const rest = images.filter((_, i) => i !== index);
    notifyChange([target, ...rest]);
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);
    notifyChange(updated);
  };

  const handleAddManualUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim()) return;
    notifyChange([...images, manualUrl.trim()]);
    setManualUrl("");
    setShowUrlInput(false);
  };

  return (
    <div className="space-y-3">
      {/* Header with Title and Count */}
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
          {label}
        </label>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-zinc-500">
            {images.length} of {maxFiles} images added
          </span>
          <button
            type="button"
            onClick={() => setShowUrlInput(!showUrlInput)}
            className="flex items-center gap-1 text-[11px] font-semibold text-lime-700 dark:text-[#c8f33b] hover:underline"
          >
            <LinkIcon className="h-3 w-3" />
            <span>{showUrlInput ? "Cancel URL" : "+ Add by URL"}</span>
          </button>
        </div>
      </div>

      {/* Manual URL Input dropdown if toggled */}
      {showUrlInput && (
        <form onSubmit={handleAddManualUrl} className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="Paste public image URL (e.g. https://... or /images/...)"
            className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-2 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-black dark:bg-[#c8f33b] px-4 py-2 text-xs font-bold text-white dark:text-black hover:opacity-90"
          >
            Add Image
          </button>
        </form>
      )}

      {/* Upload Dropzone (shown if under maxFiles) */}
      {images.length < maxFiles && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !uploadingCount && fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? "border-lime-500 bg-lime-50/50 dark:bg-zinc-900"
              : "border-zinc-300 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 hover:border-lime-500/70 hover:bg-zinc-100/60 dark:hover:bg-zinc-900"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            multiple
            onChange={handleFileInputChange}
            disabled={uploadingCount > 0}
            className="hidden"
          />

          {uploadingCount > 0 ? (
            <div className="flex flex-col items-center gap-2 py-3">
              <Loader2 className="h-7 w-7 animate-spin text-lime-600 dark:text-[#c8f33b]" />
              <p className="text-xs font-bold text-zinc-900 dark:text-white">
                Optimizing & uploading {uploadingCount} photo(s) to Cloudflare R2...
              </p>
              <span className="text-[11px] font-mono text-zinc-500">
                Auto-compressing to lightweight WebP format
              </span>
            </div>
          ) : (
            <>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
                <UploadCloud className="h-5 w-5 text-lime-700 dark:text-[#c8f33b]" />
              </div>
              <p className="mt-2.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Drag & drop multiple photos or click to browse
              </p>
              <p className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
                Auto-compressed to WebP for instant loading • Supports PNG, JPG, WebP
              </p>
            </>
          )}
        </div>
      )}

      {/* Gallery Grid of Uploaded Photos */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 pt-1">
          {images.map((url, idx) => {
            const isCover = idx === 0;

            return (
              <div
                key={url + idx}
                className={`group relative overflow-hidden rounded-xl border bg-white dark:bg-zinc-900 shadow-xs transition-all ${
                  isCover
                    ? "border-lime-500 dark:border-[#c8f33b] ring-2 ring-lime-400/30"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-400"
                }`}
              >
                {/* Photo Thumbnail */}
                <div className="relative aspect-square w-full bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                  <img
                    src={url}
                    alt={`Product photo ${idx + 1}`}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.opacity = "0.5";
                    }}
                  />

                  {/* Badge: Cover / Order */}
                  <div className="absolute top-2 left-2 z-10">
                    {isCover ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/90 px-2 py-0.5 font-mono text-[9px] font-bold text-[#c8f33b] shadow-xs">
                        <Star className="h-2.5 w-2.5 fill-[#c8f33b]" />
                        <span>Cover Photo</span>
                      </span>
                    ) : (
                      <span className="rounded-md bg-black/75 px-1.5 py-0.5 font-mono text-[9px] font-bold text-white">
                        #{idx + 1}
                      </span>
                    )}
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove this photo"
                    className="absolute top-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-lg bg-black/75 text-zinc-300 hover:bg-rose-600 hover:text-white transition-colors"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Bottom Actions Bar (Make Cover & Move) */}
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 px-2 py-1.5 text-[10px]">
                  {!isCover ? (
                    <button
                      type="button"
                      onClick={() => handleMakeCover(idx)}
                      className="font-bold text-lime-700 dark:text-[#c8f33b] hover:underline"
                    >
                      Make Cover
                    </button>
                  ) : (
                    <span className="font-mono text-zinc-400 font-semibold">Primary</span>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMove(idx, idx - 1)}
                      title="Move left"
                      className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === images.length - 1}
                      onClick={() => handleMove(idx, idx + 1)}
                      title="Move right"
                      className="rounded p-0.5 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-800 disabled:opacity-30"
                    >
                      <ChevronRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Error Banner */}
      {uploadError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-3 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
