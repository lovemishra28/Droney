import React from "react";
import Link from "next/link";
import {
  CheckSquare,
  FileSpreadsheet,
  History,
  LayoutDashboard,
  LogOut,
  Package,
  Plane,
  ShoppingBag,
} from "lucide-react";
import { requireAdminSession } from "@/server/queries/admin";
import { SessionWatcher } from "@/components/admin/session-watcher";
import { logoutAction } from "@/server/actions/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  // Query pending payments count for live sidebar notification badge
  let pendingApprovalsCount = 0;
  try {
    const pendingApprovalsResult = await db
      .select({ total: count() })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "awaiting_verification"),
          isNotNull(orders.upiTransactionId)
        )
      );

    pendingApprovalsCount = pendingApprovalsResult[0]?.total ?? 0;
  } catch (error) {
    console.error("[Admin Layout Count Error]:", error);
  }

  return (
    <div className="flex min-h-screen bg-zinc-950 text-zinc-100">
      <SessionWatcher />

      {/* Persistent Left Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-zinc-800 bg-zinc-900/60 p-4 backdrop-blur-xl">
        {/* Portal Brand Header */}
        <div className="flex items-center gap-2.5 border-b border-zinc-800/80 px-2 pb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
            <Plane className="h-5 w-5 rotate-45" />
          </div>
          <div>
            <span className="text-base font-bold tracking-tight text-white">
              AERO<span className="text-indigo-400">ADMIN</span>
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Operations Control
            </span>
          </div>
        </div>

        {/* Navigation Routes */}
        <nav className="mt-5 flex flex-1 flex-col gap-1.5 text-xs font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <LayoutDashboard className="h-4 w-4 text-indigo-400" />
            <span>Overview Dashboard</span>
          </Link>

          {/* Payment Approvals (Priority Workflow) */}
          <Link
            href="/admin/payments"
            className="flex items-center justify-between rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-4 w-4 text-emerald-400" />
              <span>Payment Approvals</span>
            </div>
            {pendingApprovalsCount > 0 && (
              <span className="flex h-5 items-center justify-center rounded-full bg-amber-500 px-2 text-[10px] font-bold text-zinc-950 shadow">
                {pendingApprovalsCount}
              </span>
            )}
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <Package className="h-4 w-4 text-indigo-400" />
            <span>500+ SKU Catalog</span>
          </Link>

          <Link
            href="/admin/import"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <FileSpreadsheet className="h-4 w-4 text-indigo-400" />
            <span>Bulk CSV/Excel Ingest</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <ShoppingBag className="h-4 w-4 text-indigo-400" />
            <span>Orders & Dispatch</span>
          </Link>

          <Link
            href="/admin/audit"
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-white"
          >
            <History className="h-4 w-4 text-indigo-400" />
            <span>Audit Trail Logs</span>
          </Link>
        </nav>

        {/* Administrator Profile & Session Actions */}
        <div className="border-t border-zinc-800/80 pt-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <p className="text-xs font-semibold text-zinc-200">{session.name}</p>
              <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium">
                Admin Session Active
              </span>
            </div>

            <form
              action={async () => {
                "use server";
                await logoutAction();
              }}
            >
              <button
                type="submit"
                title="Log out of admin portal"
                className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-800 hover:text-rose-400 transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main Back-Office Content Area */}
      <main className="flex-1 pl-64">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
