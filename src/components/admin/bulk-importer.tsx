"use client";

import React, { useState, useTransition } from "react";
import Papa from "papaparse";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileUp,
  Loader2,
} from "lucide-react";
import {
  bulkImportCatalogAction,
  bulkSkuRowSchema,
  type BulkSkuRow,
} from "@/server/actions/bulk-import";

interface RowValidationError {
  rowNumber: number;
  sku: string;
  errors: string[];
}

export function BulkImporter() {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<BulkSkuRow[]>([]);
  const [validationErrors, setValidationErrors] = useState<RowValidationError[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [importSummary, setImportSummary] = useState<{
    newSkus: number;
    updatedSkus: number;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // Standard CSV template download generator
  const downloadTemplate = () => {
    const headers = [
      "sku",
      "name",
      "category_slug",
      "category_name",
      "base_price_inr",
      "stock_quantity",
      "description",
      "is_second_hand",
      "frame_size_mm",
      "weight_grams",
      "input_voltage_lipo",
      "motor_kv",
      "fc_firmware",
      "esc_protocol",
      "flight_time_minutes",
      "payload_capacity_grams",
      "cosmetic_grade",
      "flight_hours",
      "crash_history",
      "battery_cycle_count",
      "included_accessories",
      "inspection_notes",
    ].join(",");

    const sampleRow = [
      "DRN-AERO-01",
      "AeroX 5-Inch Freestyle BNF",
      "fpv-drones",
      "FPV Drones",
      "34999",
      "15",
      "Pro-grade 6S freestyle drone with carbon frame",
      "false",
      "225",
      "385",
      "4S-6S LiPo",
      "1950KV",
      "Betaflight 4.5",
      "DShot600",
      "8",
      "450",
      "",
      "",
      "",
      "",
      "",
      "",
    ].join(",");

    const csvContent = `data:text/csv;charset=utf-8,${headers}\n${sampleRow}`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "aerostore_catalog_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServerError(null);
    setImportSummary(null);
    setValidationErrors([]);
    setParsedRows([]);

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setIsParsing(true);

      Papa.parse<Record<string, string>>(selectedFile, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rawData = results.data;
          const validRows: BulkSkuRow[] = [];
          const errorList: RowValidationError[] = [];

          rawData.forEach((row, index) => {
            const rowNumber = index + 2; // Offset for 1-based index and header row
            const skuVal = row.sku?.trim() || `ROW-${rowNumber}`;

            // Parse accessories JSON if present
            let parsedAccessories: string[] = [];
            if (row.included_accessories) {
              try {
                parsedAccessories = JSON.parse(row.included_accessories);
              } catch {
                parsedAccessories = row.included_accessories
                  .split(";")
                  .map((s) => s.trim())
                  .filter(Boolean);
              }
            }

            const candidateRow = {
              sku: row.sku?.trim(),
              name: row.name?.trim(),
              categorySlug: row.category_slug?.trim(),
              categoryName: row.category_name?.trim() || undefined,
              basePriceInr: parseFloat(row.base_price_inr),
              stockQuantity: parseInt(row.stock_quantity, 10),
              description: row.description?.trim() || undefined,
              isSecondHand: row.is_second_hand?.toLowerCase() === "true",
              frameSizeMm: row.frame_size_mm ? parseInt(row.frame_size_mm, 10) : undefined,
              weightGrams: row.weight_grams ? parseInt(row.weight_grams, 10) : undefined,
              inputVoltageLipo: row.input_voltage_lipo?.trim() || undefined,
              motorKv: row.motor_kv?.trim() || undefined,
              fcFirmware: row.fc_firmware?.trim() || undefined,
              escProtocol: row.esc_protocol?.trim() || undefined,
              flightTimeMinutes: row.flight_time_minutes ? parseInt(row.flight_time_minutes, 10) : undefined,
              payloadCapacityGrams: row.payload_capacity_grams ? parseInt(row.payload_capacity_grams, 10) : undefined,
              cosmeticGrade: (["A", "B", "C"].includes(row.cosmetic_grade?.toUpperCase())
                ? row.cosmetic_grade.toUpperCase()
                : undefined) as "A" | "B" | "C" | undefined,
              flightHours: row.flight_hours ? parseInt(row.flight_hours, 10) : undefined,
              crashHistory: row.crash_history ? row.crash_history.toLowerCase() === "true" : undefined,
              batteryCycleCount: row.battery_cycle_count ? parseInt(row.battery_cycle_count, 10) : undefined,
              includedAccessories: parsedAccessories.length > 0 ? parsedAccessories : undefined,
              inspectionNotes: row.inspection_notes?.trim() || undefined,
            };

            const parseCheck = bulkSkuRowSchema.safeParse(candidateRow);

            if (parseCheck.success) {
              validRows.push(parseCheck.data);
            } else {
              errorList.push({
                rowNumber,
                sku: skuVal,
                errors: parseCheck.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`),
              });
            }
          });

          setParsedRows(validRows);
          setValidationErrors(errorList);
          setIsParsing(false);
        },
        error: (err) => {
          setServerError(`CSV parsing failed: ${err.message}`);
          setIsParsing(false);
        },
      });
    }
  };

  const handleCommitImport = () => {
    if (parsedRows.length === 0) return;

    setServerError(null);
    startTransition(async () => {
      const response = await bulkImportCatalogAction(parsedRows);

      if (!response.success || !response.data) {
        setServerError(response.message || "Failed to commit catalog import.");
        return;
      }

      setImportSummary({
        newSkus: response.data.importedCount,
        updatedSkus: response.data.updatedCount,
      });
      setParsedRows([]);
      setFile(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Action Header Card */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-zinc-100">
              Bulk Catalog CSV Ingestion Engine
            </h2>
            <p className="mt-1 text-xs text-zinc-400">
              Upload spreadsheets to populate or mass-update 500+ SKUs, drone frame sizes, and pre-owned condition logs.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-700 bg-zinc-800 px-3.5 py-2 text-xs font-semibold text-zinc-200 transition-colors hover:bg-zinc-700 hover:text-white"
          >
            <Download className="h-4 w-4 text-indigo-400" />
            <span>Download CSV Template</span>
          </button>
        </div>

        {/* Drag-and-Drop Dropzone */}
        <div className="mt-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-800 bg-zinc-950/60 p-8 text-center transition-colors hover:border-zinc-700 hover:bg-zinc-950">
            <FileSpreadsheet className="h-10 w-10 text-indigo-400" />
            <p className="mt-3 text-sm font-medium text-zinc-200">
              {file ? file.name : "Select or drag .csv inventory spreadsheet"}
            </p>
            <span className="mt-1 text-xs text-zinc-500">
              Supports UTF-8 CSV exports up to 600 SKUs per upload
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Parsing Loader */}
      {isParsing && (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 text-xs text-zinc-400">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
          <span>Parsing spreadsheet and checking schema constraints in browser...</span>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-950/40 p-4 text-xs text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Success Summary Banner */}
      {importSummary && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-950/40 p-5 text-xs text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-semibold text-white">Catalog Batch Ingest Complete</p>
              <p className="mt-0.5 text-zinc-300">
                Created <strong>{importSummary.newSkus}</strong> new listings and updated{" "}
                <strong>{importSummary.updatedSkus}</strong> existing inventory records.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Flight Validation Errors View */}
      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-zinc-900/40 p-5">
          <div className="flex items-center gap-2 text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-xs font-semibold uppercase tracking-wider">
              Validation Errors ({validationErrors.length} Invalid Rows Found)
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            The following rows in your spreadsheet have invalid values and were excluded from the import batch:
          </p>

          <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-xs divide-y divide-zinc-800/80">
            {validationErrors.map((err, i) => (
              <div key={i} className="py-2 flex justify-between gap-4">
                <span className="font-mono text-zinc-400">
                  Row {err.rowNumber} ({err.sku}):
                </span>
                <span className="text-rose-300 text-right">{err.errors.join("; ")}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Import Preview Table & Commit Action */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-100">
                Validated Rows Ready for Ingestion ({parsedRows.length} SKUs)
              </h3>
              <p className="text-xs text-zinc-400">
                Review verified attributes before committing to Supabase PostgreSQL.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleCommitImport}
              className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-semibold text-white shadow-lg transition-colors hover:bg-indigo-500 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ingesting Batch into PostgreSQL...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>Commit {parsedRows.length} Items to Catalog</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40">
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 border-b border-zinc-800 bg-zinc-950 text-zinc-400 uppercase">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Product Title</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price (₹)</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Condition Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 text-zinc-200">
                  {parsedRows.slice(0, 15).map((row, index) => (
                    <tr key={index} className="hover:bg-zinc-900/50">
                      <td className="px-4 py-2.5 font-mono text-indigo-400 font-medium">
                        {row.sku}
                      </td>
                      <td className="px-4 py-2.5 max-w-[200px] truncate">{row.name}</td>
                      <td className="px-4 py-2.5 text-zinc-400">{row.categorySlug}</td>
                      <td className="px-4 py-2.5 font-semibold text-white">
                        ₹{row.basePriceInr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 font-mono">{row.stockQuantity}</td>
                      <td className="px-4 py-2.5">
                        {row.isSecondHand ? (
                          <span className="rounded bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300 border border-amber-500/30">
                            Grade {row.cosmeticGrade || "A"} Pre-Owned
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 uppercase">Brand New</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedRows.length > 15 && (
              <div className="border-t border-zinc-800/80 bg-zinc-950/40 px-4 py-2 text-center text-[11px] text-zinc-500">
                Showing first 15 of {parsedRows.length} total rows in preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
