"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  Radio, 
  CheckCircle2, 
  PhoneCall, 
  ShieldCheck, 
  Sliders, 
  Video, 
  Layers, 
  ArrowRight,
  ArrowLeft,
  Plane,
  Compass,
  Award,
  Check
} from "lucide-react";

import { submitConsultationAction } from "@/server/actions/inquiries";

const TOPICS = [
  {
    id: "fpv-tuning",
    title: "Betaflight & PID Tuning",
    tagline: "Propwash, rates & motor filters",
    badge: "EdgeTX / FPV",
    icon: Sliders,
  },
  {
    id: "cinema-rigs",
    title: "Cinema Gimbals & Rigs",
    tagline: "Vibration isolation & balance",
    badge: "Ronin / RED / FX6",
    icon: Video,
  },
  {
    id: "survey-mapping",
    title: "Industrial & LiDAR",
    tagline: "RTK survey & autonomous grids",
    badge: "Geospatial / RTK",
    icon: Layers,
  },
  {
    id: "dgca-compliance",
    title: "DGCA Compliance",
    tagline: "NPNT, airspace & pilot licensing",
    badge: "Digital Sky / India",
    icon: ShieldCheck,
  },
];

const EXPERIENCE_LEVELS = [
  {
    id: "beginner",
    title: "Novice Flier",
    hours: "< 20h Flight Time",
    hint: "Setup, safety & flight basics",
    icon: Plane,
  },
  {
    id: "intermediate",
    title: "Active Pilot",
    hours: "20 – 100h Flight Time",
    hint: "Rate tuning, acro & payloads",
    icon: Compass,
  },
  {
    id: "pro",
    title: "Commercial Operator",
    hours: "100h+ Flight Time",
    hint: "Heavy rigs, survey & compliance",
    icon: Award,
  },
];

