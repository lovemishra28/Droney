"use client";

import React, { useState } from "react";
import { Check, CheckCircle2, Calendar, Clock, Phone, User, Sparkles, ArrowRight } from "lucide-react";
import { bookPilotConsultation, type ConsultationResult } from "@/server/actions/consultation";

const CONSULT_TYPES = [
  "First Drone",
  "Pre-Owned",
  "Custom FPV",
  "Commercial",
] as const;

export function PilotConsultationBanner() {
  const [selectedType, setSelectedType] = useState<typeof CONSULT_TYPES[number]>("First Drone");
  const [preferredDate, setPreferredDate] = useState("Tomorrow (11:00 AM - 4:00 PM IST)");
  const [timeSlot, setTimeSlot] = useState("11:30 AM IST");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ConsultationResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;

    setIsSubmitting(true);
    try {
      const res = await bookPilotConsultation({
        consultationType: selectedType,
        preferredDate,
        timeSlot,
        fullName,
        phone,
      });
      setResult(res);
    } catch (err: any) {
      setResult({
        success: false,
        message: err?.message || "Booking failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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

            {/* Right Column: Interactive Booking Card */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-white p-6 sm:p-8 text-black shadow-2xl border border-zinc-100">
                
                {result?.success ? (
                  /* Success State */
                  <div className="py-8 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-400">
                        CONFIRMATION ID: {result.referenceId}
                      </span>
                      <h3 className="mt-1 text-2xl font-black text-black">
                        Flight Consultation Reserved!
                      </h3>
                      <p className="mt-2 text-xs text-zinc-600 max-w-sm mx-auto leading-relaxed">
                        {result.message}
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="button"
                        onClick={() => setResult(null)}
                        className="rounded-full border border-zinc-200 bg-zinc-50 px-5 py-2 text-xs font-bold text-black hover:bg-zinc-100 transition"
                      >
                        Book Another Session
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Interactive Form */
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Card Header */}
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                      <span className="text-xs font-bold tracking-tight text-black">
                        Select Consultation Type
                      </span>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>Slots available today</span>
                      </div>
                    </div>

                    {/* Consultation Type Selector Pills */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {CONSULT_TYPES.map((type) => {
                        const isSelected = selectedType === type;
                        return (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setSelectedType(type)}
                            className={`rounded-xl py-2 px-2 text-xs font-bold text-center transition-all ${
                              isSelected
                                ? "bg-black text-white shadow-xs"
                                : "bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
                            }`}
                          >
                            {type}
                          </button>
                        );
                      })}
                    </div>

                    {/* Row 1: Preferred Date & Time Slot */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                          PREFERRED DATE
                        </label>
                        <select
                          value={preferredDate}
                          onChange={(e) => setPreferredDate(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-black focus:border-black focus:outline-none"
                        >
                          <option>Tomorrow (11:00 AM - 4:00 PM IST)</option>
                          <option>Wednesday (10:00 AM - 2:00 PM IST)</option>
                          <option>Thursday (2:00 PM - 6:00 PM IST)</option>
                          <option>Friday (11:00 AM - 5:00 PM IST)</option>
                          <option>Saturday (Weekend Flight Desk)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                          TIME SLOT
                        </label>
                        <select
                          value={timeSlot}
                          onChange={(e) => setTimeSlot(e.target.value)}
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-black focus:border-black focus:outline-none"
                        >
                          <option>11:30 AM IST</option>
                          <option>1:00 PM IST</option>
                          <option>3:30 PM IST</option>
                          <option>5:00 PM IST</option>
                        </select>
                      </div>
                    </div>

                    {/* Row 2: Name & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                          YOUR NAME
                        </label>
                        <input
                          type="text"
                          required
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Aarav Sharma"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-black placeholder-zinc-400 focus:border-black focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-500 mb-1">
                          WHATSAPP / PHONE
                        </label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2.5 text-xs font-medium text-black placeholder-zinc-400 focus:border-black focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-black py-3.5 text-xs font-black uppercase tracking-wider text-white shadow-md hover:bg-zinc-800 transition active:scale-98 disabled:opacity-50"
                      >
                        <span>{isSubmitting ? "Reserving Slot..." : "CONFIRM PILOT CONSULTATION"}</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {result?.message && !result.success && (
                      <p className="text-center text-xs text-rose-600 font-medium">
                        {result.message}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
