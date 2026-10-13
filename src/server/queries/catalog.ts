import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  droneSpecifications,
  productMedia,
  products,
  secondHandDetails,
} from "@/lib/db/schema";
import { getCachedOrFetch } from "@/lib/cache";

export interface CatalogFilterParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  isSecondHand?: boolean;
  minPricePaise?: number;
  maxPricePaise?: number;
  search?: string;
  sortBy?: "price_asc" | "price_desc" | "newest";
  cosmeticGrades?: ("A" | "B" | "C")[];
  motorKv?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalCount: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

/**
 * Retrieves the full category taxonomy.
 * Cached at the edge with Next.js ISR (revalidate: 300) and Redis (TTL: 300).
 */
export const getCatalogCategories = unstable_cache(
  async () => {
    return getCachedOrFetch(
      "catalog:categories:tree",
      async () => {
        try {
          const allCategories = await db.query.categories.findMany({
            orderBy: [asc(categories.name)],
            with: {
              products: {
                where: eq(products.status, "active"),
                columns: { id: true },
              },
            },
          });
          // Deduplicate categories by slug and normalized name
          const seenSlugs = new Set<string>();
          return allCategories.filter((cat) => {
            if (!cat.slug || seenSlugs.has(cat.slug.toLowerCase())) {
              return false;
            }
            seenSlugs.add(cat.slug.toLowerCase());
            return true;
          });
        } catch (error) {
          console.error("[Catalog Categories Query Error]:", error);
          return [];
        }
      },
      { ttlSeconds: 60 }
    );
  },
  ["catalog-categories"],
  {
    revalidate: 60,
    tags: ["catalog", "categories"],
  }
);

/**
 * Retrieves paginated catalog products with multi-condition filtering.
 */
export async function getProducts(params: CatalogFilterParams = {}) {
  const {
    page = 1,
    pageSize = 24,
    categorySlug,
    isSecondHand,
    minPricePaise,
    maxPricePaise,
    search,
    sortBy = "newest",
    cosmeticGrades,
    motorKv,
  } = params;

  const offset = (page - 1) * pageSize;

  const conditions = [eq(products.status, "active")];

  if (typeof isSecondHand === "boolean") {
    conditions.push(eq(products.isSecondHand, isSecondHand));
  }

  if (minPricePaise !== undefined) {
    conditions.push(gte(products.basePricePaise, minPricePaise));
  }

  if (maxPricePaise !== undefined) {
    conditions.push(lte(products.basePricePaise, maxPricePaise));
  }

  if (search && search.trim().length > 0) {
    const term = `%${search.trim()}%`;
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.sku, term),
        ilike(products.description, term)
      )!
    );
  }

  if (categorySlug) {
    try {
      if (categorySlug === "drones") {
        // Query all drone categories (camera-drones, fpv-drones, mini-drone, professional-drone, used-drones)
        const droneCategories = await db.query.categories.findMany({
          where: or(
            ilike(categories.slug, "%drone%"),
            ilike(categories.name, "%drone%")
          ),
          columns: { id: true },
        });
        if (droneCategories.length > 0) {
          conditions.push(
            inArray(
              products.categoryId,
              droneCategories.map((c) => c.id)
            )
          );
        }
      } else {
        const matchedCategory = await db.query.categories.findFirst({
          where: eq(categories.slug, categorySlug),
          columns: { id: true },
        });
        if (matchedCategory) {
          conditions.push(eq(products.categoryId, matchedCategory.id));
        }
      }
    } catch (err) {
      console.error("[Category Lookup Error]:", err);
    }
  }

  const orderByClause = {
    price_asc: [asc(products.basePricePaise)],
    price_desc: [desc(products.basePricePaise)],
    newest: [desc(products.createdAt)],
  }[sortBy];

  const whereClause = and(...conditions);

  try {
    const [data, totalCountResult] = await Promise.all([
      db.query.products.findMany({
        where: whereClause,
        limit: pageSize,
        offset,
        orderBy: orderByClause,
        with: {
          category: { columns: { id: true, name: true, slug: true } },
          media: {
            orderBy: [asc(productMedia.displayOrder)],
            limit: 2,
          },
          specifications: true,
          secondHandDetails: true,
        },
      }),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(whereClause),
    ]);

    let filteredItems = data;

    if (cosmeticGrades && cosmeticGrades.length > 0) {
      filteredItems = filteredItems.filter(
        (item) =>
          item.secondHandDetails &&
          cosmeticGrades.includes(
            item.secondHandDetails.cosmeticGrade as "A" | "B" | "C"
          )
      );
    }

    if (motorKv) {
      filteredItems = filteredItems.filter((item) =>
        item.specifications?.motorKv
          ?.toLowerCase()
          .includes(motorKv.toLowerCase())
      );
    }

    const totalCount = totalCountResult[0]?.count ?? 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      data: filteredItems,
      pagination: {
        page,
        pageSize,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };
  } catch (error) {
    console.error("[Get Products Query Error]:", error);
    return {
      data: [],
      pagination: {
        page,
        pageSize,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };
  }
}

