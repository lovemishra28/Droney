import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  IndianRupee,
  Package,
  ShieldCheck,
} from "lucide-react";
import { getAdminOverviewMetrics } from "@/server/queries/admin";
import { formatINR } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const metrics = await getAdminOverviewMetrics();

  return (
    <div className="space-y-8">
      {/* Top Welcome & Health Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Operations Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time catalog metrics, inventory health, and UPI verification status.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 px-3.5 py-1.5 text-xs text-zinc-300">
          <ShieldCheck className="h-4 w-4 text-emerald-400" />
          <span>High-Security Environment Active</span>
        </div>
      </div>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Verified Revenue */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Verified Revenue</span>
            <IndianRupee className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            {formatINR(metrics.totalRevenuePaise)}
          </p>
          <span className="mt-1 block text-[11px] text-zinc-500">
            Cleared direct to bank (Zero PG fees)
          </span>
        </div>

        {/* Pending UPI Verifications (Interactive CTA) */}
        <Link
          href="/admin/payments"
          className="group rounded-2xl border border-amber-500/30 bg-amber-950/20 p-5 transition-all hover:border-amber-500/60 hover:bg-amber-950/40"
        >
          <div className="flex items-center justify-between text-xs text-amber-300">
            <span className="font-semibold">Pending UPI Approvals</span>
            <Clock className="h-4 w-4 animate-pulse text-amber-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-amber-200">
            {metrics.pendingPaymentApprovalsCount} Orders
          </p>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-400/80 group-hover:underline">
            <span>Verify UTR bank transfers</span>
            <ArrowRight className="h-3 w-3" />
          </div>
        </Link>

        {/* Active SKUs */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Active SKUs</span>
            <Package className="h-4 w-4 text-indigo-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            {metrics.activeSkuCount} Products
          </p>
          <span className="mt-1 block text-[11px] text-zinc-500">
            Across frames, ESCs & used drones
          </span>
        </div>

        {/* Low-Stock Warnings */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Low Stock (≤ 3 units)</span>
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <p className="mt-2 text-2xl font-extrabold tracking-tight text-white">
            {metrics.lowStockSkuCount} SKUs
          </p>
          <span className="mt-1 block text-[11px] text-zinc-500">
            Requires warehouse reorder
          </span>
        </div>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/80 px-6 py-4">
          <h2 className="text-sm font-semibold text-zinc-100 uppercase tracking-wider">
            Recent Storefront Orders
          </h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
              <tr>
                <th className="px-6 py-3">Order Ref</th>
                <th className="px-6 py-3">Customer</th>
                <th className="px-6 py-3">Amount</th>
                <th className="px-6 py-3">Payment Status</th>
                <th className="px-6 py-3">Fulfillment</th>
                <th className="px-6 py-3">Placed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
              {metrics.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                    No orders recorded in the system yet.
                  </td>
                </tr>
              ) : (
                metrics.recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-900/60 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-indigo-400">
                      {ord.orderReference}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{ord.customerName}</p>
                      <span className="text-[11px] text-zinc-500">{ord.customerPhone || "Email Only"}</span>
                    </td>
                    <td className="px-6 py-4 font-semibold text-white">
                      {formatINR(ord.totalAmountPaise)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          ord.paymentStatus === "paid"
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-500/30"
                            : ord.paymentStatus === "rejected"
                            ? "bg-rose-950/80 text-rose-300 border border-rose-500/30"
                            : "bg-amber-950/80 text-amber-300 border border-amber-500/30"
                        }`}
                      >
                        {ord.paymentStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4 capitalize text-zinc-300">
                      {ord.orderStatus}
                    </td>
                    <td className="px-6 py-4 text-zinc-400">
                      {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
