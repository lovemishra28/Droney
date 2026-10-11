"use client";

import React from "react";

interface DataTableProps<T> {
  columns: Array<{
    header: string;
    accessor: keyof T | ((row: T) => React.ReactNode);
  }>;
  data: T[];
}

export function DataTable<T extends { id: string }>({
  columns,
  data,
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-zinc-800 bg-zinc-900/60">
      <table className="w-full text-left text-xs text-zinc-300">
        <thead className="border-b border-zinc-800 bg-zinc-950/50 tracking-wider text-zinc-400 uppercase">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} className="px-4 py-3">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800/60">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-zinc-500"
              >
                No records found.
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row.id} className="transition hover:bg-zinc-800/40">
                {columns.map((col, idx) => (
                  <td key={idx} className="px-4 py-3">
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
