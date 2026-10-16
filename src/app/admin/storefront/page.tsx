import React from "react";
import { requireAdminSession } from "@/server/queries/admin";
import { getAllStorefrontConfigs } from "@/server/queries/storefront-config";
import { StorefrontStudioBuilder } from "@/components/admin/storefront-studio-builder";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Storefront Studio | Altitude Admin",
  description: "Visual Homepage Architecture & Dynamic Storefront Content Management",
};

export default async function AdminStorefrontStudioPage() {
  await requireAdminSession();

  const configs = await getAllStorefrontConfigs();

  return (
    <div className="space-y-6">
      <StorefrontStudioBuilder
        initialHeroSlides={configs.heroSlides}
        initialPreOwnedSlides={configs.preOwnedSlides}
        initialJournalArticles={configs.journalArticles}
        initialConsultationBanner={configs.consultationBanner}
      />
    </div>
  );
}
