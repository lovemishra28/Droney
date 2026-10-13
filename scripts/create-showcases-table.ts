import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS product_showcases (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      product_id uuid NOT NULL UNIQUE REFERENCES products(id) ON DELETE CASCADE,
      mrp_price_paise integer,
      emi_starts_from_paise integer,
      warranty_months integer DEFAULT 12,
      hero_badge varchar(64),
      hero_headline varchar(120),
      hero_subtitle text,
      hero_exploded_layout_url text,
      key_metrics jsonb DEFAULT '[]'::jsonb,
      story_blocks jsonb DEFAULT '[]'::jsonb,
      multi_angles jsonb DEFAULT '[]'::jsonb,
      comparison_data jsonb,
      regulatory_faqs jsonb DEFAULT '[]'::jsonb,
      tech_specs_grouped jsonb DEFAULT '{}'::jsonb,
      in_the_box jsonb DEFAULT '[]'::jsonb,
      bundle_product_ids jsonb DEFAULT '[]'::jsonb,
      faqs jsonb DEFAULT '[]'::jsonb,
      long_form_seo_article text
    );
  `);
  console.log("SUCCESS: product_showcases table created");
}

main()
  .catch((e) => {
    console.error("Migration error:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
