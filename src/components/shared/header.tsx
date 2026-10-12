"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, Search, ShoppingBag, ShieldCheck, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function Header() {
  const { getItemCount, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Plane className="h-5 w-5 rotate-45" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-zinc-100">
              AERO<span className="text-indigo-400">STORE</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
          <Link
            href="/catalog"
            className="transition-colors hover:text-zinc-100"
          >
            All Hardware
          </Link>
          <Link
            href="/catalog?category=fpv-drones"
            className="transition-colors hover:text-zinc-100"
          >
            BNF & RTF Drones
          </Link>
          <Link
            href="/catalog?category=motors"
            className="transition-colors hover:text-zinc-100"
          >
            Motors & ESCs
          </Link>
          <Link
            href="/used-drones"
            className="flex items-center gap-1.5 text-amber-400 transition-colors hover:text-amber-300"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Pre-Owned Fleet</span>
          </Link>
        </nav>

        {/* Utility Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/catalog"
            className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-1.5 text-xs text-zinc-400 transition-all hover:border-zinc-700 hover:text-zinc-200"
          >
            <Search className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Search 500+ SKUs...</span>
          </Link>

          {/* Cart Trigger */}
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            aria-label="Open shopping cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
          >
            <ShoppingBag className="h-4 w-4" />
            {itemCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white shadow">
                {itemCount}
              </span>
            )}
          </button>

          {/* Auth Login Trigger */}
          <Link
            href="/login"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:border-zinc-700 hover:text-zinc-100"
            aria-label="Account Login"
          >
            <User className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
