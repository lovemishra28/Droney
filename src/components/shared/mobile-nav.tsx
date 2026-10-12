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
    <div className="fixed right-0 bottom-0 left-0 z-40 flex h-16 items-center justify-around border-t border-zinc-200 bg-white/95 px-4 backdrop-blur-lg md:hidden shadow-lg">
      <Link
        href="/"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
          pathname === "/" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
        }`}
      >
        <Home className="h-5 w-5" />
        <span>Home</span>
      </Link>

      <Link
        href="/catalog"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
          pathname.startsWith("/catalog") ? "text-black font-bold" : "text-zinc-500 hover:text-black"
        }`}
      >
        <Grid className="h-5 w-5" />
        <span>Catalog</span>
      </Link>

      <Link
        href="/used-drones"
        className={`flex flex-col items-center gap-1 text-[11px] font-medium transition ${
          pathname.startsWith("/used-drones")
            ? "text-black font-bold"
            : "text-zinc-500 hover:text-black"
        }`}
      >
        <ShieldCheck className="h-5 w-5" />
        <span>Pre-Owned</span>
      </Link>

      <Link
        href="/cart"
        className={`relative flex flex-col items-center gap-1 text-[11px] font-medium transition ${
          pathname === "/cart" ? "text-black font-bold" : "text-zinc-500 hover:text-black"
        }`}
      >
        <div className="relative">
          <ShoppingBag className="h-5 w-5" />
          <span className="absolute -top-1.5 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#c8f33b] text-[10px] font-black text-black">
            {itemCount}
          </span>
        </div>
        <span>Bag</span>
      </Link>
    </div>
  );
}
