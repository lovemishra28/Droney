"use client";

import React from "react";
import Link from "next/link";
import { Plane, Phone, MessageCircle, User } from "lucide-react";

export function TopBar() {
  return (
    <div className="w-full bg-black text-zinc-300 text-[11px] font-medium border-b border-zinc-800">
      <div className="mx-auto flex h-7 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left Side: Certifications & Express Shipping */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8f33b] shadow-[0_0_6px_#c8f33b]" />
            <span className="font-semibold text-white">Authorised Indian retailer</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-zinc-400 hover:text-zinc-200 transition">
            <Plane className="h-3 w-3 text-[#c8f33b]" />
            <span>Express shipping on all orders</span>
          </div>
        </div>

        {/* Right Side: Contact, WhatsApp, Sign In */}
        <div className="flex items-center gap-3 sm:gap-5 text-zinc-400">
          <a
            href="tel:+919876543210"
            className="hidden md:flex items-center gap-1.5 hover:text-white transition"
          >
            <Phone className="h-2.5 w-2.5 text-zinc-400" />
            <span>+91 98765 43210</span>
          </a>

          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-[#25D366] transition text-zinc-300"
          >
            <MessageCircle className="h-3 w-3 text-[#25D366]" />
            <span className="font-semibold">WhatsApp</span>
          </a>

          <span className="h-3 w-[1px] bg-zinc-800 hidden sm:block" />

          <Link
            href="/login"
            className="flex items-center gap-1.5 hover:text-white transition text-zinc-300 font-semibold"
          >
            <User className="h-3 w-3 text-zinc-400" />
            <span>Sign in</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
