"use server";

import { db } from "@/lib/db";
import { orders, products, auditLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function approvePaymentUtr(orderId: string, adminId: string) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      paymentStatus: "paid",
      orderStatus: "processing",
      verifiedAt: new Date(),
      verifiedBy: adminId,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(auditLogs).values({
    adminId,
    action: "PAYMENT_VERIFIED",
    entityName: "orders",
    entityId: orderId,
    payload: { status: "paid" },
  });

  revalidatePath("/admin/payments");
  revalidatePath(`/order/${updatedOrder?.orderReference}`);

  return { success: true, order: updatedOrder };
}

export async function rejectPaymentUtr(
  orderId: string,
  adminId: string,
  reason: string
) {
  const [updatedOrder] = await db
    .update(orders)
    .set({
      paymentStatus: "rejected",
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
    .returning();

  await db.insert(auditLogs).values({
    adminId,
    action: "PAYMENT_REJECTED",
    entityName: "orders",
    entityId: orderId,
    payload: { reason },
  });

  revalidatePath("/admin/payments");

  return { success: true, order: updatedOrder };
}
