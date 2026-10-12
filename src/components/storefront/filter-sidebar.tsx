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
    <aside className="w-full rounded-2xl border border-zinc-200 bg-zinc-50/70 p-5 text-zinc-900 shadow-xs">
      <div className="flex items-center justify-between border-b border-zinc-200 pb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-black" />
          <h2 className="text-xs font-bold tracking-wider text-black uppercase font-mono">
            Filters
          </h2>
        </div>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-500 hover:text-black transition"
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
            className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono"
          >
            Sort By
          </label>
          <select
            id="filter-sort-select"
            value={currentSort}
            onChange={(e) => updateFilters("sort", e.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-300 bg-white px-3 py-2 text-xs font-medium text-zinc-800 shadow-xs focus:border-black focus:outline-none"
          >
            <option value="newest">Newest Arrivals</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>

        {/* Condition / Certification Tier */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
            Condition Tier
          </span>
          <div className="mt-2.5 flex flex-col gap-2">
            {[
              { label: "All Items", value: "" },
              { label: "Brand New Only", value: "new" },
              { label: "Pre-Owned Certified", value: "used" },
            ].map((option) => (
              <label
                key={option.value}
                className="flex cursor-pointer items-center gap-2 text-xs font-medium text-zinc-700 hover:text-black"
              >
                <input
                  type="radio"
                  name="condition"
                  checked={currentCondition === option.value}
                  onChange={() => updateFilters("condition", option.value)}
                  className="rounded-full border-zinc-300 text-black focus:ring-black accent-black"
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Categories */}
        {categories.length > 0 && (() => {
          const droneCategories = categories.filter(
            (c) =>
              c.slug !== "drones" &&
              (c.slug.includes("drone") || c.name.toLowerCase().includes("drone"))
          );
          const otherCategories = categories.filter(
            (c) =>
              c.slug !== "drones" &&
              !c.slug.includes("drone") &&
              !c.name.toLowerCase().includes("drone")
          );
          const totalDroneCount = droneCategories.reduce(
            (acc, c) => acc + c.productCount,
            0
          );
          const isAnyDroneActive =
            currentCategory === "drones" ||
            droneCategories.some((c) => c.slug === currentCategory);

          return (
            <div>
              <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
                Component Category
              </span>
              <div className="mt-2.5 flex max-h-72 scrollbar-thin flex-col gap-1 overflow-y-auto pr-1">
                {/* 1. All Components */}
                <button
                  type="button"
                  onClick={() => updateFilters("category", null)}
                  className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    currentCategory === ""
                      ? "bg-black font-bold text-white shadow-xs"
                      : "text-zinc-600 hover:bg-zinc-200/70 hover:text-black font-medium"
                  }`}
                >
                  <span>All Components</span>
                </button>

                {/* 2. Drones Parent Category */}
                <div className="mt-1">
                  <button
                    type="button"
                    onClick={() => updateFilters("category", "drones")}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                      currentCategory === "drones"
                        ? "bg-black font-bold text-white shadow-xs"
                        : isAnyDroneActive
                        ? "text-black font-bold bg-zinc-200/50"
                        : "text-zinc-700 hover:bg-zinc-200/70 hover:text-black font-semibold"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 truncate">
                      <span>Drones</span>
                    </span>
                    <span
                      className={`text-[10px] font-mono ${
                        currentCategory === "drones"
                          ? "text-[#c8f33b] font-bold"
                          : "text-zinc-500 font-semibold"
                      }`}
                    >
                      {totalDroneCount}
                    </span>
                  </button>

                  {/* Indented Drone Sub-categories */}
                  <div className="ml-3 my-1 pl-2.5 border-l-2 border-zinc-200 flex flex-col gap-0.5">
                    {droneCategories.map((cat) => {
                      const isSelected = currentCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updateFilters("category", cat.slug)}
                          className={`group flex items-center justify-between rounded-md px-2 py-1 text-left text-[11px] transition-colors ${
                            isSelected
                              ? "bg-black font-bold text-white shadow-xs"
                              : "text-zinc-600 hover:bg-zinc-200/70 hover:text-black font-medium"
                          }`}
                        >
                          <span className="truncate flex items-center gap-1.5">
                            <span
                              className={`h-1.5 w-1.5 rounded-full transition-colors ${
                                isSelected
                                  ? "bg-[#c8f33b]"
                                  : "bg-zinc-300 group-hover:bg-zinc-500"
                              }`}
                            />
                            <span>{cat.name}</span>
                          </span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? "text-zinc-300" : "text-zinc-400"
                            }`}
                          >
                            {cat.productCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Other Non-Drone Hardware & Accessories */}
                {otherCategories.length > 0 && (
                  <div className="mt-1 pt-1 border-t border-zinc-200/80 flex flex-col gap-1">
                    {otherCategories.map((cat) => {
                      const isSelected = currentCategory === cat.slug;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => updateFilters("category", cat.slug)}
                          className={`flex items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                            isSelected
                              ? "bg-black font-bold text-white shadow-xs"
                              : "text-zinc-600 hover:bg-zinc-200/70 hover:text-black font-medium"
                          }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          <span
                            className={`text-[10px] font-mono ${
                              isSelected ? "text-zinc-300" : "text-zinc-400"
                            }`}
                          >
                            {cat.productCount}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })()}

        {/* Price Range (₹) */}
        <div>
          <span className="text-[11px] font-bold tracking-wider text-zinc-500 uppercase font-mono">
            Price Range (₹)
          </span>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              defaultValue={currentMinPrice}
              onBlur={(e) => updateFilters("minPrice", e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-black focus:outline-none"
            />
            <span className="text-zinc-400">-</span>
            <input
              type="number"
              placeholder="Max"
              defaultValue={currentMaxPrice}
              onBlur={(e) => updateFilters("maxPrice", e.target.value)}
              className="w-full rounded-xl border border-zinc-300 bg-white px-2.5 py-1.5 text-xs text-zinc-900 placeholder-zinc-400 shadow-xs focus:border-black focus:outline-none"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
