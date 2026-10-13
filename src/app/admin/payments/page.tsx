import React from "react";
import { Zap } from "lucide-react";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import {
  PaymentApprovalTable,
  type PendingOrderApproval,
} from "@/components/admin/payment-approval-table";

export const dynamic = "force-dynamic";

type PendingRecord = {
  id: string;
  orderReference: string;
  totalAmountPaise: number;
  upiTransactionId: string | null;
  paymentScreenshotUrl: string | null;
  createdAt: Date;
  user: {
    fullName: string;
    phone: string | null;
    email: string | null;
  } | null;
  items: Array<{ id: string }>;
};

export default async function AdminPaymentsPage() {
  await requireAdminSession();

  let pendingRecords: PendingRecord[] = [];
  try {
    pendingRecords = await db.query.orders.findMany({
      where: and(
        eq(orders.paymentStatus, "awaiting_verification"),
        isNotNull(orders.upiTransactionId)
      ),
      orderBy: [desc(orders.createdAt)],
      with: {
        user: {
          columns: { fullName: true, phone: true, email: true },
        },
        items: {
          columns: { id: true },
        },
      },
    });
  } catch (error) {
    console.error("[Admin Payments DB Error]:", error);
  }

  const formattedApprovals: PendingOrderApproval[] = pendingRecords.map((ord) => ({
    id: ord.id,
    orderReference: ord.orderReference,
    customerName: ord.user?.fullName || "Guest Customer",
    customerPhone: ord.user?.phone || null,
    customerEmail: ord.user?.email || null,
    totalAmountPaise: ord.totalAmountPaise,
    upiTransactionId: ord.upiTransactionId,
    paymentScreenshotUrl: ord.paymentScreenshotUrl,
    createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
    itemCount: ord.items?.length || 0,
  }));

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-400">
              UPI Settlement Protocol
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
            Direct UPI Payment Approvals
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Verify submitted 12-digit UTR codes against your bank statement before authorizing order dispatch.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-2 text-xs font-mono text-zinc-300">
          <Zap className="h-4 w-4 text-[#c8f33b]" />
          <span>Zero Gateway Intermediary Mode Active</span>
        </div>
      </div>

      {/* Approvals Table */}
      <PaymentApprovalTable orders={formattedApprovals} />
    </div>
  );
}
