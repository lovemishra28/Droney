import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

// Global cache to prevent connection leak in Next.js development HMR
declare global {
  // eslint-disable-next-line no-var
  var __dbClient: postgres.Sql | undefined;
}

const queryClient =
  global.__dbClient ||
  postgres(connectionString, {
    // Supabase Supavisor transaction pooler requires prepare: false
    prepare: false,
    // Restrict connection quota per serverless function instance
    max: process.env.NODE_ENV === "production" ? 10 : 2,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = queryClient;
}

export const db = drizzle(queryClient, { schema });
export type Database = typeof db;
export { schema };
