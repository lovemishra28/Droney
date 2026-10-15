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

// 1. Clean Category Taxonomy (No bloated 97 categories)
const CLEAN_CATEGORIES = [
  {
    name: "Mini Series (<249g)",
    slug: "mini-series",
    description: "Ultralight sub-249g drones. DGCA regulation friendly with no pilot license required.",
  },
  {
    name: "Air Series",
    slug: "air-series",
    description: "Dual-camera all-rounders for creators and professional travel videographers.",
  },
  {
    name: "Mavic Series",
    slug: "mavic-series",
    description: "Flagship cinematography platforms equipped with Hasselblad optics and Apple ProRes.",
  },
  {
    name: "Avata & FPV Series",
    slug: "avata-series",
    description: "Immersive motion flight and 360-degree aerial acrobatics with motion controller.",
  },
  {
    name: "Accessories & Spares",
    slug: "accessories",
    description: "Official DJI intelligent batteries, chargers, RC 2 remotes, propellers, and cases.",
  },
  {
    name: "Pre-Owned Drones",
    slug: "used-drones",
    description: "32-point technician bench-tested certified pre-owned drones with warranty.",
  },
];

// 2. The 11 Client Products + Official Accessories + Pre-Owned Models
const CATALOG_RECORDS = [
  // --- AIR SERIES (3 Products) ---
  {
    sku: "DRN-DJI-A3S-RC2",
    name: "DJI Air 3S Fly More Combo (DJI RC 2)",
    slug: "dji-air-3s-flymore-combo-rc-2",
    category_slug: "air-series",
    base_price_inr: 149990,
    stock_quantity: 8,
    description:
      "Dual-camera 1-inch CMOS primary camera, 70mm medium telephoto, 45-min flight time, and nightscape omnidirectional LiDAR sensing. Includes DJI RC 2 with 5.5-inch FHD screen, 3 batteries, and charging hub.",
    is_second_hand: false,
    image_url: "/images/dji-air-3s.jpg",
    flight_time_minutes: 45,
    weight_grams: 724,
    showcase: {
      mrpPricePaise: 16999000,
      emiStartsFromPaise: 849900,
      warrantyMonths: 12,
      heroBadge: "REAL DETAIL AIR",
      heroHeadline: "Air 3S.",
      heroSubtitle:
        "Dual-camera 1-inch CMOS primary sensor, 4K/60fps HDR video, and next-gen nightscape omnidirectional obstacle sensing.",
      keyMetrics: [
        { value: "1\"", unit: "CMOS", label: "Primary Sensor" },
        { value: "4K", unit: "60fps HDR", label: "Video Fidelity" },
        { value: "45m", unit: "Max Flight", label: "Airborne Endurance" },
        { value: "LiDAR", unit: "Night APAS", label: "Omni Sensing" },
      ],
      inTheBox: [
        { name: "DJI Air 3S Aircraft", quantity: 1, imageUrl: "/images/dji-air-3s.jpg" },
        { name: "DJI RC 2 Remote Controller (Screen)", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Battery Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "ND Filter Set (ND8/32/128)", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
        { name: "Shoulder Bag", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-AIR3-FMC",
    name: "DJI Air 3 Fly More Combo",
    slug: "dji-air-3-flymore-combo",
    category_slug: "air-series",
    base_price_inr: 129990,
    stock_quantity: 6,
    description:
      "Dual primary 1/1.3-inch CMOS cameras (24mm wide & 70mm telephoto), 46-min flight time, omnidirectional obstacle sensing, and O4 HD video transmission.",
    is_second_hand: false,
    image_url: "/images/dji-air-3s.jpg",
    flight_time_minutes: 46,
    weight_grams: 720,
    showcase: {
      mrpPricePaise: 14499000,
      emiStartsFromPaise: 749900,
      warrantyMonths: 12,
      heroBadge: "DUAL PRIMARY OPTICS",
      heroHeadline: "Air 3.",
      heroSubtitle: "Dual 48MP cameras with 70mm 3x medium telephoto compression and 46-min endurance.",
      keyMetrics: [
        { value: "Dual", unit: "48MP CMOS", label: "Primary Optics" },
        { value: "46m", unit: "Max Flight", label: "Airborne Endurance" },
        { value: "20km", unit: "O4 Video", label: "FHD Transmission" },
        { value: "3x", unit: "Medium Tele", label: "Optical Compression" },
      ],
      inTheBox: [
        { name: "DJI Air 3 Aircraft", quantity: 1, imageUrl: "/images/dji-air-3s.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Shoulder Bag", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-A2S-FMC",
    name: "DJI Air 2S Fly More Combo",
    slug: "dji-air-2s-flymore-combo",
    category_slug: "air-series",
    base_price_inr: 89990,
    stock_quantity: 5,
    description:
      "1-inch CMOS sensor, 5.4K video, MasterShots, and 12km FHD transmission. Includes 3 intelligent flight batteries, ND filters set, and shoulder bag.",
    is_second_hand: false,
    image_url: "/images/dji-air-3s.jpg",
    flight_time_minutes: 31,
    weight_grams: 595,
  },

  // --- AVATA & FPV SERIES (2 Products) ---
  {
    sku: "DRN-DJI-AV360-RC2",
    name: "DJI Avata 360 Fly More Combo (DJI RC 2)",
    slug: "dji-avata-360-flymore-combo-rc2",
    category_slug: "avata-series",
    base_price_inr: 119990,
    stock_quantity: 7,
    description:
      "360-degree immersive aerial capture, ultra-stabilized 4K cinematic FPV, built-in prop guards, and DJI RC 2 high-brightness screen remote controller.",
    is_second_hand: false,
    image_url: "/images/dji-avata-2.jpg",
    flight_time_minutes: 25,
    weight_grams: 410,
    showcase: {
      mrpPricePaise: 13499000,
      emiStartsFromPaise: 699900,
      warrantyMonths: 12,
      heroBadge: "360 IMMERSIVE MOTION",
      heroHeadline: "Avata 360.",
      heroSubtitle: "Complete 360-degree spherical capture with built-in propeller safety and motion-tuned FPV agility.",
      keyMetrics: [
        { value: "360°", unit: "Capture", label: "Full Sphere Video" },
        { value: "4K/60", unit: "RockSteady", label: "Stabilization" },
        { value: "RC 2", unit: "FHD Display", label: "Screen Remote" },
        { value: "Built-in", unit: "Prop Guards", label: "Safety Armor" },
      ],
      inTheBox: [
        { name: "DJI Avata 360 Aircraft", quantity: 1, imageUrl: "/images/dji-avata-2.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Two-Way Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-AV360-N3",
    name: "DJI Avata 360 Fly More Combo (DJI RC-N3)",
    slug: "dji-avata-360-flymore-combo-n3",
    category_slug: "avata-series",
    base_price_inr: 99990,
    stock_quantity: 8,
    description:
      "360-degree immersive aerial capture, ultra-stabilized 4K cinematic FPV, built-in prop guards, paired with smartphone-integrated DJI RC-N3 remote controller.",
    is_second_hand: false,
    image_url: "/images/dji-avata-2.jpg",
    flight_time_minutes: 25,
    weight_grams: 410,
    showcase: {
      mrpPricePaise: 11499000,
      emiStartsFromPaise: 599900,
      warrantyMonths: 12,
      heroBadge: "FPV AGILITY",
      heroHeadline: "Avata 360 (N3 Pack).",
      heroSubtitle: "Smartphone-driven FPV experience with intuitive controls, compact transit, and 3-battery combo pack.",
      keyMetrics: [
        { value: "360°", unit: "Capture", label: "Spherical FOV" },
        { value: "RC-N3", unit: "Phone Clamp", label: "Ultra Light" },
        { value: "3x", unit: "LiPo Batteries", label: "Fly More Kit" },
        { value: "4K", unit: "Ultra-Wide", label: "RockSteady 3.0" },
      ],
      inTheBox: [
        { name: "DJI Avata 360 Aircraft", quantity: 1, imageUrl: "/images/dji-avata-2.jpg" },
        { name: "DJI RC-N3 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
      ],
    },
  },

  // --- MINI SERIES (4 Products) ---
  {
    sku: "DRN-DJI-M5P-45M",
    name: "DJI Mini 5 Pro Combo (45-min Plus Battery)",
    slug: "dji-mini-5-pro-combo-45min",
    category_slug: "mini-series",
    base_price_inr: 94990,
    stock_quantity: 12,
    description:
      "Next-gen flagship sub-compact drone with Intelligent Flight Battery Plus delivering up to 45 minutes of continuous airborne endurance, 4K/120fps recording, and night obstacle sensing.",
    is_second_hand: false,
    image_url: "/images/preowned-mini-canyon.jpg",
    flight_time_minutes: 45,
    weight_grams: 289,
    showcase: {
      mrpPricePaise: 10999000,
      emiStartsFromPaise: 549900,
      warrantyMonths: 12,
      heroBadge: "EXTENDED ENDURANCE",
      heroHeadline: "Mini 5 Pro Plus.",
      heroSubtitle: "45-minute continuous flight time with High-Capacity Plus batteries, ActiveTrack 360, and 4K/120fps slow-motion.",
      keyMetrics: [
        { value: "45m", unit: "Endurance", label: "Plus Flight Time" },
        { value: "4K/120", unit: "Pro Video", label: "Cinema Slow-Mo" },
        { value: "Omni", unit: "LiDAR Assist", label: "Obstacle Avoidance" },
        { value: "20km", unit: "O4 HD", label: "Live Telemetry" },
      ],
      inTheBox: [
        { name: "DJI Mini 5 Pro Aircraft", quantity: 1, imageUrl: "/images/preowned-mini-canyon.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries Plus (45m)", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Two-Way Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Shoulder Bag", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-M5P-36M",
    name: "DJI Mini 5 Pro Combo (36-min Standard)",
    slug: "dji-mini-5-pro-combo-36min",
    category_slug: "mini-series",
    base_price_inr: 84990,
    stock_quantity: 15,
    description:
      "Ultralight sub-249g regulatory-friendly drone with 36-minute flight time, omnidirectional active obstacle sensing, and true vertical 4K HDR shooting.",
    is_second_hand: false,
    image_url: "/images/preowned-mini-canyon.jpg",
    flight_time_minutes: 36,
    weight_grams: 249,
    showcase: {
      mrpPricePaise: 9699000,
      emiStartsFromPaise: 499900,
      warrantyMonths: 12,
      heroBadge: "SUB-249G REGULATION READY",
      heroHeadline: "Mini 5 Pro.",
      heroSubtitle: "Sub-249g weight requirement compliant with DGCA India regulations. No license required.",
      keyMetrics: [
        { value: "<249g", unit: "Nano Tier", label: "No License Needed" },
        { value: "36m", unit: "Standard Pack", label: "Battery Life" },
        { value: "True 9:16", unit: "Vertical 4K", label: "Social Media Ready" },
        { value: "Omni", unit: "ActiveSense", label: "Safe RTH" },
      ],
      inTheBox: [
        { name: "DJI Mini 5 Pro Aircraft", quantity: 1, imageUrl: "/images/preowned-mini-canyon.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Standard Flight Batteries (36m)", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Two-Way Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Shoulder Bag", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-M4P-COMBO",
    name: "DJI Mini 4 Pro Fly More Combo",
    slug: "dji-mini-4-pro-combo",
    category_slug: "mini-series",
    base_price_inr: 79990,
    stock_quantity: 10,
    description:
      "Sub-249g travel drone with omnidirectional obstacle sensing, 4K/60fps HDR video, 20km FHD video transmission, and ActiveTrack 360°.",
    is_second_hand: false,
    image_url: "/images/preowned-mini-canyon.jpg",
    flight_time_minutes: 34,
    weight_grams: 249,
  },
  {
    sku: "DRN-DJI-M3-COMBO",
    name: "DJI Mini 3 Fly More Combo",
    slug: "dji-mini-3-combo",
    category_slug: "mini-series",
    base_price_inr: 49990,
    stock_quantity: 14,
    description:
      "Compact, ultralight camera drone ready for adventure. Features extended battery life, stunning 4K HDR video, and true vertical shooting for social media.",
    is_second_hand: false,
    image_url: "/images/preowned-mini-canyon.jpg",
    flight_time_minutes: 38,
    weight_grams: 248,
  },

  // --- MAVIC SERIES (2 Products) ---
  {
    sku: "DRN-DJI-M4P-RC2",
    name: "DJI Mavic 4 Pro (DJI RC 2)",
    slug: "dji-mavic-4-pro-rc2",
    category_slug: "mavic-series",
    base_price_inr: 219990,
    stock_quantity: 4,
    description:
      "Flagship cinematography quadcopter with multi-focal length camera system, next-generation Hasselblad color science, and DJI RC 2 smart controller.",
    is_second_hand: false,
    image_url: "/images/dji-mavic-3-pro.jpg",
    flight_time_minutes: 48,
    weight_grams: 980,
    showcase: {
      mrpPricePaise: 24999000,
      emiStartsFromPaise: 1249900,
      warrantyMonths: 12,
      heroBadge: "CINEMA FLAGSHIP",
      heroHeadline: "Mavic 4 Pro.",
      heroSubtitle: "Triple optical zoom lenses, Hasselblad 4/3 CMOS sensor, and 48-minute endurance for broadcast directors.",
      keyMetrics: [
        { value: "4/3", unit: "CMOS", label: "Hasselblad Sensor" },
        { value: "5.1K/60", unit: "Apple ProRes", label: "Master Recording" },
        { value: "48m", unit: "Max Endurance", label: "Flight Time" },
        { value: "Omni APAS", unit: "360 Radar", label: "Pro Obstacle Safety" },
      ],
      inTheBox: [
        { name: "DJI Mavic 4 Pro Aircraft", quantity: 1, imageUrl: "/images/dji-mavic-3-pro.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Battery Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "ND Filter Set", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
        { name: "Protective Storage Cover", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },
  {
    sku: "DRN-DJI-M4P-CREATOR",
    name: "DJI Mavic 4 Pro Creator Combo",
    slug: "dji-mavic-4-pro-creator-combo",
    category_slug: "mavic-series",
    base_price_inr: 269990,
    stock_quantity: 3,
    description:
      "The definitive production package. Includes DJI Mavic 4 Pro, built-in 2TB SSD, Apple ProRes 422 HQ license, 3x High-Capacity Batteries, DJI RC 2 remote, and Master ND filter set.",
    is_second_hand: false,
    image_url: "/images/dji-mavic-3-pro.jpg",
    flight_time_minutes: 48,
    weight_grams: 980,
    showcase: {
      mrpPricePaise: 29999000,
      emiStartsFromPaise: 1549900,
      warrantyMonths: 12,
      heroBadge: "CREATOR MASTER PACK",
      heroHeadline: "Mavic 4 Pro Creator.",
      heroSubtitle: "2TB Internal High-Speed SSD, full Apple ProRes suite, and broadcast-grade optical glass for production teams.",
      keyMetrics: [
        { value: "2TB", unit: "NVMe SSD", label: "Internal Storage" },
        { value: "ProRes", unit: "422 HQ", label: "Broadcast Codec" },
        { value: "48m", unit: "Max Endurance", label: "Flight Time" },
        { value: "Master ND", unit: "8/16/32/64/128", label: "Cinema Glass" },
      ],
      inTheBox: [
        { name: "DJI Mavic 4 Pro (2TB Cine SSD)", quantity: 1, imageUrl: "/images/dji-mavic-3-pro.jpg" },
        { name: "DJI RC 2 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "High-Capacity Flight Batteries", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "100W GaN Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Master Cinema ND Set", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
        { name: "Creator Leather Transit Case", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      ],
    },
  },

  // --- OFFICIAL ACCESSORIES (7 Products: Batteries, Chargers, Props, Remotes) ---
  {
    sku: "ACC-DJI-RC2",
    name: "DJI RC 2 Remote Controller",
    slug: "dji-rc-2-remote-controller",
    category_slug: "accessories",
    base_price_inr: 27500,
    stock_quantity: 15,
    description: "5.5-inch FHD screen (700 nits), ultra-low latency, and built-in O4 video transmission.",
    is_second_hand: false,
    image_url: "/images/accessory-rc2-remote.jpg",
    weight_grams: 420,
  },
  {
    sku: "ACC-DJI-BAT-AIR3",
    name: "DJI Air 3 / 3S Intelligent Flight Battery",
    slug: "dji-air-3-series-flight-battery",
    category_slug: "accessories",
    base_price_inr: 9490,
    stock_quantity: 25,
    description: "High-density LiPo cell delivering up to 46 minutes of flight endurance with integrated BMS protection.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    flight_time_minutes: 46,
    weight_grams: 267,
  },
  {
    sku: "ACC-DJI-BAT-M4P",
    name: "DJI Mini 4 / Mini 5 Pro Flight Battery Plus",
    slug: "dji-mini-flight-battery-plus",
    category_slug: "accessories",
    base_price_inr: 6990,
    stock_quantity: 30,
    description: "Extended capacity battery enabling up to 45 minutes of flight time for Mini 4 Pro and Mini 5 Pro.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    flight_time_minutes: 45,
    weight_grams: 121,
  },
  {
    sku: "ACC-DJI-CHG-65W",
    name: "DJI 65W GaN Fast Charger",
    slug: "dji-65w-gan-fast-charger",
    category_slug: "accessories",
    base_price_inr: 3990,
    stock_quantity: 20,
    description: "Universal dual-port USB-C GaN fast charging brick compatible with flight batteries and remote controllers.",
    is_second_hand: false,
    image_url: "/images/accessory-battery.jpg",
    weight_grams: 180,
  },
  {
    sku: "ACC-DJI-PROP-LOW",
    name: "DJI Low-Noise Quick-Release Propellers (2 Pairs)",
    slug: "dji-low-noise-propellers",
    category_slug: "accessories",
    base_price_inr: 1490,
    stock_quantity: 50,
    description: "Dynamic balancing for quieter acoustic profile and higher motor aerodynamic efficiency.",
    is_second_hand: false,
    image_url: "/images/diy-propellers.jpg",
    weight_grams: 28,
  },
  {
    sku: "ACC-DJI-ND-SET",
    name: "DJI Optical ND Filter Set (ND8/16/32/64)",
    slug: "dji-optical-nd-filter-set",
    category_slug: "accessories",
    base_price_inr: 4290,
    stock_quantity: 25,
    description: "Precision multi-coated optical glass engineered for correct shutter speed control in sunny environments.",
    is_second_hand: false,
    image_url: "/images/accessory-nd-filters.jpg",
    weight_grams: 25,
  },
  {
    sku: "ACC-DJI-CASE-EXP",
    name: "Explorer Waterproof Hard Safety Case",
    slug: "explorer-waterproof-hard-case",
    category_slug: "accessories",
    base_price_inr: 7490,
    stock_quantity: 12,
    description: "IP67 waterproof ballistic copolymer shell with laser-cut custom EVA foam for drone, RC 2, and 4 batteries.",
    is_second_hand: false,
    image_url: "/images/accessory-hard-case.jpg",
    weight_grams: 1450,
  },

  // --- PRE-OWNED CERTIFIED FLEET (2 Verified Models) ---
  {
    sku: "DRN-SH-M3P",
    name: "Refurbished DJI Mini 3 Pro (Grade A+)",
    slug: "refurbished-dji-mini-3-pro-grade-a",
    category_slug: "used-drones",
    base_price_inr: 39990,
    stock_quantity: 1,
    description: "Certified refurbished DJI Mini 3 Pro. 32-point inspection passed with full warranty and 4 flight hours.",
    is_second_hand: true,
    image_url: "/images/preowned-mini-canyon.jpg",
    flight_time_minutes: 34,
    weight_grams: 249,
    cosmetic_grade: "A",
    flight_hours: 4,
    battery_cycle_count: 5,
    included_accessories: ["RC-N1 Controller", "1x Battery", "Spare Propellers"],
  },
  {
    sku: "DRN-SH-A2S",
    name: "DJI Air 2S Fly More Combo (Certified Pre-Owned Grade A)",
    slug: "dji-air-2s-flymore-combo-certified-grade-a",
    category_slug: "used-drones",
    base_price_inr: 54990,
    stock_quantity: 1,
    description: "1-inch 20MP CMOS sensor, 5.4K video. Complete Fly More Combo bench-tested with 3 batteries and original shoulder bag.",
    is_second_hand: true,
    image_url: "/images/dji-air-3s.jpg",
    flight_time_minutes: 31,
    weight_grams: 595,
    cosmetic_grade: "A",
    flight_hours: 8,
    battery_cycle_count: 6,
    included_accessories: ["3x Original Batteries", "Shoulder Bag", "ND Filters Set", "Charging Hub"],
  },
];

async function runSeed() {
  console.log("🚀 Starting clean catalog database seeding...");

  await db.transaction(async (tx) => {
    // 1. Insert Clean Categories
    const categoryMap = new Map<string, string>();
    for (const cat of CLEAN_CATEGORIES) {
      const [inserted] = await tx
        .insert(schema.categories)
        .values({
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
        })
        .onConflictDoUpdate({
          target: schema.categories.slug,
          set: {
            name: cat.name,
            description: cat.description,
          },
        })
        .returning();
      categoryMap.set(cat.slug, inserted.id);
      console.log(`  ✓ Category: ${cat.name} (${cat.slug})`);
    }

    // 1b. Insert Default Brands (DJI)
    const [djiBrand] = await tx
      .insert(schema.brands)
      .values({
        name: "DJI",
        slug: "dji",
        description:
          "The global leader in civilian drones, aerial imaging systems, and handheld camera technology.",
        websiteUrl: "https://www.dji.com",
      })
      .onConflictDoUpdate({
        target: schema.brands.slug,
        set: {
          name: "DJI",
          websiteUrl: "https://www.dji.com",
        },
      })
      .returning();
    console.log(`  ✓ Brand: ${djiBrand.name} (${djiBrand.slug})`);

    // 2. Insert Products
    for (const record of CATALOG_RECORDS) {
      const categoryId = categoryMap.get(record.category_slug);
      if (!categoryId) {
        console.warn(`  ⚠️ Category ${record.category_slug} not found for ${record.name}`);
        continue;
      }

      const basePricePaise = Math.round(record.base_price_inr * 100);

      const [product] = await tx
        .insert(schema.products)
        .values({
          categoryId,
          brandId: djiBrand.id,
          brand: "DJI",
          sku: record.sku,
          slug: record.slug,
          name: record.name,
          description: record.description,
          basePricePaise,
          stockQuantity: record.stock_quantity,
          isSecondHand: record.is_second_hand,
          status: "active",
        })
        .onConflictDoUpdate({
          target: schema.products.sku,
          set: {
            brandId: djiBrand.id,
            brand: "DJI",
            slug: record.slug,
            name: record.name,
            description: record.description,
            basePricePaise,
            stockQuantity: record.stock_quantity,
            isSecondHand: record.is_second_hand,
            status: "active",
          },
        })
        .returning();

      // 3. Drone Specifications
      if (record.flight_time_minutes || record.weight_grams) {
        await tx
          .insert(schema.droneSpecifications)
          .values({
            productId: product.id,
            flightTimeMinutes: record.flight_time_minutes || null,
            weightGrams: record.weight_grams || null,
          })
          .onConflictDoUpdate({
            target: schema.droneSpecifications.productId,
            set: {
              flightTimeMinutes: record.flight_time_minutes || null,
              weightGrams: record.weight_grams || null,
            },
          });
      }

      // 4. Second-hand Details
      if (record.is_second_hand && (record as any).cosmetic_grade) {
        await tx
          .insert(schema.secondHandDetails)
          .values({
            productId: product.id,
            cosmeticGrade: (record as any).cosmetic_grade,
            flightHours: (record as any).flight_hours || 0,
            batteryCycleCount: (record as any).battery_cycle_count || 0,
            includedAccessories: (record as any).included_accessories || [],
            inspectionNotes: "32-point technician bench test passed 100%. Flawless motor telemetry and gimbal alignment.",
          })
          .onConflictDoUpdate({
            target: schema.secondHandDetails.productId,
            set: {
              cosmeticGrade: (record as any).cosmetic_grade,
              flightHours: (record as any).flight_hours || 0,
              batteryCycleCount: (record as any).battery_cycle_count || 0,
              includedAccessories: (record as any).included_accessories || [],
            },
          });
      }

      // 5. Product Media
      await tx
        .insert(schema.productMedia)
        .values({
          productId: product.id,
          mediaType: "image",
          storageProvider: "r2",
          url: record.image_url,
          displayOrder: 0,
        })
        .onConflictDoNothing();

      // 6. Product Showcase (if available)
      if ((record as any).showcase) {
        const sc = (record as any).showcase;
        await tx
          .insert(schema.productShowcases)
          .values({
            productId: product.id,
            mrpPricePaise: sc.mrpPricePaise,
            warrantyMonths: sc.warrantyMonths || 12,
            heroBadge: sc.heroBadge,
            heroHeadline: sc.heroHeadline,
            heroSubtitle: sc.heroSubtitle,
            heroExplodedLayoutUrl: record.image_url,
            keyMetrics: sc.keyMetrics || [],
            inTheBox: sc.inTheBox || [],
          })
          .onConflictDoUpdate({
            target: schema.productShowcases.productId,
            set: {
              mrpPricePaise: sc.mrpPricePaise,
              warrantyMonths: sc.warrantyMonths || 12,
              heroBadge: sc.heroBadge,
              heroHeadline: sc.heroHeadline,
              heroSubtitle: sc.heroSubtitle,
              heroExplodedLayoutUrl: record.image_url,
              keyMetrics: sc.keyMetrics || [],
              inTheBox: sc.inTheBox || [],
            },
          });
      }

      console.log(`  ✓ Product: ${record.name} (${record.sku}) - ₹${record.base_price_inr}`);
    }
  });

  console.log("✅ Clean catalog seeding completed successfully!");
  process.exit(0);
}

runSeed().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
