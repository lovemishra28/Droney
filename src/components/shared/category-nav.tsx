"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  PhoneCall,
} from "lucide-react";
import { resolveImageUrl } from "@/lib/media";
import { formatINR } from "@/lib/utils";

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

interface CategoryNavProps {
  initialProducts?: any[];
}

export function CategoryNav({ initialProducts = [] }: CategoryNavProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [products, setProducts] = useState<any[]>(initialProducts);

  // Sync state if initialProducts changes (e.g. from server page transitions)
  useEffect(() => {
    setProducts(initialProducts);
  }, [initialProducts]);

  // Client-side fetch to ensure mega menu is always synced with latest database records
  useEffect(() => {
    let isMounted = true;
    async function refreshNavProducts() {
      try {
        const res = await fetch("/api/nav/catalog");
        if (!res.ok) return;
        const data = await res.json();
        if (data.success && isMounted) {
          const combined = [
            ...(data.drones || []),
            ...(data.preowned || []),
            ...(data.accessories || []),
          ];
          setProducts(combined);
        }
      } catch (err) {
        // Silently keep current products on network failure
      }
    }

    refreshNavProducts();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // Filter products by domain dynamically
  const drones = products.filter(
    (p) =>
      !p.isSecondHand &&
      !p.sku?.startsWith("ACC-") &&
      !p.category?.slug?.includes("accessor")
  );

  const miniDrones = drones.filter((p) => p.category?.slug === "mini-series");
  const airAndMavicDrones = drones.filter(
    (p) => p.category?.slug === "air-series" || p.category?.slug === "mavic-series"
  );
  const avataDrones = drones.filter((p) => p.category?.slug === "avata-series");

  const preowned = products.filter((p) => p.isSecondHand);

  const accessories = products.filter(
    (p) =>
      p.category?.slug?.toLowerCase().includes("accessor") ||
      p.sku?.toUpperCase().startsWith("ACC-")
  );

  // Construct dynamic Mega Menus based on real database inventory
  const dynamicMegaMenus: Record<string, MegaMenuContent> = {
    drones: {
      callout: {
        tag: "AUTHORISED DEALER",
        title: "Engineered for Aerial Dominance",
        description:
          "Direct tier-1 partner with DJI. 100% genuine hardware with official manufacturer warranties, DGCA compliance, and Pan-India fast dispatch.",
        linkText: "Explore Entire Fleet",
        linkHref: "/catalog?category=drones",
      },
      columns: [
        {
          heading: "MINI SERIES (<249G)",
          links:
            miniDrones.length > 0
              ? miniDrones.map((p) => ({
                  label: p.name,
                  href: `/product/${p.slug}`,
                  badge: p.name.includes("45-min") ? "45M" : p.name.includes("36-min") ? "<249G" : undefined,
                  badgeColor: "lime",
                }))
              : [
                  { label: "DJI Mini 5 Pro (45-min Plus)", href: "/catalog?category=mini-series", badge: "NEW", badgeColor: "lime" },
                  { label: "DJI Mini 5 Pro (36-min)", href: "/catalog?category=mini-series" },
                  { label: "DJI Mini 4 Pro Combo", href: "/catalog?category=mini-series" },
                  { label: "DJI Mini 3 Combo", href: "/catalog?category=mini-series" },
                ],
        },
        {
          heading: "AIR & MAVIC SERIES",
          links:
            airAndMavicDrones.length > 0
              ? airAndMavicDrones.map((p) => ({
                  label: p.name,
                  href: `/product/${p.slug}`,
                  badge: p.name.includes("Creator") ? "CINE" : p.name.includes("Air 3S") ? "HOT" : undefined,
                  badgeColor: "amber",
                }))
              : [
                  { label: "DJI Air 3S Combo (RC 2)", href: "/catalog?category=air-series", badge: "HOT", badgeColor: "amber" },
                  { label: "DJI Air 3 Fly More Combo", href: "/catalog?category=air-series" },
                  { label: "DJI Air 2S Fly More Combo", href: "/catalog?category=air-series" },
                  { label: "DJI Mavic 4 Pro (RC 2)", href: "/catalog?category=mavic-series" },
                  { label: "DJI Mavic 4 Pro Creator Combo", href: "/catalog?category=mavic-series", badge: "CINE", badgeColor: "amber" },
                ],
        },
        {
          heading: "AVATA & PILOT SUPPORT",
          links: [
            ...(avataDrones.length > 0
              ? avataDrones.map((p) => ({
                  label: p.name,
                  href: `/product/${p.slug}`,
                  badge: p.name.includes("RC 2") ? "SCREEN" : undefined,
                  badgeColor: "lime" as const,
                }))
              : [
                  { label: "DJI Avata 360 Combo (RC 2)", href: "/catalog?category=avata-series" },
                  { label: "DJI Avata 360 Combo (N3)", href: "/catalog?category=avata-series" },
                ]),
            { label: "DGCA India Compliance Guide", href: "/consult-pilot" },
            { label: "1-on-1 Pilot Flight Consultation", href: "/consult-pilot", badge: "LIVE", badgeColor: "emerald" },
          ],
        },
      ],
      featured:
        drones.length > 0
          ? {
              badge: drones[0].stockQuantity > 0 ? "IN STOCK 2026" : "FLAGSHIP",
              name: drones[0].name,
              subtitle:
                drones[0].description?.slice(0, 95) ||
                "High-performance aerial platform with verified flight telemetry and official warranty.",
              specs: [`SKU: ${drones[0].sku}`, "Insured Air", "100% Genuine"],
              price: formatINR(drones[0].basePricePaise),
              image: resolveImageUrl(drones[0].media?.[0]?.url, drones[0].name),
              href: `/product/${drones[0].slug}`,
            }
          : {
              badge: "EXPLORE FLEET",
              name: "Altitude Drone Fleet",
              subtitle:
                "Browse our complete catalog of camera quadcopters, travel drones, and cinema aircraft.",
              specs: ["100% Genuine", "DGCA Support", "Fast Delivery"],
              price: "Browse Catalog",
              image: "/images/altitude-hero-bg.jpg",
              href: "/catalog?category=drones",
            },
    },

    preowned: {
      callout: {
        tag: "CERTIFIED REFURBISHED",
        title: "Pre-Owned, Flight-Lab Verified",
        description:
          "Every pre-owned aircraft passes our stringent 32-point telemetry test, battery cycle analysis, and gimbal sensor calibration before certification.",
        linkText: "Shop Pre-Owned Fleet",
        linkHref: "/used-drones",
      },
      columns: [
        {
          heading: "INSPECTION STANDARDS",
          links: [
            { label: "32-Point Technician Inspection", href: "/used-drones", badge: "VERIFIED", badgeColor: "emerald" },
            { label: "Battery Cycle & Health Audit", href: "/used-drones" },
            { label: "Gimbal & Sensor Telemetry Test", href: "/used-drones" },
            { label: "Zero-Crash Airframe Verification", href: "/used-drones" },
          ],
        },
        {
          heading: "AVAILABLE FLEET",
          links:
            preowned.length > 0
              ? preowned.slice(0, 4).map((p) => ({
                  label: p.name,
                  href: `/product/${p.slug}`,
                  badge: p.secondHandDetails?.cosmeticGrade
                    ? `GRADE ${p.secondHandDetails.cosmeticGrade}`
                    : "CERTIFIED",
                  badgeColor: "amber",
                }))
              : [
                  { label: "Refurbished DJI Mini 3 Pro (Grade A+)", href: "/used-drones", badge: "GRADE A+", badgeColor: "emerald" },
                  { label: "DJI Air 2S Combo (Grade A)", href: "/used-drones", badge: "GRADE A", badgeColor: "amber" },
                  { label: "Trade-In Your Drone", href: "/trade-in" },
                  { label: "Request Specific Model", href: "/consult-pilot" },
                ],
        },
        {
          heading: "PILOT ASSURANCE",
          links: [
            { label: "7-Day Easy Return Policy", href: "/returns" },
            { label: "6-Month Altitude Warranty", href: "/used-drones", badge: "PROTECT", badgeColor: "lime" },
            { label: "Doorstep Pickup Trade-In", href: "/trade-in" },
            { label: "Original DGCA Flight Log Transfer", href: "/consult-pilot" },
          ],
        },
      ],
      featured:
        preowned.length > 0
          ? {
              badge: `VERIFIED GRADE ${preowned[0].secondHandDetails?.cosmeticGrade || "A"}`,
              name: preowned[0].name,
              subtitle:
                preowned[0].description?.slice(0, 95) ||
                "Certified pre-owned drone tested across 32-point flight and sensor checklist.",
              specs: [`${preowned[0].stockQuantity} in stock`, "Inspected", "Warranty"],
              price: formatINR(preowned[0].basePricePaise),
              image: resolveImageUrl(preowned[0].media?.[0]?.url, preowned[0].name),
              href: `/product/${preowned[0].slug}`,
            }
          : {
              badge: "INSPECTION PROGRAM",
              name: "Pre-Owned Pilot Fleet",
              subtitle:
                "All certified units currently claimed. Check back for upcoming weekly batch drops or trade in your drone.",
              specs: ["32-Point Check", "Battery Audit", "Doorstep Pickup"],
              price: "Save up to 40%",
              image: "/images/preowned-mini-canyon.jpg",
              href: "/used-drones",
            },
    },

    accessories: {
      callout: {
        tag: "GENUINE ACCESSORIES",
        title: "Power, Protection & Precision",
        description:
          "Official DJI hardware: high-density intelligent flight batteries, screen remote controllers, multi-coated ND filters, and rugged carry cases.",
        linkText: "View All Accessories",
        linkHref: "/catalog?category=accessories",
      },
      columns: [
        {
          heading: "BATTERIES & POWER",
          links: [
            { label: "Air 3 / 3S Flight Battery", href: "/product/dji-air-3-series-flight-battery", badge: "HOT", badgeColor: "amber" },
            { label: "Mini 4/5 Flight Battery Plus", href: "/product/dji-mini-flight-battery-plus", badge: "45M", badgeColor: "lime" },
            { label: "DJI 65W GaN Fast Charger", href: "/product/dji-65w-gan-fast-charger" },
            { label: "Two-Way Charging Hubs", href: "/catalog?category=accessories" },
          ],
        },
        {
          heading: "CONTROLLERS & OPTICS",
          links: [
            { label: "DJI RC 2 Remote Controller", href: "/product/dji-rc-2-remote-controller", badge: "SCREEN", badgeColor: "lime" },
            { label: "DJI Optical ND Filter Sets", href: "/product/dji-optical-nd-filter-set" },
            { label: "RC-N3 Smartphone Remotes", href: "/catalog?category=accessories" },
            { label: "Lanyard & Neck Straps", href: "/catalog?category=accessories" },
          ],
        },
        {
          heading: "PROPELLERS & CASES",
          links: [
            { label: "Low-Noise Quick-Release Props", href: "/product/dji-low-noise-propellers" },
            { label: "Explorer Hard Safety Cases", href: "/product/explorer-waterproof-hard-case", badge: "IP67", badgeColor: "emerald" },
            { label: "360° Propeller Safety Guards", href: "/catalog?category=accessories" },
            { label: "Padded Field Shoulder Bags", href: "/catalog?category=accessories" },
          ],
        },
      ],
      featured:
        accessories.length > 0
          ? {
              badge: "GENUINE ACCESSORY",
              name: accessories[0].name,
              subtitle:
                accessories[0].description?.slice(0, 95) ||
                "Official accessory built for flight reliability, endurance, and optical clarity.",
              specs: [`SKU: ${accessories[0].sku}`, "Fast Dispatch", "100% Genuine"],
              price: formatINR(accessories[0].basePricePaise),
              image: resolveImageUrl(accessories[0].media?.[0]?.url, accessories[0].name),
              href: `/product/${accessories[0].slug}`,
            }
          : {
              badge: "MISSION ESSENTIAL",
              name: "Batteries, Optics & Spares",
              subtitle:
                "Explore cinema glass, high-capacity flight power, and rugged field carry bags.",
              specs: ["Original Fit", "Fast Dispatch", "100% Genuine"],
              price: "View Spares",
              image: "/images/accessory-battery.jpg",
              href: "/catalog?category=accessories",
            },
    },
  };

  const activeContent = activeMenu ? dynamicMegaMenus[activeMenu] : null;

  return (
    <div
      className="relative w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md"
      onMouseLeave={handleMouseLeave}
    >
      <div className="mx-auto flex h-11 max-w-[1520px] items-center justify-between px-4 sm:px-6 lg:px-8 text-[11px] sm:text-xs font-semibold">
        {/* Left: Focused Category Bar (Drones, Pre-Owned Fleet, Accessories) */}
        <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto scrollbar-none py-0.5">
          {/* 1. Drones Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("drones")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("drones")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
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

          {/* 2. Pre-Owned Fleet Dropdown (Save 40% badge removed as requested) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("preowned")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("preowned")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                activeMenu === "preowned"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>Pre-Owned Fleet</span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "preowned" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>

          {/* 3. Accessories Dropdown (Includes Batteries, Chargers, Props, Remotes) */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter("accessories")}
          >
            <button
              type="button"
              onClick={() => toggleMenu("accessories")}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 transition-colors cursor-pointer ${
                activeMenu === "accessories"
                  ? "bg-zinc-100 text-black font-bold"
                  : "text-zinc-700 hover:text-black hover:bg-zinc-50"
              }`}
            >
              <span>Accessories &amp; Spares</span>
              <ChevronDown
                className={`h-3 w-3 text-zinc-400 transition-transform duration-200 ${
                  activeMenu === "accessories" ? "rotate-180 text-black" : ""
                }`}
              />
            </button>
          </div>
        </div>

        {/* Right: Dedicated Consult Pilot Action (Clean text with icon, green container removed) */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <Link
            href="/consult-pilot"
            onClick={closeMenuImmediately}
            onMouseEnter={() => setActiveMenu(null)}
            className="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-zinc-700 hover:text-black hover:bg-zinc-100 transition-colors"
          >
            <PhoneCall className="h-3 w-3 text-zinc-500" />
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
            className="fixed inset-0 top-[136px] z-30 bg-black/20 backdrop-blur-[2px] transition-opacity animate-in fade-in-0 duration-150"
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
                
                {/* 1. Left Section: Brand Statement (3 Cols) */}
                <div className="lg:col-span-3 flex flex-col justify-between rounded-xl bg-zinc-950 p-6 sm:p-7 text-white relative overflow-hidden shadow-inner min-h-[260px]">
                  {/* Subtle Background Glow */}
                  <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-[#c8f33b]/10 blur-2xl pointer-events-none" />

                  <span className="relative inline-block text-[10px] font-mono font-bold uppercase tracking-widest text-[#c8f33b]">
                    {activeContent.callout.tag}
                  </span>

                  <h3 className="relative my-auto py-4 text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                    {activeContent.callout.title}
                  </h3>

                  <div className="relative pt-4 border-t border-white/10">
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

                {/* 2. Directory Columns: Expanded evenly to 9 Cols across remaining width */}
                <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-8 lg:gap-14 py-2 px-2 sm:px-6">
                  {activeContent.columns.map((col, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="text-[11px] font-black tracking-wider text-zinc-400 uppercase font-mono border-b border-zinc-100 pb-2.5">
                        {col.heading}
                      </h4>
                      <ul className="space-y-2.5">
                        {col.links.map((link, lIdx) => (
                          <li key={lIdx}>
                            <Link
                              href={link.href}
                              onClick={closeMenuImmediately}
                              className="group flex items-center justify-between text-xs sm:text-[13px] font-medium text-zinc-700 hover:text-black hover:translate-x-1 transition-all py-0.5"
                            >
                              <span className="group-hover:font-semibold transition line-clamp-1 pr-2">
                                {link.label}
                              </span>
                              {link.badge && (
                                <span
                                  className={`text-[9px] font-mono font-bold tracking-wider uppercase shrink-0 px-1.5 py-0.5 rounded ${
                                    link.badgeColor === "lime"
                                      ? "bg-[#c8f33b]/20 text-[#4c682f] font-bold"
                                      : link.badgeColor === "amber"
                                      ? "bg-amber-100 text-amber-800"
                                      : link.badgeColor === "emerald"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : "bg-zinc-100 text-zinc-600"
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

              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
