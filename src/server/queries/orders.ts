import { and, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, productMedia, products } from "@/lib/db/schema";
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
      where: eq(orders.userId, session.sub),
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
