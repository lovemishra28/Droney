"use client";

import { useState } from "react";
import { UploadCloud, Image as ImageIcon } from "lucide-react";

export function ImageUploader() {
  const [images, setImages] = useState<string[]>([]);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6 text-center">
        <UploadCloud className="mx-auto h-8 w-8 text-zinc-500" />
        <p className="mt-2 text-xs font-semibold text-zinc-300">
          Upload Photos directly to Cloudflare R2
        </p>
        <p className="text-[11px] text-zinc-500">
          Multi-image presigned direct upload. PNG, JPG, WebP up to 10MB each.
        </p>
      </div>
    </div>
  );
}
