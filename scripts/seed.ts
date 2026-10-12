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

const SEED_CATALOG_RECORDS = [
  {
    sku: "DRN-DJI-A3S",
    name: "DJI Air 3S",
    category_slug: "camera-drones",
    category_name: "Camera Drones",
    base_price_inr: 112000,
    stock_quantity: 8,
    description: "4K/60fps HDR, 1-inch CMOS primary camera, 45 min flight time.",
    is_second_hand: false,
    image_url: "/images/dji-air-3s.jpg",
    flight_time_minutes: 45,
    payload_capacity_grams: 720,
  },
  {
    sku: "DRN-DJI-M3P",
    name: "DJI Mavic 3 Pro",
    category_slug: "camera-drones",
    category_name: "Camera Drones",
    base_price_inr: 198000,
    stock_quantity: 5,
    description: "Hasselblad 4/3 CMOS triple camera system with 15km O3+ transmission.",
    is_second_hand: false,
    image_url: "/images/dji-mavic-3-pro.jpg",
    flight_time_minutes: 43,
    payload_capacity_grams: 958,
  },
  {
    sku: "DRN-DJI-AV2",
    name: "DJI Avata 2 FPV",
    category_slug: "fpv-drones",
    category_name: "FPV Drones",
    base_price_inr: 84500,
    stock_quantity: 12,
    description: "Immersive motion flight, ultra-wide 4K/60fps, built-in propeller guard.",
    is_second_hand: false,
    image_url: "/images/dji-avata-2.jpg",
    flight_time_minutes: 23,
    payload_capacity_grams: 377,
  },
  {
    sku: "DRN-DJI-NEO",
    name: "DJI Neo",
    category_slug: "camera-drones",
    category_name: "Camera Drones",
    base_price_inr: 24990,
    stock_quantity: 20,
    description: "Palm takeoff and landing, AI subject tracking, 4K ultra-stabilized video.",
    is_second_hand: false,
    image_url: "/images/dji-neo-palm.jpg",
    flight_time_minutes: 18,
    weight_grams: 135,
  },
  {
    sku: "DRN-SH-M3P",
    name: "Refurbished DJI Mini 3 Pro (Grade A+)",
    category_slug: "used-drones",
    category_name: "Pre-Owned Drones",
    base_price_inr: 41999,
    stock_quantity: 1,
    description: "Certified refurbished DJI Mini 3 Pro. 32-point inspection passed with full warranty.",
    is_second_hand: true,
    image_url: "/images/preowned-mini-canyon.jpg",
    cosmetic_grade: "A",
    flight_hours: 4,
    crash_history: false,
    battery_cycle_count: 5,
    included_accessories: ["Spare Props", "Battery", "Controller"],
  },
  {
    sku: "DRN-SH-A2S",
    name: "DJI Air 2S Fly More Combo",
    category_slug: "used-drones",
    category_name: "Pre-Owned Drones",
    base_price_inr: 58900,
    stock_quantity: 1,
    description: "1-Inch Sensor, 5.4K Video, MasterShots. Includes 3 original batteries & shoulder bag.",
    is_second_hand: true,
    image_url: "/images/dji-air-3s.jpg",
    cosmetic_grade: "A",
    flight_hours: 8,
    crash_history: false,
    battery_cycle_count: 6,
    included_accessories: ["3x Original Batteries", "Shoulder Bag", "ND Filters"],
  },
  {
    sku: "DRN-SH-M4P",
    name: "DJI Mini 4 Pro with RC-N2",
    category_slug: "used-drones",
    category_name: "Pre-Owned Drones",
    base_price_inr: 62000,
    stock_quantity: 1,
    description: "Omnidirectional obstacle sensing, 4K/60fps HDR vertical shooting. Full warranty.",
    is_second_hand: true,
    image_url: "/images/preowned-mini-canyon.jpg",
    cosmetic_grade: "A",
    flight_hours: 2,
    crash_history: false,
    battery_cycle_count: 6,
    included_accessories: ["RC-N2 Controller", "Intelligent Flight Battery"],
  },
  {
    sku: "DRN-FPV-001",
    name: "AeroX 5-Inch Freestyle BNF",
    category_slug: "fpv-drones",
    category_name: "FPV Drones",
    base_price_inr: 34999,
    stock_quantity: 15,
    description: "Pro-grade freestyle drone equipped with digital HD FPV and carbon-fiber frame.",
    is_second_hand: false,
    image_url: "/images/altitude-hero-bg.jpg",
    frame_size_mm: 225,
    weight_grams: 385,
    input_voltage_lipo: "4S-6S LiPo",
    motor_kv: "1950KV",
    fc_firmware: "Betaflight 4.5",
    esc_protocol: "DShot600",
  },
  {
    sku: "MTR-BRU-002",
    name: "Apex 2207.5 1950KV Brushless Motor",
    category_slug: "motors",
    category_name: "Motors & ESCs",
    base_price_inr: 2499,
    stock_quantity: 120,
    description: "High-efficiency titanium shaft motor designed for extreme racing and acrobatic builds.",
    is_second_hand: false,
    image_url: "/images/altitude-hero-bg.jpg",
    weight_grams: 34,
    motor_kv: "1950KV",
  },
  {
    sku: "ACC-DJI-BAT",
    slug: "intelligent-flight-battery-acc-bat",
    name: "Intelligent Flight Battery",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 9000,
    stock_quantity: 24,
    description: "High-capacity LiPo cell with integrated BMS protection circuit and LED power indicators.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    flight_time_minutes: 42,
    weight_grams: 280,
  },
  {
    sku: "ACC-DJI-ND",
    slug: "nd-filter-4-pack-acc-nd",
    name: "ND Filter 4-Pack (8/16/32/64)",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 4250,
    stock_quantity: 35,
    description: "Optical glass coating preserving genuine colors in peak sunlight with precision magnetic bezel.",
    is_second_hand: false,
    image_url: "/images/accessory-nd-filters.jpg",
    weight_grams: 25,
  },
  {
    sku: "ACC-DJI-CASE",
    slug: "explorer-hard-carry-case-acc-case",
    name: "Explorer Hard Carry Case",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 7490,
    stock_quantity: 18,
    description: "IP67 waterproof ballistic shell with laser-cut custom EVA foam for drone, remote, and 4 batteries.",
    is_second_hand: false,
    image_url: "/images/accessory-hard-case.jpg",
    weight_grams: 1450,
  },
  {
    sku: "ACC-DJI-RC2",
    slug: "dji-rc-2-remote-controller-acc-rc2",
    name: "DJI RC 2 Remote Controller",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 27500,
    stock_quantity: 10,
    description: "5.5-inch FHD screen (700 nits), ultra-low latency, and built-in O4 video transmission.",
    is_second_hand: false,
    image_url: "/images/accessory-rc2-remote.jpg",
    weight_grams: 420,
  },
  {
    sku: "ACC-DIY-PROP",
    slug: "low-noise-propellers-diy-prop",
    name: "Low-Noise Propellers",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 1490,
    stock_quantity: 50,
    description: "Dynamic balancing for quieter acoustic profile and higher motor efficiency (4-pair pack).",
    is_second_hand: false,
    image_url: "/images/diy-propellers.jpg",
    weight_grams: 32,
  },
  {
    sku: "MTR-XING-2207",
    slug: "xing2-2207-brushless-motor-diy-mot",
    name: "XING2 2207 Brushless Motor",
    category_slug: "motors",
    category_name: "Motors & ESCs",
    base_price_inr: 1980,
    stock_quantity: 60,
    description: "1850KV titanium shaft motor designed for 5-inch freestyle and heavy-duty cinematic builds.",
    is_second_hand: false,
    image_url: "/images/diy-motor.jpg",
    motor_kv: "1850KV",
    weight_grams: 33,
  },
  {
    sku: "ESC-STK-F755",
    slug: "f7-flight-stack-55a-esc-diy-stack",
    name: "F7 Flight Stack 55A ESC",
    category_slug: "motors",
    category_name: "Motors & ESCs",
    base_price_inr: 7500,
    stock_quantity: 20,
    description: "Dual BEC, integrated Barometer, Blackbox, and STM32 processing for sub-millisecond response.",
    is_second_hand: false,
    image_url: "/images/diy-flight-stack.jpg",
    fc_firmware: "Betaflight 4.5",
    esc_protocol: "DShot600",
    weight_grams: 28,
  },
  {
    sku: "ACC-DJI-CHG",
    slug: "65w-portable-fast-charger-acc-chg",
    name: "65W Portable Fast Charger",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 3990,
    stock_quantity: 30,
    description: "Universal GaN USB-C fast charging hub compatible with flight batteries and remote controllers.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    weight_grams: 180,
  },
  {
    sku: "ACC-SD-256",
    slug: "high-speed-microsd-256gb-v30",
    name: "High-Speed MicroSD 256GB V30",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 2850,
    stock_quantity: 40,
    description: "V30 / U3 / A2 certification engineered for sustained 4K/60fps and 5.4K video recording bitrates.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    weight_grams: 5,
  },
  {
    sku: "ACC-RC-STRAP",
    slug: "dji-lanyard-rc-neck-strap",
    name: "DJI Lanyard & RC Neck Strap",
    category_slug: "accessories",
    category_name: "Accessories",
    base_price_inr: 1250,
    stock_quantity: 45,
    description: "Padded ergonomic neck strap with quick-release CNC aluminum buckles for extended pilot missions.",
    is_second_hand: false,
    image_url: "/images/accessory-rc2-remote.jpg",
    weight_grams: 95,
  },
];

