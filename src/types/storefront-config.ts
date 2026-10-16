export interface HeroSlideItem {
  id: string;
  image: string;
  alt: string;
  title?: string;
  badge?: string;
  href: string;
}

export interface PreOwnedSlideItem {
  id: string;
  image: string;
  alt: string;
  title?: string;
}

export interface FlightJournalItem {
  id: string;
  slug: string;
  tag: string;
  title: string;
  description: string;
  image: string;
  enabled: boolean;
}

export interface ConsultationBannerConfig {
  eyebrow: string;
  headlineFirst: string;
  headlineSecond: string;
  buttonText: string;
  buttonHref: string;
}

export const DEFAULT_HERO_SLIDES: HeroSlideItem[] = [
  {
    id: "slide-1",
    image: "/images/hero-slide-1.webp",
    alt: "Altitude Drone Systems",
    title: "Master the Skies",
    badge: "ENTERPRISE FLEET",
    href: "/catalog?category=drones",
  },
  {
    id: "slide-2",
    image: "/images/dji-air-3s.webp",
    alt: "DJI Air 3S",
    title: "DJI Air 3S",
    badge: "FLAGSHIP DUAL-CAMERA",
    href: "/catalog?search=Air+3S",
  },
  {
    id: "slide-3",
    image: "/images/dji-mavic-4-pro.webp",
    alt: "DJI Mavic 4 Pro",
    title: "DJI Mavic 4 Pro",
    badge: "PRO CINEMATOGRAPHY",
    href: "/catalog?search=Mavic+4",
  },
  {
    id: "slide-4",
    image: "/images/dji-mini-4-pro.webp",
    alt: "DJI Mini 4 Pro",
    title: "DJI Mini 4 Pro",
    badge: "SUB-249G ULTRA COMPACT",
    href: "/catalog?search=Mini+4+Pro",
  },
  {
    id: "slide-5",
    image: "/images/dji-mini-5-pro.webp",
    alt: "DJI Mini 5 Pro",
    title: "DJI Mini 5 Pro",
    badge: "NEXT GEN SENSING",
    href: "/catalog?search=Mini+5+Pro",
  },
  {
    id: "slide-6",
    image: "/images/dji-avata-360.webp",
    alt: "DJI Avata 360",
    title: "DJI Avata 360",
    badge: "IMMERSIVE FPV FLIGHT",
    href: "/catalog?search=Avata",
  },
];

export const DEFAULT_PREOWNED_SLIDES: PreOwnedSlideItem[] = [
  {
    id: "preowned-1",
    image: "/images/preowned-slide-1.jpg",
    alt: "Refurbished DJI Mini Drone",
    title: "DJI Mini Series Pre-Owned",
  },
  {
    id: "preowned-2",
    image: "/images/preowned-slide-2.jpg",
    alt: "Verified Pre-Owned DJI Drone Fleet",
    title: "Verified Aviation Tech Fleet",
  },
  {
    id: "preowned-3",
    image: "/images/preowned-slide-3.jpg",
    alt: "Pre-Owned Drones and Aviation Hardware",
    title: "Commercial Grade Inspection",
  },
];

export const DEFAULT_JOURNAL_ARTICLES: FlightJournalItem[] = [
  {
    id: "art-1",
    slug: "first-drone-guide",
    tag: "BUYER'S GUIDE",
    title: "Your first drone. The right one.",
    description:
      "A definitive guide to choosing between sub-249g pilot-friendly quads and 1-inch sensor workhorses without overspending.",
    image: "/images/journal-first-drone.jpg",
    enabled: true,
  },
  {
    id: "art-2",
    slug: "cinematic-shutter-dlog",
    tag: "CINEMATOGRAPHY",
    title: "Make every frame cinematic.",
    description:
      "Understanding the 180-degree shutter rule, D-Log M color profiles, and where to swap neutral density ND glass filters in high noon.",
    image: "/images/journal-cinematic-road.jpg",
    enabled: true,
  },
  {
    id: "art-3",
    slug: "high-altitude-lipo-safety",
    tag: "FIELD INSPECTION",
    title: "Off the map. Where it all begins.",
    description:
      "Sub-zero LiPo battery heating techniques and high-altitude flight safety protocols for cold mountain backcountry missions.",
    image: "/images/journal-mountain-snow.jpg",
    enabled: true,
  },
];

export const DEFAULT_CONSULTATION_BANNER: ConsultationBannerConfig = {
  eyebrow: "Not sure what you need?",
  headlineFirst: "Let's figure",
  headlineSecond: "it out together.",
  buttonText: "Reach Us",
  buttonHref: "/consult-pilot",
};
