import React from "react";
import { requireAdminSession } from "@/server/queries/admin";
import { SessionWatcher } from "@/components/admin/session-watcher";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminTopbar } from "@/components/admin/admin-topbar";
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
    <AdminThemeProvider>
      <div className="flex min-h-screen selection:bg-[#c8f33b] selection:text-black">
        <SessionWatcher />

        {/* Modern Altitude Operations Sidebar */}
        <AdminSidebar
          adminName={session.fullName || "Administrator"}
          pendingApprovalsCount={pendingApprovalsCount}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col md:pl-64 min-w-0">
          {/* Top Telemetry & Breadcrumb Bar with Theme Switcher */}
          <AdminTopbar />

          {/* Content Workspace */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 pt-18 md:pt-8 max-w-[1600px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  );
}
