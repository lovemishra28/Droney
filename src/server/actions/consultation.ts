"use server";

import { z } from "zod";

const ConsultationSchema = z.object({
  consultationType: z.enum(["First Drone", "Pre-Owned", "Custom FPV", "Commercial"]),
  preferredDate: z.string().min(1, "Preferred date is required"),
  timeSlot: z.string().min(1, "Time slot is required"),
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(10, "Please enter a valid WhatsApp or phone number"),
});

export type ConsultationInput = z.infer<typeof ConsultationSchema>;

export interface ConsultationResult {
  success: boolean;
  referenceId?: string;
  message: string;
  consultation?: {
    referenceId: string;
    type: string;
    slot: string;
    date: string;
    name: string;
    phone: string;
    createdAt: string;
  };
}

export async function bookPilotConsultation(
  input: ConsultationInput
): Promise<ConsultationResult> {
  try {
    const validated = ConsultationSchema.parse(input);
    const referenceId = `ALT-CON-${Math.floor(100000 + Math.random() * 900000)}`;

    return {
      success: true,
      referenceId,
      message: `Your 1-on-1 flight consultation has been scheduled successfully! We'll reach out on WhatsApp at ${validated.phone} 15 minutes before ${validated.timeSlot}.`,
      consultation: {
        referenceId,
        type: validated.consultationType,
        slot: validated.timeSlot,
        date: validated.preferredDate,
        name: validated.fullName,
        phone: validated.phone,
        createdAt: new Date().toISOString(),
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error?.message || "Failed to schedule consultation. Please check your inputs.",
    };
  }
}
