"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, Check, Wrench } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export interface DiyComponentItem {
  id: string;
  name: string;
  slug: string;
  categoryTag: string;
  description: string;
  pricePaise: number;
  image: string;
}

const DIY_COMPONENTS: DiyComponentItem[] = [
  {
    id: "diy-prop-01",
    name: "Low-Noise Propellers",
    slug: "low-noise-propellers-diy-prop",
    categoryTag: "CARBON PROPELLERS • 4-PAIR",
    description: "Dynamic balancing for quieter acoustic profile and higher motor efficiency.",
    pricePaise: 149000,
    image: "/images/diy-propellers.jpg",
  },
  {
    id: "diy-motor-02",
    name: "XING2 2207 Brushless Motor",
    slug: "xing2-2207-brushless-motor-diy-mot",
    categoryTag: "BRUSHLESS MOTORS • Q4",
    description: "1850KV titanium shaft motor designed for 5-inch freestyle and heavy-duty cinematic builds.",
    pricePaise: 198000,
    image: "/images/diy-motor.jpg",
  },
  {
    id: "diy-esc-stack-03",
    name: "F7 Flight Stack 55A ESC",
    slug: "f7-flight-stack-55a-esc-diy-stack",
    categoryTag: "FLIGHT CONTROLLERS • ESC",
    description: "Dual BEC, integrated Barometer, Blackbox, and STM32 processing for sub-millisecond response.",
    pricePaise: 750000,
    image: "/images/diy-flight-stack.jpg",
  },
];

function formatINR(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

export function DiyBuilderShowcase() {
  const { addItem, setIsOpen } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAdd = (item: DiyComponentItem) => {
    addItem({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      basePricePaise: item.pricePaise,
      thumbnailUrl: item.image,
      isSecondHand: false,
      stockAvailable: 15,
    });
    setAddedItem(item.id);
    setIsOpen(true);
    setTimeout(() => setAddedItem(null), 1800);
  };

  return (
    <section className="bg-white py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              Build it. Tune it. Make it yours.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
              Hand-picked electronics, components, motors, and carbon frames for DIY pilots.
            </p>
          </div>
          <Link
            href="/kit-builder"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-zinc-600 transition"
          >
            <span>Shop components</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Card 1: Custom Rig Sandbox Special Dark Card */}
          <div className="group flex flex-col justify-between rounded-2xl bg-[#0b1612] p-6 text-white border border-emerald-950/60 shadow-lg transition-all duration-300 hover:border-emerald-800">
            <div>
              {/* Badge */}
              <div className="flex items-center justify-between">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-950 border border-emerald-800/80 text-[#c8f33b]">
                  <Wrench className="h-3.5 w-3.5" />
                </div>
                <span className="font-mono text-[9px] font-bold tracking-widest text-[#c8f33b] uppercase">
                  CUSTOM RIG SANDBOX
                </span>
              </div>

              {/* Title & Copy */}
              <h3 className="mt-5 text-xl font-black text-white leading-tight">
                Your next build starts here.
              </h3>
              <p className="mt-3 text-xs leading-relaxed text-zinc-400">
                Pick a carbon frame, match your KV motors, solder your flight stack. Test-fit in 3D building sandbox with automated checks.
              </p>
            </div>

            {/* Bottom Link CTA */}
            <div className="mt-8 pt-4 border-t border-emerald-950">
              <Link
                href="/kit-builder"
                className="inline-flex items-center gap-2 text-xs font-bold text-[#c8f33b] hover:text-[#b8e530] transition group-hover:translate-x-1 duration-200"
              >
                <span>Explore DIY Kits & Frames</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Cards 2, 3, 4: Components */}
          {DIY_COMPONENTS.map((item) => {
            const isAdded = addedItem === item.id;

            return (
              <div
                key={item.id}
                className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
              >
                <div>
                  {/* Image */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* Metadata */}
                  <div className="mt-4">
                    <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                      {item.categoryTag}
                    </span>
                    <h3 className="mt-1 text-sm font-bold text-black leading-snug">
                      {item.name}
                    </h3>
                    <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Bottom Price & Add Action */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                  <span className="font-mono text-sm font-black text-black">
                    {formatINR(item.pricePaise)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAdd(item)}
                    aria-label={`Add ${item.name} to bag`}
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 ${
                      isAdded
                        ? "bg-black text-[#c8f33b]"
                        : "bg-[#c8f33b] hover:bg-[#b8e530] text-black shadow-xs"
                    }`}
                  >
                    {isAdded ? (
                      <Check className="h-4 w-4 stroke-[3]" />
                    ) : (
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
