import Link from "next/link";
import { Plane, ShieldCheck, Clock, MapPin, ArrowLeft } from "lucide-react";

export default function ShippingPage() {
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
            Logistics & Delivery
          </span>
          <h1 className="mt-2 text-3xl sm:text-4xl font-black text-black">
            Domestic Air Cargo & Transit Protocols
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Express Indian courier dispatch with transit liability coverage across 19,000+ PIN codes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <Plane className="h-6 w-6 text-black" />
            <h3 className="mt-3 text-base font-bold text-black">Express Air (24-48h)</h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Metro routes (Delhi NCR, Bengaluru, Mumbai, Hyderabad, Chennai) dispatched via Blue Dart / Delhivery Express Air.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            <h3 className="mt-3 text-base font-bold text-black">100% Transit Insured</h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Every package is sealed with tamper-evident serial tape and insured up to ₹2,50,000 against transit damages or loss.
            </p>
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6">
            <Clock className="h-6 w-6 text-black" />
            <h3 className="mt-3 text-base font-bold text-black">Same-Day Bench Dispatch</h3>
            <p className="mt-2 text-xs text-zinc-600 leading-relaxed">
              Orders confirmed before 2:00 PM IST undergo flight bench testing and dispatch on the same business day.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
