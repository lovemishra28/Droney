"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils";
import { Check, X, ShieldAlert } from "lucide-react";
import { approvePaymentUtr, rejectPaymentUtr } from "@/server/actions/admin";

interface UtrApprovalCardProps {
  orderId: string;
  orderReference: string;
  amountPaise: number;
  utrNumber: string;
  screenshotUrl?: string | null;
  adminId: string;
}

export function UtrApprovalCard({
  orderId,
  orderReference,
  amountPaise,
  utrNumber,
  screenshotUrl,
  adminId,
}: UtrApprovalCardProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<"pending" | "approved" | "rejected">(
    "pending"
  );

  const handleApprove = async () => {
    setLoading(true);
    try {
      await approvePaymentUtr(orderId, adminId);
      setStatus("approved");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await rejectPaymentUtr(orderId, adminId, "Invalid or unmatched UTR");
      setStatus("rejected");
    } finally {
      setLoading(false);
    }
  };

  if (status !== "pending") {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-xs text-zinc-400">
        Order {orderReference} has been marked as <strong>{status}</strong>.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-100">{orderReference}</span>
          <span className="rounded border border-amber-500/20 bg-amber-500/10 px-2 py-0.5 text-xs font-semibold text-amber-400">
            {formatINR(amountPaise)}
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Claimed Bank UTR:{" "}
          <strong className="font-mono text-zinc-200">{utrNumber}</strong>
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleApprove}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3.5 py-2 text-xs font-bold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
        >
          <Check className="h-4 w-4" />
          <span>Approve & Mark Paid</span>
        </button>
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3.5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/20 disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          <span>Reject</span>
        </button>
      </div>
    </div>
  );
}
