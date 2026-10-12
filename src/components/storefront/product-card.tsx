"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus, ShieldCheck } from "lucide-react";
import { formatINR } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/media";
import { isValidProductId, useCartStore } from "@/stores/cart-store";

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

function getCardFallbackImage(name: string, sku: string): string {
  const lower = (name + " " + sku).toLowerCase();
  if (lower.includes("air 3s") || lower.includes("a3s")) return "/images/dji-air-3s.jpg";
  if (lower.includes("mavic 3") || lower.includes("m3p")) return "/images/dji-mavic-3-pro.jpg";
  if (lower.includes("avata 2") || lower.includes("av2")) return "/images/dji-avata-2.jpg";
  if (lower.includes("neo")) return "/images/dji-neo-palm.jpg";
  if (lower.includes("mini") || lower.includes("used") || lower.includes("cinelog") || lower.includes("pre-owned")) return "/images/preowned-mini-canyon.jpg";
  return "/images/altitude-hero-bg.jpg";
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

  const rawUrl =
    product.media?.find((m) => m.mediaType === "image")?.url ||
    props.thumbnailUrl;
  
  const fallbackImg = getCardFallbackImage(product.name, product.sku);
  const primaryImage =
    rawUrl && (rawUrl.startsWith("/images/") || rawUrl.startsWith("http://") || rawUrl.startsWith("https://"))
      ? resolveImageUrl(rawUrl)
      : fallbackImg;

  const isInCart = items.some((item) => item.productId === product.id);
  const hasValidProductId = isValidProductId(product.id);
  const isOutOfStock = product.stockQuantity <= 0 || !hasValidProductId;
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
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-200/90 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg">
      {/* Visual Badges: Condition & Stock */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5">
        {product.isSecondHand && (
          <span className="flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
            <ShieldCheck className="h-3 w-3" />
            Grade {grade} Pre-Owned
          </span>
        )}

        {isLowStock && (
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-800">
            Only {product.stockQuantity} left
          </span>
        )}
      </div>

      {/* Media Canvas */}
      <Link
        href={`/product/${product.slug}`}
        className="relative aspect-square w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100"
      >
        <Image
          src={primaryImage}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      {/* Product Metadata */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] font-medium text-zinc-400">
            <span className="uppercase tracking-wider">{product.category?.name || "Hardware"}</span>
            <span className="font-mono">{product.sku}</span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-2 text-sm font-bold text-zinc-900 transition-colors group-hover:text-black">
              {product.name}
            </h3>
          </Link>
        </div>

        {/* Pricing & Cart Action */}
        <div className="mt-4 flex items-center justify-between border-t border-zinc-100 pt-3">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400">Price</span>
            <p className="text-base font-black tracking-tight text-black">
              {formatINR(product.basePricePaise)}
            </p>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={handleAddToCart}
            className={`flex h-9 items-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-all shadow-xs active:scale-95 ${
              isOutOfStock
                ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400"
                : addedRecently
                  ? "bg-emerald-600 text-white"
                  : isInCart
                    ? "bg-black text-white hover:bg-zinc-800"
                    : "bg-[#c8f33b] text-black hover:bg-[#b8e530]"
            }`}
          >
            {addedRecently ? (
              <>
                <Check className="h-3.5 w-3.5" />
                <span>Added</span>
              </>
            ) : isOutOfStock ? (
              <span>{hasValidProductId ? "Out of Stock" : "Unavailable"}</span>
            ) : (
              <>
                <Plus className="h-3.5 w-3.5" />
                <span>{isInCart ? "In Bag" : "Add"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
