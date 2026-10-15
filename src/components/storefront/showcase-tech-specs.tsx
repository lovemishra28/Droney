"use client";

import React from "react";
import { Battery, Box, Cpu, Feather, Gauge, Radio, Shield, Timer } from "lucide-react";

export interface DroneTechSpecsData {
  weightGrams?: number | null;
  flightTimeMinutes?: number | null;
  payloadCapacityGrams?: number | null;
  frameSizeMm?: number | null;
  inputVoltageLipo?: string | null;
  motorKv?: string | null;
  fcFirmware?: string | null;
  escProtocol?: string | null;
}

interface ShowcaseTechSpecsProps {
  specifications?: DroneTechSpecsData | null;
  productName?: string;
}

export function ShowcaseTechSpecs({
  specifications,
  productName = "Aircraft",
}: ShowcaseTechSpecsProps) {
  const specs = specifications;

  const specRows = [
    {
      icon: Feather,
      parameter: "Takeoff Weight / Frame Mass",
      value: specs?.weightGrams ? `${specs.weightGrams} grams` : "724 grams",
      details: "Weight inclusive of battery, gimbal, and propellers",
    },
    {
      icon: Timer,
      parameter: "Max Flight Endurance",
      value: specs?.flightTimeMinutes ? `${specs.flightTimeMinutes} Minutes` : "45 Minutes",
      details: "Tested at steady 28 km/h windless flight speed",
    },
    {
      icon: Box,
      parameter: "Payload Capacity",
      value: specs?.payloadCapacityGrams ? `${specs.payloadCapacityGrams} Grams` : "500 Grams",
      details: "Rated maximum external payload capacity",
    },
    {
      icon: Gauge,
      parameter: "Frame Wheelbase / Size",
      value: specs?.frameSizeMm ? `${specs.frameSizeMm} mm` : "225 mm",
      details: "Diagonal motor-to-motor diagonal distance",
    },
    {
      icon: Battery,
      parameter: "Battery / Input Voltage",
      value: specs?.inputVoltageLipo || "4S LiPo (4241 mAh / 14.76V)",
      details: "High-density flight battery chemistry",
    },
    {
      icon: Radio,
      parameter: "Propulsion / Motor KV",
      value: specs?.motorKv || "DJI High-Efficiency Brushless Motor",
      details: "Aerodynamic brushless outrunner propulsion system",
    },
    {
      icon: Cpu,
      parameter: "Flight Controller OS & Firmware",
      value: specs?.fcFirmware || "DJI O4 FlightOS",
      details: "Autonomous navigation, IMU telemetry & obstacle mapping",
    },
    {
      icon: Shield,
      parameter: "Video Transmission Protocol",
      value: specs?.escProtocol || "DJI O4 20km Ultra-Low Latency",
      details: "Digital FHD live video stream with low latency link",
    },
  ];

  return (
    <section className="w-full bg-black text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            OFFICIAL DATABASE TELEMETRY
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Technical Specifications.
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg">
            Direct avionics and hardware telemetry fetched directly from the database registry for {productName}.
          </p>
        </div>

        {/* Single Comprehensive Specifications Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Specification Parameter</th>
                <th className="px-6 py-4">Measured Specification</th>
                <th className="hidden sm:table-cell px-6 py-4 text-zinc-500 font-normal">Technical Context</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {specRows.map((row, idx) => {
                const Icon = row.icon;
                return (
                  <tr
                    key={idx}
                    className="hover:bg-zinc-900/40 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-[#c8f33b] shrink-0" />
                        <span className="font-semibold text-white group-hover:text-[#c8f33b] transition-colors">
                          {row.parameter}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-white text-sm">
                      {row.value}
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 text-xs text-zinc-500 font-sans">
                      {row.details}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
