import { z } from "zod";

export const bulkSkuRowSchema = z.object({
  sku: z.string().trim().min(2, "SKU is required"),
  name: z.string().trim().min(2, "Product title is required"),
  brand: z.string().trim().default("DJI"),
  categorySlug: z.string().trim().min(2, "Category slug is required"),
  categoryName: z.string().trim().optional(),
  status: z.enum(["active", "draft", "archived"]).default("active"),
  basePriceInr: z.number().positive("Selling price must be greater than zero"),
  mrpPriceInr: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  warrantyMonths: z.number().int().min(0).optional(),
  description: z.string().trim().optional(),
  isSecondHand: z.boolean().default(false),

  // Hardware Engineering Specifications
  weightGrams: z.number().int().positive().optional(),
  flightTimeMinutes: z.number().int().positive().optional(),
  payloadCapacityGrams: z.number().int().min(0).optional(),
  frameSizeMm: z.number().int().positive().optional(),
  inputVoltageLipo: z.string().trim().max(128).optional(),
  motorKv: z.string().trim().max(128).optional(),
  fcFirmware: z.string().trim().max(64).optional(),
  escProtocol: z.string().trim().max(128).optional(), // Video Transmission / Protocol

  // Certified Pre-Owned Inspection Details
  cosmeticGrade: z.enum(["A", "B", "C"]).optional(),
  flightHours: z.number().int().min(0).optional(),
  crashHistory: z.boolean().optional(),
  batteryCycleCount: z.number().int().min(0).optional(),
  includedAccessories: z.array(z.string()).optional(),
  inspectionNotes: z.string().trim().optional(),

  // Cinematic Showcase & Storefront Marketing
  heroBadge: z.string().trim().optional(),
  heroHeadline: z.string().trim().optional(),
  heroSubtitle: z.string().trim().optional(),
  inTheBox: z.string().trim().optional(),
});

export type BulkSkuRow = z.infer<typeof bulkSkuRowSchema>;
