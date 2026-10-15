"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, inArray, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  auditLogs,
  brands,
  categories,
  droneSpecifications,
  orderItems,
  productMedia,
  productShowcases,
  products,
  secondHandDetails,
  stockReservations,
} from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import type { ActionResponse } from "@/server/actions/auth";
import { invalidateCacheKeys } from "@/lib/cache";

const purge = revalidateTag as (tag: string, profile?: unknown) => void;

const createProductSchema = z.object({
  sku: z.string().trim().min(2),
  name: z.string().trim().min(2),
  brand: z.string().trim().default("DJI"),
  categoryName: z.string().trim().min(2),
  categorySlug: z.string().trim().min(2),
  basePriceInr: z.number().positive(),
  mrpPriceInr: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0),
  description: z.string().trim().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  isSecondHand: z.boolean().default(false),
  imageUrl: z.string().optional().or(z.literal("")),
  imageUrls: z.array(z.string().trim()).optional().default([]),
  // Hardware Specifications
  weightGrams: z.number().int().positive().optional(),
  flightTimeMinutes: z.number().int().positive().optional(),
  payloadCapacityGrams: z.number().int().positive().optional(),
  frameSizeMm: z.number().int().positive().optional(),
  inputVoltageLipo: z.string().trim().max(128).optional(),
  motorKv: z.string().trim().max(128).optional(),
  fcFirmware: z.string().trim().max(64).optional(),
  escProtocol: z.string().trim().max(128).optional(),
  // Pre-Owned Inspection Details
  cosmeticGrade: z.enum(["A", "B", "C"]).optional(),
  flightHours: z.number().int().min(0).optional(),
  batteryCycleCount: z.number().int().min(0).optional(),
  crashHistory: z.boolean().optional(),
  includedAccessories: z.string().trim().optional(),
  inspectionNotes: z.string().trim().optional(),
  // Showcase Details
  heroBadge: z.string().trim().optional(),
  heroHeadline: z.string().trim().optional(),
  heroSubtitle: z.string().trim().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  inTheBox: z.string().trim().optional(),
});

