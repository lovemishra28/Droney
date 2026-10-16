import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import {
  DEFAULT_JOURNAL_ARTICLES,
  type FlightJournalItem,
} from "@/types/storefront-config";

interface FlightJournalShowcaseProps {
  articles?: FlightJournalItem[];
}

export function FlightJournalShowcase({ articles }: FlightJournalShowcaseProps) {
  const currentArticles = (articles && articles.length > 0 ? articles : DEFAULT_JOURNAL_ARTICLES).filter(
    (a) => a.enabled !== false
  );

  return (
    <section className="bg-white py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              A little insight. A better flight.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
              Field notes, regulatory tips in India, and camera craft from seasoned aerial filmmakers.
            </p>
          </div>
          <Link
            href="/journal"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-zinc-600 transition"
          >
            <span>Explore the journal</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Dynamic Article Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {currentArticles.map((article) => (
            <Link
              key={article.id || article.slug}
              href={`/journal/${article.slug}`}
              className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
            >
              <div>
                {/* Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-zinc-100">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized={article.image.startsWith("http")}
                  />
                </div>

                {/* Metadata & Title */}
                <div className="mt-4">
                  <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-400 uppercase">
                    {article.tag}
                  </span>
                  
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold text-black group-hover:text-zinc-700 transition">
                      {article.title}
                    </h3>
                    <ArrowRight className="h-3.5 w-3.5 text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-black shrink-0" />
                  </div>

                  <p className="mt-1.5 text-xs leading-relaxed text-zinc-500 line-clamp-3">
                    {article.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
