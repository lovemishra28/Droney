"use client";

import React, { useEffect, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, Loader2, MapPin, Shield, ShieldCheck, ShoppingBag, UserCheck } from "lucide-react";
import { isValidProductId, useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { initiateCheckoutAction, type CheckoutInitResponse } from "@/server/actions/checkout";
import { UpiQrDisplay } from "@/components/storefront/upi-qr-display";
import { PaymentProofForm } from "@/components/storefront/payment-proof-form";
import { useUserSession } from "@/lib/auth-client";

export default function CheckoutPage() {
  const router = useRouter();
  const session = useUserSession();
  const { items, getTotalPaise, clearCart, setAllInsurance } = useCartStore();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );

  // Address Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatBuilding, setFlatBuilding] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");

  // Check if any cart item has insurance opted
  const hasAnyInsurance = items.some((i) => i.hasInsurance);

  // Insurance Form State
  const [insuranceFullName, setInsuranceFullName] = useState("");
  const [insurancePhone, setInsurancePhone] = useState("");
  const [insuranceEmail, setInsuranceEmail] = useState("");
  const [dronePurpose, setDronePurpose] = useState("Commercial & Cinematography");
  const [nomineeName, setNomineeName] = useState("");

  const [isInitiating, setIsInitiating] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [checkoutData, setCheckoutData] = useState<CheckoutInitResponse | null>(null);

  // Redirect to login if user is not authenticated once session loading completes
  useEffect(() => {
    if (mounted && !session.isLoading && !session.isAuthenticated) {
      router.push("/login?callbackUrl=/checkout");
    }
  }, [mounted, session.isLoading, session.isAuthenticated, router]);

  if (!mounted || session.isLoading) {
    return (
      <div className="min-h-[70vh] bg-white flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        <p className="mt-3 text-xs font-mono text-zinc-500 uppercase tracking-wider">
          Verifying pilot clearance...
        </p>
      </div>
    );
  }

  if (!session.isAuthenticated) {
    return (
      <div className="min-h-[70vh] bg-white text-zinc-900 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-600">
          <UserCheck className="h-8 w-8 text-black" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-black">Authentication Required</h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-600 max-w-sm">
          Please log in to your account to complete checkout and order your drone gear.
        </p>
        <Link
          href="/login?callbackUrl=/checkout"
          className="mt-6 rounded-full bg-black px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-zinc-800 transition shadow-xs"
        >
          Sign In with Phone / Email
        </Link>
      </div>
    );
  }

  if (items.length === 0 && !checkoutData) {
    return (
      <div className="min-h-[70vh] bg-white text-zinc-900 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 text-zinc-400">
          <ShoppingBag className="h-8 w-8 text-black" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-black">Your flight bag is empty</h1>
        <p className="mt-2 text-xs sm:text-sm text-zinc-500 max-w-sm">
          Add drone frames, motors, or certified gear to initiate your order.
        </p>
        <Link
          href="/catalog"
          className="mt-6 rounded-full bg-[#c8f33b] px-6 py-3 text-xs sm:text-sm font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  const handleInitiateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    const invalidItem = items.find(
      (item) => !isValidProductId(item.productId)
    );
    if (invalidItem) {
      setCheckoutError(
        "Your cart contains an outdated product. Please remove it and add the product again from the catalog."
      );
      useCartStore.setState({
        items: items.filter((item) => isValidProductId(item.productId)),
      });
      return;
    }

    if (session.role === "admin") {
      setCheckoutError("Administrator accounts cannot purchase or place orders from their own shop.");
      return;
    }

    setIsInitiating(true);

    try {
      const response = await initiateCheckoutAction({
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          hasInsurance: !!i.hasInsurance,
        })),
        shippingAddress: {
          fullName,
          phone,
          flatBuilding,
          street,
          city,
          state: stateName,
          pincode,
        },
        insuranceDetails: hasAnyInsurance
          ? {
              opted: true,
              fullName: insuranceFullName || fullName,
              phone: insurancePhone || phone,
              email: insuranceEmail,
              dronePurpose,
              nomineeName,
            }
          : undefined,
      });

      if (!response.success || !response.data) {
        setCheckoutError(response.message || "Failed to initialize order and lock inventory.");
        setIsInitiating(false);
        return;
      }

      setCheckoutData(response.data);
      clearCart(); // Cart is converted into reserved order state
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "An unexpected error occurred."
      );
    } finally {
      setIsInitiating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Checkout Progress Stepper */}
        <div className="mb-8 flex items-center justify-between border-b border-zinc-200 pb-5">
          <div>
            <Link
              href="/cart"
              className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-black font-semibold transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Flight Bag</span>
            </Link>
            <h1 className="mt-2 text-2xl sm:text-3xl font-black tracking-tight text-black">
              {checkoutData ? `Order #${checkoutData.orderReference}` : "Checkout & Dispatch"}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 font-mono">
            <ShieldCheck className="h-4 w-4" />
            <span>0% Surcharge Direct UPI</span>
          </div>
        </div>

        {checkoutError && (
          <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-700">
            {checkoutError}
          </div>
        )}

        {/* STEP 1: Address Entry & Order Initialization */}
        {!checkoutData ? (
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
            <form onSubmit={handleInitiateOrder} className="space-y-4 lg:col-span-2">
              <div className="rounded-3xl border border-zinc-200 bg-white p-6 sm:p-8 shadow-lg">
                <div className="flex items-center gap-2 border-b border-zinc-200 pb-4 text-sm font-bold text-black">
                  <MapPin className="h-4 w-4 text-black" />
                  <span>Shipping & Delivery Destination</span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-xs font-medium text-zinc-600">Full Name</label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600">10-Digit Mobile Number</label>
                    <input
                      type="tel"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-600">Flat / House / Building Details</label>
                    <input
                      type="text"
                      required
                      value={flatBuilding}
                      onChange={(e) => setFlatBuilding(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-600">Street / Area / Locality</label>
                    <input
                      type="text"
                      required
                      value={street}
                      onChange={(e) => setStreet(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600">City / District</label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-zinc-600">State</label>
                    <input
                      type="text"
                      required
                      value={stateName}
                      onChange={(e) => setStateName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-zinc-600">Postal PIN Code</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value.replace(/\D/g, ""))}
                      className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Fly Care Premium Insurance Registration Form / Toggle */}
              {hasAnyInsurance ? (
                <div className="rounded-3xl border border-emerald-300 bg-emerald-50/60 p-6 sm:p-8 shadow-md">
                  <div className="flex items-center justify-between border-b border-emerald-200 pb-4">
                    <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                      <Shield className="h-4 w-4 text-emerald-700" />
                      <span>Fly Care Premium • Policyholder Registration</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setAllInsurance(false)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                    >
                      Remove Insurance
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-emerald-800 leading-relaxed">
                    You selected <strong className="font-bold">Fly Care Premium</strong> insurance for your flight system. Please enter the pilot / organization details for official policy issuance and damage replacement warranty.
                  </p>

                  <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Policyholder / Pilot Name</label>
                      <input
                        type="text"
                        required={hasAnyInsurance}
                        placeholder={fullName || "Pilot / Organization Name"}
                        value={insuranceFullName}
                        onChange={(e) => setInsuranceFullName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Insurance Mobile Number</label>
                      <input
                        type="tel"
                        required={hasAnyInsurance}
                        maxLength={10}
                        placeholder={phone || "10-digit mobile"}
                        value={insurancePhone}
                        onChange={(e) => setInsurancePhone(e.target.value.replace(/\D/g, ""))}
                        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Policy Email Address</label>
                      <input
                        type="email"
                        placeholder="pilot@domain.com"
                        value={insuranceEmail}
                        onChange={(e) => setInsuranceEmail(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-700">Primary Flight Application</label>
                      <select
                        value={dronePurpose}
                        onChange={(e) => setDronePurpose(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                      >
                        <option value="Commercial Cinematography & Video">Commercial Cinematography & Video</option>
                        <option value="Industrial Inspection & Mapping">Industrial Inspection & Mapping</option>
                        <option value="Agricultural Surveying">Agricultural Surveying</option>
                        <option value="Recreational & Aerial Photography">Recreational & Aerial Photography</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="text-xs font-semibold text-zinc-700">Nominee / Emergency Contact (Optional)</label>
                      <input
                        type="text"
                        placeholder="Nominee Full Name"
                        value={nomineeName}
                        onChange={(e) => setNomineeName(e.target.value)}
                        className="mt-1.5 w-full rounded-xl border border-zinc-300 bg-white px-3.5 py-2.5 text-xs text-zinc-900 focus:border-black focus:outline-none shadow-xs"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setAllInsurance(true)}
                  className="cursor-pointer rounded-3xl border border-zinc-200 bg-zinc-50/80 hover:border-zinc-300 hover:bg-zinc-100/70 p-6 transition select-none shadow-xs"
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border border-zinc-400 bg-white">
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-sm font-bold text-zinc-900 flex items-center gap-1.5">
                          <Shield className="h-4 w-4 text-emerald-600" />
                          <span>Avail Fly Care Aviation Insurance</span>
                        </span>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                          Optional Cover
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-600 leading-relaxed">
                        Protect your aircraft against crashes, water damage, and accidental loss with official DGCA policy coverage. Click to add.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {session.role === "admin" && (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 flex items-start gap-3">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-bold">Admin Account Restriction</p>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      Administrator accounts cannot purchase or place orders from their own shop. Please sign in with a customer account to test orders.
                    </p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isInitiating || session.role === "admin"}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3.5 text-sm font-bold text-black shadow-xs transition hover:bg-[#b8e530] disabled:opacity-50 active:scale-95"
              >
                {isInitiating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Locking Inventory & Generating QR...</span>
                  </>
                ) : session.role === "admin" ? (
                  <span>Purchases Disabled for Admin Accounts</span>
                ) : (
                  <span>Proceed to UPI Payment</span>
                )}
              </button>
            </form>

            {/* Cart Summary Column */}
            <div className="rounded-3xl border border-zinc-200 bg-zinc-50/80 p-6 shadow-md">
              <h3 className="border-b border-zinc-200 pb-3 text-sm font-bold text-black">
                Order Summary ({items.length} items)
              </h3>
              <ul className="divide-y divide-zinc-200 py-2">
                {items.map((i) => (
                  <li key={i.productId} className="flex justify-between py-2.5 text-xs">
                    <div>
                      <span className="font-bold text-black line-clamp-1">{i.name}</span>
                      <span className="text-zinc-500 font-mono">Qty: {i.quantity}</span>
                    </div>
                    <span className="font-bold text-black font-mono">
                      {formatINR(i.basePricePaise * i.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="border-t border-zinc-200 pt-3 flex justify-between text-base font-black text-black">
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
    </div>
  );
}
