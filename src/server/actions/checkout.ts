"use server";

import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { reserveStock } from "@/server/services/inventory";
import type { ShippingAddress } from "@/types";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

interface CheckoutItemPayload {
  productId: string;
  quantity: number;
}

export async function initiateCheckout(
  userId: string,
  items: CheckoutItemPayload[],
  shippingAddress: ShippingAddress
) {
  // 1. Reserve stock atomically with row lock for all items
  for (const item of items) {
    await reserveStock(item.productId, userId, item.quantity);
  }

  // 2. Compute total amount
  let totalPaise = 0;
  const itemRecords: Array<{
    productId: string;
    quantity: number;
    unitPricePaise: number;
    title: string;
    isSecondHand: boolean;
  }> = [];

  for (const item of items) {
    const [p] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (!p) throw new Error(`Product not found: ${item.productId}`);

    totalPaise += p.basePricePaise * item.quantity;
    itemRecords.push({
      productId: p.id,
      quantity: item.quantity,
      unitPricePaise: p.basePricePaise,
      title: p.name,
      isSecondHand: p.isSecondHand,
    });
  }

  // 3. Create Order
  const orderRef = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;

  const [createdOrder] = await db
    .insert(orders)
    .values({
      orderReference: orderRef,
      userId,
      totalAmountPaise: totalPaise,
      shippingAddress,
      paymentMethod: "upi_qr",
      paymentStatus: "awaiting_verification",
      orderStatus: "placed",
    })
    .returning();

  // 4. Create Order Items
  for (const item of itemRecords) {
    await db.insert(orderItems).values({
      orderId: createdOrder.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      title: item.title,
      isSecondHand: item.isSecondHand,
    });
  }

  return { success: true, order: createdOrder };
}

export async function submitOrderUtr(
  orderReference: string,
  upiTransactionId: string,
  paymentScreenshotUrl?: string
) {
  // Check 12-digit UTR
  if (!/^\d{12}$/.test(upiTransactionId)) {
    throw new Error("UTR must be a valid 12-digit reference number.");
  }

  const [updatedOrder] = await db
    .update(orders)
    .set({
      upiTransactionId,
      paymentScreenshotUrl: paymentScreenshotUrl || null,
      paymentStatus: "awaiting_verification",
      updatedAt: new Date(),
    })
    .where(eq(orders.orderReference, orderReference))
    .returning();

  if (!updatedOrder) {
    throw new Error("Order not found");
  }

  revalidatePath(`/order/${orderReference}`);
  return { success: true, order: updatedOrder };
}
