"use client";

import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { AlertCircle, Loader2, Play, Volume2, VolumeX } from "lucide-react";

interface HlsPlayerProps {
  manifestUrl: string;
  posterUrl?: string;
  title?: string;
  autoPlay?: boolean;
}

export function HlsPlayer({
  manifestUrl,
  posterUrl,
  title = "Flight demonstration video",
  autoPlay = false,
}: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackError, setPlaybackError] = useState<string | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !manifestUrl) return;

    let hlsInstance: Hls | null = null;
    setIsLoading(true);
    setPlaybackError(null);

    // 1. Native HLS playback (Safari iOS/macOS)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = manifestUrl;
      video.addEventListener("loadedmetadata", () => setIsLoading(false));
      video.addEventListener("error", () => {
        setPlaybackError("Unable to stream video. Please check connection.");
        setIsLoading(false);
      });
    }
    // 2. MSE-based playback via Hls.js (Chrome, Firefox, Edge, Android)
    else if (Hls.isSupported()) {
      hlsInstance = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
      });

      hlsInstance.loadSource(manifestUrl);
      hlsInstance.attachMedia(video);

      hlsInstance.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsLoading(false);
        if (autoPlay) {
          video.play().catch(() => setIsPlaying(false));
        }
      });

      hlsInstance.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hlsInstance?.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hlsInstance?.recoverMediaError();
              break;
            default:
              hlsInstance?.destroy();
              setPlaybackError("Video encoding or stream error.");
              setIsLoading(false);
              break;
          }
        }
      });
    } else {
      setPlaybackError("Your browser does not support HLS adaptive streaming.");
      setIsLoading(false);
    }

    return () => {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    };
  }, [manifestUrl, autoPlay]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <video
        ref={videoRef}
        poster={posterUrl}
        playsInline
        aria-label={title}
        className="h-full w-full object-cover"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
        </div>
      )}

      {/* Error Fallback */}
      {playbackError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-zinc-950/90 p-4 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500" />
          <p className="text-xs text-zinc-400">{playbackError}</p>
        </div>
      )}

      {/* Media Overlay Controls */}
      {!isLoading && !playbackError && (
        <div className="absolute inset-0 flex items-end justify-between bg-gradient-to-t from-black/80 via-transparent to-transparent p-4 opacity-0 transition-opacity hover:opacity-100">
          <button
            type="button"
            onClick={togglePlay}
            className="rounded-full bg-zinc-900/80 p-2.5 text-zinc-100 backdrop-blur hover:bg-zinc-800"
            aria-label={isPlaying ? "Pause video" : "Play video"}
          >
            <Play className={`h-4 w-4 ${isPlaying ? "fill-white" : ""}`} />
          </button>

          <button
            type="button"
            onClick={toggleMute}
            className="rounded-full bg-zinc-900/80 p-2.5 text-zinc-100 backdrop-blur hover:bg-zinc-800"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </button>
        </div>
      )}
    </div>
  );
}
