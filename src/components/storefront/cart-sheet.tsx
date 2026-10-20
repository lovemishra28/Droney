"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Minus, Plus, Shield, ShoppingBag, Trash2, X } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";

interface CartSheetProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function CartSheet({
  isOpen: propIsOpen,
  onClose: propOnClose,
}: CartSheetProps = {}) {
  const store = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isOpen = propIsOpen !== undefined ? propIsOpen : store.isOpen;
  const handleClose = () => {
    if (propOnClose) {
      propOnClose();
    } else {
      store.setIsOpen(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const { items, updateQuantity, removeItem, getTotalPaise } = store;
  const totalPaise = getTotalPaise();
  const hasAnyInsurance = items.some((i) => i.hasInsurance);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      {/* Slide-out Sheet Panel */}
      <div className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-950 p-6 text-zinc-100 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-[#c8f33b]" />
            <h2 className="text-lg font-bold tracking-tight text-white">Your Flight Bag</h2>
            <span className="rounded-full bg-[#c8f33b] px-2 py-0.5 text-xs font-bold text-black">
              {items.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Cart Item Listing */}
        <div className="flex-1 scrollbar-thin overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
              <ShoppingBag className="h-12 w-12 text-zinc-700" />
              <p className="text-sm text-zinc-400">
                Your shopping cart is empty.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 text-xs font-semibold tracking-wider text-[#c8f33b] uppercase hover:underline"
              >
                Browse Catalog
              </button>
            </div>
          ) : (
            <ul className="flex flex-col divide-y divide-zinc-800/80">
              {items.map((item) => (
                <li key={item.productId} className="flex gap-4 py-4">
                  {/* Thumbnail */}
                  <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                    <Image
                      src={
                        item.thumbnailUrl ||
                        "/images/altitude-hero-bg.jpg"
                      }
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={handleClose}
                          className="line-clamp-1 text-sm font-medium text-white transition-colors hover:text-[#c8f33b]"
                        >
                          {item.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="text-zinc-500 hover:text-rose-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {item.isSecondHand && (
                        <span className="mt-0.5 inline-block text-[10px] font-semibold tracking-wider text-amber-400 uppercase">
                          Pre-Owned
                        </span>
                      )}

                      {item.hasInsurance && (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <Shield className="h-3 w-3" />
                          <span>Fly Care Insured</span>
                        </span>
                      )}

                      <p className="mt-1 text-sm font-semibold text-zinc-200">
                        {formatINR(item.basePricePaise)}
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-zinc-800 bg-zinc-900">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity - 1)
                          }
                          className="p-1 text-zinc-400 hover:text-zinc-200"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-medium">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.quantity >= item.stockAvailable}
                          onClick={() =>
                            updateQuantity(item.productId, item.quantity + 1)
                          }
                          className="p-1 text-zinc-400 hover:text-zinc-200 disabled:opacity-40"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      {item.quantity >= item.stockAvailable && (
                        <span className="text-[10px] text-amber-500">
                          Max stock
                        </span>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer & Direct Checkout Call to Action */}
        {items.length > 0 && (
          <div className="border-t border-zinc-800 pt-4">
            <div className="flex justify-between py-1 text-sm text-zinc-400">
              <span>Subtotal</span>
              <span className="font-semibold text-zinc-100">
                {formatINR(totalPaise)}
              </span>
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              Shipping & taxes calculated at checkout via UPI.
            </p>

            {/* Avail Fly Care Insurance Option in Cart */}
            <div
              onClick={() => store.setAllInsurance(!hasAnyInsurance)}
              className={`mt-3 cursor-pointer rounded-xl border p-3 transition-all duration-200 select-none ${
                hasAnyInsurance
                  ? "border-emerald-500/60 bg-emerald-950/30 text-emerald-100 ring-1 ring-emerald-500/40"
                  : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 text-zinc-300"
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                    hasAnyInsurance
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : "border-zinc-600 bg-zinc-800"
                  }`}
                >
                  {hasAnyInsurance && <Check className="h-3 w-3 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                      <Shield className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Avail Fly Care Insurance</span>
                    </span>
                    <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded uppercase">
                      {hasAnyInsurance ? "Active" : "Optional"}
                    </span>
                  </div>
                  <p className="mt-0.5 text-[10px] text-zinc-400 leading-tight">
                    Instant crash and accidental damage cover across all airframes in bag.
                  </p>
                </div>
              </div>
            </div>

            <Link
              href="/checkout"
              onClick={handleClose}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#c8f33b] px-4 py-3.5 text-sm font-bold text-black shadow-lg transition-all hover:bg-[#b8e530] active:scale-95"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
