"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, products } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import type { ActionResponse } from "@/server/actions/auth";

const purge = revalidateTag as (tag: string, profile?: any) => void;

const quickUpdateStockSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  stockQuantity: z.number().int().min(0, "Stock quantity cannot be negative"),
});

const quickUpdatePriceSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  basePriceInr: z.number().positive("Price must be greater than zero"),
});

const toggleProductStatusSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  status: z.enum(["active", "draft", "archived"]),
});

/**
 * Updates physical inventory count and records an immutable audit entry.
 */
export async function updateProductStockAction(
  rawInput: z.infer<typeof quickUpdateStockSchema>
): Promise<ActionResponse<{ stockQuantity: number }>> {
  const session = await requireAdminSession();

  const parsed = quickUpdateStockSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid input.",
    };
  }

  const { productId, stockQuantity } = parsed.data;

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, sku: true, stockQuantity: true },
    });

    if (!existing) {
      return { success: false, message: "Product record not found." };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          stockQuantity,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "STOCK_OVERRIDE",
        entityName: "products",
        entityId: productId,
        payload: {
          sku: existing.sku,
          previousStock: existing.stockQuantity,
          newStock: stockQuantity,
        },
      });
    });

    purge("catalog");
    purge(`product-${productId}`);
    revalidatePath("/admin/products");
    revalidatePath("/admin");

    return {
      success: true,
      message: `Stock for ${existing.sku} updated to ${stockQuantity}.`,
      data: { stockQuantity },
    };
  } catch (error) {
    console.error("[Stock Update Error]:", error);
    return {
      success: false,
      message: "Database failure updating stock inventory.",
    };
  }
}

/**
 * Adjusts product listing price (in Paise) and purges edge caches.
 */
export async function updateProductPriceAction(
  rawInput: z.infer<typeof quickUpdatePriceSchema>
): Promise<ActionResponse<{ basePricePaise: number }>> {
  const session = await requireAdminSession();

  const parsed = quickUpdatePriceSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid price value.",
    };
  }

  const { productId, basePriceInr } = parsed.data;
  const basePricePaise = Math.round(basePriceInr * 100);

  try {
    const existing = await db.query.products.findFirst({
      where: eq(products.id, productId),
      columns: { id: true, sku: true, basePricePaise: true },
    });

    if (!existing) {
      return { success: false, message: "Product record not found." };
    }

    await db.transaction(async (tx) => {
      await tx
        .update(products)
        .set({
          basePricePaise,
          updatedAt: new Date(),
        })
        .where(eq(products.id, productId));

      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "PRICE_OVERRIDE",
        entityName: "products",
        entityId: productId,
        payload: {
          sku: existing.sku,
          previousPricePaise: existing.basePricePaise,
          newPricePaise: basePricePaise,
        },
      });
    });

    purge("catalog");
    purge(`product-${productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Price for ${existing.sku} updated successfully.`,
      data: { basePricePaise },
    };
  } catch (error) {
    console.error("[Price Update Error]:", error);
    return {
      success: false,
      message: "Database failure modifying product price.",
    };
  }
}

/**
 * Toggles product listing status between active, draft, and archived.
 */
export async function toggleProductStatusAction(
  rawInput: z.infer<typeof toggleProductStatusSchema>
): Promise<ActionResponse> {
  const session = await requireAdminSession();

  const parsed = toggleProductStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid status toggle.",
    };
  }

  const { productId, status } = parsed.data;

  try {
    await db
      .update(products)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(products.id, productId));

    await db.insert(auditLogs).values({
      adminId: session.sub,
      action: "STATUS_TOGGLE",
      entityName: "products",
      entityId: productId,
      payload: { newStatus: status },
    });

    purge("catalog");
    purge(`product-${productId}`);
    revalidatePath("/admin/products");

    return {
      success: true,
      message: `Product visibility changed to "${status}".`,
    };
  } catch (error) {
    console.error("[Status Toggle Error]:", error);
    return {
      success: false,
      message: "Failed to update product status.",
    };
  }
}