function productSlug(name: string, sku: string) {
  return `${name}-${sku}`
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createProductAction(
  rawInput: z.infer<typeof createProductSchema>
): Promise<ActionResponse<{ productId: string }>> {
  const session = await requireAdminSession();
  const parsed = createProductSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message || "Invalid product details." };
  }

  const input = parsed.data;
  try {
    const result = await db.transaction(async (tx) => {
      let category = await tx.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
      });
      if (!category) {
        [category] = await tx
          .insert(categories)
          .values({
            name: input.categoryName,
            slug: input.categorySlug,
          })
          .returning();
      }
      if (!category) {
        throw new Error("Unable to resolve product category.");
      }

      // Resolve or create Brand
      const brandName = input.brand?.trim() || "DJI";
      const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let brandRecord = await tx.query.brands.findFirst({
        where: eq(brands.slug, brandSlug),
      });
      if (!brandRecord) {
        [brandRecord] = await tx
          .insert(brands)
          .values({
            name: brandName,
            slug: brandSlug,
          })
          .returning();
      }

      // 1. Insert Core Product
      const [product] = await tx
        .insert(products)
        .values({
          categoryId: category.id,
          brandId: brandRecord?.id,
          brand: brandName,
          sku: input.sku,
          slug: productSlug(input.name, input.sku),
          name: input.name,
          description: input.description || null,
          basePricePaise: Math.round(input.basePriceInr * 100),
          stockQuantity: input.stockQuantity,
          isSecondHand: input.isSecondHand,
          status: input.status,
        })
        .returning({ id: products.id });

      // 2. Insert Product Images (Primary + Gallery)
      const collectedImages: string[] = [];
      if (input.imageUrl && input.imageUrl.trim().length > 0) {
        collectedImages.push(input.imageUrl.trim());
      }
      if (input.imageUrls && Array.isArray(input.imageUrls)) {
        for (const url of input.imageUrls) {
          if (url && url.trim().length > 0 && !collectedImages.includes(url.trim())) {
            collectedImages.push(url.trim());
          }
        }
      }

      for (let i = 0; i < collectedImages.length; i++) {
        await tx.insert(productMedia).values({
          productId: product.id,
          mediaType: "image",
          storageProvider: "r2",
          url: collectedImages[i],
          displayOrder: i,
        });
      }

      // 3. Insert Drone Hardware Specifications
      if (
        input.weightGrams ||
        input.flightTimeMinutes ||
        input.payloadCapacityGrams ||
        input.frameSizeMm ||
        input.inputVoltageLipo ||
        input.motorKv ||
        input.fcFirmware ||
        input.escProtocol
      ) {
        await tx.insert(droneSpecifications).values({
          productId: product.id,
          weightGrams: input.weightGrams || null,
          flightTimeMinutes: input.flightTimeMinutes || null,
          payloadCapacityGrams: input.payloadCapacityGrams || null,
          frameSizeMm: input.frameSizeMm || null,
          inputVoltageLipo: input.inputVoltageLipo || null,
          motorKv: input.motorKv || null,
          fcFirmware: input.fcFirmware || null,
          escProtocol: input.escProtocol || null,
        });
      }

      // 4. Insert Second Hand Certification Details (if pre-owned)
      if (input.isSecondHand) {
        const accessoriesList = input.includedAccessories
          ? input.includedAccessories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        await tx.insert(secondHandDetails).values({
          productId: product.id,
          cosmeticGrade: input.cosmeticGrade || "A",
          flightHours: input.flightHours || 0,
          batteryCycleCount: input.batteryCycleCount || 0,
          crashHistory: input.crashHistory ?? false,
          includedAccessories: accessoriesList,
          inspectionNotes: input.inspectionNotes || null,
        });
      }

      // 5. Insert Product Showcase / Hero Highlights
      if (
        input.mrpPriceInr ||
        input.heroHeadline ||
        input.heroBadge ||
        input.heroSubtitle ||
        input.warrantyMonths ||
        input.inTheBox
      ) {
        const inTheBoxList = input.inTheBox
          ? input.inTheBox
              .split(/[\n,]/)
              .map((line) => line.trim())
              .filter(Boolean)
              .map((name) => ({ name, quantity: 1 }))
          : [];

        await tx.insert(productShowcases).values({
          productId: product.id,
          mrpPricePaise: input.mrpPriceInr
            ? Math.round(input.mrpPriceInr * 100)
            : null,
          warrantyMonths: input.warrantyMonths ?? 12,
          heroBadge: input.heroBadge || null,
          heroHeadline: input.heroHeadline || input.name,
          heroSubtitle: input.heroSubtitle || null,
          inTheBox: inTheBoxList,
        });
      }

      // 6. Audit Trail
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "PRODUCT_CREATED",
        entityName: "products",
        entityId: product.id,
        payload: {
          sku: input.sku,
          name: input.name,
          brand: brandName,
          category: input.categorySlug,
          isSecondHand: input.isSecondHand,
        },
      });

      return product;
    });

    purge("catalog");
    revalidatePath("/admin/products");
    revalidatePath("/catalog");
    revalidatePath("/");
    return { success: true, message: "Product created successfully.", data: { productId: result.id } };
  } catch (error) {
    console.error("[Product Create Error]:", error);
    return { success: false, message: "Could not create product. SKU or slug may already exist." };
  }
}

const updateProductSchema = z.object({
  productId: z.string().uuid("Invalid product ID"),
  sku: z.string().trim().min(2, "SKU must be at least 2 characters"),
  name: z.string().trim().min(2, "Product name is required"),
  brand: z.string().trim().default("DJI"),
  categoryName: z.string().trim().min(2, "Category name is required"),
  categorySlug: z.string().trim().min(2, "Category slug is required"),
  basePriceInr: z.number().positive("Base price must be greater than 0"),
  mrpPriceInr: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  description: z.string().trim().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  isSecondHand: z.boolean().default(false),
  imageUrl: z.string().optional().or(z.literal("")),
  imageUrls: z.array(z.string().trim()).optional().default([]),
  // Hardware Specifications
  weightGrams: z.number().int().positive().optional(),
  flightTimeMinutes: z.number().int().positive().optional(),
  payloadCapacityGrams: z.number().int().positive().optional(),
  frameSizeMm: z.number().int().positive().optional(),
  inputVoltageLipo: z.string().trim().max(32).optional(),
  motorKv: z.string().trim().max(128).optional(),
  fcFirmware: z.string().trim().max(64).optional(),
  escProtocol: z.string().trim().max(64).optional(),
  // Pre-Owned Inspection Details
  cosmeticGrade: z.enum(["A", "B", "C"]).optional(),
  flightHours: z.number().int().min(0).optional(),
  batteryCycleCount: z.number().int().min(0).optional(),
  crashHistory: z.boolean().optional(),
  includedAccessories: z.string().trim().optional(),
  inspectionNotes: z.string().trim().optional(),
  // Showcase Details
  heroBadge: z.string().trim().optional(),
  heroHeadline: z.string().trim().optional(),
  heroSubtitle: z.string().trim().optional(),
  warrantyMonths: z.number().int().min(0).optional(),
  inTheBox: z.string().trim().optional(),
});

