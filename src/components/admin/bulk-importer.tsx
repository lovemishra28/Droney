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
  PackageCheck,
} from "lucide-react";
import { bulkImportCatalogAction } from "@/server/actions/bulk-import";
import {
  bulkSkuRowSchema,
  type BulkSkuRow,
} from "@/lib/validations/catalog";

interface RowValidationError {
  rowNumber: number;
  sku: string;
  errors: string[];
}

// Robust helper to match CSV columns regardless of currency symbols, question marks, or case variations
function getField(row: Record<string, string>, ...keys: string[]): string {
  // 1. Direct match
  for (const k of keys) {
    if (row[k] !== undefined && row[k] !== null && String(row[k]).trim() !== "") {
      return String(row[k]).trim();
    }
  }
  // 2. Normalized alphanumeric match
  const rowKeys = Object.keys(row);
  for (const target of keys) {
    const targetNorm = target.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const rk of rowKeys) {
      const rkNorm = rk.toLowerCase().replace(/[^a-z0-9]/g, "");
      if (rkNorm === targetNorm && row[rk] !== undefined && row[rk] !== null && String(row[rk]).trim() !== "") {
        return String(row[rk]).trim();
      }
    }
  }
  return "";
}

function parsePrice(val: string): number {
  if (!val) return 0;
  const cleaned = val.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

function parseIntSafe(val: string): number | undefined {
  if (!val) return undefined;
  const cleaned = val.replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? undefined : num;
}

function resolveCategory(catInput: string): { slug: string; name: string } {
  const norm = catInput.toLowerCase().trim();
  if (norm.includes("mini")) return { slug: "mini-series", name: "Mini Series (<249g)" };
  if (norm.includes("air")) return { slug: "air-series", name: "Air Series" };
  if (norm.includes("mavic")) return { slug: "mavic-series", name: "Mavic Series" };
  if (norm.includes("avata") || norm.includes("fpv")) return { slug: "avata-series", name: "Avata & FPV Series" };
  if (norm.includes("access")) return { slug: "accessories", name: "Accessories & Spares" };
  if (norm.includes("used") || norm.includes("pre-owned") || norm.includes("refurb"))
    return { slug: "used-drones", name: "Pre-Owned Drones" };

  const slug = norm.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "air-series";
  return { slug, name: catInput.trim() || "General Fleet" };
}

function parseIsSecondHand(val: string, categorySlug: string): boolean {
  if (categorySlug === "used-drones") return true;
  const s = val.toLowerCase().trim();
  if (!s || s.startsWith("no") || s === "false" || s === "0") return false;
  if (
    s.startsWith("yes") ||
    s === "true" ||
    s === "1" ||
    s.includes("certified") ||
    s.includes("pre-owned") ||
    s.includes("refurbished")
  ) {
    return true;
  }
  return false;
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

  // Standard CSV template download generator with all 23 exact fields
  const downloadTemplate = () => {
    const headers = [
      "SKU",
      "Product Name",
      "Brand",
      "Catalog Category",
      "Status",
      "Selling Price (₹)",
      "MRP / Strike (₹)",
      "Stock Units",
      "Warranty (Mos)",
      "Weight (g)",
      "Flight Time (m)",
      "Payload (g)",
      "Wheelbase (mm)",
      "Battery / Voltage",
      "Propulsion / Motor",
      "Flight OS",
      "Transmission",
      "Certified Pre-Owned",
      "Hero Badge",
      "Hero Headline",
      "Hero Subtitle",
      "In The Box Components",
      "Technical Summary",
    ];

    const sampleRows = [
      [
        "DRN-DJI-AIR-3S-RC2",
        "DJI Air 3S Fly More Combo (DJI RC 2)",
        "DJI",
        "Air Series",
        "Active",
        "178999",
        "199999",
        "8",
        "12",
        "724",
        "45",
        "150",
        "391",
        "4S LiPo 4276mAh (14.6V)",
        "DJI Aerodynamic Brushless",
        "DJI O4 FlightOS",
        "DJI O4 20km 10-bit HDR",
        "No (Brand New)",
        "DUAL-CAMERA FLAGSHIP",
        "DJI Air 3S. Chase the Light.",
        "Dual 1-inch CMOS primary and 70mm medium tele cameras with LiDAR night obstacle sensing.",
        '"DJI Air 3S Aircraft, DJI RC 2 Remote Controller, 3x Intelligent Flight Batteries, Battery Charging Hub, ND Filter Set (ND8/16/32), Shoulder Bag, 3x Spare Propeller Pairs, Type-C Cable"',
        '"DJI Air 3S Fly More Combo with DJI RC 2 features dual primary cameras: a 1-inch CMOS 50MP wide camera and a 70mm 48MP medium tele camera, next-gen LiDAR front obstacle sensing for night flights, and 45-minute endurance."',
      ].join(","),
      [
        "DRN-DJI-MINI-5-PRO-45M",
        "DJI Mini 5 Pro Fly More Combo Plus (45 Min)",
        "DJI",
        "Mini Series (<249g)",
        "Active",
        "129999",
        "149999",
        "9",
        "12",
        "289",
        "45",
        "60",
        "245",
        "2S LiPo 3850mAh Plus (7.38V)",
        "DJI Ultra-Quiet Motors",
        "DJI MiniOS Pro v5",
        "DJI O4+ 20km FHD",
        "No (Brand New)",
        "EXTENDED ENDURANCE 45M",
        "DJI Mini 5 Pro Plus. Beyond Boundaries.",
        "Extended 45-minute battery endurance, omnidirectional sensing, and True Vertical 4K/60fps HDR shooting.",
        '"DJI Mini 5 Pro Aircraft, DJI RC 2 Remote Controller, 3x Intelligent Flight Battery Plus, Two-Way Charging Hub, Shoulder Bag, 3x Spare Propellers, Gimbal Protector, Screwdriver & Screws"',
        '"DJI Mini 5 Pro Combo Plus equipped with high-capacity 45-minute batteries, 1/1.3-inch next-gen CMOS sensor, 4K/100fps slow motion, 360-degree APAS obstacle avoidance, and native vertical shooting for content creators."',
      ].join(","),
    ];

    const csvContent = `${headers.join(",")}\n${sampleRows.join("\n")}`;
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "droney_fleet_catalog_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        skipEmptyLines: "greedy",
        complete: (results) => {
          const rawData = results.data;
          const validRows: BulkSkuRow[] = [];
          const errorList: RowValidationError[] = [];

          rawData.forEach((row, index) => {
            const rowNumber = index + 2; // Offset for header row + 1-based index

            // 1. Core Identity & Nomenclature
            const skuVal = getField(row, "SKU", "sku", "Stock Keeping Unit");
            const nameVal = getField(row, "Product Name", "name", "Product Title", "Title");
            const brandVal = getField(row, "Brand", "brand", "Hardware Brand") || "DJI";
            const categoryInput = getField(row, "Catalog Category", "category", "category_name", "category_slug") || "Air Series";
            const { slug: categorySlug, name: categoryName } = resolveCategory(categoryInput);

            // 2. Status
            const rawStatus = getField(row, "Status", "status").toLowerCase();
            const status: "active" | "draft" | "archived" =
              rawStatus === "draft" || rawStatus === "archived" ? rawStatus : "active";

            // 3. Commercial Pricing & Inventory
            const basePriceInr = parsePrice(
              getField(
                row,
                "Selling Price (?)",
                "Selling Price (₹)",
                "Selling Price",
                "selling_price",
                "base_price_inr",
                "price"
              )
            );

            const rawMrp = getField(
              row,
              "MRP / Strike (?)",
              "MRP / Strike (₹)",
              "MRP / Strike",
              "mrp_price_inr",
              "mrp",
              "strike_price"
            );
            const mrpPriceInr = rawMrp ? parsePrice(rawMrp) : undefined;

            const stockVal = parseIntSafe(
              getField(row, "Stock Units", "stock_quantity", "stock", "quantity", "inventory")
            ) ?? 10;

            const warrantyMonths = parseIntSafe(
              getField(row, "Warranty (Mos)", "warranty_months", "warranty")
            ) ?? 12;

            // 4. Hardware Specifications
            const weightGrams = parseIntSafe(getField(row, "Weight (g)", "weight_grams", "weight"));
            const flightTimeMinutes = parseIntSafe(getField(row, "Flight Time (m)", "flight_time_minutes", "flight_time"));
            const payloadCapacityGrams = parseIntSafe(getField(row, "Payload (g)", "payload_capacity_grams", "payload"));
            const frameSizeMm = parseIntSafe(getField(row, "Wheelbase (mm)", "frame_size_mm", "wheelbase"));
            const inputVoltageLipo = getField(row, "Battery / Voltage", "input_voltage_lipo", "battery", "voltage") || undefined;
            const motorKv = getField(row, "Propulsion / Motor", "motor_kv", "motor", "propulsion") || undefined;
            const fcFirmware = getField(row, "Flight OS", "fc_firmware", "flight_os", "firmware") || undefined;
            const escProtocol = getField(row, "Transmission", "esc_protocol", "transmission_protocol", "esc") || undefined;

            // 5. Pre-Owned Inspection Details
            const certifiedPreOwnedRaw = getField(row, "Certified Pre-Owned", "is_second_hand", "pre_owned", "condition");
            const isSecondHand = parseIsSecondHand(certifiedPreOwnedRaw, categorySlug);

            const rawCosmetic = getField(row, "Cosmetic Grade", "cosmetic_grade", "grade").toUpperCase();
            const cosmeticGrade: "A" | "B" | "C" | undefined =
              rawCosmetic === "B" || rawCosmetic === "C" ? rawCosmetic : isSecondHand ? "A" : undefined;

            const flightHours = parseIntSafe(getField(row, "Flight Hours", "flight_hours"));
            const batteryCycleCount = parseIntSafe(getField(row, "Battery Cycles", "battery_cycle_count"));

            // 6. Showcase & Marketing Storytelling
            const heroBadge = getField(row, "Hero Badge", "hero_badge") || undefined;
            const heroHeadline = getField(row, "Hero Headline", "hero_headline") || undefined;
            const heroSubtitle = getField(row, "Hero Subtitle", "hero_subtitle") || undefined;
            const inTheBox = getField(row, "In The Box Components", "in_the_box", "included_accessories") || undefined;
            const description = getField(row, "Technical Summary", "description", "summary", "overview") || undefined;

            const candidateRow: BulkSkuRow = {
              sku: skuVal,
              name: nameVal,
              brand: brandVal,
              categorySlug,
              categoryName,
              status,
              basePriceInr,
              mrpPriceInr,
              stockQuantity: stockVal,
              warrantyMonths,
              description,
              isSecondHand,
              weightGrams,
              flightTimeMinutes,
              payloadCapacityGrams,
              frameSizeMm,
              inputVoltageLipo,
              motorKv,
              fcFirmware,
              escProtocol,
              cosmeticGrade,
              flightHours,
              batteryCycleCount,
              heroBadge,
              heroHeadline,
              heroSubtitle,
              inTheBox,
            };

            const parseCheck = bulkSkuRowSchema.safeParse(candidateRow);

            if (parseCheck.success) {
              validRows.push(parseCheck.data);
            } else {
              errorList.push({
                rowNumber,
                sku: skuVal || `Row ${rowNumber}`,
                errors: parseCheck.error.issues.map(
                  (i) => `${i.path.join(".") || "field"}: ${i.message}`
                ),
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
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-lime-500 dark:bg-[#c8f33b]" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-lime-700 dark:text-[#c8f33b]">
                23-Column Schema Engine
              </span>
            </div>
            <h2 className="mt-1 text-base font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              Bulk Catalog CSV Ingestion Engine
            </h2>
            <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
              Upload spreadsheets to populate or mass-update product SKUs, hardware specs, LiPo voltages, in-the-box combo packages, and pre-owned condition logs without manual data entry.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 px-3.5 py-2 text-xs font-semibold text-zinc-800 dark:text-zinc-200 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-black dark:hover:text-white shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-lime-700 dark:text-[#c8f33b]" />
            <span>Download Sample CSV Template</span>
          </button>
        </div>

        {/* Drag-and-Drop Dropzone */}
        <div className="mt-6">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-300 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60 p-8 text-center transition-all hover:border-lime-500 dark:hover:border-[#c8f33b]/60 hover:bg-zinc-100/60 dark:hover:bg-zinc-950 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs group-hover:border-lime-500/40 transition-colors">
              <FileSpreadsheet className="h-6 w-6 text-lime-700 dark:text-[#c8f33b]" />
            </div>
            <p className="mt-3 text-sm font-bold text-zinc-900 dark:text-zinc-100 font-sans">
              {file ? file.name : "Select or drag .csv inventory spreadsheet"}
            </p>
            <span className="mt-1 text-xs font-mono text-zinc-500 dark:text-zinc-400">
              Supports 23 attributes (SKU, Selling Price, MRP, Specs, In The Box, Technical Summary) up to 600 SKUs per upload
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
        <div className="flex items-center justify-center gap-2.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 p-6 text-xs text-zinc-600 dark:text-zinc-400 font-mono shadow-xs">
          <Loader2 className="h-4 w-4 animate-spin text-lime-600 dark:text-[#c8f33b]" />
          <span>Parsing spreadsheet and matching 23 attributes into schema...</span>
        </div>
      )}

      {/* Server Error Alert */}
      {serverError && (
        <div className="flex items-center gap-2 rounded-2xl border border-rose-500/30 bg-rose-50 dark:bg-rose-950/40 p-4 text-xs text-rose-700 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      {/* Success Summary Banner */}
      {importSummary && (
        <div className="flex items-center justify-between rounded-2xl border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/40 p-5 text-xs text-emerald-800 dark:text-emerald-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900 dark:text-white">
                Catalog Batch Ingest Complete
              </p>
              <p className="mt-0.5 text-emerald-800 dark:text-zinc-300">
                Created <strong>{importSummary.newSkus}</strong> new listings and updated{" "}
                <strong>{importSummary.updatedSkus}</strong> existing inventory records across the whole website.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Flight Validation Errors View */}
      {validationErrors.length > 0 && (
        <div className="rounded-2xl border border-rose-500/30 bg-white dark:bg-zinc-900/40 p-5 shadow-xs">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertCircle className="h-4 w-4" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              Validation Errors ({validationErrors.length} Invalid Rows Found)
            </h3>
          </div>
          <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
            The following rows in your spreadsheet have invalid values and were excluded from the import batch:
          </p>

          <div className="mt-4 max-h-48 overflow-y-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-3 text-xs divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {validationErrors.map((err, i) => (
              <div key={i} className="py-2 flex justify-between gap-4">
                <span className="font-mono text-zinc-700 dark:text-zinc-400">
                  Row {err.rowNumber} ({err.sku}):
                </span>
                <span className="text-rose-600 dark:text-rose-300 text-right font-medium">
                  {err.errors.join("; ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pre-Import Preview Table & Commit Action */}
      {parsedRows.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <PackageCheck className="h-4 w-4 text-lime-600 dark:text-[#c8f33b]" />
                <span>Validated Rows Ready for Ingestion ({parsedRows.length} SKUs)</span>
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Review verified attributes before committing to Supabase PostgreSQL and updating the live storefront.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={handleCommitImport}
              className="flex items-center gap-2 rounded-xl bg-black dark:bg-[#c8f33b] px-6 py-2.5 text-xs font-bold text-white dark:text-black shadow-xs transition-all hover:opacity-90 dark:hover:bg-[#b5e028] disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Ingesting Batch into Database...</span>
                </>
              ) : (
                <>
                  <FileUp className="h-4 w-4" />
                  <span>Commit {parsedRows.length} Items to Catalog</span>
                </>
              )}
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 shadow-xs">
            <div className="max-h-96 overflow-x-auto overflow-y-auto">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead className="sticky top-0 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 uppercase font-mono text-[11px]">
                  <tr>
                    <th className="px-4 py-3">SKU</th>
                    <th className="px-4 py-3">Product Title</th>
                    <th className="px-4 py-3">Brand</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Selling Price</th>
                    <th className="px-4 py-3">MRP Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Flight Time</th>
                    <th className="px-4 py-3">Transmission</th>
                    <th className="px-4 py-3">Condition</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80 text-zinc-800 dark:text-zinc-200">
                  {parsedRows.slice(0, 20).map((row, index) => (
                    <tr
                      key={index}
                      className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                    >
                      <td className="px-4 py-2.5 font-mono text-zinc-900 dark:text-white font-bold">
                        {row.sku}
                      </td>
                      <td className="px-4 py-2.5 max-w-[260px] truncate font-medium text-zinc-900 dark:text-zinc-100">
                        {row.name}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-xs text-lime-700 dark:text-[#c8f33b] font-bold">
                        {row.brand}
                      </td>
                      <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">
                        {row.categoryName || row.categorySlug}
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-zinc-900 dark:text-white font-mono">
                        ₹{row.basePriceInr.toLocaleString("en-IN")}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-zinc-500">
                        {row.mrpPriceInr ? `₹${row.mrpPriceInr.toLocaleString("en-IN")}` : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono">{row.stockQuantity}</td>
                      <td className="px-4 py-2.5 font-mono text-zinc-600 dark:text-zinc-300">
                        {row.flightTimeMinutes ? `${row.flightTimeMinutes}m` : "—"}
                      </td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-zinc-500 max-w-[150px] truncate">
                        {row.escProtocol || "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {row.isSecondHand ? (
                          <span className="rounded bg-amber-50 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30">
                            Grade {row.cosmeticGrade || "A"} Pre-Owned
                          </span>
                        ) : (
                          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">
                            Brand New
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {parsedRows.length > 20 && (
              <div className="border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950/40 px-4 py-2 text-center text-[11px] text-zinc-500 dark:text-zinc-400">
                Showing first 20 of {parsedRows.length} total rows in preview.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
