"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, orders, products, stockReservations } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import { sendOrderAlertSms } from "@/lib/sms";
import { sendTransactionalEmail } from "@/lib/email";
import type { ActionResponse } from "@/server/actions/auth";

const purge = revalidateTag as (tag: string, profile?: any) => void;

export const COURIER_PARTNERS = [
  "Delhivery",
  "Blue Dart",
  "DTDC",
  "Xpressbees",
  "India Post Speed Post",
] as const;

const updateFulfillmentSchema = z.object({
  orderId: z.string().uuid("Invalid order ID"),
  orderStatus: z.enum([
    "placed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ]),
  courierPartner: z.enum(COURIER_PARTNERS).optional(),
  trackingAwb: z
    .string()
    .trim()
    .min(5, "Tracking AWB must be at least 5 alphanumeric characters")
    .max(50, "Tracking AWB cannot exceed 50 characters")
    .optional(),
});

/**
 * Updates order dispatch status and links courier tracking identifiers.
 * Automatically notifies the customer via SMS & Email when transitioned to 'shipped'.
 * Safely restocks inventory and releases reservations if transitioned to 'cancelled' (DRN-012).
 */
export async function updateOrderFulfillmentAction(
  rawInput: z.infer<typeof updateFulfillmentSchema>
): Promise<ActionResponse> {
  const session = await requireAdminSession();

  const parsed = updateFulfillmentSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid fulfillment payload.",
    };
  }

  const { orderId, orderStatus, courierPartner, trackingAwb } = parsed.data;

  try {
    const targetOrder = await db.query.orders.findFirst({
      where: eq(orders.id, orderId),
      with: {
        user: true,
        items: true,
      },
    });

    if (!targetOrder) {
      return { success: false, message: "Order not found." };
    }

    if (orderStatus === "shipped" && (!courierPartner || !trackingAwb)) {
      return {
        success: false,
        message: "Both courier partner and tracking AWB are mandatory when marking an order as shipped.",
      };
    }

    await db.transaction(async (tx) => {
      // 1. Update Order Record
      await tx
        .update(orders)
        .set({
          orderStatus,
          courierPartner: courierPartner || targetOrder.courierPartner,
          trackingAwb: trackingAwb || targetOrder.trackingAwb,
          updatedAt: new Date(),
        })
        .where(eq(orders.id, orderId));

      // 2. If cancelled and previously paid, restock products (DRN-012)
      if (
        orderStatus === "cancelled" &&
        targetOrder.orderStatus !== "cancelled"
      ) {
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

        // Release any reservations tied to this order
        await tx
          .delete(stockReservations)
          .where(eq(stockReservations.orderId, targetOrder.id));
      }

      // 3. Append Audit Entry
      await tx.insert(auditLogs).values({
        adminId: session.sub,
        action: "ORDER_FULFILLMENT_UPDATED",
        entityName: "orders",
        entityId: orderId,
        payload: {
          orderReference: targetOrder.orderReference,
          previousStatus: targetOrder.orderStatus,
          newStatus: orderStatus,
          courierPartner,
          trackingAwb,
        },
      });
    });

    // 4. Purge Cache Targets
    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath(`/order/${targetOrder.orderReference}`);
    purge("orders");
    purge("catalog");

    // 5. Automated Customer Notifications (DRN-050)
    if (orderStatus === "shipped" && targetOrder.user) {
      const customer = targetOrder.user;
      const ref = targetOrder.orderReference;
      const partner = courierPartner || targetOrder.courierPartner || "Air Courier";
      const awb = trackingAwb || targetOrder.trackingAwb;

      if (customer.phone) {
        void sendOrderAlertSms(
          customer.phone,
          `Your AeroStore Drone Order #${ref} has shipped via ${partner} (AWB: ${awb}). Track your shipment online.`
        );
      }

      if (customer.email) {
        void sendTransactionalEmail({
          toEmail: customer.email,
          subject: `Order #${ref} Shipped via ${partner}`,
          heading: "Your Order is on the Way",
          body: `Your order #${ref} has been dispatched via ${partner} with tracking number ${awb}. View live progress on your order tracking page.`,
          orderReference: ref,
        });
      }
    } else if (orderStatus === "cancelled" && targetOrder.user) {
      const customer = targetOrder.user;
      const ref = targetOrder.orderReference;

      if (customer.phone) {
        void sendOrderAlertSms(
          customer.phone,
          `Your Order #${ref} has been cancelled. If payment was verified, our support team will process your refund shortly.`
        );
      }

      if (customer.email) {
        void sendTransactionalEmail({
          toEmail: customer.email,
          subject: `Order #${ref} Cancelled`,
          heading: "Order Cancelled",
          body: `Your Order #${ref} has been cancelled. If payment was verified, our support team will process your refund shortly.`,
          orderReference: ref,
        });
      }
    }

    return {
      success: true,
      message: `Order #${targetOrder.orderReference} updated to "${orderStatus}".`,
    };
  } catch (error) {
    console.error("[Fulfillment Mutation Error]:", error);
    return {
      success: false,
      message: "An unexpected error occurred while updating order fulfillment.",
    };
  }
}
