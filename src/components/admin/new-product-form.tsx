"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Cpu,
  Eye,
  FileCheck,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  ShieldCheck,
  Sparkles,
  Tag,
  Wrench,
} from "lucide-react";
import { createProductAction } from "@/server/actions/admin-products";
import { ImageUploader } from "@/components/admin/image-uploader";

const POPULAR_BRANDS = ["DJI", "Autel", "BetaFPV", "iFlight", "Skydio"];

const CLEAN_CATEGORIES = [
  { slug: "mini-series", name: "Mini Series (<249g)", desc: "DGCA license-exempt nano tier" },
  { slug: "air-series", name: "Air Series", desc: "Dual-camera all-rounders" },
  { slug: "mavic-series", name: "Mavic Series", desc: "Flagship cinematography quadcopters" },
  { slug: "avata-series", name: "Avata & FPV Series", desc: "Immersive 360 & motion flight" },
  { slug: "accessories", name: "Accessories & Spares", desc: "Batteries, props, controllers & bags" },
  { slug: "used-drones", name: "Pre-Owned Drones", desc: "32-point verified refurbished fleet" },
];

export function NewProductForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [brand, setBrand] = useState("DJI");
  const [categorySlug, setCategorySlug] = useState("air-series");
  const [categoryName, setCategoryName] = useState("Air Series");
  const [isSecondHand, setIsSecondHand] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const handleNameChange = (val: string) => {
    setName(val);
    if (!sku) {
      const brandPrefix = brand.substring(0, 3).toUpperCase();
      const nameParts = val
        .split(" ")
        .slice(0, 3)
        .map((w) => w.substring(0, 3).toUpperCase())
        .join("-");
      if (nameParts.length >= 2) {
        setSku(`DRN-${brandPrefix}-${nameParts}`);
      }
    }
  };

  const handleBrandSelect = (b: string) => {
    setBrand(b);
    if (sku.startsWith("DRN-")) {
      const parts = sku.split("-");
      parts[1] = b.substring(0, 3).toUpperCase();
      setSku(parts.join("-"));
    }
  };

  const handleCategoryChange = (slug: string) => {
    setCategorySlug(slug);
    const found = CLEAN_CATEGORIES.find((c) => c.slug === slug);
    if (found) {
      setCategoryName(found.name);
      if (slug === "used-drones") {
        setIsSecondHand(true);
      }
    }
  };

  function submit(formData: FormData) {
    setError(null);

    const basePriceInr = Number(formData.get("basePriceInr"));
    const mrpPriceInr = formData.get("mrpPriceInr")
      ? Number(formData.get("mrpPriceInr"))
      : undefined;
    const stockQuantity = Number(formData.get("stockQuantity") || 0);

    const input = {
      // 1. Identity & Taxonomy
      sku: String(formData.get("sku") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      brand: String(formData.get("brand") || "DJI").trim(),
      categoryName: categoryName.trim(),
      categorySlug: categorySlug.trim(),
      status: (formData.get("status") || "active") as "active" | "draft" | "archived",
      basePriceInr,
      mrpPriceInr,
      stockQuantity,
      description: String(formData.get("description") || "").trim() || undefined,
      imageUrl: imageUrls[0] || imageUrl.trim() || undefined,
      imageUrls: imageUrls.length > 0 ? imageUrls : (imageUrl.trim() ? [imageUrl.trim()] : []),

      // 2. Condition Tier
      isSecondHand,
      cosmeticGrade: isSecondHand
        ? ((formData.get("cosmeticGrade") || "A") as "A" | "B" | "C")
        : undefined,
      flightHours: isSecondHand && formData.get("flightHours")
        ? Number(formData.get("flightHours"))
        : undefined,
      batteryCycleCount: isSecondHand && formData.get("batteryCycleCount")
        ? Number(formData.get("batteryCycleCount"))
        : undefined,
      crashHistory: isSecondHand ? formData.get("crashHistory") === "true" : undefined,
      includedAccessories: isSecondHand
        ? String(formData.get("includedAccessories") || "").trim() || undefined
        : undefined,
      inspectionNotes: isSecondHand
        ? String(formData.get("inspectionNotes") || "").trim() || undefined
        : undefined,

      // 3. Hardware Specifications
      weightGrams: formData.get("weightGrams")
        ? Number(formData.get("weightGrams"))
        : undefined,
      flightTimeMinutes: formData.get("flightTimeMinutes")
        ? Number(formData.get("flightTimeMinutes"))
        : undefined,
      payloadCapacityGrams: formData.get("payloadCapacityGrams")
        ? Number(formData.get("payloadCapacityGrams"))
        : undefined,
      frameSizeMm: formData.get("frameSizeMm")
        ? Number(formData.get("frameSizeMm"))
        : undefined,
      inputVoltageLipo: String(formData.get("inputVoltageLipo") || "").trim() || undefined,
      motorKv: String(formData.get("motorKv") || "").trim() || undefined,
      fcFirmware: String(formData.get("fcFirmware") || "").trim() || undefined,
      escProtocol: String(formData.get("escProtocol") || "").trim() || undefined,

      // 4. Marketing Showcase Details
      heroBadge: String(formData.get("heroBadge") || "").trim() || undefined,
      heroHeadline: String(formData.get("heroHeadline") || "").trim() || undefined,
      heroSubtitle: String(formData.get("heroSubtitle") || "").trim() || undefined,
      warrantyMonths: formData.get("warrantyMonths")
        ? Number(formData.get("warrantyMonths"))
        : 12,
      inTheBox: String(formData.get("inTheBox") || "").trim() || undefined,
    };

    startTransition(async () => {
      const result = await createProductAction(input);
      if (!result.success) {
        setError(result.message || "Product creation failed.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form action={submit} className="space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* =================================================================== */}
      {/* SECTION 1: NOMENCLATURE, BRAND & TAXONOMY */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 space-y-5 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              1. Identity, Brand & Fleet SKU
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">Core Table</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Full Name */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Product Full Title <span className="text-rose-500">*</span>
              <input
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="e.g. DJI Air 3S Fly More Combo (DJI RC 2)"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Fleet SKU */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Unique Fleet SKU <span className="text-rose-500">*</span>
              <input
                name="sku"
                type="text"
                required
                value={sku}
                onChange={(e) => setSku(e.target.value.toUpperCase())}
                placeholder="e.g. DRN-DJI-A3S-RC2"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors uppercase"
              />
            </label>
          </div>
        </div>

        {/* Brand Selection with Quick Pills */}
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Hardware Brand <span className="text-rose-500">*</span>
          </label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            {POPULAR_BRANDS.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleBrandSelect(b)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  brand.toUpperCase() === b.toUpperCase()
                    ? "bg-black dark:bg-[#c8f33b] text-white dark:text-black font-bold shadow-xs"
                    : "border border-zinc-200 dark:border-zinc-800 bg-zinc-100/70 dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                {b}
              </button>
            ))}

            <input
              name="brand"
              type="text"
              required
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              placeholder="Or enter custom brand"
              className="w-48 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Category Selection (6 Clean Taxonomy Options) */}
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Catalog Category <span className="text-rose-500">*</span>
          </label>
          <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CLEAN_CATEGORIES.map((cat) => {
              const isSelected = categorySlug === cat.slug;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => handleCategoryChange(cat.slug)}
                  className={`flex flex-col text-left rounded-xl p-3 border transition-all cursor-pointer ${
                    isSelected
                      ? "border-black dark:border-[#c8f33b] bg-zinc-100/80 dark:bg-zinc-800/80 shadow-xs"
                      : "border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-950 hover:border-zinc-300 dark:hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${isSelected ? "text-black dark:text-white" : "text-zinc-800 dark:text-zinc-300"}`}>
                      {cat.name}
                    </span>
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-lime-600 dark:bg-[#c8f33b]" />
                    )}
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
                    {cat.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Listing Status */}
        <div className="flex items-center gap-4 pt-1">
          <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">Listing Status:</span>
          {["active", "draft", "archived"].map((st) => (
            <label key={st} className="flex items-center gap-1.5 text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
              <input
                type="radio"
                name="status"
                value={st}
                defaultChecked={st === "active"}
                className="text-black dark:text-[#c8f33b] focus:ring-0"
              />
              <span className="capitalize">{st}</span>
            </label>
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 2: COMMERCIAL PRICING & INVENTORY */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Tag className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              2. Commercial Pricing & Inventory
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">INR / Stock</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {/* Base Price */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Selling Price (₹ INR) <span className="text-rose-500">*</span>
              <input
                name="basePriceInr"
                type="number"
                required
                min={1}
                placeholder="e.g. 149990"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* MRP Price */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              MRP / Strike Price (₹)
              <input
                name="mrpPriceInr"
                type="number"
                min={1}
                placeholder="e.g. 169990"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Stock Quantity */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Warehouse Stock Units <span className="text-rose-500">*</span>
              <input
                name="stockQuantity"
                type="number"
                required
                min={0}
                defaultValue={10}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Warranty Months */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Warranty Period (Months)
              <input
                name="warrantyMonths"
                type="number"
                min={0}
                defaultValue={12}
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 3: DRONE HARDWARE SPECIFICATIONS (droneSpecifications) */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              3. Hardware Engineering Specifications
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">drone_specifications</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {/* Weight */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Weight (Grams)
              <input
                name="weightGrams"
                type="number"
                min={1}
                placeholder="e.g. 249 or 724"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Flight Time */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Max Flight Time (Mins)
              <input
                name="flightTimeMinutes"
                type="number"
                min={1}
                placeholder="e.g. 45 or 36"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Payload Capacity */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Payload Capacity (Grams)
              <input
                name="payloadCapacityGrams"
                type="number"
                min={0}
                placeholder="e.g. 500"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Frame Size */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Frame Wheelbase (mm)
              <input
                name="frameSizeMm"
                type="number"
                min={0}
                placeholder="e.g. 225"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          {/* Battery / Voltage */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Battery / Input Voltage
              <input
                name="inputVoltageLipo"
                type="text"
                placeholder="e.g. 4S LiPo 4241mAh"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Motor KV */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Motor KV / Propulsion
              <input
                name="motorKv"
                type="text"
                placeholder="e.g. DJI Aerodynamic Motor"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* FC Firmware */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Flight Controller OS
              <input
                name="fcFirmware"
                type="text"
                placeholder="e.g. DJI O4 FlightOS"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Video Transmission Protocol */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Video Transmission Protocol
              <input
                name="escProtocol"
                type="text"
                placeholder="e.g. DJI O4 20km FHD"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* SECTION 4: CONDITION TIER & PRE-OWNED CERTIFICATION */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              4. Condition Tier & Pre-Owned Inspection
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">second_hand_details</span>
        </div>

        {/* Toggle Is Second Hand */}
        <div className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-4">
          <div>
            <p className="text-xs font-bold text-zinc-900 dark:text-white">
              Is this a Certified Pre-Owned / Refurbished unit?
            </p>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              Enabling this unlocks 32-point technician inspection logging, battery health cycle count, and grade certification.
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              name="isSecondHandToggle"
              checked={isSecondHand}
              onChange={(e) => setIsSecondHand(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-zinc-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-lime-500 dark:peer-checked:bg-[#c8f33b]"></div>
          </label>
        </div>

        {/* Pre-Owned Specific Fields */}
        {isSecondHand && (
          <div className="space-y-4 pt-2 border-t border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="grid gap-4 sm:grid-cols-4">
              {/* Cosmetic Grade */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  Cosmetic Grade <span className="text-rose-500">*</span>
                  <select
                    name="cosmeticGrade"
                    defaultValue="A"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
                  >
                    <option value="A">Grade A (Pristine / Like New)</option>
                    <option value="B">Grade B (Minor Surface Scuffs)</option>
                    <option value="C">Grade C (Heavy Flight Hours)</option>
                  </select>
                </label>
              </div>

              {/* Flight Hours */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  Total Flight Hours
                  <input
                    name="flightHours"
                    type="number"
                    min={0}
                    placeholder="e.g. 4"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
                  />
                </label>
              </div>

              {/* Battery Cycle Count */}
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  Battery Cycle Count
                  <input
                    name="batteryCycleCount"
                    type="number"
                    min={0}
                    placeholder="e.g. 5"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
                  />
                </label>
              </div>

              {/* Crash History */}
              <div className="flex flex-col justify-end pb-2">
                <label className="flex items-center gap-2 text-xs font-semibold text-zinc-800 dark:text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    name="crashHistory"
                    value="false"
                    defaultChecked={false}
                    className="rounded text-black dark:text-[#c8f33b] focus:ring-0"
                  />
                  <span>Zero Crash Airframe Verified</span>
                </label>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  Included Accessories (Comma separated)
                  <input
                    name="includedAccessories"
                    type="text"
                    placeholder="e.g. DJI RC-N1, 2x Batteries, Two-Way Hub, Bag"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
                  />
                </label>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
                  Technician Bench Inspection Notes
                  <input
                    name="inspectionNotes"
                    type="text"
                    placeholder="e.g. Passed 32-point sensor telemetry, gimbal calibrated, battery healthy"
                    className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* SECTION 5: MEDIA ASSETS & STOREFRONT SHOWCASE */}
      {/* =================================================================== */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-6 space-y-4 shadow-xs transition-colors">
        <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 font-mono">
              5. Media Assets & Storefront Showcase
            </h2>
          </div>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">product_showcases / media</span>
        </div>

        {/* Direct Cloudflare R2 Multi-Image Drag & Drop Uploader */}
        <ImageUploader
          label="Product Photography Gallery (Upload multiple angles & box combo photos)"
          initialUrls={imageUrls}
          onImagesChange={(urls) => {
            setImageUrls(urls);
            setImageUrl(urls[0] || "");
          }}
          maxFiles={10}
        />

        <div className="grid gap-4 sm:grid-cols-3">
          {/* Image URL */}
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Primary Product Image URL (Auto-filled on upload or manual paste)
              <input
                name="imageUrl"
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="e.g. https://pub-xxxx.r2.dev/uploads/... or /images/dji-air-3s.jpg"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Marketing Badge */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Hero Marketing Badge
              <input
                name="heroBadge"
                type="text"
                placeholder="e.g. REAL DETAIL AIR"
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>
        </div>

        {/* Live Image Preview Card if provided */}
        {imageUrl && (
          <div className="flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3">
            <img
              src={imageUrl}
              alt="Preview"
              className="h-16 w-16 rounded-lg object-cover border border-zinc-200 dark:border-zinc-800"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
            <div>
              <p className="text-xs font-bold text-zinc-900 dark:text-white">Primary Image Asset</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 break-all">{imageUrl}</p>
            </div>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {/* Hero Headline */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Hero Headline (Apple/DJI style)
              <input
                name="heroHeadline"
                type="text"
                placeholder="e.g. Air 3S."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>

          {/* Hero Subtitle */}
          <div>
            <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
              Hero Subtitle / Value Pitch
              <input
                name="heroSubtitle"
                type="text"
                placeholder="e.g. Dual 48MP cameras, 1-inch CMOS, and LiDAR APAS night sensing."
                className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
              />
            </label>
          </div>
        </div>

        {/* In The Box Items */}
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            In The Box Package Components (Separate with new lines or commas)
            <textarea
              name="inTheBox"
              rows={2}
              placeholder="e.g.&#10;DJI Air 3S Aircraft&#10;DJI RC 2 Remote Controller (Screen)&#10;3x Intelligent Flight Batteries&#10;Two-Way Charging Hub&#10;Shoulder Bag"
              className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-300">
            Full Product Description & Technical Summary
            <textarea
              name="description"
              rows={3}
              placeholder="Provide full technical breakdown, optical sensor specs, flight performance, and Pan-India warranty details..."
              className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>
        </div>
      </div>

      {/* =================================================================== */}
      {/* ACTION BAR: SUBMIT & CANCEL */}
      {/* =================================================================== */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Cancel & Return</span>
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-black dark:bg-[#c8f33b] px-6 py-2.5 text-xs font-bold text-white dark:text-black shadow-sm hover:opacity-95 dark:hover:bg-[#b5e028] disabled:opacity-50 cursor-pointer transition-all"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Provisioning Catalog SKU...</span>
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Publish Product to Fleet</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
