import Link from "next/link";
import { Plane, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";

export default function StorefrontHomePage() {
  const featuredDrops = [
    {
      id: "prod-1",
      slug: "apex-5-inch-freestyle-drone",
      name: 'ImpulseRC Apex 5" 6S Freestyle Drone (BNF / ELRS)',
      basePricePaise: 2899900,
      stockQuantity: 4,
      isSecondHand: false,
    },
    {
      id: "prod-2",
      slug: "t-motor-f60-pro-v-1950kv",
      name: "T-Motor F60 PRO V 1950KV Brushless Motor (Grey Edition)",
      basePricePaise: 235000,
      stockQuantity: 28,
      isSecondHand: false,
    },
    {
      id: "prod-3",
      slug: "cinelog35-v2-pre-owned",
      name: "GEPRC CineLog35 V2 HD O3 (Grade A Certified Pre-Owned)",
      basePricePaise: 3499900,
      stockQuantity: 1,
      isSecondHand: true,
      cosmeticGrade: "A" as const,
    },
  ];

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-zinc-800/80 pt-8 pb-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-1 text-xs font-semibold text-emerald-400">
              <Zap className="h-3.5 w-3.5" />
              <span>Direct UPI Integration • Zero Markup Commission</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-100 sm:text-6xl">
              High-Performance Drone Engineering & Pre-Owned Fleet.
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-zinc-400">
              500+ technical SKUs for FPV racers, industrial pilots, and drone
              builders across India. Flight-tested used drones certified with
              logged hours and battery cycle audits.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/catalog"
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3.5 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
              >
                <span>Explore 500+ SKU Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/used-drones"
                className="flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900 px-6 py-3.5 text-sm font-bold text-zinc-200 transition hover:border-zinc-700"
              >
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                <span>Pre-Owned Marketplace (Grade A/B/C)</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Drops */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between pb-6">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-zinc-100">
              Featured Flight Hardware
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Top curated brushless motors, frames, and certified used crafts.
            </p>
          </div>
          <Link
            href="/catalog"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            View all 500+ SKUs →
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredDrops.map((prod) => (
            <ProductCard key={prod.id} {...prod} />
          ))}
        </div>
      </section>
    </div>
  );
}
