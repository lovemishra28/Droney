import { db } from "../src/lib/db";
import { products, categories, productShowcases } from "../src/lib/db/schema";
import { sql } from "drizzle-orm";

async function main() {
  const [productCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(products);
  const [categoryCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(categories);
  const [showcaseCount] = await db
    .select({ count: sql<number>`count(*)` })
    .from(productShowcases);

  console.log("=== Altitude Database Inventory Summary ===");
  console.log(`Total Products:   ${productCount.count}`);
  console.log(`Total Categories: ${categoryCount.count}`);
  console.log(`Total Showcases:  ${showcaseCount.count}`);
  console.log("===========================================");

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
