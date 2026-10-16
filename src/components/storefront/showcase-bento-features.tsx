"use client";

import React from "react";

export interface StoryBlock {
  id: string;
  tag?: string;
  title: string;
  description: string;
  specBadges?: string[];
  mediaUrl: string;
  alignment?: "left" | "right" | "center";
}

interface ShowcaseBentoFeaturesProps {
  blocks?: StoryBlock[];
}

export function ShowcaseBentoFeatures({ blocks = [] }: ShowcaseBentoFeaturesProps) {
  const defaultBlocks: StoryBlock[] = [
    {
      id: "perspective",
      tag: "DUAL-CAMERA MASTERY",
      title: "Wide and tele. Two perspectives.",
      description:
        "Equipped with a 1-inch CMOS primary camera and a 70mm medium tele camera, each boasting up to 14 stops of dynamic range to capture dramatic landscapes and compressed portraits with true optical depth.",
      specBadges: ["1\" CMOS Primary", "70mm Medium Tele", "14 Stops Dynamic Range"],
      mediaUrl: "/images/journal-mountain-snow.jpg",
      alignment: "center",
    },
    {
      id: "sensors",
      tag: "NIGHTSCAPE SAFETY",
      title: "Precision night sensing. Day and night safety.",
      description:
        "Forward-facing LiDAR combined with downward infrared ToF sensors and omnidirectional vision cameras deliver proactive obstacle braking, allowing confident low-light cinematic tracking.",
      specBadges: ["Forward LiDAR", "Omnidirectional Vision", "Next-Gen Smart RTH"],
      mediaUrl: "/images/dji-air-3s.jpg",
      alignment: "left",
    },
    {
      id: "airframe",
      tag: "AERODYNAMIC AIRFRAME",
      title: "Extended endurance. 45-minute flight time.",
      description:
        "Engineered for uncompromised exploration across remote frontiers. Capture expansive 360-degree panoramas and navigate gusty high-altitude terrain with 12 m/s wind resistance.",
      specBadges: ["45-Min Battery Life", "21 m/s Max Speed", "O4 20km Video Feed"],
      mediaUrl: "/images/altitude-hero-bg.jpg",
      alignment: "right",
    },
    {
      id: "cinematography",
      tag: "TRUE COLOR SCIENCE",
      title: "10-bit D-Log M & HLG. Lifelike clarity.",
      description:
        "Master color grading with rich shadow and highlight retention. 4K/120fps slow motion captures fleeting high-speed maneuvers with ultra-smooth cinematic fidelity.",
      specBadges: ["10-bit D-Log M", "4K/120fps Slow-Mo", "42GB Built-in Storage"],
      mediaUrl: "/images/journal-cinematic-road.jpg",
      alignment: "left",
    },
  ];

  const displayBlocks = blocks.length > 0 ? blocks : defaultBlocks;

  return (
    <section className="w-full bg-black text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-28">
        {displayBlocks.map((block, idx) => {
          const isCenter = block.alignment === "center";
          const isReverse = block.alignment === "right" || (!isCenter && idx % 2 === 1);

          if (isCenter) {
            return (
              <div key={block.id} className="flex flex-col items-center text-center space-y-8">
                <div className="max-w-3xl space-y-4">
                  {block.tag && (
                    <span className="inline-block font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
                      {block.tag}
                    </span>
                  )}
                  <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-tight">
                    {block.title}
                  </h2>
                  <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed">
                    {block.description}
                  </p>
                  {block.specBadges && block.specBadges.length > 0 && (
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 pt-2">
                      {block.specBadges.map((badge, bIdx) => (
                        <span
                          key={bIdx}
                          className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase"
                        >
                          {badge}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="w-full max-w-5xl rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 p-2 sm:p-4 group shadow-2xl">
                  <div className="aspect-[21/9] sm:aspect-[16/8] w-full overflow-hidden rounded-2xl bg-zinc-900 relative">
                    <img
                      src={block.mediaUrl}
                      alt={block.title}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div
              key={block.id}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center ${
                isReverse ? "lg:flex-row-reverse" : ""
              }`}
            >
              {/* Text Column */}
              <div className={`lg:col-span-5 space-y-5 ${isReverse ? "lg:order-2" : "lg:order-1"}`}>
                {block.tag && (
                  <span className="inline-block font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
                    {block.tag}
                  </span>
                )}

                <h3 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
                  {block.title}
                </h3>

                <p className="text-sm sm:text-base text-zinc-400 leading-relaxed font-normal">
                  {block.description}
                </p>

                {block.specBadges && block.specBadges.length > 0 && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 pt-2">
                    {block.specBadges.map((badge, bIdx) => (
                      <span
                        key={bIdx}
                        className="text-xs font-mono font-bold tracking-wider text-zinc-400 uppercase"
                      >
                        {badge}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Visual Column */}
              <div className={`lg:col-span-7 ${isReverse ? "lg:order-1" : "lg:order-2"}`}>
                <div className="rounded-3xl overflow-hidden border border-zinc-800/80 bg-zinc-900/60 p-2 sm:p-3 shadow-2xl group">
                  <div className="aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden rounded-2xl bg-zinc-950 relative">
                    <img
                      src={block.mediaUrl}
                      alt={block.title}
                      className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
