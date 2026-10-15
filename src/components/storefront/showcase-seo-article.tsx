"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface ShowcaseSeoArticleProps {
  productName: string;
  articleText?: string | null;
}

export function ShowcaseSeoArticle({
  productName = "DJI Air 3S",
  articleText,
}: ShowcaseSeoArticleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultArticle = `
    The ${productName} represents an extraordinary leap forward in consumer and enterprise-grade compact aviation. Featuring a dual-camera optical payload with a 1-inch CMOS primary sensor and a 70mm medium telephoto lens, the airframe is engineered to deliver Hollywood-tier dynamic range across expansive wilderness and dense urban architectures.

    ### Optical Architecture & Sensor Innovations
    Unlike conventional single-sensor quadcopters, the dual-lens configuration eliminates digital crop degradation. The primary 24mm equivalent camera delivers 50 megapixels of resolving power with an aperture of f/1.8, while the 70mm telephoto lens compresses perspective with an f/2.8 aperture, making portraits, vehicular tracking, and architectural inspections appear strikingly three-dimensional. Both lenses support 10-bit D-Log M and 10-bit HLG color profiles, providing 14 stops of exposure latitude for seamless grading in DaVinci Resolve and Adobe Premiere Pro.

    ### Active Night LiDAR Obstacle Navigation
    A hallmark breakthrough of the platform is its forward-facing LiDAR sensor. Operating in tandem with 6 vision cameras and infrared Time-of-Flight sensors, the system constructs a real-time 3D voxel representation of the aircraft's surroundings down to 0.1 lux illumination. Even when flying in complete darkness over tree canopies, telephone lines, and building facades, the Advanced Pilot Assistance System (APAS 5.0) autonomously plans obstacle-free flight paths and executes Next-Gen Smart Return to Home (RTH) without requiring GPS satellite lock.

    ### Indian Flight Regulations & Commercial Feasibility
    Classified within the DGCA Micro Drone category (under 2 kilograms), the aircraft delivers commercial surveying and cinematic capability without the regulatory burden of heavier platforms. Every aircraft supplied by Altitude includes official GST invoices, verified IMEI/serial numbers, and full eligibility for commercial drone insurance coverage under Indian Drone Rules 2021.
  `;

  const content = articleText || defaultArticle;

  return (
    <section className="w-full bg-zinc-950 text-white py-20 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="border-b border-zinc-800 pb-4 mb-6">
          <span className="font-mono text-[10px] font-bold text-[#c8f33b] uppercase tracking-widest">
            TECHNICAL SUMMARY
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {productName}: Technical Summary & Avionics Overview
          </h2>
        </div>

        {/* Content */}
        <div
          className={`relative text-xs sm:text-sm text-zinc-400 leading-relaxed space-y-4 font-normal transition-all overflow-hidden ${
            isExpanded ? "max-h-none" : "max-h-48"
          }`}
        >
          {content.split("\n\n").map((para, pIdx) => (
            <p key={pIdx}>{para.trim()}</p>
          ))}

          {/* Fade gradient when collapsed */}
          {!isExpanded && (
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-zinc-950 to-transparent pointer-events-none" />
          )}
        </div>

        {/* Toggle Button */}
        <div className="mt-4 pt-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#c8f33b] hover:underline cursor-pointer"
          >
            <span>{isExpanded ? "Read Less" : "Read Full Technical Review"}</span>
            <ChevronDown
              className={`h-3.5 w-3.5 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </div>

      </div>
    </section>
  );
}
