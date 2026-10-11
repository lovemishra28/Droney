"use client";

import Link from "next/link";
import { Plane, ShoppingBag, Search, ShieldCheck } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function Header() {
  const totalItems = useCartStore((s) => s.getTotalItems());

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-wider text-zinc-100"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
              <Plane className="h-5 w-5 rotate-45" />
            </div>
            <span className="text-lg tracking-widest uppercase">AeroStore</span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium text-zinc-400 md:flex">
            <Link href="/catalog" className="transition hover:text-zinc-100">
              500+ SKU Catalog
            </Link>
            <Link
              href="/used-drones"
              className="flex items-center gap-1.5 transition hover:text-emerald-400"
            >
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Pre-Owned Fleet
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/catalog"
            className="hidden items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-400 hover:border-zinc-700 sm:flex"
          >
            <Search className="h-3.5 w-3.5" />
            <span>Search 500+ SKUs...</span>
          </Link>
          <Link
            href="/checkout"
            className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-200 hover:border-zinc-700"
          >
            <ShoppingBag className="h-4 w-4" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-bold text-zinc-950">
                {totalItems}
              </span>
            )}
          </Link>
          <Link
            href="/login"
            className="rounded-lg bg-zinc-100 px-3.5 py-2 text-xs font-semibold text-zinc-900 transition hover:bg-zinc-200"
          >
            Sign In
          </Link>
        </div>
      </div>
    </header>
  );
}
