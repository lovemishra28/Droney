"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Moon,
  Sun,
  LogOut,
  ExternalLink,
} from "lucide-react";
import { useAdminTheme } from "@/components/admin/admin-theme-provider";
import { logoutAction } from "@/server/actions/auth";
import { notifyAuthStateChanged } from "@/lib/auth-client";

interface AdminTopbarProps {
  adminName?: string;
}

export function AdminTopbar({
  adminName = "Administrator",
}: AdminTopbarProps) {
  const router = useRouter();
  const { theme, toggleTheme } = useAdminTheme();

  // Search state matching public storefront header
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K listener focuses the in-place search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        searchInputRef.current?.blur();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      router.push(`/admin/products?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      await logoutAction();
      notifyAuthStateChanged();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("[Logout Error]:", err);
      window.location.href = "/login";
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xs transition-colors">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
        
        {/* Left: Brand Logo + Admin Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <Link href="/admin" className="inline-flex items-center gap-2.5 select-none group py-1">
            <span className="font-tech text-2xl sm:text-[27px] font-bold tracking-[0.05em] text-black dark:text-white leading-none uppercase">
              ALTITUDE
            </span>
            <span className="rounded-md bg-black dark:bg-[#c8f33b] text-[#c8f33b] dark:text-black font-mono text-[10px] font-black px-2 py-0.5 tracking-wider uppercase">
              ADMIN
            </span>
          </Link>
        </div>

        {/* Center: Search Bar expanded to fill all available space */}
        <div className="flex-1 min-w-0">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center w-full">
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search airframes, payloads, sensors, SKU..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-800 bg-[#f6f6f7] dark:bg-zinc-900 pl-9 pr-14 py-2 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:border-zinc-400 dark:focus:border-zinc-700 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none transition-all shadow-2xs font-medium"
            />
            <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />

            {searchTerm ? (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-3 p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-black dark:hover:text-white transition"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            ) : (
              <span className="pointer-events-none absolute right-3 hidden items-center rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-1.5 py-0.5 font-mono text-[10px] text-zinc-400 lg:inline-flex">
                ⌘K
              </span>
            )}
          </form>
        </div>

        {/* Right: Controls -> Live Site, minimal Dark Mode icon button, minimal Sign Out icon button */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* View Live Storefront Link */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900"
          >
            <span>Live Site</span>
            <ExternalLink className="h-3.5 w-3.5 opacity-60" />
          </Link>

          {/* Minimal Dark Mode / Light Mode Icon-Only Switcher */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-black dark:hover:text-white hover:border-zinc-300 dark:hover:border-zinc-700 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            {theme === "light" ? (
              <Moon className="h-4 w-4 text-zinc-700" />
            ) : (
              <Sun className="h-4 w-4 text-[#c8f33b]" />
            )}
          </button>

          {/* Minimal Admin Sign Out Icon-Only Button */}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign Out"
            title="Sign out of Admin Session"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-rose-200 dark:border-rose-950/80 bg-rose-50/60 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-950/60 hover:border-rose-300 dark:hover:border-rose-800 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>

      </div>
    </header>
  );
}
