"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  LayoutTemplate,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";

interface AdminSidebarProps {
  adminName: string;
  pendingApprovalsCount: number;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Overview Dashboard",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    href: "/admin/storefront",
    label: "Storefront Studio",
    icon: LayoutTemplate,
    badge: "Live CMS",
  },
  {
    href: "/admin/payments",
    label: "Payment Approvals",
    icon: CheckSquare,
    badgeKey: "payments",
  },
  {
    href: "/admin/products",
    label: "Products",
    icon: Package,
    badge: null,
  },
  {
    href: "/admin/import",
    label: "Bulk CSV Ingest",
    icon: FileSpreadsheet,
    badge: null,
  },
  {
    href: "/admin/orders",
    label: "Orders & Dispatch",
    icon: ShoppingBag,
    badge: null,
  },
  {
    href: "/admin/audit",
    label: "Audit Trail Logs",
    icon: History,
    badge: null,
  },
];

export function AdminSidebar({
  adminName,
  pendingApprovalsCount,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setMobileOpen(true);
    window.addEventListener("altitude:open-admin-mobile-menu", handleOpen);
    return () => window.removeEventListener("altitude:open-admin-mobile-menu", handleOpen);
  }, []);

  // Close mobile drawer on route navigation
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Top Section: Navigation & Action */}
      <div>
        {/* Mobile-Only Drawer Header with Close Button */}
        <div className="md:hidden flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-2 pb-3 mb-3">
          <span className="font-tech text-lg font-bold uppercase tracking-wider text-black dark:text-white">
            Navigation Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Shortcut: New Product CTA */}
        <div className="px-1">
          <Link
            href="/admin/products/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c8f33b] px-3.5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#b5e028] shadow-xs hover:shadow-[0_0_15px_rgba(200,243,59,0.3)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create New Product</span>
          </Link>
        </div>

        {/* Navigation Routes */}
        <nav className="mt-4 flex flex-col gap-1 text-xs font-medium">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const hasPendingBadge =
              item.badgeKey === "payments" && pendingApprovalsCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`group flex items-center justify-between rounded-xl px-3 py-2.5 transition-all ${
                  active
                    ? "bg-[#c8f33b] text-black font-bold shadow-xs"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-black dark:hover:text-zinc-100"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      active
                        ? "text-black"
                        : "text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-zinc-300"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {hasPendingBadge && (
                  <span className="flex h-5 items-center justify-center rounded-full bg-amber-400 px-2 font-mono text-[10px] font-black text-black shadow-xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Compact Admin Clearance Info */}
      <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center gap-2.5 rounded-xl bg-zinc-100/70 dark:bg-zinc-900/60 p-2.5 border border-zinc-200 dark:border-zinc-800/60">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black dark:bg-zinc-800 text-xs font-bold text-white border border-zinc-800 dark:border-zinc-700">
            {adminName.slice(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <p className="truncate text-xs font-bold text-zinc-900 dark:text-white leading-tight">
              {adminName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              <ShieldCheck className="h-3 w-3 text-lime-600 dark:text-[#c8f33b]" />
              <span className="text-[10px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                Verified Admin
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar (Underneath h-16 Topbar) */}
      <aside className="hidden md:flex fixed top-16 left-0 bottom-0 z-30 w-64 flex-col border-r border-zinc-200 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 p-4 backdrop-blur-xl">
        {navContent}
      </aside>
    </>
  );
}
