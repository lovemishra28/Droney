"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Eye,
  Loader2,
  ShieldAlert,
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
        <div className="rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 shrink-0 text-rose-600 dark:text-rose-400" />
          <span>{actionError}</span>
        </div>
      )}

      {ordersList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-800 p-16 text-center bg-zinc-50 dark:bg-zinc-900/20">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lime-500/10 dark:bg-[#c8f33b]/10 border border-lime-500/20 dark:border-[#c8f33b]/20 text-lime-700 dark:text-[#c8f33b]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-base font-bold text-zinc-900 dark:text-white font-mono uppercase tracking-wider">
            Reconciliation Queue Cleared
          </h3>
          <p className="mt-1.5 text-xs text-zinc-600 dark:text-zinc-400 max-w-sm">
            All submitted bank UTR numbers have been verified and cleared for immediate dispatch.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/70 font-mono text-[11px] text-zinc-600 dark:text-zinc-400 uppercase">
                <tr>
                  <th className="px-5 py-4">Order Ref</th>
                  <th className="px-5 py-4">Customer</th>
                  <th className="px-5 py-4">Payable Amount</th>
                  <th className="px-5 py-4">12-Digit Bank UTR</th>
                  <th className="px-5 py-4">Receipt Proof</th>
                  <th className="px-5 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
                {ordersList.map((ord) => (
                  <tr key={ord.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors">
                    {/* Order Reference */}
                    <td className="px-5 py-4">
                      <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
                        {ord.orderReference}
                      </span>
                      <span className="block text-[11px] font-mono text-zinc-500 mt-0.5">
                        {ord.itemCount} line item(s)
                      </span>
                    </td>

                    {/* Customer Contact */}
                    <td className="px-5 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{ord.customerName}</p>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400">
                        {ord.customerPhone || ord.customerEmail || "N/A"}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="px-5 py-4 font-mono font-bold text-zinc-900 dark:text-white text-sm">
                      {formatINR(ord.totalAmountPaise)}
                    </td>

                    {/* Submitted UTR with Copy Helper */}
                    <td className="px-5 py-4">
                      {ord.upiTransactionId ? (
                        <div className="inline-flex items-center gap-2 rounded-xl border border-zinc-300 dark:border-zinc-700/80 bg-zinc-50 dark:bg-zinc-950 px-3 py-1.5 font-mono text-xs text-zinc-900 dark:text-white shadow-xs">
                          <span className="font-bold tracking-wider text-amber-700 dark:text-amber-300">
                            {ord.upiTransactionId}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyUtr(ord.upiTransactionId!)}
                            className="text-zinc-500 hover:text-black dark:hover:text-white transition-colors"
                            title="Copy UTR to verify in net banking app"
                          >
                            {copiedUtr === ord.upiTransactionId ? (
                              <Check className="h-3.5 w-3.5 text-lime-700 dark:text-[#c8f33b]" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                          Pending Input
                        </span>
                      )}
                    </td>

                    {/* Screenshot Preview */}
                    <td className="px-5 py-4">
                      {ord.paymentScreenshotUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewScreenshotUrl(ord.paymentScreenshotUrl)}
                          className="flex items-center gap-1.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800/90 px-2.5 py-1.5 text-[11px] font-semibold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
                        >
                          <Eye className="h-3.5 w-3.5 text-lime-700 dark:text-[#c8f33b]" />
                          <span>View Proof</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                          No file uploaded
                        </span>
                      )}
                    </td>

                    {/* One-Click Approve / Reject Triggers */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleApprove(ord.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-lime-500 dark:bg-[#c8f33b] px-3.5 py-1.5 text-xs font-bold text-black shadow-xs hover:bg-lime-400 dark:hover:bg-[#b5e028] transition-all disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Check className="h-3.5 w-3.5 stroke-[3]" />
                          )}
                          <span>Approve</span>
                        </button>

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setRejectingOrderId(ord.id)}
                          className="flex items-center gap-1.5 rounded-xl border border-rose-300 dark:border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors disabled:opacity-50"
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

      {/* Lightbox Receipt Screenshot Modal */}
      {previewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative max-h-[90vh] max-w-2xl w-full rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                Bank Transfer Screenshot Inspection
              </span>
              <div className="flex items-center gap-2">
                <a
                  href={previewScreenshotUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
                  title="Open full size"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewScreenshotUrl(null)}
                  className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 p-2">
              <div className="relative h-[65vh] w-full">
                <Image
                  src={previewScreenshotUrl}
                  alt="Customer Payment Receipt"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <AlertTriangle className="h-5 w-5" />
              <h3 className="text-base font-bold text-zinc-900 dark:text-white font-sans">
                Reject UPI Settlement
              </h3>
            </div>
            <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
              Provide the exact reason why this payment was declined. The customer will receive this message via SMS and email.
            </p>

            <form onSubmit={handleRejectSubmit} className="mt-4 space-y-3">
              {/* Preset Quick Chips */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  "UTR not matching ICICI bank statement",
                  "Underpaid amount",
                  "Duplicate UTR submitted",
                ].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setRejectReason(preset)}
                    className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-2 py-1 text-[10px] text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. UTR 429182910291 was not found in ICICI bank records for the order amount."
                rows={3}
                required
                className="w-full rounded-xl border border-zinc-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-rose-500 focus:outline-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingOrderId(null);
                    setRejectReason("");
                  }}
                  className="rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !rejectReason.trim()}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-500 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Rejecting..." : "Confirm Rejection"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
