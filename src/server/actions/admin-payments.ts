"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, gte, inArray, ne, or, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  auditLogs,
  orderItems,
  orders,
  products,
  stockReservations,
} from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import { sendOrderAlertSms } from "@/lib/sms";
import { sendTransactionalEmail } from "@/lib/email";
import { formatINR } from "@/lib/utils";
import type { ActionResponse } from "@/server/actions/auth";

const approvePaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
});

const rejectPaymentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  reason: z
    .string()
    .trim()
    .min(5, "Rejection reason must be at least 5 characters")
    .max(255, "Rejection reason cannot exceed 255 characters"),
});

/**
 * Approves a pending direct UPI transaction:
 * 1. Transitions payment_status to 'paid' and order_status to 'processing' idempotently.
 * 2. Permanently decrements physical product stock in PostgreSQL with non-negative guard.
 * 3. Clears temporary inventory reservations scoped to this order.
 * 4. Records an immutable administrative audit log.
 * 5. Dispatches customer confirmation SMS & Email.
 */
export async function approvePaymentAction(
  rawInput: z.infer<typeof approvePaymentSchema>
): Promise<ActionResponse> {
  const session = await requireAdminSession();

  const parsed = approvePaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid payload.",
    };
  }

  const { orderId } = parsed.data;

  try {
    const targetOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        user: true,
      },
    });

    if (!targetOrder) {
      return { success: false, message: "Order record not found." };
    }

    if (targetOrder.paymentStatus === "paid") {
      return {
        success: false,
        message: "Payment for this order has already been approved.",
      };
    }

    // Execute atomic reconciliation transaction
    await db.transaction(async (tx) => {
      // 1. Idempotently update Order Status (conditional on paymentStatus != 'paid')
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          paymentStatus: "paid",
          orderStatus: "processing",
          verifiedAt: new Date(),
          verifiedBy: session.sub,
          updatedAt: new Date(),
        })
        .where(and(eq(orders.id, orderId), ne(orders.paymentStatus, "paid")))
        .returning();

      if (!updatedOrder) {
        return;
      }

      // 2. Permanently decrement physical stock & purge reservation locks
      for (const item of targetOrder.items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(products.id, item.productId),
              gte(products.stockQuantity, item.quantity)
            )
          );

        await tx
          .delete(stockReservations)
          .where(
            and(
              eq(stockReservations.productId, item.productId),
              or(
                eq(stockReservations.orderId, targetOrder.id),
                eq(stockReservations.userId, targetOrder.userId)
              )
            )
          );
      }

      // 3. Append Audit Trail
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "PAYMENT_APPROVED",
        entityName: "orders",
        entityId: orderId,
        payload: {
          orderReference: targetOrder.orderReference,
          upiTransactionId: targetOrder.upiTransactionId,
          totalAmountPaise: targetOrder.totalAmountPaise,
        },
      });
    });

    // 4. Invalidate Edge Caching for Stock and Order Screens
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath(`/order/${targetOrder.orderReference}`);
    const purge = revalidateTag as (tag: string, profile?: any) => void;
    purge("catalog");

    // 5. Customer Notification Dispatch (DRN-050)
    const customer = targetOrder.user;
    const amountStr = formatINR(targetOrder.totalAmountPaise);

    if (customer?.phone) {
      void sendOrderAlertSms(
        customer.phone,
        `Payment of ${amountStr} for Order #${targetOrder.orderReference} has been verified. Your drone package is now preparing for air dispatch.`
      );
    }

    if (customer?.email) {
      void sendTransactionalEmail({
        toEmail: customer.email,
        subject: `Payment Approved for Order #${targetOrder.orderReference}`,
        heading: "Payment Verified & Order Confirmed",
        body: `Your UPI payment for Order #${targetOrder.orderReference} (${amountStr}) has been approved. Tracking details will follow shortly upon dispatch.`,
        orderReference: targetOrder.orderReference,
      });
    }

    return {
      success: true,
      message: `Order #${targetOrder.orderReference} approved successfully.`,
    };
  } catch (error) {
    console.error("[Payment Approval Error]:", error);
    return {
      success: false,
      message: "An unexpected error occurred while approving payment.",
    };
  }
}

