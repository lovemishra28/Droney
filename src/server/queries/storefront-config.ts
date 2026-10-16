import "server-only";
import { db } from "@/lib/db";
import { storefrontConfigs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import {
  DEFAULT_HERO_SLIDES,
  DEFAULT_PREOWNED_SLIDES,
  DEFAULT_JOURNAL_ARTICLES,
  DEFAULT_CONSULTATION_BANNER,
  type HeroSlideItem,
  type PreOwnedSlideItem,
  type FlightJournalItem,
  type ConsultationBannerConfig,
} from "@/types/storefront-config";

export * from "@/types/storefront-config";

/**
 * Fetch a storefront configuration by key, with graceful fallback to defaults
 */
export async function getStorefrontConfig<T = any>(key: string, fallback: T): Promise<T> {
  try {
    const row = await db.query.storefrontConfigs.findFirst({
      where: eq(storefrontConfigs.key, key),
    });

    if (!row || !row.value) {
      return fallback;
    }

    return row.value as T;
  } catch (error) {
    console.warn(`[StorefrontConfig Query Error for ${key}]:`, error);
    return fallback;
  }
}

/**
 * Fetch all storefront configurations in one go
 */
export async function getAllStorefrontConfigs() {
  const [heroSlides, preOwnedSlides, journalArticles, consultationBanner] = await Promise.all([
    getStorefrontConfig<HeroSlideItem[]>("hero_slider", DEFAULT_HERO_SLIDES),
    getStorefrontConfig<PreOwnedSlideItem[]>("preowned_slider", DEFAULT_PREOWNED_SLIDES),
    getStorefrontConfig<FlightJournalItem[]>("flight_journal", DEFAULT_JOURNAL_ARTICLES),
    getStorefrontConfig<ConsultationBannerConfig>("consultation_banner", DEFAULT_CONSULTATION_BANNER),
  ]);

  return {
    heroSlides,
    preOwnedSlides,
    journalArticles,
    consultationBanner,
  };
}
