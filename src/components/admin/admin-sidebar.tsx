"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CheckSquare,
  ExternalLink,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  X,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth";
import { notifyAuthStateChanged } from "@/lib/auth-client";
import { useAdminTheme } from "@/components/admin/admin-theme-provider";

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
  const { theme, toggleTheme } = useAdminTheme();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const navContent = (
    <div className="flex h-full flex-col justify-between">
      {/* Top Section: Brand & Navigation */}
      <div>
        {/* Brand Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 px-3 pb-4">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            {/* Storefront Black Container with Neon Lime Arrow */}
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black border border-zinc-800 shadow-xs transition group-hover:scale-105">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 4L21 20H3L12 4Z" fill="#c8f33b" />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-black tracking-wider text-zinc-900 dark:text-white uppercase font-sans leading-tight">
                ALTITUDE
              </span>
              <span className="text-[9px] font-bold tracking-[0.22em] text-lime-600 dark:text-[#c8f33b] uppercase leading-none mt-0.5">
                OPERATIONS CONTROL
              </span>
            </div>
          </Link>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="md:hidden rounded-lg p-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-400 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* System Status Pill */}
        <div className="mt-3.5 mx-1 flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/70 dark:bg-zinc-950/80 px-3 py-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c8f33b] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#c8f33b]"></span>
            </span>
            <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-300">
              Fleet Network Online
            </span>
          </div>
          <span className="font-mono text-[10px] text-zinc-400 dark:text-zinc-500">v2.4</span>
        </div>

        {/* Quick Shortcut: New Product CTA */}
        <div className="mt-3 px-1">
          <Link
            href="/admin/products/new"
            onClick={() => setMobileOpen(false)}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-[#c8f33b] px-3.5 py-2 text-xs font-bold text-black transition-all hover:bg-[#b5e028] shadow-xs hover:shadow-[0_0_15px_rgba(200,243,59,0.3)]"
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

      {/* Bottom Section: Storefront Link & Admin Profile */}
      <div className="space-y-3 pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        {/* Jump to Storefront Link */}
        <Link
          href="/"
          target="_blank"
          className="flex items-center justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-800 dark:text-zinc-300">View Live Store</span>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-zinc-400 dark:text-zinc-500" />
        </Link>

        {/* Admin Clearance & Sign Out */}
        <div className="flex items-center justify-between rounded-xl bg-zinc-100/80 dark:bg-zinc-900/60 p-2.5 border border-zinc-200 dark:border-zinc-800/60">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-black text-xs font-bold text-white border border-zinc-800">
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

          <form
            action={async () => {
              await logoutAction();
              notifyAuthStateChanged();
            }}
          >
            <button
              type="submit"
              title="Terminate Admin Session"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 hover:bg-rose-500/10 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/40 transition-colors"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sticky Header Bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 px-4 backdrop-blur-md">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-black border border-zinc-800">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 4L21 20H3L12 4Z" fill="#c8f33b" />
            </svg>
          </div>
          <span className="text-sm font-black tracking-wider text-zinc-900 dark:text-white uppercase">
            ALTITUDE <span className="text-lime-600 dark:text-[#c8f33b]">OPS</span>
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/60 dark:bg-black/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-72 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 p-4">
            {navContent}
          </div>
        </div>
      )}

      {/* Desktop Persistent Left Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-64 flex-col border-r border-zinc-200 dark:border-zinc-800/90 bg-white/95 dark:bg-zinc-950/95 p-4 backdrop-blur-xl">
        {navContent}
      </aside>
    </>
  );
}
