"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Plus, Check, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { resolveImageUrl } from "@/lib/media";
import { formatINR } from "@/lib/utils";
import { checkAddToCartAllowed } from "@/lib/auth-client";

export interface AccessoriesShowcaseProps {
  items?: any[];
}

export function AccessoriesShowcase({ items = [] }: AccessoriesShowcaseProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCartStore();
  const [addedItem, setAddedItem] = useState<string | null>(null);

  const handleAdd = async (item: any) => {
    const guard = await checkAddToCartAllowed();
    if (!guard.allowed) {
      if (guard.reason === "unauthenticated") {
        router.push(guard.loginUrl);
        return;
      }
      if (guard.reason === "admin") {
        alert(guard.message);
        return;
      }
    }

    const img = resolveImageUrl(item.media?.[0]?.url, item.name);
    addItem({
      productId: item.id,
      name: item.name,
      slug: item.slug,
      basePricePaise: item.basePricePaise,
      thumbnailUrl: img,
      isSecondHand: Boolean(item.isSecondHand),
      stockAvailable: item.stockQuantity ?? 1,
    });
    setAddedItem(item.id);
    setIsOpen(true);
    setTimeout(() => setAddedItem(null), 1800);
  };

  return (
    <section className="bg-white py-14 sm:py-18 text-zinc-900 border-b border-zinc-200/80">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-black">
              Small additions. Big adventures.
            </h2>
            <p className="mt-1.5 text-xs sm:text-sm text-zinc-500">
              Essential batteries, cinema glass, controllers, and protective luggage.
            </p>
          </div>
          <Link
            href="/catalog?category=accessories"
            className="group inline-flex items-center gap-1.5 text-xs font-bold text-black hover:text-zinc-600 transition"
          >
            <span>Shop accessories</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 p-8 text-center">
            <p className="text-sm font-bold text-zinc-700">No accessories currently in stock</p>
            <p className="mt-1 text-xs text-zinc-500">
              When accessory products are added to the database, they will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {items.slice(0, 4).map((item) => {
              const isAdded = addedItem === item.id;
              const image = resolveImageUrl(item.media?.[0]?.url, item.name);
              const categoryTag = item.category?.name?.toUpperCase() || "ACCESSORY";

              return (
                <div
                  key={item.id}
                  className="group flex flex-col justify-between rounded-2xl border border-zinc-200/80 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg"
                >
                  <div>
                    {/* Image */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="block relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100"
                    >
                      <Image
                        src={image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Metadata */}
                    <div className="mt-4">
                      <span className="font-mono text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                        {categoryTag}
                      </span>
                      <Link
                        href={`/product/${item.slug}`}
                        className="mt-1 block text-sm font-bold text-black leading-snug hover:underline"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 line-clamp-2">
                        {item.description || "High-performance authentic accessory built for flight reliability."}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Price & Add Action */}
                  <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-3">
                    <span className="font-mono text-sm font-black text-black">
                      {formatINR(item.basePricePaise)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleAdd(item)}
                      aria-label={`Add ${item.name} to bag`}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-all active:scale-95 cursor-pointer ${
                        isAdded
                          ? "bg-black text-[#c8f33b]"
                          : "bg-[#c8f33b] hover:bg-[#b8e530] text-black shadow-xs"
                      }`}
                    >
                      {isAdded ? (
                        <Check className="h-4 w-4 stroke-[3]" />
                      ) : (
                        <Plus className="h-4 w-4 stroke-[2.5]" />
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
