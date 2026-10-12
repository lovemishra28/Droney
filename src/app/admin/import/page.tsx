import React from "react";
import { FileSpreadsheet } from "lucide-react";
import { requireAdminSession } from "@/server/queries/admin";
import { BulkImporter } from "@/components/admin/bulk-importer";

export const dynamic = "force-dynamic";

export default async function AdminImportPage() {
  await requireAdminSession();

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Bulk Catalog Spreadsheet Import
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Import new hardware inventory batches or mass update existing SKUs via CSV.
          </p>
        </div>
      </div>

      {/* Main Importer Workspace */}
      <BulkImporter />
    </div>
  );
}
