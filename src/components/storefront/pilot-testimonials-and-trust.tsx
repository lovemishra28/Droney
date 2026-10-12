"use client";

import React from "react";
import { ShieldCheck, CheckCircle2, Truck, Headphones } from "lucide-react";

export function PilotTestimonialsAndTrust() {
  return (
    <section className="bg-zinc-50 py-10 sm:py-14 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        {/* 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Pillar 1 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-wide">32-Point Inspection</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Every pre-owned drone undergoes flight, IMU, and sensor stress tests.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <CheckCircle2 className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-wide">100% Genuine OEM</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Direct authorized components, propellers, and sealed batteries.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <Truck className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-wide">Insured Express Transit</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Air cargo delivery with transit insurance across all Indian pincodes.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-start gap-3 rounded-2xl border border-zinc-200/70 bg-white p-5 shadow-xs">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <Headphones className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black uppercase tracking-wide">Pilot Tele-Support</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Free first-flight pairing and firmware setup with our drone team.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
