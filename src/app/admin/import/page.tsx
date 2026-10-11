import { BulkImporter } from "@/components/admin/bulk-importer";

export default function AdminImportPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
          Bulk CSV & Excel Catalog Ingestion
        </h1>
        <p className="mt-1 text-xs text-zinc-400">
          Upload bulk inventory files to synchronize 500+ SKUs with Drizzle ORM
          in parameterized batch transactions.
        </p>
      </div>

      <BulkImporter />
    </div>
  );
}
