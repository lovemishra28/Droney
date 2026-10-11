import type {
  Product,
  Category,
  SecondHandDetail,
  ProductMedia,
  CosmeticGrade,
  ProductStatus,
} from "./index";

export type { CosmeticGrade, ProductStatus };

export type {
  CatalogFilterParams,
  PaginatedResult,
} from "@/server/queries/catalog";

export interface CatalogProductItem extends Product {
  category?: Category | null;
  primaryMedia?: ProductMedia | null;
  secondHandDetails?: SecondHandDetail | null;
}
