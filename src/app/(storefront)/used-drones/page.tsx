import { ShieldCheck } from "lucide-react";
import { ProductCard } from "@/components/storefront/product-card";

export default function UsedDronesPage() {
  const preOwnedFleet = [
    {
      id: "used-1",
      slug: "cinelog35-v2-pre-owned",
      name: "GEPRC CineLog35 V2 HD O3 (Mint Condition)",
      basePricePaise: 3499900,
      stockQuantity: 1,
      isSecondHand: true,
      cosmeticGrade: "A" as const,
    },
    {
      id: "used-2",
      slug: "nazgul5-v3-6s-used",
      name: "iFlight NazGul5 V3 6S Analog (Minor Prop Guard Wear)",
      basePricePaise: 2199900,
      stockQuantity: 1,
      isSecondHand: true,
      cosmeticGrade: "B" as const,
    },
    {
      id: "used-3",
      slug: "chimera7-pro-refurbished",
      name: "iFlight Chimera7 Pro V2 Long-Range (Refurbished Motors)",
      basePricePaise: 3899900,
      stockQuantity: 1,
      isSecondHand: true,
      cosmeticGrade: "C" as const,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-8">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-emerald-400 uppercase">
          <ShieldCheck className="h-4 w-4" />
          <span>Certified Inspection Protocol</span>
        </div>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-zinc-100">
          Pre-Owned Flight Fleet
        </h1>
        <p className="mt-2 max-w-2xl text-xs leading-relaxed text-zinc-400">
          Every pre-owned craft undergoes a 24-point bench check: motor bearing
          friction, gyro noise, telemetry link strength, and battery internal
          resistance analysis. Transparently graded as A, B, or C.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-zinc-800 pt-4 sm:grid-cols-3">
          <div className="rounded-lg border border-emerald-500/20 bg-zinc-950 p-3">
            <span className="text-xs font-bold text-emerald-400">
              Grade A (Mint)
            </span>
            <p className="mt-1 text-[11px] text-zinc-400">
              &lt;5 flight hours, zero crashes, flawless carbon and bell state.
            </p>
          </div>
          <div className="rounded-lg border border-amber-500/20 bg-zinc-950 p-3">
            <span className="text-xs font-bold text-amber-400">
              Grade B (Operational)
            </span>
            <p className="mt-1 text-[11px] text-zinc-400">
              Minor cosmetic marks, &lt;20 battery cycles, 100% verified
              electronics.
            </p>
          </div>
          <div className="rounded-lg border border-blue-500/20 bg-zinc-950 p-3">
            <span className="text-xs font-bold text-blue-400">
              Grade C (Refurbished)
            </span>
            <p className="mt-1 text-[11px] text-zinc-400">
              Replaced motor arms or ESC modules, field-tested flight stable.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {preOwnedFleet.map((drone) => (
          <ProductCard key={drone.id} {...drone} />
        ))}
      </div>
    </div>
  );
}