/**
 * Resolves a single SKU by slug with all joined media and specifications.
 * Wrapped with Next.js edge micro-caching (TTL: 60s).
 */
export async function getProductBySlug(slug: string) {
  return unstable_cache(
    async () => {
      try {
        const cleanSlug = slug.trim().toLowerCase();
        let product = await db.query.products.findFirst({
          where: and(eq(products.slug, cleanSlug), eq(products.status, "active")),
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

        if (!product) {
          // Secondary fallback match by SKU or partial slug
          product = await db.query.products.findFirst({
            where: and(
              or(
                eq(products.sku, cleanSlug.toUpperCase()),
                ilike(products.slug, `%${cleanSlug}%`),
                ilike(products.name, `%${cleanSlug.replace(/-/g, " ")}%`)
              ),
              eq(products.status, "active")
            ),
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
        }

        return product || null;
      } catch (error) {
        console.error("[Get Product By Slug Error]:", error);
        return null;
      }
    },
    [`product-${slug}`],
    {
      revalidate: 10,
      tags: ["catalog", `product-${slug}`],
    }
  )();
}

/**
 * Queries pre-owned inventory with inspection details.
 */
export async function getPreOwnedDrones(
  options: {
    cosmeticGrade?: "A" | "B" | "C";
    limit?: number;
  } = {}
) {
  const { cosmeticGrade, limit = 20 } = options;

  const conditions = [
    eq(products.status, "active"),
    eq(products.isSecondHand, true),
  ];

  try {
    const items = await db.query.products.findMany({
      where: and(...conditions),
      limit,
      orderBy: [desc(products.createdAt)],
      with: {
        category: true,
        media: {
          orderBy: [asc(productMedia.displayOrder)],
        },
        secondHandDetails: true,
        specifications: true,
      },
    });

    if (cosmeticGrade) {
      return items.filter(
        (item) => item.secondHandDetails?.cosmeticGrade === cosmeticGrade
      );
    }

    return items;
  } catch (error) {
    console.error("[Get Pre-Owned Drones Error]:", error);
    return [];
  }
}

/**
 * Fast typeahead search query returning top 6 matched items for quick dropdowns.
 */
export async function quickSearchProducts(term: string) {
  if (!term || term.trim().length < 2) return [];

  const sanitized = `%${term.trim()}%`;

  try {
    return await db.query.products.findMany({
      where: and(
        eq(products.status, "active"),
        or(ilike(products.name, sanitized), ilike(products.sku, sanitized))!
      ),
      limit: 6,
      columns: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        basePricePaise: true,
        stockQuantity: true,
        isSecondHand: true,
      },
      with: {
        media: {
          where: eq(productMedia.mediaType, "image"),
          orderBy: [asc(productMedia.displayOrder)],
          limit: 1,
          columns: { url: true },
        },
      },
    });
  } catch (error) {
    console.error("[Quick Search Error]:", error);
    return [];
  }
}

/**
 * Fetches related products from the same category for PDP cross-selling recommendations.
 */
export async function getRelatedProducts(
  categoryId: string | null,
  currentProductId: string,
  limitCount = 4
) {
  if (!categoryId) return [];

  try {
    return await db.query.products.findMany({
      where: and(
        eq(products.categoryId, categoryId),
        eq(products.status, "active"),
        sql`${products.id} != ${currentProductId}`
      ),
      limit: limitCount,
      orderBy: [desc(products.createdAt)],
      with: {
        media: {
          orderBy: [asc(productMedia.displayOrder)],
          limit: 1,
        },
        secondHandDetails: true,
      },
    });
  } catch (error) {
    console.error("[Related Products Error]:", error);
    return [];
  }
}
