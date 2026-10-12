import Link from "next/link";
import { ShieldCheck, RefreshCw, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ReturnsPage() {
  return (
    <div className="bg-white min-h-screen text-zinc-900 py-12">
      <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 space-y-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>

        <div className="border-b border-zinc-200 pb-6">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-600">
            Pilot Assurance
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-black">
            30-Day Return & Verification Guarantee
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Uncompromising quality standards for both brand new avionics and certified pre-owned drones.
          </p>
        </div>

        <div className="space-y-6 text-sm text-zinc-600 leading-relaxed">
          <div className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span>Pre-Owned Certified Drones</span>
            </h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              If your refurbished drone exhibits any IMU calibration error, battery degradation exceeding the quoted inspection tier, or sensor defect within 30 days of delivery, we provide an immediate replacement or 100% refund.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 p-6 bg-zinc-50">
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-black" />
              <span>Factory Brand New Hardware</span>
            </h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Brand new camera drones carry full OEM warranty coverage. Unopened units in original sealed packaging can be returned within 14 days without restocking fees.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