export async function updateProductAction(
  rawInput: z.infer<typeof updateProductSchema>
): Promise<ActionResponse<{ productId: string; slug: string }>> {
  const session = await requireAdminSession();
  const parsed = updateProductSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid product details.",
    };
  }

  const input = parsed.data;

  try {
    const existingProduct = await db.query.products.findFirst({
      where: eq(products.id, input.productId),
    });

    if (!existingProduct) {
      return { success: false, message: "Product not found." };
    }

    // Verify SKU isn't conflicting with another product
    const skuConflict = await db.query.products.findFirst({
      where: and(eq(products.sku, input.sku), ne(products.id, input.productId)),
    });
    if (skuConflict) {
      return {
        success: false,
        message: `SKU "${input.sku}" is already in use by another product.`,
      };
    }

    const updatedSlug = productSlug(input.name, input.sku);

    const result = await db.transaction(async (tx) => {
      // 1. Resolve or create category
      let category = await tx.query.categories.findFirst({
        where: eq(categories.slug, input.categorySlug),
      });
      if (!category) {
        [category] = await tx
          .insert(categories)
          .values({
            name: input.categoryName,
            slug: input.categorySlug,
          })
          .returning();
      }
      if (!category) {
        throw new Error("Unable to resolve product category.");
      }

      // 2. Resolve or create brand
      const brandName = input.brand?.trim() || "DJI";
      const brandSlug = brandName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      let brandRecord = await tx.query.brands.findFirst({
        where: eq(brands.slug, brandSlug),
      });
      if (!brandRecord) {
        [brandRecord] = await tx
          .insert(brands)
          .values({
            name: brandName,
            slug: brandSlug,
          })
          .returning();
      }

      // 3. Update core product row
      await tx
        .update(products)
        .set({
          categoryId: category.id,
          brandId: brandRecord?.id,
          brand: brandName,
          sku: input.sku,
          slug: updatedSlug,
          name: input.name,
          description: input.description || null,
          basePricePaise: Math.round(input.basePriceInr * 100),
          stockQuantity: input.stockQuantity,
          isSecondHand: input.isSecondHand,
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(products.id, input.productId));

      // 4. Update Product Images
      const collectedImages: string[] = [];
      if (input.imageUrl && input.imageUrl.trim().length > 0) {
        collectedImages.push(input.imageUrl.trim());
      }
      if (input.imageUrls && Array.isArray(input.imageUrls)) {
        for (const url of input.imageUrls) {
          if (url && url.trim().length > 0 && !collectedImages.includes(url.trim())) {
            collectedImages.push(url.trim());
          }
        }
      }

      // Replace existing productMedia entries
      await tx.delete(productMedia).where(eq(productMedia.productId, input.productId));
      for (let i = 0; i < collectedImages.length; i++) {
        await tx.insert(productMedia).values({
          productId: input.productId,
          mediaType: "image",
          storageProvider: "r2",
          url: collectedImages[i],
          displayOrder: i,
        });
      }

      // 5. Update Drone Hardware Specifications
      const hasSpecs =
        input.weightGrams ||
        input.flightTimeMinutes ||
        input.payloadCapacityGrams ||
        input.frameSizeMm ||
        input.inputVoltageLipo ||
        input.motorKv ||
        input.fcFirmware ||
        input.escProtocol;

      if (hasSpecs) {
        const existingSpec = await tx.query.droneSpecifications.findFirst({
          where: eq(droneSpecifications.productId, input.productId),
        });
        if (existingSpec) {
          await tx
            .update(droneSpecifications)
            .set({
              weightGrams: input.weightGrams || null,
              flightTimeMinutes: input.flightTimeMinutes || null,
              payloadCapacityGrams: input.payloadCapacityGrams || null,
              frameSizeMm: input.frameSizeMm || null,
              inputVoltageLipo: input.inputVoltageLipo || null,
              motorKv: input.motorKv || null,
              fcFirmware: input.fcFirmware || null,
              escProtocol: input.escProtocol || null,
            })
            .where(eq(droneSpecifications.productId, input.productId));
        } else {
          await tx.insert(droneSpecifications).values({
            productId: input.productId,
            weightGrams: input.weightGrams || null,
            flightTimeMinutes: input.flightTimeMinutes || null,
            payloadCapacityGrams: input.payloadCapacityGrams || null,
            frameSizeMm: input.frameSizeMm || null,
            inputVoltageLipo: input.inputVoltageLipo || null,
            motorKv: input.motorKv || null,
            fcFirmware: input.fcFirmware || null,
            escProtocol: input.escProtocol || null,
          });
        }
      } else {
        await tx
          .delete(droneSpecifications)
          .where(eq(droneSpecifications.productId, input.productId));
      }

      // 6. Update Second Hand Certification Details
      if (input.isSecondHand) {
        const accessoriesList = input.includedAccessories
          ? input.includedAccessories
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [];

        const existingSecondHand = await tx.query.secondHandDetails.findFirst({
          where: eq(secondHandDetails.productId, input.productId),
        });

        if (existingSecondHand) {
          await tx
            .update(secondHandDetails)
            .set({
              cosmeticGrade: input.cosmeticGrade || "A",
              flightHours: input.flightHours || 0,
              batteryCycleCount: input.batteryCycleCount || 0,
              crashHistory: input.crashHistory ?? false,
              includedAccessories: accessoriesList,
              inspectionNotes: input.inspectionNotes || null,
            })
            .where(eq(secondHandDetails.productId, input.productId));
        } else {
          await tx.insert(secondHandDetails).values({
            productId: input.productId,
            cosmeticGrade: input.cosmeticGrade || "A",
            flightHours: input.flightHours || 0,
            batteryCycleCount: input.batteryCycleCount || 0,
            crashHistory: input.crashHistory ?? false,
            includedAccessories: accessoriesList,
            inspectionNotes: input.inspectionNotes || null,
          });
        }
      } else {
        await tx
          .delete(secondHandDetails)
          .where(eq(secondHandDetails.productId, input.productId));
      }

      // 7. Update Product Showcase
      const inTheBoxList = input.inTheBox
        ? input.inTheBox
            .split(/[\n,]/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((name) => ({ name, quantity: 1 }))
        : [];

      const existingShowcase = await tx.query.productShowcases.findFirst({
        where: eq(productShowcases.productId, input.productId),
      });

      if (existingShowcase) {
        await tx
          .update(productShowcases)
          .set({
            mrpPricePaise: input.mrpPriceInr
              ? Math.round(input.mrpPriceInr * 100)
              : null,
            warrantyMonths: input.warrantyMonths ?? 12,
            heroBadge: input.heroBadge || null,
            heroHeadline: input.heroHeadline || input.name,
            heroSubtitle: input.heroSubtitle || null,
            ...(inTheBoxList.length > 0 ? { inTheBox: inTheBoxList } : {}),
          })
          .where(eq(productShowcases.productId, input.productId));
      } else if (
        input.mrpPriceInr ||
        input.heroHeadline ||
        input.heroBadge ||
        input.heroSubtitle ||
        input.warrantyMonths ||
        input.inTheBox
      ) {
        await tx.insert(productShowcases).values({
          productId: input.productId,
          mrpPricePaise: input.mrpPriceInr
            ? Math.round(input.mrpPriceInr * 100)
            : null,
          warrantyMonths: input.warrantyMonths ?? 12,
          heroBadge: input.heroBadge || null,
          heroHeadline: input.heroHeadline || input.name,
          heroSubtitle: input.heroSubtitle || null,
          inTheBox: inTheBoxList,
        });
      }

      // 8. Audit Trail
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "PRODUCT_UPDATED",
        entityName: "products",
        entityId: input.productId,
        payload: {
          sku: input.sku,
          name: input.name,
          brand: brandName,
          category: input.categorySlug,
          isSecondHand: input.isSecondHand,
          priceInr: input.basePriceInr,
          stockQuantity: input.stockQuantity,
          status: input.status,
        },
      });

      return { id: input.productId, slug: updatedSlug };
    });

    // Invalidate Redis caches
    await invalidateCacheKeys([
      `product:${existingProduct.slug}`,
      `product:${result.slug}`,
      "catalog:categories:tree",
      "catalog:brands:list",
    ]);

    // Invalidate Next.js ISR & route caches
    purge("catalog");
    purge("categories");
    purge("brands");
    purge(`product-${existingProduct.slug}`);
    purge(`product-${result.slug}`);
    revalidatePath("/admin/products");
    revalidatePath(`/admin/products/${input.productId}`);
    revalidatePath("/catalog");
    revalidatePath(`/product/${result.slug}`);
    if (existingProduct.slug !== result.slug) {
      revalidatePath(`/product/${existingProduct.slug}`);
    }
    revalidatePath("/");

    return {
      success: true,
      message: "Product updated successfully across database and storefront.",
      data: { productId: result.id, slug: result.slug },
    };
  } catch (error) {
    console.error("[Product Update Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Could not update product. Please check your inputs.",
    };
  }
}

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

