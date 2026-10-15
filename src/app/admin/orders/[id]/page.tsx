import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { orders, type OrderItem } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils";

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let order = null;
  try {
    order = await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: {
        user: true,
        items: true,
      },
    });
  } catch (error) {
    console.error("[Order Detail DB Error]:", error);
  }

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
              Order Fulfillment Record
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
            Order #{order.orderReference}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              dateStyle: "long",
            })}{" "}
            • Customer: <span className="text-zinc-900 dark:text-white font-semibold">{order.user?.fullName || "Guest"}</span>
          </p>
        </div>

        <Link
          href="/admin/orders"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Orders</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 shadow-xs transition-colors">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase">Total Settled</span>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {formatINR(order.totalAmountPaise)}
          </p>
          <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 uppercase mt-1 block font-semibold">
            Payment: {order.paymentStatus}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 shadow-xs transition-colors">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase">Fulfillment</span>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1 uppercase">
            {order.orderStatus}
          </p>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 block">
            {order.courierPartner ? `${order.courierPartner}: ${order.trackingAwb}` : "Awaiting AWB"}
          </span>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 shadow-xs transition-colors">
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 uppercase">Bank UTR</span>
          <p className="text-xl font-bold font-mono text-zinc-900 dark:text-white mt-1">
            {order.upiTransactionId || "N/A"}
          </p>
          <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-1 block">
            Verified direct to bank
          </span>
        </div>
      </div>

      {/* Shipping & Delivery Address */}
      {order.shippingAddress && (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 p-5 shadow-xs">
          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3 text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-400">
            Delivery & Recipient Address
          </div>
          <div className="text-xs space-y-1 text-zinc-800 dark:text-zinc-200">
            <p className="font-bold text-sm text-zinc-900 dark:text-white">{order.shippingAddress.fullName}</p>
            <p>Phone: {order.shippingAddress.phone}</p>
            <p>{order.shippingAddress.flatBuilding}, {order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
          </div>
        </div>
      )}

      {/* Fly Care Premium Insurance Policy Details (If opted) */}
      {order.shippingAddress?.insuranceDetails?.opted && (
        <div className="overflow-hidden rounded-2xl border border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/60 dark:bg-emerald-950/20 p-5 shadow-xs">
          <div className="flex items-center gap-2 border-b border-emerald-200 dark:border-emerald-800/80 pb-3 mb-3 text-xs font-mono font-bold uppercase text-emerald-800 dark:text-emerald-400">
            <span>🛡️ Fly Care Premium Insurance Registration</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Insured Policyholder</span>
              <p className="font-bold text-zinc-900 dark:text-white mt-0.5">
                {order.shippingAddress.insuranceDetails.fullName || order.shippingAddress.fullName}
              </p>
            </div>
            <div>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Insurance Phone</span>
              <p className="font-bold text-zinc-900 dark:text-white mt-0.5">
                {order.shippingAddress.insuranceDetails.phone || order.shippingAddress.phone}
              </p>
            </div>
            {order.shippingAddress.insuranceDetails.email && (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Policy Email</span>
                <p className="font-medium text-zinc-900 dark:text-white mt-0.5">
                  {order.shippingAddress.insuranceDetails.email}
                </p>
              </div>
            )}
            {order.shippingAddress.insuranceDetails.dronePurpose && (
              <div>
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Flight Application</span>
                <p className="font-medium text-zinc-900 dark:text-white mt-0.5">
                  {order.shippingAddress.insuranceDetails.dronePurpose}
                </p>
              </div>
            )}
            {order.shippingAddress.insuranceDetails.nomineeName && (
              <div className="sm:col-span-2">
                <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">Nominee / Contact</span>
                <p className="font-medium text-zinc-900 dark:text-white mt-0.5">
                  {order.shippingAddress.insuranceDetails.nomineeName}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Line Items */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 px-6 py-3.5 text-xs font-mono font-bold uppercase text-zinc-700 dark:text-zinc-400">
          Order Items ({order.items.length})
        </div>
        <div className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 p-4">
          {order.items.map((item: OrderItem) => (
            <div key={item.id} className="flex justify-between py-2.5 text-xs">
              <span className="text-zinc-900 dark:text-white font-medium">{item.title} x {item.quantity}</span>
              <span className="font-mono text-zinc-800 dark:text-zinc-200 font-bold">{formatINR(item.unitPricePaise * item.quantity)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
