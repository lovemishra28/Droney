"use client";

import React, { useState, useTransition } from "react";
import {
  FileText,
  Loader2,
  Search,
  Truck,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  COURIER_PARTNERS,
  updateOrderFulfillmentAction,
} from "@/server/actions/admin-orders";
import { GstInvoiceModal, type InvoiceData } from "@/components/admin/gst-invoice-modal";

export interface AdminOrderRecord {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  totalAmountPaise: number;
  paymentMethod: string;
  paymentStatus:
    | "pending_payment"
    | "awaiting_verification"
    | "paid"
    | "rejected";
  upiTransactionId?: string | null;
  orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  courierPartner?: string | null;
  trackingAwb?: string | null;
  createdAt: string;
  shippingAddress: {
    fullName: string;
    flatBuilding: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    insuranceDetails?: {
      opted: boolean;
      fullName?: string;
      phone?: string;
      email?: string;
      dronePurpose?: string;
      nomineeName?: string;
    };
  };
  items: Array<{
    title: string;
    quantity: number;
    unitPricePaise: number;
    isSecondHand: boolean;
  }>;
}

type CourierPartner = (typeof COURIER_PARTNERS)[number];
type OrderStatus = AdminOrderRecord["orderStatus"];

interface OrderFulfillmentManagerProps {
  initialOrders: AdminOrderRecord[];
}

