"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Home, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";

export function MobileNav() {
  const pathname = usePathname();
  const { getItemCount, setIsOpen } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const itemCount = mounted ? getItemCount() : 0;

  return (
    <div className="fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t border-zinc-800 bg-zinc-950/90 px-4 backdrop-blur-lg md:hidden">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          pathname === "/" ? "text-indigo-400" : "text-zinc-400"
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/catalog"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          pathname.startsWith("/catalog") ? "text-indigo-400" : "text-zinc-400"
        }`}
      >
        <Grid className="h-5 w-5" />
        <span>Catalog</span>
      </Link>

      <Link
        href="/used-drones"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium ${
          pathname.startsWith("/used-drones")
            ? "text-amber-400"
            : "text-zinc-400"
        }`}
      >
        <ShieldCheck className="h-5 w-5" />
        <span>Used Gear</span>
      </Link>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="relative flex flex-col items-center gap-1 text-[11px] font-medium text-zinc-400"
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          {itemCount > 0 && (
            <span className="absolute -top-1.5 -right-2 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-indigo-600 text-[9px] font-bold text-white">
              {itemCount}
            </span>
          )}
        </div>
        <span>Cart</span>
      </button>
    </div>
  );
}
