import type { Order, OrderItem, ShippingAddress } from "./index";

export type OrderStatus =
  "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentStatus =
  | "pending_payment"
  | "awaiting_verification"
  | "paid"
  | "rejected";

export const COURIER_PARTNERS = [
  "Delhivery",
  "Blue Dart",
  "DTDC",
  "Xpressbees",
  "India Post Speed Post",
] as const;

export type CourierPartner = (typeof COURIER_PARTNERS)[number];

export interface CheckoutInput {
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  shippingAddress: ShippingAddress;
}

export interface UtrSubmissionInput {
  orderReference: string;
  upiTransactionId: string;
  paymentScreenshotUrl?: string;
}

export interface OrderWithDetails extends Order {
  items: OrderItem[];
}
