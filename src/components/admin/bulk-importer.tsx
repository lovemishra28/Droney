"use client";

import { useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";

export function BulkImporter() {
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
    }
  };

  return (
    <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
        <UploadCloud className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-base font-bold text-zinc-100">
        500+ SKU Bulk Catalog Ingestion
      </h3>
      <p className="mx-auto mt-1 max-w-sm text-xs text-zinc-400">
        Drag and drop your pre-formatted CSV or XLSX inventory spreadsheet with
        technical hardware specs.
      </p>

      <label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-zinc-100 px-4 py-2.5 text-xs font-semibold text-zinc-900 hover:bg-zinc-200">
        <FileSpreadsheet className="h-4 w-4" />
        <span>Select Spreadsheet File</span>
        <input
          type="file"
          accept=".csv,.xlsx"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {fileName && (
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          <span>Loaded: {fileName} (Ready for pre-flight validation)</span>
        </div>
      )}
    </div>
  );
}
