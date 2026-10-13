import React from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  IndianRupee,
  Package,
  Plus,
  ShoppingBag,
  Zap,
} from "lucide-react";
import { getAdminOverviewMetrics } from "@/server/queries/admin";
import { formatINR } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const metrics = await getAdminOverviewMetrics();

  return (
    <div className="space-y-8">
      {/* Top Welcome & Operations Status Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8f33b]">
              Fleet Telemetry Live
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
            Operations & Fleet Overview
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Real-time direct UPI settlement queue, 500+ SKU inventory thresholds, and dispatch pipeline.
          </p>
        </div>

        {/* Quick Action Shortcuts */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 rounded-xl bg-[#c8f33b] px-3.5 py-2 text-xs font-bold text-black transition-all hover:bg-[#b5e028] shadow-xs hover:shadow-[0_0_15px_rgba(200,243,59,0.3)]"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add New SKU</span>
          </Link>

          <Link
            href="/admin/import"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-zinc-400" />
            <span>Bulk CSV Ingest</span>
          </Link>

          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:border-zinc-700 hover:text-white"
          >
            <span>Live Store</span>
            <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
          </Link>
        </div>
      </div>

      {/* Metric Telemetry Cards Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Verified Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Verified Revenue</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <IndianRupee className="h-3.5 w-3.5 text-emerald-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white font-mono">
            {formatINR(metrics.totalRevenuePaise)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span>Direct bank transfer (0% Gateway fees)</span>
          </div>
        </div>

        {/* Pending UPI Verifications (Interactive Priority CTA) */}
        <Link
          href="/admin/payments"
          className="group relative overflow-hidden rounded-2xl border border-amber-500/40 bg-zinc-900/50 p-5 transition-all hover:border-amber-400 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
        >
          <div className="flex items-center justify-between text-xs font-mono text-amber-300">
            <span className="font-bold uppercase tracking-wider">Pending UPI Approvals</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-400/20 border border-amber-400/30">
              <Clock className="h-3.5 w-3.5 animate-pulse text-amber-300" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-amber-200 font-mono">
            {metrics.pendingPaymentApprovalsCount} Orders
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-amber-400">
            <span>Verify UTR bank settlement</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        {/* Active Fleet SKUs */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Active Fleet Listings</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#c8f33b]/10 border border-[#c8f33b]/20">
              <Package className="h-3.5 w-3.5 text-[#c8f33b]" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white font-mono">
            {metrics.activeSkuCount} Products
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-zinc-500">
            <span>Cameras, FPV, motors & spares</span>
          </div>
        </div>

        {/* Low-Stock Warnings */}
        <div className="relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
            <span>Low Stock Warning (≤ 3)</span>
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-500/10 border border-rose-500/20">
              <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white font-mono">
            {metrics.lowStockSkuCount} SKUs
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-[11px] text-rose-400/90 font-medium">
            <span>Requires warehouse replenish</span>
          </div>
        </div>
      </div>

      {/* Priority Workflow Action Strips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/payments"
          className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              Reconcile Bank UTRs
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Inspect 12-digit UTR codes against ICICI / HDFC statement.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/products"
          className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#c8f33b]/10 border border-[#c8f33b]/20 text-[#c8f33b] group-hover:scale-105 transition-transform">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-[#c8f33b] transition-colors">
              Manage Catalog & Inventory
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Quick stock override and instant active/draft toggles.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/orders"
          className="flex items-center gap-4 p-4 rounded-2xl border border-zinc-800/80 bg-zinc-900/30 hover:bg-zinc-900/70 hover:border-zinc-700 transition-all group"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              Courier Dispatch & AWB
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Delhivery & Blue Dart tracking and GST invoice generator.
            </p>
          </div>
        </Link>
      </div>

      {/* Recent Orders Overview Table */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-900/30">
        <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-[#c8f33b]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-200 font-mono">
              Recent Storefront Customer Orders
            </h2>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-[#c8f33b] hover:underline"
          >
            <span>View All Orders</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 font-mono text-zinc-400 uppercase text-[11px]">
              <tr>
                <th className="px-6 py-3.5">Order Ref</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Amount</th>
                <th className="px-6 py-3.5">Payment Status</th>
                <th className="px-6 py-3.5">Fulfillment</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-200">
              {metrics.recentOrders && metrics.recentOrders.length > 0 ? (
                metrics.recentOrders.map((ord) => {
                  const isPaid = ord.paymentStatus === "paid";
                  const isPending = ord.paymentStatus === "awaiting_verification";

                  return (
                    <tr
                      key={ord.id}
                      className="hover:bg-zinc-900/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {ord.orderReference}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-semibold text-zinc-100 block">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-zinc-500 font-mono">
                          {ord.customerPhone || "Direct Customer"}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-white">
                        {formatINR(ord.totalAmountPaise)}
                      </td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Paid
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-amber-400">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                            Awaiting UTR
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-500/30 bg-rose-950/40 px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase text-rose-400">
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 font-mono text-[11px]">
                        <span className="rounded bg-zinc-800 px-2 py-0.5 text-zinc-300 uppercase">
                          {ord.orderStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={isPending ? "/admin/payments" : "/admin/orders"}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-[#c8f33b] hover:underline"
                        >
                          <span>Manage</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-10 text-center text-zinc-500 font-mono"
                  >
                    No recent orders placed in the system.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
