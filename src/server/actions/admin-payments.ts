"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
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
import { sendOtpSms } from "@/lib/sms";
import { sendOtpEmail } from "@/lib/email";
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
 * 1. Transitions payment_status to 'paid' and order_status to 'processing'.
 * 2. Permanently decrements physical product stock in PostgreSQL.
 * 3. Clears temporary inventory reservations.
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
      // 1. Update Order Status
      await tx
        .update(orders)
        .set({
          paymentStatus: "paid",
          orderStatus: "processing",
          verifiedAt: new Date(),
          verifiedBy: session.sub,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 2. Permanently decrement physical stock & purge reservation locks
      for (const item of targetOrder.items) {
        await tx
          .update(products)
          .set({
            stockQuantity: sql`${products.stockQuantity} - ${item.quantity}`,
            updatedAt: new Date(),
          })
          .where(eq(products.id, item.productId));

        await tx
          .delete(stockReservations)
          .where(
            and(
              eq(stockReservations.productId, item.productId),
              eq(stockReservations.userId, targetOrder.userId)
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

    // 5. Customer Notification Dispatch
    const customer = targetOrder.user;
    const amountStr = formatINR(targetOrder.totalAmountPaise);

    if (customer.phone) {
      void sendOtpSms(
        customer.phone,
        `Payment of ${amountStr} for Order #${targetOrder.orderReference} has been verified. Your drone package is now preparing for air dispatch.`
      );
    }

    if (customer.email) {
      void sendOtpEmail(
        customer.email,
        `Your UPI payment for Order #${targetOrder.orderReference} (${amountStr}) has been approved. Tracking details will follow shortly upon dispatch.`
      );
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
 * 1. Transitions payment_status to 'rejected'.
 * 2. Releases held inventory back to public stock immediately.
 * 3. Records administrative audit log with the provided rejection reason.
 * 4. Notifies the customer via SMS/Email prompting UTR re-submission.
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

    // Execute atomic rejection transaction
    await db.transaction(async (tx) => {
      // 1. Update Order Status to 'rejected'
      await tx
        .update(orders)
        .set({
          paymentStatus: "rejected",
          verifiedAt: new Date(),
          verifiedBy: session.sub,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 2. Release temporary reservations so items become available to other buyers
      await tx
        .delete(stockReservations)
        .where(eq(stockReservations.userId, targetOrder.userId));

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

    // 5. Customer Notification Dispatch
    const customer = targetOrder.user;

    if (customer.phone) {
      void sendOtpSms(
        customer.phone,
        `Payment verification issue for Order #${targetOrder.orderReference}: ${reason}. Please log in to re-submit your valid 12-digit UTR.`
      );
    }

    if (customer.email) {
      void sendOtpEmail(
        customer.email,
        `Your payment for Order #${targetOrder.orderReference} could not be verified. Reason: "${reason}". Please visit your order tracking page to enter the correct transaction reference.`
      );
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