async function runSeed() {
  console.log("🚀 Starting database seeding workflow...");
  console.log(`📦 Found ${SEED_CATALOG_RECORDS.length} SKUs in seed manifest. Processing...`);

  await db.transaction(async (tx) => {
    for (const record of SEED_CATALOG_RECORDS) {
      const {
        sku,
        name,
        category_slug,
        category_name,
        base_price_inr,
        stock_quantity,
        description,
        is_second_hand,
        image_url,
      } = record as any;

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

      // Convert INR Rupee price to integer Paise
      const basePricePaise = Math.round(base_price_inr * 100);
      const isSecondHandBool = Boolean(is_second_hand);
      const slug = (record as any).slug || `${generateSlug(name)}-${sku.toLowerCase()}`;

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
          stockQuantity: stock_quantity || 0,
          isSecondHand: isSecondHandBool,
          status: "active",
        })
        .onConflictDoUpdate({
          target: schema.products.sku,
          set: {
            slug,
            name,
            description: description || null,
            basePricePaise,
            stockQuantity: stock_quantity || 0,
            isSecondHand: isSecondHandBool,
            status: "active",
            updatedAt: new Date(),
          },
        })
        .returning();

      // 3. Upsert Media
      if (image_url) {
        const existingMedia = await tx
          .select()
          .from(schema.productMedia)
          .where(eq(schema.productMedia.productId, product.id))
          .limit(1);

        if (existingMedia.length === 0) {
          await tx.insert(schema.productMedia).values({
            productId: product.id,
            mediaType: "image",
            storageProvider: "r2",
            url: image_url,
            displayOrder: 0,
          });
        } else {
          await tx
            .update(schema.productMedia)
            .set({ url: image_url })
            .where(eq(schema.productMedia.id, existingMedia[0].id));
        }
      }

      // 4. Upsert Second Hand Details
      if (isSecondHandBool) {
        const existingDetails = await tx
          .select()
          .from(schema.secondHandDetails)
          .where(eq(schema.secondHandDetails.productId, product.id))
          .limit(1);

        const detailsPayload = {
          productId: product.id,
          cosmeticGrade: ((record as any).cosmetic_grade || "A") as any,
          flightHours: (record as any).flight_hours || 0,
          crashHistory: (record as any).crash_history || false,
          batteryCycleCount: (record as any).battery_cycle_count || 0,
          includedAccessories: (record as any).included_accessories || [],
        };

        if (existingDetails.length === 0) {
          await tx.insert(schema.secondHandDetails).values(detailsPayload);
        } else {
          await tx
            .update(schema.secondHandDetails)
            .set(detailsPayload)
            .where(eq(schema.secondHandDetails.productId, product.id));
        }
      }

      console.log(`  ✓ Synced SKU: ${sku} (${name})`);
    }
  });

  console.log("✅ Seeding completed successfully. Catalog is live in database.");
  process.exit(0);
}

runSeed().catch((error) => {
  console.error("❌ Seeding execution failed:", error);
  process.exit(1);
});
