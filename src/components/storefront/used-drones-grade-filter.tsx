"use client";

import React from "react";
import Link from "next/link";

interface UsedDronesGradeFilterProps {
  selectedGrade?: "A" | "B" | "C";
  countAll: number;
  countA: number;
  countB: number;
  countC: number;
}

export function UsedDronesGradeFilter({
  selectedGrade,
  countAll,
  countA,
  countB,
  countC,
}: UsedDronesGradeFilterProps) {
  return (
    <div className="mb-8">
      {/* Filter Buttons Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-5">
        <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
          {/* All Units */}
          <Link
            href="/used-drones"
            scroll={false}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs shrink-0 ${
              !selectedGrade
                ? "bg-[#c8f33b] text-black"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            All Certified Units ({countAll})
          </Link>

          {/* Grade A */}
          <Link
            href="/used-drones?grade=A"
            scroll={false}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs shrink-0 ${
              selectedGrade === "A"
                ? "bg-[#c8f33b] text-black"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            Grade A Mint ({countA})
          </Link>

          {/* Grade B */}
          <Link
            href="/used-drones?grade=B"
            scroll={false}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs shrink-0 ${
              selectedGrade === "B"
                ? "bg-[#c8f33b] text-black"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            Grade B Operational ({countB})
          </Link>

          {/* Grade C */}
          <Link
            href="/used-drones?grade=C"
            scroll={false}
            className={`rounded-full px-4 py-2 text-xs font-bold transition-all shadow-2xs shrink-0 ${
              selectedGrade === "C"
                ? "bg-[#c8f33b] text-black"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 hover:text-black"
            }`}
          >
            Grade C Field-Tested ({countC})
          </Link>
        </div>

        <div className="text-xs font-medium text-zinc-500 shrink-0">
          Direct UPI · 10-Minute Reservation Protection
        </div>
      </div>
    </div>
  );
}
