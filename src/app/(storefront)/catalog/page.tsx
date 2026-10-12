import React, { Suspense } from "react";
import Link from "next/link";
import { getCatalogCategories, getProducts } from "@/server/queries/catalog";
import { FilterSidebar } from "@/components/storefront/filter-sidebar";
import { ProductCard } from "@/components/storefront/product-card";

interface CatalogPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const revalidate = 60; // 60 seconds Incremental Static Regeneration at the edge

export default async function CatalogPage({ searchParams }: CatalogPageProps) {
  const resolvedParams = await searchParams;

  const page =
    typeof resolvedParams.page === "string"
      ? parseInt(resolvedParams.page, 10)
      : 1;
  const categorySlug =
    typeof resolvedParams.category === "string"
      ? resolvedParams.category
      : undefined;
  const condition =
    typeof resolvedParams.condition === "string"
      ? resolvedParams.condition
      : undefined;
  const sort =
    typeof resolvedParams.sort === "string"
      ? (resolvedParams.sort as "price_asc" | "price_desc" | "newest")
      : "newest";
  const search =
    typeof resolvedParams.q === "string" ? resolvedParams.q : undefined;

  const minPriceInr =
    typeof resolvedParams.minPrice === "string"
      ? parseFloat(resolvedParams.minPrice)
      : undefined;
  const maxPriceInr =
    typeof resolvedParams.maxPrice === "string"
      ? parseFloat(resolvedParams.maxPrice)
      : undefined;

  // Execute concurrent server queries
  let categoriesFormatted: {
    id: string;
    name: string;
    slug: string;
    productCount: number;
  }[] = [];

  let products: any[] = [];
  let pagination = {
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  };

  try {
    const [categoriesData, catalogResult] = await Promise.all([
      getCatalogCategories(),
      getProducts({
        page,
        pageSize: 20,
        categorySlug,
        search,
        isSecondHand:
          condition === "used" ? true : condition === "new" ? false : undefined,
        minPricePaise: minPriceInr ? Math.round(minPriceInr * 100) : undefined,
        maxPricePaise: maxPriceInr ? Math.round(maxPriceInr * 100) : undefined,
        sortBy: sort,
      }),
    ]);

    categoriesFormatted = (categoriesData || []).map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      productCount: c.products ? c.products.length : 0,
    }));

    products = catalogResult.data;
    pagination = catalogResult.pagination;
  } catch (error) {
    console.warn("[Catalog Server Query Notice]:", error);
    // Development fallback mock items if database connection is pending
    products = [
      {
        id: "prod-1",
        slug: "apex-5-inch-freestyle-drone",
        name: 'ImpulseRC Apex 5" 6S Freestyle Drone (BNF / ELRS)',
        sku: "DRN-APX5-6S",
        basePricePaise: 2899900,
        stockQuantity: 4,
        isSecondHand: false,
        category: { name: "BNF Drones", slug: "bnf-drones" },
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
      },
      {
        id: "prod-2",
        slug: "t-motor-f60-pro-v-1950kv",
        name: "T-Motor F60 PRO V 1950KV Brushless Motor",
        sku: "MTR-TM-F60V",
        basePricePaise: 235000,
        stockQuantity: 28,
        isSecondHand: false,
        category: { name: "Motors", slug: "motors" },
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
      },
      {
        id: "prod-3",
        slug: "cinelog35-v2-pre-owned",
        name: "GEPRC CineLog35 V2 HD O3 (Grade A Certified Pre-Owned)",
        sku: "USED-GEP-CL35",
        basePricePaise: 3499900,
        stockQuantity: 1,
        isSecondHand: true,
        category: { name: "Cinelifters", slug: "cinelifters" },
        secondHandDetails: { cosmeticGrade: "A" },
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
      },
      {
        id: "prod-4",
        slug: "speedybee-f405-v4-stack",
        name: "SpeedyBee F405 V4 55A BLS 30x30 Flight Controller & ESC Stack",
        sku: "STK-SB-F405V4",
        basePricePaise: 685000,
        stockQuantity: 15,
        isSecondHand: false,
        category: { name: "Flight Controllers", slug: "flight-controllers" },
        media: [
          {
            url: "/placeholders/drone-placeholder.webp",
            mediaType: "image" as const,
          },
        ],
      },
    ];
    pagination.totalCount = products.length;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header Banner */}
      <div className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
          Hardware Inventory & Component Catalog
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Showing {pagination.totalCount} products across certified drone
          frames, ESCs, motors, and spares.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:col-span-1 lg:block">
          <Suspense
            fallback={
              <div className="w-full text-xs text-zinc-500">
                Loading filters...
              </div>
            }
          >
            <FilterSidebar categories={categoriesFormatted} />
          </Suspense>
        </div>

        {/* Product Grid & Pagination */}
        <div className="lg:col-span-3">
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 p-12 text-center">
              <p className="text-base font-semibold text-zinc-300">
                No drone hardware matches your current filters.
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                Try clearing selected categories or price thresholds to browse
                other items.
              </p>
              <Link
                href="/catalog"
                className="mt-4 rounded-lg bg-zinc-800 px-4 py-2 text-xs font-semibold text-zinc-200 hover:bg-zinc-700"
              >
                Reset Catalog Filters
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {products.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>

              {/* Pagination Controls */}
              {pagination.totalPages > 1 && (
                <div className="mt-10 flex items-center justify-between border-t border-zinc-800/80 pt-4 text-xs text-zinc-400">
                  <span>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>

                  <div className="flex items-center gap-2">
                    {pagination.hasPrevPage && (
                      <Link
                        href={`/catalog?page=${pagination.page - 1}${
                          categorySlug ? `&category=${categorySlug}` : ""
                        }${sort ? `&sort=${sort}` : ""}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 hover:border-zinc-700"
                      >
                        Previous
                      </Link>
                    )}

                    {pagination.hasNextPage && (
                      <Link
                        href={`/catalog?page=${pagination.page + 1}${
                          categorySlug ? `&category=${categorySlug}` : ""
                        }${sort ? `&sort=${sort}` : ""}`}
                        className="rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-zinc-200 hover:border-zinc-700"
                      >
                        Next
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
