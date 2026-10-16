"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LayoutTemplate,
  CheckSquare,
  Package,
  FileSpreadsheet,
  ShoppingBag,
  History,
  Plus,
} from "lucide-react";

interface AdminNavStripProps {
  pendingApprovalsCount?: number;
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

export function AdminNavStrip({ pendingApprovalsCount = 0 }: AdminNavStripProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <nav
      aria-label="Admin Navigation Strip"
      className="sticky top-16 z-30 w-full border-b border-zinc-200/90 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-2xs transition-colors"
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 gap-3">
        {/* Horizontal Navigation Items with expanding text on touch / hover / active */}
        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-1 scrollbar-none min-w-0 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            const hasPendingBadge =
              item.badgeKey === "payments" && pendingApprovalsCount > 0;

            if (active) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl bg-[#c8f33b] px-3.5 py-2 text-black font-extrabold shadow-xs shrink-0 transition-all select-none"
                >
                  <Icon className="h-5 w-5 text-black shrink-0" />
                  <span className="text-xs font-black tracking-tight whitespace-nowrap">
                    {item.label}
                  </span>
                  {item.badge && (
                    <span className="rounded-md bg-black px-1.5 py-0.5 text-[9px] font-black font-mono text-[#c8f33b] uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {hasPendingBadge && (
                    <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-black px-1.5 font-mono text-[9px] font-black text-[#c8f33b]">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                title={item.label}
                className="group relative flex items-center rounded-xl p-2 sm:p-2.5 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 transition-all duration-300 ease-out shrink-0 select-none cursor-pointer"
              >
                <Icon className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110" />

                {/* Text Label: Hidden by default, smoothly expands when hovered / focused / touched */}
                <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-2.5 transition-all duration-300 ease-out whitespace-nowrap text-xs font-bold text-zinc-950 dark:text-zinc-50">
                  {item.label}
                </span>

                {item.badge && (
                  <span className="max-w-0 overflow-hidden opacity-0 group-hover:max-w-xs group-hover:opacity-100 group-hover:ml-1.5 transition-all duration-300 ease-out rounded-md bg-zinc-200 dark:bg-zinc-800 px-1.5 py-0.5 text-[9px] font-bold font-mono text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">
                    {item.badge}
                  </span>
                )}

                {/* Pending Notification Dot or Badge */}
                {hasPendingBadge && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 font-mono text-[9px] font-black text-black shadow-xs">
                    {pendingApprovalsCount}
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Right Action: Create New Product CTA Button */}
        <div className="flex items-center gap-2 shrink-0 pl-2">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#c8f33b] hover:bg-[#b5e028] px-3.5 py-2 text-xs font-black text-black transition-all shadow-xs active:scale-95 shrink-0 hover:shadow-[0_0_15px_rgba(200,243,59,0.25)]"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Create Product</span>
          </Link>
        </div>
      </div>
    </nav>
  );
}
