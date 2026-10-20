"use client";

import React, { useState, useEffect, useRef, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, Heart, ShoppingBag, Menu, X, User } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { useWishlistStore } from "@/stores/wishlist-store";
import { TopBar } from "@/components/shared/top-bar";
import { CategoryNav } from "@/components/shared/category-nav";
import { useUserSession } from "@/lib/auth-client";
import { quickSearchAction, type QuickSearchResultItem } from "@/server/actions/deals";
import { formatINR } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/media";

interface HeaderProps {
  initialNavProducts?: any[];
}

export function Header({ initialNavProducts = [] }: HeaderProps) {
  const { getItemCount } = useCartStore();
  const wishlistItems = useWishlistStore((state) => state.items);
  const session = useUserSession();
  const router = useRouter();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-place live search states
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<QuickSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Real dynamic bag and wishlist count
  const itemCount = mounted ? getItemCount() : 0;
  const wishlistCount = mounted ? wishlistItems.length : 0;

  // Global ⌘K / Ctrl+K listener focuses the in-place search input
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        setSearchFocused(true);
      }
      if (e.key === "Escape") {
        setSearchFocused(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search query
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    const handler = setTimeout(() => {
      quickSearchAction(searchTerm.trim())
        .then((res) => {
          setSearchResults(res);
        })
        .finally(() => setIsSearching(false));
    }, 220);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSearchFocused(false);
      router.push(`/catalog?q=${encodeURIComponent(searchTerm.trim())}`);
    }
  }

  return (
    <>
      {/* 1. Slim Top Bar Above Header */}
      <TopBar />

      <header className="sticky top-0 z-40 w-full border-b border-zinc-200/90 bg-white/95 backdrop-blur-md shadow-2xs transition-colors">
        {/* Main Row: Logo + Real In-place Search Bar (Left/Center) & Clean Utility Icons (Right) */}
        <div className="mx-auto flex h-16 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6">
          
          {/* Left: Brand Logo & Boxy In-Place Search Bar */}
          <div className="flex min-w-0 flex-1 items-center gap-5 sm:gap-7">
            {/* Robotic Tech Logo without green dot */}
            <Link
              href={session.role === "admin" ? "/?live=true" : "/"}
              className="inline-flex items-center select-none group shrink-0 py-1"
            >
              <span className="font-tech text-2xl sm:text-[27px] font-bold tracking-[0.05em] text-black leading-none uppercase">
                ALTITUDE
              </span>
            </Link>

            {/* In-Place Search Input with Live Floating Dropdown (No full-screen blur modal) */}
            <div ref={searchContainerRef} className="relative flex-1 hidden md:block">
              <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  placeholder="Search airframes, payloads, sensors..."
                  className="w-full rounded-lg border border-zinc-200 bg-[#f6f6f7] pl-9 pr-12 py-2 text-xs text-zinc-900 placeholder-zinc-500 focus:border-zinc-400 focus:bg-white focus:outline-none transition-all shadow-2xs font-medium"
                />
                <Search className="absolute left-3 h-3.5 w-3.5 text-zinc-400 pointer-events-none" />
                
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSearchResults([]);
                    }}
                    className="absolute right-2.5 p-0.5 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-black transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : (
                  <kbd className="absolute right-2.5 hidden lg:inline-flex items-center rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-mono text-zinc-400 shadow-2xs pointer-events-none">
                    ⌘K
                  </kbd>
                )}
              </form>

              {/* Floating Live Product Recommendations Dropdown */}
              {searchFocused && searchTerm.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 rounded-xl border border-zinc-200 bg-white shadow-2xl z-50 overflow-hidden divide-y divide-zinc-100 animate-in fade-in-50 duration-150">
                  {isSearching ? (
                    <div className="p-4 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                      <span className="h-3 w-3 rounded-full border-2 border-zinc-400 border-t-black animate-spin" />
                      <span>Searching flight fleet...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="py-1">
                      <div className="px-3.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 bg-zinc-50 border-b border-zinc-100 flex justify-between items-center">
                        <span>Matching Drones & Components</span>
                        <span>{searchResults.length} found</span>
                      </div>
                      {searchResults.map((item) => (
                        <Link
                          key={item.id}
                          href={`/product/${item.slug}`}
                          onClick={() => {
                            setSearchFocused(false);
                            setSearchTerm("");
                          }}
                          className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-zinc-50 transition-colors group cursor-pointer"
                        >
                          <div className="relative h-9 w-9 rounded-md border border-zinc-200 bg-zinc-100 overflow-hidden shrink-0">
                            <Image
                              src={resolveImageUrl(item.thumbnailUrl, item.name)}
                              alt={item.name}
                              fill
                              sizes="36px"
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-bold text-zinc-900 group-hover:text-black truncate">
                                {item.name}
                              </p>
                              {item.isSecondHand && (
                                <span className="rounded bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800 shrink-0">
                                  Pre-Owned
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] font-mono text-zinc-400">{item.sku}</p>
                          </div>
                          <span className="text-xs font-bold font-mono text-black shrink-0">
                            {formatINR(item.basePricePaise)}
                          </span>
                        </Link>
                      ))}
                      <Link
                        href={`/catalog?q=${encodeURIComponent(searchTerm.trim())}`}
                        onClick={() => setSearchFocused(false)}
                        className="block bg-zinc-50 px-3.5 py-2 text-center text-xs font-bold text-black hover:bg-zinc-100 border-t border-zinc-100 transition"
                      >
                        See all results for &quot;{searchTerm}&quot; →
                      </Link>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-xs text-zinc-500">
                      No drones or gear matching &quot;{searchTerm}&quot; found.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right: User Authentication / Create Account + Wishlist + Clean Bag Icon */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            {/* User Session Condition: Create Account if not logged in; User Name + Icon if logged in */}
            {session.isAuthenticated ? (
              <Link
                href={session.role === "admin" ? "/admin" : "/account"}
                className="flex items-center gap-1.5 text-zinc-800 hover:text-black transition"
                aria-label="Pilot Account Profile"
              >
                <span className="text-xs font-semibold text-zinc-800 max-w-[120px] truncate hidden sm:inline">
                  {session.role === "admin" ? "Admin Panel" : session.fullName || "Pilot"}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100 transition">
                  <User className="h-4 w-4" />
                </div>
              </Link>
            ) : (
              <Link
                href="/login"
                className="font-tech text-xs sm:text-sm font-semibold tracking-wider text-black hover:text-zinc-600 transition uppercase"
              >
                Create Account
              </Link>
            )}

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 hover:text-black hover:bg-zinc-100 transition"
              aria-label="Wishlist"
            >
              <Heart className="h-4 w-4" />
              {wishlistCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Clean Bag Icon (Black container and word "Bag" removed) */}
            <Link
              href="/cart"
              className="relative flex h-8 w-8 items-center justify-center rounded-full text-zinc-800 hover:text-black hover:bg-zinc-100 transition"
              aria-label="View Flight Bag"
            >
              <ShoppingBag className="h-4 w-4" />
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-black text-[8px] font-bold text-white shadow-xs">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Mobile menu toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-full text-zinc-700 hover:bg-zinc-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Row 2: Secondary Category Navigation Bar with Mega Menu */}
        <CategoryNav initialProducts={initialNavProducts} />

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-4 py-5 space-y-3 shadow-lg max-h-[80vh] overflow-y-auto">
            {/* Mobile Search input */}
            <form onSubmit={handleSearchSubmit} className="relative pb-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search drones, components..."
                className="w-full rounded-lg border border-zinc-200 bg-zinc-50 pl-8 pr-3 py-2 text-xs text-black"
              />
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
            </form>

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
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Pre-Owned Fleet
            </Link>
            <Link
              href="/catalog?category=accessories"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Accessories
            </Link>
            <Link
              href="/catalog?category=motors"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Propellers & Motors
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
              className="block py-2 text-sm font-semibold text-zinc-800 hover:text-black"
            >
              Consult Pilot
            </Link>
          </div>
        )}
      </header>
    </>
  );
}
