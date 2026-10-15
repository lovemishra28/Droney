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
              <div className="inline-flex items-center select-none group">
                <span className="font-tech text-2xl font-bold tracking-[0.05em] text-white leading-none uppercase">
                  ALTITUDE
                </span>
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
              DRONE FLEET
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/catalog?category=mini-series" className="hover:text-white transition">
                  Mini Series (&lt;249g)
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=air-series" className="hover:text-white transition">
                  Air Series (Dual-Camera)
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=mavic-series" className="hover:text-white transition">
                  Mavic Flagship Cinema
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=avata-series" className="hover:text-white transition">
                  Avata &amp; Motion FPV
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
            </ul>
          </div>

          {/* Column 3: ACCESSORIES & SPARES (2.5 Cols) */}
          <div className="lg:col-span-3">
            <h4 className="text-xs font-mono font-bold tracking-wider text-white uppercase">
              ACCESSORIES &amp; SPARES
            </h4>
            <ul className="mt-4 space-y-2.5 text-xs text-zinc-400">
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  Intelligent Flight Batteries
                </Link>
              </li>
              <li>
                <Link href="/product/dji-rc-2-remote-controller" className="hover:text-white transition">
                  DJI RC 2 Smart Controller
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  Optical Cinema ND Glass
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  Low-Noise Propellers
                </Link>
              </li>
              <li>
                <Link href="/catalog?category=accessories" className="hover:text-white transition">
                  Explorer Waterproof Cases
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
