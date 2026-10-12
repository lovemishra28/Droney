"use client";

import React, { useMemo, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowUpDown,
  Check,
  ExternalLink,
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

  const handleStockSave = (productId: string) => {
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
      }
    });
  };

  const handleStatusChange = (
    productId: string,
    nextStatus: "active" | "draft" | "archived"
  ) => {
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
      }
    });
  };

  const columns = useMemo<ColumnDef<AdminProductRow>[]>(
    () => [
      {
        accessorKey: "sku",
        header: "SKU / Media",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex items-center gap-3">
              <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950">
                <Image
                  src={item.thumbnailUrl || "/placeholders/drone-placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <span className="font-mono text-xs font-semibold text-indigo-400">
                  {item.sku}
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  {item.hasVideo && (
                    <span title="Bunny HLS Video Linked">
                      <Video className="h-3 w-3 text-emerald-400" />
                    </span>
                  )}
                  {item.isSecondHand && (
                    <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[9px] font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/30">
                      Grade {item.cosmeticGrade || "A"}
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
        header: "Product Title & Category",
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="max-w-[280px]">
              <Link
                href={`/product/${item.slug}`}
                target="_blank"
                className="inline-flex items-center gap-1 font-medium text-white hover:text-indigo-400 transition-colors line-clamp-1"
              >
                <span>{item.name}</span>
                <ExternalLink className="h-3 w-3 opacity-60 flex-shrink-0" />
              </Link>
              <span className="text-[11px] text-zinc-500 block">{item.categoryName}</span>
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
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>Price</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => (
          <span className="font-semibold text-zinc-200">
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
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <span>Stock</span>
            <ArrowUpDown className="h-3 w-3" />
          </button>
        ),
        cell: ({ row }) => {
          const item = row.original;
          const isEditing = editingStockId === item.id;
          const isLowStock = item.stockQuantity <= 3;

          if (isEditing) {
            return (
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  value={stockInput}
                  onChange={(e) => setStockInput(parseInt(e.target.value, 10) || 0)}
                  className="w-16 rounded border border-zinc-700 bg-zinc-950 px-2 py-1 font-mono text-xs text-white focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => handleStockSave(item.id)}
                  disabled={isPending}
                  className="rounded bg-indigo-600 p-1 text-white hover:bg-indigo-500 transition-colors"
                >
                  <Check className="h-3 w-3" />
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
                className={`font-mono text-xs font-semibold px-2 py-0.5 rounded border transition-colors ${
                  item.stockQuantity === 0
                    ? "border-rose-500/40 bg-rose-950/60 text-rose-300"
                    : isLowStock
                    ? "border-amber-500/40 bg-amber-950/60 text-amber-300"
                    : "border-zinc-800 bg-zinc-950 text-zinc-200 hover:border-zinc-700"
                }`}
                title="Click to edit stock level"
              >
                {item.stockQuantity} units
              </button>
              {isLowStock && (
                <span title="Low stock threshold alert (≤3 units)">
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-400 flex-shrink-0" />
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
              className={`rounded-lg border px-2 py-1 text-[11px] font-semibold uppercase tracking-wider focus:outline-none transition-colors ${
                item.status === "active"
                  ? "border-emerald-500/30 bg-emerald-950/60 text-emerald-300"
                  : item.status === "draft"
                  ? "border-amber-500/30 bg-amber-950/60 text-amber-300"
                  : "border-zinc-800 bg-zinc-900 text-zinc-500"
              }`}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
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
      pagination: { pageSize: 25 }, // High-density 25 SKUs per page
    },
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative min-w-[280px] flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search SKU, component title, category..."
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:border-indigo-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/import"
            className="rounded-xl border border-zinc-800 bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-300 hover:border-zinc-700 hover:text-white transition-colors"
          >
            Bulk CSV Ingest
          </Link>
        </div>
      </div>

      {/* Main Table Panel */}
      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-950/60 text-zinc-400 uppercase">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-5 py-3.5">
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
            <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-5 py-8 text-center text-zinc-500">
                    No matching products found in catalog.
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-zinc-900/60 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-5 py-3.5">
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
        <div className="flex items-center justify-between border-t border-zinc-800/80 px-5 py-3 text-xs text-zinc-400">
          <span>
            Showing {table.getRowModel().rows.length} of {data.length} total SKUs
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-zinc-300 hover:border-zinc-700 disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <span className="font-mono">
              Page {table.getState().pagination.pageIndex + 1} of{" "}
              {table.getPageCount() || 1}
            </span>
            <button
              type="button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-zinc-300 hover:border-zinc-700 disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
