import React from "react";
import { requireAdminSession, getAdminInquiries } from "@/server/queries/admin";
import { InquiriesManager } from "@/components/admin/inquiries-manager";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Flight Desk Consultations | Admin",
  description: "Manage pilot consultations and custom build requests.",
};

export default async function AdminInquiriesPage() {
  await requireAdminSession();
  const inquiries = await getAdminInquiries();

  return <InquiriesManager initialInquiries={inquiries} />;
}
