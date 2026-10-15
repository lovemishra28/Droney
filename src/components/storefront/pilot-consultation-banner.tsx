"use client";

import React from "react";
import Link from "next/link";
import { Check, Sparkles, ArrowRight, ShieldCheck, Headphones, Clock, Users } from "lucide-react";

export function PilotConsultationBanner() {
  return (
    <section className="bg-white py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1813] p-8 sm:p-12 lg:p-14 text-white shadow-2xl border border-emerald-950">
          
          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#c8f33b]/10 blur-[100px]" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left Column: Heading & Value Proposition */}
            <div className="lg:col-span-6 space-y-6">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/80 px-3.5 py-1 text-xs font-mono font-bold tracking-wider text-emerald-400">
                <Sparkles className="h-3.5 w-3.5 text-[#c8f33b]" />
                <span>EXPERT DRONE ENGINEERS (1-ON-1)</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.1] text-white">
                Not sure what you need?
                <br />
                <span className="text-[#c8f33b]">Let&apos;s figure it out together.</span>
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-xl">
                Whether you&apos;re planning your first aerial cinematography purchase, verifying second-hand flight logs, or spec&apos;ing an enterprise mapping rig – our senior flight pilots provide unbiased guidance.
              </p>

              {/* 3 Value Pillars with Checkmarks */}
              <ul className="space-y-3 pt-2 text-xs sm:text-sm text-zinc-200">
                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900/80 text-[#c8f33b] border border-emerald-700/60">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>Free 20-minute Google Meet or WhatsApp audio call</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900/80 text-[#c8f33b] border border-emerald-700/60">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>Personalized gear list and realistic budget breakdown</span>
                </li>

                <li className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-900/80 text-[#c8f33b] border border-emerald-700/60">
                    <Check className="h-3 w-3 stroke-[3]" />
                  </div>
                  <span>Zero obligation to purchase; pure technical clarity</span>
                </li>
              </ul>
            </div>

            {/* Right Column: Direct Pilot Consultation CTA Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white p-7 sm:p-10 text-black shadow-2xl border border-zinc-100 flex flex-col justify-between space-y-6">
                
                {/* Status Header */}
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Headphones className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-xs font-black tracking-tight text-black block">
                        Altitude Pilot Desk
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">
                        Senior Flight Engineers Active
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-[11px] font-semibold text-emerald-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Slots available today</span>
                  </div>
                </div>

                {/* Consultation Topics Pills */}
                <div>
                  <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-2">
                    Available Specializations
                  </label>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-100 font-medium text-zinc-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Cinematic & 4K/8K Video</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-100 font-medium text-zinc-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>FPV Acro & Tuning</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-100 font-medium text-zinc-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Refurbished Quality Check</span>
                    </div>
                    <div className="flex items-center gap-2 rounded-xl bg-zinc-50 p-2.5 border border-zinc-100 font-medium text-zinc-800">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                      <span>Commercial & Surveying</span>
                    </div>
                  </div>
                </div>

                {/* Prominent Action Button */}
                <div className="pt-2">
                  <Link
                    href="/consult-pilot"
                    className="group flex w-full items-center justify-between rounded-2xl bg-black px-6 py-5 text-white shadow-xl hover:bg-zinc-900 transition-all active:scale-[0.99] border border-zinc-800"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#c8f33b]">
                        Free 20-Min 1-on-1 Session
                      </span>
                      <span className="text-base sm:text-lg font-black tracking-tight text-white mt-0.5 group-hover:text-[#c8f33b] transition-colors">
                        Book Pilot Consultation
                      </span>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c8f33b] text-black group-hover:translate-x-1.5 transition-transform shadow-md">
                      <ArrowRight className="h-5 w-5 stroke-[2.5]" />
                    </div>
                  </Link>
                </div>

                {/* Footer Micro-perks */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-100 pt-3 text-[11px] text-zinc-500">
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Avg. Response &lt; 15 mins</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>100% Technical Guidance</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Users className="h-3.5 w-3.5 text-zinc-400" />
                    <span>Google Meet or WhatsApp</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

