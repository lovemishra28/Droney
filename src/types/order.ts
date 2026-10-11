import type { Order, OrderItem, ShippingAddress } from "./index";

export type OrderStatus =
  "placed" | "processing" | "shipped" | "delivered" | "cancelled";

export type PaymentStatus = "awaiting_verification" | "paid" | "rejected";

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
