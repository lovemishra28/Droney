"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Wrench,
  RotateCcw,
  X,
  ArrowRight,
} from "lucide-react";

export function HeroStrips() {
  const [alertDismissed, setAlertDismissed] = useState(false);

  return (
    <div className="w-full">
      {/* 1. Live Alert / Announcement Strip */}
      {!alertDismissed && (
        <div className="w-full bg-zinc-950 text-zinc-300 text-xs border-b border-zinc-800 py-2 transition-all">
          <div className="mx-auto flex max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2.5 truncate pr-4">
              <span className="inline-flex items-center rounded-sm bg-[#c8f33b]/15 border border-[#c8f33b]/40 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c8f33b]">
                LIVE
              </span>
              <span className="truncate text-[11px] sm:text-xs text-zinc-300">
                DJI Air 3S & Avata 2 now airborne: Pre-book now for exclusive flight packs and fast-track shipping
              </span>
              <Link
                href="/catalog?category=drones"
                className="hidden sm:inline-flex items-center gap-1 font-bold text-[#c8f33b] hover:underline text-[11px] sm:text-xs shrink-0"
              >
                <span>View</span>
                <ArrowRight className="h-3 w-3 stroke-[2.5]" />
              </Link>
            </div>

            <button
              type="button"
              onClick={() => setAlertDismissed(true)}
              aria-label="Dismiss alert"
              className="text-zinc-500 hover:text-white transition shrink-0 p-0.5 rounded hover:bg-zinc-800"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* 2. 6 Trust / Value Proposition Pills Strip */}
      <div className="w-full bg-white border-b border-zinc-200/90 py-2 sm:py-2.5 shadow-2xs">
        <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-1">
            {/* Pill 1: 100% Genuine */}
            <div className="flex items-center gap-2.5 shrink-0 pr-3 sm:pr-4 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 shrink-0">
                <ShieldCheck className="h-3.5 w-3.5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wide text-black uppercase font-mono leading-tight">
                  100% GENUINE
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  GST invoice included
                </span>
              </div>
            </div>

            {/* Pill 2: Pan-India Delivery */}
            <div className="flex items-center gap-2.5 shrink-0 pr-3 sm:pr-4 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 shrink-0">
                <Truck className="h-3.5 w-3.5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wide text-black uppercase font-mono leading-tight">
                  PAN-INDIA DELIVERY
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  Insured air transit
                </span>
              </div>
            </div>

            {/* Pill 4: DJI Authorised Retailer */}
            <div className="flex items-center gap-2.5 shrink-0 pr-3 sm:pr-4 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wide text-black uppercase font-mono leading-tight">
                  DJI AUTHORISED RETAILER
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  1-year software warranty
                </span>
              </div>
            </div>

            {/* Pill 5: In-House Flight Lab */}
            <div className="flex items-center gap-2.5 shrink-0 pr-3 sm:pr-4 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 shrink-0">
                <Wrench className="h-3.5 w-3.5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wide text-black uppercase font-mono leading-tight">
                  IN-HOUSE FLIGHT LAB
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  32-point inspection passed
                </span>
              </div>
            </div>

            {/* Pill 6: Easy Returns */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-zinc-700 shrink-0">
                <RotateCcw className="h-3.5 w-3.5 text-black" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black tracking-wide text-black uppercase font-mono leading-tight">
                  EASY RETURNS
                </span>
                <span className="text-[10px] text-zinc-500 leading-tight">
                  7-day easy return policy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
