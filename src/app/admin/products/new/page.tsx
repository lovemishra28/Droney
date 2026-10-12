import { NewProductForm } from "@/components/admin/new-product-form";

export default function NewProductPage() {
  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Create New Catalog SKU
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Add a product, pricing, stock, category, description, and optional image URL.
        </p>
      </div>
      <NewProductForm />
    </div>
  );
}
