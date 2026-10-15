"use client";

import { Video } from "lucide-react";

export function VideoUploader() {
  return (
    <div className="rounded-xl border border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/40 p-6 text-center">
      <Video className="mx-auto h-8 w-8 text-zinc-400 dark:text-zinc-500" />
      <p className="mt-2 text-xs font-semibold text-zinc-800 dark:text-zinc-300">
        Bunny.net Stream TUS Direct Resumable Upload
      </p>
      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
        Flight demonstration video will automatically transcode to 1080p, 720p,
        and 480p HLS streams.
      </p>
    </div>
  );
}
