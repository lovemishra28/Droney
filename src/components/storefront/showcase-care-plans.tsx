"use client";

import React from "react";
import { ShieldCheck, Check, Zap, AlertCircle } from "lucide-react";

export function ShowcaseCarePlans() {
  return (
    <section className="w-full bg-black text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f33b]/15 border border-[#c8f33b]/30 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-[#c8f33b]">
            <Zap className="h-3.5 w-3.5 text-[#c8f33b]" />
            <span>ALTITUDE SHIELD PROTECTION</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Fly free with Care.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            Comprehensive accidental damage, water impact, and crash replacement coverage for complete airborne peace of mind.
          </p>
        </div>

        {/* 2-Card Grid */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          
          {/* Card 1: 1-Year Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6 sm:p-8 hover:border-zinc-700 transition shadow-xl">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-zinc-400 uppercase tracking-wider">
                  Tier 1 Cover
                </span>
                <span className="rounded-full bg-zinc-800 px-3 py-0.5 text-xs font-mono font-bold text-white">
                  1-Year Plan
                </span>
              </div>

              <h3 className="text-2xl font-black text-white">
                Care Refresh 1Y
              </h3>

              <div className="flex items-baseline gap-2 pt-1 font-mono">
                <span className="text-3xl font-black text-[#c8f33b]">₹8,499</span>
                <span className="text-xs text-zinc-400">/ 12 months</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Up to 2 affordable replacements within 1 year</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Includes 1 Flyaway incident coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Water damage & collision coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Free express return shipping within India</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-zinc-500 block">
                Selectable at checkout in commercial add-ons
              </span>
            </div>
          </div>

          {/* Card 2: 2-Year Plan */}
          <div className="flex flex-col justify-between rounded-2xl border-2 border-[#c8f33b] bg-zinc-900/70 p-6 sm:p-8 hover:shadow-2xl transition shadow-xl relative">
            <span className="absolute -top-3 right-6 rounded-full bg-[#c8f33b] px-3 py-0.5 text-[10px] font-black font-mono uppercase text-black">
              Recommended for Pros
            </span>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-[#c8f33b] uppercase tracking-wider">
                  Tier 2 Pro Cover
                </span>
                <span className="rounded-full bg-[#c8f33b]/20 text-[#c8f33b] border border-[#c8f33b]/40 px-3 py-0.5 text-xs font-mono font-bold">
                  2-Year Plan
                </span>
              </div>

              <h3 className="text-2xl font-black text-white">
                Care Refresh 2Y + AMC
              </h3>

              <div className="flex items-baseline gap-2 pt-1 font-mono">
                <span className="text-3xl font-black text-[#c8f33b]">₹14,999</span>
                <span className="text-xs text-zinc-400">/ 24 months</span>
              </div>

              <ul className="space-y-2.5 pt-4 border-t border-zinc-800/80 text-xs text-zinc-300">
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Up to 4 replacements within 2 years</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Includes 2 Flyaway incidents coverage</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Annual preventive bench inspection & sensor tune-up</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-[#c8f33b] shrink-0" />
                  <span>Official factory warranty extension to 24 months</span>
                </li>
              </ul>
            </div>

            <div className="pt-6 mt-6 border-t border-zinc-800">
              <span className="text-[11px] font-mono text-[#c8f33b] block font-semibold">
                ✓ Full commercial policy invoice provided
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
