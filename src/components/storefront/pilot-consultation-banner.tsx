import React from "react";
import Link from "next/link";
import {
  DEFAULT_CONSULTATION_BANNER,
  type ConsultationBannerConfig,
} from "@/types/storefront-config";

interface PilotConsultationBannerProps {
  config?: ConsultationBannerConfig;
}

export function PilotConsultationBanner({ config }: PilotConsultationBannerProps) {
  const currentConfig = config || DEFAULT_CONSULTATION_BANNER;

  return (
    <section className="bg-white py-8 sm:py-12 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-[#0c1813] p-8 sm:p-10 lg:p-12 text-white shadow-2xl border border-emerald-950">

          {/* Subtle Ambient Radial Glow */}
          <div className="pointer-events-none absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-600/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-[#c8f33b]/10 blur-[100px]" />

          <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center justify-between">

            {/* Left Column: Big bold headline with space between subhead and main headline removed */}
            <div className="space-y-1.5 sm:space-y-2">
              <span className="block text-xl sm:text-2xl lg:text-3xl font-extrabold text-zinc-400 tracking-tight">
                {currentConfig.eyebrow}
              </span>
              <div className="space-y-0.5 sm:space-y-1">
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[0.95]">
                  {currentConfig.headlineFirst}
                </span>
                <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#c8f33b] tracking-tight leading-[0.95]">
                  {currentConfig.headlineSecond}
                </span>
              </div>
            </div>

            {/* Right Column: High-Impact "Reach Us" Button with Ambient Wireframe Anchor */}
            <div className="relative shrink-0 w-full sm:w-auto flex items-center justify-center">
              <Link
                href={currentConfig.buttonHref}
                className="relative z-10 flex items-center justify-center rounded-2xl bg-[#c8f33b] hover:bg-[#b8e530] text-black font-black text-lg sm:text-xl px-10 sm:px-14 py-4 sm:py-5 shadow-[0_0_30px_rgba(200,243,59,0.25)] hover:shadow-[0_0_45px_rgba(200,243,59,0.4)] transition-all duration-300 active:scale-[0.98] whitespace-nowrap"
              >
                {currentConfig.buttonText}
              </Link>
            </div>

          </div>

          {/* Technical Aviation Drone Blueprint Background Silhouette (Right-anchored) */}
          <div className="pointer-events-none absolute -right-6 sm:right-6 md:right-16 -top-12 sm:-top-8 bottom-0 w-[300px] sm:w-[380px] md:w-[440px] flex items-center justify-center opacity-20 sm:opacity-25 transition-opacity duration-500 select-none overflow-visible">
            <svg
              viewBox="0 0 500 500"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full text-[#c8f33b]"
            >
              {/* Outer Alignment Grid Rings */}
              <circle cx="250" cy="250" r="220" stroke="currentColor" strokeWidth="0.75" strokeDasharray="4 8" opacity="0.4" />
              <circle cx="250" cy="250" r="170" stroke="currentColor" strokeWidth="0.75" opacity="0.3" />
              <circle cx="250" cy="250" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="3 5" opacity="0.5" />

              {/* Crosshair & Telemetry Axis */}
              <line x1="250" y1="20" x2="250" y2="480" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 6" opacity="0.4" />
              <line x1="20" y1="250" x2="480" y2="250" stroke="currentColor" strokeWidth="0.75" strokeDasharray="6 6" opacity="0.4" />

              {/* Coordinate Reticles */}
              <path d="M235 250H265M250 235V265" stroke="currentColor" strokeWidth="1.5" />
              <circle cx="250" cy="250" r="12" stroke="currentColor" strokeWidth="1" opacity="0.7" />

              {/* 4 Diagonal Carbon Fiber Arms */}
              <line x1="250" y1="250" x2="100" y2="100" stroke="currentColor" strokeWidth="3" opacity="0.6" />
              <line x1="250" y1="250" x2="400" y2="100" stroke="currentColor" strokeWidth="3" opacity="0.6" />
              <line x1="250" y1="250" x2="100" y2="400" stroke="currentColor" strokeWidth="3" opacity="0.6" />
              <line x1="250" y1="250" x2="400" y2="400" stroke="currentColor" strokeWidth="3" opacity="0.6" />

              {/* Arm Reinforcement Struts */}
              <line x1="210" y1="250" x2="130" y2="170" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
              <line x1="290" y1="250" x2="370" y2="170" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
              <line x1="210" y1="250" x2="130" y2="330" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />
              <line x1="290" y1="250" x2="370" y2="330" stroke="currentColor" strokeWidth="1.2" opacity="0.3" />

              {/* Motor Pods & Propeller Swept Discs */}
              {/* Rotor 1: Front-Left (CW) */}
              <circle cx="100" cy="100" r="68" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" />
              <circle cx="100" cy="100" r="22" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="100" cy="100" r="8" fill="currentColor" opacity="0.4" />
              <path d="M50 100 Q100 70 150 100" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

              {/* Rotor 2: Front-Right (CCW) */}
              <circle cx="400" cy="100" r="68" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" />
              <circle cx="400" cy="100" r="22" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="400" cy="100" r="8" fill="currentColor" opacity="0.4" />
              <path d="M350 100 Q400 70 450 100" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

              {/* Rotor 3: Rear-Left (CCW) */}
              <circle cx="100" cy="400" r="68" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" />
              <circle cx="100" cy="400" r="22" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="100" cy="400" r="8" fill="currentColor" opacity="0.4" />
              <path d="M50 400 Q100 370 150 400" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

              {/* Rotor 4: Rear-Right (CW) */}
              <circle cx="400" cy="400" r="68" stroke="currentColor" strokeWidth="1.2" strokeDasharray="8 6" opacity="0.6" />
              <circle cx="400" cy="400" r="22" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="400" cy="400" r="8" fill="currentColor" opacity="0.4" />
              <path d="M350 400 Q400 370 450 400" stroke="currentColor" strokeWidth="1.5" opacity="0.5" />

              {/* Center Fuselage Aerodynamic Hull */}
              <rect x="220" y="170" width="60" height="160" rx="28" stroke="currentColor" strokeWidth="2" opacity="0.7" />
              <rect x="230" y="190" width="40" height="120" rx="18" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

              {/* Forward 3-Axis Gimbal Sensor Suite */}
              <path d="M235 170 V145 Q235 135 250 135 Q265 135 265 145 V170" stroke="currentColor" strokeWidth="2" opacity="0.8" />
              <circle cx="250" cy="142" r="7" stroke="currentColor" strokeWidth="1.5" opacity="0.9" />

              {/* Technical Telemetry Badging */}
              <text x="250" y="375" textAnchor="middle" fill="currentColor" fontSize="11" fontFamily="monospace" letterSpacing="4" opacity="0.7">
                ALT // AIRFRAME 01
              </text>
              <text x="250" y="392" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace" letterSpacing="2" opacity="0.5">
                DGCA TELEMETRY OK
              </text>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
