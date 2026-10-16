import {
  getProducts,
  getLatestModifiedNewArrivals,
  getLatestModifiedPreOwned,
} from "@/server/queries/catalog";
import { getAllStorefrontConfigs } from "@/server/queries/storefront-config";
import { HeroStrips } from "@/components/storefront/hero-strips";
import { HeroSection } from "@/components/storefront/hero-section";
import { NewArrivalsAndPreOwnedSection } from "@/components/storefront/new-arrivals-and-preowned";
import { AccessoriesShowcase } from "@/components/storefront/accessories-showcase";
import { PilotConsultationBanner } from "@/components/storefront/pilot-consultation-banner";
import { FlightJournalShowcase } from "@/components/storefront/flight-journal-showcase";
import { PilotTestimonialsAndTrust } from "@/components/storefront/pilot-testimonials-and-trust";
import { NewsletterCta } from "@/components/storefront/newsletter-cta";

export const dynamic = "force-dynamic";

export default async function StorefrontHomePage() {
  const [allProductsRes, latestNewArrivals, latestPreOwned, storefrontConfigs] =
    await Promise.all([
      getProducts({ pageSize: 50, sortBy: "newest" }).catch(() => ({ data: [] })),
      getLatestModifiedNewArrivals(4),
      getLatestModifiedPreOwned(2),
      getAllStorefrontConfigs(),
    ]);

  const allProducts = allProductsRes.data || [];

  // Filter live products by category/taxonomy
  const accessories = allProducts.filter(
    (p) =>
      p.category?.slug?.toLowerCase().includes("accessor") ||
      p.category?.name?.toLowerCase().includes("accessor") ||
      p.sku?.toUpperCase().startsWith("ACC-")
  );

  return (
    <div className="bg-white">
      {/* 1. Altitude Aviation Tech Hero Slider */}
      <HeroSection slides={storefrontConfigs.heroSlides} />

      {/* 2. Trust & Quality Assurance Strip (Visible upon scrolling) */}
      <HeroStrips />

      {/* 3. New Arrivals & Pre-Owned Showcase (Dynamic Pre-Owned Slider) */}
      <NewArrivalsAndPreOwnedSection
        newArrivals={latestNewArrivals}
        preOwnedUnits={latestPreOwned}
        preOwnedSlides={storefrontConfigs.preOwnedSlides}
      />

      {/* 4. Small additions. Big adventures. (Accessories Showcase - Live DB Products) */}
      <AccessoriesShowcase items={accessories} />

      {/* 5. Not sure what you need? Let's figure it out together. (Interactive Pilot Consultation Banner) */}
      <PilotConsultationBanner config={storefrontConfigs.consultationBanner} />

      {/* 6. A little insight. A better flight. (Flight Journal & Technical Guides) */}
      <FlightJournalShowcase articles={storefrontConfigs.journalArticles} />

      {/* 7. Trusted by pilots. Just like you. (Testimonials & 4 Trust Pillars) */}
      <PilotTestimonialsAndTrust />

      {/* 8. Stay ahead of the horizon. (Newsletter / Drops VIP Alert) */}
      <NewsletterCta />
    </div>
  );
}
