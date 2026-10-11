import { db } from "@/lib/db";
import { orders, products, auditLogs } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";

export async function getAdminOverview() {
  const [totalProducts] = await db.select({ count: count() }).from(products);

  const pendingPayments = await db
    .select()
    .from(orders)
    .where(eq(orders.paymentStatus, "awaiting_verification"))
    .orderBy(desc(orders.createdAt))
    .limit(10);

  return {
    productCount: totalProducts?.count || 0,
    pendingPayments,
  };
}

export async function getRecentAuditLogs(limit: number = 50) {
  return await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}
