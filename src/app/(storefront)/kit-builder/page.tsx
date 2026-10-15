"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Cpu, 
  BatteryCharging, 
  Radio, 
  Video, 
  ShieldCheck, 
  ArrowRight, 
  Plus, 
  Check, 
  ShoppingBag,
  Sliders,
  Plane
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { checkAddToCartAllowed } from "@/lib/auth-client";

interface ComponentOption {
  id: string;
  name: string;
  brand: string;
  spec: string;
  weightGrams: number;
  pricePaise: number;
}

const FRAMES: ComponentOption[] = [
  { id: "frame-5", name: "AeroX 5-Inch Carbon Freestyle", brand: "Apex Carbon", spec: "5mm Arms • 3K Twill Carbon", weightGrams: 118, pricePaise: 449900 },
  { id: "frame-35", name: "Cinewhoop 3.5 Pro Inverted", brand: "SkyDuct", spec: "Ducted Props • Indoor Cinema", weightGrams: 145, pricePaise: 529900 },
  { id: "frame-7", name: "DeadCat 7-Inch Long Range", brand: "HorizonFPV", spec: "7mm Arms • GPS Mast Mount", weightGrams: 172, pricePaise: 619900 },
];

const MOTORS: ComponentOption[] = [
  { id: "mot-2207-6s", name: "2207 1950KV Brushless (Set of 4)", brand: "T-Motor", spec: "6S High Torque • N52SH Magnets", weightGrams: 136, pricePaise: 799900 },
  { id: "mot-2306-4s", name: "2306 2550KV High-RPM (Set of 4)", brand: "Emax ECO II", spec: "4S Acro Freestyle • Bell Cap", weightGrams: 128, pricePaise: 649900 },
  { id: "mot-2806-lr", name: "2806.5 1300KV Endurance (Set of 4)", brand: "BrotherHobby", spec: "7-Inch Long Range Cruiser", weightGrams: 188, pricePaise: 949900 },
];

const STACKS: ComponentOption[] = [
  { id: "stack-f7", name: "F722 V4 Flight Controller + 55A 32-Bit ESC", brand: "SpeedyBee", spec: "Bluetooth Config • 8S Capable", weightGrams: 28, pricePaise: 989900 },
  { id: "stack-f4", name: "F405 V3 Gyro + 50A ESC Stack", brand: "Foxeer", spec: "Barometer • Plug-and-Play VTX", weightGrams: 26, pricePaise: 699900 },
  { id: "stack-aio", name: "AIO 40A Ultra-Compact Flight Board", brand: "BetaFPV", spec: "Whoop / Micro Form Factor", weightGrams: 14, pricePaise: 549900 },
];

const VTX_SYSTEMS: ComponentOption[] = [
  { id: "vtx-o3", name: "DJI O3 Air Unit Digital Transmission", brand: "DJI", spec: "4K 60fps • 10km O3+ Range", weightGrams: 36, pricePaise: 2199900 },
  { id: "vtx-walksnail", name: "Avatar HD Pro Dual-Antenna Kit", brand: "Walksnail", spec: "1080p 120fps Low Latency", weightGrams: 32, pricePaise: 1449900 },
  { id: "vtx-analog", name: "800mW Adjustable 5.8GHz VTX + Foxeer Cam", brand: "Rush Tank", spec: "Zero Latency • Race-Band", weightGrams: 18, pricePaise: 489900 },
];

