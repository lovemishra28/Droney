"use client";

import React, { useState, useEffect } from "react";
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
import { resolveImageUrl, getProductCoverMedia } from "@/lib/media";
import { formatINR } from "@/lib/utils";
import { checkAddToCartAllowed } from "@/lib/auth-client";
import { SafeImage } from "@/components/ui/safe-image";

const PREOWNED_SLIDES = [
  {
    image: "/images/preowned-slide-1.jpg?v=20261016",
    alt: "Refurbished DJI Mini Drone",
  },
  {
    image: "/images/preowned-slide-2.jpg?v=20261016",
    alt: "Verified Pre-Owned DJI Drone Fleet",
  },
  {
    image: "/images/preowned-slide-3.jpg?v=20261016",
    alt: "Pre-Owned Drones and Aviation Hardware",
  },
];

function PreOwnedImageSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % PREOWNED_SLIDES.length);
    }, 4500);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {PREOWNED_SLIDES.map((slide, index) => (
        <div
          key={slide.image}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            index === currentSlide
              ? "opacity-100 z-10"
              : "opacity-0 z-0 pointer-events-none"
          }`}
        >
          <Image
            src={slide.image}
            alt={slide.alt}
            fill
            priority={index === 0}
            sizes="(max-width: 1024px) 100vw, 60vw"
            className="object-cover object-center"
          />
        </div>
      ))}

      {/* Subtle indicator dots */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur-md px-2.5 py-1 border border-zinc-200/80 shadow-sm">
        {PREOWNED_SLIDES.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setCurrentSlide(i);
            }}
            aria-label={`Go to slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentSlide
                ? "w-4 bg-zinc-900"
                : "w-1.5 bg-zinc-300 hover:bg-zinc-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

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
                const image = getProductCoverMedia(product.media, product.name);
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
                        <SafeImage
                          src={image}
                          fallbackSrc={resolveImageUrl(null, product.name)}
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
                  {/* Left Column: Pre-Owned Pilot Program Details */}
                  <div className="flex flex-col justify-between bg-[#0a1813] p-8 sm:p-10 lg:p-12 lg:col-span-5 text-white">
                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-[#c8f33b] uppercase">
                        <span>PRE-OWNED PILOT PROGRAM</span>
                      </div>

                      {/* Prominent Headline with Two-Tier Hierarchy */}
                      <div className="mt-4 sm:mt-6 space-y-1 sm:space-y-2">
                        <span className="block text-2xl sm:text-3xl md:text-4xl font-extrabold text-zinc-400 tracking-tight leading-tight">
                          Less packing.
                        </span>
                        <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white tracking-tight leading-[0.95]">
                          More perspective.
                        </span>
                      </div>
                    </div>

                    {/* Full-Width Shop Pre-Owned CTA */}
                    <div className="mt-8 border-t border-white/10 pt-6">
                      <Link
                        href="/used-drones"
                        className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 text-sm sm:text-base font-bold text-black shadow-md hover:bg-[#b8e530] transition active:scale-[0.99]"
                      >
                        <span>Shop Pre-Owned</span>
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>

                  {/* Right Column: Landscape Drone Photography Slider */}
                  <div className="relative min-h-[300px] sm:min-h-[380px] lg:col-span-7">
                    <PreOwnedImageSlider />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent lg:hidden pointer-events-none z-10" />

                    {/* Bottom Left Refurbished Minimal Label */}
                    <div className="absolute bottom-4 left-4 z-20 text-[11px] font-mono font-bold text-zinc-800 drop-shadow-xs tracking-wide">
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
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
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
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
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
                        <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase tracking-wider">
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
                    <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-widest">
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

            {/* Card 3: TRADE-IN VALUATION */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-[#111111] p-6 sm:p-7 text-white shadow-md hover:border-zinc-700 transition">
              <div className="flex-1 flex flex-col justify-center py-2">
                <h4 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-white tracking-tight leading-[1.15]">
                  Have a drone <br className="hidden sm:inline" />
                  sitting idle?
                </h4>
              </div>

              <div className="mt-6 border-t border-zinc-800/80 pt-4">
                <Link
                  href="/trade-in"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3 px-4 text-xs sm:text-sm font-bold text-black hover:bg-[#b8e530] transition active:scale-[0.99] shadow-md"
                >
                  <span>Get Valuation</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
