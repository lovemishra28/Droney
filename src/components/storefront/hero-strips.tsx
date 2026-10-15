"use client";

import React from "react";
import {
  ShieldCheck,
  Truck,
  CheckCircle2,
  Wrench,
  RotateCcw,
} from "lucide-react";

export function HeroStrips() {
  return (
    <section className="w-full py-5 sm:py-7 lg:py-8 bg-white" aria-label="Altitude Quality Guarantees">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-zinc-200/90 bg-[#fafafa] px-5 py-4 sm:px-6 sm:py-4.5 shadow-2xs">
          <div className="flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-0.5">
            {/* Pill 1: 100% Genuine */}
            <div className="flex items-center gap-2.5 shrink-0 pr-4 sm:pr-6 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shrink-0 shadow-2xs">
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
            <div className="flex items-center gap-2.5 shrink-0 pr-4 sm:pr-6 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shrink-0 shadow-2xs">
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

            {/* Pill 3: DJI Authorised Retailer */}
            <div className="flex items-center gap-2.5 shrink-0 pr-4 sm:pr-6 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shrink-0 shadow-2xs">
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

            {/* Pill 4: In-House Flight Lab */}
            <div className="flex items-center gap-2.5 shrink-0 pr-4 sm:pr-6 border-r border-zinc-200/80">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shrink-0 shadow-2xs">
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

            {/* Pill 5: Easy Returns */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-700 shrink-0 shadow-2xs">
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
    </section>
  );
}
