import React from "react";
import { requireAdminSession } from "@/server/queries/admin";
import { BulkImporter } from "@/components/admin/bulk-importer";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
              Catalog Ingestion Engine
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-zinc-900 dark:text-white sm:text-3xl font-sans">
            Bulk Spreadsheet Inventory Ingest
          </h1>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            Upload verified CSV spreadsheets to batch-insert or mass-update catalog SKUs with automated PapaParse validation.
          </p>
        </div>
      </div>

      {/* Main Importer Workspace */}
      <BulkImporter />
    </div>
  );
}
