import Link from "next/link";
import { Sliders, PhoneCall } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-zinc-900 bg-black text-zinc-400">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
        
        {/* 4 Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          
          {/* Column 1: Brand & Address (4 Cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black border border-white/20 shadow-xs">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 4L21 20H3L12 4Z" fill="#c8f33b" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-base font-black tracking-wider text-white uppercase font-sans">
                  ALTITUDE
                </span>
                <span className="text-[8px] font-semibold tracking-[0.2em] text-zinc-500 uppercase">
                  AVIATION TECH
                </span>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-zinc-400 max-w-sm">
              The premier hub in India for aerial cinematography, certified pre-owned drones, FPV race conversions, and certified flight consultations.
            </p>

            <p className="text-xs text-zinc-500 font-mono">
              Altitude Tech Hub • Indiranagar, Bengaluru, KA 560038
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs font-medium text-zinc-400">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                Instagram
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                YouTube Flight LAB
              </a>
              <span className="text-zinc-700">•</span>
              <a
                href="https://whatsapp.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition"
              >
                WhatsApp Community
              </a>
            </div>
          </div>

          {/* Column 2: DRONES (2.5 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              DRONES
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/catalog" className="hover:text-white transition">
                  Camera Drones
                </Link>
              </li>
              <li>
                <Link href="/used-drones" className="hover:text-white transition flex items-center gap-1.5">
                  <span>Certified Pre-Owned</span>
                  <span className="rounded bg-[#c8f33b]/20 text-[#c8f33b] px-1.5 py-0.2 text-[9px] font-bold">
                    Verified
                  </span>
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=fpv-drones" className="hover:text-white transition">
                  Cinematic FPV
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=camera-drones" className="hover:text-white transition">
                  Sub-249g Micro Platforms
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-white transition">
                  Enterprise Mapping
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: HARDWARE & LAB (2.5 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              HARDWARE &amp; LAB
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  Intelligent Batteries
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  ND Cinema Glass
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=motors" className="hover:text-white transition">
                  Motors &amp; ESC Stacks
                </Link>
              </li>
              <li>
                <Link href="/kit-builder" className="hover:text-white transition flex items-center gap-1.5">
                  <Sliders className="h-3.5 w-3.5 text-[#c8f33b]" />
                  <span>Carbon Frames</span>
                </Link>
              </li>
              <li>
                <Link href="/kit-builder" className="hover:text-white transition">
                  Custom Build Sandbox
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: SUPPORT & LEGAL (2 Cols) */}
          <div className="lg:col-span-2">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              SUPPORT &amp; LEGAL
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/consult-pilot" className="hover:text-[#c8f33b] transition flex items-center gap-1 text-emerald-400 font-medium">
                  <PhoneCall className="h-3 w-3" />
                  <span>Book 1-on-1 Consultation</span>
                </Link>
              </li>
              <li>
                <Link href="/trade-in" className="hover:text-white transition">
                  Trade-In Your Gear
                </Link>
              </li>
              <li>
                <Link href="/journal/first-drone-guide" className="hover:text-white transition">
                  DGCA Drone Laws &amp; FAQs
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="hover:text-white transition">
                  Shipping &amp; Transit Times
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-white transition">
                  30-Day Return Guarantee
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-500">
          <p>
            &copy; 2026 Altitude Aviation Tech Pvt. Ltd. All rights reserved. Proudly made in India across 19,000+ PIN codes.
          </p>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-zinc-400 font-mono text-[10px]">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>All systems nominal (Connection 04)</span>
            </span>
            <span className="text-zinc-700">•</span>
            <Link href="/returns" className="hover:text-zinc-300 transition">
              Privacy Policy
            </Link>
            <span className="text-zinc-700">•</span>
            <Link href="/shipping" className="hover:text-zinc-300 transition">
              Terms of Flight
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
