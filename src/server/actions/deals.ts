"use server";

import { desc, eq, and, or, ilike, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { products, productMedia } from "@/lib/db/schema";

export interface TopBarDeal {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  discountPercent: number;
  basePricePaise: number;
  mrpPricePaise: number;
}

function formatShortDroneName(name: string): string {
  // Clean up long marketing terms into a punchy 2-4 word drone descriptor
  const clean = name
    .replace(/\s*Fly More Combo\s*/gi, " FMC ")
    .replace(/\s*Creator Combo\s*/gi, " Creator ")
    .replace(/\s*Combo\s*/gi, " Combo ")
    .replace(/\s*\([^)]*\)/g, "") // remove (DJI RC 2) etc.
    .replace(/\s+/g, " ")
    .trim();

  const words = clean.split(" ");
  if (words.length > 4) {
    return words.slice(0, 4).join(" ");
  }
  return clean;
}

/**
 * Retrieves products eligible for the top bar announcement strip.
 * Prioritizes products with discounts >= 30%, falling back to best active discounts.
 */
export async function getTopBarDealsAction(): Promise<TopBarDeal[]> {
  try {
    const activeProducts = await db.query.products.findMany({
      where: eq(products.status, "active"),
      columns: {
        id: true,
        name: true,
        slug: true,
        basePricePaise: true,
      },
      with: {
        showcase: {
          columns: {
            mrpPricePaise: true,
          },
        },
      },
      orderBy: [desc(products.updatedAt)],
      limit: 20,
    });

    const calculatedDeals: TopBarDeal[] = [];

    for (const p of activeProducts) {
      const mrp = p.showcase?.mrpPricePaise;
      if (mrp && mrp > p.basePricePaise) {
        const discountPercent = Math.round(
          ((mrp - p.basePricePaise) / mrp) * 100
        );
        calculatedDeals.push({
          id: p.id,
          name: p.name,
          shortName: formatShortDroneName(p.name),
          slug: p.slug,
          discountPercent,
          basePricePaise: p.basePricePaise,
          mrpPricePaise: mrp,
        });
      }
    }

    // Sort by highest discount first
    calculatedDeals.sort((a, b) => b.discountPercent - a.discountPercent);

    // Strictly filter products with discount >= 15% as specified
    return calculatedDeals.filter((d) => d.discountPercent >= 15);
  } catch (error) {
    console.error("[Get Top Bar Deals Error]:", error);
    return [];
  }
}

export interface QuickSearchResultItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  basePricePaise: number;
  stockQuantity: number;
  isSecondHand: boolean;
  thumbnailUrl: string;
}

export async function quickSearchAction(term: string): Promise<QuickSearchResultItem[]> {
  if (!term || term.trim().length === 0) return [];
  const sanitized = `%${term.trim()}%`;
  try {
    const matched = await db.query.products.findMany({
      where: and(
        eq(products.status, "active"),
        or(ilike(products.name, sanitized), ilike(products.sku, sanitized))!
      ),
      limit: 6,
      columns: {
        id: true,
        name: true,
        slug: true,
        sku: true,
        basePricePaise: true,
        stockQuantity: true,
        isSecondHand: true,
      },
      with: {
        media: {
          where: eq(productMedia.mediaType, "image"),
          orderBy: [asc(productMedia.displayOrder)],
          limit: 1,
          columns: { url: true },
        },
      },
    });

    return matched.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      basePricePaise: p.basePricePaise,
      stockQuantity: p.stockQuantity,
      isSecondHand: p.isSecondHand,
      thumbnailUrl: p.media?.[0]?.url || "/images/altitude-hero-bg.jpg",
    }));
  } catch (error) {
    console.error("[Quick Search Action Error]:", error);
    return [];
  }
}

