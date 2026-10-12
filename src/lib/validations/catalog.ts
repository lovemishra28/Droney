import { z } from "zod";

export const bulkSkuRowSchema = z.object({
  sku: z.string().trim().min(2, "SKU is required"),
  name: z.string().trim().min(2, "Product title is required"),
  categorySlug: z.string().trim().min(2, "Category slug is required"),
  categoryName: z.string().trim().optional(),
  basePriceInr: z.number().positive("Base price must be greater than zero"),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  description: z.string().trim().optional(),
  isSecondHand: z.boolean().default(false),
  frameSizeMm: z.number().int().positive().optional(),
  weightGrams: z.number().int().positive().optional(),
  inputVoltageLipo: z.string().trim().optional(),
  motorKv: z.string().trim().optional(),
  fcFirmware: z.string().trim().optional(),
  escProtocol: z.string().trim().optional(),
  flightTimeMinutes: z.number().int().positive().optional(),
  payloadCapacityGrams: z.number().int().positive().optional(),
  cosmeticGrade: z.enum(["A", "B", "C"]).optional(),
  flightHours: z.number().int().min(0).optional(),
  crashHistory: z.boolean().optional(),
  batteryCycleCount: z.number().int().min(0).optional(),
  includedAccessories: z.array(z.string()).optional(),
  inspectionNotes: z.string().trim().optional(),
});

export type BulkSkuRow = z.infer<typeof bulkSkuRowSchema>;
