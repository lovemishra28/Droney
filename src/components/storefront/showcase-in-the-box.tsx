"use client";

import React from "react";

export interface InTheBoxItem {
  name: string;
  quantity: number;
  imageUrl?: string;
}

interface ShowcaseInTheBoxProps {
  items?: InTheBoxItem[];
}

export function ShowcaseInTheBox({ items = [] }: ShowcaseInTheBoxProps) {
  const defaultItems: InTheBoxItem[] = [
    { name: "DJI Air 3S Aircraft", quantity: 1, imageUrl: "/images/dji-air-3s.jpg" },
    { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
    { name: "Intelligent Flight Battery", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
    { name: "Battery Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
    { name: "ND Filter Set (ND8/16/32/64)", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
    { name: "Shoulder Carrying Case", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
    { name: "Low-Noise Propellers (Pair)", quantity: 3, imageUrl: "/images/diy-propellers.jpg" },
    { name: "Type-C to Type-C Cable", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
  ];

  const displayItems = items.length > 0 ? items : defaultItems;

  return (
    <section className="w-full bg-zinc-950 text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            COMPLETE PACK CONTENTS
          </span>
          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            In the Box.
          </h2>
          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            Everything included in the official Fly More Combo package to get you airborne immediately.
          </p>
        </div>

        {/* Visual Tiles Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {displayItems.map((item, idx) => (
            <div
              key={idx}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-800/80 bg-zinc-900/50 p-4 transition-all hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl"
            >
              {/* Quantity Pill */}
              <div className="flex justify-end">
                <span className="rounded-full bg-black/80 border border-zinc-800 px-2.5 py-0.5 text-[11px] font-mono font-bold text-[#c8f33b]">
                  ×{item.quantity}
                </span>
              </div>

              {/* Image */}
              <div className="my-3 aspect-square w-full overflow-hidden rounded-xl bg-black relative">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-zinc-900 text-zinc-600 font-mono text-xs">
                    Component
                  </div>
                )}
              </div>

              {/* Title */}
              <div className="pt-2">
                <h4 className="text-xs sm:text-sm font-bold text-white line-clamp-2 leading-snug">
                  {item.name}
                </h4>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