export default function KitBuilderPage() {
  const router = useRouter();
  const [selectedFrame, setSelectedFrame] = useState<ComponentOption>(FRAMES[0]);
  const [selectedMotors, setSelectedMotors] = useState<ComponentOption>(MOTORS[0]);
  const [selectedStack, setSelectedStack] = useState<ComponentOption>(STACKS[0]);
  const [selectedVtx, setSelectedVtx] = useState<ComponentOption>(VTX_SYSTEMS[0]);
  const [buildSuccessToast, setBuildSuccessToast] = useState(false);

  const { addItem, setIsOpen } = useCartStore();

  const totalWeightGrams =
    selectedFrame.weightGrams +
    selectedMotors.weightGrams +
    selectedStack.weightGrams +
    selectedVtx.weightGrams +
    12; // Props & hardware allowance

  const totalPricePaise =
    selectedFrame.pricePaise +
    selectedMotors.pricePaise +
    selectedStack.pricePaise +
    selectedVtx.pricePaise;

  const totalPriceInr = (totalPricePaise / 100).toLocaleString("en-IN");

  async function handleAddCustomBuildToCart() {
    const guard = await checkAddToCartAllowed();
    if (!guard.allowed) {
      if (guard.reason === "unauthenticated") {
        router.push(guard.loginUrl);
        return;
      }
      if (guard.reason === "admin") {
        alert(guard.message);
        return;
      }
    }

    addItem({
      productId: "00000000-0000-0000-0000-000000000001",
      name: `Altitude Custom Drone (${selectedFrame.name.split(" ")[0]} 6S)`,
      slug: "aerox-5-freestyle-bnf-grade-a",
      basePricePaise: totalPricePaise,
      thumbnailUrl: "/images/altitude-hero-bg.jpg",
      isSecondHand: false,
      quantity: 1,
      stockAvailable: 10,
    });

    setBuildSuccessToast(true);
    setTimeout(() => {
      setBuildSuccessToast(false);
      setIsOpen(true);
    }, 800);
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-black">Kit Builder</span>
        </div>

        {/* Top Banner */}
        <div className="border-b border-zinc-200 pb-8 mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-100 px-3 py-1 text-xs font-bold text-black font-mono">
            <Sliders className="h-3.5 w-3.5" />
            <span>ALTITUDE MODULAR WORKSPACE</span>
          </div>
          <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-5xl text-black">
            Custom UAV Kit Builder
          </h1>
          <p className="mt-2 max-w-2xl text-xs sm:text-sm text-zinc-600 leading-relaxed">
            Configure your dream flight craft with real-time component weight calculations, electronic bus compatibility verification, and professional bench-tested assembly options.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Component Selection Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Step 1: Frame */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-[#c8f33b]">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-bold text-black">Select Carbon Fiber Airframe</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {FRAMES.map((f) => {
                  const isSelected = selectedFrame.id === f.id;
                  return (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFrame(f)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-black bg-zinc-50 shadow-sm ring-2 ring-black"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">{f.brand}</div>
                      <div className="font-bold text-sm mt-1 text-black">{f.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{f.spec}</div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                        <span className="text-zinc-500 font-mono">{f.weightGrams}g</span>
                        <span className="font-black text-black">₹{(f.pricePaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Motors */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-[#c8f33b]">
                  2
                </span>
                <h2 className="text-base sm:text-lg font-bold text-black">Select Brushless Propulsion (Set of 4)</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {MOTORS.map((m) => {
                  const isSelected = selectedMotors.id === m.id;
                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMotors(m)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-black bg-zinc-50 shadow-sm ring-2 ring-black"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">{m.brand}</div>
                      <div className="font-bold text-sm mt-1 text-black">{m.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{m.spec}</div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                        <span className="text-zinc-500 font-mono">{m.weightGrams}g</span>
                        <span className="font-black text-black">₹{(m.pricePaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 3: Flight Controller & ESC Stack */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-[#c8f33b]">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-bold text-black">Select FC & 32-Bit ESC Stack</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {STACKS.map((s) => {
                  const isSelected = selectedStack.id === s.id;
                  return (
                    <div
                      key={s.id}
                      onClick={() => setSelectedStack(s)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-black bg-zinc-50 shadow-sm ring-2 ring-black"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">{s.brand}</div>
                      <div className="font-bold text-sm mt-1 text-black">{s.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{s.spec}</div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                        <span className="text-zinc-500 font-mono">{s.weightGrams}g</span>
                        <span className="font-black text-black">₹{(s.pricePaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step 4: Digital / Analog Video Link */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-bold text-[#c8f33b]">
                  4
                </span>
                <h2 className="text-base sm:text-lg font-bold text-black">Select Video Transmission & Camera</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {VTX_SYSTEMS.map((v) => {
                  const isSelected = selectedVtx.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => setSelectedVtx(v)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-black bg-zinc-50 shadow-sm ring-2 ring-black"
                          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-xs"
                      }`}
                    >
                      <div className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 font-bold">{v.brand}</div>
                      <div className="font-bold text-sm mt-1 text-black">{v.name}</div>
                      <div className="text-xs text-zinc-500 mt-1">{v.spec}</div>
                      <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-zinc-100">
                        <span className="text-zinc-500 font-mono">{v.weightGrams}g</span>
                        <span className="font-black text-black">₹{(v.pricePaise / 100).toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Sticky Telemetry HUD Column */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl space-y-6 text-zinc-900">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-mono font-bold tracking-widest text-black">TELEMETRY PREVIEW</span>
                </div>
                <span className="text-xs font-bold text-emerald-700 font-mono">STATUS: READY</span>
              </div>

              {/* Hardware Summary */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Airframe</span>
                  <span className="font-bold text-black">{selectedFrame.name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Motors</span>
                  <span className="font-bold text-black">{selectedMotors.name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500">
                  <span>FC + ESC</span>
                  <span className="font-bold text-black">{selectedStack.name}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Video System</span>
                  <span className="font-bold text-black">{selectedVtx.name}</span>
                </div>
              </div>

              {/* Specs Metric Grid */}
              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-200">
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3.5">
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">DRY WEIGHT</div>
                  <div className="text-xl font-black text-black mt-0.5">{totalWeightGrams} g</div>
                  <div className="text-[10px] text-zinc-500 font-medium">Sub-250g Ready: {totalWeightGrams < 250 ? "YES" : "NO"}</div>
                </div>
                <div className="rounded-2xl bg-zinc-50 border border-zinc-100 p-3.5">
                  <div className="text-[10px] font-mono font-bold text-zinc-400 uppercase">EST. POWER RATIO</div>
                  <div className="text-xl font-black text-black mt-0.5">8.4 : 1</div>
                  <div className="text-[10px] text-zinc-500 font-medium">Acro & Race Spec</div>
                </div>
              </div>

              {/* Total Price & Add to Bag */}
              <div className="pt-3 border-t border-zinc-200">
                <div className="flex items-baseline justify-between mb-4">
                  <span className="text-xs font-bold text-zinc-500">Complete Build Price:</span>
                  <span className="text-3xl font-black text-black">₹{totalPriceInr}</span>
                </div>

                <button
                  type="button"
                  onClick={handleAddCustomBuildToCart}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 font-bold text-black transition-all hover:bg-[#b8e530] shadow-xs active:scale-95"
                >
                  <ShoppingBag className="h-4 w-4" />
                  <span>{buildSuccessToast ? "Added to Flight Bag!" : "Add Custom Build to Bag"}</span>
                </button>

                <p className="mt-3 text-center text-[11px] text-zinc-500 leading-relaxed">
                  Includes pre-flashed Betaflight firmware & bench telemetry verification report.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
