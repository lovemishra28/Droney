"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

export interface ComparisonSpecRow {
  label: string;
  currentModelValue: string;
  targetModelValue: string;
}

export interface ComparisonData {
  targetModelName: string;
  targetModelImage: string;
  specRows: ComparisonSpecRow[];
}

interface ShowcaseComparisonProps {
  currentModelName: string;
  currentModelImage: string;
  comparison?: ComparisonData | null;
}

export function ShowcaseComparison({
  currentModelName = "DJI Air 3S",
  currentModelImage = "/images/dji-air-3s.jpg",
  comparison,
}: ShowcaseComparisonProps) {
  const defaultComparison: ComparisonData = {
    targetModelName: "DJI Mavic 3 Pro",
    targetModelImage: "/images/dji-mavic-3-pro.jpg",
    specRows: [
      { label: "Takeoff Weight", currentModelValue: "724 g", targetModelValue: "958 g" },
      { label: "Max Flight Time", currentModelValue: "45 mins", targetModelValue: "43 mins" },
      { label: "Primary Sensor", currentModelValue: "1-inch CMOS 50MP", targetModelValue: "4/3 CMOS Hasselblad" },
      { label: "Medium Tele Lens", currentModelValue: "70 mm (f/2.8)", targetModelValue: "70 mm (f/2.8)" },
      { label: "Night LiDAR Sensing", currentModelValue: "Forward LiDAR + Omni Vision", targetModelValue: "Omni APAS 5.0 (No LiDAR)" },
      { label: "Transmission Protocol", currentModelValue: "DJI O4 (20 km FHD)", targetModelValue: "DJI O3+ (15 km FHD)" },
      { label: "Built-in Storage", currentModelValue: "42 GB High-Speed", targetModelValue: "8 GB Standard" },
    ],
  };

  const data = comparison || defaultComparison;

  return (
    <section className="w-full bg-black text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            DIRECT FLEET BENCHMARK
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            {currentModelName} vs {data.targetModelName}
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            Compare essential optics, transmission protocols, and payload metrics side by side.
          </p>
        </div>

        {/* 2-Column Product Cards */}
        <div className="max-w-4xl mx-auto grid grid-cols-2 gap-4 sm:gap-8 pb-8">
          
          {/* Current Aircraft Card */}
          <div className="flex flex-col items-center text-center rounded-2xl border-2 border-[#c8f33b] bg-zinc-900/60 p-4 sm:p-6 shadow-xl relative">
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#c8f33b] px-3 py-0.5 text-[10px] font-black font-mono uppercase text-black">
              Current Model
            </span>
            <div className="aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-xl bg-black mb-3">
              <img
                src={currentModelImage}
                alt={currentModelName}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <h3 className="text-base sm:text-xl font-black text-white">
              {currentModelName}
            </h3>
          </div>

          {/* Target Comparison Aircraft Card */}
          <div className="flex flex-col items-center text-center rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 sm:p-6">
            <div className="aspect-[4/3] w-full max-w-[240px] overflow-hidden rounded-xl bg-black mb-3">
              <img
                src={data.targetModelImage}
                alt={data.targetModelName}
                className="h-full w-full object-cover object-center"
              />
            </div>
            <h3 className="text-base sm:text-xl font-black text-zinc-300">
              {data.targetModelName}
            </h3>
          </div>

        </div>

        {/* Comparison Specs Table */}
        <div className="max-w-4xl mx-auto rounded-2xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden shadow-2xl">
          <div className="divide-y divide-zinc-800/80">
            {data.specRows.map((row, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-12 py-3.5 px-4 sm:px-6 items-center text-xs sm:text-sm ${
                  idx % 2 === 0 ? "bg-zinc-900/30" : "bg-transparent"
                }`}
              >
                {/* Metric Label */}
                <div className="col-span-4 font-mono font-bold text-zinc-400 text-[11px] sm:text-xs uppercase">
                  {row.label}
                </div>

                {/* Current Aircraft Value */}
                <div className="col-span-4 font-bold text-[#c8f33b] font-mono text-center">
                  {row.currentModelValue}
                </div>

                {/* Target Aircraft Value */}
                <div className="col-span-4 font-medium text-zinc-400 font-mono text-center">
                  {row.targetModelValue}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
