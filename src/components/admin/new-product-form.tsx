"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Image as ImageIcon,
  Loader2,
  Package,
  Tag,
} from "lucide-react";
import { createProductAction } from "@/server/actions/admin-products";

export function NewProductForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [categoryName, setCategoryName] = useState("Camera Drones");
  const [categorySlug, setCategorySlug] = useState("camera-drones");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!sku) {
      // Suggest automatic SKU based on name
      const prefix = val
        .split(" ")
        .slice(0, 2)
        .map((w) => w.substring(0, 3).toUpperCase())
        .join("-");
      if (prefix.length >= 3) {
        setSku(`DRN-${prefix}-01`);
      }
    }
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedSlug = e.target.value;
    setCategorySlug(selectedSlug);
    const catMap: Record<string, string> = {
      "camera-drones": "Camera Drones",
      "fpv-drones": "FPV Drones",
      "motors": "Motors & ESCs",
      "frames": "Drone Frames & Kits",
      "propellers": "Propellers & Hardware",
      "batteries": "LiPo Batteries & Power",
      "used-drones": "Pre-Owned Drones",
    };
    setCategoryName(catMap[selectedSlug] || selectedSlug.replace(/-/g, " "));
  };

  function submit(formData: FormData) {
    setError(null);
    const input = {
      sku: String(formData.get("sku") || "").trim(),
      name: String(formData.get("name") || "").trim(),
      categoryName: categoryName.trim(),
      categorySlug: categorySlug.trim(),
      basePriceInr: Number(formData.get("basePriceInr")),
      stockQuantity: Number(formData.get("stockQuantity")),
      description: String(formData.get("description") || "").trim() || undefined,
      isSecondHand: formData.get("isSecondHand") === "on",
      imageUrl: String(formData.get("imageUrl") || "").trim() || undefined,
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
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Nomenclature & Identity */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Package className="h-4 w-4 text-[#c8f33b]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
            1. Product Title & Fleet SKU
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-semibold text-zinc-300">
            Product Full Title <span className="text-rose-400">*</span>
            <input
              name="name"
              type="text"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. DJI Air 3S Fly More Combo"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-300">
            Unique Fleet SKU <span className="text-rose-400">*</span>
            <input
              name="sku"
              type="text"
              required
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              placeholder="e.g. DRN-DJI-A3S"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors uppercase"
            />
          </label>
        </div>
      </div>

      {/* Section 2: Taxonomy & Pricing */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <Tag className="h-4 w-4 text-[#c8f33b]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
            2. Category & Commercial Pricing
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <label className="text-xs font-semibold text-zinc-300">
            Catalog Category <span className="text-rose-400">*</span>
            <select
              value={categorySlug}
              onChange={handleCategoryChange}
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            >
              <option value="camera-drones">Camera Drones</option>
              <option value="fpv-drones">FPV Drones</option>
              <option value="used-drones">Pre-Owned Drones</option>
              <option value="motors">Motors & ESCs</option>
              <option value="frames">Drone Frames & Kits</option>
              <option value="propellers">Propellers & Hardware</option>
              <option value="batteries">LiPo Batteries & Power</option>
            </select>
          </label>

          <label className="text-xs font-semibold text-zinc-300">
            Base Selling Price (₹ INR) <span className="text-rose-400">*</span>
            <input
              name="basePriceInr"
              type="number"
              required
              min={1}
              placeholder="e.g. 112000"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>

          <label className="text-xs font-semibold text-zinc-300">
            Warehouse Stock Units <span className="text-rose-400">*</span>
            <input
              name="stockQuantity"
              type="number"
              required
              min={0}
              defaultValue={10}
              placeholder="10"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>
        </div>
      </div>

      {/* Section 3: Media & Condition */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
          <ImageIcon className="h-4 w-4 text-[#c8f33b]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
            3. Media Assets & Condition Tier
          </h2>
        </div>

        <div className="space-y-4">
          <label className="block text-xs font-semibold text-zinc-300">
            Primary Cloudflare R2 / Public Image URL
            <input
              name="imageUrl"
              type="text"
              placeholder="e.g. /images/dji-air-3s.jpg or https://cdn.yourdronestore.in/air-3s.jpg"
              className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
            />
          </label>

          <div className="rounded-xl border border-zinc-800/80 bg-zinc-950/60 p-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                name="isSecondHand"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-[#c8f33b] focus:ring-[#c8f33b]/40"
              />
              <div>
                <span className="text-xs font-bold text-white block">
                  Classify as Certified Pre-Owned / Inspected Drone
                </span>
                <span className="text-[11px] text-zinc-400 block mt-0.5">
                  Flags product as Grade A/B second-hand with 32-point inspection check badges on storefront.
                </span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* Section 4: Specifications & Summary */}
      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-4">
        <label className="block text-xs font-semibold text-zinc-300">
          Product Summary & Technical Overview
          <textarea
            name="description"
            rows={4}
            placeholder="Dual-camera system, 1-inch CMOS primary camera, 45-minute flight time, omnidirectional obstacle sensing..."
            className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-3.5 text-xs text-white placeholder-zinc-600 focus:border-[#c8f33b]/60 focus:outline-none transition-colors"
          />
        </label>
      </div>

      {/* Footer Submit Buttons */}
      <div className="flex items-center justify-between pt-2">
        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>

        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-2 rounded-xl bg-[#c8f33b] px-6 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#b5e028] disabled:opacity-50 shadow-xs hover:shadow-[0_0_15px_rgba(200,243,59,0.3)]"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-black" />
              <span>Publishing to Catalog...</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 stroke-3" />
              <span>Save & Publish Product</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
