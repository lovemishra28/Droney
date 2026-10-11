import { CreditCard, Package, Truck, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminOverviewPage() {
  const stats = [
    { label: "Active Catalog SKUs", value: "512", icon: Package },
    {
      label: "Pending UTR Verifications",
      value: "3",
      icon: CreditCard,
      highlight: true,
    },
    { label: "Awaiting Dispatch", value: "8", icon: Truck },
    { label: "Low Inventory Alerts", value: "5", icon: AlertCircle },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Executive Control Dashboard
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Real-time metrics across 500+ SKU inventory, direct UPI settlements,
          and fulfillment.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`rounded-xl border p-5 ${
                stat.highlight
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">{stat.label}</span>
                <Icon
                  className={`h-4 w-4 ${
                    stat.highlight ? "text-amber-400" : "text-zinc-500"
                  }`}
                />
              </div>
              <p className="mt-2 text-2xl font-black text-zinc-100">
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-zinc-100">
            Immediate Action: Pending Bank UTRs
          </h3>
          <Link
            href="/admin/payments"
            className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
          >
            Go to Settlement Queue →
          </Link>
        </div>
        <p className="text-xs text-zinc-400">
          3 orders are awaiting manual or automated UTR verification. Stock
          units are temporarily locked in 10-minute hold windows.
        </p>
      </div>
    </div>
  );
}
