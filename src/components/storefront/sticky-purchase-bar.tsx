"use client";

import React, { useState } from "react";
import { Check, Plus, ShoppingBag } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

interface StickyPurchaseBarProps {
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

export function StickyPurchaseBar({ product }: StickyPurchaseBarProps) {
  const { addItem, items, setIsOpen } = useCartStore();
  const [addedRecently, setAddedRecently] = useState(false);

  const isInCart = items.some((i) => i.productId === product.id);
  const isAvailable = product.stockQuantity > 0;

  const handleAddToCart = () => {
    if (!isAvailable) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      basePricePaise: product.basePricePaise,
      thumbnailUrl: product.thumbnailUrl,
      isSecondHand: product.isSecondHand,
      stockAvailable: product.stockQuantity,
    });

    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1200);
  };

  const handleInstantBuy = () => {
    if (!isInCart) {
      handleAddToCart();
    }
    setIsOpen(true);
  };

  return (
    <div className="fixed right-0 bottom-16 left-0 z-30 border-t border-zinc-800 bg-zinc-950/95 p-3.5 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
            Total Price
          </span>
          <p className="text-base font-bold text-zinc-100">
            {formatINR(product.basePricePaise)}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            className={`flex h-10 items-center justify-center rounded-xl px-3.5 text-xs font-semibold transition-all ${
              !isAvailable
                ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                : addedRecently
                  ? "bg-emerald-600 text-white"
                  : isInCart
                    ? "border border-zinc-700 bg-zinc-900 text-zinc-200"
                    : "border border-zinc-700 bg-zinc-800 text-zinc-100"
            }`}
          >
            {addedRecently ? (
              <Check className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
          </button>

          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleInstantBuy}
            className={`flex h-10 items-center gap-1.5 rounded-xl px-4 text-xs font-semibold text-white shadow-lg transition-colors ${
              isAvailable
                ? "bg-indigo-600 hover:bg-indigo-500"
                : "cursor-not-allowed bg-zinc-800 text-zinc-500"
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            <span>{isAvailable ? "Buy via UPI" : "Out of Stock"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
