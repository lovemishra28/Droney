import { db } from "@/lib/db";
import { products, stockReservations } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function reserveStock(
  productId: string,
  userId: string,
  quantity: number
) {
  return await db.transaction(async (tx) => {
    // Row-locking check via FOR UPDATE
    const [product] = await tx
      .select({
        id: products.id,
        stockQuantity: products.stockQuantity,
      })
      .from(products)
      .where(eq(products.id, productId))
      .for("update");

    if (!product || product.stockQuantity < quantity) {
      throw new Error("Insufficient stock available for reservation");
    }

    const tenMinutesFromNow = new Date(Date.now() + 10 * 60 * 1000);

    const [reservation] = await tx
      .insert(stockReservations)
      .values({
        productId,
        userId,
        quantity,
        reservedUntil: tenMinutesFromNow,
      })
      .returning();

    return reservation;
  });
}

export async function releaseExpiredReservations() {
  const now = new Date();
  return await db
    .delete(stockReservations)
    .where(sql`${stockReservations.reservedUntil} < ${now}`)
    .returning();
}
