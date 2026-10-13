import React from "react";
import { requireAdminSession } from "@/server/queries/admin";
import { BulkImporter } from "@/components/admin/bulk-importer";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8f33b]">
              Catalog Ingestion Engine
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
            Bulk Spreadsheet Inventory Ingest
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Upload verified CSV spreadsheets to batch-insert or mass-update 500+ SKUs with automated PapaParse validation.
          </p>
        </div>
      </div>

      {/* Main Importer Workspace */}
      <BulkImporter />
    </div>
  );
}
