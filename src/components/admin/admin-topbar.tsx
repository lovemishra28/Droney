"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronRight,
  Database,
  Moon,
  Sun,
  Zap,
} from "lucide-react";
import { useAdminTheme } from "@/components/admin/admin-theme-provider";

export function AdminTopbar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>("");
  const { theme, toggleTheme } = useAdminTheme();

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) + " IST"
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getBreadcrumbs = () => {
    const segments = pathname.split("/").filter(Boolean);
    const trail = [{ label: "Console", href: "/admin" }];

    if (segments.length > 1) {
      if (segments[1] === "payments") trail.push({ label: "Direct UPI Approvals", href: "/admin/payments" });
      else if (segments[1] === "products") {
        trail.push({ label: "Catalog & Fleet", href: "/admin/products" });
        if (segments[2] === "new") trail.push({ label: "New Listing", href: "/admin/products/new" });
        else if (segments[2]) trail.push({ label: `Edit SKU`, href: `/admin/products/${segments[2]}` });
      } else if (segments[1] === "import") trail.push({ label: "Bulk CSV Ingestion", href: "/admin/import" });
      else if (segments[1] === "orders") trail.push({ label: "Fulfillment & Orders", href: "/admin/orders" });
      else if (segments[1] === "audit") trail.push({ label: "Compliance Audit Trail", href: "/admin/audit" });
    }
    return trail;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="sticky top-0 z-30 hidden md:flex h-14 items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 bg-white/90 dark:bg-zinc-950/80 px-8 backdrop-blur-md transition-colors duration-200">
      {/* Breadcrumb Path */}
      <nav className="flex items-center gap-1.5 text-xs">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href + idx}>
            {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-bold text-zinc-900 dark:text-white font-mono">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-200 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Right Controls: Telemetry Cluster & Theme Switcher */}
      <div className="flex items-center gap-3 text-xs font-mono">
        {/* Supavisor Pool */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          <Database className="h-3 w-3 text-emerald-500" />
          <span>Pooler: 6543</span>
        </div>

        {/* Upstash Redis */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800/80 bg-zinc-100/80 dark:bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-600 dark:text-zinc-400">
          <Zap className="h-3 w-3 text-lime-600 dark:text-[#c8f33b]" />
          <span>Redis: OK</span>
        </div>

        {/* Live IST Clock */}
        {timeStr && (
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
            <Activity className="h-3 w-3 text-zinc-400 dark:text-zinc-600" />
            <span>{timeStr}</span>
          </div>
        )}

        {/* Top Right Corner Theme Switcher Icon Button */}
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-1.5 text-xs font-bold text-zinc-800 dark:text-zinc-200 shadow-xs hover:border-[#c8f33b] hover:shadow-xs transition-all cursor-pointer ml-1"
        >
          {theme === "light" ? (
            <>
              <Moon className="h-3.5 w-3.5 text-indigo-600" />
              <span className="hidden sm:inline text-[11px] font-sans font-semibold">Dark Mode</span>
            </>
          ) : (
            <>
              <Sun className="h-3.5 w-3.5 text-[#c8f33b]" />
              <span className="hidden sm:inline text-[11px] font-sans font-semibold">Light Mode</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
