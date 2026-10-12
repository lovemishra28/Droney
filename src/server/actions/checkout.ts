"use server";

import crypto from "node:crypto";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/lib/db";
import { orderItems, orders, products, users } from "@/lib/db/schema";
import { env } from "@/lib/env";
import { getCurrentSession } from "@/server/services/session";
import { reserveInventoryForCheckout } from "@/server/services/inventory";
import {
  initiateCheckoutSchema,
  submitPaymentProofSchema,
  type InitiateCheckoutInput,
  type SubmitPaymentProofInput,
  type ShippingAddressInput,
} from "@/lib/validations/checkout";
import { sendOtpSms } from "@/lib/sms";
import { sendOtpEmail } from "@/lib/email";
import type { ActionResponse } from "@/server/actions/auth";

export interface CheckoutInitResponse {
  orderReference: string;
  totalAmountPaise: number;
  upiUri: string;
  payeeUpiId: string;
  payeeName: string;
  expiresAt: string;
}

/**
 * Generates an alphanumeric order reference code (e.g., ORD-82914).
 */
function generateOrderReference(): string {
  const randomSuffix = crypto.randomInt(10000, 99999).toString();
  return `ORD-${randomSuffix}`;
}

/**
 * Constructs a standardized NPCI UPI Payment URI string.
 * Format: upi://pay?pa={upiId}&pn={payee}&am={amount}&tr={ref}&tn={notes}&cu=INR
 */
export async function buildNpciUpiUri(params: {
  payeeAddress: string;
  payeeName: string;
  amountInr: string;
  transactionRef: string;
  transactionNote: string;
}): Promise<string> {
  const {
    payeeAddress,
    payeeName,
    amountInr,
    transactionRef,
    transactionNote,
  } = params;

  const url = new URL("upi://pay");
  url.searchParams.set("pa", payeeAddress);
  url.searchParams.set("pn", payeeName);
  url.searchParams.set("am", amountInr);
  url.searchParams.set("tr", transactionRef);
  url.searchParams.set("tn", transactionNote);
  url.searchParams.set("cu", "INR");

  return url.toString();
}

/**
 * Step 1: Validates cart line items, calculates total amount on the server,
 * locks inventory for 10 minutes, and returns the dynamic UPI QR payload.
 */
export async function initiateCheckoutAction(
  rawInput: InitiateCheckoutInput
): Promise<ActionResponse<CheckoutInitResponse>> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      success: false,
      message: "Please sign in with your phone or email before checkout.",
    };
  }

  const parsed = initiateCheckoutSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid checkout payload.",
    };
  }

  const { items: requestedItems, shippingAddress } = parsed.data;

  // 1. Fetch live source records to recalculate prices on the server (anti-tamper)
  const productIds = requestedItems.map((i) => i.productId);
  const dbProducts = await db
    .select({
      id: products.id,
      name: products.name,
      basePricePaise: products.basePricePaise,
      isSecondHand: products.isSecondHand,
      stockQuantity: products.stockQuantity,
      status: products.status,
    })
    .from(products)
    .where(inArray(products.id, productIds));

  if (dbProducts.length !== requestedItems.length) {
    return {
      success: false,
      message: "One or more products in your cart could not be resolved.",
    };
  }

  // 2. Concurrency-Safe Inventory Lock (10-minute hold)
  const reservationResult = await reserveInventoryForCheckout(
    session.sub,
    requestedItems
  );

  if (!reservationResult.success) {
    return {
      success: false,
      message: reservationResult.error,
    };
  }

  // 3. Compute exact server-side total in Paise
  let totalAmountPaise = 0;
  const lineItemSnapshots = requestedItems.map((reqItem) => {
    const matchedProduct = dbProducts.find((p) => p.id === reqItem.productId)!;
    const itemTotal = matchedProduct.basePricePaise * reqItem.quantity;
    totalAmountPaise += itemTotal;

    return {
      productId: matchedProduct.id,
      title: matchedProduct.name,
      quantity: reqItem.quantity,
      unitPricePaise: matchedProduct.basePricePaise,
      isSecondHand: matchedProduct.isSecondHand,
    };
  });

  const orderReference = generateOrderReference();

  // 4. Record order in PostgreSQL (status: placed, payment: awaiting_verification)
  await db.transaction(async (tx) => {
    const [createdOrder] = await tx
      .insert(orders)
      .values({
        orderReference,
        userId: session.sub,
        totalAmountPaise,
        shippingAddress,
        paymentMethod: "upi_qr",
        paymentStatus: "awaiting_verification",
        orderStatus: "placed",
      })
      .returning({ id: orders.id });

    // Insert snapshot order items
    for (const line of lineItemSnapshots) {
      await tx.insert(orderItems).values({
        orderId: createdOrder.id,
        productId: line.productId,
        quantity: line.quantity,
        unitPricePaise: line.unitPricePaise,
        title: line.title,
        isSecondHand: line.isSecondHand,
      });
    }
  });

  // 5. Construct NPCI-compliant UPI URI
  const amountInr = (totalAmountPaise / 100).toFixed(2);
  const upiUri = await buildNpciUpiUri({
    payeeAddress: env.NEXT_PUBLIC_CLIENT_UPI_ID,
    payeeName: env.NEXT_PUBLIC_CLIENT_PAYEE_NAME,
    amountInr,
    transactionRef: orderReference,
    transactionNote: `Payment for Order #${orderReference}`,
  });

  return {
    success: true,
    data: {
      orderReference,
      totalAmountPaise,
      upiUri,
      payeeUpiId: env.NEXT_PUBLIC_CLIENT_UPI_ID,
      payeeName: env.NEXT_PUBLIC_CLIENT_PAYEE_NAME,
      expiresAt: reservationResult.expiresAt.toISOString(),
    },
  };
}

