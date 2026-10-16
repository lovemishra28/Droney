"use server";

import { db } from "@/lib/db";
import { storefrontConfigs, auditLogs } from "@/lib/db/schema";
import { getCurrentSession } from "@/server/services/session";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import type { ActionResponse } from "./auth";

/**
 * Save or update a storefront configuration block (Admin only)
 */
export async function saveStorefrontConfigAction(
  key: string,
  value: any
): Promise<ActionResponse<{ key: string }>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  if (!key || typeof key !== "string") {
    return {
      success: false,
      message: "Invalid configuration key.",
    };
  }

  try {
    await db
      .insert(storefrontConfigs)
      .values({
        key,
        value,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: storefrontConfigs.key,
        set: {
          value,
          updatedAt: new Date(),
        },
      });

    // Record audit trail log
    try {
      await db.insert(auditLogs).values({
        adminId: session.sub,
        action: "STOREFRONT_CONFIG_UPDATE",
        entityName: "storefront_configs",
        entityId: key,
        payload: {
          key,
          updatedAt: new Date().toISOString(),
        },
      });
    } catch (auditErr) {
      console.warn("[Audit Log Write Warning]:", auditErr);
    }

    // Instantly invalidate storefront cache
    revalidatePath("/", "page");
    revalidatePath("/admin/storefront", "page");

    return {
      success: true,
      message: `Storefront section '${key}' published live.`,
      data: { key },
    };
  } catch (error) {
    console.error(`[Save Storefront Config Error for ${key}]:`, error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save storefront configuration.",
    };
  }
}

/**
 * Reset a storefront configuration back to factory default
 */
export async function resetStorefrontConfigAction(
  key: string
): Promise<ActionResponse<{ key: string }>> {
  const session = await getCurrentSession();

  if (!session || session.role !== "admin") {
    return {
      success: false,
      message: "Unauthorized: Administrator privileges required.",
    };
  }

  try {
    await db.delete(storefrontConfigs).where(eq(storefrontConfigs.key, key));

    revalidatePath("/", "page");
    revalidatePath("/admin/storefront", "page");

    return {
      success: true,
      message: `Storefront section '${key}' reset to defaults.`,
      data: { key },
    };
  } catch (error) {
    console.error(`[Reset Storefront Config Error for ${key}]:`, error);
    return {
      success: false,
      message: "Failed to reset storefront configuration.",
    };
  }
}
