"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { auditLogs, inquiries } from "@/lib/db/schema";
import { requireAdminSession } from "@/server/queries/admin";
import type { ActionResponse } from "@/server/actions/auth";
import { INQUIRY_STATUSES, type InquiryStatus } from "@/types/inquiries";

const updateInquiryStatusSchema = z.object({
  inquiryId: z.string().uuid("Invalid inquiry ID"),
  status: z.enum(INQUIRY_STATUSES, {
    error: "Invalid inquiry status provided",
  }),
  adminNotes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

const deleteInquirySchema = z.object({
  inquiryId: z.string().uuid("Invalid inquiry ID"),
});

/**
 * Updates an inquiry's lifecycle status and optional internal administrator notes.
 * Enforces admin RBAC and writes an immutable audit log entry.
 */
export async function updateInquiryStatusAction(
  rawInput: z.infer<typeof updateInquiryStatusSchema>
): Promise<ActionResponse<{ updatedStatus: InquiryStatus }>> {
  const session = await requireAdminSession();

  const parsed = updateInquiryStatusSchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid status payload.",
    };
  }

  const { inquiryId, status, adminNotes } = parsed.data;

  try {
    const existing = await db.query.inquiries.findFirst({
      where: eq(inquiries.id, inquiryId),
    });

    if (!existing) {
      return {
        success: false,
        message: "Inquiry record not found.",
      };
    }

    const currentPayload = (existing.payload as Record<string, unknown>) || {};
    const updatedPayload = {
      ...currentPayload,
      ...(adminNotes !== undefined ? { adminNotes: adminNotes.trim() } : {}),
      lastUpdatedBy: session.fullName || "Flight Ops Admin",
      lastUpdatedAt: new Date().toISOString(),
    };

    await db
      .update(inquiries)
      .set({
        status,
        payload: updatedPayload,
      })
      .where(eq(inquiries.id, inquiryId));

    await db.insert(auditLogs).values({
      adminId: session.sub,
      action: "inquiry.status_updated",
      entityName: "inquiry",
      entityId: inquiryId,
      payload: {
        previousStatus: existing.status,
        newStatus: status,
        type: existing.type,
        customerName: existing.fullName,
        hasAdminNotes: Boolean(adminNotes),
      },
    });

    try {
      revalidatePath("/admin/inquiries");
      revalidatePath("/admin");
    } catch {
      // Ignored outside Next.js request execution
    }

    return {
      success: true,
      message: `Inquiry status updated to '${status}'.`,
      data: { updatedStatus: status },
    };
  } catch (error) {
    console.error("[Admin Update Inquiry Error]:", error);
    return {
      success: false,
      message: "Failed to update inquiry status.",
    };
  }
}

/**
 * Permanently deletes a spam or invalid inquiry record.
 * Enforces admin RBAC and writes an immutable audit log entry.
 */
export async function deleteInquiryAction(
  rawInput: z.infer<typeof deleteInquirySchema>
): Promise<ActionResponse> {
  const session = await requireAdminSession();

  const parsed = deleteInquirySchema.safeParse(rawInput);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid inquiry ID.",
    };
  }

  const { inquiryId } = parsed.data;

  try {
    const existing = await db.query.inquiries.findFirst({
      where: eq(inquiries.id, inquiryId),
    });

    if (!existing) {
      return {
        success: false,
        message: "Inquiry record not found or already deleted.",
      };
    }

    await db.delete(inquiries).where(eq(inquiries.id, inquiryId));

    await db.insert(auditLogs).values({
      adminId: session.sub,
      action: "inquiry.deleted",
      entityName: "inquiry",
      entityId: inquiryId,
      payload: {
        type: existing.type,
        customerName: existing.fullName,
        customerPhone: existing.phone,
      },
    });

    try {
      revalidatePath("/admin/inquiries");
      revalidatePath("/admin");
    } catch {
      // Ignored outside Next.js request execution
    }

    return {
      success: true,
      message: "Inquiry successfully removed.",
    };
  } catch (error) {
    console.error("[Admin Delete Inquiry Error]:", error);
    return {
      success: false,
      message: "Failed to delete inquiry.",
    };
  }
}
