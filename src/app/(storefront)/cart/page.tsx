"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Zap,
  ArrowLeft
} from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";

export default function CartPage() {
  const store = useCartStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const items = mounted ? store.items : [];
  const totalPaise = mounted ? store.getTotalPaise() : 0;
  const itemCount = mounted ? store.getItemCount() : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10 sm:py-14">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-6">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <span className="font-semibold text-black">Flight Bag</span>
        </div>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-200 pb-6 mb-8 gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              Flight Bag
            </h1>
            <span className="flex h-7 px-3 items-center justify-center rounded-full bg-[#c8f33b] text-xs font-black text-black">
              {itemCount} {itemCount === 1 ? "Item" : "Items"}
            </span>
          </div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-zinc-600 hover:text-black transition"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Continue Shopping</span>
          </Link>
        </div>

        {items.length === 0 ? (
          /* Empty Bag State */
          <div className="mx-auto max-w-md text-center py-16 px-4">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
              <ShoppingBag className="h-10 w-10 text-zinc-400" />
            </div>
            <h2 className="mt-6 text-xl font-bold text-black">Your flight bag is empty</h2>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500 leading-relaxed">
              Explore premier camera drones, FPV racing quads, and certified refurbished units with direct UPI settlement.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-xs sm:text-sm font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
              >
                <span>Browse New Drones</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/used-drones"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 text-xs sm:text-sm font-bold text-zinc-800 hover:bg-zinc-50 transition"
              >
                <span>Pre-Owned Fleet</span>
              </Link>
            </div>
          </div>
        ) : (
          /* Populated Cart Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            
            {/* Left 8 Cols: Itemized Product Table */}
            <div className="lg:col-span-8 space-y-4">
              <div className="divide-y divide-zinc-200 border-t border-b border-zinc-200">
                {items.map((item) => {
                  const lineTotalPaise = item.basePricePaise * item.quantity;
                  return (
                    <div key={item.productId} className="py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
                      
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-center gap-4 flex-1">
                        <Link 
                          href={`/product/${item.slug}`}
                          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100"
                        >
                          <Image
                            src={item.thumbnailUrl || "/images/altitude-hero-bg.jpg"}
                            alt={item.name}
                            fill
                            sizes="96px"
                            className="object-cover object-center"
                          />
                        </Link>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {item.isSecondHand && (
                              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                                Verified Pre-Owned
                              </span>
                            )}
                            <span className="text-[10px] font-mono text-zinc-400">
                              REF: {item.slug.slice(-10).toUpperCase()}
                            </span>
                          </div>

                          <Link
                            href={`/product/${item.slug}`}
                            className="text-base font-bold text-black hover:underline block"
                          >
                            {item.name}
                          </Link>

                          <div className="text-xs font-mono text-zinc-500">
                            Unit Price: {formatINR(item.basePricePaise)}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Selector & Line Item Price */}
                      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                        {/* Qty Box */}
                        <div className="flex items-center rounded-lg border border-zinc-300 bg-zinc-50">
                          <button
                            type="button"
                            onClick={() => store.updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-l-lg transition"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-9 text-center text-xs font-bold text-black">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            disabled={item.quantity >= item.stockAvailable}
                            onClick={() => store.updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1.5 text-zinc-600 hover:text-black hover:bg-zinc-200 rounded-r-lg transition disabled:opacity-40"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Total Line Price */}
                        <div className="text-right min-w-[100px]">
                          <div className="text-base font-black text-black">
                            {formatINR(lineTotalPaise)}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400">All Taxes Inc.</div>
                        </div>

                        {/* Remove Action */}
                        <button
                          type="button"
                          onClick={() => store.removeItem(item.productId)}
                          className="text-zinc-400 hover:text-rose-600 p-1 transition"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Clear Bag Action */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => store.clearCart()}
                  className="text-xs font-semibold text-zinc-500 hover:text-rose-600 transition"
                >
                  Clear Flight Bag
                </button>
              </div>
            </div>

            {/* Right 4 Cols: Order Summary & Checkout Box */}
            <div className="lg:col-span-4">
              <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-6 space-y-6 shadow-sm">
                
                <div className="border-b border-zinc-200 pb-4">
                  <h2 className="text-lg font-bold text-black">Order Summary</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Direct UPI QR settlement particulars</p>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between text-zinc-600">
                    <span>Subtotal ({itemCount} items)</span>
                    <span className="font-semibold text-black">{formatINR(totalPaise)}</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>GST (18% Input Credit)</span>
                    <span className="font-mono text-emerald-700 font-semibold">Included</span>
                  </div>

                  <div className="flex justify-between text-zinc-600">
                    <span>Air Express Delivery</span>
                    <span className="font-mono text-emerald-700 font-bold uppercase">FREE</span>
                  </div>
                </div>

                {/* Total Price */}
                <div className="border-t border-zinc-200 pt-4">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-xs font-bold text-black uppercase tracking-wider">Estimated Total</div>
                      <div className="text-[10px] text-zinc-500 font-mono">Guaranteed 10-Min Reservation</div>
                    </div>
                    <div className="text-2xl font-black text-black">
                      {formatINR(totalPaise)}
                    </div>
                  </div>
                </div>

                {/* Primary CTA Button */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] py-3.5 px-6 font-bold text-black hover:bg-[#b8e530] transition shadow-md active:scale-95 text-sm"
                >
                  <span>Proceed to UPI Checkout</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {/* Security and Guarantee Perks */}
                <div className="border-t border-zinc-200 pt-4 space-y-2.5 text-[11px] text-zinc-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>PostgreSQL row-locked inventory reservation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Dispatched via Blue Dart / Delhivery Express Air</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>0% Transaction markup via direct NPCI UPI</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
