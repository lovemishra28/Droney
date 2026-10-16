import React from "react";
import { requireAdminSession } from "@/server/queries/admin";
import { SessionWatcher } from "@/components/admin/session-watcher";
import { AdminTopbar } from "@/components/admin/admin-topbar";
import { AdminNavStrip } from "@/components/admin/admin-nav-strip";
import { AdminThemeProvider } from "@/components/admin/admin-theme-provider";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { and, count, eq, isNotNull } from "drizzle-orm";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdminSession();

  // Query pending payments count for live notification badge
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
    <AdminThemeProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-[#c8f33b] selection:text-black flex flex-col">
        <SessionWatcher />

        {/* Global Storefront-Style Admin Header */}
        <AdminTopbar adminName={session.fullName || "Administrator"} />

        {/* Horizontal Navigation Strip Directly Under Header */}
        <AdminNavStrip pendingApprovalsCount={pendingApprovalsCount} />

        {/* Main Content Area - Full Screen Width */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {children}
        </main>
      </div>
    </AdminThemeProvider>
  );
}
