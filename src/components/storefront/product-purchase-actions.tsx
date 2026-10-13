"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ShoppingBag, 
  Zap, 
  Plus, 
  Minus, 
  Check, 
  ShieldCheck, 
  Truck,
  CreditCard,
  Shield,
  Wrench
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";

interface ProductPurchaseActionsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    basePricePaise: number;
    stockQuantity: number;
    isSecondHand: boolean;
    thumbnailUrl: string;
    mrpPricePaise?: number | null;
    emiStartsFromPaise?: number | null;
  };
}

export function ProductPurchaseActions({
  product,
}: ProductPurchaseActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedCombo, setSelectedCombo] = useState<"standard" | "combo">("combo");
  const [addInsurance, setAddInsurance] = useState(false);
  const [addAmc, setAddAmc] = useState(false);
  const [addedToast, setAddedToast] = useState(false);
  const router = useRouter();

  const { addItem, setIsOpen } = useCartStore();
  const isAvailable = product.stockQuantity > 0;

  // Pricing calculations
  const mrpPaise = product.mrpPricePaise || Math.round(product.basePricePaise * 1.25);
  const discountPercent = Math.max(0, Math.round(((mrpPaise - product.basePricePaise) / mrpPaise) * 100));
  const emiPaise = product.emiStartsFromPaise || Math.round(product.basePricePaise / 18);

  const insurancePricePaise = 849900;
  const amcPricePaise = 499900;

  let calculatedPricePaise = product.basePricePaise;
  if (addInsurance) calculatedPricePaise += insurancePricePaise;
  if (addAmc) calculatedPricePaise += amcPricePaise;

  function handleAddToCart() {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      name: `${product.name} (${selectedCombo === "combo" ? "Fly More Combo" : "Standard Pack"})${addInsurance ? " + Shield 1Y" : ""}`,
      slug: product.slug,
      basePricePaise: calculatedPricePaise,
      thumbnailUrl: product.thumbnailUrl,
      isSecondHand: product.isSecondHand,
      quantity,
      stockAvailable: product.stockQuantity,
    });

    setAddedToast(true);
    setTimeout(() => {
      setAddedToast(false);
      setIsOpen(true);
    }, 400);
  }

  function handleBuyNow() {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      name: `${product.name} (${selectedCombo === "combo" ? "Fly More Combo" : "Standard Pack"})${addInsurance ? " + Shield 1Y" : ""}`,
      slug: product.slug,
      basePricePaise: calculatedPricePaise,
      thumbnailUrl: product.thumbnailUrl,
      isSecondHand: product.isSecondHand,
      quantity,
      stockAvailable: product.stockQuantity,
    });

    router.push("/checkout");
  }

  return (
    <div className="space-y-5 pt-2">
      {/* Toast Alert */}
      {addedToast && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Added {quantity} unit(s) to your Flight Bag!</span>
        </div>
      )}

      {/* Strike-Through Price, Discount & EMI Badge */}
      <div className="rounded-xl border border-zinc-200/90 bg-zinc-50/80 p-4 space-y-2">
        <div className="flex flex-wrap items-baseline gap-3">
          <span className="text-3xl sm:text-4xl font-black tracking-tight text-black font-mono">
            {formatINR(calculatedPricePaise)}
          </span>
          {mrpPaise > product.basePricePaise && (
            <span className="text-sm font-semibold text-zinc-400 line-through font-mono">
              MRP: {formatINR(mrpPaise)}
            </span>
          )}
          {discountPercent > 0 && (
            <span className="rounded-full bg-[#c8f33b] px-2.5 py-0.5 text-[11px] font-black uppercase text-black font-mono">
              Save {discountPercent}%
            </span>
          )}
        </div>

        {/* EMI Strip */}
        <div className="flex items-center gap-2 pt-1 text-xs text-zinc-600 font-medium">
          <CreditCard className="h-3.5 w-3.5 text-zinc-500" />
          <span>EMI starting at <strong className="text-black font-mono">{formatINR(emiPaise)}/mo</strong> with major banks</span>
        </div>
      </div>

      {/* Package Variant Selector */}
      <div className="space-y-2">
        <label className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
          Select Flight Configuration:
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => setSelectedCombo("combo")}
            className={`flex flex-col text-left rounded-xl border p-3 transition-all cursor-pointer ${
              selectedCombo === "combo"
                ? "border-black bg-white shadow-xs ring-1 ring-black/5"
                : "border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Fly More Combo</span>
              <span className="rounded bg-[#c8f33b] px-1.5 py-0.2 text-[9px] font-black uppercase text-black">
                Most Popular
              </span>
            </div>
            <span className="mt-1 text-[11px] text-zinc-500">Includes DJI RC 2, 3x Batteries, Hub & Bag</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedCombo("standard")}
            className={`flex flex-col text-left rounded-xl border p-3 transition-all cursor-pointer ${
              selectedCombo === "standard"
                ? "border-black bg-white shadow-xs ring-1 ring-black/5"
                : "border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-black">Standard Pack</span>
              <span className="text-[10px] text-zinc-400 font-mono">Base Rig</span>
            </div>
            <span className="mt-1 text-[11px] text-zinc-500">Includes DJI RC-N3 (Phone Mount), 1x Battery</span>
          </button>
        </div>
      </div>

      {/* Commercial Protection & AMC Add-ons (Checkboxes) */}
      <div className="space-y-2">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-500">
          Protection & AMC Add-ons:
        </span>
        <div className="space-y-2">
          {/* Insurance */}
          <div
            onClick={() => setAddInsurance(!addInsurance)}
            className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
              addInsurance
                ? "border-black bg-white shadow-xs"
                : "border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition ${
                  addInsurance ? "border-black bg-black text-white" : "border-zinc-300 bg-white"
                }`}
              >
                {addInsurance && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5 text-blue-600" />
                  Altitude Shield 1-Year Protection Plan
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Includes 2 accidental damage replacements & water impact coverage
                </span>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-black shrink-0">
              +{formatINR(insurancePricePaise)}
            </span>
          </div>

          {/* AMC Calibration */}
          <div
            onClick={() => setAddAmc(!addAmc)}
            className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition ${
              addAmc
                ? "border-black bg-white shadow-xs"
                : "border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition ${
                  addAmc ? "border-black bg-black text-white" : "border-zinc-300 bg-white"
                }`}
              >
                {addAmc && <Check className="h-3 w-3 stroke-[3]" />}
              </div>
              <div>
                <span className="text-xs font-bold text-black flex items-center gap-1.5">
                  <Wrench className="h-3.5 w-3.5 text-amber-600" />
                  Annual Flight Lab Maintenance & Sensor Calibration
                </span>
                <span className="text-[10px] text-zinc-500 block">
                  Periodic telemetry checkup, firmware tuning, and gimbal balance
                </span>
              </div>
            </div>
            <span className="text-xs font-bold font-mono text-black shrink-0">
              +{formatINR(amcPricePaise)}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-center rounded-full border border-zinc-300 bg-zinc-50 px-3 py-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || !isAvailable}
            className="p-1 text-zinc-500 hover:text-black disabled:opacity-30 transition cursor-pointer"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-10 text-center text-sm font-bold text-black font-mono">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
            disabled={quantity >= product.stockQuantity || !isAvailable}
            className="p-1 text-zinc-500 hover:text-black disabled:opacity-30 transition cursor-pointer"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        {/* Add to Flight Bag Button */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 font-bold text-black transition-all hover:bg-[#b8e530] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-sm cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{isAvailable ? "Add to Flight Bag" : "Out of Stock"}</span>
        </button>

        {/* Buy Now Direct Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black py-3.5 px-6 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-sm cursor-pointer"
        >
          <Zap className="h-4 w-4 text-[#c8f33b]" />
          <span>Direct UPI Checkout</span>
        </button>
      </div>

      {/* Assurance Perks */}
      <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-zinc-600 font-medium">
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-200/80 p-2">
          <Truck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>Free Express Air Courier</span>
        </div>
        <div className="flex items-center gap-2 rounded-lg bg-zinc-50 border border-zinc-200/80 p-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
          <span>32-Point Bench Flight Tested</span>
        </div>
      </div>
    </div>
  );
}
