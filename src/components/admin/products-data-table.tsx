"use client";

import React, { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ExternalLink,
  Pencil,
  Search,
  Video,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { formatINR } from "@/lib/utils";
import {
  toggleProductStatusAction,
  updateProductStockAction,
} from "@/server/actions/admin-products";

export interface AdminProductRow {
  id: string;
  sku: string;
  name: string;
  brand?: string;
  slug: string;
  categoryName: string;
  basePricePaise: number;
  stockQuantity: number;
  isSecondHand: boolean;
  cosmeticGrade?: "A" | "B" | "C" | null;
  status: "active" | "draft" | "archived";
  thumbnailUrl: string;
  hasVideo: boolean;
}

interface ProductsDataTableProps {
  initialProducts: AdminProductRow[];
}

export function ProductsDataTable({ initialProducts }: ProductsDataTableProps) {
  const [data, setData] = useState(initialProducts);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isPending, startTransition] = useTransition();
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [stockInput, setStockInput] = useState<number>(0);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleStockSave = (productId: string) => {
    setActionError(null);
    startTransition(async () => {
      const result = await updateProductStockAction({
        productId,
        stockQuantity: Number(stockInput),
      });

      if (result.success) {
        setData((prev) =>
          prev.map((item) =>
            item.id === productId
              ? { ...item, stockQuantity: Number(stockInput) }
              : item
          )
        );
        setEditingStockId(null);
      } else {
        setActionError(result.message || "Unable to update stock.");
      }
    });
  };

  const handleStatusChange = (
    productId: string,
    nextStatus: "active" | "draft" | "archived"
  ) => {
    setActionError(null);
    startTransition(async () => {
      const result = await toggleProductStatusAction({
        productId,
        status: nextStatus,
      });

      if (result.success) {
        setData((prev) =>
          prev.map((item) =>
            item.id === productId ? { ...item, status: nextStatus } : item
          )
        );
      } else {
        setActionError(result.message || "Unable to update listing status.");
      }
    });
  };

  const columns = useMemo<ColumnDef<AdminProductRow>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU / Preview",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950">
                <Image
                  src={item.thumbnailUrl || "/placeholders/drone-placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-xs font-bold text-zinc-900 dark:text-white">
                  {item.sku}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.hasVideo && (
                    <span title="Bunny HLS Video Linked">
                      <Video className="h-3 w-3 text-lime-700 dark:text-[#c8f33b]" />
                    </span>
                  )}
                  {item.isSecondHand ? (
                    <span className="rounded border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-emerald-700 dark:text-emerald-400">
                      Grade {item.cosmeticGrade || "A"}
                    </span>
                  ) : (
                    <span className="rounded border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-zinc-700 dark:text-zinc-300">
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "name",
        header: "Component Title",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="max-w-[280px]">
              <Link
                href={`/product/${item.slug}`}
                target="_blank"
                className="group flex items-center gap-1 font-semibold text-zinc-900 dark:text-zinc-100 hover:text-lime-700 dark:hover:text-[#c8f33b] transition-colors"
                title="View live storefront product page"
              >
                <span className="truncate">{item.name}</span>
                <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-lime-700 dark:text-[#c8f33b] shrink-0" />
              </Link>
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-500 mt-0.5">
                {item.brand && (
                  <span className="text-lime-700 dark:text-[#c8f33b] font-bold tracking-wider uppercase">
                    {item.brand}
                  </span>
                )}
                {item.brand && <span>•</span>}
                <span>{item.categoryName}</span>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "basePricePaise",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-mono uppercase text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <span>Base Price</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-mono font-bold text-zinc-900 dark:text-white text-sm">
            {formatINR(row.original.basePricePaise)}
          </span>
        ),
      },
      {
        accessorKey: "stockQuantity",
        header: ({ column }) => (
          <button
            type="button"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="flex items-center gap-1 font-mono uppercase text-zinc-500 dark:text-zinc-400 hover:text-black dark:hover:text-white"
          >
            <span>Inventory Stock</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isLowStock = item.stockQuantity <= 3 && item.stockQuantity > 0;

          if (editingStockId === item.id) {
            return (
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  min={0}
                  value={stockInput}
                  onChange={(e) => setStockInput(parseInt(e.target.value, 10) || 0)}
                  className="w-18 rounded-lg border border-zinc-300 dark:border-[#c8f33b]/60 bg-white dark:bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-900 dark:text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleStockSave(item.id)}
                  disabled={isPending}
                  className="rounded-lg bg-lime-500 dark:bg-[#c8f33b] p-1.5 text-black hover:bg-lime-400 dark:hover:bg-[#b5e028] transition-colors"
                >
                  <Check className="h-3.5 w-3.5 stroke-[3]" />
                </button>
              </div>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditingStockId(item.id);
                  setStockInput(item.stockQuantity);
                }}
                className={`font-mono text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors shadow-xs ${
                  item.stockQuantity === 0
                    ? "border-rose-300 dark:border-rose-500/40 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                    : isLowStock
                    ? "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                    : "border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-200 hover:border-zinc-400 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white"
                }`}
                title="Click to inline edit stock level"
              >
                {item.stockQuantity} units
              </button>
              {isLowStock && (
                <span title="Low stock threshold alert (≤3 units)">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400 flex-shrink-0" />
                </span>
              )}
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "Listing Status",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <select
              value={item.status}
              disabled={isPending}
              onChange={(e) =>
                handleStatusChange(
                  item.id,
                  e.target.value as "active" | "draft" | "archived"
                )
              }
              className={`rounded-xl border px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider focus:outline-none transition-colors shadow-xs ${
                item.status === "active"
                  ? "border-emerald-300 dark:border-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                  : item.status === "draft"
                  ? "border-amber-300 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                  : "border-zinc-300 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-500"
              }`}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          );
        },
      },
      {
        id: "actions",
        header: () => (
          <span className="font-mono uppercase text-zinc-500 dark:text-zinc-400">
            Actions
          </span>
        ),
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/products/${item.id}`}
                className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:border-lime-500 dark:hover:border-[#c8f33b] hover:text-black dark:hover:text-[#c8f33b] transition-colors shadow-xs"
                title="Edit Product, Images & Specifications"
              >
                <Pencil className="h-3.5 w-3.5 text-lime-600 dark:text-[#c8f33b]" />
                <span>Edit</span>
              </Link>
            </div>
          );
        },
      },
    ],
    [editingStockId, stockInput, isPending]
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 25 },
    },
  });

  return (
    <div className="space-y-4">
      {actionError && (
        <div
          role="alert"
          className="rounded-2xl border border-rose-500/30 bg-rose-950/40 px-4 py-3 text-xs text-rose-300"
        >
          {actionError}
        </div>
      )}
      {/* Top Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400 dark:text-zinc-500" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search SKU, drone title, category, brand..."
            className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 py-2.5 pl-10 pr-4 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 focus:border-black dark:focus:border-[#c8f33b]/60 focus:outline-none transition-colors shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/import"
            className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white transition-colors shadow-xs"
          >
            Bulk CSV Ingest
          </Link>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/40 shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/70 font-mono text-[11px] text-zinc-500 dark:text-zinc-400 uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-4">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="divide-y divide-zinc-200/80 dark:divide-zinc-800/60 text-zinc-800 dark:text-zinc-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-10 text-center text-zinc-400 font-mono">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/60 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-800/80 px-5 py-3.5 text-xs text-zinc-500 dark:text-zinc-400">
          <span className="font-mono">
            Showing {table.getRowModel().rows.length} of {data.length} total SKUs
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="font-mono text-zinc-700 dark:text-zinc-300">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-3 py-1.5 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
