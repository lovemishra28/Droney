"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogs,
  brands,
  categories,
  droneSpecifications,
  productShowcases,
  products,
  secondHandDetails,
} from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import type { ActionResponse } from "@/server/actions/auth";
import type { BulkSkuRow } from "@/lib/validations/catalog";
import { invalidateCacheKeys } from "@/lib/cache";

const purge = revalidateTag as (tag: string, profile?: unknown) => void;

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Executes parameterized batch upserts for up to 600+ catalog SKUs in a single ACID transaction.
 * Ingests all core identity, brand, pricing, specs, pre-owned condition, and showcase details.
 */
export async function bulkImportCatalogAction(
  rows: BulkSkuRow[]
): Promise<ActionResponse<{ importedCount: number; updatedCount: number }>> {
  const session = await requireAdminSession();

  if (!rows || rows.length === 0) {
    return { success: false, message: "No data rows provided for ingestion." };
  }

  // Enforce batch cap per request to prevent execution timeouts on serverless runtimes
  if (rows.length > 600) {
    return {
      success: false,
      message: "Exceeded batch limit. Please upload files with 600 or fewer rows per batch.",
    };
  }

  try {
    let importedCount = 0;
    let updatedCount = 0;
    const affectedSlugs: string[] = [];

    await db.transaction(async (tx) => {
      // 1. Pre-fetch existing SKUs to differentiate between inserts and updates
      const incomingSkus = rows.map((r) => r.sku);
      const existingProductRecords = await tx
        .select({ sku: products.sku, slug: products.slug })
        .from(products)
        .where(inArray(products.sku, incomingSkus));

      const existingSkuSet = new Set(existingProductRecords.map((p) => p.sku));
      existingProductRecords.forEach((p) => affectedSlugs.push(p.slug));

      // 2. Cache categories in-memory to prevent redundant queries
      const existingCategories = await tx.select().from(categories);
      const categoryMap = new Map<string, string>(); // slug -> id
      for (const cat of existingCategories) {
        categoryMap.set(cat.slug, cat.id);
      }

      // 3. Cache brands in-memory
      const existingBrands = await tx.select().from(brands);
      const brandMap = new Map<string, string>(); // slug -> id
      for (const b of existingBrands) {
        brandMap.set(b.slug, b.id);
      }

      for (const row of rows) {
        // Resolve or create Brand
        const brandName = row.brand?.trim() || "DJI";
        const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
        let brandId = brandMap.get(brandSlug);
        if (!brandId) {
          const [newBrand] = await tx
            .insert(brands)
            .values({
              name: brandName,
              slug: brandSlug,
            })
            .onConflictDoUpdate({
              target: brands.slug,
              set: { name: brandName },
            })
            .returning({ id: brands.id });
          brandId = newBrand.id;
          brandMap.set(brandSlug, brandId);
        }

        // Resolve or create Category
        let categoryId = categoryMap.get(row.categorySlug);
        if (!categoryId) {
          const categoryTitle =
            row.categoryName || row.categorySlug.replace(/-/g, " ");
          const [newCategory] = await tx
            .insert(categories)
            .values({
              name: categoryTitle,
              slug: row.categorySlug,
              description: `Hardware and gear for ${categoryTitle}`,
            })
            .onConflictDoUpdate({
              target: categories.slug,
              set: { name: categoryTitle },
            })
            .returning({ id: categories.id });

          categoryId = newCategory.id;
          categoryMap.set(row.categorySlug, categoryId);
        }

        const basePricePaise = Math.round(row.basePriceInr * 100);
        const slug = `${generateSlug(row.name)}-${row.sku.toLowerCase()}`;
        affectedSlugs.push(slug);
        const isUpdate = existingSkuSet.has(row.sku);

        // 4. Upsert Product via ON CONFLICT (sku) DO UPDATE
        const [product] = await tx
          .insert(products)
          .values({
            categoryId,
            brandId,
            brand: brandName,
            sku: row.sku,
            slug,
            name: row.name,
            description: row.description || null,
            basePricePaise,
            stockQuantity: row.stockQuantity,
            isSecondHand: row.isSecondHand,
            status: row.status || "active",
          })
          .onConflictDoUpdate({
            target: products.sku,
            set: {
              categoryId,
              brandId,
              brand: brandName,
              name: row.name,
              description: row.description || null,
              basePricePaise,
              stockQuantity: row.stockQuantity,
              isSecondHand: row.isSecondHand,
              status: row.status || "active",
              updatedAt: new Date(),
            },
          })
          .returning({ id: products.id });

        if (isUpdate) {
          updatedCount++;
        } else {
          importedCount++;
        }

        // 5. Upsert Technical Specifications (droneSpecifications)
        if (
          row.frameSizeMm ||
          row.weightGrams ||
          row.inputVoltageLipo ||
          row.motorKv ||
          row.fcFirmware ||
          row.escProtocol ||
          row.flightTimeMinutes ||
          row.payloadCapacityGrams
        ) {
          await tx
            .insert(droneSpecifications)
            .values({
              productId: product.id,
              frameSizeMm: row.frameSizeMm || null,
              weightGrams: row.weightGrams || null,
              inputVoltageLipo: row.inputVoltageLipo || null,
              motorKv: row.motorKv || null,
              fcFirmware: row.fcFirmware || null,
              escProtocol: row.escProtocol || null,
              flightTimeMinutes: row.flightTimeMinutes || null,
              payloadCapacityGrams: row.payloadCapacityGrams || null,
            })
            .onConflictDoUpdate({
              target: droneSpecifications.productId,
              set: {
                frameSizeMm: row.frameSizeMm || null,
                weightGrams: row.weightGrams || null,
                inputVoltageLipo: row.inputVoltageLipo || null,
                motorKv: row.motorKv || null,
                fcFirmware: row.fcFirmware || null,
                escProtocol: row.escProtocol || null,
                flightTimeMinutes: row.flightTimeMinutes || null,
                payloadCapacityGrams: row.payloadCapacityGrams || null,
              },
            });
        }

        // 6. Upsert Second-Hand Certification Details (secondHandDetails)
        if (row.isSecondHand) {
          await tx
            .insert(secondHandDetails)
            .values({
              productId: product.id,
              cosmeticGrade: row.cosmeticGrade || "A",
              flightHours: row.flightHours || 0,
              crashHistory: row.crashHistory || false,
              batteryCycleCount: row.batteryCycleCount || 0,
              includedAccessories: row.includedAccessories || [],
              inspectionNotes:
                row.inspectionNotes || "32-point technician bench certified.",
            })
            .onConflictDoUpdate({
              target: secondHandDetails.productId,
              set: {
                cosmeticGrade: row.cosmeticGrade || "A",
                flightHours: row.flightHours || 0,
                crashHistory: row.crashHistory || false,
                batteryCycleCount: row.batteryCycleCount || 0,
                includedAccessories: row.includedAccessories || [],
                inspectionNotes:
                  row.inspectionNotes || "32-point technician bench certified.",
              },
            });
        }

        // 7. Upsert Product Showcase Details (productShowcases)
        if (
          row.mrpPriceInr ||
          row.heroHeadline ||
          row.heroBadge ||
          row.heroSubtitle ||
          row.warrantyMonths ||
          row.inTheBox
        ) {
          const inTheBoxList = row.inTheBox
            ? row.inTheBox
                .split(/[\n,]/)
                .map((line) => line.trim())
                .filter(Boolean)
                .map((name) => ({ name, quantity: 1 }))
            : [];

          await tx
            .insert(productShowcases)
            .values({
              productId: product.id,
              mrpPricePaise: row.mrpPriceInr
                ? Math.round(row.mrpPriceInr * 100)
                : null,
              warrantyMonths: row.warrantyMonths ?? 12,
              heroBadge: row.heroBadge || null,
              heroHeadline: row.heroHeadline || row.name,
              heroSubtitle: row.heroSubtitle || null,
              inTheBox: inTheBoxList,
            })
            .onConflictDoUpdate({
              target: productShowcases.productId,
              set: {
                mrpPricePaise: row.mrpPriceInr
                  ? Math.round(row.mrpPriceInr * 100)
                  : null,
                warrantyMonths: row.warrantyMonths ?? 12,
                heroBadge: row.heroBadge || null,
                heroHeadline: row.heroHeadline || row.name,
                heroSubtitle: row.heroSubtitle || null,
                ...(inTheBoxList.length > 0 ? { inTheBox: inTheBoxList } : {}),
              },
            });
        }
      }

      // 8. Record Audit Trail
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "BULK_CATALOG_IMPORT",
        entityName: "products",
        entityId: "batch",
        payload: {
          totalRows: rows.length,
          newSkus: importedCount,
          updatedSkus: updatedCount,
        },
      });
    });

    // 9. Invalidate Redis & Edge Caches
    const redisKeys = [
      "catalog:categories:tree",
      "catalog:brands:list",
      ...affectedSlugs.map((s) => `product:${s}`),
    ];
    await invalidateCacheKeys(redisKeys);

    purge("catalog");
    purge("categories");
    purge("brands");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath("/");

    return {
      success: true,
      message: `Successfully processed ${rows.length} rows (${importedCount} new listings created, ${updatedCount} existing SKUs updated).`,
      data: { importedCount, updatedCount },
    };
  } catch (error) {
    console.error("[Bulk Import Database Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Database transaction failed during bulk ingestion. No partial changes were applied.",
    };
  }
}
