"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

const HERO_SLIDES = [
  {
    image: "/images/altitude-hero-bg.jpg",
    badge: "BUILT FOR THE SKY",
    title: "Go beyond.\nSee everything.",
    subtitle:
      "Find your next flight path with Altitude. Premier camera drones, certified refurbished models, and tuned FPV components built for every horizon.",
    highlight: "Altitude Cinema Systems",
  },
  {
    image: "/images/dji-air-3s.jpg",
    badge: "DUAL-CAMERA MASTERY",
    title: "Dual 4K Sensors.\nUnmatched Vision.",
    subtitle:
      "Capture breathtaking 4K/60fps HDR footage with 1-inch CMOS primary optics, 45-minute flight endurance, and 20km O4 transmission.",
    highlight: "DJI Air 3S Quadcopter",
  },
  {
    image: "/images/dji-mavic-3-pro.jpg",
    badge: "FLAGSHIP CINEMATOGRAPHY",
    title: "Triple Camera.\nHasselblad Power.",
    subtitle:
      "Tri-camera focal system with 4/3 CMOS Hasselblad sensor, Apple ProRes support, and omnidirectional obstacle sensing for cinema directors.",
    highlight: "DJI Mavic 3 Pro Cine",
  },
  {
    image: "/images/dji-avata-2.jpg",
    badge: "DYNAMIC MOTION FLIGHT",
    title: "Immersive Acro.\nTotal Adrenaline.",
    subtitle:
      "Experience high-octane FPV acrobatics with ultra-wide 4K/60fps, rocksteady stabilization, and integrated propeller guards.",
    highlight: "DJI Avata 2 FPV System",
  },
  {
    image: "/images/altitude-canyon-banner.jpg",
    badge: "INSPECTED & CERTIFIED",
    title: "Verified Pre-Owned.\nZero Compromise.",
    subtitle:
      "Every certified aircraft undergoes our rigorous 32-point flight and telemetry inspection with full warranty protection.",
    highlight: "Pre-Owned Certified Fleet",
  },
];

// Append cloned first slide to allow a seamless infinite forward transition without rewinding
const EXTENDED_SLIDES = [...HERO_SLIDES, HERO_SLIDES[0]];

export function HeroSection() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Active indicator dot index (wraps modulo length)
  const activeDot = currentIndex % HERO_SLIDES.length;

  const nextSlide = useCallback(() => {
    setIsTransitioning(true);
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const goToSlide = useCallback((index: number) => {
    setIsTransitioning(true);
    setCurrentIndex(index);
  }, []);

  // Automatic slide advancement every 4 seconds without stopping
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 4200);

    return () => clearInterval(timer);
  }, [nextSlide]);

  // Handle seamless infinite loop when transition ends on the cloned slide
  const handleTransitionEnd = useCallback(() => {
    if (currentIndex >= HERO_SLIDES.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  }, [currentIndex]);

  // Fallback safety timeout in case onTransitionEnd doesn't fire
  useEffect(() => {
    if (currentIndex >= HERO_SLIDES.length) {
      const fallback = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 850);
      return () => clearTimeout(fallback);
    }
  }, [currentIndex]);

  return (
    <section
      aria-label="Altitude Hero Showcase"
      className="relative h-[calc(100vh-184px)] min-h-[480px] max-h-[720px] w-full overflow-hidden bg-zinc-950 select-none"
    >
      {/* 1. Horizontal Infinite Sliding Track (Slides right to left) */}
      <div
        className="flex h-full w-full"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning
            ? "transform 750ms cubic-bezier(0.25, 1, 0.5, 1)"
            : "none",
        }}
        onTransitionEnd={handleTransitionEnd}
      >
        {EXTENDED_SLIDES.map((slide, idx) => (
          <div
            key={`${slide.image}-${idx}`}
            className="relative h-full w-full min-w-full flex-shrink-0 overflow-hidden flex items-center"
          >
            {/* Background Image (fills exact uniform height) */}
            <Image
              src={slide.image}
              alt={slide.highlight}
              fill
              priority={idx === 0}
              sizes="100vw"
              className="object-cover object-center"
            />

            {/* Cinematic Lighting & Contrast Overlays */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-black/40" />

            {/* Slide Content Container (Strictly uniform layout across all slides) */}
            <div className="relative z-10 mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 w-full py-8 lg:py-12">
              <div className="max-w-3xl">
                {/* Pill Badge */}
                <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 px-3 py-1 text-xs font-bold tracking-widest text-white shadow-xs">
                  <span className="h-2 w-2 rounded-full bg-[#c8f33b] shadow-[0_0_8px_#c8f33b]" />
                  <span className="uppercase">{slide.badge}</span>
                </div>

                {/* Main Headline */}
                <h1 className="mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-[4.25rem] font-bold tracking-tight text-white leading-[1.06] whitespace-pre-line">
                  {slide.title}
                </h1>

                {/* Subtitle */}
                <p className="mt-3.5 max-w-xl text-xs sm:text-sm md:text-base text-zinc-300 font-normal leading-relaxed line-clamp-2 sm:line-clamp-3">
                  {slide.subtitle}
                </p>

                {/* Action CTA Buttons */}
                <div className="mt-6 flex flex-wrap items-center gap-3.5">
                  {/* Primary Neon CTA */}
                  <Link
                    href="/catalog?category=drones"
                    className="inline-flex items-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-xs sm:text-sm font-bold text-black shadow-[0_0_20px_rgba(200,243,59,0.3)] transition-all hover:bg-[#bbf028] hover:shadow-[0_0_30px_rgba(200,243,59,0.45)] transform hover:scale-[1.02] active:scale-95"
                  >
                    <span>Explore Drone Fleet</span>
                    <ArrowRight className="h-3.5 w-3.5 stroke-[2.5]" />
                  </Link>

                  {/* Secondary Frosted Glass CTA */}
                  <Link
                    href="/used-drones"
                    className="inline-flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/20 px-5 py-3 text-xs sm:text-sm font-semibold text-white transition-all active:scale-95 hover:border-white/35"
                  >
                    <span>Pre-Owned Fleet</span>
                    <span className="rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 text-[9px] font-bold">
                      Verified
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 2. Slide Indicator Centered at Bottom */}
      <div className="absolute z-20 bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 shadow-xl">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goToSlide(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 transition-all duration-300 rounded-full ${
                i === activeDot
                  ? "w-7 bg-[#c8f33b] shadow-[0_0_8px_#c8f33b]"
                  : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
