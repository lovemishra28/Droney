import React from "react";
import { desc } from "drizzle-orm";
import { ShoppingBag } from "lucide-react";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import {
  OrderFulfillmentManager,
  type AdminOrderRecord,
} from "@/components/admin/order-fulfillment-manager";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdminSession();

  let rawOrders: any[] = [];
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
    paymentStatus: ord.paymentStatus as any,
    upiTransactionId: ord.upiTransactionId,
    orderStatus: ord.orderStatus as any,
    courierPartner: ord.courierPartner,
    trackingAwb: ord.trackingAwb,
    createdAt: ord.createdAt ? new Date(ord.createdAt).toISOString() : new Date().toISOString(),
    shippingAddress: ord.shippingAddress,
    items: ord.items?.map((item: any) => ({
      title: item.title,
      quantity: item.quantity,
      unitPricePaise: item.unitPricePaise,
      isSecondHand: item.isSecondHand,
    })) || [],
  }));

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-400" />
            <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
              Order Fulfillment & Courier Dispatch
            </h1>
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Link Air Waybill (AWB) tracking codes, manage courier logistics, and generate GST tax invoices.
          </p>
        </div>
      </div>

      {/* Fulfillment Manager Workspace */}
      <OrderFulfillmentManager initialOrders={formattedOrders} />
    </div>
  );
}
