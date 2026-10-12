import { z } from "zod";

export const indianPincodeRegex = /^[1-9][0-9]{5}$/;
export const upiUtrRegex = /^[0-9]{12}$/; // Strict 12-digit Indian banking UTR format

export const shippingAddressSchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .trim()
    .regex(
      /^[6-9]\d{9}$/,
      "Please enter a valid 10-digit Indian mobile number"
    ),
  flatBuilding: z
    .string()
    .trim()
    .min(2, "Flat/House number and building are required"),
  street: z.string().trim().min(3, "Street/Locality is required"),
  landmark: z.string().trim().optional(),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z
    .string()
    .trim()
    .regex(indianPincodeRegex, "Please enter a valid 6-digit Indian PIN code"),
});

export const initiateCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product ID"),
        quantity: z.number().int().positive("Quantity must be at least 1"),
      })
    )
    .min(1, "Your cart is empty"),
  shippingAddress: shippingAddressSchema,
});

export const submitPaymentProofSchema = z.object({
  orderReference: z.string().trim().min(3, "Order reference is required"),
  upiTransactionId: z
    .string()
    .trim()
    .regex(
      upiUtrRegex,
      "Bank UTR / Transaction Reference must be exactly 12 numeric digits"
    ),
  paymentScreenshotUrl: z.string().url("Invalid screenshot URL").optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;
export type InitiateCheckoutInput = z.infer<typeof initiateCheckoutSchema>;
export type SubmitPaymentProofInput = z.infer<typeof submitPaymentProofSchema>;
