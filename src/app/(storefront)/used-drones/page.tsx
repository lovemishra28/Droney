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
            url: "/placeholders/drone-placeholder.svg",
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
            url: "/placeholders/drone-placeholder.svg",
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
            url: "/placeholders/drone-placeholder.svg",
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
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-black">Pre-Owned Fleet</span>
        </div>

        {/* Hero Certification Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-black text-white p-8 sm:p-12 shadow-lg mb-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-1 text-xs font-bold text-emerald-400 font-mono">
              <ShieldCheck className="h-4 w-4" />
              <span>ALTITUDE CERTIFIED PRE-OWNED FLEET</span>
            </div>

            <h1 className="mt-5 text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Bench-Tested Drones with Verified Flight Logs
            </h1>

            <p className="mt-3 text-sm leading-relaxed text-zinc-300">
              Every pre-owned drone undergoes a 32-point technician bench inspection, motor bearing vibration analysis, and battery telemetry cycle check before dispatch.
            </p>
          </div>

          {/* Inspection Grading Tiers Info Grid */}
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 font-mono">
                <Sparkles className="h-4 w-4" />
                <span>Grade A (Mint Tier)</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Under 5 logged flight hours, pristine airframe, zero crash or repair records.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 font-mono">
                <CheckCircle2 className="h-4 w-4" />
                <span>Grade B (Operational)</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Minor cosmetic prop scuffs, 100% factory original electronics, under 20 battery cycles.
              </p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-400 font-mono">
                <ShieldCheck className="h-4 w-4" />
                <span>Grade C (Field-Tested)</span>
              </div>
              <p className="mt-1.5 text-xs text-zinc-400 leading-relaxed">
                Refurbished arms/ESCs, passed complete autonomous GPS and stability flight test.
              </p>
            </div>
          </div>
        </div>

        {/* Grade Filter Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-5 mb-8">
          <div className="flex items-center gap-2">
            <Link
              href="/used-drones"
              className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                !selectedGrade
                  ? "bg-black text-white"
                  : "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              All Certified Units ({usedDrones.length})
            </Link>

            {(["A", "B", "C"] as const).map((grade) => (
              <Link
                key={grade}
                href={`/used-drones?grade=${grade}`}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-xs ${
                  selectedGrade === grade
                    ? "bg-black text-white"
                    : "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                }`}
              >
                Grade {grade}
              </Link>
            ))}
          </div>

          <span className="text-xs font-medium text-zinc-500 font-mono">
            Direct UPI • 10-Minute Reservation Protection
          </span>
        </div>

        {/* Used Drones Grid */}
        <div>
          {usedDrones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center">
              <ShieldCheck className="h-10 w-10 text-zinc-400" />
              <p className="mt-3 text-base font-bold text-black">
                No certified pre-owned drones currently in this grading tier.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                New technician-verified builds are inspected and posted weekly.
              </p>
              <Link
                href="/used-drones"
                className="mt-4 rounded-full bg-[#c8f33b] px-5 py-2 text-xs font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
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
    </div>
  );
}
