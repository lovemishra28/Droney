import { and, count, desc, eq, ilike, isNotNull, lte, ne, or, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { auditLogs, inquiries, orders, products, users } from "@/lib/db/schema";
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
  pendingInquiriesCount: number;
  pendingConsultationsCount: number;
  totalInquiriesCount: number;
  recentOrders: Array<{
    id: string;
    orderReference: string;
    customerName: string;
    customerPhone: string | null;
    totalAmountPaise: number;
    paymentStatus: "pending_payment" | "awaiting_verification" | "paid" | "rejected";
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

    // 5. Inquiries Telemetry (Focus on Pilot Consultations)
    const [
      pendingConsultationsResult,
      totalConsultationsResult,
    ] = await Promise.all([
      db
        .select({ total: count() })
        .from(inquiries)
        .where(and(eq(inquiries.type, "consultation"), eq(inquiries.status, "new"))),
      db
        .select({ total: count() })
        .from(inquiries)
        .where(eq(inquiries.type, "consultation")),
    ]);

    const pendingConsultationsCount = pendingConsultationsResult[0]?.total ?? 0;
    const totalInquiriesCount = totalConsultationsResult[0]?.total ?? 0;
    const pendingInquiriesCount = pendingConsultationsCount;

    // 6. Recent 6 Orders
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
      paymentStatus: ord.paymentStatus as
        | "pending_payment"
        | "awaiting_verification"
        | "paid"
        | "rejected",
      orderStatus: ord.orderStatus as "placed" | "processing" | "shipped" | "delivered" | "cancelled",
      createdAt: ord.createdAt,
    }));

    return {
      totalRevenuePaise,
      pendingPaymentApprovalsCount,
      activeSkuCount,
      lowStockSkuCount,
      pendingInquiriesCount,
      pendingConsultationsCount,
      totalInquiriesCount,
      recentOrders,
    };
  } catch (error) {
    console.error("[Admin Metrics Error]:", error);
    return {
      totalRevenuePaise: 0,
      pendingPaymentApprovalsCount: 0,
      activeSkuCount: 0,
      lowStockSkuCount: 0,
      pendingInquiriesCount: 0,
      pendingConsultationsCount: 0,
      totalInquiriesCount: 0,
      recentOrders: [],
    };
  }
}

export interface AdminInquiryRecord {
  id: string;
  type: string;
  fullName: string | null;
  email: string | null;
  phone: string | null;
  payload: Record<string, unknown> | null;
  status: string;
  createdAt: Date;
}

/**
 * Retrieves customer pilot consultation and custom build inquiries with filters and search.
 */
export async function getAdminInquiries(filters?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<AdminInquiryRecord[]> {
  await requireAdminSession();

  try {
    const conditions = [ne(inquiries.type, "trade_in")];

    if (filters?.type && filters.type !== "all") {
      conditions.push(eq(inquiries.type, filters.type));
    }

    if (filters?.status && filters.status !== "all") {
      conditions.push(eq(inquiries.status, filters.status));
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const term = `%${filters.search.trim()}%`;
      const searchMatch = or(
        ilike(inquiries.fullName, term),
        ilike(inquiries.phone, term),
        ilike(inquiries.email, term)
      );
      if (searchMatch) {
        conditions.push(searchMatch);
      }
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(inquiries)
      .where(whereClause)
      .orderBy(desc(inquiries.createdAt));

    return rows.map((r) => ({
      id: r.id,
      type: r.type,
      fullName: r.fullName,
      email: r.email,
      phone: r.phone,
      payload: (r.payload as Record<string, unknown>) || {},
      status: r.status,
      createdAt: r.createdAt,
    }));
  } catch (error) {
    console.error("[Admin Inquiries Query Error]:", error);
    return [];
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