/**
 * Permanently deletes all products and all cascaded media, specifications,
 * showcases, and dependent line items in a single ACID transaction.
 */
export async function deleteAllProductsAction(): Promise<
  ActionResponse<{ deletedCount: number; archivedCount: number }>
> {
  const session = await requireAdminSession();

  try {
    const { deletedCount, archivedCount } = await db.transaction(async (tx) => {
      // 1. Count existing products
      const existing = await tx.select({ id: products.id }).from(products);
      const count = existing.length;

      if (count === 0) {
        return { deletedCount: 0, archivedCount: 0 };
      }

      // 2. Identify products that have order items (they have ON DELETE RESTRICT on product_id)
      // Never delete orderItems: this destroys historical orders and financial records (DRN-003)
      const orderedItems = await tx
        .selectDistinct({ productId: orderItems.productId })
        .from(orderItems);
      const orderedProductIds = orderedItems.map((r) => r.productId);

      // Transition products with order history to 'archived'
      if (orderedProductIds.length > 0) {
        await tx
          .update(products)
          .set({ status: "archived", updatedAt: new Date() })
          .where(inArray(products.id, orderedProductIds));
      }

      // Products without order history can be safely deleted
      const deletableProductIds = existing
        .map((p) => p.id)
        .filter((id) => !orderedProductIds.includes(id));

      if (deletableProductIds.length > 0) {
        // Clear active stock reservations for deletable products
        await tx
          .delete(stockReservations)
          .where(inArray(stockReservations.productId, deletableProductIds));

        // Clear drone specifications, secondhand details, media, showcases
        await tx
          .delete(droneSpecifications)
          .where(inArray(droneSpecifications.productId, deletableProductIds));
        await tx
          .delete(secondHandDetails)
          .where(inArray(secondHandDetails.productId, deletableProductIds));
        await tx
          .delete(productMedia)
          .where(inArray(productMedia.productId, deletableProductIds));
        await tx
          .delete(productShowcases)
          .where(inArray(productShowcases.productId, deletableProductIds));

        // Delete unreferenced products
        await tx
          .delete(products)
          .where(inArray(products.id, deletableProductIds));
      }

      // 3. Record audit log
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "DELETE_ALL_PRODUCTS",
        entityName: "products",
        entityId: "ALL",
        payload: {
          deletableCount: deletableProductIds.length,
          archivedCount: orderedProductIds.length,
        },
      });

      return {
        deletedCount: deletableProductIds.length,
        archivedCount: orderedProductIds.length,
      };
    });

    purge("catalog");
    revalidatePath("/admin/products");
    revalidatePath("/admin");
    revalidatePath("/catalog");
    revalidatePath("/");

    return {
      success: true,
      message: `Deleted ${deletedCount} unreferenced products; archived ${archivedCount} products with order history.`,
      data: { deletedCount, archivedCount },
    };
  } catch (error) {
    console.error("[Delete All Products Error]:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to delete all products.",
    };
  }
}
