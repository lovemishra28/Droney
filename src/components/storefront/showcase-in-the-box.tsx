"use client";

import React from "react";
import { CheckCircle2 } from "lucide-react";

export interface InTheBoxItem {
  name: string;
  quantity: number;
  imageUrl?: string;
}

interface ShowcaseInTheBoxProps {
  items?: InTheBoxItem[] | string[] | string | null;
  productName?: string;
}

export function ShowcaseInTheBox({ items, productName = "Drone System" }: ShowcaseInTheBoxProps) {
  // Intelligent parser: handles array of objects, array of strings, or comma/newline delimited text
  const parseItems = (): Array<{ name: string; quantity: number }> => {
    if (!items || (Array.isArray(items) && items.length === 0)) {
      return [
        { name: `${productName} Aircraft`, quantity: 1 },
        { name: "DJI RC 2 Remote Controller (Built-in Screen)", quantity: 1 },
        { name: "Intelligent Flight Batteries (4241mAh)", quantity: 3 },
        { name: "Two-Way Battery Charging Hub", quantity: 1 },
        { name: "ND Filter Set (ND8 / ND16 / ND32 / ND64)", quantity: 1 },
        { name: "Shoulder Carrying Case", quantity: 1 },
        { name: "Low-Noise Propellers (Pairs)", quantity: 3 },
        { name: "Type-C to Type-C High Speed PD Cable", quantity: 1 },
      ];
    }

    if (typeof items === "string") {
      const parts = items.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
      return parts.map((part) => {
        const qtyPrefixMatch = part.match(/^(\d+)x?\s+(.+)/i);
        if (qtyPrefixMatch && qtyPrefixMatch[1] && qtyPrefixMatch[2]) {
          return { quantity: parseInt(qtyPrefixMatch[1], 10), name: qtyPrefixMatch[2].trim() };
        }
        const qtySuffixMatch = part.match(/^(.+?)\s*(?:x|\*)\s*(\d+)$/i);
        if (qtySuffixMatch && qtySuffixMatch[1] && qtySuffixMatch[2]) {
          return { quantity: parseInt(qtySuffixMatch[2], 10), name: qtySuffixMatch[1].trim() };
        }
        return { quantity: 1, name: part };
      });
    }

    if (Array.isArray(items)) {
      return items.map((item) => {
        if (typeof item === "string") {
          const qtyPrefixMatch = item.match(/^(\d+)x?\s+(.+)/i);
          if (qtyPrefixMatch && qtyPrefixMatch[1] && qtyPrefixMatch[2]) {
            return { quantity: parseInt(qtyPrefixMatch[1], 10), name: qtyPrefixMatch[2].trim() };
          }
          return { quantity: 1, name: item };
        }
        return {
          name: item.name || "Accessory Component",
          quantity: item.quantity || 1,
        };
      });
    }

    return [];
  };

  const parsedList = parseItems();

  return (
    <section className="w-full bg-[#050505] text-white py-20 border-t border-zinc-900">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-12">
          <span className="font-mono text-[11px] font-black uppercase tracking-[0.25em] text-[#c8f33b]">
            COMPLETE PACKAGE CONTENTS
          </span>
          <h2 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            In the Box.
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg">
            Verified checklist of hardware components and accessories included in standard dispatch packaging.
          </p>
        </div>

        {/* In The Box Table */}
        <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/70 shadow-2xl backdrop-blur-md">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 font-mono text-[11px] text-zinc-400 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 w-16">#</th>
                <th className="px-6 py-4">Package Component / Item</th>
                <th className="px-6 py-4 w-28 text-center">Quantity</th>
                <th className="px-6 py-4 w-40 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-sans">
              {parsedList.map((item, idx) => (
                <tr
                  key={idx}
                  className="hover:bg-zinc-900/40 transition-colors group"
                >
                  <td className="px-6 py-4 font-mono text-zinc-500 font-bold">
                    {String(idx + 1).padStart(2, "0")}
                  </td>
                  <td className="px-6 py-4 font-semibold text-white group-hover:text-[#c8f33b] transition-colors">
                    {item.name}
                  </td>
                  <td className="px-6 py-4 text-center font-mono">
                    <span className="inline-block rounded-md bg-zinc-900 border border-zinc-800 px-2.5 py-0.5 text-[11px] font-bold text-[#c8f33b]">
                      × {item.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>Verified</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </section>
  );
}