export default function ConsultPilotPage() {
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
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

  const selectedTopic = TOPICS.find((t) => t.id === topic) || TOPICS[0];
  const selectedLevel = EXPERIENCE_LEVELS.find((l) => l.id === pilotLevel) || EXPERIENCE_LEVELS[1];

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
    <div className="min-h-screen bg-white text-zinc-900 py-4 sm:py-6">
      <div className="w-full max-w-[1520px] mx-auto px-4 sm:px-8 lg:px-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-3 font-medium">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <span>/</span>
          <span className="font-semibold text-zinc-900">Consult Pilot</span>
        </div>

        {/* Compact Hero Banner */}
        <div className="rounded-2xl sm:rounded-3xl border border-zinc-200/90 bg-white p-4 sm:p-6 lg:py-5 lg:px-8 shadow-xs mb-5">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center">
            {/* Left: Compact Heading */}
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-zinc-900 leading-[1.08]">
                Direct Line.
                <br />
                Bench Tuned.
                <br />
                <span className="text-[#84cc16]">Consult a UAV Pilot.</span>
              </h1>
            </div>

            {/* Right: Compact Consult Photo Container */}
            <div className="lg:col-span-5 flex justify-end">
              <div className="relative w-full h-[170px] sm:h-[190px] lg:h-[200px] rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200/80 bg-zinc-100 shadow-xs group">
                <Image
                  src="/images/consult-pilot-hero.jpg"
                  alt="Consult a Certified UAV Pilot - Direct Bench Station"
                  fill
                  priority
                  className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 42vw"
                />
              </div>
            </div>
          </div>
        </div>

        {submitted ? (
          <div className="rounded-3xl border border-zinc-200 bg-white p-10 sm:p-16 text-center space-y-5 shadow-sm max-w-xl mx-auto my-12">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <h2 className="text-2xl font-bold text-zinc-900">
              Consultation Request Dispatched
            </h2>
            <p className="text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
              Our Senior Flight Specialist will contact you at{" "}
              <span className="font-bold text-black font-mono">
                {formData.phone || "+91 98765 43210"}
              </span>{" "}
              within 2 business hours.
            </p>
            <div className="pt-3">
              <Link
                href="/catalog"
                className="inline-flex items-center gap-2 rounded-xl bg-black px-6 py-3 text-sm font-bold text-white hover:bg-zinc-800 transition"
              >
                <span>Return to Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-8">
            {/* FULL PAGE WIDTH CHECKPOINT STEPPER: Only 1, 2, 3 */}
            <div className="relative w-full py-6">
              {/* Inactive Base Track Line */}
              <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2 h-[3px] bg-zinc-200 z-0" />

              {/* Active Completed Progress Line - Smoothly moves forward on step change */}
              <div
                className="absolute top-1/2 left-6 -translate-y-1/2 h-[3px] bg-black transition-all duration-500 ease-out z-0"
                style={{
                  width:
                    currentStep === 1
                      ? "0%"
                      : currentStep === 2
                      ? "calc(50% - 24px)"
                      : "calc(100% - 48px)",
                }}
              />

              {/* Checkpoint Nodes Across Full Width */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Checkpoint 1 */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="relative flex items-center justify-center focus:outline-none group cursor-pointer"
                  aria-label="Step 1"
                >
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-mono font-bold transition-all duration-300 ${
                      currentStep > 1
                        ? "bg-black text-[#c8f33b] shadow-xs"
                        : currentStep === 1
                        ? "bg-black text-white ring-4 ring-[#c8f33b] shadow-md scale-105"
                        : "bg-white border-2 border-zinc-300 text-zinc-400 group-hover:border-zinc-500 group-hover:text-zinc-600"
                    }`}
                  >
                    {currentStep > 1 ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      "1"
                    )}
                  </div>
                </button>

                {/* Checkpoint 2 */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="relative flex items-center justify-center focus:outline-none group cursor-pointer"
                  aria-label="Step 2"
                >
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-mono font-bold transition-all duration-300 ${
                      currentStep > 2
                        ? "bg-black text-[#c8f33b] shadow-xs"
                        : currentStep === 2
                        ? "bg-black text-white ring-4 ring-[#c8f33b] shadow-md scale-105"
                        : "bg-white border-2 border-zinc-300 text-zinc-400 group-hover:border-zinc-500 group-hover:text-zinc-600"
                    }`}
                  >
                    {currentStep > 2 ? (
                      <Check className="h-5 w-5 stroke-[2.5]" />
                    ) : (
                      "2"
                    )}
                  </div>
                </button>

                {/* Checkpoint 3 */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="relative flex items-center justify-center focus:outline-none group cursor-pointer"
                  aria-label="Step 3"
                >
                  <div
                    className={`flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-full text-sm sm:text-base font-mono font-bold transition-all duration-300 ${
                      currentStep === 3
                        ? "bg-black text-white ring-4 ring-[#c8f33b] shadow-md scale-105"
                        : "bg-white border-2 border-zinc-300 text-zinc-400 group-hover:border-zinc-500 group-hover:text-zinc-600"
                    }`}
                  >
                    3
                  </div>
                </button>
              </div>
            </div>

            {/* Content Card (Expanded to Wide Page Ratio) */}
            <div className="rounded-3xl border border-zinc-200/90 bg-white p-6 sm:p-10 lg:p-12 shadow-xs">
              {/* STEP 1: Technical Focus */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Step 1 of 3
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                        Select Technical Focus
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      Choose your flight or engineering discipline
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
                    {TOPICS.map((item) => {
                      const isSelected = topic === item.id;
                      const IconComponent = item.icon;

                      return (
                        <div
                          key={item.id}
                          onClick={() => setTopic(item.id)}
                          className={`relative rounded-2xl p-6 sm:p-7 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[180px] ${
                            isSelected
                              ? "border-2 border-black bg-zinc-50 shadow-xs ring-1 ring-black/5"
                              : "border border-zinc-200/90 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className={`flex h-11 w-11 items-center justify-center rounded-xl transition-colors ${
                                isSelected
                                  ? "bg-black text-[#c8f33b]"
                                  : "bg-zinc-100 text-zinc-700"
                              }`}
                            >
                              <IconComponent className="h-5 w-5" />
                            </div>

                            {isSelected ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-black bg-[#c8f33b] px-2.5 py-1 rounded-md font-mono">
                                ✓ Selected
                              </span>
                            ) : (
                              <span className="text-[11px] font-mono text-zinc-400 font-medium">
                                {item.badge}
                              </span>
                            )}
                          </div>

                          <div className="mt-4">
                            <h3 className="text-base sm:text-lg font-bold text-zinc-900">
                              {item.title}
                            </h3>
                            <p className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
                              {item.tagline}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
                    <span className="text-xs sm:text-sm text-zinc-500 font-mono">
                      Selected: <strong className="text-zinc-900">{selectedTopic.title}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-sm sm:text-base transition-all shadow-xs active:scale-95"
                    >
                      <span>Continue to Step 2</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: Flight Experience Level */}
              {currentStep === 2 && (
                <div className="space-y-8">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Step 2 of 3
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                        Your Flight Experience
                      </h2>
                    </div>
                    <span className="text-xs text-zinc-400 font-mono">
                      Calibrates technical depth and pilot pairing
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {EXPERIENCE_LEVELS.map((lvl) => {
                      const isSelected = pilotLevel === lvl.id;
                      const LevelIcon = lvl.icon;

                      return (
                        <div
                          key={lvl.id}
                          onClick={() => setPilotLevel(lvl.id)}
                          className={`rounded-2xl p-6 sm:p-8 text-left transition-all duration-150 cursor-pointer flex flex-col justify-between min-h-[180px] ${
                            isSelected
                              ? "border-2 border-black bg-zinc-50 shadow-xs ring-1 ring-black/5"
                              : "border border-zinc-200/90 bg-white hover:border-zinc-300 hover:bg-zinc-50/50"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-xs font-mono font-bold uppercase tracking-wider ${
                                isSelected ? "text-zinc-900 font-bold" : "text-zinc-500"
                              }`}
                            >
                              {lvl.hours}
                            </span>
                            {isSelected ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-[#c8f33b] text-xs font-bold">
                                ✓
                              </span>
                            ) : (
                              <LevelIcon className="h-5 w-5 text-zinc-400" />
                            )}
                          </div>

                          <div className="mt-4">
                            <div className="text-base sm:text-lg font-bold text-zinc-900">
                              {lvl.title}
                            </div>
                            <div className="text-xs sm:text-sm text-zinc-500 mt-1 leading-snug">
                              {lvl.hint}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(1)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-black transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Step 1</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-zinc-800 text-white font-bold py-3.5 px-8 text-sm sm:text-base transition-all shadow-xs active:scale-95"
                    >
                      <span>Continue to Step 3</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Pilot & Airframe Particulars Form */}
              {currentStep === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-100 pb-5 gap-2">
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
                        Step 3 of 3
                      </span>
                      <h2 className="text-xl sm:text-2xl font-bold text-zinc-900 mt-1">
                        Pilot & Airframe Details
                      </h2>
                    </div>
                    <span className="text-xs font-mono text-zinc-700 bg-zinc-100 px-3 py-1 rounded-md font-semibold">
                      Final Step
                    </span>
                  </div>

                  {/* Summary of Choices */}
                  <div className="flex flex-wrap items-center gap-2.5 text-xs sm:text-sm font-mono text-zinc-500 bg-zinc-50 p-3 rounded-xl border border-zinc-200/60">
                    <span className="font-bold text-zinc-700">Selected:</span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                      ✓ {selectedTopic.title}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-bold text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-200">
                      ✓ {selectedLevel.title}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-zinc-800 block mb-1.5">
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Aryan Sharma"
                        value={formData.fullName}
                        onChange={(e) =>
                          setFormData({ ...formData, fullName: e.target.value })
                        }
                        className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white px-4 py-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black shadow-2xs transition"
                      />
                    </div>

                    <div>
                      <label className="text-xs sm:text-sm font-semibold text-zinc-800 block mb-1.5">
                        WhatsApp Phone Number <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold font-mono text-zinc-400">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          pattern="[0-9]{10}"
                          placeholder="9876543210"
                          value={formData.phone}
                          onChange={(e) =>
                            setFormData({ ...formData, phone: e.target.value })
                          }
                          className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white pl-14 pr-4 py-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black shadow-2xs transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-zinc-800 block mb-1.5">
                      Current Drone / FC Model{" "}
                      <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. DJI Air 3S, Nazgul5, or Custom 7-Inch"
                      value={formData.droneModel}
                      onChange={(e) =>
                        setFormData({ ...formData, droneModel: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white px-4 py-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black shadow-2xs transition"
                    />
                  </div>

                  <div>
                    <label className="text-xs sm:text-sm font-semibold text-zinc-800 block mb-1.5">
                      Specific Questions / Issues{" "}
                      <span className="text-zinc-400 font-normal">(Optional)</span>
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Describe instability, tuning goals, or desired payload..."
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      className="w-full rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-white focus:bg-white px-4 py-3 text-sm sm:text-base text-zinc-900 placeholder:text-zinc-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black shadow-2xs transition resize-none"
                    />
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs sm:text-sm font-semibold text-rose-800">
                      {errorMsg}
                    </div>
                  )}

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-100">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(2)}
                      className="inline-flex items-center gap-2 text-sm font-bold text-zinc-600 hover:text-black transition"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      <span>Back to Step 2</span>
                    </button>

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#c8f33b] hover:bg-[#b8e530] text-black py-4 px-10 font-bold text-sm sm:text-base transition-all shadow-xs active:scale-95 disabled:opacity-50"
                    >
                      <PhoneCall className="h-5 w-5" />
                      <span>
                        {isPending
                          ? "Transmitting Request..."
                          : "Confirm Pilot Consultation"}
                      </span>
                    </button>
                  </div>

                  <p className="text-center text-xs text-zinc-400 pt-1">
                    Complimentary 20-minute session · WhatsApp callback within 2 hours
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