/**
 * Step 2: Customer submits the 12-digit bank UTR code and optional proof screenshot.
 * Database UNIQUE constraint blocks duplicate UTR reuse across the entire system.
 */
export async function submitPaymentProofAction(
  rawInput: SubmitPaymentProofInput
): Promise<ActionResponse<{ orderReference: string }>> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      success: false,
      message: "Unauthorized request. Please log in.",
    };
  }

  const parsed = submitPaymentProofSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid UTR submission.",
    };
  }

  const { orderReference, upiTransactionId, paymentScreenshotUrl } =
    parsed.data;

  // 1. Fetch Order Record
  const targetOrder = await db.query.orders.findFirst({
    where: eq(orders.orderReference, orderReference),
    with: {
      user: true,
    },
  });

  if (!targetOrder) {
    return {
      success: false,
      message: "Order reference not found.",
    };
  }

  if (targetOrder.userId !== session.sub) {
    return {
      success: false,
      message: "Unauthorized access to this order.",
    };
  }

  if (targetOrder.paymentStatus === "paid") {
    return {
      success: false,
      message: "Payment for this order has already been verified.",
    };
  }

  // 2. Prevent UTR Reuse (Explicit DB Check before unique index trigger)
  const existingUtr = await db.query.orders.findFirst({
    where: eq(orders.upiTransactionId, upiTransactionId),
    columns: { id: true, orderReference: true },
  });

  if (existingUtr && existingUtr.orderReference !== orderReference) {
    return {
      success: false,
      message:
        "This 12-digit UTR has already been submitted for another order. Each transaction reference can only be submitted once.",
    };
  }

  // 3. Update Order with UTR & Screenshot Proof
  try {
    await db
      .update(orders)
      .set({
        upiTransactionId,
        paymentScreenshotUrl: paymentScreenshotUrl || null,
        paymentStatus: "awaiting_verification",
        updatedAt: new Date(),
      })
      .where(eq(orders.id, targetOrder.id));
  } catch (error: any) {
    // Catch PostgreSQL unique constraint violation on upi_transaction_id
    if (error?.code === "23505") {
      return {
        success: false,
        message:
          "This UTR number has already been recorded for a completed order.",
      };
    }
    throw error;
  }

  // 4. Send Confirmation Notification (Fast2SMS / Resend)
  const customerUser = targetOrder.user;
  const shortUtr = upiTransactionId.slice(-4);

  if (customerUser?.phone) {
    void sendOtpSms(
      customerUser.phone,
      `We received your order #${orderReference}. We are verifying your UPI payment (UTR ending in ...${shortUtr}). You will receive a dispatch update once approved.`
    );
  }

  if (customerUser?.email) {
    void sendOtpEmail(
      customerUser.email,
      `Order #${orderReference} received. We are verifying your payment proof (UTR: ${upiTransactionId}).`
    );
  }

  return {
    success: true,
    message:
      "Payment reference submitted successfully. Our team is verifying your transfer.",
    data: { orderReference },
  };
}

// Backward-compatible wrappers for existing components
export async function initiateCheckout(
  userId: string,
  items: { productId: string; quantity: number }[],
  shippingAddress: ShippingAddressInput
) {
  const result = await initiateCheckoutAction({
    items,
    shippingAddress,
  });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result;
}

export async function submitOrderUtr(
  orderReference: string,
  upiTransactionId: string,
  paymentScreenshotUrl?: string
) {
  const result = await submitPaymentProofAction({
    orderReference,
    upiTransactionId,
    paymentScreenshotUrl,
  });
  if (!result.success) {
    throw new Error(result.message);
  }
  return result;
}
