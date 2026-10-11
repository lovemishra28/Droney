import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import * as dotenv from "dotenv";
import { eq } from "drizzle-orm";
import postgres from "postgres";
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

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function runSeed() {
  console.log("🚀 Starting database seeding workflow...");

  const csvPath = path.resolve(process.cwd(), "data/initial_catalog.csv");

  if (!fs.existsSync(csvPath)) {
    console.error(`❌ CSV catalog file not found at: ${csvPath}`);
    process.exit(1);
  }

  const fileContent = fs.readFileSync(csvPath, "utf-8");
  const records: any[] = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });

  console.log(`📦 Found ${records.length} SKUs in CSV file. Processing...`);

  await db.transaction(async (tx) => {
    for (const record of records) {
      const {
        sku,
        name,
        category_slug,
        category_name,
        base_price_inr,
        stock_quantity,
        description,
        is_second_hand,
        frame_size_mm,
        weight_grams,
        input_voltage_lipo,
        motor_kv,
        fc_firmware,
        esc_protocol,
        flight_time_minutes,
        payload_capacity_grams,
        cosmetic_grade,
        flight_hours,
        crash_history,
        battery_cycle_count,
        included_accessories,
        image_url,
        video_url,
      } = record;

      // 1. Resolve or Create Category
      let [category] = await tx
        .select()
        .from(schema.categories)
        .where(eq(schema.categories.slug, category_slug))
        .limit(1);

      if (!category) {
        const [newCategory] = await tx
          .insert(schema.categories)
          .values({
            name: category_name || category_slug,
            slug: category_slug,
            description: `Components and gear for ${category_name || category_slug}`,
          })
          .returning();
        category = newCategory;
        console.log(`  ➕ Category created: ${category.name}`);
      }

      // Convert INR Rupee price string to integer Paise
      const basePricePaise = Math.round(parseFloat(base_price_inr) * 100);
      const isSecondHandBool = is_second_hand?.toLowerCase() === "true";
      const slug = `${generateSlug(name)}-${sku.toLowerCase()}`;

      // 2. Upsert Product Record
      const [product] = await tx
        .insert(schema.products)
        .values({
          categoryId: category.id,
          sku,
          slug,
          name,
          description: description || null,
          basePricePaise,
          stockQuantity: parseInt(stock_quantity, 10) || 0,
          isSecondHand: isSecondHandBool,
          status: "active",
        })
        .onConflictDoUpdate({
          target: schema.products.sku,
          set: {
            name,
            basePricePaise,
            stockQuantity: parseInt(stock_quantity, 10) || 0,
            updatedAt: new Date(),
          },
        })
        .returning();

      // 3. Upsert Hardware Specifications
      if (
        frame_size_mm ||
        weight_grams ||
        input_voltage_lipo ||
        motor_kv ||
        fc_firmware ||
        esc_protocol
      ) {
        await tx
          .insert(schema.droneSpecifications)
          .values({
            productId: product.id,
            frameSizeMm: frame_size_mm ? parseInt(frame_size_mm, 10) : null,
            weightGrams: weight_grams ? parseInt(weight_grams, 10) : null,
            inputVoltageLipo: input_voltage_lipo || null,
            motorKv: motor_kv || null,
            fcFirmware: fc_firmware || null,
            escProtocol: esc_protocol || null,
            flightTimeMinutes: flight_time_minutes
              ? parseInt(flight_time_minutes, 10)
              : null,
            payloadCapacityGrams: payload_capacity_grams
              ? parseInt(payload_capacity_grams, 10)
              : null,
          })
          .onConflictDoUpdate({
            target: schema.droneSpecifications.productId,
            set: {
              frameSizeMm: frame_size_mm ? parseInt(frame_size_mm, 10) : null,
              weightGrams: weight_grams ? parseInt(weight_grams, 10) : null,
              inputVoltageLipo: input_voltage_lipo || null,
              motorKv: motor_kv || null,
              fcFirmware: fc_firmware || null,
              escProtocol: esc_protocol || null,
            },
          });
      }

      // 4. Upsert Second-Hand Inspection Data
      if (isSecondHandBool && cosmetic_grade) {
        let accessoriesParsed: string[] = [];
        try {
          accessoriesParsed = included_accessories
            ? JSON.parse(included_accessories)
            : [];
        } catch {
          accessoriesParsed = [];
        }

        await tx
          .insert(schema.secondHandDetails)
          .values({
            productId: product.id,
            cosmeticGrade: cosmetic_grade as "A" | "B" | "C",
            flightHours: flight_hours ? parseInt(flight_hours, 10) : 0,
            crashHistory: crash_history?.toLowerCase() === "true",
            batteryCycleCount: battery_cycle_count
              ? parseInt(battery_cycle_count, 10)
              : 0,
            includedAccessories: accessoriesParsed,
            inspectionNotes: `Inspected and bench-tested by certified technicians.`,
          })
          .onConflictDoUpdate({
            target: schema.secondHandDetails.productId,
            set: {
              cosmeticGrade: cosmetic_grade as "A" | "B" | "C",
              flightHours: flight_hours ? parseInt(flight_hours, 10) : 0,
              batteryCycleCount: battery_cycle_count
                ? parseInt(battery_cycle_count, 10)
                : 0,
            },
          });
      }

      // 5. Populate Media Assets (Images & HLS Video URLs)
      if (image_url) {
        await tx.insert(schema.productMedia).values({
          productId: product.id,
          mediaType: "image",
          storageProvider: "r2",
          url: image_url,
          displayOrder: 0,
        });
      }

      if (video_url) {
        await tx.insert(schema.productMedia).values({
          productId: product.id,
          mediaType: "video",
          storageProvider: "bunny",
          url: video_url,
          displayOrder: 1,
        });
      }

      console.log(`  ✓ Synced SKU: ${sku} (${name})`);
    }
  });

  console.log(
    "✅ Seeding completed successfully. Catalog is live in database."
  );
  await sqlClient.end();
}

runSeed().catch(async (error) => {
  console.error("❌ Seeding execution failed:", error);
  await sqlClient.end();
  process.exit(1);
});
