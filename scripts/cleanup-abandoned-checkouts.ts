import * as dotenv from "dotenv";
import postgres from "postgres";
import { and, isNull, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "../src/lib/db/schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in environment files.");
}

const sqlClient = postgres(connectionString, { max: 1 });
const db = drizzle(sqlClient, { schema });

try {
  const abandoned = await db
    .delete(schema.orders)
    .where(
      and(
        isNull(schema.orders.upiTransactionId),
        eq(schema.orders.paymentStatus, "awaiting_verification")
      )
    )
    .returning({ orderReference: schema.orders.orderReference });

  console.log(`Removed ${abandoned.length} abandoned checkout record(s).`);
} finally {
  await sqlClient.end();
}
