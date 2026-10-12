import { getProducts } from "@/server/queries/catalog";
import { HeroStrips } from "@/components/storefront/hero-strips";
import { HeroSection } from "@/components/storefront/hero-section";
import { NewArrivalsAndPreOwnedSection } from "@/components/storefront/new-arrivals-and-preowned";
import { AccessoriesShowcase } from "@/components/storefront/accessories-showcase";
import { DiyBuilderShowcase } from "@/components/storefront/diy-builder-showcase";
import { PilotConsultationBanner } from "@/components/storefront/pilot-consultation-banner";
import { FlightJournalShowcase } from "@/components/storefront/flight-journal-showcase";
import { PilotTestimonialsAndTrust } from "@/components/storefront/pilot-testimonials-and-trust";
import { NewsletterCta } from "@/components/storefront/newsletter-cta";

export default async function StorefrontHomePage() {
  // Fetch real catalog products from the PostgreSQL database
  const catalogProducts = (
    await getProducts({ pageSize: 50, sortBy: "newest" })
  ).data;

  return (
    <div className="bg-white">
      {/* 0. Live Alert & Trust Strips */}
      <HeroStrips />

      {/* 1. Altitude Aviation Tech Hero Section */}
      <HeroSection />

      {/* 2. New Arrivals & Pre-Owned Showcase (Powered by Live Database Products) */}
      <NewArrivalsAndPreOwnedSection initialProducts={catalogProducts} />

      {/* 3. Small additions. Big adventures. (Accessories Showcase) */}
      <AccessoriesShowcase />

      {/* 4. Build it. Tune it. Make it yours. (DIY Kits & Components Showcase) */}
      <DiyBuilderShowcase />

      {/* 5. Not sure what you need? Let's figure it out together. (Interactive Pilot Consultation Banner) */}
      <PilotConsultationBanner />

      {/* 6. A little insight. A better flight. (Flight Journal & Technical Guides) */}
      <FlightJournalShowcase />

      {/* 7. Trusted by pilots. Just like you. (Testimonials & 4 Trust Pillars) */}
      <PilotTestimonialsAndTrust />

      {/* 8. Stay ahead of the horizon. (Newsletter / Drops VIP Alert) */}
      <NewsletterCta />
    </div>
  );
}
