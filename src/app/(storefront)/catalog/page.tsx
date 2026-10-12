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
            url: "/placeholders/drone-placeholder.svg",
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
            url: "/placeholders/drone-placeholder.svg",
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
            url: "/placeholders/drone-placeholder.svg",
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
            url: "/placeholders/drone-placeholder.svg",
            mediaType: "image" as const,
          },
        ],
      },
    ];
    pagination.totalCount = products.length;
  }

  let catalogTitle = "Hardware Fleet & Flight Spares";
  let catalogSubtitle = `Showing ${pagination.totalCount} products across certified drone frames, ESCs, motors, and camera gear.`;
  let categoryLabel = "";

  if (categorySlug === "drones") {
    catalogTitle = "Flight Fleet & Drones";
    catalogSubtitle = `Showing ${pagination.totalCount} certified camera platforms, FPV racers, and aerial fleet drones.`;
    categoryLabel = "Drones";
  } else if (categorySlug === "accessories") {
    catalogTitle = "Aviation Accessories & Cinema Glass";
    catalogSubtitle = `Showing ${pagination.totalCount} essential flight batteries, ND filters, rugged cases, and remote controllers.`;
    categoryLabel = "Accessories";
  } else if (categorySlug === "camera-drones") {
    catalogTitle = "Flight Fleet & Camera Drones";
    catalogSubtitle = `Showing ${pagination.totalCount} aerial cinematography platforms, 4K/60fps quadcopters, and dual-sensor drones.`;
    categoryLabel = "Camera Drones";
  } else if (categorySlug === "fpv-drones") {
    catalogTitle = "FPV & Acro Racing Drones";
    catalogSubtitle = `Showing ${pagination.totalCount} tuned acrobatic platforms and BNF quadcopters.`;
    categoryLabel = "FPV Drones";
  } else if (categorySlug === "mini-drone") {
    catalogTitle = "Mini & Lightweight Drones";
    catalogSubtitle = `Showing ${pagination.totalCount} ultra-compact, portable, and beginner-friendly aerial drones.`;
    categoryLabel = "Mini Drone";
  } else if (categorySlug === "professional-drone") {
    catalogTitle = "Professional & Cinema Drones";
    catalogSubtitle = `Showing ${pagination.totalCount} enterprise-grade, high-end cinema, and heavy-lift aerial platforms.`;
    categoryLabel = "Professional Drone";
  } else if (categorySlug === "motors") {
    catalogTitle = "Motors, ESCs & Power Electronics";
    catalogSubtitle = `Showing ${pagination.totalCount} high-efficiency brushless motors, titanium stacks, and ESC controllers.`;
    categoryLabel = "Motors & ESCs";
  } else if (categorySlug === "used-drones") {
    catalogTitle = "Pre-Owned Certified Fleet";
    catalogSubtitle = `Showing ${pagination.totalCount} inspected and flight-tested drones with warranty.`;
    categoryLabel = "Pre-Owned Drones";
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 py-10">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-500 mb-4 font-medium">
          <Link href="/" className="hover:text-black transition">Home</Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-black transition">Hardware Catalog</Link>
          {categoryLabel && (
            <>
              <span>/</span>
              <span className="font-semibold text-black">{categoryLabel}</span>
            </>
          )}
        </div>

        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between border-b border-zinc-200 pb-6 mb-8 gap-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              {catalogTitle}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-zinc-500">
              {catalogSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/catalog?condition=new"
              className={`rounded-full px-3.5 py-1 text-xs font-bold transition ${
                condition === "new"
                  ? "bg-black text-white"
                  : "border border-zinc-200 bg-zinc-100 text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              Brand New
            </Link>
            <Link
              href="/used-drones"
              className="rounded-full border border-zinc-200 bg-zinc-100 px-3.5 py-1 text-xs font-bold text-zinc-700 hover:bg-zinc-200 transition"
            >
              Pre-Owned
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
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
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/50 p-12 text-center">
                <p className="text-base font-bold text-black">
                  No drone hardware matches your current filters.
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  Try clearing selected categories or price thresholds to browse other items.
                </p>
                <Link
                  href="/catalog"
                  className="mt-5 rounded-full bg-[#c8f33b] px-5 py-2 text-xs font-bold text-black hover:bg-[#b8e530] transition shadow-xs"
                >
                  Reset Catalog Filters
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {products.map((item) => (
                    <ProductCard key={item.id} product={item} />
                  ))}
                </div>

                {/* Pagination Controls */}
                {pagination.totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-between border-t border-zinc-200 pt-5 text-xs text-zinc-600 font-medium">
                    <span>
                      Page {pagination.page} of {pagination.totalPages}
                    </span>

                    <div className="flex items-center gap-2">
                      {pagination.hasPrevPage && (
                        <Link
                          href={`/catalog?page=${pagination.page - 1}${
                            categorySlug ? `&category=${categorySlug}` : ""
                          }${sort ? `&sort=${sort}` : ""}`}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-black hover:bg-zinc-100 font-bold transition shadow-xs"
                        >
                          Previous
                        </Link>
                      )}

                      {pagination.hasNextPage && (
                        <Link
                          href={`/catalog?page=${pagination.page + 1}${
                            categorySlug ? `&category=${categorySlug}` : ""
                          }${sort ? `&sort=${sort}` : ""}`}
                          className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-black hover:bg-zinc-100 font-bold transition shadow-xs"
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
    </div>
  );
}
