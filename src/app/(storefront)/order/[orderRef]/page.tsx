import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Package,
  Truck,
} from "lucide-react";
import { getOrderByReference } from "@/server/queries/orders";
import { getCurrentSession } from "@/server/services/session";
import { formatINR } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/media";
import { PaymentProofForm } from "@/components/storefront/payment-proof-form";

interface OrderPageProps {
  params: Promise<{ orderRef: string }>;
}

export default async function OrderConfirmationPage({ params }: OrderPageProps) {
  const session = await getCurrentSession();
  if (!session) {
    redirect("/login");
  }

  const { orderRef } = await params;
  const order = await getOrderByReference(orderRef);

  if (!order) {
    notFound();
  }

  const isPaid = order.paymentStatus === "paid";
  const isRejected = order.paymentStatus === "rejected";

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Header & Status Banner */}
        <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 pb-6">
            <div>
              <span className="font-mono text-xs uppercase tracking-wider text-zinc-500 font-bold">
                Order #{order.orderReference}
              </span>
              <h1 className="mt-1 text-2xl font-black tracking-tight text-black sm:text-3xl">
                {isPaid
                  ? "Payment Verified & Order Confirmed"
                  : isRejected
                  ? "Payment Verification Issue"
                  : "Payment Under Verification"}
              </h1>
              <p className="mt-1 text-xs text-zinc-500 font-mono">
                Placed on {new Date(order.createdAt).toLocaleDateString("en-IN", { dateStyle: "long" })}
              </p>
            </div>

          {/* Dynamic Status Badge */}
          <div
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold backdrop-blur-md ${
              isPaid
                ? "border border-emerald-500/40 bg-emerald-950/60 text-emerald-300"
                : isRejected
                ? "border border-rose-500/40 bg-rose-950/60 text-rose-300"
                : "border border-amber-500/40 bg-amber-950/60 text-amber-300"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : isRejected ? (
              <AlertTriangle className="h-4 w-4" />
            ) : (
              <Clock className="h-4 w-4 animate-spin" />
            )}
            <span className="capitalize">
              {order.paymentStatus.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Verification Timeline / Steps */}
        <div className="mt-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {/* Step 1: Order Placed */}
            <div className="flex items-start gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
              <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="text-xs font-bold text-black">1. Order Submitted</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Items reserved and reference generated.</p>
              </div>
            </div>

            {/* Step 2: UPI Settlement Verification */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                isPaid
                  ? "border-emerald-200 bg-emerald-50/50"
                  : isRejected
                  ? "border-rose-200 bg-rose-50/50"
                  : "border-amber-200 bg-amber-50/50"
              }`}
            >
              {isPaid ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600 flex-shrink-0" />
              ) : isRejected ? (
                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600 flex-shrink-0" />
              ) : (
                <Clock className="mt-0.5 h-5 w-5 text-amber-600 flex-shrink-0" />
              )}
              <div>
                <p className="text-xs font-bold text-black">2. Bank UTR Match</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {isPaid
                    ? `Verified on ${order.verifiedAt ? new Date(order.verifiedAt).toLocaleDateString("en-IN") : "today"}`
                    : isRejected
                    ? "UTR mismatched or transaction not found."
                    : "Admin is matching UTR with bank records."}
                </p>
              </div>
            </div>

            {/* Step 3: Courier Dispatch */}
            <div
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                order.orderStatus === "shipped" || order.orderStatus === "delivered"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-zinc-200 bg-zinc-50 opacity-70"
              }`}
            >
              <Truck
                className={`mt-0.5 h-5 w-5 flex-shrink-0 ${
                  order.orderStatus === "shipped" || order.orderStatus === "delivered"
                    ? "text-emerald-600"
                    : "text-zinc-400"
                }`}
              />
              <div>
                <p className="text-xs font-bold text-black">3. Air Dispatch</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  {order.trackingAwb
                    ? `${order.courierPartner || "Courier"} (AWB: ${order.trackingAwb})`
                    : "Dispatches after payment reconciliation."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Panel for Rejected UTR */}
        {isRejected && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
            <h3 className="text-sm font-bold text-rose-800">Need to Re-submit Your UTR?</h3>
            <p className="mt-1 text-xs text-rose-700 leading-relaxed">
              Our accounting team could not locate the funds using the submitted UTR. Please ensure you transferred the exact amount to the registered merchant ID and provide the valid 12-digit reference number below.
            </p>
            <div className="mt-4">
              <PaymentProofForm orderReference={order.orderReference} />
            </div>
          </div>
        )}
      </div>

      {/* Order Details & Summary Grid */}
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Purchased Items List */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-md">
            <h2 className="flex items-center gap-2 border-b border-zinc-200 pb-3 text-sm font-bold text-black">
              <Package className="h-4 w-4 text-black" />
              <span>Purchased Line Items ({order.items.length})</span>
            </h2>

            <ul className="divide-y divide-zinc-200">
              {order.items.map((item) => {
                const thumbnail = resolveImageUrl(item.product?.media?.[0]?.url);

                return (
                  <li key={item.id} className="flex gap-4 py-4">
                    <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-50">
                      <Image
                        src={thumbnail}
                        alt={item.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-black">{item.title}</h3>
                        {item.isSecondHand && (
                          <span className="text-[10px] font-bold text-emerald-800 uppercase font-mono">
                            Pre-Owned Certified
                          </span>
                        )}
                        <p className="mt-1 text-xs text-zinc-500 font-mono">Qty: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-black text-black font-mono">
                        {formatINR(item.unitPricePaise * item.quantity)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="mt-4 border-t border-zinc-200 pt-4 flex justify-between text-base font-black text-black">
              <span>Total Paid / Payable</span>
              <span>{formatINR(order.totalAmountPaise)}</span>
            </div>
          </div>
        </div>

        {/* Sidebar: Delivery Details & Payment Reference Metadata */}
        <div className="space-y-6">
          {/* Transaction Metadata */}
          <div className="rounded-3xl border border-zinc-200 bg-zinc-50/70 p-5 text-xs text-zinc-700 shadow-xs">
            <h3 className="border-b border-zinc-200 pb-2.5 font-bold text-black uppercase tracking-wider font-mono">
              Payment Record
            </h3>
            <div className="mt-3 space-y-2">
              <div className="flex justify-between">
                <span className="text-zinc-500">Method:</span>
                <span className="font-bold text-black">Direct UPI QR</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Submitted UTR:</span>
                <span className="font-mono font-bold text-black">
                  {order.upiTransactionId || "Pending Input"}
                </span>
              </div>
              {order.paymentScreenshotUrl && (
                <div className="pt-2 border-t border-zinc-200">
                  <a
                    href={order.paymentScreenshotUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-black font-bold hover:underline"
                  >
                    <span>View Submitted Receipt</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Summary */}
          <div className="rounded-3xl border border-zinc-200 bg-white p-5 text-xs text-zinc-700 shadow-md">
            <h3 className="flex items-center gap-1.5 border-b border-zinc-200 pb-2.5 font-bold text-black uppercase tracking-wider font-mono">
              <MapPin className="h-3.5 w-3.5 text-black" />
              <span>Dispatch Address</span>
            </h3>
            <div className="mt-3 leading-relaxed text-zinc-600">
              <p className="font-bold text-black">{order.shippingAddress?.fullName}</p>
              <p>{order.shippingAddress?.flatBuilding}</p>
              <p>{order.shippingAddress?.street}</p>
              <p>
                {order.shippingAddress?.city}, {order.shippingAddress?.state} -{" "}
                <span className="font-mono font-bold text-black">{order.shippingAddress?.pincode}</span>
              </p>
              <p className="mt-2 text-zinc-500 font-mono">Contact: {order.shippingAddress?.phone}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);
}
