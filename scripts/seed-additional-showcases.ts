import { db } from "../src/lib/db";
import { productShowcases, products } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Seeding additional flagship drone showcases...");

  // 1. DJI Mavic 3 Pro (DRN-DJI-M3P)
  const mavic3Pro = await db.query.products.findFirst({
    where: eq(products.sku, "DRN-DJI-M3P"),
  });

  if (mavic3Pro) {
    const mavicShowcase = {
      productId: mavic3Pro.id,
      mrpPricePaise: 24999000,
      emiStartsFromPaise: 1399900,
      warrantyMonths: 12,
      heroBadge: "INSPIRATION IN FOCUS",
      heroHeadline: "Mavic 3 Pro.",
      heroSubtitle:
        "Triple-camera system featuring Hasselblad 4/3 CMOS, 70mm medium tele, and 166mm telephoto camera with Apple ProRes support.",
      heroExplodedLayoutUrl: "/images/dji-mavic-3-pro.jpg",
      keyMetrics: [
        { value: "4/3", unit: "CMOS", label: "Hasselblad Optics" },
        { value: "5.1K", unit: "50fps Apple ProRes", label: "Cinematic Capture" },
        { value: "43m", unit: "Max Flight", label: "Extended Range" },
        { value: "15km", unit: "O3+ Transmission", label: "FHD Low Latency" },
      ],
      storyBlocks: [
        {
          id: "triple-lens",
          tag: "TRIPLE-CAMERA IMAGING SYSTEM",
          title: "Three focal lengths. Endless framing possibilities.",
          description:
            "With a 24mm Hasselblad wide camera, 70mm medium telephoto, and 166mm telephoto camera, Mavic 3 Pro lets you effortlessly switch perspectives across diverse cinematic scenarios.",
          specBadges: ["4/3 CMOS 20MP", "1/1.3\" CMOS 48MP", "1/2\" CMOS 12MP"],
          mediaUrl: "/images/journal-cinematic-road.jpg",
          alignment: "center" as const,
        },
        {
          id: "hasselblad-color",
          tag: "NATURAL COLOR SCIENCE",
          title: "Hasselblad Natural Colour Solution (HNCS).",
          description:
            "Delivers vivid, accurate colors straight out of the camera without heavy post-processing presets. 10-bit D-Log M color profile records up to one billion colors.",
          specBadges: ["10-bit D-Log M", "HNCS Technology", "Night Shots Video"],
          mediaUrl: "/images/journal-mountain-snow.jpg",
          alignment: "left" as const,
        },
        {
          id: "prores-pipeline",
          tag: "PROFESSIONAL VIDEO WORKFLOW",
          title: "All-intra Apple ProRes 422 HQ encoding.",
          description:
            "Supports Apple ProRes 422 HQ, ProRes 422, and ProRes 422 LT encoding across all three cameras, with a built-in 1TB SSD for lightning-fast broadcast ingest.",
          specBadges: ["ProRes 422 HQ", "Built-in 1TB SSD", "High-Speed QuickTransfer"],
          mediaUrl: "/images/altitude-hero-bg.jpg",
          alignment: "right" as const,
        },
      ],
      multiAngles: [
        { label: "Front Sensor Array", imageUrl: "/images/dji-mavic-3-pro.jpg" },
        { label: "Aerodynamic Profile", imageUrl: "/images/dji-mavic-3-pro.jpg" },
        { label: "Folded Architecture", imageUrl: "/images/dji-mavic-3-pro.jpg" },
      ],
      comparisonData: {
        targetModelName: "DJI Inspire 3",
        targetModelImage: "/images/dji-air-3s.jpg",
        specRows: [
          { label: "Takeoff Weight", currentModelValue: "958 g", targetModelValue: "3,995 g" },
          { label: "Max Flight Time", currentModelValue: "43 mins", targetModelValue: "28 mins" },
          { label: "Primary Sensor", currentModelValue: "4/3 CMOS Hasselblad", targetModelValue: "Full-Frame 35mm 8K" },
          { label: "Optical Zoom", currentModelValue: "3x & 7x Optical (28x Hybrid)", targetModelValue: "Interchangeable DL Mount" },
          { label: "Transmission", currentModelValue: "DJI O3+ (15 km)", targetModelValue: "DJI O3 Pro (15 km dual-pilot)" },
          { label: "Built-in Storage", currentModelValue: "1 TB SSD (Cine Edition)", targetModelValue: "1 TB PROSSD" },
        ],
      },
      regulatoryFaqs: [
        {
          question: "What DGCA flight category does Mavic 3 Pro belong to in India?",
          answer:
            "At 958g takeoff weight, the Mavic 3 Pro falls under the 'Micro Drone' category (250g - 2kg). Commercial operations require registration on the DGCA Digital Sky portal to receive an official Unique Identification Number (UIN).",
        },
        {
          question: "Can I use Mavic 3 Pro for paid commercial cinematography?",
          answer:
            "Yes! Micro drones are fully legal for commercial cinematography, surveying, and aerial mapping in India under Drone Rules 2021 when flown in Green Zones up to 400ft AGL with third-party liability insurance.",
        },
        {
          question: "Does Altitude provide genuine Indian warranty for Mavic 3 Pro?",
          answer:
            "Altitude is an authorised vendor. Every aircraft includes valid customs clearance, serial-tracked tax invoice with GSTIN, and full 1-year manufacturer warranty.",
        },
      ],
      techSpecsGrouped: {
        "Aircraft": {
          "Takeoff Weight": "958 grams (Mavic 3 Pro Cine: 963 g)",
          "Dimensions (Folded)": "231.1 × 98 × 95.4 mm",
          "Dimensions (Unfolded)": "347.5 × 290.8 × 107.7 mm",
          "Max Ascent Speed": "8 m/s",
          "Max Descent Speed": "6 m/s",
          "Max Horizontal Speed": "21 m/s (approx. 75.6 km/h)",
          "Max Wind Resistance": "12 m/s",
        },
        "Hasselblad Primary Camera": {
          "Sensor": "4/3 CMOS, 20 MP Effective Pixels",
          "Lens": "Format Equivalent: 24 mm, Aperture: f/2.8 - f/11 adjustable",
          "ISO Range": "Video: 100-6400 (Night: up to 12800); Photo: 100-6400",
          "Max Video Resolution": "5.1K (5120×2700) @ 50fps, 4K DCI @ 120fps",
          "Color Profiles": "10-bit D-Log, 10-bit D-Log M, 10-bit HLG",
        },
        "Medium Telephoto Camera": {
          "Sensor": "1/1.3-inch CMOS, 48 MP Effective Pixels",
          "Lens": "Format Equivalent: 70 mm, Aperture: f/2.8",
          "Max Video": "4K (3840×2160) @ 60fps",
        },
        "Telephoto Camera": {
          "Sensor": "1/2-inch CMOS, 12 MP Effective Pixels",
          "Lens": "Format Equivalent: 166 mm, Aperture: f/3.4",
          "Hybrid Zoom": "28x",
        },
        "Power & Transmission": {
          "Battery Capacity": "5000 mAh LiPo 4S",
          "Max Flight Time": "43 minutes",
          "Transmission System": "DJI O3+",
          "Max Range": "15 km (FCC), 8 km (CE)",
        },
      },
      inTheBox: [
        { name: "DJI Mavic 3 Pro Aircraft", quantity: 1, imageUrl: "/images/dji-mavic-3-pro.jpg" },
        { name: "DJI RC Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Battery", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "100W Battery Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "ND Filter Set (ND8/16/32/64)", quantity: 1, imageUrl: "/images/accessory-nd-filters.jpg" },
        { name: "Shoulder Travel Bag", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
        { name: "Low-Noise Propellers (Pairs)", quantity: 6, imageUrl: "/images/diy-propellers.jpg" },
        { name: "100W USB-C Power Adapter", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
      ],
      longFormSeoArticle: `
        The DJI Mavic 3 Pro stands as the undisputed benchmark for aerial cinematography and commercial creative workflows. Featuring a world-first triple optical camera payload anchored by an iconic Hasselblad 4/3 CMOS sensor, the aircraft unlocks an unprecedented range of visual storytelling without swapping bulky lenses in the field.

        ### Tri-Camera Focal Mastery
        With dedicated 24mm, 70mm, and 166mm focal lengths, directors and solo creators can transition from expansive environmental framing to intimate subject compression in a single flight. The Hasselblad wide-angle camera captures 5.1K video at 50fps with 12.8 stops of native dynamic range, ensuring subtle highlight gradations and deep shadow information.

        ### Safety and Advanced Omnidirectional Avionics
        Equipped with eight wide-angle vision sensors that cooperate seamlessly with a high-performance vision computing engine, the Mavic 3 Pro senses obstacles in all directions and plans safe bypass trajectories via APAS 5.0. Advanced Return-to-Home ensures the drone calculates the shortest, safest route back to the takeoff point automatically.
      `,
    };

    await db
      .insert(productShowcases)
      .values(mavicShowcase)
      .onConflictDoUpdate({
        target: productShowcases.productId,
        set: mavicShowcase,
      });

    console.log("Seeded Mavic 3 Pro showcase successfully!");
  }

  // 2. DJI Avata 2 (DRN-DJI-AV2)
  const avata2 = await db.query.products.findFirst({
    where: eq(products.sku, "DRN-DJI-AV2"),
  });

  if (avata2) {
    const avataShowcase = {
      productId: avata2.id,
      mrpPricePaise: 11999000,
      emiStartsFromPaise: 649900,
      warrantyMonths: 12,
      heroBadge: "ALL-AROUND FPV IMMERSION",
      heroHeadline: "Avata 2.",
      heroSubtitle:
        "4K/60fps HDR ultra-wide 155° FOV, integrated propeller guards, Easy ACRO flips & rolls, and RockSteady 3.0+ stabilization.",
      heroExplodedLayoutUrl: "/images/dji-avata-2.jpg",
      keyMetrics: [
        { value: "155°", unit: "Ultra-Wide", label: "Immersive FOV" },
        { value: "4K", unit: "60fps HDR", label: "RockSteady 3.0+" },
        { value: "23m", unit: "Max Flight", label: "Agile Airborne Time" },
        { value: "0-Lag", unit: "O4 Video", label: "24ms Low Latency" },
      ],
      storyBlocks: [
        {
          id: "acro",
          tag: "EASY ACRO FLIGHT",
          title: "One-push flips, rolls, and 180° drifts.",
          description:
            "Execute jaw-dropping aerobatics with a single push of the DJI RC Motion 3 joystick. Even novice pilots can capture thrilling high-adrenaline FPV footage effortlessly.",
          specBadges: ["One-Push Flip", "One-Push Roll", "180° One-Push Drift"],
          mediaUrl: "/images/altitude-hero-bg.jpg",
          alignment: "center" as const,
        },
        {
          id: "guard",
          tag: "INTEGRATED PROPELLER GUARDS",
          title: "Built-in protection for close-quarters flying.",
          description:
            "Lighter, more agile airframe with aerodynamic integrated prop guards. Turtle Mode automatically flips the drone right-side up if it ever lands upside down.",
          specBadges: ["Integrated Prop Guards", "Turtle Mode Auto-Flip", "Downward Binocular ToF"],
          mediaUrl: "/images/dji-avata-2.jpg",
          alignment: "left" as const,
        },
        {
          id: "goggles",
          tag: "DJI GOGGLES 3 ECOSYSTEM",
          title: "Real View PiP and micro-OLED high definition.",
          description:
            "Dual micro-OLED 1080p displays with up to 100Hz refresh rate. Real View Picture-in-Picture allows you to observe your physical surroundings without removing your goggles.",
          specBadges: ["Dual 1080p micro-OLED", "100Hz Refresh Rate", "Real View PiP"],
          mediaUrl: "/images/journal-cinematic-road.jpg",
          alignment: "right" as const,
        },
      ],
      multiAngles: [
        { label: "Front Camera Array", imageUrl: "/images/dji-avata-2.jpg" },
        { label: "Prop Guard Cockpit", imageUrl: "/images/dji-avata-2.jpg" },
        { label: "Top Aerodynamic Canopy", imageUrl: "/images/dji-avata-2.jpg" },
      ],
      comparisonData: {
        targetModelName: "DJI Avata (Gen 1)",
        targetModelImage: "/images/dji-air-3s.jpg",
        specRows: [
          { label: "Takeoff Weight", currentModelValue: "377 g (Lighter)", targetModelValue: "410 g" },
          { label: "Max Flight Time", currentModelValue: "23 mins", targetModelValue: "18 mins" },
          { label: "Image Sensor", currentModelValue: "1/1.3-inch CMOS Super-Wide", targetModelValue: "1/1.7-inch CMOS" },
          { label: "Video Transmission", currentModelValue: "DJI O4 (13 km, 24ms)", targetModelValue: "DJI O3+ (10 km, 30ms)" },
          { label: "Acrobatics", currentModelValue: "Easy ACRO (1-Push Auto)", targetModelValue: "Manual Mode Only" },
          { label: "Internal Storage", currentModelValue: "46 GB Ultra-Fast", targetModelValue: "20 GB Standard" },
        ],
      },
      regulatoryFaqs: [
        {
          question: "Can I fly the Avata 2 legally in India?",
          answer:
            "Yes! Avata 2 has an all-up takeoff weight of 377g, falling in the Micro category (250g-2kg). As per Indian Drone Rules 2021, you can fly in Green Zones up to 400ft AGL after registering on Digital Sky for a UIN.",
        },
        {
          question: "Do I need a spotter when flying with DJI Goggles 3 in India?",
          answer:
            "Under DGCA guidelines for First Person View (FPV) operations, having a visual observer (spotter) maintaining direct Visual Line of Sight (VLOS) with the aircraft is recommended for safe compliance.",
        },
      ],
      techSpecsGrouped: {
        "Aircraft": {
          "Takeoff Weight": "Approx. 377 grams",
          "Dimensions": "185 × 212 × 64 mm",
          "Max Ascent Speed": "9 m/s",
          "Max Descent Speed": "9 m/s",
          "Max Horizontal Speed": "27 m/s (approx. 97.2 km/h in Manual Mode)",
          "Max Flight Time": "Approx. 23 minutes",
        },
        "Camera": {
          "Sensor": "1/1.3-inch image sensor, 12 MP",
          "Lens": "FOV: 155°, Format Equivalent: 12 mm, Aperture: f/2.8",
          "Video Resolution": "4K (3840×2160) @ 60fps HDR, 2.7K up to 120fps",
          "Stabilization": "RockSteady 3.0+ and HorizonSteady",
          "Color Profile": "10-bit D-Log M",
        },
        "Transmission & Battery": {
          "Transmission System": "DJI O4 Video Transmission",
          "Live View Latency": "Down to 24 ms",
          "Battery Capacity": "2150 mAh Li-ion",
          "Internal Storage": "46 GB",
        },
      },
      inTheBox: [
        { name: "DJI Avata 2 Aircraft", quantity: 1, imageUrl: "/images/dji-avata-2.jpg" },
        { name: "DJI Goggles 3", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "DJI RC Motion 3", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Intelligent Flight Battery", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Two-Way Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Sling Backpack", quantity: 1, imageUrl: "/images/accessory-hard-case.jpg" },
        { name: "Propellers (Pair)", quantity: 2, imageUrl: "/images/diy-propellers.jpg" },
        { name: "Gimbal Protector", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
      ],
      longFormSeoArticle: `
        The DJI Avata 2 delivers a completely reimagined FPV flying experience, blending pulse-pounding aerobatic maneuverability with state-of-the-art camera stabilization and bulletproof safety features. Built with an aerodynamic ducted chassis and low-center-of-gravity battery placement, it provides unmatched authority through narrow indoor corridors and dense forest trails.

        ### Intuitive Motion Control & Easy ACRO
        Gone are the days where high-speed FPV maneuvers required hundreds of hours of simulator practice. With the bundled DJI RC Motion 3 and the one-push Easy ACRO toggle, pilots can perform 360-degree backflips, barrel rolls, and high-speed drift turns with fluid precision.

        ### O4 Video Transmission & Micro-OLED Immersion
        Connected to DJI Goggles 3, the Avata 2 features next-generation DJI O4 transmission capable of transmitting pristine 1080p/100fps video up to 13 km with ultra-low 24ms latency. High-bitrate video capture ensures zero breakup during rapid transitions between shadows and bright daylight.
      `,
    };

    await db
      .insert(productShowcases)
      .values(avataShowcase)
      .onConflictDoUpdate({
        target: productShowcases.productId,
        set: avataShowcase,
      });

    console.log("Seeded Avata 2 showcase successfully!");
  }

  // 3. DJI Neo (DRN-DJI-NEO)
  const neo = await db.query.products.findFirst({
    where: eq(products.sku, "DRN-DJI-NEO"),
  });

  if (neo) {
    const neoShowcase = {
      productId: neo.id,
      mrpPricePaise: 3499000,
      emiStartsFromPaise: 189900,
      warrantyMonths: 12,
      heroBadge: "FROM PALM TO SKY",
      heroHeadline: "DJI Neo.",
      heroSubtitle:
        "135g ultra-lightweight palm takeoff vlogging drone. AI subject tracking, 4K ultra-stabilized video, and full-coverage propeller guards.",
      heroExplodedLayoutUrl: "/images/dji-neo-palm.jpg",
      keyMetrics: [
        { value: "135g", unit: "Ultra-Light", label: "Pocket Form Factor" },
        { value: "4K", unit: "Ultra-HD", label: "RockSteady & HorizonBalancing" },
        { value: "0-App", unit: "Palm Launch", label: "One-Button Takeoff" },
        { value: "18m", unit: "Flight Time", label: "Extended Vlogging" },
      ],
      storyBlocks: [
        {
          id: "palm-takeoff",
          tag: "HANDHELD LAUNCH & LANDING",
          title: "Palm takeoff. No remote controller required.",
          description:
            "Take off and land directly from the palm of your hand with a single push of the mode button. Choose from QuickShots like Dronie, Circle, Rocket, and Spotlight effortlessly.",
          specBadges: ["135g Zero-Hassle Weight", "Palm Takeoff & Landing", "6 Smart AI Shooting Modes"],
          mediaUrl: "/images/dji-neo-palm.jpg",
          alignment: "center" as const,
        },
        {
          id: "ai-tracking",
          tag: "AI SUBJECT TRACKING",
          title: "Your personal AI photographer in your pocket.",
          description:
            "Whether you are cycling, skateboarding, or hiking, Neo keeps you locked in the center of the frame using advanced computer vision tracking algorithms.",
          specBadges: ["AI Subject Tracking", "DirectionTrack & Follow", "Full Propeller Protection"],
          mediaUrl: "/images/journal-mountain-snow.jpg",
          alignment: "left" as const,
        },
      ],
      multiAngles: [
        { label: "Palm Perspective", imageUrl: "/images/dji-neo-palm.jpg" },
        { label: "Top Ducted Airframe", imageUrl: "/images/dji-neo-palm.jpg" },
      ],
      comparisonData: {
        targetModelName: "DJI Mini 4K",
        targetModelImage: "/images/dji-air-3s.jpg",
        specRows: [
          { label: "Takeoff Weight", currentModelValue: "135 g (Pocket size)", targetModelValue: "249 g" },
          { label: "Palm Launch", currentModelValue: "Yes (Controller-free)", targetModelValue: "No (Controller required)" },
          { label: "Propeller Guards", currentModelValue: "Full-coverage built-in", targetModelValue: "Optional accessory" },
          { label: "AI Subject Follow", currentModelValue: "Native AI Auto-Tracking", targetModelValue: "Manual Pilot Control" },
          { label: "Max Video", currentModelValue: "4K @ 30fps EIS", targetModelValue: "4K @ 30fps Gimbal" },
          { label: "Internal Storage", currentModelValue: "22 GB Built-in", targetModelValue: "MicroSD slot only" },
        ],
      },
      regulatoryFaqs: [
        {
          question: "Does DJI Neo require any DGCA pilot license or permission in India?",
          answer:
            "No! At just 135 grams, DJI Neo falls into the Nano Drone category (under 250g). Nano drones are exempt from pilot licenses and can be flown freely in Green Zones for recreational and lifestyle vlogging.",
        },
        {
          question: "Can I fly DJI Neo indoors safely?",
          answer:
            "Yes! DJI Neo comes with full-coverage protective propeller cages and infrared downward positioning sensors, making it completely safe for indoor flying, parties, and close-quarters family gatherings.",
        },
      ],
      techSpecsGrouped: {
        "Aircraft": {
          "Takeoff Weight": "Approx. 135 grams",
          "Dimensions": "130 × 157 × 48.5 mm",
          "Max Ascent Speed": "3 m/s",
          "Max Descent Speed": "2 m/s",
          "Max Flight Time": "Approx. 18 minutes",
        },
        "Camera": {
          "Sensor": "1/2-inch image sensor, 12 MP",
          "Lens": "FOV: 117.6°, Format Equivalent: 14 mm, f/2.8",
          "Video Resolution": "4K (3840×2160) @ 30fps EIS",
          "Stabilization": "RockSteady and HorizonBalancing",
          "Internal Storage": "22 GB high-speed storage",
        },
      },
      inTheBox: [
        { name: "DJI Neo Aircraft", quantity: 1, imageUrl: "/images/dji-neo-palm.jpg" },
        { name: "Intelligent Flight Battery", quantity: 3, imageUrl: "/images/accessory-battery.jpg" },
        { name: "Two-Way Charging Hub", quantity: 1, imageUrl: "/images/accessory-battery.jpg" },
        { name: "DJI RC-N3 Remote Controller", quantity: 1, imageUrl: "/images/accessory-rc2-remote.jpg" },
        { name: "Propeller Guards (Pair)", quantity: 1, imageUrl: "/images/diy-propellers.jpg" },
        { name: "Spare Propellers (Pair)", quantity: 1, imageUrl: "/images/diy-propellers.jpg" },
      ],
      longFormSeoArticle: `
        The DJI Neo redefines consumer vlogging drones by stripping away the complexity of traditional quadcopters. At just 135 grams, it is DJI's lightest and most compact drone ever, designed to launch effortlessly from the palm of your hand without needing a separate controller or phone connection.

        ### Controller-Free Simplicity
        Press the top mode button, select your favorite QuickShot trajectory, and watch Neo automatically lift off from your palm, track your activities, and return straight to your hand when the shot is finished. Built-in audio recording via DJI Mic 2 or your smartphone synchronizes crystal-clear vlog commentary with wind noise reduction.
      `,
    };

    await db
      .insert(productShowcases)
      .values(neoShowcase)
      .onConflictDoUpdate({
        target: productShowcases.productId,
        set: neoShowcase,
      });

    console.log("Seeded DJI Neo showcase successfully!");
  }

  console.log("All showcases seeded successfully!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error seeding showcases:", err);
  process.exit(1);
});
