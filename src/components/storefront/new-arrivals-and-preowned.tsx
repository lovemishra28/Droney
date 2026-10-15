"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { 
  ArrowRight, 
  Heart, 
  Plus, 
  Check, 
  ShieldCheck, 
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { resolveImageUrl } from "@/lib/media";
import { formatINR } from "@/lib/utils";
import { checkAddToCartAllowed } from "@/lib/auth-client";

export interface NewArrivalsAndPreOwnedSectionProps {
  newArrivals?: any[];
  preOwnedUnits?: any[];
  initialProducts?: any[]; // backwards compatibility
}

export function NewArrivalsAndPreOwnedSection({
  newArrivals: passedNewArrivals,
  preOwnedUnits: passedPreOwned,
  initialProducts = [],
}: NewArrivalsAndPreOwnedSectionProps) {
  const router = useRouter();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "warning">("success");

  const { addItem, setIsOpen } = useCartStore();
  const { isInWishlist, toggleItem } = useWishlistStore();

  // Resolve arrays: prefer passed props, fallback to initialProducts filter
  const newArrivals = (
    passedNewArrivals || initialProducts.filter((p) => !p.isSecondHand)
  ).slice(0, 4);

  const preOwnedUnits = (
    passedPreOwned || initialProducts.filter((p) => p.isSecondHand)
  ).slice(0, 2);

  async function handleAddToCart(item: {
    id: string;
    name: string;
    slug: string;
    pricePaise: number;
    image: string;
    isSecondHand: boolean;
    stockAvailable: number;
  }) {
    // 1. Enforce Authentication & Admin Restriction Guard
    const authCheck = await checkAddToCartAllowed();
    if (!authCheck.allowed) {
      if (authCheck.reason === "unauthenticated") {
        router.push(authCheck.loginUrl);
        return;
      }
      if (authCheck.reason === "admin") {
        setToastType("warning");
        setToastMessage(authCheck.message);
        setTimeout(() => setToastMessage(null), 5000);
        return;
      }
    }

    // 2. Add to Cart for verified customer
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

    setToastType("success");
    setToastMessage(`Added "${item.name}" to Bag`);
    setTimeout(() => {
      setToastMessage(null);
      setIsOpen(true);
    }, 400);
  }

  return (
    <section className="bg-white py-16 sm:py-20 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Toast Notification Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full px-5 py-3 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-4 ${
              toastType === "warning"
                ? "bg-amber-950 border border-amber-500/40 text-amber-200"
                : "bg-black text-white"
            }`}
          >
            {toastType === "warning" ? (
              <AlertTriangle className="h-4 w-4 text-amber-400 shrink-0" />
            ) : (
              <span className="h-2 w-2 rounded-full bg-[#c8f33b]" />
            )}
            <span>{toastMessage}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* PART 1: NEW ARRIVALS — EXACT MATCH TO SCREENSHOT 1                  */}
        {/* Single Row, Exactly 4 Latest Admin-Modified Products                 */}
        {/* ==================================================================== */}
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black font-sans">
                New arrivals. New possibilities.
              </h2>
              <p className="mt-1.5 text-xs sm:text-sm text-zinc-500 font-sans">
                Freshly released flight platforms engineered for cinematic and FPV supremacy.
              </p>
            </div>
            <Link
              href="/catalog?condition=new"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-black hover:text-zinc-600 transition group"
            >
              <span>Shop all new</span>
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </Link>
          </div>

          {newArrivals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-center">
              <p className="text-sm font-bold text-black">No brand-new aircraft currently listed.</p>
              <p className="mt-1 text-xs text-zinc-500">Add or import drones in the admin dashboard to populate this row.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => {
                const isSaved = isInWishlist(product.id);
                const image = resolveImageUrl(product.media?.[0]?.url, product.name);
                const isAvailable = product.stockQuantity > 0;

                // Derive badge style matching Screenshot 1 (PRE-ORDER, IN STOCK, POPULAR FPV, ULTRA-LIGHT)
                const explicitBadge = product.showcase?.heroBadge?.toUpperCase();
                let badgeLabel = explicitBadge || "IN STOCK";
                let badgeClass = "bg-black text-white";

                if (explicitBadge?.includes("PRE-ORDER")) {
                  badgeLabel = "PRE-ORDER";
                  badgeClass = "bg-white border border-zinc-300 text-zinc-800";
                } else if (
                  explicitBadge?.includes("FPV") ||
                  product.category?.name?.toLowerCase().includes("fpv")
                ) {
                  badgeLabel = "POPULAR FPV";
                  badgeClass = "bg-[#c8f33b] text-black font-bold";
                } else if (
                  explicitBadge?.includes("ULTRA") ||
                  product.category?.name?.toLowerCase().includes("mini") ||
                  (product.specifications?.weightGrams && product.specifications.weightGrams <= 249)
                ) {
                  badgeLabel = "ULTRA-LIGHT";
                  badgeClass = "bg-zinc-100 text-zinc-700 border border-zinc-200";
                } else if (!isAvailable) {
                  badgeLabel = "BACKORDER";
                  badgeClass = "bg-amber-100 text-amber-800 border border-amber-200";
                }

                // Subtitle / specification summary line (e.g. CAMERA DRONE • DUAL SENSOR)
                const subTag =
                  product.specifications?.weightGrams && product.specifications.weightGrams <= 249
                    ? `PALM TAKEOFF • ${product.specifications.weightGrams}G`
                    : product.category?.name?.toLowerCase().includes("fpv")
                    ? "CINEMATIC FPV • ACRO"
                    : product.category?.name?.toLowerCase().includes("mavic")
                    ? "FLAGSHIP • TRI-CAMERA"
                    : product.category?.name?.toUpperCase() || "CAMERA DRONE • DUAL SENSOR";

                return (
                  <div
                    key={product.id}
                    className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-5 transition-all hover:shadow-xl hover:border-zinc-300"
                  >
                    <div>
                      {/* Top Row: Pill Badge on Left + Wishlist Heart on Right */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[9px] font-mono font-bold tracking-wider uppercase ${badgeClass}`}
                        >
                          {badgeLabel}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            toggleItem({
                              productId: product.id,
                              slug: product.slug,
                              name: product.name,
                              basePricePaise: product.basePricePaise,
                              thumbnailUrl: image,
                              isSecondHand: product.isSecondHand,
                            })
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-zinc-200/80 shadow-xs hover:border-zinc-300 hover:bg-zinc-50 transition cursor-pointer"
                          aria-label="Save to Wishlist"
                          title={isSaved ? "Remove from Wishlist" : "Save to Wishlist"}
                        >
                          <Heart
                            className={`h-4 w-4 transition-transform active:scale-90 ${
                              isSaved ? "fill-red-500 text-red-500" : "text-zinc-400"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Product Photography Center Container */}
                      <Link
                        href={`/product/${product.slug}`}
                        className="mt-4 block relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-50/60"
                      >
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        />
                      </Link>

                      {/* Metadata Specs & Title */}
                      <div className="mt-4">
                        <div className="text-[10px] font-mono font-bold tracking-wider text-zinc-400 uppercase">
                          {subTag}
                        </div>
                        <Link
                          href={`/product/${product.slug}`}
                          className="mt-1 block text-base font-bold text-black hover:underline leading-snug"
                        >
                          {product.name}
                        </Link>
                        <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {product.showcase?.heroSubtitle ||
                            product.description ||
                            "Precision engineered aircraft with verified telemetry and official warranty."}
                        </p>
                      </div>
                    </div>

                    {/* Card Bottom: INR Price and Lime Green Plus Button */}
                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-3">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase">
                          INR
                        </span>
                        <span className="text-base font-black text-black font-mono">
                          {formatINR(product.basePricePaise)}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            id: product.id,
                            name: product.name,
                            slug: product.slug,
                            pricePaise: product.basePricePaise,
                            image,
                            isSecondHand: false,
                            stockAvailable: product.stockQuantity,
                          })
                        }
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#c8f33b] text-black shadow-xs hover:bg-[#b8e530] transition active:scale-90 cursor-pointer"
                        aria-label={`Add ${product.name} to Bag`}
                      >
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* PART 2: PRE-OWNED PILOT PROGRAM — EXACT MATCH TO SCREENSHOT 2       */}
        {/* 1. Top Wide Hero Banner                                             */}
        {/* 2. Bottom Row: Two Latest Refurbished Units (or Empty Slots) + Trade-In */}
        {/* ==================================================================== */}
        <div className="space-y-6">
          {/* Top Hero Banner */}
          {(() => {
            const featured = preOwnedUnits[0];
            const featuredImg = featured
              ? resolveImageUrl(featured.media?.[0]?.url, featured.name)
              : "/images/preowned-mini-canyon.jpg";
            const featuredGrade = featured?.secondHandDetails?.cosmeticGrade || "A+";
            const featuredTitle = featured?.name || "Refurbished DJI Mini 3 Pro - Grade A+";
            const featuredPrice = featured ? featured.basePricePaise : 4199900;
            const featuredMrp = featured?.showcase?.mrpPricePaise || 6750000;

            const weight = featured?.specifications?.weightGrams || 249;
            const flightTime = featured?.specifications?.flightTimeMinutes || 34;

            return (
              <div className="overflow-hidden rounded-3xl border border-zinc-200/80 bg-[#0a1813] text-white shadow-2xl">
                <div className="grid grid-cols-1 lg:grid-cols-12">
                  {/* Left Column: Landscape Drone Photography */}
                  <div className="relative min-h-[300px] sm:min-h-[380px] lg:col-span-7">
                    <Image
                      src={featuredImg}
                      alt={featuredTitle}
                      fill
                      sizes="(max-width: 1024px) 100vw, 60vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden" />

                    {/* Bottom Left Refurbished Badge matching Screenshot 2 */}
                    <div className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/70 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold text-white shadow-lg">
                      <span className="h-2 w-2 rounded-full bg-[#c8f33b] animate-pulse" />
                      <span>{featured ? `Refurbished ${featured.name} - Grade ${featuredGrade}` : "Refurbished DJI Mini 3 Pro - Grade A+"}</span>
                    </div>
                  </div>

                  {/* Right Column: Pre-Owned Pilot Program Details */}
                  <div className="flex flex-col justify-between bg-[#0a1813] p-8 sm:p-10 lg:col-span-5 text-white">
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

                      {/* 3 Stats in a Row matching Screenshot 2 */}
                      <div className="mt-6 grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                        <div>
                          <div className="flex items-center gap-1 text-sm sm:text-base font-bold text-[#c8f33b]">
                            <span>▲</span>
                            <span>{weight} g</span>
                          </div>
                          <div className="mt-0.5 text-[9px] font-mono tracking-wider text-zinc-400 uppercase">
                            TAKEOFF WEIGHT
                          </div>
                        </div>
                        <div>
                          <div className="text-sm sm:text-base font-bold text-white">
                            {flightTime} min
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
                          <span className="text-2xl sm:text-3xl font-black text-white font-mono">
                            {formatINR(featuredPrice)}
                          </span>
                          {featuredMrp && (
                            <span className="text-xs sm:text-sm line-through text-zinc-500 font-mono">
                              {formatINR(featuredMrp)}
                            </span>
                          )}
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
            );
          })()}

          {/* Bottom 3 Cards Row: 2 Pre-Owned Slots + Trade-In Valuation Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Slot 1: First Pre-Owned Drone or Placeholder */}
            {preOwnedUnits[0] ? (
              (() => {
                const item = preOwnedUnits[0];
                const grade = item.secondHandDetails?.cosmeticGrade || "A";
                const batteryCycles = item.secondHandDetails?.batteryCycleCount;
                const img = resolveImageUrl(item.media?.[0]?.url, item.name);

                return (
                  <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:border-zinc-300 hover:shadow-lg transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                          GRADE {grade} MINT
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 font-medium">
                          {batteryCycles ? `${batteryCycles} Charge Cycles` : "98% Battery Health"}
                        </span>
                      </div>

                      <h4 className="mt-4 text-base font-bold text-black">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {item.description || "Inspected on 32-point bench with complete flight telemetry audit."}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-black font-mono">
                          {formatINR(item.basePricePaise)}
                        </span>
                        {item.showcase?.mrpPricePaise && (
                          <span className="text-xs line-through text-zinc-400 font-mono">
                            {formatINR(item.showcase.mrpPricePaise)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            id: item.id,
                            name: item.name,
                            slug: item.slug,
                            pricePaise: item.basePricePaise,
                            image: img,
                            isSecondHand: true,
                            stockAvailable: item.stockQuantity,
                          })
                        }
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-bold text-black shadow-xs hover:bg-zinc-100 transition active:scale-95 cursor-pointer"
                      >
                        Claim Unit
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Empty Box 1 (Waiting for Admin to add refurbished product) */
              <div className="flex flex-col justify-between rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-zinc-500 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-600 uppercase">
                      PRE-OWNED INTAKE
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      32-Point Audit Active
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-bold text-zinc-800">
                    Awaiting Certified Aircraft
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    Refurbished unit undergoing sensor telemetry checks and gimbal calibration on our technician bench.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-4">
                  <span className="text-xs font-mono text-zinc-400">Upcoming Drop</span>
                  <Link
                    href="/used-drones"
                    className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition"
                  >
                    View All
                  </Link>
                </div>
              </div>
            )}

            {/* Slot 2: Second Pre-Owned Drone or Placeholder */}
            {preOwnedUnits[1] ? (
              (() => {
                const item = preOwnedUnits[1];
                const grade = item.secondHandDetails?.cosmeticGrade || "A";
                const batteryCycles = item.secondHandDetails?.batteryCycleCount;
                const img = resolveImageUrl(item.media?.[0]?.url, item.name);

                return (
                  <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/90 bg-white p-6 shadow-xs hover:border-zinc-300 hover:shadow-lg transition">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="rounded-md border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                          CERTIFIED REFURBISHED
                        </span>
                        <span className="text-[10px] font-mono text-zinc-500 font-medium">
                          {batteryCycles ? `${batteryCycles} Charge Cycles` : "Full Warranty"}
                        </span>
                      </div>

                      <h4 className="mt-4 text-base font-bold text-black">
                        {item.name}
                      </h4>
                      <p className="mt-1 text-xs text-zinc-500 leading-relaxed line-clamp-2">
                        {item.description || "Omnidirectional obstacle sensing, 4K/60fps HDR vertical shooting. Full warranty."}
                      </p>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-zinc-100 pt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-lg font-black text-black font-mono">
                          {formatINR(item.basePricePaise)}
                        </span>
                        {item.showcase?.mrpPricePaise && (
                          <span className="text-xs line-through text-zinc-400 font-mono">
                            {formatINR(item.showcase.mrpPricePaise)}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddToCart({
                            id: item.id,
                            name: item.name,
                            slug: item.slug,
                            pricePaise: item.basePricePaise,
                            image: img,
                            isSecondHand: true,
                            stockAvailable: item.stockQuantity,
                          })
                        }
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-1.5 text-xs font-bold text-black shadow-xs hover:bg-zinc-100 transition active:scale-95 cursor-pointer"
                      >
                        Claim Unit
                      </button>
                    </div>
                  </div>
                );
              })()
            ) : (
              /* Empty Box 2 (Waiting for Admin to add refurbished product) */
              <div className="flex flex-col justify-between rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 p-6 text-zinc-500 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="rounded-md border border-zinc-300 bg-zinc-100 px-2 py-0.5 text-[10px] font-mono font-bold text-zinc-600 uppercase">
                      CERTIFIED REFURBISHED
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400">
                      Bench Drop Ready
                    </span>
                  </div>
                  <h4 className="mt-4 text-base font-bold text-zinc-800">
                    Awaiting Certified Aircraft
                  </h4>
                  <p className="mt-1 text-xs text-zinc-500 leading-relaxed">
                    Pre-owned drones added by the administrator in the database will automatically be displayed here in real time.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-zinc-200/80 pt-4">
                  <span className="text-xs font-mono text-zinc-400">Next Slot</span>
                  <Link
                    href="/used-drones"
                    className="rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-xs font-bold text-zinc-800 hover:bg-zinc-50 transition"
                  >
                    View All
                  </Link>
                </div>
              </div>
            )}

            {/* Card 3: TRADE-IN VALUATION — EXACT MATCH TO SCREENSHOT 2 */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#111111] p-6 text-white shadow-md hover:border-zinc-700 transition">
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
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f33b] px-4 py-2 text-xs font-bold text-black hover:bg-[#b8e530] transition active:scale-95"
                >
                  <span>Get Valuation</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
