import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables for local CLI executions
dotenv.config({ path: ".env.local" });
dotenv.config();

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
