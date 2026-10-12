"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Plane, 
  ShieldCheck, 
  Sliders, 
  PhoneCall, 
  ArrowRight,
  Sparkles
} from "lucide-react";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_ACTIONS = [
  { title: "Browse High-Performance Drones", category: "Drones", href: "/catalog?category=fpv-drones", icon: Plane },
  { title: "Pre-Owned Verified Fleet (Grade A)", category: "Pre-Owned", href: "/used-drones", icon: ShieldCheck },
  { title: "Modular UAV Kit Builder", category: "Tools", href: "/kit-builder", icon: Sliders },
  { title: "Consult Certified Flight Pilot", category: "Support", href: "/consult-pilot", icon: PhoneCall },
];

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) {
          onClose();
        }
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSelect(href: string) {
    onClose();
    router.push(href);
  }

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      router.push(`/catalog?q=${encodeURIComponent(query.trim())}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 p-4 pt-16 sm:pt-24 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl overflow-hidden rounded-2xl border border-zinc-700/80 bg-zinc-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3.5">
          <Search className="h-5 w-5 text-zinc-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gear, certified drones, prop, motors..."
            className="flex-1 bg-transparent text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none"
            autoFocus
          />
          <kbd className="hidden sm:inline-block rounded bg-zinc-800 px-2 py-0.5 text-[10px] font-mono text-zinc-400">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200"
          >
            <X className="h-5 w-5" />
          </button>
        </form>

        <div className="p-3">
          {query.trim() ? (
            <div className="p-2 space-y-2">
              <div
                onClick={() => handleSelect(`/catalog?q=${encodeURIComponent(query.trim())}`)}
                className="flex cursor-pointer items-center justify-between rounded-xl p-3 text-sm text-zinc-200 hover:bg-zinc-800 transition"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="h-4 w-4 text-[#c8f33b]" />
                  <span>Search all catalog for <strong className="text-white font-semibold">"{query}"</strong></span>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-400" />
              </div>
            </div>
          ) : (
            <div>
              <div className="px-3 py-1.5 text-[11px] font-mono font-semibold tracking-wider text-zinc-500 uppercase">
                Quick Navigation & Flight Tools
              </div>
              <div className="space-y-1 mt-1">
                {QUICK_ACTIONS.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.href}
                      onClick={() => handleSelect(item.href)}
                      className="flex cursor-pointer items-center justify-between rounded-xl p-2.5 text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-800 text-zinc-300 group-hover:bg-[#c8f33b] group-hover:text-black transition">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <span className="font-medium text-xs sm:text-sm">{item.title}</span>
                      </div>
                      <span className="text-[10px] text-zinc-500 font-mono">{item.category}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
