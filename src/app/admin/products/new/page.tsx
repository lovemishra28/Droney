import { NewProductForm } from "@/components/admin/new-product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
            Catalog Inventory Provisioning
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
          Create New Catalog SKU
        </h1>
        <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
          Provision a brand new drone system, official flight battery, screen remote, or certified refurbished listing.
        </p>
      </div>

      <NewProductForm />
    </div>
  );
}
