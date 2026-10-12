"use client";

import React, { useState, useEffect, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Lock, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { SearchModal } from "@/components/shared/search-modal";

import { TopBar } from "@/components/shared/top-bar";

export function Header() {
  const { getItemCount, setIsOpen } = useCartStore();
  const router = useRouter();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Real dynamic bag count
  const itemCount = mounted ? getItemCount() : 0;

  // Global ⌘K / Ctrl+K listener
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      {/* 1. Slim Top Bar Above Header */}
      <TopBar />

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-xs transition-colors">
        <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Left: Brand Logo & Subtitle & Search */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              {/* Black rounded square with neon lime upward arrow/triangle */}
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black shadow-xs transition group-hover:scale-105">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L21 20H3L12 4Z" fill="#c8f33b" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[17px] font-black tracking-wider text-black leading-tight uppercase font-sans">
                  ALTITUDE
                </span>
                <span className="text-[9px] font-semibold tracking-[0.22em] text-zinc-400 uppercase leading-none mt-0.5">
                  AVIATION TECH
                </span>
              </div>
            </Link>

            {/* Search Pill Input with ⌘K badge */}
            <div 
              onClick={() => setSearchOpen(true)}
              className="hidden lg:flex items-center gap-2.5 rounded-full border border-zinc-200/80 bg-zinc-100/80 px-3.5 py-1.5 text-xs text-zinc-500 cursor-pointer hover:border-zinc-300 hover:bg-zinc-100 transition-all w-60 xl:w-68"
            >
              <Search className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
              <span className="truncate text-xs text-zinc-500 flex-1">
                Search gear, certified drones, prop
              </span>
              <kbd className="inline-flex items-center rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 shadow-xs">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* Right Cluster: Nav links shifted to right + Divider + Wishlist & Bag */}
          <div className="flex items-center gap-4 lg:gap-5">
            <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-sm font-medium text-zinc-700">
              <Link
                href="/catalog?category=drones"
                className="transition-colors hover:text-black"
              >
                Drones
              </Link>
              
              <Link
                href="/used-drones"
                className="inline-flex items-center gap-1.5 transition-colors hover:text-black group"
              >
                <span>Pre-Owned</span>
                <span className="rounded-full border border-zinc-200 bg-zinc-100 px-1.5 py-0.5 text-[10px] font-semibold text-zinc-600 transition group-hover:border-zinc-300">
                  Verified
                </span>
              </Link>

              <Link
                href="/catalog?category=accessories"
                className="transition-colors hover:text-black"
              >
                Accessories
              </Link>

              <Link
                href="/kit-builder"
                className="transition-colors hover:text-black"
              >
                Kit Builder
              </Link>

              <Link
                href="/consult-pilot"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Consult Pilot
              </Link>
            </nav>

            {/* Subtle Minimal Vertical Separator */}
            <div className="hidden md:block h-5 w-[1px] bg-zinc-200" />

            {/* Utility Actions (Search trigger on mobile, Wishlist & Flight Bag) */}
            <div className="flex items-center gap-2.5">
              {/* Search icon trigger for mobile/tablet */}
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search"
                className="lg:hidden flex h-9 w-9 items-center justify-center rounded-full text-zinc-600 hover:bg-zinc-100 transition"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* User Profile Link (to the left of Heart) */}
              <Link
                href="/account"
                className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:text-black hover:bg-zinc-100 transition"
                aria-label="Pilot Account Profile"
              >
                <User className="h-4 w-4" />
              </Link>

              {/* Wishlist Link */}
              <Link
                href="/wishlist"
                className="relative flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:text-black hover:bg-zinc-100 transition"
                aria-label="Wishlist"
              >
                <Heart className="h-4 w-4" />
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2 items-center justify-center text-[10px] font-bold text-emerald-600">
                  0
                </span>
              </Link>

              {/* Bag Pill Link to Dedicated /cart Page */}
              <Link
                href="/cart"
                className="flex items-center gap-2 rounded-full bg-black px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-zinc-800 transition active:scale-95"
                aria-label="View Flight Bag"
              >
                <ShoppingBag className="h-3.5 w-3.5 text-white" />
                <span className="font-medium">Bag</span>
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-[#c8f33b] text-[11px] font-black text-black">
                  {itemCount}
                </span>
              </Link>

              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden flex h-9 w-9 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-5 space-y-3 shadow-lg">
            <Link
              href="/catalog?category=drones"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Drones
            </Link>
            <Link
              href="/used-drones"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              <span>Pre-Owned Fleet</span>
              <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-[10px] font-bold text-zinc-600">
                Verified
              </span>
            </Link>
            <Link
              href="/catalog?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Accessories
            </Link>
            <Link
              href="/kit-builder"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Kit Builder
            </Link>
            <Link
              href="/consult-pilot"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-bold text-emerald-600 hover:text-emerald-700"
            >
              Consult Pilot
            </Link>
          </div>
        )}
      </header>

      {/* Global Command Palette Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
