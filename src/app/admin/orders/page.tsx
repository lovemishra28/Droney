import React from "react";
import { desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  orders,
  type Order,
  type OrderItem,
  type User,
} from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import {
  OrderFulfillmentManager,
  type AdminOrderRecord,
} from "@/components/admin/order-fulfillment-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminSession();

  type AdminOrderQueryRecord = Order & {
    user: Pick<User, "fullName" | "phone" | "email"> | null;
    items: OrderItem[];
  };
  let rawOrders: AdminOrderQueryRecord[] = [];
  try {
    rawOrders = await db.query.orders.findMany({
      orderBy: [desc(orders.createdAt)],
      with: {
        user: {
          columns: { fullName: true, phone: true, email: true },
        },
        items: true,
      },
    });
  } catch (error) {
    console.error("[Admin Orders DB Error]:", error);
  }

  const formattedOrders: AdminOrderRecord[] = rawOrders.map((ord) => ({
    id: ord.id,
    orderReference: ord.orderReference,
    customerName: ord.user?.fullName || ord.shippingAddress?.fullName || "Customer",
    customerPhone: ord.user?.phone || ord.shippingAddress?.phone || null,
    customerEmail: ord.user?.email || null,
    totalAmountPaise: ord.totalAmountPaise,
    paymentMethod: ord.paymentMethod,
    paymentStatus: ord.paymentStatus,
    upiTransactionId: ord.upiTransactionId,
    orderStatus: ord.orderStatus,
    courierPartner: ord.courierPartner,
    trackingAwb: ord.trackingAwb,
    createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
    shippingAddress: ord.shippingAddress,
    items: ord.items?.map((item) => ({
      title: item.title,
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      isSecondHand: item.isSecondHand,
    })) || [],
  }));

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#c8f33b]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#c8f33b]">
              Fulfillment State Machine
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-white sm:text-3xl font-sans">
            Order Fulfillment & Courier Dispatch
          </h1>
          <p className="mt-1 text-xs text-zinc-400">
            Link Air Waybill (AWB) tracking codes, manage courier logistics (Delhivery, Blue Dart), and generate GST tax invoices.
          </p>
        </div>
      </div>

      {/* Fulfillment Manager Workspace */}
      <OrderFulfillmentManager initialOrders={formattedOrders} />
    </div>
  );
}