export function OrderFulfillmentManager({
  initialOrders,
}: OrderFulfillmentManagerProps) {
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "processing" | "shipped" | "delivered">("all");

  // Dispatch Action Modal State
  const [dispatchModalOrder, setDispatchModalOrder] = useState<AdminOrderRecord | null>(null);
  const [selectedCourier, setSelectedCourier] = useState<string>(COURIER_PARTNERS[0]);
  const [awbInput, setAwbInput] = useState("");
  const [statusInput, setStatusInput] = useState<AdminOrderRecord["orderStatus"]>("shipped");

  // Invoice Modal State
  const [activeInvoice, setActiveInvoice] = useState<InvoiceData | null>(null);

  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleOpenDispatchModal = (ord: AdminOrderRecord) => {
    setDispatchModalOrder(ord);
    setSelectedCourier(ord.courierPartner || COURIER_PARTNERS[0]);
    setAwbInput(ord.trackingAwb || "");
    setStatusInput(ord.orderStatus === "placed" ? "processing" : ord.orderStatus);
    setActionError(null);
  };

  const handleSaveFulfillment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dispatchModalOrder) return;

    setActionError(null);
    startTransition(async () => {
      const result = await updateOrderFulfillmentAction({
        orderId: dispatchModalOrder.id,
        orderStatus: statusInput,
        courierPartner:
          statusInput === "shipped"
            ? (selectedCourier as CourierPartner)
            : undefined,
        trackingAwb: statusInput === "shipped" ? awbInput.trim() : undefined,
      });

      if (!result.success) {
        setActionError(result.message || "Failed to update fulfillment status.");
        return;
      }

      setOrdersList((prev) =>
        prev.map((ord) =>
          ord.id === dispatchModalOrder.id
            ? {
                ...ord,
                orderStatus: statusInput,
                courierPartner: statusInput === "shipped" ? selectedCourier : ord.courierPartner,
                trackingAwb: statusInput === "shipped" ? awbInput.trim() : ord.trackingAwb,
              }
            : ord
        )
      );

      setDispatchModalOrder(null);
    });
  };

  // Filter Pipeline
  const filteredOrders = ordersList.filter((ord) => {
    const matchesTab =
      activeTab === "all" ? true : ord.orderStatus === activeTab;
    const term = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !term ||
      ord.orderReference.toLowerCase().includes(term) ||
      ord.customerName.toLowerCase().includes(term) ||
      (ord.trackingAwb && ord.trackingAwb.toLowerCase().includes(term)) ||
      (ord.customerPhone && ord.customerPhone.includes(term));

    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search & Status Tabs Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 p-1 text-xs shadow-xs">
          {[
            { label: "All Orders", value: "all" },
            { label: "Processing", value: "processing" },
            { label: "Shipped", value: "shipped" },
            { label: "Delivered", value: "delivered" },
          ].map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() =>
                setActiveTab(
                  tab.value as "all" | "processing" | "shipped" | "delivered"
                )
              }
              className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${
                activeTab === tab.value
                  ? "bg-[#c8f33b] text-black font-bold shadow-xs"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-zinc-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[260px] flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Order Ref, AWB, customer name..."
            className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 py-2.5 pl-9 pr-3 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Orders Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[11px]">
              <tr>
                <th className="px-5 py-3.5">Order Ref</th>
                <th className="px-5 py-3.5">Recipient Destination</th>
                <th className="px-5 py-3.5">Amount & Payment</th>
                <th className="px-5 py-3.5">Fulfillment Status</th>
                <th className="px-5 py-3.5">Courier & AWB Tracking</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-zinc-800 dark:text-zinc-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-zinc-500 dark:text-zinc-400 font-mono">
                    No orders match the selected fulfillment criteria.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    {/* Order Reference */}
                    <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-white text-sm">
                      <div className="flex items-center gap-1.5">
                        <span>{ord.orderReference}</span>
                        {ord.shippingAddress?.insuranceDetails?.opted && (
                          <span className="rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-600/40 px-1.5 py-0.2 text-[9px] font-bold">
                            🛡️ Fly Care
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] font-normal text-zinc-500 mt-0.5">
                        {ord.items.length} item(s) • {new Date(ord.createdAt).toLocaleDateString("en-IN")}
                      </span>
                    </td>

                    {/* Recipient */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white">{ord.customerName}</p>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {ord.shippingAddress?.city}, {ord.shippingAddress?.state} ({ord.shippingAddress?.pincode})
                      </p>
                    </td>

                    {/* Amount & Settlement Status */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-white font-mono">
                        {formatINR(ord.totalAmountPaise)}
                      </p>
                      <span
                        className={`inline-block mt-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wider ${
                          ord.paymentStatus === "paid"
                            ? "bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                            : "bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                        }`}
                      >
                        {ord.paymentStatus.replace("_", " ")}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          ord.orderStatus === "delivered"
                            ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30"
                            : ord.orderStatus === "shipped"
                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30"
                            : ord.orderStatus === "processing"
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800"
                        }`}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        <span>{ord.orderStatus}</span>
                      </span>
                    </td>

                    {/* Courier Tracking */}
                    <td className="px-5 py-4">
                      {ord.trackingAwb ? (
                        <div className="font-mono text-[11px]">
                          <span className="font-sans font-semibold text-zinc-700 dark:text-zinc-300">
                            {ord.courierPartner}:
                          </span>{" "}
                          <span className="text-lime-700 dark:text-[#c8f33b] font-bold">{ord.trackingAwb}</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-zinc-400 dark:text-zinc-500 italic">
                          Awaiting Dispatch Linking
                        </span>
                      )}
                    </td>

                    {/* Action Triggers */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Dispatch Update Button */}
                        <button
                          type="button"
                          onClick={() => handleOpenDispatchModal(ord)}
                          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
                        >
                          <Truck className="h-3.5 w-3.5 text-lime-700 dark:text-[#c8f33b]" />
                          <span>Dispatch</span>
                        </button>

                        {/* Invoice Generator Button */}
                        <button
                          type="button"
                          onClick={() => setActiveInvoice(ord)}
                          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors shadow-xs"
                          title="Generate GST Tax Invoice"
                        >
                          <FileText className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch & Courier Assignment Modal */}
      {dispatchModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <form
            onSubmit={handleSaveFulfillment}
            className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-zinc-900 dark:text-zinc-200 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-lime-700 dark:text-[#c8f33b]">
              <Truck className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans">
                Update Fulfillment: #{dispatchModalOrder.orderReference}
              </h3>
            </div>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Assign an Indian courier partner and Air Waybill (AWB) number.
            </p>

            {actionError && (
              <div className="mt-3 rounded-lg border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-2.5 text-xs text-rose-700 dark:text-rose-300">
                {actionError}
              </div>
            )}

            <div className="mt-4 space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400">
                  Lifecycle Status
                </label>
                <select
                  value={statusInput}
                  onChange={(e) =>
                    setStatusInput(e.target.value as OrderStatus)
                  }
                  className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-white focus:border-black dark:focus:border-indigo-500 focus:outline-none"
                >
                  <option value="processing">Processing / Packing</option>
                  <option value="shipped">Shipped (Dispatched)</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              {statusInput === "shipped" && (
                <>
                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400">
                      Courier Logistics Partner
                    </label>
                    <select
                      value={selectedCourier}
                      onChange={(e) => setSelectedCourier(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-white focus:border-black dark:focus:border-indigo-500 focus:outline-none"
                    >
                      {COURIER_PARTNERS.map((cp) => (
                        <option key={cp} value={cp}>
                          {cp}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold uppercase tracking-wider text-zinc-700 dark:text-zinc-400">
                      Air Waybill Number (AWB)
                    </label>
                    <input
                      type="text"
                      required
                      value={awbInput}
                      onChange={(e) => setAwbInput(e.target.value)}
                      placeholder="e.g. 14892019842"
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 font-mono text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 focus:border-black dark:focus:border-indigo-500 focus:outline-none"
                    />
                    <span className="mt-1 block text-[10px] text-zinc-500">
                      Saving automatically sends customer SMS & Email tracking updates.
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDispatchModalOrder(null)}
                className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center gap-1.5 rounded-xl bg-lime-500 dark:bg-[#c8f33b] px-4 py-2 text-xs font-bold text-black hover:bg-lime-400 dark:hover:bg-[#b5e028] transition-colors disabled:opacity-50 shadow-xs hover:shadow-[0_0_12px_rgba(200,243,59,0.3)]"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Save & Notify Customer</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* GST Invoice Modal Preview */}
      <GstInvoiceModal
        invoice={activeInvoice}
        onClose={() => setActiveInvoice(null)}
      />
    </div>
  );
}
