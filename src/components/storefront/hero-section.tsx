"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  DEFAULT_HERO_SLIDES,
  type HeroSlideItem,
} from "@/types/storefront-config";

interface HeroSectionProps {
  slides?: HeroSlideItem[];
}

export function HeroSection({ slides }: HeroSectionProps) {
  const currentSlides = useMemo(() => {
    return slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  }, [slides]);

  // Append cloned first slide to allow a seamless infinite forward transition without rewinding
  const extendedSlides = useMemo(() => {
    return currentSlides.length > 1
      ? [...currentSlides, currentSlides[0]]
      : currentSlides;
  }, [currentSlides]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);

  // Active indicator dot index (wraps modulo length)
  const activeDot = currentIndex % currentSlides.length;

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
    if (currentIndex >= currentSlides.length) {
      setIsTransitioning(false);
      setCurrentIndex(0);
    }
  }, [currentIndex, currentSlides.length]);

  // Fallback safety timeout in case onTransitionEnd doesn't fire
  useEffect(() => {
    if (currentIndex >= currentSlides.length) {
      const fallback = setTimeout(() => {
        setIsTransitioning(false);
        setCurrentIndex(0);
      }, 850);
      return () => clearTimeout(fallback);
    }
  }, [currentIndex, currentSlides.length]);

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
        {extendedSlides.map((slide, idx) => (
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
              unoptimized={slide.image.startsWith("http")}
            />
          </Link>
        ))}
      </div>

      {/* 2. Slide Indicator Centered at Bottom */}
      <div className="absolute z-20 bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-auto">
        <div className="flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md border border-zinc-200/80 px-3 py-1.5 shadow-md">
          {currentSlides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => {
                e.preventDefault();
                goToSlide(i);
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${
                i === activeDot
                  ? "w-7 bg-zinc-900 shadow-xs"
                  : "w-2 bg-zinc-300 hover:bg-zinc-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
