"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { inquiries } from "@/lib/db/schema";
import type { ActionResponse } from "@/server/actions/auth";

const consultationSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  topic: z.string().max(50),
  pilotLevel: z.string().max(50),
  droneModel: z.string().max(100).optional(),
  notes: z.string().max(500).optional(),
});

const tradeInSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  phone: z.string().trim().min(10, "Phone number must be at least 10 digits").max(20),
  city: z.string().max(50),
  pincode: z.string().max(10),
  droneModel: z.string().max(100),
  condition: z.string().max(50),
  batteryCount: z.number().int().min(1).max(20),
  hasRcWithScreen: z.boolean(),
  estimatedValuationInr: z.number().int().positive(),
});

const customBuildSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100).optional(),
  phone: z.string().trim().min(10, "Phone is required").max(20).optional(),
  email: z.string().trim().email().optional(),
  frameName: z.string(),
  motorsName: z.string(),
  stackName: z.string(),
  vtxName: z.string(),
  totalPricePaise: z.number().int().positive(),
  totalWeightGrams: z.number().int().positive(),
});

export async function submitConsultationAction(
  input: z.infer<typeof consultationSchema>
): Promise<ActionResponse<{ inquiryId: string }>> {
  const parsed = consultationSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid consultation payload.",
    };
  }

  const { fullName, phone, topic, pilotLevel, droneModel, notes } = parsed.data;

  try {
    const [created] = await db
      .insert(inquiries)
      .values({
        type: "consultation",
        fullName,
        phone,
        payload: { topic, pilotLevel, droneModel, notes },
      })
      .returning({ id: inquiries.id });

    return {
      success: true,
      message: "Consultation request dispatched to the chief flight desk.",
      data: { inquiryId: created.id },
    };
  } catch (err) {
    console.error("[Consultation Error]:", err);
    return {
      success: false,
      message: "Unable to record consultation request at this time.",
    };
  }
}

export async function submitTradeInAction(
  input: z.infer<typeof tradeInSchema>
): Promise<ActionResponse<{ inquiryId: string }>> {
  const parsed = tradeInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid trade-in payload.",
    };
  }

  const {
    name,
    phone,
    city,
    pincode,
    droneModel,
    condition,
    batteryCount,
    hasRcWithScreen,
    estimatedValuationInr,
  } = parsed.data;

  try {
    const [created] = await db
      .insert(inquiries)
      .values({
        type: "trade_in",
        fullName: name,
        phone,
        payload: {
          city,
          pincode,
          droneModel,
          condition,
          batteryCount,
          hasRcWithScreen,
          estimatedValuationInr,
        },
      })
      .returning({ id: inquiries.id });

    return {
      success: true,
      message: "Trade-in valuation request dispatched.",
      data: { inquiryId: created.id },
    };
  } catch (err) {
    console.error("[Trade-in Error]:", err);
    return {
      success: false,
      message: "Unable to submit trade-in request at this time.",
    };
  }
}

export async function submitCustomBuildAction(
  input: z.infer<typeof customBuildSchema>
): Promise<ActionResponse<{ inquiryId: string }>> {
  const parsed = customBuildSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      message: parsed.error.issues[0]?.message || "Invalid custom build payload.",
    };
  }

  const {
    fullName,
    phone,
    email,
    frameName,
    motorsName,
    stackName,
    vtxName,
    totalPricePaise,
    totalWeightGrams,
  } = parsed.data;

  try {
    const [created] = await db
      .insert(inquiries)
      .values({
        type: "custom_build",
        fullName: fullName || "Store Customer",
        phone: phone || null,
        email: email || null,
        payload: {
          frameName,
          motorsName,
          stackName,
          vtxName,
          totalPricePaise,
          totalWeightGrams,
        },
      })
      .returning({ id: inquiries.id });

    return {
      success: true,
      message: "Custom UAV build configuration submitted to flight engineers.",
      data: { inquiryId: created.id },
    };
  } catch (err) {
    console.error("[Custom Build Error]:", err);
    return {
      success: false,
      message: "Unable to submit custom build request at this time.",
    };
  }
}
