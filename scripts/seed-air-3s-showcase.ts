import { db } from "../src/lib/db";
import { productShowcases, products } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const air3s = await db.query.products.findFirst({
    where: eq(products.sku, "DRN-DJI-A3S"),
  });

  if (!air3s) {
    console.error("Air 3S not found in products table.");
    process.exit(1);
  }

  const showcaseData = {
    productId: air3s.id,
    mrpPricePaise: 14999000,
    emiStartsFromPaise: 849900,
    warrantyMonths: 12,
    heroBadge: "REAL DETAIL AIR",
    heroHeadline: "Air 3S.",
    heroSubtitle:
      "Dual-camera 1-inch CMOS primary sensor, 4K/60fps HDR video, and next-gen nightscape omnidirectional obstacle sensing.",
    heroExplodedLayoutUrl: "/images/dji-air-3s.jpg",
    keyMetrics: [
      { value: "1\"", unit: "CMOS", label: "Primary Sensor" },
      { value: "4K", unit: "60fps HDR", label: "Video Fidelity" },
      { value: "45m", unit: "Max Flight", label: "Airborne Endurance" },
      { value: "89%", unit: "Night LiDAR", label: "Omni APAS 5.0" },
    ],
    storyBlocks: [
      {
        id: "perspective",
        tag: "DUAL-CAMERA MASTERY",
        title: "Wide and tele. Two perspectives.",
        description:
          "Equipped with a 1-inch CMOS primary camera and a 70mm medium tele camera, each boasting up to 14 stops of dynamic range to capture dramatic landscapes and compressed portraits with true optical depth.",
        specBadges: ["1\" CMOS Primary", "70mm Medium Tele", "14 Stops Dynamic Range"],
        mediaUrl: "/images/journal-mountain-snow.jpg",
        alignment: "center" as const,
      },
      {
        id: "sensors",
        tag: "NIGHTSCAPE SAFETY",
        title: "Precision night sensing. Day and night safety.",
        description:
          "Forward-facing LiDAR combined with downward infrared ToF sensors and omnidirectional vision cameras deliver proactive obstacle braking, allowing confident low-light cinematic tracking.",
        specBadges: ["Forward LiDAR", "Omnidirectional Vision", "Next-Gen Smart RTH"],
        mediaUrl: "/images/dji-air-3s.jpg",
        alignment: "left" as const,
      },
      {
        id: "airframe",
        tag: "AERODYNAMIC AIRFRAME",
        title: "Extended endurance. 45-minute flight time.",
        description:
          "Engineered for uncompromised exploration across remote frontiers. Capture expansive 360-degree panoramas and navigate gusty high-altitude terrain with 12 m/s wind resistance.",
        specBadges: ["45-Min Battery Life", "21 m/s Max Speed", "O4 20km Video Feed"],
        mediaUrl: "/images/altitude-hero-bg.jpg",
        alignment: "right" as const,
      },
      {
        id: "cinematography",
        tag: "TRUE COLOR SCIENCE",
        title: "10-bit D-Log M & HLG. Lifelike clarity.",
        description:
          "Master color grading with rich shadow and highlight retention. 4K/120fps slow motion captures fleeting high-speed maneuvers with ultra-smooth cinematic fidelity.",
        specBadges: ["10-bit D-Log M", "4K/120fps Slow-Mo", "42GB Built-in Storage"],
        mediaUrl: "/images/journal-cinematic-road.jpg",
        alignment: "left" as const,
      },
    ],
    multiAngles: [
      { label: "Combo Pack View", imageUrl: "/images/dji-air-3s.jpg" },
      { label: "Front Optics Angle", imageUrl: "/images/dji-mavic-3-pro.jpg" },
      { label: "Aerial Top Silhouette", imageUrl: "/images/altitude-hero-bg.jpg" },
      { label: "Folded Profile", imageUrl: "/images/preowned-mini-canyon.jpg" },
    ],
    comparisonData: {
      targetModelName: "DJI Mavic 3 Pro",
      targetModelImage: "/images/dji-mavic-3-pro.jpg",
      specRows: [
        { label: "Takeoff Weight", currentModelValue: "724 g", targetModelValue: "958 g" },
        { label: "Max Flight Time", currentModelValue: "45 mins", targetModelValue: "43 mins" },
        { label: "Primary Camera", currentModelValue: "1-inch CMOS 50MP", targetModelValue: "4/3 CMOS Hasselblad" },
        { label: "Telephoto Optics", currentModelValue: "70mm Medium Tele", targetModelValue: "70mm & 166mm Dual Tele" },
        { label: "Obstacle Sensing", currentModelValue: "Forward LiDAR + Omni Vision", targetModelValue: "Omnidirectional APAS 5.0" },
        { label: "Video Transmission", currentModelValue: "DJI O4 (20 km FHD)", targetModelValue: "DJI O3+ (15 km FHD)" },
        { label: "Internal Storage", currentModelValue: "42 GB High-Speed", targetModelValue: "8 GB Standard" },
      ],
    },
    regulatoryFaqs: [
      {
        question: "Does this drone require a DGCA Remote Pilot Certificate in India?",
        answer:
          "The DJI Air 3S has a takeoff weight of 724g, classifying it as a 'Micro Drone' (250g to 2kg) under Indian Drone Rules 2021. For non-commercial recreational flying in Green Zones up to 400ft AGL, a Remote Pilot Certificate is not mandatory, but registering on Digital Sky to obtain a UIN (Unique Identification Number) is required.",
      },
      {
        question: "How does Digital Sky Green Zone flying work?",
        answer:
          "Under the DGCA airspace map, Green Zones are airspace up to 400 feet (120 meters) that do not require prior flight permission. Yellow and Red zones (near airports and defense installations) require automated or manual ATC clearance via Digital Sky.",
      },
      {
        question: "Can I claim GST and commercial insurance for business use?",
        answer:
          "Yes! Altitude provides official GST invoices with your company's GSTIN and state code, allowing 100% input tax credit (ITC). Third-party liability insurance is readily available for commercial survey and cinematic operations.",
      },
    ],
    techSpecsGrouped: {
      "Aircraft": {
        "Takeoff Weight": "724 grams",
        "Dimensions (Folded)": "214.19 × 100.63 × 89.17 mm",
        "Dimensions (Unfolded)": "258.82 × 326.19 × 105.89 mm",
        "Max Ascent Speed": "10 m/s",
        "Max Descent Speed": "10 m/s",
        "Max Horizontal Speed": "21 m/s (approx. 75.6 km/h)",
        "Max Wind Speed Resistance": "12 m/s",
        "Max Takeoff Altitude": "6000 m",
      },
      "Camera System": {
        "Primary Sensor": "1-inch CMOS, 50 MP Effective Pixels",
        "Medium Tele Sensor": "1/1.3-inch CMOS, 48 MP Effective Pixels",
        "Primary Lens": "Format Equivalent: 24 mm, Aperture: f/1.8",
        "Telephoto Lens": "Format Equivalent: 70 mm, Aperture: f/2.8",
        "ISO Range": "Video: 100-12800 (D-Log M: 100-3200); Photo: 100-6400",
        "Max Video Resolution": "4K (3840×2160) @ 60fps HDR, up to 120fps",
        "Color Profiles": "10-bit D-Log M, 10-bit HLG, 8-bit Normal",
      },
      "Gimbal & Stabilization": {
        "Stabilization": "3-axis mechanical gimbal (tilt, roll, pan)",
        "Mechanical Range": "Tilt: -135° to 70°, Roll: -50° to 50°, Pan: -27° to 27°",
        "Max Control Speed": "100°/s",
      },
      "Sensing & Safety": {
        "Sensing Type": "Omnidirectional obstacle sensing system",
        "Forward Sensor": "Forward LiDAR distance measurement + Dual Vision",
        "Precision Measurement Range": "0.5 to 30 m",
        "Nightscape Assistance": "Active LiDAR surface reflection down to 0.1 lux",
      },
      "Battery & Power": {
        "Capacity": "4276 mAh",
        "Battery Type": "Li-ion 4S",
        "Weight": "247 g",
        "Nominal Voltage": "14.6 V",
        "Max Charging Power": "65W USB-C PD / 100W Hub",
      },
      "Video Transmission": {
        "System": "DJI O4 Transmission",
        "Live View Quality": "1080p @ 60fps",
        "Operating Frequencies": "2.4 GHz, 5.1 GHz, 5.8 GHz",
        "Max Transmission Distance": "20 km (FCC), 10 km (CE/SRRC/MIC)",
      },
    },
    inTheBox: [
      { name: "DJI Air 3S Aircraft", quantity: 1, imageUrl: "/images/dji-air-3s.jpg" },
      { name: "DJI RC 2 Smart Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
      { name: "Intelligent Flight Battery", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
      { name: "Battery Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
      { name: "ND Filter Set (ND8/16/32/64)", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
      { name: "Shoulder Carrying Case", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
      { name: "Low-Noise Propellers (Pair)", quantity: 3, imageUrl: "/images/diy-propellers.jpg" },
      { name: "Type-C to Type-C PD Cable", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
    ],
    faqs: [
      {
        question: "Does the combo pack include the screen remote controller?",
        answer: "Yes, the Fly More Combo includes the flagship DJI RC 2 controller with an ultra-bright 5.5-inch 700-nit FHD screen, eliminating the need to connect a smartphone.",
      },
      {
        question: "What is the warranty coverage provided by Altitude?",
        answer: "All aircraft sold by Altitude include a 1-year official hardware & software warranty, verified through official DJI service channels with zero parallel-import hassle.",
      },
    ],
    longFormSeoArticle:
      "The DJI Air 3S represents the benchmark in dual-camera compact aviation. Designed specifically for professional creators, commercial pilots, and expedition filmmakers, the aircraft integrates a large 1-inch CMOS sensor with an aperture of f/1.8 alongside a 70mm medium telephoto lens. The forward-facing LiDAR system provides nightscape obstacle sensing never before seen in an airframe under 800 grams. Powered by the O4 HD video transmission protocol with up to 20 kilometers of reach, the Air 3S maintains a rock-solid 1080p/60fps video feed through signal-congested urban and dense forested topographies. Available now with guaranteed GST billing, insured transit across India, and DGCA Digital Sky compliance certification at Altitude Aviation Tech.",
  };

  await db
    .insert(productShowcases)
    .values(showcaseData)
    .onConflictDoUpdate({
      target: productShowcases.productId,
      set: showcaseData,
    });

  console.log("SUCCESS: Air 3S showcase data inserted/updated successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding error:", e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
