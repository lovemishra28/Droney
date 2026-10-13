import React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { formatINR } from "@/lib/utils";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let product = null;
  try {
    product = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        media: true,
        specifications: true,
        secondHandDetails: true,
      },
    });
  } catch (error) {
    console.error("[Edit Product Page DB Error]:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8f33b]">
              Catalog Inventory Record
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
            {product.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-400">
            SKU: <span className="text-white font-bold">{product.sku}</span> • Status:{" "}
            <span className="uppercase text-emerald-400">{product.status}</span>
          </p>
        </div>

        <Link
          href="/admin/products"
          className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Catalog</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <span className="text-xs font-mono text-zinc-400 uppercase">Base Price</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {formatINR(product.basePricePaise)}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <span className="text-xs font-mono text-zinc-400 uppercase">Stock Inventory</span>
          <p className="text-xl font-bold font-mono text-white mt-1">
            {product.stockQuantity} units
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-5">
          <span className="text-xs font-mono text-zinc-400 uppercase">Category</span>
          <p className="text-xl font-bold text-white mt-1">
            {product.category?.name || "General"}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 p-6 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">
          Overview & Description
        </h3>
        <p className="text-xs leading-relaxed text-zinc-300">
          {product.description || "No description logged for this component."}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Link
          href={`/product/${product.slug}`}
          target="_blank"
          className="inline-flex items-center gap-2 rounded-xl bg-[#c8f33b] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#b5e028] shadow-xs"
        >
          <span>View on Live Storefront ↗</span>
        </Link>
      </div>
    </div>
  );
}
