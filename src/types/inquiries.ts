export const INQUIRY_STATUSES = [
  "new",
  "contacted",
  "in_progress",
  "resolved",
  "archived",
] as const;

export type InquiryStatus = (typeof INQUIRY_STATUSES)[number];

export const INQUIRY_TYPES = [
  "consultation",
  "trade_in",
  "custom_build",
  "newsletter",
] as const;

export type InquiryType = (typeof INQUIRY_TYPES)[number];
