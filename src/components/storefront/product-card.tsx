"use client";

import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { SecondHandBadge } from "./second-hand-badge";
import { ShoppingCart } from "lucide-react";
import type { CosmeticGrade } from "@/types";

interface ProductCardProps {
  id: string;
  slug: string;
  name: string;
  basePricePaise: number;
  stockQuantity: number;
  isSecondHand: boolean;
  cosmeticGrade?: CosmeticGrade;
  thumbnailUrl?: string;
}

export function ProductCard({
  id,
  slug,
  name,
  basePricePaise,
  stockQuantity,
  isSecondHand,
  cosmeticGrade,
  thumbnailUrl = "/placeholders/drone-part.webp",
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: id,
      slug,
      name,
      basePricePaise,
      quantity: 1,
      thumbnailUrl,
      isSecondHand,
    });
  };

  const isOutOfStock = stockQuantity <= 0;

  return (
    <Link
      href={`/product/${slug}`}
      className="group flex flex-col justify-between overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 transition-all hover:border-zinc-700 hover:shadow-lg hover:shadow-zinc-950/50"
    >
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-zinc-950">
          <div className="flex h-full w-full items-center justify-center text-xs text-zinc-600">
            [Product Image / Cloudflare R2]
          </div>
          {isSecondHand && cosmeticGrade && (
            <div className="absolute top-2.5 left-2.5">
              <SecondHandBadge grade={cosmeticGrade} />
            </div>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
              <span className="rounded bg-zinc-800 px-2 py-1 text-xs font-bold text-zinc-300">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        <h3 className="mt-3.5 line-clamp-2 text-sm font-semibold text-zinc-100 transition-colors group-hover:text-emerald-400">
          {name}
        </h3>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-800/80 pt-3">
        <div>
          <span className="text-xs text-zinc-500">Price (Inc. GST)</span>
          <p className="text-base font-bold text-zinc-100">
            {formatINR(basePricePaise)}
          </p>
        </div>

        <button
          onClick={handleQuickAdd}
          disabled={isOutOfStock}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-zinc-950 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          title="Quick add to cart"
        >
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </Link>
  );
}
