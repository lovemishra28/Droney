"use client";

import React from "react";
import Link from "next/link";
import { X, Play, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface ReelModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReelModal({ isOpen, onClose }: ReelModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/15 bg-zinc-950 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-zinc-800/80 px-6 py-4 bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <span className="h-2.5 w-2.5 rounded-full bg-[#00e599] animate-pulse" />
            <div>
              <h3 className="text-sm font-bold tracking-wider text-white uppercase font-mono">
                ALTITUDE FLIGHT REEL • 4K TELEMETRY BENCHMARK
              </h3>
              <p className="text-[11px] text-zinc-400">DJI Air 3S & Apex Freestyle 6S Field Telemetry</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-zinc-800 p-1.5 text-zinc-400 hover:bg-zinc-700 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Video / Reel Container */}
        <div className="relative aspect-video w-full bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            controls
            poster="/images/altitude-hero-bg.jpg"
            className="h-full w-full object-cover"
          >
            <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4" type="video/mp4" />
            Your browser does not support video playback.
          </video>

          {/* Telemetry HUD Overlay in video corner */}
          <div className="absolute top-4 left-4 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 px-3.5 py-2 text-xs font-mono text-zinc-200 pointer-events-none">
            <div className="flex items-center gap-2">
              <span className="text-[#c8f33b] font-bold">ALTITUDE HUD</span>
              <span className="text-zinc-500">|</span>
              <span>4K 60FPS D-LOG M</span>
            </div>
            <div className="text-[10px] text-zinc-400 mt-0.5">LATENCY: 18ms • O4 HD 20km LINK</div>
          </div>
        </div>

        {/* Bottom Details Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-zinc-900/80 border-t border-zinc-800">
          <div className="text-xs text-zinc-300">
            <span className="font-semibold text-white">Full Flight Certification Included:</span> Every craft inspected by Altitude engineers across 32 safety checkpoints.
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/catalog"
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-full bg-[#c8f33b] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#b8e530] transition shadow-[0_0_15px_rgba(200,243,59,0.25)]"
            >
              <span>Explore All Models</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
