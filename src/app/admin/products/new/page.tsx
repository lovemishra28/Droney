import { NewProductForm } from "@/components/admin/new-product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#c8f33b]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8f33b]">
            Catalog Inventory Provisioning
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
          Create New Catalog SKU
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Provision a brand new drone system, FPV racing frame, flight battery, or certified refurbished listing.
        </p>
      </div>

      <NewProductForm />
    </div>
  );
}
