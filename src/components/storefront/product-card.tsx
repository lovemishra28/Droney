"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

export interface ProductCardData {
  id: string;
  slug: string;
  name: string;
  sku: string;
  basePricePaise: number;
  stockQuantity: number;
  isSecondHand: boolean;
  category?: { name: string; slug: string } | null;
  media?: { url: string; mediaType: "image" | "video" }[];
  secondHandDetails?: { cosmeticGrade: string } | null;
  cosmeticGrade?: string;
  thumbnailUrl?: string;
}

export interface ProductCardProps {
  product?: ProductCardData;
  id?: string;
  slug?: string;
  name?: string;
  sku?: string;
  basePricePaise?: number;
  stockQuantity?: number;
  isSecondHand?: boolean;
  category?: { name: string; slug: string } | null;
  media?: { url: string; mediaType: "image" | "video" }[];
  secondHandDetails?: { cosmeticGrade: string } | null;
  cosmeticGrade?: string;
  thumbnailUrl?: string;
}

export function ProductCard(props: ProductCardProps) {
  const product: ProductCardData = props.product || {
    id: props.id || "",
    slug: props.slug || "",
    name: props.name || "",
    sku: props.sku || "",
    basePricePaise: props.basePricePaise || 0,
    stockQuantity: props.stockQuantity ?? 0,
    isSecondHand: !!props.isSecondHand,
    category: props.category,
    media:
      props.media ||
      (props.thumbnailUrl
        ? [{ url: props.thumbnailUrl, mediaType: "image" as const }]
        : []),
    secondHandDetails:
      props.secondHandDetails ||
      (props.cosmeticGrade ? { cosmeticGrade: props.cosmeticGrade } : null),
  };

  const { addItem, items } = useCartStore();
  const [addedRecently, setAddedRecently] = React.useState(false);

  const primaryImage =
    product.media?.find((m) => m.mediaType === "image")?.url ||
    props.thumbnailUrl ||
    "/placeholders/drone-placeholder.webp";

  const isInCart = items.some((item) => item.productId === product.id);
  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock = product.stockQuantity > 0 && product.stockQuantity <= 3;
  const grade =
    product.secondHandDetails?.cosmeticGrade || props.cosmeticGrade || "A";

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isOutOfStock) return;

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      basePricePaise: product.basePricePaise,
      thumbnailUrl: primaryImage,
      isSecondHand: product.isSecondHand,
      stockAvailable: product.stockQuantity,
    });

    setAddedRecently(true);
    setTimeout(() => setAddedRecently(false), 1200);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/40 p-3.5 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/80 hover:shadow-xl">
      {/* Visual Badges: Condition & Stock */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {product.isSecondHand && (
          <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-950/80 px-2 py-0.5 text-[11px] font-semibold text-amber-300 backdrop-blur-md">
            <ShieldCheck className="h-3 w-3" />
            Grade {grade} Pre-Owned
          </span>
        )}

        {isLowStock && (
          <span className="rounded-md border border-rose-500/30 bg-rose-950/80 px-2 py-0.5 text-[11px] font-semibold text-rose-300 backdrop-blur-md">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      {/* Media Canvas */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-950/60"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Product Metadata */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-zinc-500">
            <span>{product.category?.name || "Hardware"}</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-sm font-medium text-zinc-200 transition-colors group-hover:text-indigo-400">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-3.5 flex items-center justify-between border-t border-zinc-800/80 pt-3">
          <div>
            <span className="text-xs text-zinc-500">Price</span>
            <p className="text-base font-semibold tracking-tight text-zinc-100">
              {formatINR(product.basePricePaise)}
            </p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-all ${
              isOutOfStock
                ? "cursor-not-allowed border border-zinc-800 bg-zinc-900 text-zinc-500"
                : addedRecently
                  ? "bg-emerald-600 text-white"
                  : isInCart
                    ? "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                    : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>Out of Stock</span>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>{isInCart ? "Add More" : "Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
