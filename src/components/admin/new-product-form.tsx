"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/server/actions/admin-products";

export function NewProductForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit(formData: FormData) {
    setError(null);
    const input = {
      sku: String(formData.get("sku") || ""),
      name: String(formData.get("name") || ""),
      categoryName: String(formData.get("categoryName") || ""),
      categorySlug: String(formData.get("categorySlug") || ""),
      basePriceInr: Number(formData.get("basePriceInr")),
      stockQuantity: Number(formData.get("stockQuantity")),
      description: String(formData.get("description") || "") || undefined,
      isSecondHand: formData.get("isSecondHand") === "on",
      imageUrl: String(formData.get("imageUrl") || "") || undefined,
    };
    startTransition(async () => {
      const result = await createProductAction(input);
      if (!result.success) {
        setError(result.message || "Product creation failed.");
        return;
      }
      router.push("/admin/products");
      router.refresh();
    });
  }

  return (
    <form
      action={submit}
      className="space-y-6 rounded-xl border border-zinc-800 bg-zinc-900/40 p-6"
    >
      {error && <p className="rounded-lg bg-rose-950/40 p-3 text-xs text-rose-300">{error}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["sku", "SKU code", "DRN-AERO-01"],
          ["name", "Product name", "AeroX 5-Inch Freestyle Drone"],
          ["categoryName", "Category name", "FPV Drones"],
          ["categorySlug", "Category slug", "fpv-drones"],
          ["basePriceInr", "Price (INR)", "34999"],
          ["stockQuantity", "Stock quantity", "10"],
          ["imageUrl", "Image URL (optional)", "https://..."],
        ].map(([name, label, placeholder]) => (
          <label key={name} className="text-xs font-semibold text-zinc-300">
            {label}
            <input
              name={name}
              type={name === "basePriceInr" || name === "stockQuantity" ? "number" : "text"}
              required={!["imageUrl"].includes(name)}
              placeholder={placeholder}
              className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-normal text-zinc-100"
            />
          </label>
        ))}
      </div>
      <label className="block text-xs font-semibold text-zinc-300">
        Description
        <textarea name="description" rows={4} className="mt-1 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm font-normal text-zinc-100" />
      </label>
      <label className="flex items-center gap-2 text-xs text-zinc-300">
        <input name="isSecondHand" type="checkbox" />
        Certified pre-owned product
      </label>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-emerald-500 px-6 py-2.5 text-xs font-bold text-zinc-950 disabled:opacity-50"
      >
        {pending ? "Saving..." : "Save & Publish Product"}
      </button>
    </form>
  );
}
