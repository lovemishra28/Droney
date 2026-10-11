import Link from "next/link";
import { CheckCircle2, Clock, Truck, ShieldCheck } from "lucide-react";

export default async function OrderStatusPage({
  params,
}: {
  params: Promise<{ orderRef: string }>;
}) {
  const { orderRef } = await params;

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-16 text-center sm:px-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 ring-1 ring-amber-500/20">
        <Clock className="h-8 w-8" />
      </div>

      <div className="space-y-2">
        <span className="font-mono text-xs text-zinc-500">{orderRef}</span>
        <h1 className="text-2xl font-black tracking-tight text-zinc-100 sm:text-3xl">
          Payment Reference Received
        </h1>
        <p className="mx-auto max-w-md text-xs text-zinc-400">
          Your 12-digit UTR has been submitted and queued for bank statement
          reconciliation. Stock units have been safely locked.
        </p>
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 text-left">
        <h3 className="text-xs font-bold tracking-wider text-zinc-300 uppercase">
          Order Status Tracker
        </h3>
        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
            <span>Order Placed & Stock Reserved</span>
          </div>
          <div className="flex items-center gap-3 text-amber-400">
            <Clock className="h-4 w-4" />
            <span>UTR Payment Verification in Progress</span>
          </div>
          <div className="flex items-center gap-3 text-zinc-500">
            <Truck className="h-4 w-4" />
            <span>Courier Dispatch (Blue Dart / Delhivery AWB)</span>
          </div>
        </div>
      </div>

      <Link
        href="/"
        className="inline-block rounded-xl bg-zinc-100 px-6 py-3 text-xs font-bold text-zinc-900 hover:bg-zinc-200"
      >
        Return to Storefront
      </Link>
    </div>
  );
}
