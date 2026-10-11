"use client";

import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import Link from "next/link";
import { Trash2, ShoppingBag, X } from "lucide-react";

interface CartSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSheet({ isOpen, onClose }: CartSheetProps) {
  const { items, updateQuantity, removeItem, getTotalPaise } = useCartStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs">
      <div className="flex h-full w-full max-w-md flex-col border-l border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-emerald-400" />
            <h3 className="font-bold text-zinc-100">Flight Cart</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto py-4">
          {items.length === 0 ? (
            <p className="py-12 text-center text-sm text-zinc-500">
              Your cart is empty. Add motors, props, or frames to get started.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <div>
                  <h4 className="text-sm font-semibold text-zinc-200">
                    {item.name}
                  </h4>
                  <p className="text-xs text-zinc-400">
                    {formatINR(item.basePricePaise)} × {item.quantity}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    className="h-7 w-7 rounded bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700"
                  >
                    -
                  </button>
                  <span className="text-xs text-zinc-200">{item.quantity}</span>
                  <button
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    className="h-7 w-7 rounded bg-zinc-800 text-sm text-zinc-300 hover:bg-zinc-700"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="ml-2 text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="space-y-4 border-t border-zinc-800 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Subtotal</span>
              <span className="font-bold text-zinc-100">
                {formatINR(getTotalPaise())}
              </span>
            </div>
            <Link
              href="/checkout"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-lg bg-emerald-500 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400"
            >
              Proceed to Direct UPI Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
