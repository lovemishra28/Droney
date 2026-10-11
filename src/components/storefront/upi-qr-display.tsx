"use client";

import { useEffect, useState } from "react";
import { formatINR } from "@/lib/utils";
import { QrCode, Copy, Check, Clock } from "lucide-react";

interface UpiQrDisplayProps {
  amountPaise: number;
  orderReference: string;
  qrDataUrl?: string;
  upiId?: string;
  payeeName?: string;
}

export function UpiQrDisplay({
  amountPaise,
  orderReference,
  qrDataUrl,
  upiId = "merchant@upi",
  payeeName = "AeroStore Drones India",
}: UpiQrDisplayProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const copyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6 text-center">
      <div className="mx-auto flex w-fit items-center justify-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-400">
        <Clock className="h-3.5 w-3.5" />
        <span>Stock Reserved for: {formatTimer(timeLeft)}</span>
      </div>

      <div>
        <p className="text-xs text-zinc-400">Total Payable Amount</p>
        <p className="text-3xl font-extrabold text-zinc-100">
          {formatINR(amountPaise)}
        </p>
        <p className="mt-1 text-xs text-zinc-500">
          Order Ref: {orderReference}
        </p>
      </div>

      <div className="mx-auto flex h-60 w-60 items-center justify-center rounded-xl bg-white p-3 shadow-lg">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt="Scan with GPay, PhonePe, Paytm, BHIM"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-zinc-900">
            <QrCode className="h-16 w-16" />
            <span className="text-[11px] font-bold">NPCI Dynamic UPI QR</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-zinc-300">
        <span>
          VPA: <strong className="text-zinc-100">{upiId}</strong>
        </span>
        <button
          onClick={copyUpi}
          className="flex items-center gap-1 rounded bg-zinc-800 px-2 py-1 text-[11px] hover:bg-zinc-700"
        >
          {copied ? (
            <Check className="h-3 w-3 text-emerald-400" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
    </div>
  );
}
