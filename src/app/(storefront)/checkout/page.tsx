"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MapPin, ShieldCheck, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { initiateCheckoutAction, type CheckoutInitResponse } from "@/server/actions/checkout";
import { UpiQrDisplay } from "@/components/storefront/upi-qr-display";
import { PaymentProofForm } from "@/components/storefront/payment-proof-form";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getTotalPaise, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);

  // Address Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatBuilding, setFlatBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  const [isInitiating, setIsInitiating] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutInitResponse | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (items.length === 0 && !checkoutData) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center px-4 py-20 text-center">
        <ShoppingBag className="h-12 w-12 text-zinc-700" />
        <h1 className="mt-4 text-xl font-bold text-zinc-100">Your cart is empty</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Add drone frames, motors, or certified gear to initiate checkout.
        </p>
        <Link
          href="/catalog"
          className="mt-6 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setIsInitiating(true);

    try {
      const response = await initiateCheckoutAction({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          fullName,
          phone,
          flatBuilding,
          street,
          city,
          state: stateName,
          pincode,
        },
      });

      if (!response.success || !response.data) {
        setCheckoutError(response.message || "Failed to initialize order and lock inventory.");
        setIsInitiating(false);
        return;
      }

      setCheckoutData(response.data);
      clearCart(); // Cart is converted into reserved order state
    } catch (err: any) {
      setCheckoutError(err.message || "An unexpected error occurred.");
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Checkout Progress Stepper */}
      <div className="mb-8 flex items-center justify-between border-b border-zinc-800 pb-4">
        <div>
          <Link
            href="/catalog"
            className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Continue Shopping</span>
          </Link>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-zinc-100">
            {checkoutData ? `Complete Order #${checkoutData.orderReference}` : "Checkout & Dispatch"}
          </h1>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>Zero Gateway Surcharge (Direct UPI)</span>
        </div>
      </div>

      {checkoutError && (
        <div className="mb-6 rounded-xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
          {checkoutError}
        </div>
      )}

      {/* STEP 1: Address Entry & Order Initialization */}
      {!checkoutData ? (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <form onSubmit={handleInitiateOrder} className="space-y-4 lg:col-span-2">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
              <div className="flex items-center gap-2 border-b border-zinc-800 pb-3 text-sm font-semibold text-zinc-200">
                <MapPin className="h-4 w-4 text-indigo-400" />
                <span>Shipping & Delivery Destination</span>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">10-Digit Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Flat / House / Building Details</label>
                  <input
                    type="text"
                    required
                    value={flatBuilding}
                    onChange={(e) => setFlatBuilding(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs text-zinc-400">Street / Area / Locality</label>
                  <input
                    type="text"
                    required
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">City / District</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">State</label>
                  <input
                    type="text"
                    required
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-400">Postal PIN Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                    className="mt-1.5 w-full rounded-xl border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-xs text-zinc-100 focus:border-indigo-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isInitiating}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isInitiating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Locking Inventory & Generating QR...</span>
                </>
              ) : (
                <span>Proceed to UPI Payment</span>
              )}
            </button>
          </form>

          {/* Cart Summary Column */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5">
            <h3 className="border-b border-zinc-800 pb-3 text-sm font-semibold text-zinc-200">
              Order Summary ({items.length} items)
            </h3>
            <ul className="divide-y divide-zinc-800/80 py-2">
              {items.map((i) => (
                <li key={i.productId} className="flex justify-between py-2.5 text-xs">
                  <div>
                    <span className="font-medium text-zinc-200 line-clamp-1">{i.name}</span>
                    <span className="text-zinc-500">Qty: {i.quantity}</span>
                  </div>
                  <span className="font-semibold text-zinc-300">
                    {formatINR(i.basePricePaise * i.quantity)}
                  </span>
                </li>
              ))}
            </ul>
            <div className="border-t border-zinc-800 pt-3 flex justify-between text-sm font-bold text-white">
              <span>Total Payable</span>
              <span>{formatINR(getTotalPaise())}</span>
            </div>
          </div>
        </div>
      ) : (
        /* STEP 2: Direct NPCI QR Display & UTR Confirmation */
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <UpiQrDisplay
            upiUri={checkoutData.upiUri}
            payeeUpiId={checkoutData.payeeUpiId}
            payeeName={checkoutData.payeeName}
            totalAmountPaise={checkoutData.totalAmountPaise}
            orderReference={checkoutData.orderReference}
            expiresAt={checkoutData.expiresAt}
            onExpired={() => {
              setCheckoutError("The 10-minute payment window has expired. Please restart checkout.");
              setCheckoutData(null);
            }}
          />

          <PaymentProofForm orderReference={checkoutData.orderReference} />
        </div>
      )}
    </div>
  );
}
