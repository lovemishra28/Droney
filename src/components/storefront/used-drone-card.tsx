"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BatteryCharging,
  ChevronDown,
  ChevronUp,
  Clock,
  MessageCircle,
  PackageCheck,
  Plus,
  ShieldCheck,
} from "lucide-react";
import { SecondHandBadge } from "@/components/storefront/second-hand-badge";
import { env } from "@/lib/env";
import { formatINR } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/media";
import { isValidProductId, useCartStore } from "@/stores/cart-store";
import { checkAddToCartAllowed } from "@/lib/auth-client";

export interface UsedDroneProps {
  product: {
    id: string;
    slug: string;
    name: string;
    sku: string;
    basePricePaise: number;
    stockQuantity: number;
    media?: { url: string; mediaType: "image" | "video" }[];
    secondHandDetails?: {
      cosmeticGrade: "A" | "B" | "C";
      flightHours: number | null;
      crashHistory: boolean;
      batteryCycleCount: number | null;
      includedAccessories: string[] | null;
      inspectionNotes: string | null;
    } | null;
  };
}

export function UsedDroneCard({ product }: UsedDroneProps) {
  const router = useRouter();
  const { addItem, items } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const details = product.secondHandDetails;
  const grade = details?.cosmeticGrade || "A";

  const rawImg = product.media?.find((m) => m.mediaType === "image")?.url;
  const fallbackImg = "/images/preowned-mini-canyon.jpg";
  const primaryImage =
    rawImg && (rawImg.startsWith("/images/") || rawImg.startsWith("http://") || rawImg.startsWith("https://"))
      ? resolveImageUrl(rawImg)
      : fallbackImg;

  const isInCart = items.some((item) => item.productId === product.id);
  const isAvailable =
    product.stockQuantity > 0 && isValidProductId(product.id);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;

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

    addItem({
      productId: product.id,
      slug: product.slug,
      name: product.name,
      basePricePaise: product.basePricePaise,
      thumbnailUrl: primaryImage,
      isSecondHand: true,
      stockAvailable: product.stockQuantity,
    });
  };

  // Pre-filled WhatsApp inquiry link for technical binding & radio questions
  const whatsappUrl = `${env.NEXT_PUBLIC_WHATSAPP_BUSINESS_URL}?text=${encodeURIComponent(
    `Hello Altitude Aviation, I have an inquiry about Pre-Owned Drone: ${product.name} (SKU:${product.sku}). Is it still available for bench-inspection?`
  )}`;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-200/90 bg-white p-4 transition-all duration-300 hover:border-zinc-300 hover:shadow-lg">
      {/* Top Media & Badges */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-50 border border-zinc-100">
        <div className="absolute top-3 left-3 z-10">
          <SecondHandBadge grade={grade} />
        </div>

        <Link
          href={`/product/${product.slug}`}
          className="relative block h-full w-full"
        >
          <Image
            src={primaryImage}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Main Info */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-zinc-400">
            <span>{product.sku}</span>
            <span className={isAvailable ? "text-emerald-700 font-semibold" : "text-rose-600 font-semibold"}>
              {isAvailable ? "Unit In Stock" : "Reserved / Sold"}
            </span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-1 text-base font-bold text-zinc-900 transition-colors hover:text-black">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-lg font-black tracking-tight text-black">
            {formatINR(product.basePricePaise)}
          </p>
        </div>

        {/* Diagnostic Snapshot Bar */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-b border-zinc-100 py-2.5 text-xs text-zinc-600">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              Flight:{" "}
              <strong className="text-black font-mono">
                {details?.flightHours ?? 0} hrs
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="h-3.5 w-3.5 text-zinc-400" />
            <span>
              Battery:{" "}
              <strong className="text-black font-mono">
                {details?.batteryCycleCount ?? 0} cycles
              </strong>
            </span>
          </div>
        </div>

        {/* Expandable Inspection Drawer Toggle */}
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="mt-2.5 flex items-center justify-between rounded-xl bg-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 transition"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-black" />
            <span>Technician Diagnostic Report</span>
          </div>
          {drawerOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-500" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-500" />
          )}
        </button>

        {/* Expanded Diagnostic Information */}
        {drawerOpen && (
          <div className="mt-2.5 rounded-xl border border-zinc-200 bg-zinc-50 p-3.5 text-xs text-zinc-700 space-y-2">
            <p className="text-[11px] text-zinc-600 leading-relaxed">
              {details?.inspectionNotes ||
                "Passed 32-point pre-flight stability check and ESC bench load tests."}
            </p>

            <div className="border-t border-zinc-200 pt-2 flex items-center justify-between">
              <span className="font-semibold text-zinc-500">Crash History:</span>
              <span
                className={
                  details?.crashHistory
                    ? "font-bold text-rose-600"
                    : "font-bold text-emerald-700"
                }
              >
                {details?.crashHistory
                  ? "Logged minor strike (Refurbished arms)"
                  : "Zero crash incidents logged"}
              </span>
            </div>

            {details?.includedAccessories &&
              details.includedAccessories.length > 0 && (
                <div className="border-t border-zinc-200 pt-2">
                  <div className="mb-1 flex items-center gap-1 font-semibold text-zinc-600">
                    <PackageCheck className="h-3.5 w-3.5 text-black" />
                    <span>Included Spares & Accessories:</span>
                  </div>
                  <ul className="list-inside list-disc space-y-0.5 text-[11px] text-zinc-600">
                    {details.includedAccessories.map((acc, index) => (
                      <li key={index}>{acc}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        )}

        {/* Action Triggers: Instant Cart + WhatsApp Inquiry */}
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={!isAvailable}
            onClick={handleAddToCart}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 ${
              !isAvailable
                ? "cursor-not-allowed border border-zinc-200 bg-zinc-100 text-zinc-400"
                : isInCart
                  ? "bg-black text-white hover:bg-zinc-800"
                  : "bg-[#c8f33b] text-black hover:bg-[#b8e530]"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>
              {isInCart ? "In Flight Bag" : isAvailable ? "Add to Bag" : "Reserved"}
            </span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 p-2 text-emerald-800 transition hover:bg-emerald-100 shadow-xs"
            title="Ask technical questions via WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
