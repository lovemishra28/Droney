"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plane, MessageCircle, Sparkles, ArrowRight } from "lucide-react";
import { getTopBarDealsAction, type TopBarDeal } from "@/server/actions/deals";

export function TopBar() {
  const [deals, setDeals] = useState<TopBarDeal[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeState, setFadeState] = useState<"visible" | "fade-out" | "fade-in">("visible");

  // Fetch real database deals on client mount
  useEffect(() => {
    let mounted = true;
    getTopBarDealsAction()
      .then((data) => {
        if (mounted && data.length > 0) {
          setDeals(data);
        }
      })
      .catch((err) => {
        console.error("Top bar deals fetch error:", err);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Top-to-bottom faded cycling animation (Increased display duration to 7 seconds)
  useEffect(() => {
    if (deals.length <= 1) return;

    const interval = setInterval(() => {
      // 1. Fade out downward
      setFadeState("fade-out");

      setTimeout(() => {
        // 2. Switch product and place at top
        setCurrentIndex((prev) => (prev + 1) % deals.length);
        setFadeState("fade-in");

        // 3. Smoothly animate down to centered view
        setTimeout(() => {
          setFadeState("visible");
        }, 50);
      }, 400);
    }, 7000);

    return () => clearInterval(interval);
  }, [deals.length]);

  const currentDeal = deals[currentIndex];

  return (
    <div className="w-full bg-black text-zinc-300 text-[11px] font-medium border-b border-[#18392f] select-none">
      <div className="mx-auto flex h-7 sm:h-7.5 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Left Side: Express Shipping & High-Discount Offer Ticker */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden py-0.5">
          {/* 1. Express shipping on all orders (Extreme Left) */}
          <div className="flex items-center gap-1.5 text-zinc-200 shrink-0 font-semibold text-[11px] sm:text-xs">
            <Plane className="h-3 w-3 text-[#c8f33b]" />
            <span>Express shipping on all orders</span>
          </div>

          {/* 2. Instant Offer Deal (Strictly >= 15% discount) */}
          {currentDeal && (
            <>
              <span className="text-[#204a3c] hidden sm:inline">•</span>

              <div className="hidden sm:flex items-center gap-2 overflow-hidden h-6">
                {/* Clean, attractive text without any box */}
                <span className="text-[#c8f33b] font-mono font-bold text-xs tracking-wider shrink-0">
                  {currentDeal.discountPercent}% OFF
                </span>

                <div className="overflow-hidden h-5 relative flex items-center">
                  <Link
                    href={`/product/${currentDeal.slug}`}
                    className={`flex items-center gap-1.5 text-[11px] sm:text-xs text-zinc-200 hover:text-[#c8f33b] transition-all font-medium ${
                      fadeState === "visible"
                        ? "opacity-100 translate-y-0 duration-400 ease-out"
                        : fadeState === "fade-out"
                          ? "opacity-0 translate-y-3 duration-400 ease-in"
                          : "opacity-0 -translate-y-3 duration-0"
                    }`}
                  >
                    <span className="truncate max-w-[180px] md:max-w-[280px]">
                      {currentDeal.shortName}
                    </span>
                    <span className="text-[#c8f33b] font-bold text-[10px] inline-flex items-center gap-0.5">
                      <span>View Deal</span>
                      <ArrowRight className="h-2.5 w-2.5 stroke-[3]" />
                    </span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right Side: Only WhatsApp */}
        <div className="flex items-center shrink-0">
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-zinc-300 hover:text-[#25D366] transition text-[11px] sm:text-xs font-semibold py-1 group"
          >
            <MessageCircle className="h-3.5 w-3.5 text-[#25D366] group-hover:scale-110 transition-transform" />
            <span>WhatsApp</span>
          </a>
        </div>

      </div>
    </div>
  );
}
