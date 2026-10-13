"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Wrench,
  Radio,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
} from "lucide-react";

interface SubLink {
  label: string;
  href: string;
  badge?: string;
  badgeColor?: "amber" | "lime" | "emerald" | "zinc";
}

interface MenuColumn {
  heading: string;
  links: SubLink[];
}

interface MegaMenuContent {
  callout: {
    tag: string;
    title: string;
    description: string;
    linkText: string;
    linkHref: string;
  };
  columns: MenuColumn[];
  featured: {
    badge: string;
    name: string;
    subtitle: string;
    specs: string[];
    price: string;
    image: string;
    href: string;
  };
}

const MEGA_MENUS: Record<string, MegaMenuContent> = {
  drones: {
    callout: {
      tag: "AUTHORISED DEALER",
      title: "Engineered for Aerial Dominance",
      description:
        "Direct tier-1 partner with DJI, BetaFPV, and Autel. 100% genuine hardware with official manufacturer warranties and DGCA compliance.",
      linkText: "Explore Entire Fleet",
      linkHref: "/catalog?category=drones",
    },
    columns: [
      {
        heading: "BY CATEGORY",
        links: [
          { label: "Camera Drones", href: "/catalog?category=camera-drones", badge: "NEW", badgeColor: "lime" },
          { label: "FPV Racing & Freestyle", href: "/catalog?category=fpv-drones", badge: "HOT", badgeColor: "amber" },
          { label: "Mini Drones (<249g)", href: "/catalog?category=mini-drone" },
          { label: "Professional & Cinema", href: "/catalog?category=professional-drone" },
          { label: "Enterprise & Surveying", href: "/catalog?category=drones" },
        ],
      },
      {
        heading: "FLAGSHIP FLEET",
        links: [
          { label: "DJI Air 3S Combo", href: "/products/dji-air-3s-drn-dji-a3s", badge: "NEW", badgeColor: "lime" },
          { label: "DJI Mavic 3 Pro Cine", href: "/products/dji-mavic-3-pro-drn-dji-m3p" },
          { label: "DJI Avata 2 FPV", href: "/products/dji-avata-2-fpv-drn-dji-av2" },
          { label: "DJI Neo Palm Drone", href: "/products/dji-neo-drn-dji-neo", badge: "135G", badgeColor: "zinc" },
          { label: "AeroX 5\" Freestyle BNF", href: "/products/aerox-5-inch-freestyle-bnf-drn-fpv-001" },
        ],
      },
      {
        heading: "CERTIFICATIONS & LAB",
        links: [
          { label: "Verified Pre-Owned", href: "/used-drones", badge: "Save 40%", badgeColor: "amber" },
          { label: "32-Point Flight Inspection", href: "/used-drones" },
          { label: "DGCA Compliance Support", href: "/consult-pilot" },
          { label: "1-on-1 Pilot Consultation", href: "/consult-pilot", badge: "LIVE", badgeColor: "emerald" },
        ],
      },
    ],
    featured: {
      badge: "NEW ARRIVAL 2026",
      name: "DJI Air 3S Fly More Combo",
      subtitle: "Dual-camera 1-inch CMOS system with 45-min flight time & nightscape omnidirectional sensing.",
      specs: ["1\" CMOS Primary 50MP", "45-Min Endurance", "O4 20km Video Feed"],
      price: "₹1,49,990",
      image: "/images/dji-air-3s.jpg",
      href: "/products/dji-air-3s-drn-dji-a3s",
    },
  },
  preowned: {
    callout: {
      tag: "CERTIFIED REFURBISHED",
      title: "Pre-Owned, Flight-Lab Verified",
      description:
        "Every pre-owned aircraft passes our stringent 32-point telemetry test, battery cycle analysis, and gimble calibration before certification.",
      linkText: "Shop Pre-Owned Fleet",
      linkHref: "/used-drones",
    },
    columns: [
      {
        heading: "CERTIFICATION TIERS",
        links: [
          { label: "Grade A+ Pristine", href: "/used-drones", badge: "MINT", badgeColor: "emerald" },
          { label: "Grade A Excellent", href: "/used-drones" },
          { label: "Flight-Ready Tested", href: "/used-drones" },
          { label: "Open-Box Flight Packs", href: "/used-drones", badge: "SPECIAL", badgeColor: "amber" },
        ],
      },
      {
        heading: "AVAILABLE FLEET",
        links: [
          { label: "Refurbished DJI Mini 3 Pro", href: "/products/refurbished-dji-mini-3-pro-grade-a-drn-sh-m3p", badge: "SAVE 35%", badgeColor: "amber" },
          { label: "DJI Air 2S Fly More Combo", href: "/products/dji-air-2s-fly-more-combo-drn-sh-a2s" },
          { label: "DJI Mini 4 Pro RC-N2", href: "/products/dji-mini-4-pro-with-rc-n2-drn-sh-m4p" },
          { label: "All Certified Pre-Owned", href: "/used-drones" },
        ],
      },
      {
        heading: "PILOT ASSURANCE",
        links: [
          { label: "7-Day Easy Return Policy", href: "/used-drones" },
          { label: "Verified Battery Cycle Count", href: "/used-drones" },
          { label: "Original DGCA Flight Logs", href: "/used-drones" },
          { label: "Flight Lab Quality Guarantee", href: "/used-drones" },
        ],
      },
    ],
    featured: {
      badge: "VERIFIED GRADE A+",
      name: "Refurbished DJI Mini 3 Pro",
      subtitle: "Includes DJI RC smart controller, under 12 battery cycles, pristine optics and factory reset.",
      specs: ["Sub-249g No Permit", "4K/60fps HDR Video", "True Vertical Shooting"],
      price: "₹48,900",
      image: "/images/preowned-mini-canyon.jpg",
      href: "/products/refurbished-dji-mini-3-pro-grade-a-drn-sh-m3p",
    },
  },
  accessories: {
    callout: {
      tag: "GENUINE HARDWARE",
      title: "Power, Protection & Precision",
      description:
        "Equip your missions with high-density intelligent flight batteries, multi-coated optical ND filters, and rugged field cases.",
      linkText: "View All Accessories",
      linkHref: "/catalog?category=accessories",
    },
    columns: [
      {
        heading: "POWER & CHARGING",
        links: [
          { label: "Intelligent Flight Batteries", href: "/catalog?category=accessories", badge: "HOT", badgeColor: "amber" },
          { label: "65W GaN Fast Charger", href: "/products/65w-portable-fast-charger-acc-chg" },
          { label: "Multi-Battery Charging Hubs", href: "/catalog?category=accessories" },
          { label: "Field Car Adapters", href: "/catalog?category=accessories" },
        ],
      },
      {
        heading: "OPTICS & CONTROL",
        links: [
          { label: "Cinema ND Filter 4-Pack", href: "/products/nd-filter-4-pack-acc-nd", badge: "ESSENTIAL", badgeColor: "lime" },
          { label: "DJI RC 2 Smart Controller", href: "/products/dji-rc-2-remote-controller-acc-rc2" },
          { label: "High-Speed MicroSD 256GB", href: "/products/high-speed-microsd-256gb-v30" },
          { label: "Lanyard & Neck Straps", href: "/products/dji-lanyard-rc-neck-strap" },
        ],
      },
      {
        heading: "TRANSIT & SAFETY",
        links: [
          { label: "Explorer Hard Carry Case", href: "/products/explorer-hard-carry-case-acc-case" },
          { label: "Propeller Guards & Landing Gear", href: "/catalog?category=accessories" },
          { label: "Waterproof Field Backpacks", href: "/catalog?category=accessories" },
        ],
      },
    ],
    featured: {
      badge: "MISSION ESSENTIAL",
      name: "DJI RC 2 Smart Controller",
      subtitle: "FHD built-in 5.5-inch 700-nit high-brightness screen with O4 ultra-low latency video link.",
      specs: ["5.5\" FHD Screen", "700 Nits Brightness", "32GB Internal Storage"],
      price: "₹34,900",
      image: "/images/accessory-rc2-remote.jpg",
      href: "/products/dji-rc-2-remote-controller-acc-rc2",
    },
  },
  diy: {
    callout: {
      tag: "FPV & CUSTOM BUILDS",
      title: "Build. Tune. Dominate.",
      description:
        "High-performance FPV racing hardware: high-KV brushless motors, 55A ESC stacks, and low-noise carbon composite props.",
      linkText: "Launch 3D Kit Builder",
      linkHref: "/kit-builder",
    },
    columns: [
      {
        heading: "PROPULSION",
        links: [
          { label: "XING2 2207 Brushless Motor", href: "/products/xing2-2207-brushless-motor-diy-mot", badge: "PRO", badgeColor: "lime" },
          { label: "Low-Noise Propellers", href: "/products/low-noise-propellers-diy-prop" },
          { label: "T-Motor High KV Range", href: "/catalog?category=motors" },
          { label: "Tri-Blade Freestyle Props", href: "/catalog?category=motors" },
        ],
      },
      {
        heading: "AVIONICS & STACKS",
        links: [
          { label: "F7 Flight Stack 55A ESC", href: "/products/f7-flight-stack-55a-esc-diy-stack", badge: "6S READY", badgeColor: "amber" },
          { label: "Digital HD FPV Units", href: "/kit-builder" },
          { label: "ExpressLRS Receivers", href: "/kit-builder" },
          { label: "Antenna Arrays & Pigtails", href: "/catalog?category=accessories" },
        ],
      },
      {
        heading: "BUILD WORKBENCH",
        links: [
          { label: "3D Interactive Kit Builder", href: "/kit-builder", badge: "FEATURE", badgeColor: "emerald" },
          { label: "Pilot Build Consultation", href: "/consult-pilot" },
          { label: "Soldering & Bench Tools", href: "/kit-builder" },
        ],
      },
    ],
    featured: {
      badge: "FREESTYLE BENCHMARK",
      name: "XING2 2207 Brushless Motor",
      subtitle: "Unibell design, curved N52SH magnets, 5mm titanium alloy shaft for responsive throttle curve.",
      specs: ["1855KV 6S Ready", "Unibell Structural Build", "Curved N52SH Magnets"],
      price: "₹2,350",
      image: "/images/diy-motor.jpg",
      href: "/products/xing2-2207-brushless-motor-diy-mot",
    },
  },
};

