import * as dotenv from "dotenv";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq, or } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

dotenv.config({ path: ".env.local" });
dotenv.config();

const identifier = process.argv[2]?.trim();
const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;

if (!identifier) {
  throw new Error(
    "Usage: pnpm admin:promote -- <phone-number-or-email>"
  );
}

if (!connectionString) {
  throw new Error("Missing DIRECT_URL or DATABASE_URL in environment files.");
}

const normalizedPhone = identifier.replace(/\D/g, "").replace(/^0?/, "");
const sqlClient = postgres(connectionString, { max: 1 });
const db = drizzle(sqlClient, { schema });

try {
  const user = await db.query.users.findFirst({
    where: identifier.includes("@")
      ? eq(schema.users.email, identifier.toLowerCase())
      : or(
          eq(schema.users.phone, identifier),
          eq(schema.users.phone, normalizedPhone),
          eq(schema.users.phone, `+91${normalizedPhone}`)
        ),
  });

  if (!user) {
    throw new Error(
      "User not found. Log in once with this phone/email first, then run the command again."
    );
  }

  await db
    .update(schema.users)
    .set({ role: "admin", updatedAt: new Date() })
    .where(eq(schema.users.id, user.id));

  console.log(`Admin role granted to ${user.fullName}.`);
} finally {
  await sqlClient.end();
}
