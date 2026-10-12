"use client";

import React from "react";
import Link from "next/link";
import { Heart, ArrowRight, ShoppingBag } from "lucide-react";

export default function WishlistPage() {
  return (
    <div className="min-h-[70vh] bg-white text-zinc-900 py-16">
      <div className="mx-auto max-w-4xl px-4 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs">
          <Heart className="h-8 w-8 text-black fill-black" />
        </div>
        <h1 className="mt-6 text-3xl font-black tracking-tight text-black sm:text-4xl">
          Your Flight Wishlist
        </h1>
        <p className="mt-3 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Save high-performance camera drones, telemetry components, and certified pre-owned units to monitor drop announcements and instant UPI reservations.
        </p>

        <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-8 max-w-lg mx-auto shadow-xs">
          <p className="text-sm font-medium text-zinc-700">
            You currently have <strong className="text-black font-bold">0 items</strong> saved in your flight wishlist.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-sm font-bold text-black hover:bg-[#b8e530] transition-all shadow-xs"
            >
              <span>Explore New Drones</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/used-drones"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-100 transition-all shadow-xs"
            >
              <span>Pre-Owned Fleet</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
