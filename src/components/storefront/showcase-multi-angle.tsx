"use client";

import React, { useState } from "react";

export interface AngleItem {
  label: string;
  imageUrl: string;
}

interface ShowcaseMultiAngleProps {
  angles?: AngleItem[];
}

export function ShowcaseMultiAngle({ angles = [] }: ShowcaseMultiAngleProps) {
  const defaultAngles: AngleItem[] = [
    { label: "Combo Pack Layout", imageUrl: "/images/dji-air-3s.jpg" },
    { label: "Front Optics Angle", imageUrl: "/images/dji-mavic-3-pro.jpg" },
    { label: "Aerial Top Silhouette", imageUrl: "/images/altitude-hero-bg.jpg" },
    { label: "Folded Profile", imageUrl: "/images/preowned-mini-canyon.jpg" },
  ];

  const displayAngles = angles.length > 0 ? angles : defaultAngles;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const activeAngle = displayAngles[selectedIndex] || displayAngles[0];

  return (
    <section className="w-full bg-zinc-950 text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            360° PERSPECTIVES
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Every angle.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-lg">
            Inspect the industrial craftsmanship, gimbal shielding, and compact foldable geometry.
          </p>
        </div>

        {/* Main Stage Display */}
        <div className="mt-12 flex justify-center">
          <div className="relative w-full max-w-4xl rounded-3xl overflow-hidden border border-zinc-800 bg-black/60 p-4 sm:p-8 shadow-2xl">
            {/* Ambient Lighting */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-72 w-72 rounded-full bg-[#c8f33b]/10 blur-3xl pointer-events-none" />

            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-black">
              <img
                src={activeAngle.imageUrl}
                alt={activeAngle.label}
                className="h-full w-full object-contain object-center transition-all duration-500"
              />
            </div>

            <div className="mt-4 text-center">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-300">
                {activeAngle.label}
              </span>
            </div>
          </div>
        </div>

        {/* Tab Thumbnails Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {displayAngles.map((angle, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-white text-black shadow-lg font-bold scale-105"
                    : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    isSelected ? "bg-[#c8f33b]" : "bg-zinc-600"
                  }`}
                />
                <span>{angle.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
