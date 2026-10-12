import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { orders, productMedia } from "@/lib/db/schema";
import { getCurrentSession } from "@/server/services/session";

/**
 * Resolves a full order record by reference number for the authenticated buyer or an admin.
 */
export async function getOrderByReference(orderReference: string) {
  const session = await getCurrentSession();
  if (!session) return null;

  try {
    const orderRecord = await db.query.orders.findFirst({
      where: eq(orders.orderReference, orderReference),
      with: {
        items: {
          with: {
            product: {
              with: {
                media: {
                  where: eq(productMedia.mediaType, "image"),
                  orderBy: [productMedia.displayOrder],
                  limit: 1,
                },
              },
            },
          },
        },
      },
    });

    if (!orderRecord) return null;

    // Authorization check: allow only the order owner or administrative staff
    if (orderRecord.userId !== session.sub && session.role !== "admin") {
      return null;
    }

    return orderRecord;
  } catch (error) {
    console.error("[Orders Query Error] Failed to fetch order by reference:", error);
    return null;
  }
}

/**
 * Fetches recent orders for the currently authenticated customer.
 */
export async function getUserOrders() {
  const session = await getCurrentSession();
  if (!session) return [];

  try {
    return await db.query.orders.findMany({
      // An order is customer-visible only after the customer submits a UTR.
      // The initial checkout row is only a temporary inventory/payment attempt.
      where: and(
        eq(orders.userId, session.sub),
        isNotNull(orders.upiTransactionId)
      ),
      orderBy: [desc(orders.createdAt)],
      with: {
        items: true,
      },
    });
  } catch (error) {
    console.error("[Orders Query Error] Failed to fetch user orders:", error);
    return [];
  }
}
