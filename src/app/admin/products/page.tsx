import React from "react";
import { desc } from "drizzle-orm";
import { Package } from "lucide-react";
import { db } from "@/lib/db";
import { productMedia, products } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import {
  ProductsDataTable,
  type AdminProductRow,
} from "@/components/admin/products-data-table";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdminSession();

  let catalogList: any[] = [];
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
    const primaryImg =
      p.media?.find((m: any) => m.mediaType === "image")?.url ||
      "/placeholders/drone-placeholder.webp";
    const hasVid = p.media?.some((m: any) => m.mediaType === "video") ?? false;

    return {
      id: p.id,
      sku: p.sku,
      name: p.name,
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
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Catalog & Inventory Management
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Browse and manage 500+ active hardware listings, adjust stock limits, and monitor pre-owned grades.
          </p>
        </div>
      </div>

      {/* Virtualized Interactive Table */}
      <ProductsDataTable initialProducts={formattedRows} />
    </div>
  );
}
