import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL environment variable is missing.");
}

/**
 * Supabase Supavisor Transaction Pooler Client (Port 6543).
 * - max: 15 connections per serverless container prevents pool exhaustion.
 * - idle_timeout: 20 seconds drops zombie idle handles quickly.
 * - connect_timeout: 10 seconds fails fast if upstream database is unreachable.
 * - prepare: false is mandatory for Supavisor Transaction Pooling mode.
 */
declare global {
  // eslint-disable-next-line no-var
  var __dbClient: postgres.Sql | undefined;
}

const poolClient =
  global.__dbClient ||
  postgres(databaseUrl, {
    max: 15,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false, // Transaction mode does not support prepared statements
    ssl: "require",
  });

if (process.env.NODE_ENV !== "production") {
  global.__dbClient = poolClient;
}

export const db = drizzle(poolClient, { schema });
export type Database = typeof db;
export { schema };
