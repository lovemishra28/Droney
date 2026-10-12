"use client";

import React from "react";
import { Star, ShieldCheck, CheckCircle2, Truck, Headphones } from "lucide-react";

export function PilotTestimonialsAndTrust() {
  return (
    <section className="bg-zinc-50 py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Part: Title / Rating on Left + 2 Review Cards on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
          
          {/* Left Column: Heading, Stars & Stats */}
          <div className="lg:col-span-4 space-y-3">
            <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
              VERIFIED PILOT FEEDBACK
            </span>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">
              Trusted by pilots.
              <br />
              Just like you.
            </h2>

            {/* Star Rating */}
            <div className="flex items-center gap-2 pt-1">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="font-mono text-sm font-black text-black">
                4.92 / 5.0
              </span>
            </div>

            <p className="text-xs text-zinc-500 leading-relaxed max-w-sm">
              Over 2,400+ flights airborne across India with documented pilot support.
            </p>
          </div>

          {/* Right Column: 2 Testimonial Cards */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Review 1 */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
              <p className="text-xs leading-relaxed text-zinc-700 italic">
                &ldquo;The honest opinion on the pre-owned Air 2S saved me almost ₹35,000. Battery had only 4 cycles and the gimbal calibration was factory fresh.&rdquo;
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                <div>
                  <h4 className="text-xs font-bold text-black">Vikram S.</h4>
                  <p className="text-[10px] text-zinc-400">Commercial Pilot • Bengaluru</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                  Verified Pilot
                </span>
              </div>
            </div>

            {/* Review 2 */}
            <div className="flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-5 shadow-xs">
              <p className="text-xs leading-relaxed text-zinc-700 italic">
                &ldquo;Finally, a drone shop that actually knows FPV tuning. Scheduled a video session with their tech lead and fixed my PID motor oscillations within 15 mins.&rdquo;
              </p>

              <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                <div>
                  <h4 className="text-xs font-bold text-black">Karan R.</h4>
                  <p className="text-[10px] text-zinc-400">Cinematic FPV Creator • Mumbai</p>
                </div>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-800">
                  FPV Racer
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Part: 4 Trust Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-10 border-t border-zinc-200/80">
          
          {/* Pillar 1 */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black">32-Point Inspection</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Every pre-owned drone undergoes flight, IMU, and sensor stress tests.
              </p>
            </div>
          </div>

          {/* Pillar 2 */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black">100% Genuine OEM</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Direct authorized components, propellers, and sealed batteries.
              </p>
            </div>
          </div>

          {/* Pillar 3 */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <Truck className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black">Insured Express Transit</h3>
              <p className="mt-1 text-[11px] leading-relaxed text-zinc-500">
                Air cargo delivery with transit insurance across all Indian pincodes.
              </p>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-black text-[#c8f33b]">
              <Headphones className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-black">Pilot Tele-Support</h3>
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
