"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Radio, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Award, 
  Sparkles, 
  Send,
  PhoneCall,
  ShieldCheck,
  ChevronRight
} from "lucide-react";

import { submitConsultationAction } from "@/server/actions/inquiries";

export default function ConsultPilotPage() {
  const [topic, setTopic] = useState("fpv-tuning");
  const [pilotLevel, setPilotLevel] = useState("intermediate");
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    droneModel: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const res = await submitConsultationAction({
      fullName: formData.fullName,
      phone: formData.phone,
      topic,
      pilotLevel,
      droneModel: formData.droneModel,
      notes: formData.notes,
    });

    setIsPending(false);
    if (res.success) {
      setSubmitted(true);
    } else {
      setErrorMsg(res.message || "Failed to submit request");
    }
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-black">Consult Pilot</span>
        </div>

        {/* Hero Header */}
        <div className="border-b border-zinc-200 pb-8 mb-10 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 font-mono uppercase tracking-widest">
            <Radio className="h-3.5 w-3.5" />
            <span>ALTITUDE PILOT DESK · DIRECT LINE</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-black">
            Consult a Certified UAV Pilot
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-xl mx-auto">
            Book a 1-on-1 technical session with Altitude’s chief flight engineers for FPV rate tuning, cinema camera gimbal calibration, or DGCA commercial flight clearance.
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          {submitted ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 sm:p-12 text-center space-y-4 shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-black">Consultation Request Dispatched</h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                Our Senior Flight Specialist will contact you at <strong className="text-black font-mono font-bold">{formData.phone || "+91 98765 43210"}</strong> within 2 business hours to confirm your video briefing slot.
              </p>
              <div className="pt-4">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-sm font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
                >
                  Return to Hardware Catalog
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-10 space-y-8 shadow-lg">
              {/* 1. Consultation Focus */}
              <div>
                <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase mb-3 block">
                  1. Select Technical Focus
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "fpv-tuning", title: "Betaflight PID & Blackbox Tuning", desc: "Filter resonance, propwash, and flight feel" },
                    { id: "cinema-rigs", title: "Heavy-Lift & Cinema Gimbals", desc: "DJI Ronin / RED / BMPCC vibration isolation" },
                    { id: "survey-mapping", title: "Industrial Mapping & LiDAR", desc: "RTK survey workflows and waypoint planning" },
                    { id: "dgca-compliance", title: "DGCA Type Certification & NPNT", desc: "Indian regulatory airspace and pilot licensing" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setTopic(item.id)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        topic === item.id
                          ? "border-black bg-black text-white shadow-xs"
                          : "border-zinc-200 bg-zinc-50 text-zinc-800 hover:border-zinc-300 hover:bg-zinc-100"
                      }`}
                    >
                      <div className="font-bold text-sm">{item.title}</div>
                      <div className={`text-xs mt-1 ${topic === item.id ? "text-zinc-300" : "text-zinc-500"}`}>{item.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. Pilot Experience Level */}
              <div>
                <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase mb-3 block">
                  2. Your Flight Experience
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "beginner", label: "Beginner (< 20 hrs)" },
                    { id: "intermediate", label: "Intermediate (20-100 hrs)" },
                    { id: "pro", label: "Commercial / Pro (100+ hrs)" },
                  ].map((lvl) => (
                    <button
                      type="button"
                      key={lvl.id}
                      onClick={() => setPilotLevel(lvl.id)}
                      className={`rounded-xl border py-2.5 px-3 text-xs font-bold transition-all shadow-xs ${
                        pilotLevel === lvl.id
                          ? "border-black bg-black text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100"
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Contact & Flight Platform Details */}
              <div className="space-y-4">
                <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase block">
                  3. Pilot & Airframe Particulars
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-zinc-600 block mb-1">Your Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aryan Sharma"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600 block mb-1">10-Digit Mobile Number (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      pattern="[0-9]{10}"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Current Drone / Flight Controller Model</label>
                  <input
                    type="text"
                    placeholder="e.g. DJI Air 3S, Nazgul5 V3 HD, or Custom 7-Inch"
                    value={formData.droneModel}
                    onChange={(e) => setFormData({ ...formData, droneModel: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none shadow-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-zinc-600 block mb-1">Technical Questions / Issue Description</label>
                  <textarea
                    rows={3}
                    placeholder="Describe flight instability, yaw twitch, video dropout, or desired camera payload specifications..."
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2.5 text-sm text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                {errorMsg && (
                  <div className="mb-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                    {errorMsg}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isPending}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 font-bold text-black transition-all hover:bg-[#b8e530] active:scale-95 shadow-xs disabled:opacity-50"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>
                    {isPending ? "Transmitting Request..." : "Confirm Pilot Consultation Request"}
                  </span>
                </button>
                <p className="mt-2.5 text-center text-[11px] text-zinc-500">
                  Complimentary 20-minute diagnostic session for all verified Altitude platform members.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
