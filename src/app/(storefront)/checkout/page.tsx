"use client";

import { useState } from "react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { UpiQrDisplay } from "@/components/storefront/upi-qr-display";
import { submitOrderUtr } from "@/server/actions/checkout";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPaise } = useCartStore();
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const orderRef = "ORD-82914";
  const totalAmount = getTotalPaise() > 0 ? getTotalPaise() : 2899900;

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!/^\d{12}$/.test(utrNumber)) {
      setError("Please enter a valid 12-digit numeric Bank UTR / Ref No.");
      return;
    }
    setLoading(true);
    try {
      await submitOrderUtr(orderRef, utrNumber);
      router.push(`/order/${orderRef}`);
    } catch (err: any) {
      setError(err?.message || "Failed to submit UTR");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-center text-2xl font-extrabold tracking-tight text-zinc-100 sm:text-3xl">
        Direct UPI Instant Payment & UTR Verification
      </h1>
      <p className="mt-1 text-center text-xs text-zinc-400">
        Pay via any UPI App (Google Pay, PhonePe, Paytm, BHIM) with zero gateway
        commission fees.
      </p>

      <div className="mt-8 grid grid-cols-1 items-start gap-8 md:grid-cols-2">
        {/* Left: Dynamic QR */}
        <UpiQrDisplay amountPaise={totalAmount} orderReference={orderRef} />

        {/* Right: 12-Digit UTR Submission */}
        <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-6">
          <div>
            <h3 className="text-base font-bold text-zinc-100">
              Step 2: Submit 12-Digit UTR
            </h3>
            <p className="mt-1 text-xs text-zinc-400">
              After completing the transfer in your UPI application, enter the
              12-digit UTR (Unique Transaction Reference) below to lock in your
              order.
            </p>
          </div>

          {error && (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmitUtr} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-300">
                12-Digit Bank UTR / UPI Ref Number
              </label>
              <input
                type="text"
                required
                maxLength={12}
                value={utrNumber}
                onChange={(e) =>
                  setUtrNumber(e.target.value.replace(/\D/g, ""))
                }
                placeholder="409823145672"
                className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 font-mono text-sm tracking-wider text-zinc-100 placeholder-zinc-600 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">
                Payment Screenshot (Optional Verification Fast-Track)
              </label>
              <input
                type="file"
                accept="image/*"
                className="mt-1 w-full text-xs text-zinc-400 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-zinc-200 hover:file:bg-zinc-700"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-zinc-950 transition hover:bg-emerald-400 disabled:opacity-50"
            >
              {loading
                ? "Verifying Reference..."
                : "Confirm Payment & Lock Stock"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
