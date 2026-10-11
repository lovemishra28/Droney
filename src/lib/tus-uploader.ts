import * as tus from "tus-js-client";
import type { BunnyTusAuthCredentials } from "@/lib/bunny";

export interface TusUploadCallbacks {
  onProgress?: (
    progressPercentage: number,
    bytesUploaded: number,
    bytesTotal: number
  ) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Streams raw flight demonstration video files in 5 MB chunks directly to Bunny.net.
 */
export function uploadVideoWithTus(
  file: File,
  auth: BunnyTusAuthCredentials,
  callbacks: TusUploadCallbacks = {}
): tus.Upload {
  const upload = new tus.Upload(file, {
    endpoint: auth.tusEndpoint,
    retryDelays: [0, 3000, 5000, 10000, 20000],
    headers: {
      AuthorizationSignature: auth.authorizationSignature,
      AuthorizationExpire: auth.authorizationExpire.toString(),
      VideoId: auth.videoId,
      LibraryId: auth.libraryId,
    },
    metadata: {
      filetype: file.type,
      title: file.name,
    },
    chunkSize: 5 * 1024 * 1024, // 5 MB chunks prevent browser memory starvation
    onError: (error) => {
      console.error("[TUS Upload Failure]:", error);
      callbacks.onError?.(error);
    },
    onProgress: (bytesUploaded, bytesTotal) => {
      const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
      callbacks.onProgress?.(percentage, bytesUploaded, bytesTotal);
    },
    onSuccess: () => {
      callbacks.onSuccess?.();
    },
  });

  upload.start();
  return upload;
}
