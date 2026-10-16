import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Clock,
  RotateCcw,
  ArrowRight,
  Sliders,
  Check,
} from "lucide-react";
import { getPreOwnedDrones } from "@/server/queries/catalog";
import { UsedDroneCard } from "@/components/storefront/used-drone-card";
import { UsedDronesGradeFilter } from "@/components/storefront/used-drones-grade-filter";

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

  let allPreOwnedDrones: any[] = [];

  try {
    allPreOwnedDrones = await getPreOwnedDrones({
      limit: 60,
    });
  } catch (error) {
    console.warn("[Pre-Owned Drones Query Notice]:", error);
    allPreOwnedDrones = [];
  }

  const countAll = allPreOwnedDrones.length;
  const countA = allPreOwnedDrones.filter(
    (d) => d.secondHandDetails?.cosmeticGrade === "A"
  ).length;
  const countB = allPreOwnedDrones.filter(
    (d) => d.secondHandDetails?.cosmeticGrade === "B"
  ).length;
  const countC = allPreOwnedDrones.filter(
    (d) => d.secondHandDetails?.cosmeticGrade === "C"
  ).length;

  const usedDrones = selectedGrade
    ? allPreOwnedDrones.filter(
        (d) => d.secondHandDetails?.cosmeticGrade === selectedGrade
      )
    : allPreOwnedDrones;

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-5 font-medium">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-black">Pre-Owned Fleet</span>
        </div>

        {/* Hero Certification Banner - Clean White Surface */}
        <div className="overflow-hidden rounded-3xl border border-zinc-200/90 bg-white text-zinc-900 shadow-sm p-6 sm:p-8 lg:p-10 mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="flex flex-col gap-2 sm:gap-3 lg:gap-4 tracking-tight">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-black leading-none">
                  Tested.
                </span>
                <span className="text-5xl sm:text-6xl lg:text-7xl font-black text-black leading-none">
                  Verified.
                </span>
                <span className="text-6xl sm:text-7xl lg:text-8xl font-black text-[#c8f33b] leading-none whitespace-nowrap">
                  Ready to Fly.
                </span>
              </h1>
            </div>

            {/* Right Column: Studio Drone Photography */}
            <div className="lg:col-span-5 hidden lg:block">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-50 shadow-xs">
                <Image
                  src="/images/preowned-slide-1.jpg?v=20261016"
                  alt="Altitude Certified Pre-Owned Drone Fleet"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Grade Filter Tabs & Dropdown Standards */}
        <UsedDronesGradeFilter
          selectedGrade={selectedGrade}
          countAll={countAll}
          countA={countA}
          countB={countB}
          countC={countC}
        />

        {/* Used Drones Grid */}
        <div>
          {usedDrones.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/70 py-14 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white border border-zinc-200 text-zinc-500 mb-3 shadow-2xs">
                <ShieldCheck className="h-6 w-6 text-zinc-600" />
              </div>
              <h3 className="text-base font-bold text-zinc-900">
                {selectedGrade
                  ? `No Certified Grade ${selectedGrade} Aircraft Currently in Stock`
                  : "No Pre-Owned Aircraft Currently in Stock"}
              </h3>
              <p className="mt-1 text-xs text-zinc-500 max-w-md leading-relaxed">
                All certified units in this tier are currently reserved. Our technicians inspect and publish newly cleared aircraft every week.
              </p>
              <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                {selectedGrade && (
                  <Link
                    href="/used-drones"
                    scroll={false}
                    className="rounded-full bg-black px-5 py-2 text-xs font-semibold text-white hover:bg-zinc-800 transition"
                  >
                    View All Pre-Owned Aircraft ({countAll})
                  </Link>
                )}
                <Link
                  href="/consult-pilot"
                  className="rounded-full border border-zinc-200 bg-white px-5 py-2 text-xs font-semibold text-zinc-800 hover:bg-zinc-50 transition"
                >
                  Consult a Pilot
                </Link>
              </div>
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
