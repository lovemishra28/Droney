"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  auditLogs,
  categories,
  droneSpecifications,
  products,
  secondHandDetails,
} from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import type { ActionResponse } from "@/server/actions/auth";
import type { BulkSkuRow } from "@/lib/validations/catalog";

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
 * Executes parameterized batch upserts for up to 500+ catalog SKUs in a single ACID transaction.
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

    await db.transaction(async (tx) => {
      // 1. Pre-fetch existing SKUs to differentiate between inserts and updates
      const incomingSkus = rows.map((r) => r.sku);
      const existingProductRecords = await tx
        .select({ sku: products.sku })
        .from(products)
        .where(inArray(products.sku, incomingSkus));

      const existingSkuSet = new Set(existingProductRecords.map((p) => p.sku));

      // 2. Cache categories in-memory to prevent duplicate category queries
      const existingCategories = await tx.select().from(categories);
      const categoryMap = new Map<string, string>(); // slug -> id
      for (const cat of existingCategories) {
        categoryMap.set(cat.slug, cat.id);
      }

      for (const row of rows) {
        // Resolve or create category
        let categoryId = categoryMap.get(row.categorySlug);

        if (!categoryId) {
          const categoryTitle = row.categoryName || row.categorySlug.replace(/-/g, " ");
          const [newCategory] = await tx
            .insert(categories)
            .values({
              name: categoryTitle,
              slug: row.categorySlug,
              description: `Hardware and gear for ${categoryTitle}`,
            })
            .returning({ id: categories.id });

          categoryId = newCategory.id;
          categoryMap.set(row.categorySlug, categoryId);
        }

        const basePricePaise = Math.round(row.basePriceInr * 100);
        const slug = `${generateSlug(row.name)}-${row.sku.toLowerCase()}`;
        const isUpdate = existingSkuSet.has(row.sku);

        // 3. Upsert Product via ON CONFLICT (sku) DO UPDATE
        const [product] = await tx
          .insert(products)
          .values({
            categoryId,
            sku: row.sku,
            slug,
            name: row.name,
            description: row.description || null,
            basePricePaise,
            stockQuantity: row.stockQuantity,
            isSecondHand: row.isSecondHand,
            status: "active",
          })
          .onConflictDoUpdate({
            target: products.sku,
            set: {
              categoryId,
              name: row.name,
              description: row.description || null,
              basePricePaise,
              stockQuantity: row.stockQuantity,
              isSecondHand: row.isSecondHand,
              updatedAt: new Date(),
            },
          })
          .returning({ id: products.id });

        if (isUpdate) {
          updatedCount++;
        } else {
          importedCount++;
        }

        // 4. Upsert Technical Specifications (if present)
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

        // 5. Upsert Second-Hand Details (if pre-owned)
        if (row.isSecondHand && row.cosmeticGrade) {
          await tx
            .insert(secondHandDetails)
            .values({
              productId: product.id,
              cosmeticGrade: row.cosmeticGrade,
              flightHours: row.flightHours || 0,
              crashHistory: row.crashHistory || false,
              batteryCycleCount: row.batteryCycleCount || 0,
              includedAccessories: row.includedAccessories || [],
              inspectionNotes: row.inspectionNotes || "Imported via administrative CSV engine.",
            })
            .onConflictDoUpdate({
              target: secondHandDetails.productId,
              set: {
                cosmeticGrade: row.cosmeticGrade,
                flightHours: row.flightHours || 0,
                crashHistory: row.crashHistory || false,
                batteryCycleCount: row.batteryCycleCount || 0,
                includedAccessories: row.includedAccessories || [],
                inspectionNotes: row.inspectionNotes || "Imported via administrative CSV engine.",
              },
            });
        }
      }

      // 6. Record Audit Trail
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

    // 7. Invalidate Edge Caches
    purge("catalog");
    revalidatePath("/admin/products");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Successfully processed ${rows.length} rows (${importedCount} new listings created, ${updatedCount} existing SKUs updated).`,
      data: { importedCount, updatedCount },
    };
  } catch (error) {
    console.error("[Bulk Import Database Error]:", error);
    return {
      success: false,
      message: "Database transaction failed during bulk ingestion. No partial changes were applied.",
    };
  }
}
