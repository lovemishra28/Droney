"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ShowcaseTechSpecsProps {
  groupedSpecs?: Record<string, Record<string, string>> | null;
}

export function ShowcaseTechSpecs({ groupedSpecs }: ShowcaseTechSpecsProps) {
  const defaultGroupedSpecs: Record<string, Record<string, string>> = {
    "Aircraft": {
      "Takeoff Weight": "724 grams",
      "Dimensions (Folded)": "214.19 × 100.63 × 89.17 mm",
      "Dimensions (Unfolded)": "258.82 × 326.19 × 105.89 mm",
      "Max Ascent Speed": "10 m/s",
      "Max Descent Speed": "10 m/s",
      "Max Horizontal Speed": "21 m/s (approx. 75.6 km/h)",
      "Max Wind Speed Resistance": "12 m/s",
      "Max Takeoff Altitude": "6000 m",
    },
    "Camera System": {
      "Primary Sensor": "1-inch CMOS, 50 MP Effective Pixels",
      "Medium Tele Sensor": "1/1.3-inch CMOS, 48 MP Effective Pixels",
      "Primary Lens": "Format Equivalent: 24 mm, Aperture: f/1.8",
      "Telephoto Lens": "Format Equivalent: 70 mm, Aperture: f/2.8",
      "ISO Range": "Video: 100-12800 (D-Log M: 100-3200); Photo: 100-6400",
      "Max Video Resolution": "4K (3840×2160) @ 60fps HDR, up to 120fps",
      "Color Profiles": "10-bit D-Log M, 10-bit HLG, 8-bit Normal",
    },
    "Gimbal & Stabilization": {
      "Stabilization": "3-axis mechanical gimbal (tilt, roll, pan)",
      "Mechanical Range": "Tilt: -135° to 70°, Roll: -50° to 50°, Pan: -27° to 27°",
      "Max Control Speed": "100°/s",
    },
    "Sensing & Safety": {
      "Sensing Type": "Omnidirectional obstacle sensing system",
      "Forward Sensor": "Forward LiDAR distance measurement + Dual Vision",
      "Precision Measurement Range": "0.5 to 30 m",
      "Nightscape Assistance": "Active LiDAR surface reflection down to 0.1 lux",
    },
    "Battery & Power": {
      "Capacity": "4276 mAh",
      "Battery Type": "Li-ion 4S",
      "Weight": "247 g",
      "Nominal Voltage": "14.6 V",
      "Max Charging Power": "65W USB-C PD / 100W Hub",
    },
    "Video Transmission": {
      "System": "DJI O4 Transmission",
      "Live View Quality": "1080p @ 60fps",
      "Operating Frequencies": "2.4 GHz, 5.1 GHz, 5.8 GHz",
      "Max Transmission Distance": "20 km (FCC), 10 km (CE/SRRC/MIC)",
    },
  };

  const specs = groupedSpecs && Object.keys(groupedSpecs).length > 0 ? groupedSpecs : defaultGroupedSpecs;

  const categories = Object.keys(specs);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    [categories[0] || "Aircraft"]: true,
    [categories[1] || "Camera System"]: true,
  });

  const toggleCategory = (cat: string) => {
    setOpenCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <section className="w-full bg-black text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            DETAILED TELEMETRY & HARDWARE
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Technical Specifications.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            In-depth component breakdown across optical sensors, avionics, radio frequencies, and payload capabilities.
          </p>
        </div>

        {/* Grouped Accordions */}
        <div className="max-w-4xl mx-auto space-y-4">
          {categories.map((category) => {
            const isOpen = Boolean(openCategories[category]);
            const fields = specs[category] || {};

            return (
              <div
                key={category}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-950/80 overflow-hidden shadow-xl transition-colors"
              >
                {/* Accordion Header */}
                <button
                  type="button"
                  onClick={() => toggleCategory(category)}
                  className="flex w-full items-center justify-between p-5 text-left hover:bg-zinc-900/50 transition cursor-pointer"
                >
                  <span className="font-mono text-sm sm:text-base font-bold text-white tracking-wide uppercase">
                    {category}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#c8f33b]" : ""
                    }`}
                  />
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="border-t border-zinc-800/80 divide-y divide-zinc-900 bg-zinc-950/40">
                    {Object.entries(fields).map(([key, val], fIdx) => (
                      <div
                        key={fIdx}
                        className="grid grid-cols-12 px-5 py-3 text-xs sm:text-sm items-baseline"
                      >
                        <span className="col-span-5 sm:col-span-4 font-mono text-zinc-400 font-medium">
                          {key}
                        </span>
                        <span className="col-span-7 sm:col-span-8 font-mono text-zinc-200 font-semibold">
                          {val}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
