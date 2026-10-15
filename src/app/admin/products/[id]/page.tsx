import React from "react";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { productMedia, products } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import { EditProductForm, type EditableProduct } from "@/components/admin/edit-product-form";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdminSession();
  const { id } = await params;

  let product: EditableProduct | null = null;
  try {
    const record = await db.query.products.findFirst({
      where: eq(products.id, id),
      with: {
        category: true,
        media: {
          orderBy: [asc(productMedia.displayOrder)],
        },
        specifications: true,
        secondHandDetails: true,
        showcase: true,
      },
    });

    if (record) {
      product = record as unknown as EditableProduct;
    }
  } catch (error) {
    console.error("[Edit Product Page DB Error]:", error);
  }

  if (!product) {
    notFound();
  }

  return (
    <div className="max-w-5xl space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
              Catalog Inventory & Product Editor
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
            Edit: {product.name}
          </h1>
          <p className="mt-1 font-mono text-xs text-zinc-500 dark:text-zinc-400">
            Brand: <span className="text-zinc-900 dark:text-white font-bold">{product.brand || "DJI"}</span> • SKU:{" "}
            <span className="text-zinc-900 dark:text-white font-bold">{product.sku}</span> • Current Status:{" "}
            <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{product.status}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/product/${product.slug}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            <span>Storefront PDP</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Products</span>
          </Link>
        </div>
      </div>

      {/* Interactive Edit Form */}
      <EditProductForm initialProduct={product} />
    </div>
  );
}
