import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowRight, BookOpen, Clock, Tag } from "lucide-react";

export const JOURNAL_POSTS = [
  {
    slug: "first-drone-guide",
    title: "Your first drone. The right one.",
    category: "BUYER'S GUIDE",
    readTime: "6 min read",
    date: "October 2026",
    summary:
      "A definitive guide to choosing between sub-249g pilot-friendly quads and 1-inch sensor workhorses without overspending.",
    image: "/images/journal-first-drone.jpg",
    content: `
### Finding the Ideal Airframe For Your Mission

Navigating your first drone purchase in India can feel intimidating with DGCA regulations, payload laws, and competing sensor tiers.

#### 1. The Sub-249g Micro Quad Advantage
Drones weighing under 250 grams (like the DJI Mini series) fall into the Micro category. They require minimal registration hurdles, making them optimal for travel creators, hobbyists, and urban fliers.

#### 2. When to Upgrade to 1-Inch or 4/3 CMOS
If you are shooting commercial real estate, broadcast documentary, or low-light twilight content, 1/1.3-inch sensors will eventually hit noise ceilings. Moving up to an Air 3S or Mavic 3 Pro gives you 10-bit D-Log M and 14 stops of dynamic range.

#### 3. Budget Allocation Formula
- **Airframe + Remote:** 70% of total budget
- **Spare Intelligent Flight Batteries (Min 2):** 20%
- **ND Glass & Protective Travel Case:** 10%
    `,
  },
  {
    slug: "cinematic-shutter-dlog",
    title: "Make every frame cinematic.",
    category: "CINEMATOGRAPHY",
    readTime: "8 min read",
    date: "October 2026",
    summary:
      "Understanding the 180-degree shutter rule, D-Log M color profiles, and where to swap neutral density ND glass filters in high noon.",
    image: "/images/journal-cinematic-road.jpg",
    content: `
### Mastering Natural Motion Blur & Color Gamut

The signature mark of beginner drone footage is jittery 1/2000s shutter speeds and hyper-saturated greens.

#### The 180-Degree Shutter Rule
To achieve cinematic motion blur that mimics human eye perception, your shutter speed should always be double your frame rate:
- **24 fps:** Shutter 1/50s
- **30 fps:** Shutter 1/60s
- **60 fps:** Shutter 1/120s

#### Why You Need Neutral Density (ND) Filters
In bright daylight (EV 15+), keeping your shutter at 1/50s at f/2.8 will blow out your exposure completely. An ND32 or ND64 optical glass filter reduces incoming photons without tinting color tones.

#### Color Grading in D-Log M
Shooting in 10-bit D-Log M preserves shadow detail in coastal cliff crags and highlight roll-off in direct sun. Apply our calibrated Rec.709 LUT in DaVinci Resolve or Premiere Pro for instant cinematic fidelity.
    `,
  },
  {
    slug: "high-altitude-lipo-safety",
    title: "Off the map. Where it all begins.",
    category: "FIELD INSPECTION",
    readTime: "5 min read",
    date: "October 2026",
    summary:
      "Sub-zero LiPo battery heating techniques and high-altitude flight safety protocols for cold mountain backcountry missions.",
    image: "/images/journal-mountain-snow.jpg",
    content: `
### High-Elevation Aerodynamics & Extreme Cold Operations

Flying above 10,000 feet in Ladakh, Spiti, or Himachal presents twin challenges: thinner atmospheric air density and chemical deceleration of lithium-ion cells.

#### Pre-Heating LiPo Cells
Lithium polymer internal resistance spikes when cell temperature drops below 15°C (59°F). If taken off cold, voltage sag under heavy motor throttle will trigger sudden low-voltage auto-land.
- Keep batteries in inside jacket pockets until 60 seconds before launch.
- Hover at 3-5 meters for 60 seconds to warm internal cell cores before pushing full pitch.

#### Air Density & Propeller Pitch
Thinner alpine air requires motors to spin at significantly higher RPM to generate equivalent lift. Expect a 15% to 25% reduction in total airtime.
    `,
  },
];

export default function JournalPage() {
  return (
    <div className="bg-white min-h-screen text-zinc-900 py-12">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back to Home Navigation */}
        <div>
          <Link
            href="/"
            className="group inline-flex items-center gap-2 text-xs font-bold text-zinc-500 hover:text-black transition"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Header */}
        <div className="border-b border-zinc-200 pb-8">
          <div className="inline-flex items-center gap-2 rounded-full bg-zinc-100 px-3 py-1 text-xs font-mono font-bold text-zinc-600">
            <BookOpen className="h-3.5 w-3.5" />
            <span>ALTITUDE FLIGHT LAB JOURNAL</span>
          </div>
          <h1 className="mt-3 text-4xl sm:text-5xl font-black text-black tracking-tight">
            A little insight. A better flight.
          </h1>
          <p className="mt-2 text-base text-zinc-500 max-w-2xl">
            Field notes, regulatory tips in India, and camera craft from seasoned aerial filmmakers.
          </p>
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {JOURNAL_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/journal/${post.slug}`}
              className="group flex flex-col rounded-3xl border border-zinc-200/90 bg-white p-5 hover:border-black/30 hover:shadow-xl transition-all"
            >
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-zinc-100">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>

              <div className="mt-5 flex items-center justify-between text-xs text-zinc-500 font-mono">
                <span className="font-bold uppercase tracking-wider text-black">
                  {post.category}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {post.readTime}
                </span>
              </div>

              <h2 className="mt-2 text-xl font-black text-black group-hover:text-zinc-600 transition flex items-center justify-between">
                <span>{post.title}</span>
                <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-black shrink-0 ml-2" />
              </h2>

              <p className="mt-2 text-xs leading-relaxed text-zinc-500 line-clamp-3">
                {post.summary}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
