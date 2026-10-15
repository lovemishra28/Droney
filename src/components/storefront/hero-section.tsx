"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";

const HERO_SLIDES = [
  {
    image: "/images/hero_image.png?v=20261015",
    alt: "Altitude Drone Systems",
    href: "/catalog?category=drones",
  },
  {
    image: "/images/DJI Air 3S.png",
    alt: "DJI Air 3S",
    href: "/catalog?search=Air+3S",
  },
  {
    image: "/images/DJI Mavic 4 Pro.png",
    alt: "DJI Mavic 4 Pro",
    href: "/catalog?search=Mavic+4",
  },
  {
    image: "/images/DJI Mini 4 Pro.png",
    alt: "DJI Mini 4 Pro",
    href: "/catalog?search=Mini+4+Pro",
  },
  {
    image: "/images/DJI Mini 5 Pro.png",
    alt: "DJI Mini 5 Pro",
    href: "/catalog?search=Mini+5+Pro",
  },
  {
    image: "/images/DJI-Avata-360.png",
    alt: "DJI Avata 360",
    href: "/catalog?search=Avata",
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

  // Automatic slide advancement every 5 seconds continuously
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

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
      className="relative w-full overflow-hidden bg-white select-none border-b border-zinc-200/80"
      style={{ aspectRatio: "2031 / 774" }}
    >
      {/* 1. Horizontal Infinite Sliding Track (Slides right to left continuously) */}
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
          <Link
            key={`${slide.image}-${idx}`}
            href={slide.href}
            className="relative h-full w-full min-w-full flex-shrink-0 overflow-hidden block cursor-pointer bg-black"
          >
            {/* Pure image canvas - natural aspect ratio, full image height & width 100% visible */}
            <Image
              src={slide.image}
              alt={slide.alt}
              fill
              priority={idx === 0}
              sizes="100vw"
              className={`w-full h-full select-none ${
                idx === 0 ? "object-contain" : "object-cover object-center"
              }`}
            />
          </Link>
        ))}
      </div>

      {/* 2. Slide Indicator Centered at Bottom */}
      <div className="absolute z-20 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full bg-black/60 backdrop-blur-md border border-white/15 px-3 py-1.5 shadow-xl">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goToSlide(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${i === activeDot
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
