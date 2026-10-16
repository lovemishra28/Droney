"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  RefreshCw, 
  ShieldCheck, 
  Truck, 
  Banknote, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  ChevronRight
} from "lucide-react";

const DRONE_MODELS = [
  { id: "mini-3-pro", name: "DJI Mini 3 Pro (Fly More)", baseValuationInr: 42000 },
  { id: "air-2s", name: "DJI Air 2S 5.4K Combo", baseValuationInr: 48000 },
  { id: "mavic-3-classic", name: "DJI Mavic 3 Classic", baseValuationInr: 68000 },
  { id: "mini-4-pro", name: "DJI Mini 4 Pro with RC 2", baseValuationInr: 56000 },
  { id: "avata-1", name: "DJI Avata Explorer Combo", baseValuationInr: 45000 },
  { id: "fpv-5-custom", name: "Custom 5-Inch 6S FPV Drone", baseValuationInr: 28000 },
];

import { submitTradeInAction } from "@/server/actions/inquiries";

export default function TradeInValuationPage() {
  const [selectedDrone, setSelectedDrone] = useState(DRONE_MODELS[0]);
  const [condition, setCondition] = useState("mint");
  const [batteryCount, setBatteryCount] = useState(3);
  const [hasRcWithScreen, setHasRcWithScreen] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    city: "Bengaluru",
    pincode: "",
  });

  // Calculate estimated payout
  const conditionMultiplier = condition === "mint" ? 1.05 : condition === "good" ? 0.92 : 0.8;
  const batteryBonus = (batteryCount - 1) * 3500;
  const screenBonus = hasRcWithScreen ? 6000 : 0;
  const totalValuation = Math.round((selectedDrone.baseValuationInr * conditionMultiplier + batteryBonus + screenBonus) / 100) * 100;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsPending(true);
    setErrorMsg(null);

    const res = await submitTradeInAction({
      name: formData.name,
      phone: formData.phone,
      city: formData.city,
      pincode: formData.pincode || "560001",
      droneModel: selectedDrone.name,
      condition,
      batteryCount,
      hasRcWithScreen,
      estimatedValuationInr: totalValuation,
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
          <span className="font-semibold text-black">Trade-In</span>
        </div>

        {/* Header Banner */}
        <div className="border-b border-zinc-200 pb-8 mb-10 text-center max-w-3xl mx-auto">
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-black">
            Instant Drone Valuation & Doorstep Payout
          </h1>
        </div>

        <div className="mx-auto max-w-5xl">
          {submitted ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50/60 p-8 sm:p-12 text-center space-y-4 shadow-sm max-w-2xl mx-auto">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold text-black">Valuation Ticket #TRD-8921 Generated</h2>
              <p className="text-sm text-zinc-600 max-w-md mx-auto">
                Our inspection team will coordinate free doorstep pickup in <strong className="text-black font-bold">{formData.city}</strong> for your <strong className="text-black font-bold">{selectedDrone.name}</strong>. Estimated payout: <strong className="text-black font-mono font-black text-lg">₹{totalValuation.toLocaleString("en-IN")}</strong>.
              </p>
              <div className="pt-4 flex justify-center gap-4">
                <Link
                  href="/used-drones"
                  className="inline-flex items-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-sm font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
                >
                  Browse Pre-Owned Fleet
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Configurator Column */}
              <div className="lg:col-span-7 space-y-6">
                <form onSubmit={handleSubmit} className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 space-y-6 shadow-lg">
                  <div>
                    <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-2">
                      1. Select Your Current Craft
                    </label>
                    <select
                      value={selectedDrone.id}
                      onChange={(e) => {
                        const found = DRONE_MODELS.find((d) => d.id === e.target.value);
                        if (found) setSelectedDrone(found);
                      }}
                      className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 focus:border-black focus:outline-none shadow-xs font-medium"
                    >
                      {DRONE_MODELS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-2">
                      2. Physical & Flight Condition
                    </label>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: "mint", label: "Grade A+ (Flawless)", desc: "< 15 flights" },
                        { id: "good", label: "Grade A (Clean)", desc: "Normal wear" },
                        { id: "fair", label: "Grade B (Used)", desc: "Minor scuffs" },
                      ].map((c) => (
                        <div
                          key={c.id}
                          onClick={() => setCondition(c.id)}
                          className={`cursor-pointer rounded-2xl border p-3 text-center transition-all ${
                            condition === c.id
                              ? "border-black bg-black text-white shadow-xs"
                              : "border-zinc-200 bg-zinc-50 text-zinc-700 hover:border-zinc-300"
                          }`}
                        >
                          <div className="text-xs font-bold">{c.label}</div>
                          <div className={`text-[10px] mt-1 ${condition === c.id ? "text-zinc-300" : "text-zinc-500"}`}>{c.desc}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase block mb-2">
                      3. Included Accessories
                    </label>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5">
                        <span className="text-xs font-medium text-zinc-700">Total Working Batteries:</span>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4].map((num) => (
                            <button
                              type="button"
                              key={num}
                              onClick={() => setBatteryCount(num)}
                              className={`h-7 w-7 rounded-lg text-xs font-bold transition shadow-xs ${
                                batteryCount === num
                                  ? "bg-black text-[#c8f33b]"
                                  : "bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100"
                              }`}
                            >
                              {num}
                            </button>
                          ))}
                        </div>
                      </div>

                      <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-700 cursor-pointer hover:bg-zinc-100 transition">
                        <input
                          type="checkbox"
                          checked={hasRcWithScreen}
                          onChange={(e) => setHasRcWithScreen(e.target.checked)}
                          className="rounded border-zinc-300 text-black focus:ring-0 accent-black"
                        />
                        <span className="font-medium">Includes Smart Controller with Built-in Display (RC / RC 2 / PRO)</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <label className="text-xs font-bold font-mono tracking-wider text-zinc-500 uppercase block">
                      4. Contact for Free Doorstep Pickup
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        required
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none shadow-xs"
                      />
                      <input
                        type="tel"
                        required
                        placeholder="10-Digit Mobile"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs text-zinc-900 placeholder-zinc-400 focus:border-black focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs font-semibold text-rose-800">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full rounded-full bg-[#c8f33b] py-3.5 font-bold text-black transition hover:bg-[#b8e530] shadow-xs active:scale-95 disabled:opacity-50"
                  >
                    {isPending ? "Submitting Valuation..." : "Schedule Doorstep Inspection & Pickup"}
                  </button>
                </form>
              </div>

              {/* Right Summary Card */}
              <div className="lg:col-span-5">
                <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-zinc-50/90 p-6 space-y-6 shadow-lg">
                  <div className="text-xs font-mono font-bold tracking-wider text-zinc-500 uppercase">
                    ESTIMATED CASHOUT VALUE
                  </div>

                  <div>
                    <div className="text-4xl font-black text-black">
                      ₹{totalValuation.toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs font-semibold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Instant UPI / NEFT Transfer upon inspection</span>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-4 space-y-3 text-xs text-zinc-600">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-black shrink-0" />
                      <span>Free insured doorstep pickup in 180+ Indian cities</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-black shrink-0" />
                      <span>Certified battery health & gimbal sensor audit</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Banknote className="h-4 w-4 text-black shrink-0" />
                      <span>Zero deduction guarantee if condition matches description</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
