"use client";

import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Clock, Copy, ExternalLink, Smartphone } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface UpiQrDisplayProps {
  upiUri: string;
  payeeUpiId: string;
  payeeName: string;
  totalAmountPaise: number;
  orderReference: string;
  expiresAt: string;
  onExpired?: () => void;
}

export function UpiQrDisplay({
  upiUri,
  payeeUpiId,
  payeeName,
  totalAmountPaise,
  orderReference,
  expiresAt,
  onExpired,
}: UpiQrDisplayProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
    return Math.max(0, diff);
  });

  // 10-Minute Reservation Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeftSeconds(0);
        clearInterval(timer);
        onExpired?.();
      } else {
        setTimeLeftSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpired]);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const minutes = Math.floor(timeLeftSeconds / 60);
  const seconds = timeLeftSeconds % 60;
  const isTimeCritical = timeLeftSeconds < 180; // Under 3 minutes remaining

  return (
    <div className="flex flex-col items-center rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 text-zinc-100 shadow-xl backdrop-blur-sm">
      {/* Expiration Timer Indicator */}
      <div
        className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md transition-colors ${
          isTimeCritical
            ? "border border-rose-500/40 bg-rose-950/60 text-rose-300"
            : "border border-amber-500/30 bg-amber-950/60 text-amber-300"
        }`}
      >
        <Clock className="h-3.5 w-3.5" />
        <span>
          Stock Reserved: {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </span>
      </div>

      <div className="mt-4 text-center">
        <span className="text-xs uppercase tracking-wider text-zinc-400">Total Payable</span>
        <p className="text-3xl font-extrabold tracking-tight text-white">
          {formatINR(totalAmountPaise)}
        </p>
        <span className="mt-1 block font-mono text-xs text-indigo-400">
          Ref: #{orderReference}
        </span>
      </div>

      {/* High-Contrast Dynamic NPCI QR Code */}
      <div className="mt-6 rounded-2xl border-4 border-white bg-white p-4 shadow-2xl">
        <QRCodeSVG
          value={upiUri}
          size={210}
          level="H"
          includeMargin={false}
          imageSettings={{
            src: "/brand/upi-icon.png",
            x: undefined,
            y: undefined,
            height: 36,
            width: 36,
            excavate: true,
          }}
        />
      </div>

      <p className="mt-3 text-center text-xs text-zinc-400">
        Scan using any UPI App (Google Pay, PhonePe, Paytm, BHIM, Cred)
      </p>
      <p className="mt-2 max-w-sm text-center text-xs font-medium text-amber-300">
        Scanning only opens your UPI payment screen. Your order is not submitted
        until you complete the payment and enter the 12-digit UTR below.
      </p>

      {/* Mobile UPI App Deep Link Intent */}
      <div className="mt-5 w-full sm:hidden">
        <a
          href={upiUri}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500"
        >
          <Smartphone className="h-4 w-4" />
          <span>Open UPI App to Pay</span>
          <ExternalLink className="h-3.5 w-3.5 opacity-80" />
        </a>
      </div>

      {/* Manual Details Fallback Box */}
      <div className="mt-6 w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2.5">
          <span className="text-zinc-400">UPI ID / VPA:</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-semibold text-zinc-200">{payeeUpiId}</span>
            <button
              type="button"
              onClick={() => copyToClipboard(payeeUpiId, "upiId")}
              className="rounded p-1 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              title="Copy UPI ID"
            >
              {copiedKey === "upiId" ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2.5">
          <span className="text-zinc-400">Payee Business Name:</span>
          <span className="font-medium text-zinc-200">{payeeName}</span>
        </div>
      </div>
    </div>
  );
}
