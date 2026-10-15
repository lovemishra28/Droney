import { and, eq, gt, gte, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, stockReservations } from "@/lib/db/schema";

export interface ReservationLineItem {
  productId: string;
  quantity: number;
}

export type ReservationResult =
  | { success: true; reservationIds: string[]; expiresAt: Date }
  | {
      success: false;
      error: string;
      unavailableProductId?: string;
      requestedQuantity?: number;
      availableQuantity?: number;
    };

const RESERVATION_WINDOW_MINUTES = 10; // 10-minute hold window for UPI payment completion

/**
 * Atomically verifies physical inventory and reserves stock using PostgreSQL row locks.
 * Uses SELECT ... FOR UPDATE within a transaction to eliminate concurrent race conditions.
 */
export async function reserveInventoryForCheckout(
  userId: string,
  items: ReservationLineItem[],
  orderId?: string
): Promise<ReservationResult> {
  if (!items || items.length === 0) {
    return { success: false, error: "Cart contains no line items to reserve." };
  }

  const expiresAt = new Date(
    Date.now() + RESERVATION_WINDOW_MINUTES * 60 * 1000
  );

  try {
    return await db.transaction(async (tx) => {
      const createdReservationIds: string[] = [];

      for (const item of items) {
        // 1. Acquire an exclusive row lock on the target product
        const [lockedProduct] = await tx
          .select({
            id: products.id,
            name: products.name,
            stockQuantity: products.stockQuantity,
            status: products.status,
          })
          .from(products)
          .where(eq(products.id, item.productId))
          .for("update"); // Appends FOR UPDATE to lock row until transaction commits

        if (!lockedProduct || lockedProduct.status !== "active") {
          return {
            success: false,
            error: "Product is unavailable or archived.",
            unavailableProductId: item.productId,
          };
        }

        // 2. Calculate concurrent active holds from other buyers (excluding current user)
        const activeOtherHoldsResult = await tx
          .select({
            reservedCount: sql<number>`COALESCE(SUM(${stockReservations.quantity}), 0)::int`,
          })
          .from(stockReservations)
          .where(
            and(
              eq(stockReservations.productId, item.productId),
              gt(stockReservations.reservedUntil, new Date()),
              sql`${stockReservations.userId} != ${userId}`
            )
          );

        const currentActiveHolds =
          activeOtherHoldsResult[0]?.reservedCount ?? 0;
        const availableStock = lockedProduct.stockQuantity - currentActiveHolds;

        // 3. Reject if available quantity is insufficient
        if (availableStock < item.quantity) {
          return {
            success: false,
            error: `Insufficient stock for "${lockedProduct.name}". Only ${Math.max(
              0,
              availableStock
            )} unit(s) remaining.`,
            unavailableProductId: item.productId,
            requestedQuantity: item.quantity,
            availableQuantity: Math.max(0, availableStock),
          };
        }

        // 4. Clear any stale reservation the user had previously for this product
        await tx
          .delete(stockReservations)
          .where(
            and(
              eq(stockReservations.productId, item.productId),
              eq(stockReservations.userId, userId)
            )
          );

        // 5. Insert new 10-minute hold record
        const [reservation] = await tx
          .insert(stockReservations)
          .values({
            orderId: orderId || null,
            productId: item.productId,
            userId,
            quantity: item.quantity,
            reservedUntil: expiresAt,
          })
          .returning({ id: stockReservations.id });

        createdReservationIds.push(reservation.id);
      }

      return {
        success: true,
        reservationIds: createdReservationIds,
        expiresAt,
      };
    });
  } catch (error) {
    console.error("[Inventory Lock Exception]:", error);
    return {
      success: false,
      error:
        "Unable to lock inventory due to a high-concurrency event. Please retry.",
    };
  }
}

/**
 * Permanently decrements physical stock and clears temporary holds when payment is verified.
 */
export async function commitStockReservation(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  userId: string,
  items: ReservationLineItem[],
  orderId?: string
): Promise<void> {
  for (const item of items) {
    // Decrement physical stock count safely
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

    // Release temporary reservation record
    if (orderId) {
      await tx
        .delete(stockReservations)
        .where(
          and(
            eq(stockReservations.productId, item.productId),
            eq(stockReservations.orderId, orderId)
          )
        );
    } else {
      await tx
        .delete(stockReservations)
        .where(
          and(
            eq(stockReservations.productId, item.productId),
            eq(stockReservations.userId, userId)
          )
        );
    }
  }
}

/**
 * Releases reserved holds if the buyer cancels or payment is rejected.
 */
export async function releaseUserReservations(
  userId: string,
  productIds?: string[],
  orderId?: string
): Promise<void> {
  if (orderId) {
    await db
      .delete(stockReservations)
      .where(eq(stockReservations.orderId, orderId));
  } else if (productIds && productIds.length > 0) {
    await db
      .delete(stockReservations)
      .where(
        and(
          eq(stockReservations.userId, userId),
          inArray(stockReservations.productId, productIds)
        )
      );
  } else {
    await db
      .delete(stockReservations)
      .where(eq(stockReservations.userId, userId));
  }
}

/**
 * Sweeps and purges expired reservations back to public inventory.
 */
export async function purgeExpiredReservations(): Promise<number> {
  const result = await db
    .delete(stockReservations)
    .where(lt(stockReservations.reservedUntil, new Date()))
    .returning({ id: stockReservations.id });

  return result.length;
}

// Backward-compatible wrappers
export async function reserveStock(
  productId: string,
  userId: string,
  quantity: number
) {
  const res = await reserveInventoryForCheckout(userId, [
    { productId, quantity },
  ]);
  if (!res.success) {
    throw new Error(res.error);
  }
  return res;
}

export const releaseExpiredReservations = purgeExpiredReservations;
