import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  ilike,
  inArray,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/lib/db";
import {
  categories,
  droneSpecifications,
  productMedia,
  products,
  secondHandDetails,
} from "@/lib/db/schema";

// ============================================================================
// 1. QUERY PARAMS & TYPE CONTRACTS
// ============================================================================

export interface CatalogFilterParams {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  search?: string;
  minPricePaise?: number;
  maxPricePaise?: number;
  isSecondHand?: boolean;
  cosmeticGrades?: ("A" | "B" | "C")[];
  motorKv?: string;
  sortBy?: "price_asc" | "price_desc" | "newest";
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

// ============================================================================
// 2. PAGINATED CATALOG & FACETED SEARCH
// ============================================================================

/**
 * Retrieves paginated products with faceted edge filtering across technical specs,
 * categories, price ranges, and condition grades.
 */
export async function getProducts(params: CatalogFilterParams = {}) {
  const {
    page = 1,
    pageSize = 24,
    categorySlug,
    search,
    minPricePaise,
    maxPricePaise,
    isSecondHand,
    cosmeticGrades,
    motorKv,
    sortBy = "newest",
  } = params;

  const offset = (page - 1) * pageSize;

  // Resolve categoryId if categorySlug is provided
  let targetCategoryId: string | undefined;
  if (categorySlug) {
    const matchedCategory = await db.query.categories.findFirst({
      where: eq(categories.slug, categorySlug),
      columns: { id: true },
    });
    if (matchedCategory) {
      targetCategoryId = matchedCategory.id;
    }
  }

  // Build composite WHERE conditions
  const conditions = [eq(products.status, "active")];

  if (targetCategoryId) {
    conditions.push(eq(products.categoryId, targetCategoryId));
  }

  if (typeof isSecondHand === "boolean") {
    conditions.push(eq(products.isSecondHand, isSecondHand));
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

  if (typeof minPricePaise === "number") {
    conditions.push(gte(products.basePricePaise, minPricePaise));
  }

  if (typeof maxPricePaise === "number") {
    conditions.push(lte(products.basePricePaise, maxPricePaise));
  }

  // Sorting Strategy
  let orderByClause = desc(products.createdAt);
  if (sortBy === "price_asc") {
    orderByClause = asc(products.basePricePaise);
  } else if (sortBy === "price_desc") {
    orderByClause = desc(products.basePricePaise);
  }

  // 1. Execute total count query for pagination metadata
  const totalCountResult = await db
    .select({ total: count() })
    .from(products)
    .where(and(...conditions));

  const totalCount = totalCountResult[0]?.total ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  // 2. Fetch data using Drizzle Relational API with eager joins
  const items = await db.query.products.findMany({
    where: and(...conditions),
    orderBy: [orderByClause],
    limit: pageSize,
    offset,
    with: {
      category: {
        columns: { id: true, name: true, slug: true },
      },
      media: {
        orderBy: [asc(productMedia.displayOrder)],
        limit: 2, // Primary thumbnail + hover preview image/video
      },
      specifications: true,
      secondHandDetails: true,
    },
  });

  // Client-side spec filtering for complex 1:1 joined fields if requested
  let filteredItems = items;

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
}

// ============================================================================
// 3. PRODUCT DETAIL PAGE (PDP) LOOKUP
// ============================================================================

/**
 * Resolves a single product by unique slug, including full media galleries,
 * flight demo video streams, hardware specification matrices, and inspection reports.
 */
export async function getProductBySlug(slug: string) {
  const product = await db.query.products.findFirst({
    where: and(eq(products.slug, slug), eq(products.status, "active")),
    with: {
      category: true,
      media: {
        orderBy: [asc(productMedia.displayOrder)],
      },
      specifications: true,
      secondHandDetails: true,
    },
  });

  return product || null;
}

// ============================================================================
// 4. PRE-OWNED DRONE MARKETPLACE QUERY
// ============================================================================

/**
 * Specialized query for the /used-drones route, fetching verified pre-owned
 * hardware filtered by inspection grade.
 */
export async function getPreOwnedDrones(
  options: {
    cosmeticGrade?: "A" | "B" | "C";
    limit?: number;
  } = {}
) {
  const { cosmeticGrade, limit = 12 } = options;

  const results = await db.query.products.findMany({
    where: and(eq(products.isSecondHand, true), eq(products.status, "active")),
    orderBy: [desc(products.createdAt)],
    limit,
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
    return results.filter(
      (item) => item.secondHandDetails?.cosmeticGrade === cosmeticGrade
    );
  }

  return results;
}

// ============================================================================
// 5. TAXONOMY & TYPEAHEAD AUTOCOMPLETE
// ============================================================================

/**
 * Fetches root categories with live active SKU counts for storefront navigation.
 */
export async function getCatalogCategories() {
  return await db.query.categories.findMany({
    orderBy: [asc(categories.name)],
    with: {
      products: {
        where: eq(products.status, "active"),
        columns: { id: true },
      },
    },
  });
}

/**
 * Fast typeahead search query returning top 6 matched items for quick dropdowns.
 */
export async function quickSearchProducts(term: string) {
  if (!term || term.trim().length < 2) return [];

  const sanitized = `%${term.trim()}%`;

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
}
