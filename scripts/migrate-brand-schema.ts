import * as dotenv from "dotenv";
import postgres from "postgres";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in environment files.");
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
  console.log("Applying Brand schema migration...");

  // 1. Create brands table if it doesn't exist
  await sql`
    CREATE TABLE IF NOT EXISTS brands (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(120) NOT NULL,
      slug VARCHAR(140) UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      website_url VARCHAR(255),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;
  console.log("✓ Table 'brands' verified/created.");

  // 2. Create index on brands slug
  await sql`
    CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands (slug);
  `;
  console.log("✓ Index 'idx_brands_slug' verified/created.");

  // 3. Add brand and brand_id columns to products table if missing
  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS brand VARCHAR(100) NOT NULL DEFAULT 'DJI';
  `;
  console.log("✓ Column 'brand' verified/added to 'products'.");

  await sql`
    ALTER TABLE products
    ADD COLUMN IF NOT EXISTS brand_id UUID REFERENCES brands(id) ON DELETE SET NULL;
  `;
  console.log("✓ Column 'brand_id' verified/added to 'products'.");

  // 4. Create indexes on products
  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_brand ON products (brand);
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products (brand_id);
  `;
  console.log("✓ Indexes on 'brand' and 'brand_id' verified/created.");

  // 5. Seed default DJI brand record
  const [djiBrand] = await sql`
    INSERT INTO brands (name, slug, description, website_url)
    VALUES (
      'DJI',
      'dji',
      'The global leader in civilian drones, aerial imaging systems, and handheld camera technology.',
      'https://www.dji.com'
    )
    ON CONFLICT (slug) DO UPDATE
    SET name = EXCLUDED.name
    RETURNING id, name, slug;
  `;
  console.log(`✓ DJI brand record active with ID: ${djiBrand.id}`);

  // 6. Link all existing products to DJI brand
  const updated = await sql`
    UPDATE products
    SET brand = 'DJI', brand_id = ${djiBrand.id}
    WHERE brand_id IS NULL OR brand = '' OR brand IS NULL;
  `;
  console.log(`✓ Updated products to link to DJI brand (count: ${updated.count || 0}).`);

  console.log("\n Brand schema migration completed successfully!");
}

main()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await sql.end();
    process.exit(0);
  });