/**
 * Rejects an invalid or fraudulent UTR submission:
 * 1. Transitions payment_status to 'rejected' idempotently.
 * 2. Restocks products if the order was previously marked 'paid'.
 * 3. Releases held inventory strictly scoped to this order (DRN-030).
 * 4. Records administrative audit log with the provided rejection reason.
 * 5. Notifies the customer via SMS/Email prompting UTR re-submission.
 */
export async function rejectPaymentAction(
  rawInput: z.infer<typeof rejectPaymentSchema>
): Promise<ActionResponse> {
  const session = await requireAdminSession();

  const parsed = rejectPaymentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid payload.",
    };
  }

  const { orderId, reason } = parsed.data;

  try {
    const targetOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        items: true,
        user: true,
      },
    });

    if (!targetOrder) {
      return { success: false, message: "Order not found." };
    }

    if (targetOrder.paymentStatus === "rejected") {
      return {
        success: false,
        message: "Payment for this order has already been marked as rejected.",
      };
    }

    // Execute atomic rejection transaction
    await db.transaction(async (tx) => {
      // 1. Update Order Status to 'rejected' idempotently
      const [updatedOrder] = await tx
        .update(orders)
        .set({
          paymentStatus: "rejected",
          verifiedAt: new Date(),
          verifiedBy: session.sub,
          updatedAt: new Date(),
        })
        .where(
          and(eq(orders.id, orderId), ne(orders.paymentStatus, "rejected"))
        )
        .returning();

      if (!updatedOrder) {
        return;
      }

      // If previous status was 'paid', stock was already decremented - restock!
      if (targetOrder.paymentStatus === "paid") {
        for (const item of targetOrder.items) {
          await tx
            .update(products)
            .set({
              stockQuantity: sql`${products.stockQuantity} + ${item.quantity}`,
              updatedAt: new Date(),
            })
            .where(eq(products.id, item.productId));
        }
      }

      // 2. Release temporary reservations strictly scoped to this order (DRN-030)
      await tx
        .delete(stockReservations)
        .where(
          or(
            eq(stockReservations.orderId, targetOrder.id),
            and(
              eq(stockReservations.userId, targetOrder.userId),
              inArray(
                stockReservations.productId,
                targetOrder.items.map((i) => i.productId)
              )
            )
          )
        );

      // 3. Log Audit Record
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "PAYMENT_REJECTED",
        entityName: "orders",
        entityId: orderId,
        payload: {
          orderReference: targetOrder.orderReference,
          submittedUtr: targetOrder.upiTransactionId,
          reason,
        },
      });
    });

    // 4. Invalidate Cache
    revalidatePath("/admin/payments");
    revalidatePath("/admin");
    revalidatePath(`/order/${targetOrder.orderReference}`);
    const purge = revalidateTag as (tag: string, profile?: any) => void;
    purge("catalog");

    // 5. Customer Notification Dispatch (DRN-050)
    const customer = targetOrder.user;

    if (customer?.phone) {
      void sendOrderAlertSms(
        customer.phone,
        `Payment verification issue for Order #${targetOrder.orderReference}: ${reason}. Please log in to re-submit your valid 12-digit UTR.`
      );
    }

    if (customer?.email) {
      void sendTransactionalEmail({
        toEmail: customer.email,
        subject: `Payment Verification Issue - Order #${targetOrder.orderReference}`,
        heading: "Payment Verification Issue",
        body: `Your payment for Order #${targetOrder.orderReference} could not be verified. Reason: "${reason}". Please visit your order tracking page to enter the correct transaction reference.`,
        orderReference: targetOrder.orderReference,
      });
    }

    return {
      success: true,
      message: `Order #${targetOrder.orderReference} marked as rejected. Stock hold released.`,
    };
  } catch (error) {
    console.error("[Payment Rejection Error]:", error);
    return {
      success: false,
      message: "An unexpected error occurred while rejecting payment.",
    };
  }
}
