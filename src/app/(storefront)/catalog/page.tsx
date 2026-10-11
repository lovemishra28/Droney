import { Suspense } from "react";
import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { ProductCard } from "@/components/storefront/product-card";

export default function CatalogPage() {
  const sampleProducts = [
    {
      id: "prod-1",
      slug: "apex-5-inch-freestyle-drone",
      name: 'ImpulseRC Apex 5" 6S Freestyle Drone (BNF / ELRS)',
      basePricePaise: 2899900,
      stockQuantity: 4,
      isSecondHand: false,
    },
    {
      id: "prod-2",
      slug: "t-motor-f60-pro-v-1950kv",
      name: "T-Motor F60 PRO V 1950KV Brushless Motor",
      basePricePaise: 235000,
      stockQuantity: 28,
      isSecondHand: false,
    },
    {
      id: "prod-3",
      slug: "cinelog35-v2-pre-owned",
      name: "GEPRC CineLog35 V2 HD O3 (Grade A Certified Pre-Owned)",
      basePricePaise: 3499900,
      stockQuantity: 1,
      isSecondHand: true,
      cosmeticGrade: "A" as const,
    },
    {
      id: "prod-4",
      slug: "speedybee-f405-v4-stack",
      name: "SpeedyBee F405 V4 55A BLS 30x30 Flight Controller & ESC Stack",
      basePricePaise: 685000,
      stockQuantity: 15,
      isSecondHand: false,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Drone Component Catalog (500+ SKUs)
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Precision electronics, brushless power systems, frame carbon, and
          spares.
        </p>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <Suspense
          fallback={
            <div className="w-64 text-xs text-zinc-500">Loading filters...</div>
          }
        >
          <FilterSidebar />
        </Suspense>

        <div className="flex-1">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {sampleProducts.map((prod) => (
              <ProductCard key={prod.id} {...prod} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
