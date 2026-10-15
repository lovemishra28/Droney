export type {
  User,
  NewUser,
  Category,
  NewCategory,
  Product,
  NewProduct,
  DroneSpecification,
  NewDroneSpecification,
  SecondHandDetail,
  NewSecondHandDetail,
  ProductMedia,
  NewProductMedia,
  Order,
  NewOrder,
  OrderItem,
  NewOrderItem,
  StockReservation,
  NewStockReservation,
  AuditLog,
  NewAuditLog,
  ShippingAddressPayload,
} from "@/lib/db/schema";

import type {
  Category,
  Product,
  DroneSpecification,
  SecondHandDetail,
  ProductMedia,
  ShippingAddressPayload,
} from "@/lib/db/schema";

// Shared Domain Enums & Interfaces
export type UserRole = "customer" | "admin";
export type ProductStatus = "active" | "draft" | "archived";
export type CosmeticGrade = "A" | "B" | "C";
export type MediaType = "image" | "video";
export type StorageProvider = "r2" | "bunny";
export type PaymentStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "paid"
  | "rejected";
export type OrderStatus =
  "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type ShippingAddress = ShippingAddressPayload;

// Enriched Product Type for Storefront & PDP
export interface EnrichedProduct extends Product {
  category?: Category | null;
  specifications?: DroneSpecification | null;
  secondHand?: SecondHandDetail | null;
  media: ProductMedia[];
}

// Storefront Cart Item
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  basePricePaise: number;
  quantity: number;
  thumbnailUrl: string;
  isSecondHand: boolean;
}
