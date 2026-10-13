"use client";

import React, { useState } from "react";
import { ChevronDown, ShieldCheck, FileCheck, CheckCircle2 } from "lucide-react";

export interface RegulatoryFaqItem {
  question: string;
  answer: string;
}

interface ShowcaseRegulatoryFaqsProps {
  faqs?: RegulatoryFaqItem[];
}

export function ShowcaseRegulatoryFaqs({ faqs = [] }: ShowcaseRegulatoryFaqsProps) {
  const defaultFaqs: RegulatoryFaqItem[] = [
    {
      question: "Does this drone require a DGCA Remote Pilot Certificate in India?",
      answer:
        "The DJI Air 3S has a takeoff weight of 724g, classifying it as a 'Micro Drone' (250g to 2kg) under Indian Drone Rules 2021. For non-commercial recreational flying in Green Zones up to 400ft AGL, a Remote Pilot Certificate is not mandatory, but registering on Digital Sky to obtain a UIN (Unique Identification Number) is required.",
    },
    {
      question: "How does Digital Sky Green Zone flying work?",
      answer:
        "Under the DGCA airspace map, Green Zones are airspace up to 400 feet (120 meters) that do not require prior flight permission. Yellow and Red zones (near airports, international borders, and defense installations) require automated or manual ATC clearance via the Digital Sky platform.",
    },
    {
      question: "Can I claim GST input tax credit and insurance for commercial use?",
      answer:
        "Yes! Altitude provides official GST tax invoices containing your business GSTIN and SAC/HSN codes, allowing 100% input tax credit (ITC). Third-party liability insurance is readily obtainable using your purchase invoice and aircraft serial number for commercial survey and cinema contracts.",
    },
    {
      question: "Is this hardware covered under official warranty in India?",
      answer:
        "Yes, every unit purchased through Altitude is 100% authentic, imported through certified channels with customs clearance and a 1-year manufacturer-backed hardware warranty. We do not deal in parallel unverified grey-market units.",
    },
  ];

  const displayFaqs = faqs.length > 0 ? faqs : defaultFaqs;
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (idx: number) => {
    setOpenIndex((prev) => (prev === idx ? null : idx));
  };

  return (
    <section className="w-full bg-zinc-950 text-white py-24 border-t border-zinc-900">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Title */}
        <div className="flex flex-col items-center text-center space-y-3 mb-16">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider text-emerald-400">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>INDIAN DRONE RULES 2021 COMPLIANCE</span>
          </div>

          <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-white">
            Need to know.
          </h2>

          <p className="text-sm sm:text-base text-zinc-400 max-w-xl">
            Key aviation regulations, Digital Sky registration guidelines, and commercial compliance information.
          </p>
        </div>

        {/* Accordions Container */}
        <div className="max-w-3xl mx-auto space-y-3">
          {displayFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 overflow-hidden transition-all shadow-lg"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="flex w-full items-center justify-between p-5 text-left hover:bg-zinc-900/80 transition cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-white pr-4">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 shrink-0 text-zinc-400 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-[#c8f33b]" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="border-t border-zinc-800/80 px-5 py-4 bg-zinc-950/60">
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
