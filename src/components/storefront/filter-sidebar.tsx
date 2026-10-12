"use client";

import React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Filter, RotateCcw } from "lucide-react";

export interface CategoryOption {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

interface FilterSidebarProps {
  categories?: CategoryOption[];
}

export function FilterSidebar({ categories = [] }: FilterSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentSort = searchParams.get("sort") || "newest";
  const currentMinPrice = searchParams.get("minPrice") || "";
  const currentMaxPrice = searchParams.get("maxPrice") || "";

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", "1"); // Reset pagination upon filtering changes

    if (value && value !== "") {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleResetFilters = () => {
    router.push(pathname, { scroll: false });
  };

  const hasActiveFilters =
    Boolean(currentCategory) ||
    Boolean(currentCondition) ||
    Boolean(currentMinPrice) ||
    Boolean(currentMaxPrice);

  return (
    <aside className="w-full rounded-2xl border border-zinc-800 bg-zinc-950/60 p-5 text-zinc-200">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-indigo-400" />
          <h2 className="text-sm font-semibold tracking-wide uppercase">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="mt-5 flex flex-col gap-6">
        {/* Sort Ordering */}
        <div>
          <label
            htmlFor="filter-sort-select"
            className="text-xs font-semibold tracking-wider text-zinc-400 uppercase"
          >
            Sort By
          </label>
          <select
            id="filter-sort-select"
            value={currentSort}
            onChange={(e) => updateFilters("sort", e.target.value)}
            className="mt-2 w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-zinc-200 focus:border-indigo-500 focus:outline-none"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Condition / Certification Tier */}
        <div>
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Condition Tier
          </span>
          <div className="mt-2 flex flex-col gap-1.5">
            {[
              { label: "All Items", value: "" },
              { label: "Brand New Only", value: "new" },
              { label: "Pre-Owned Certified", value: "used" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-xs text-zinc-300 hover:text-zinc-100"
              >
                <input
                  type="radio"
                  name="condition"
                  checked={currentCondition === option.value}
                  onChange={() => updateFilters("condition", option.value)}
                  className="rounded border-zinc-700 text-indigo-600 focus:ring-0"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (
          <div>
            <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
              Component Category
            </span>
            <div className="mt-2 flex max-h-48 scrollbar-thin flex-col gap-1.5 overflow-y-auto pr-1">
              <button
                type="button"
                onClick={() => updateFilters("category", null)}
                className={`flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  currentCategory === ""
                    ? "bg-indigo-600/20 font-medium text-indigo-300"
                    : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                }`}
              >
                <span>All Components</span>
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => updateFilters("category", cat.slug)}
                  className={`flex items-center justify-between rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                    currentCategory === cat.slug
                      ? "bg-indigo-600/20 font-medium text-indigo-300"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}
                >
                  <span className="truncate">{cat.name}</span>
                  <span className="text-[10px] text-zinc-600">
                    {cat.productCount}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Price Range (₹) */}
        <div>
          <span className="text-xs font-semibold tracking-wider text-zinc-400 uppercase">
            Price Range (₹)
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={currentMinPrice}
              onBlur={(e) => updateFilters("minPrice", e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
            <span className="text-zinc-600">-</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={currentMaxPrice}
              onBlur={(e) => updateFilters("maxPrice", e.target.value)}
              className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:border-indigo-500 focus:outline-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
