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
  Truck 
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

interface ProductPurchaseActionsProps {
  product: {
    id: string;
    slug: string;
    name: string;
    basePricePaise: number;
    stockQuantity: number;
    isSecondHand: boolean;
    thumbnailUrl: string;
  };
}

export function ProductPurchaseActions({
  product,
}: ProductPurchaseActionsProps) {
  const [quantity, setQuantity] = useState(1);
  const [addedToast, setAddedToast] = useState(false);
  const router = useRouter();

  const { addItem, setIsOpen } = useCartStore();
  const isAvailable = product.stockQuantity > 0;

  function handleAddToCart() {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      basePricePaise: product.basePricePaise,
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
      name: product.name,
      slug: product.slug,
      basePricePaise: product.basePricePaise,
      thumbnailUrl: product.thumbnailUrl,
      isSecondHand: product.isSecondHand,
      quantity,
      stockAvailable: product.stockQuantity,
    });

    router.push("/checkout");
  }

  return (
    <div className="space-y-4 pt-4 border-t border-zinc-200">
      {/* Toast Alert */}
      {addedToast && (
        <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>Added {quantity} unit(s) of "{product.name}" to your Flight Bag!</span>
        </div>
      )}

      {/* Quantity & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Quantity Controls */}
        <div className="flex items-center justify-between sm:justify-center rounded-full border border-zinc-300 bg-zinc-50 px-3 py-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1 || !isAvailable}
            className="p-1 text-zinc-500 hover:text-black disabled:opacity-30 transition"
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
            className="p-1 text-zinc-500 hover:text-black disabled:opacity-30 transition"
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
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 font-bold text-black transition-all hover:bg-[#b8e530] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-sm"
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{isAvailable ? "Add to Flight Bag" : "Out of Stock"}</span>
        </button>

        {/* Buy Now Direct Button */}
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={!isAvailable}
          className="flex-1 flex items-center justify-center gap-2 rounded-full bg-black py-3.5 px-6 font-bold text-white transition-all hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98 text-sm"
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
