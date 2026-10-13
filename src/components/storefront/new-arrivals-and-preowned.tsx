"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, 
  Heart, 
  Plus, 
  Check, 
  CheckCircle2, 
  Sparkles,
  ShoppingBag
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export interface NewArrivalsAndPreOwnedSectionProps {
  initialProducts?: any[];
}

const NEW_ARRIVALS_SPEC = [
  {
    targetSku: "DRN-DJI-A3S",
    searchKey: "Air 3S",
    fallbackId: "d2f36e28-343a-43e2-b3a5-c210a50345bc",
    fallbackSlug: "dji-air-3s-drn-dji-a3s",
    name: "DJI Air 3S",
    badge: { text: "PRE-ORDER", style: "pre-order" },
    categoryLabel: "CAMERA DRONE • DUAL SENSOR",
    description: "4K/60fps HDR, 1-inch CMOS primary camera, 45 min flight time.",
    pricePaise: 11200000,
    image: "/images/dji-air-3s.jpg",
  },
  {
    targetSku: "DRN-DJI-M3P",
    searchKey: "Mavic 3 Pro",
    fallbackId: "cf41d604-c0df-406d-afab-23b613af29ac",
    fallbackSlug: "dji-mavic-3-pro-drn-dji-m3p",
    name: "DJI Mavic 3 Pro",
    badge: { text: "IN STOCK", style: "in-stock" },
    categoryLabel: "FLAGSHIP • TRI-CAMERA",
    description: "Hasselblad 4/3 CMOS triple camera system with 15km O3+ transmission.",
    pricePaise: 19800000,
    image: "/images/dji-mavic-3-pro.jpg",
  },
  {
    targetSku: "DRN-DJI-AV2",
    searchKey: "Avata 2",
    fallbackId: "3034decf-fe0d-4cf9-99d2-bdd16a51e60f",
    fallbackSlug: "dji-avata-2-fpv-drn-dji-av2",
    name: "DJI Avata 2 FPV",
    badge: { text: "POPULAR FPV", style: "popular" },
    categoryLabel: "CINEMATIC FPV • ACRO",
    description: "Immersive motion flight, ultra-wide 4K/60fps, built-in propeller guard.",
    pricePaise: 8450000,
    image: "/images/dji-avata-2.jpg",
  },
  {
    targetSku: "DRN-DJI-NEO",
    searchKey: "Neo",
    fallbackId: "3541741f-6116-4ce6-99de-c420bbbf2a9f",
    fallbackSlug: "dji-neo-drn-dji-neo",
    name: "DJI Neo",
    badge: { text: "ULTRA-LIGHT", style: "ultra-light" },
    categoryLabel: "PALM TAKEOFF • 135G",
    description: "Palm takeoff and landing, AI subject tracking, 4K ultra-stabilized video.",
    pricePaise: 2499000,
    image: "/images/dji-neo-palm.jpg",
  },
];

