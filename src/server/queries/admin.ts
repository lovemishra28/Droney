import { and, count, desc, eq, isNotNull, lte, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, orders, products, users } from "@/lib/db/schema";
import { getCurrentSession } from "@/server/services/session";

/**
 * Server-side RBAC guard ensuring the caller possesses an active admin session.
 */
export async function requireAdminSession() {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    redirect("/login?callbackUrl=/admin");
  }

  // Do not trust a long-lived role claim after the backing user has been
  // deleted or the app has been pointed at a different database.
  const adminUser = await db.query.users.findFirst({
    where: and(eq(users.id, session.sub), eq(users.role, "admin")),
    columns: { id: true },
  });

  if (!adminUser) {
    redirect("/login?callbackUrl=/admin");
  }

  return session;
}

export interface AdminMetricsSummary {
  totalRevenuePaise: number;
  pendingPaymentApprovalsCount: number;
  activeSkuCount: number;
  lowStockSkuCount: number;
  recentOrders: Array<{
    id: string;
    orderReference: string;
    customerName: string;
    customerPhone: string | null;
    totalAmountPaise: number;
    paymentStatus: "awaiting_verification" | "paid" | "rejected";
    orderStatus: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
    createdAt: Date;
  }>;
}

/**
 * Gathers executive telemetry metrics for the admin overview screen.
 */
export async function getAdminOverviewMetrics(): Promise<AdminMetricsSummary> {
  await requireAdminSession();

  try {
    // 1. Total Verified Revenue (Sum of orders marked 'paid')
    const revenueResult = await db
      .select({
        total: sql<number>`COALESCE(SUM(${orders.totalAmountPaise}), 0)::bigint`,
      })
      .from(orders)
      .where(eq(orders.paymentStatus, "paid"));

    const totalRevenuePaise = Number(revenueResult[0]?.total ?? 0);

    // 2. Pending UPI Verifications (Awaiting bank UTR confirmation)
    const pendingApprovalsResult = await db
      .select({ total: count() })
      .from(orders)
      .where(
        and(
          eq(orders.paymentStatus, "awaiting_verification"),
          isNotNull(orders.upiTransactionId)
        )
      );

    const pendingPaymentApprovalsCount = pendingApprovalsResult[0]?.total ?? 0;

    // 3. Active SKUs Count
    const activeProductsResult = await db
      .select({ total: count() })
      .from(products)
      .where(eq(products.status, "active"));

    const activeSkuCount = activeProductsResult[0]?.total ?? 0;

    // 4. Low-Stock SKUs (3 units or fewer remaining)
    const lowStockResult = await db
      .select({ total: count() })
      .from(products)
      .where(and(eq(products.status, "active"), lte(products.stockQuantity, 3)));

    const lowStockSkuCount = lowStockResult[0]?.total ?? 0;

    // 5. Recent 6 Orders
    const rawOrders = await db.query.orders.findMany({
      where: isNotNull(orders.upiTransactionId),
      orderBy: [desc(orders.createdAt)],
      limit: 6,
      with: {
        user: {
          columns: { fullName: true, phone: true },
        },
      },
    });

    const recentOrders = rawOrders.map((ord) => ({
      id: ord.id,
      orderReference: ord.orderReference,
      customerName: ord.user?.fullName || "Guest Customer",
      customerPhone: ord.user?.phone || null,
      totalAmountPaise: ord.totalAmountPaise,
      paymentStatus: ord.paymentStatus as "awaiting_verification" | "paid" | "rejected",
      orderStatus: ord.orderStatus as "placed" | "processing" | "shipped" | "delivered" | "cancelled",
      createdAt: ord.createdAt,
    }));

    return {
      totalRevenuePaise,
      pendingPaymentApprovalsCount,
      activeSkuCount,
      lowStockSkuCount,
      recentOrders,
    };
  } catch (error) {
    console.error("[Admin Metrics Error]:", error);
    return {
      totalRevenuePaise: 0,
      pendingPaymentApprovalsCount: 0,
      activeSkuCount: 0,
      lowStockSkuCount: 0,
      recentOrders: [],
    };
  }
}

/**
 * Historical audit log helper for admin trail review
 */
export async function getRecentAuditLogs(limit: number = 50) {
  try {
    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  } catch (error) {
    console.error("[Audit Logs Query Error]:", error);
    return [];
  }
}
