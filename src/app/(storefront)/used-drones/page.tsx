import React from "react";
import Link from "next/link";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { getPreOwnedDrones } from "@/server/queries/catalog";
import { UsedDroneCard } from "@/components/storefront/used-drone-card";

interface UsedDronesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 60; // 60 seconds ISR edge caching

export default async function UsedDronesPage({
  searchParams,
}: UsedDronesPageProps) {
  const resolvedParams = await searchParams;
  const selectedGrade = (
    typeof resolvedParams.grade === "string" &&
    ["A", "B", "C"].includes(resolvedParams.grade)
      ? resolvedParams.grade
      : undefined
  ) as "A" | "B" | "C" | undefined;

  let usedDrones: any[] = [];

  try {
    usedDrones = await getPreOwnedDrones({
      cosmeticGrade: selectedGrade,
      limit: 24,
    });
  } catch (error) {
    console.warn("[Pre-Owned Drones Query Notice]:", error);
    // Development fallback mock items with inspection diagnostics
    const fallbackDrones = [
      {
        id: "used-1",
        slug: "cinelog35-v2-pre-owned",
        name: "GEPRC CineLog35 V2 HD O3 (Grade A Certified Pre-Owned)",
        sku: "USED-GEP-CL35",
        basePricePaise: 3499900,
        stockQuantity: 1,
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
        secondHandDetails: {
          cosmeticGrade: "A" as const,
          flightHours: 3.5,
          crashHistory: false,
          batteryCycleCount: 6,
          includedAccessories: [
            "4x HQProp D90-3 Props",
            "GoPro TPU Mount",
            "Hardware Tool Kit",
          ],
          inspectionNotes:
            "Flawless carbon condition, 0 gyro noise on Betaflight blackbox analysis.",
        },
      },
      {
        id: "used-2",
        slug: "nazgul5-v3-6s-used",
        name: "iFlight NazGul5 V3 6S Analog (Grade B Certified)",
        sku: "USED-IFL-NZ5",
        basePricePaise: 2199900,
        stockQuantity: 1,
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
        secondHandDetails: {
          cosmeticGrade: "B" as const,
          flightHours: 12.0,
          crashHistory: false,
          batteryCycleCount: 18,
          includedAccessories: [
            "2x Battery Straps",
            "Original Packaging",
            "SMA Antenna",
          ],
          inspectionNotes:
            "Light propeller guard cosmetic scuffs. Electronics and motors bench-tested 100%.",
        },
      },
      {
        id: "used-3",
        slug: "chimera7-pro-refurbished",
        name: "iFlight Chimera7 Pro V2 6S Long-Range (Refurbished)",
        sku: "USED-IFL-CH7",
        basePricePaise: 3899900,
        stockQuantity: 1,
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
        secondHandDetails: {
          cosmeticGrade: "C" as const,
          flightHours: 24.5,
          crashHistory: true,
          batteryCycleCount: 35,
          includedAccessories: [
            "GPS Mount",
            "Spare Carbon Arm",
            "XT60 Pigtail",
          ],
          inspectionNotes:
            "Refurbished front-left arm and replaced motor. Full stability test-flight passed.",
        },
      },
    ];

    usedDrones = selectedGrade
      ? fallbackDrones.filter(
          (d) => d.secondHandDetails.cosmeticGrade === selectedGrade
        )
      : fallbackDrones;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero Certification Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-6 sm:p-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/60 px-3 py-1 text-xs font-semibold text-amber-300">
            <ShieldCheck className="h-4 w-4" />
            <span>Certified Pre-Owned Drone Marketplace</span>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Flight-Tested Drones with Verified Telemetry Logs
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-zinc-400">
            Every pre-owned drone undergoes an 18-point technician bench test,
            motor bearing inspection, and LiPo battery load test. Backed by
            certified logs and direct binding support before shipment.
          </p>
        </div>

        {/* Inspection Grading Tiers Info Grid */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <Sparkles className="h-4 w-4" />
              <span>Grade A (Mint Tier)</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Under 5 logged flight hours, spotless frame, zero component
              repairs.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400">
              <CheckCircle2 className="h-4 w-4" />
              <span>Grade B (Operational)</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Minor cosmetic prop scuffs, factory electronics, under 20 battery
              cycles.
            </p>
          </div>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400">
              <ShieldCheck className="h-4 w-4" />
              <span>Grade C (Field-Tested)</span>
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              Certified refurbished motor arms/ESCs, full bench-tested
              stability.
            </p>
          </div>
        </div>
      </div>

      {/* Grade Filter Tabs */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
          <Link
            href="/used-drones"
            className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
              !selectedGrade
                ? "bg-indigo-600 text-white"
                : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            }`}
          >
            All Certified Units ({usedDrones.length})
          </Link>

          {(["A", "B", "C"] as const).map((grade) => (
            <Link
              key={grade}
              href={`/used-drones?grade=${grade}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                selectedGrade === grade
                  ? "bg-indigo-600 text-white"
                  : "bg-zinc-900 text-zinc-400 hover:text-zinc-100"
              }`}
            >
              Grade {grade}
            </Link>
          ))}
        </div>

        <span className="text-xs text-zinc-500">
          Individual units sold on a first-come, first-served basis.
        </span>
      </div>

      {/* Used Drones Grid */}
      <div className="mt-8">
        {usedDrones.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
            <ShieldCheck className="h-10 w-10 text-zinc-700" />
            <p className="mt-3 text-base font-semibold text-zinc-300">
              No certified pre-owned drones currently in this grading tier.
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              New technician-verified builds are inspected and posted weekly.
            </p>
            <Link
              href="/used-drones"
              className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
            >
              View All Certified Drones
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {usedDrones.map((item) => (
              <UsedDroneCard
                key={item.id}
                product={{
                  id: item.id,
                  slug: item.slug,
                  name: item.name,
                  sku: item.sku,
                  basePricePaise: item.basePricePaise,
                  stockQuantity: item.stockQuantity,
                  media: item.media,
                  secondHandDetails: item.secondHandDetails,
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
