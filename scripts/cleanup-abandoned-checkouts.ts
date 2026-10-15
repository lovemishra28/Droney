import * as dotenv from "dotenv";
import postgres from "postgres";
import { and, isNull, eq, lt } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

if (
  process.env.NODE_ENV === "production" &&
  !process.argv.includes("--confirm-production")
) {
  console.error(
    "SAFETY GUARD: Refusing to run cleanup-abandoned-checkouts in production without --confirm-production flag."
  );
  process.exit(1);
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in environment files.");
}

const sqlClient = postgres(connectionString, { max: 1 });
const db = drizzle(sqlClient, { schema });

try {
  // Only purge abandoned checkouts older than 24 hours to prevent clobbering in-flight customer orders
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const abandoned = await db
    .delete(schema.orders)
    .where(
      and(
        isNull(schema.orders.upiTransactionId),
        eq(schema.orders.paymentStatus, "awaiting_verification"),
        lt(schema.orders.createdAt, twentyFourHoursAgo)
      )
    )
    .returning({ orderReference: schema.orders.orderReference });

  console.log(`Removed ${abandoned.length} abandoned checkout record(s) older than 24h.`);
} finally {
  await sqlClient.end();
}