export function CategoryNav() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(menuKey);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 250);
  };

  const toggleMenu = (menuKey: string) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu((prev) => (prev === menuKey ? null : menuKey));
  };

  const closeMenuImmediately = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveMenu(null);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeMenuImmediately();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const activeContent = activeMenu ? MEGA_MENUS[activeMenu] : null;

  return (
    <div
      className="relative w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md"
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto flex h-10 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8 text-xs font-semibold">
        {/* Left: Scrollable Category Bar Items */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-1">
          {/* 1. Drones Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("drones")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("drones")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeMenu === "drones"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>Drones</span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "drones" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>

          {/* 2. Pre-Owned Fleet Dropdown (Save up to 40% badge) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("preowned")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("preowned")}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeMenu === "preowned"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>Pre-Owned Fleet</span>
              <span className="rounded bg-[#ffea79] px-1.5 py-0.5 text-[9px] font-extrabold text-amber-950 uppercase tracking-tight">
                Save 40%
              </span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "preowned" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>

          {/* 3. Accessories Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("accessories")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("accessories")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeMenu === "accessories"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>Accessories</span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "accessories" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>

          {/* 4. DIY Components Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("diy")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("diy")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1.5 transition-colors cursor-pointer ${
                activeMenu === "diy"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>DIY Components</span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "diy" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>

          {/* 5. Propellers & Motors Direct Link */}
          <Link
            href="/catalog?category=motors"
            onClick={closeMenuImmediately}
            onMouseEnter={() => setActiveMenu(null)}
            className="hidden sm:inline-flex items-center rounded-md px-2.5 py-1.5 text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
          >
            <span>Propellers & Motors</span>
          </Link>

          {/* 6. Batteries & Chargers Direct Link with HOT badge */}
          <Link
            href="/catalog?category=accessories"
            onClick={closeMenuImmediately}
            onMouseEnter={() => setActiveMenu(null)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-zinc-700 hover:text-black hover:bg-zinc-50 transition-colors"
          >
            <span>Batteries & Chargers</span>
            <span className="rounded bg-[#c8f33b] px-1.5 py-0.5 text-[9px] font-extrabold text-black uppercase tracking-tight">
              HOT
            </span>
          </Link>
        </div>

        {/* Right: Dedicated Tool / Action Links */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Kit Builder Highlighted Action */}
          <Link
            href="/kit-builder"
            onClick={closeMenuImmediately}
            onMouseEnter={() => setActiveMenu(null)}
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-semibold text-zinc-800 hover:border-black hover:bg-black hover:text-white transition shadow-2xs group"
          >
            <Wrench className="h-3 w-3 text-zinc-500 group-hover:text-[#c8f33b] transition" />
            <span className="hidden sm:inline">Kit Builder</span>
            <span className="sm:hidden">Builder</span>
          </Link>

          {/* Consult Pilot Action */}
          <Link
            href="/consult-pilot"
            onClick={closeMenuImmediately}
            onMouseEnter={() => setActiveMenu(null)}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 px-3 py-1 text-xs font-bold text-emerald-800 hover:bg-emerald-600 hover:text-white transition shadow-2xs group"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">Consult Pilot</span>
            <span className="sm:hidden">Pilot</span>
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MEGA MENU DROPDOWN PANEL                                             */}
      {/* ==================================================================== */}
      {activeContent && (
        <>
          {/* Subtle Ambient Page Backdrop */}
          <div
            className="fixed inset-0 top-[108px] z-30 bg-black/20 backdrop-blur-[2px] transition-opacity animate-in fade-in-0 duration-150"
            onClick={closeMenuImmediately}
          />

          {/* Floating Dropdown Card */}
          <div
            className="absolute left-0 right-0 top-full z-40 w-full animate-in fade-in-0 zoom-in-95 duration-150"
            onMouseEnter={() => {
              if (timeoutRef.current) clearTimeout(timeoutRef.current);
            }}
            onMouseLeave={handleMouseLeave}
          >
            <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 pt-2 pb-6">
              <div className="rounded-2xl border border-zinc-200/90 bg-white shadow-2xl p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
                
                {/* 1. Left Section: Brand & Value Prop Statement (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col justify-between rounded-xl bg-zinc-950 p-6 text-white relative overflow-hidden shadow-inner">
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#c8f33b]/10 blur-2xl pointer-events-none" />

                  <div className="relative space-y-3">
                    <span className="inline-flex items-center gap-1 rounded bg-[#c8f33b]/15 border border-[#c8f33b]/30 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c8f33b]">
                      <span className="h-1 w-1 rounded-full bg-[#c8f33b]" />
                      {activeContent.callout.tag}
                    </span>
                    <h3 className="text-lg font-black tracking-tight text-white leading-snug">
                      {activeContent.callout.title}
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                      {activeContent.callout.description}
                    </p>
                  </div>

                  <div className="relative pt-6">
                    <Link
                      href={activeContent.callout.linkHref}
                      onClick={closeMenuImmediately}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8f33b] hover:text-white transition group"
                    >
                      <span>{activeContent.callout.linkText}</span>
                      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>

                {/* 2. Middle Section: Directory Columns (6 Cols) */}
                <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-3 gap-6 py-1">
                  {activeContent.columns.map((col, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-[10px] font-black tracking-wider text-zinc-400 uppercase font-mono border-b border-zinc-100 pb-2">
                        {col.heading}
                      </h4>
                      <ul className="space-y-2">
                        {col.links.map((link, lIdx) => (
                          <li key={lIdx}>
                            <Link
                              href={link.href}
                              onClick={closeMenuImmediately}
                              className="group flex items-center justify-between text-xs font-medium text-zinc-700 hover:text-black hover:translate-x-0.5 transition-all py-0.5"
                            >
                              <span className="group-hover:font-semibold transition">
                                {link.label}
                              </span>
                              {link.badge && (
                                <span
                                  className={`rounded px-1.5 py-0.2 text-[9px] font-bold tracking-tight uppercase ${
                                    link.badgeColor === "lime"
                                      ? "bg-[#c8f33b] text-black"
                                      : link.badgeColor === "amber"
                                      ? "bg-[#fff275] text-amber-950"
                                      : link.badgeColor === "emerald"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-zinc-200 text-zinc-800"
                                  }`}
                                >
                                  {link.badge}
                                </span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* 3. Right Section: Featured Product Showcase Card (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col justify-between rounded-xl border border-zinc-200/90 bg-zinc-50/70 p-4 transition-all hover:bg-white hover:border-zinc-300 hover:shadow-lg group">
                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className="rounded-full bg-black px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#c8f33b]">
                        {activeContent.featured.badge}
                      </span>
                      <span className="text-xs font-black font-mono text-black">
                        {activeContent.featured.price}
                      </span>
                    </div>

                    {/* Product Image */}
                    <Link
                      href={activeContent.featured.href}
                      onClick={closeMenuImmediately}
                      className="mt-3 block overflow-hidden rounded-lg aspect-[16/10] bg-zinc-100 relative"
                    >
                      <img
                        src={activeContent.featured.image}
                        alt={activeContent.featured.name}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="mt-3">
                      <Link
                        href={activeContent.featured.href}
                        onClick={closeMenuImmediately}
                        className="text-xs font-black text-black hover:underline line-clamp-1"
                      >
                        {activeContent.featured.name}
                      </Link>
                      <p className="mt-1 text-[11px] text-zinc-500 line-clamp-2 leading-snug">
                        {activeContent.featured.subtitle}
                      </p>

                      {/* Specs */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {activeContent.featured.specs.map((spec, sIdx) => (
                          <span
                            key={sIdx}
                            className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-[9px] font-mono text-zinc-600 font-medium"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mt-4 pt-3 border-t border-zinc-200/80">
                    <Link
                      href={activeContent.featured.href}
                      onClick={closeMenuImmediately}
                      className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-black py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition active:scale-98"
                    >
                      <span>Shop Now</span>
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
