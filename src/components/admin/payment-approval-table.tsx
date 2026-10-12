"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Loader2,
  X,
} from "lucide-react";
import { formatINR } from "@/lib/utils";
import {
  approvePaymentAction,
  rejectPaymentAction,
} from "@/server/actions/admin-payments";

export interface PendingOrderApproval {
  id: string;
  orderReference: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string | null;
  totalAmountPaise: number;
  upiTransactionId: string | null;
  paymentScreenshotUrl: string | null;
  createdAt: string;
  itemCount: number;
}

interface PaymentApprovalTableProps {
  orders: PendingOrderApproval[];
}

export function PaymentApprovalTable({ orders: initialOrders }: PaymentApprovalTableProps) {
  const [ordersList, setOrdersList] = useState(initialOrders);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);
  const [previewScreenshotUrl, setPreviewScreenshotUrl] = useState<string | null>(null);

  // Rejection Dialog State
  const [rejectingOrderId, setRejectingOrderId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isPending, startTransition] = useTransition();
  const [actionError, setActionError] = useState<string | null>(null);

  const handleCopyUtr = (utr: string) => {
    navigator.clipboard.writeText(utr);
    setCopiedUtr(utr);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const handleApprove = (orderId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await approvePaymentAction({ orderId });
      if (!result.success) {
        setActionError(result.message || "Failed to approve payment.");
        return;
      }
      setOrdersList((prev) => prev.filter((o) => o.id !== orderId));
    });
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingOrderId || !rejectReason.trim()) return;

    setActionError(null);
    startTransition(async () => {
      const result = await rejectPaymentAction({
        orderId: rejectingOrderId,
        reason: rejectReason.trim(),
      });
      if (!result.success) {
        setActionError(result.message || "Failed to reject payment.");
        return;
      }
      setOrdersList((prev) => prev.filter((o) => o.id !== rejectingOrderId));
      setRejectingOrderId(null);
      setRejectReason("");
    });
  };

  return (
    <div className="space-y-4">
      {actionError && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-950/40 p-3.5 text-xs text-rose-300">
          {actionError}
        </div>
      )}

      {ordersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
          <CheckCircle2 className="h-10 w-10 text-emerald-500/60" />
          <h3 className="mt-3 text-sm font-semibold text-zinc-200">
            Reconciliation Queue Cleared
          </h3>
          <p className="mt-1 text-xs text-zinc-500">
            No customer orders are currently awaiting manual UPI verification.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
                <tr>
                  <th className="px-5 py-3.5">Order Ref</th>
                  <th className="px-5 py-3.5">Customer</th>
                  <th className="px-5 py-3.5">Payable Amount</th>
                  <th className="px-5 py-3.5">12-Digit Bank UTR</th>
                  <th className="px-5 py-3.5">Receipt Proof</th>
                  <th className="px-5 py-3.5 text-right">Verification Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-900/60 transition-colors">
                    {/* Order Reference */}
                    <td className="px-5 py-4 font-mono font-semibold text-indigo-400">
                      {ord.orderReference}
                      <span className="block text-[10px] font-normal text-zinc-500">
                        {ord.itemCount} line item(s)
                      </span>
                    </td>

                    {/* Customer Contact */}
                    <td className="px-5 py-4">
                      <p className="font-medium text-white">{ord.customerName}</p>
                      <span className="text-[11px] text-zinc-400">
                        {ord.customerPhone || ord.customerEmail || "N/A"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-semibold text-white">
                      {formatINR(ord.totalAmountPaise)}
                    </td>

                    {/* Submitted UTR with Copy Helper */}
                    <td className="px-5 py-4">
                      {ord.upiTransactionId ? (
                        <div className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 font-mono text-zinc-200">
                          <span>{ord.upiTransactionId}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(ord.upiTransactionId!)}
                            className="text-zinc-500 hover:text-zinc-200 transition-colors"
                            title="Copy UTR to verify in bank app"
                          >
                            {copiedUtr === ord.upiTransactionId ? (
                              <Check className="h-3 w-3 text-emerald-400" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-amber-500">Pending Input</span>
                      )}
                    </td>

                    {/* Screenshot Preview */}
                    <td className="px-5 py-4">
                      {ord.paymentScreenshotUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshotUrl(ord.paymentScreenshotUrl)}
                          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2 py-1 text-[11px] text-zinc-200 hover:bg-zinc-700 transition-colors"
                        >
                          <Eye className="h-3.5 w-3.5 text-indigo-400" />
                          <span>View Receipt</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-zinc-600">No image attached</span>
                      )}
                    </td>

                    {/* One-Click Approve / Reject Triggers */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleApprove(ord.id)}
                          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-500 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setRejectingOrderId(ord.id)}
                          className="flex items-center gap-1 rounded-lg border border-rose-500/30 bg-rose-950/40 px-2.5 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-900/50 transition-colors disabled:opacity-50"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Screenshot Zoom Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-lg w-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950 p-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <span className="text-xs font-semibold text-zinc-200">Payment Screenshot Preview</span>
              <button
                type="button"
                onClick={() => setPreviewScreenshotUrl(null)}
                className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative mt-3 aspect-[3/4] w-full overflow-hidden rounded-xl bg-zinc-900">
              <Image
                src={previewScreenshotUrl}
                alt="Payment proof screenshot"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <form
            onSubmit={handleRejectSubmit}
            className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-zinc-200 shadow-2xl"
          >
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-sm font-semibold text-zinc-100">Reject Payment & Release Stock</h3>
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              Specify why this transfer could not be validated. This message will be sent to the customer via SMS/Email:
            </p>

            <textarea
              required
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Funds not reflected in merchant bank account; invalid 12-digit UTR."
              className="mt-3 w-full rounded-xl border border-zinc-800 bg-zinc-900 p-3 text-xs text-white placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
            />

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectingOrderId(null)}
                className="rounded-xl border border-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-300 hover:bg-zinc-900 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending || !rejectReason.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-semibold text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <span>Confirm Rejection</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
