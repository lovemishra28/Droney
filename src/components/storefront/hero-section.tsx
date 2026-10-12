"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Play, Eye } from "lucide-react";
import { ReelModal } from "@/components/storefront/reel-modal";

export function HeroSection() {
  const [reelOpen, setReelOpen] = useState(false);

  return (
    <>
      <section className="relative min-h-[85vh] lg:min-h-[88vh] w-full overflow-hidden flex items-center bg-zinc-950">
        {/* 1. Cinematic Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/altitude-hero-bg.jpg"
            alt="Altitude Cinematic Aerial Mountain Fjord Flight"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
          />
          {/* Atmospheric Cinematic Lighting Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/45 to-black/25" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/30" />
        </div>

        {/* 2. Hero Content Container */}
        <div className="relative z-10 mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 w-full py-16 lg:py-24">
          <div className="max-w-3xl">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 text-xs font-bold tracking-widest text-white shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#c8f33b] shadow-[0_0_8px_#c8f33b]" />
              <span className="uppercase">BUILT FOR THE SKY</span>
            </div>

            {/* Main Headline */}
            <h1 className="mt-5 text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.03]">
              Go beyond.
              <br />
              See everything.
            </h1>

            {/* Subtitle */}
            <p className="mt-5 max-w-xl text-base sm:text-lg text-zinc-300 font-normal leading-relaxed">
              Find your next flight path with Altitude. Premier camera drones, certified refurbished models, and tuned FPV components built for every horizon.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {/* Primary Neon CTA */}
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2.5 rounded-full bg-[#c8f33b] px-7 py-3.5 text-sm sm:text-base font-bold text-black shadow-[0_0_25px_rgba(200,243,59,0.35)] transition-all hover:bg-[#bbf028] hover:shadow-[0_0_35px_rgba(200,243,59,0.5)] transform hover:scale-[1.02] active:scale-95"
              >
                <span>Shop new drones</span>
                <ArrowRight className="h-4 w-4 stroke-[2.5]" />
              </Link>

              {/* Secondary Frosted Glass CTA */}
              <button
                type="button"
                onClick={() => setReelOpen(true)}
                className="inline-flex items-center gap-2.5 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 px-6 py-3.5 text-sm sm:text-base font-medium text-white transition-all active:scale-95 hover:border-white/35"
              >
                <Play className="h-4 w-4 fill-white text-white stroke-1" />
                <span>Watch Reel & Specs</span>
              </button>
            </div>
          </div>

          {/* 3. Bottom-Right Floating Tech Specs HUD Card */}
          <div className="mt-12 lg:mt-0 lg:absolute lg:right-8 lg:bottom-12 w-full sm:w-[420px]">
            <div 
              onClick={() => setReelOpen(true)}
              className="group cursor-pointer rounded-2xl bg-black/60 backdrop-blur-xl border border-white/15 p-5 text-white shadow-2xl transition-all hover:border-white/30 hover:bg-black/70"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#00e599] animate-pulse" />
                  <span className="font-bold tracking-wider text-sm sm:text-base text-white">
                    DJI AIR 3S
                  </span>
                </div>
                <span className="text-xs font-mono text-zinc-400 tracking-wide">
                  4K/60fps HDR
                </span>
              </div>

              {/* Divider */}
              <div className="my-3.5 border-t border-white/10" />

              {/* 2x2 Specs Grid */}
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-6 text-xs">
                <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                    MAX ALTITUDE
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-zinc-100">
                    6,000 m AMSL
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                    FLIGHT TIME
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-zinc-100">
                    45 Minutes
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                    TRANSMISSION
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-zinc-100">
                    O4 HD 20km
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase">
                    OBSTACLE SENSING
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-[#c8f33b]">
                    Omnidirectional
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Flight Reel & Telemetry Specs Modal */}
      <ReelModal isOpen={reelOpen} onClose={() => setReelOpen(false)} />
    </>
  );
}
