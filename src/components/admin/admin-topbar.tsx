"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  ChevronRight,
  Database,
  Zap,
} from "lucide-react";

export function AdminTopbar() {
  const pathname = usePathname();
  const [timeStr, setTimeStr] = useState<string>("");

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
    <header className="sticky top-0 z-30 hidden md:flex h-14 items-center justify-between border-b border-zinc-800/80 bg-zinc-950/80 px-8 backdrop-blur-md">
      {/* Breadcrumb Path */}
      <nav className="flex items-center gap-1.5 text-xs">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={crumb.href + idx}>
            {idx > 0 && <ChevronRight className="h-3 w-3 text-zinc-600" />}
            {idx === breadcrumbs.length - 1 ? (
              <span className="font-semibold text-white font-mono">
                {crumb.label}
              </span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Telemetry Status Cluster */}
      <div className="flex items-center gap-4 text-xs font-mono">
        {/* Supavisor Pool */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-400">
          <Database className="h-3 w-3 text-emerald-400" />
          <span>Pooler: 6543</span>
        </div>

        {/* Upstash Redis */}
        <div className="flex items-center gap-1.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-2.5 py-1 text-[11px] text-zinc-400">
          <Zap className="h-3 w-3 text-[#c8f33b]" />
          <span>Redis: OK</span>
        </div>

        {/* Live IST Clock */}
        {timeStr && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-500 font-semibold">
            <Activity className="h-3 w-3 text-zinc-600" />
            <span>{timeStr}</span>
          </div>
        )}
      </div>
    </header>
  );
}