export function NewArrivalsAndPreOwnedSection({
  initialProducts = [],
}: NewArrivalsAndPreOwnedSectionProps) {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { addItem, setIsOpen } = useCartStore();

  // Helper to resolve the real product from database or config
  function resolveProduct(spec: (typeof NEW_ARRIVALS_SPEC)[0]) {
    const found = initialProducts.find(
      (p) =>
        p.sku === spec.targetSku ||
        p.name?.toLowerCase().includes(spec.searchKey.toLowerCase())
    );

    return {
      id: found?.id || spec.fallbackId,
      name: found?.name || spec.name,
      slug: found?.slug || spec.fallbackSlug,
      pricePaise: found?.basePricePaise || spec.pricePaise,
      image: found?.media?.[0]?.url || spec.image,
      stockAvailable: found?.stockQuantity ?? 10,
      isSecondHand: Boolean(found?.isSecondHand),
      badge: spec.badge,
      categoryLabel: spec.categoryLabel,
      description: spec.description,
    };
  }

  // Pre-Owned product resolvers
  const air2sProduct = initialProducts.find(
    (p) =>
      p.sku === "DRN-SH-A2S" ||
      (p.isSecondHand && p.name?.toLowerCase().includes("air 2s"))
  ) || {
    id: "6990973d-c711-411f-adac-8442e0376619",
    name: "DJI Air 2S Fly More Combo",
    slug: "dji-air-2s-fly-more-combo-drn-sh-a2s",
    basePricePaise: 5890000,
    media: [{ url: "/images/dji-air-3s.jpg" }],
    stockQuantity: 1,
    isSecondHand: true,
  };

  const mini4Product = initialProducts.find(
    (p) =>
      p.sku === "DRN-SH-M4P" ||
      (p.isSecondHand && p.name?.toLowerCase().includes("mini 4"))
  ) || {
    id: "92d4f13f-52ce-4eff-aef7-3dde5193e17e",
    name: "DJI Mini 4 Pro with RC-N2",
    slug: "dji-mini-4-pro-with-rc-n2-drn-sh-min4p",
    basePricePaise: 6200000,
    media: [{ url: "/images/preowned-mini-canyon.jpg" }],
    stockQuantity: 1,
    isSecondHand: true,
  };

  function toggleWishlist(id: string) {
    setWishlist((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function handleAddToCart(item: {
    id: string;
    name: string;
    slug: string;
    pricePaise: number;
    image: string;
    isSecondHand: boolean;
    stockAvailable: number;
  }) {
    addItem({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      basePricePaise: item.pricePaise,
      thumbnailUrl: item.image,
      isSecondHand: item.isSecondHand,
      quantity: 1,
      stockAvailable: item.stockAvailable,
    });

    setToastMessage(`Added "${item.name}" to Bag`);
    setTimeout(() => {
      setToastMessage(null);
      setIsOpen(true);
    }, 400);
  }

  return (
    <section className="bg-white py-16 sm:py-20 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
            <span className="h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span>{toastMessage}</span>
          </div>
        )}



        {/* ==================================================================== */}
        {/* PART 2: NEW ARRIVALS GRID HEADER & 4 PRODUCT CARDS                  */}
        {/* ==================================================================== */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
                New arrivals. New possibilities.
              </h2>
              <p className="mt-1.5 text-sm text-zinc-500">
                Freshly released flight platforms engineered for cinematic and FPV supremacy.
              </p>
            </div>
            <Link
              href="/catalog?condition=new"
              className="inline-flex items-center gap-1 text-sm font-bold text-black hover:text-zinc-600 transition group"
            >
              <span>Shop all new</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          {/* 4 Product Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {NEW_ARRIVALS_SPEC.map((spec) => {
              const product = resolveProduct(spec);
              const isSaved = wishlist[product.id];

              return (
                <div
                  key={product.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-4 transition-all hover:bg-white hover:shadow-xl hover:border-zinc-300"
                >
                  {/* Top Badges & Wishlist Action */}
                  <div>
                    <div className="flex items-center justify-between">
                      {product.badge.style === "pre-order" && (
                        <span className="rounded-full border border-zinc-200 bg-white/90 px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-700 uppercase">
                          {product.badge.text}
                        </span>
                      )}
                      {product.badge.style === "in-stock" && (
                        <span className="rounded-full bg-black px-2.5 py-1 text-[10px] font-bold tracking-wider text-white uppercase">
                          {product.badge.text}
                        </span>
                      )}
                      {product.badge.style === "popular" && (
                        <span className="rounded-full bg-[#c8f33b] px-2.5 py-1 text-[10px] font-bold tracking-wider text-black uppercase">
                          {product.badge.text}
                        </span>
                      )}
                      {product.badge.style === "ultra-light" && (
                        <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-[10px] font-bold tracking-wider text-zinc-700 uppercase">
                          {product.badge.text}
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleWishlist(product.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-zinc-400 shadow-xs hover:text-red-500 hover:bg-white transition"
                        aria-label="Save to Wishlist"
                      >
                        <Heart
                          className={`h-4 w-4 ${isSaved ? "fill-red-500 text-red-500" : ""}`}
                        />
                      </button>
                    </div>

                    {/* Image Container */}
                    <Link
                      href={`/product/${product.slug}`}
                      className="mt-3 block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-200"
                    >
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 25vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Specs / Meta Content */}
                    <div className="mt-4">
                      <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                        {product.categoryLabel}
                      </div>
                      <Link
                        href={`/product/${product.slug}`}
                        className="mt-1 block text-base font-bold text-black hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom: Price and Lime Plus Button */}
                  <div className="mt-6 flex items-center justify-between border-t border-zinc-200/60 pt-3">
                    <div>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase mr-1">INR</span>
                      <span className="text-base font-black text-black">
                        ₹{(product.pricePaise / 100).toLocaleString("en-IN")}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddToCart(product)}
                      className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8f33b] text-black shadow-xs hover:bg-[#b8e530] transition active:scale-90"
                      aria-label={`Add ${product.name} to Bag`}
                    >
                      <Plus className="h-4 w-4 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PART 3: LARGE PRE-OWNED PILOT PROGRAM HERO BANNER                   */}
        {/* ==================================================================== */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-zinc-950 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left 60% Image Column with Tag Badge */}
            <div className="relative min-h-[340px] sm:min-h-[420px] lg:col-span-7">
              <Image
                src="/images/preowned-mini-canyon.jpg"
                alt="Refurbished DJI Mini 3 Pro Grade A+ in flight over canyon"
                fill
                sizes="(max-width: 1024px) 100vw, 60vw"
                className="object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />
              
              {/* Bottom Left Refurbished Badge */}
              <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                <span className="h-2 w-2 rounded-full bg-[#c8f33b] animate-pulse" />
                <span>Refurbished DJI Mini 3 Pro - Grade A+</span>
              </div>
            </div>

            {/* Right 40% Telemetry & Program Details Column */}
            <div className="flex flex-col justify-between bg-[#0b1c18] p-8 sm:p-10 lg:col-span-5 text-white">
              <div>
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-[#c8f33b] uppercase">
                  <span>PRE-OWNED PILOT PROGRAM</span>
                </div>

                <h3 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                  Less packing.
                  <br />
                  More perspective.
                </h3>

                <p className="mt-3 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Find verified pre-owned drones tested across a 32-point flight and sensor checklist. Same cinematic performance, without compromising on reliability.
                </p>

                {/* 3 Telemetry Columns */}
                <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                  <div>
                    <div className="flex items-center gap-1 text-sm sm:text-base font-bold text-[#c8f33b]">
                      <span>▲</span>
                      <span>249 g</span>
                    </div>
                    <div className="mt-0.5 text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                      TAKEOFF WEIGHT
                    </div>
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-bold text-white">
                      34 min
                    </div>
                    <div className="mt-0.5 text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                      FLIGHT DURATION
                    </div>
                  </div>

                  <div>
                    <div className="text-sm sm:text-base font-bold text-white">
                      4K HDR
                    </div>
                    <div className="mt-0.5 text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                      VERTICAL VIDEO
                    </div>
                  </div>
                </div>
              </div>

              {/* Certified Price & Shop Pre-Owned CTA */}
              <div className="mt-8 flex flex-wrap items-end justify-between gap-4 border-t border-white/10 pt-6">
                <div>
                  <div className="text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                    CERTIFIED PRICE
                  </div>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      ₹41,999
                    </span>
                    <span className="text-xs text-zinc-500 line-through">
                      ₹67,500
                    </span>
                  </div>
                </div>

                <Link
                  href="/used-drones"
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f33b] px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-md hover:bg-[#b8e530] transition active:scale-95"
                >
                  <span>Shop Pre-Owned</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* PART 4: 3 BOTTOM CARDS (2 PRE-OWNED UNITS + 1 TRADE-IN VALUATION)    */}
        {/* ==================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: DJI Air 2S Fly More Combo */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:border-zinc-300 hover:shadow-lg transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                  GRADE A+ MINT
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  98% Battery Health
                </span>
              </div>

              <h4 className="mt-4 text-base font-bold text-black">
                DJI Air 2S Fly More Combo
              </h4>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                1-Inch Sensor, 5.4K Video, MasterShots. Includes 3 original batteries & shoulder bag.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-black">₹58,900</span>
                <span className="text-xs text-zinc-400 line-through">₹92,000</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddToCart({
                    id: air2sProduct.id,
                    name: air2sProduct.name,
                    slug: air2sProduct.slug,
                    pricePaise: air2sProduct.basePricePaise,
                    image: air2sProduct.media?.[0]?.url || "/images/dji-air-3s.jpg",
                    isSecondHand: true,
                    stockAvailable: 1,
                  })
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-black shadow-xs hover:bg-zinc-50 transition active:scale-95"
              >
                Claim Unit
              </button>
            </div>
          </div>

          {/* Card 2: DJI Mini 4 Pro with RC-N2 */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:border-zinc-300 hover:shadow-lg transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                  CERTIFIED REFURBISHED
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  6 Charge Cycles
                </span>
              </div>

              <h4 className="mt-4 text-base font-bold text-black">
                DJI Mini 4 Pro with RC-N2
              </h4>
              <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                Omnidirectional obstacle sensing, 4K/60fps HDR vertical shooting. Full warranty.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-black text-black">₹62,000</span>
                <span className="text-xs text-zinc-400 line-through">₹79,000</span>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleAddToCart({
                    id: mini4Product.id,
                    name: mini4Product.name,
                    slug: mini4Product.slug,
                    pricePaise: mini4Product.basePricePaise,
                    image: mini4Product.media?.[0]?.url || "/images/preowned-mini-canyon.jpg",
                    isSecondHand: true,
                    stockAvailable: 1,
                  })
                }
                className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-xs font-bold text-black shadow-xs hover:bg-zinc-50 transition active:scale-95"
              >
                Claim Unit
              </button>
            </div>
          </div>

          {/* Card 3: TRADE-IN VALUATION BANNER */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#141619] p-6 text-white shadow-md hover:border-zinc-700 transition">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider text-[#c8f33b] uppercase">
                TRADE-IN VALUATION
              </div>

              <h4 className="mt-3 text-base font-bold text-white">
                Have a drone sitting idle?
              </h4>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Upgrade your kit or get paid instant bank transfer. We offer transparent doorstep pickup across India.
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-zinc-800 pt-4">
              <span className="text-xs font-mono text-zinc-400">
                Instant quote in 3 mins
              </span>

              <Link
                href="/trade-in"
                className="inline-flex items-center gap-1 rounded-full bg-[#c8f33b] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e530] transition active:scale-95"
              >
                <span>Get Valuation</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
