import { db } from "../src/lib/db";
import {
  orderItems,
  stockReservations,
  droneSpecifications,
  secondHandDetails,
  productMedia,
  productShowcases,
  products,
  categories,
  auditLogs,
} from "../src/lib/db/schema";

async function main() {
  console.log("Starting catalog database wipe...");

  const existing = await db.select({ id: products.id }).from(products);
  const count = existing.length;

  console.log(`Found ${count} products. Deleting dependent records, products & categories...`);

  await db.transaction(async (tx) => {
    // 1. Delete dependent order items
    await tx.delete(orderItems);
    // 2. Delete stock reservations
    await tx.delete(stockReservations);
    // 3. Delete specifications, secondhand details, media, showcases
    await tx.delete(droneSpecifications);
    await tx.delete(secondHandDetails);
    await tx.delete(productMedia);
    await tx.delete(productShowcases);
    // 4. Delete all products
    await tx.delete(products);
    // 5. Delete all old categories
    await tx.delete(categories);

    // 6. Audit log
    await tx.insert(auditLogs).values({
      action: "CLI_WIPE_ALL_PRODUCTS_AND_CATEGORIES",
      entityName: "products",
      entityId: "ALL",
      payload: { deletedCount: count },
    });
  });

  console.log(`Successfully wiped all products and categories.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error wiping products:", err);
  process.exit(1);
});
