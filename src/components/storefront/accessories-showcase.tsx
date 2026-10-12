"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Plus, Check } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export interface AccessoryItem {
  id: string;
  name: string;
  slug: string;
  categoryTag: string;
  description: string;
  pricePaise: number;
  image: string;
}

const ACCESSORY_ITEMS: AccessoryItem[] = [
  {
    id: "acc-battery-01",
    name: "Intelligent Flight Battery",
    slug: "intelligent-flight-battery-acc-bat",
    categoryTag: "POWER & ENERGY",
    description: "High-capacity LiPo cell with integrated BMS protection circuit.",
    pricePaise: 900000,
    image: "/images/accessory-battery.jpg",
  },
  {
    id: "acc-nd-filters-02",
    name: "ND Filter 4-Pack (8/16/32/64)",
    slug: "nd-filter-4-pack-acc-nd",
    categoryTag: "OPTICS & FILTERS",
    description: "Optical glass coating preserving genuine colors in peak sunlight.",
    pricePaise: 425000,
    image: "/images/accessory-nd-filters.jpg",
  },
  {
    id: "acc-hard-case-03",
    name: "Explorer Hard Carry Case",
    slug: "explorer-hard-carry-case-acc-case",
    categoryTag: "PROTECTION & TRAVEL",
    description: "IP67 waterproof ballistic shell with laser-cut custom EVA foam.",
    pricePaise: 749000,
    image: "/images/accessory-hard-case.jpg",
  },
  {
    id: "acc-rc2-remote-04",
    name: "DJI RC 2 Remote Controller",
    slug: "dji-rc-2-remote-controller-acc-rc2",
    categoryTag: "CONTROL & TELEMETRY",
    description: "5.5-inch FHD screen, lightweight screen with O4 video link.",
    pricePaise: 2750000,
    image: "/images/accessory-rc2-remote.jpg",
  },
];

function formatINR(paise: number): string {
  return "₹" + Math.round(paise / 100).toLocaleString("en-IN");
}

export function AccessoriesShowcase() {
  const { addItem, setIsOpen } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAdd = (item: AccessoryItem) => {
    addItem({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      basePricePaise: item.pricePaise,
      thumbnailUrl: item.image,
      isSecondHand: false,
      stockAvailable: 12,
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
              Small additions. Big adventures.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
              Essential batteries, cinema glass, controllers, and protective luggage.
            </p>
          </div>
          <Link
            href="/catalog?category=accessories"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-zinc-600 transition"
          >
            <span>Shop accessories</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {ACCESSORY_ITEMS.map((item) => {
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
