"use client";

import React from "react";

interface KeyMetric {
  value: string;
  unit: string;
  label: string;
}

interface ShowcaseHeroBannerProps {
  badge?: string | null;
  headline?: string | null;
  subtitle?: string | null;
  explodedLayoutUrl?: string | null;
  metrics?: KeyMetric[];
}

export function ShowcaseHeroBanner({
  badge = "REAL DETAIL AIR",
  headline = "Air 3S.",
  subtitle = "Dual-camera 1-inch CMOS primary sensor, 4K/60fps HDR video, and next-gen nightscape omnidirectional obstacle sensing.",
  explodedLayoutUrl = "/images/dji-air-3s.jpg",
  metrics = [],
}: ShowcaseHeroBannerProps) {
  const defaultMetrics: KeyMetric[] = [
    { value: "1\"", unit: "CMOS", label: "Primary Sensor" },
    { value: "4K", unit: "60fps HDR", label: "Video Fidelity" },
    { value: "45m", unit: "Max Flight", label: "Airborne Endurance" },
    { value: "89%", unit: "Night LiDAR", label: "Omni APAS 5.0" },
  ];

  const displayMetrics = metrics.length > 0 ? metrics : defaultMetrics;

  return (
    <section className="relative w-full bg-gradient-to-b from-black via-zinc-950 to-black text-white pt-24 pb-20 overflow-hidden border-t border-zinc-900">
      {/* Subtle Ambient Radial Lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-[#c8f33b]/10 blur-[130px] pointer-events-none" />

      <div className="relative mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Top Header & Typography */}
        <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-4">
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f33b]/15 border border-[#c8f33b]/40 px-3.5 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b] shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-[#c8f33b] animate-pulse" />
              {badge}
            </span>
          )}

          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none">
            {headline}
          </h1>

          {subtitle && (
            <p className="text-sm sm:text-base lg:text-lg text-zinc-400 font-normal leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          )}
        </div>

        {/* Massive 3D Pack / Aircraft Exploded Render */}
        <div className="mt-12 sm:mt-16 flex justify-center">
          <div className="relative w-full max-w-5xl rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900/40 p-4 sm:p-8 backdrop-blur-md shadow-2xl group">
            {/* Ambient Corner Flare */}
            <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#c8f33b]/15 blur-3xl pointer-events-none" />

            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-950/80">
              <img
                src={explodedLayoutUrl || "/images/dji-air-3s.jpg"}
                alt={headline || "Drone Hardware"}
                className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
            </div>
          </div>
        </div>

        {/* 4 Big Stat Metric Counters */}
        <div className="mt-16 sm:mt-20 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 border-t border-zinc-800/80 pt-12">
          {displayMetrics.map((item, idx) => {
            const valLen = item.value?.length || 0;
            const textSizeClass =
              valLen > 12
                ? "text-base sm:text-lg lg:text-xl"
                : valLen > 7
                ? "text-xl sm:text-2xl lg:text-3xl"
                : valLen > 4
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-3xl sm:text-4xl lg:text-5xl";

            return (
              <div
                key={idx}
                className="flex flex-col items-center justify-center text-center p-4 sm:p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700 transition"
              >
                <div className="flex items-baseline justify-center gap-1.5 font-mono max-w-full">
                  <span
                    className={`${textSizeClass} font-black text-white tracking-tight break-words`}
                    title={item.value}
                  >
                    {item.value}
                  </span>
                  {item.unit && (
                    <span className="text-xs sm:text-sm font-bold text-[#c8f33b] shrink-0">
                      {item.unit}
                    </span>
                  )}
                </div>
                <span className="mt-2 text-[11px] sm:text-xs font-medium text-zinc-400 tracking-wide uppercase">
                  {item.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
