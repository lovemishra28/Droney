import React from "react";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { Plus } from "lucide-react";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import { resolveImageUrl } from "@/lib/media";
import {
  ProductsDataTable,
  type AdminProductRow,
} from "@/components/admin/products-data-table";
import { DeleteAllProductsButton } from "@/components/admin/delete-all-products-button";

export const dynamic = "force-dynamic";

type CatalogProduct = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  slug: string;
  basePricePaise: number;
  stockQuantity: number;
  isSecondHand: boolean;
  status: string;
  category: { name: string } | null;
  media: Array<{ url: string; mediaType: "image" | "video" }>;
  secondHandDetails: { cosmeticGrade: "A" | "B" | "C" } | null;
};

export default async function AdminProductsPage() {
  await requireAdminSession();

  let catalogList: CatalogProduct[] = [];
  try {
    catalogList = await db.query.products.findMany({
      orderBy: [desc(products.createdAt)],
      with: {
        category: {
          columns: { name: true },
        },
        media: {
          columns: { url: true, mediaType: true, displayOrder: true },
        },
        secondHandDetails: {
          columns: { cosmeticGrade: true },
        },
      },
    });
  } catch (error) {
    console.error("[Admin Products DB Error]:", error);
  }

  const formattedRows: AdminProductRow[] = catalogList.map((p) => {
    const primaryImg = resolveImageUrl(
      p.media?.find((m) => m.mediaType === "image")?.url
    );
    const hasVid = p.media?.some((m) => m.mediaType === "video") ?? false;

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
      brand: p.brand || "DJI",
      slug: p.slug,
      categoryName: p.category?.name || "Uncategorized",
      basePricePaise: p.basePricePaise,
      stockQuantity: p.stockQuantity,
      isSecondHand: p.isSecondHand,
      cosmeticGrade: (p.secondHandDetails?.cosmeticGrade as "A" | "B" | "C") || null,
      status: p.status as "active" | "draft" | "archived",
      thumbnailUrl: primaryImg,
      hasVideo: hasVid,
    };
  });

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
              Catalog Taxonomy & Inventory
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
            Products
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Browse and manage hardware inventory, adjust stock limits in real-time, and monitor pre-owned condition grades.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <DeleteAllProductsButton totalProducts={formattedRows.length} />

          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-2 rounded-xl bg-black dark:bg-[#c8f33b] px-4 py-2.5 text-xs font-bold text-white dark:text-black transition-all hover:opacity-90 dark:hover:bg-[#b5e028] shadow-xs"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span>Add New Product</span>
          </Link>
        </div>
      </div>

      {/* Virtualized Interactive Table */}
      <ProductsDataTable initialProducts={formattedRows} />
    </div>
  );
}
