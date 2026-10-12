"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { formatINR } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

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
  const { addItem, items } = useCartStore();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const details = product.secondHandDetails;
  const grade = details?.cosmeticGrade || "A";

  const primaryImage =
    product.media?.find((m) => m.mediaType === "image")?.url ||
    "/placeholders/drone-placeholder.webp";

  const isInCart = items.some((item) => item.productId === product.id);
  const isAvailable = product.stockQuantity > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!isAvailable) return;

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
  const whatsappUrl = `https://wa.me/919999999999?text=${encodeURIComponent(
    `Hello AeroStore, I have an inquiry about Pre-Owned Drone: ${product.name} (SKU:${product.sku}). Is it still available for bench-inspection?`
  )}`;

  return (
    <div className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-4 transition-all duration-300 hover:border-zinc-700 hover:bg-zinc-900/70">
      {/* Top Media & Badges */}
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-zinc-950">
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
            className="object-contain p-3 transition-transform duration-300 hover:scale-105"
          />
        </Link>
      </div>

      {/* Main Info */}
      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <div className="flex items-center justify-between font-mono text-[11px] text-zinc-500">
            <span>{product.sku}</span>
            <span>{isAvailable ? "Unit In Stock" : "Reserved / Sold"}</span>
          </div>

          <Link href={`/product/${product.slug}`}>
            <h3 className="mt-1 line-clamp-1 text-base font-semibold text-zinc-100 transition-colors hover:text-indigo-400">
              {product.name}
            </h3>
          </Link>

          <p className="mt-1 text-base font-bold text-zinc-100">
            {formatINR(product.basePricePaise)}
          </p>
        </div>

        {/* Diagnostic Snapshot Bar */}
        <div className="mt-3 grid grid-cols-2 gap-2 border-t border-b border-zinc-800/80 py-2.5 text-xs text-zinc-400">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              Flight:{" "}
              <strong className="text-zinc-200">
                {details?.flightHours ?? 0} hrs
              </strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <BatteryCharging className="h-3.5 w-3.5 text-zinc-500" />
            <span>
              Battery:{" "}
              <strong className="text-zinc-200">
                {details?.batteryCycleCount ?? 0} cycles
              </strong>
            </span>
          </div>
        </div>

        {/* Expandable Inspection Drawer Toggle */}
        <button
          type="button"
          onClick={() => setDrawerOpen(!drawerOpen)}
          className="mt-2.5 flex items-center justify-between rounded-lg bg-zinc-800/50 px-3 py-1.5 text-xs text-zinc-300 hover:bg-zinc-800"
        >
          <div className="flex items-center gap-1.5 font-medium">
            <ShieldCheck className="h-3.5 w-3.5 text-indigo-400" />
            <span>Technician Diagnostic Report</span>
          </div>
          {drawerOpen ? (
            <ChevronUp className="h-3.5 w-3.5 text-zinc-400" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-zinc-400" />
          )}
        </button>

        {/* Expanded Diagnostic Information */}
        {drawerOpen && (
          <div className="mt-2.5 rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-xs text-zinc-300">
            <p className="text-[11px] text-zinc-400">
              {details?.inspectionNotes ||
                "Passed 18-point pre-flight stability check and ESC bench load tests."}
            </p>

            <div className="mt-2 border-t border-zinc-800 pt-2">
              <span className="font-semibold text-zinc-400">
                Crash History:{" "}
              </span>
              <span
                className={
                  details?.crashHistory
                    ? "font-medium text-rose-400"
                    : "font-medium text-emerald-400"
                }
              >
                {details?.crashHistory
                  ? "Logged minor strike (Refurbished arms)"
                  : "Zero crash incidents logged"}
              </span>
            </div>

            {details?.includedAccessories &&
              details.includedAccessories.length > 0 && (
                <div className="mt-2 border-t border-zinc-800 pt-2">
                  <div className="mb-1 flex items-center gap-1 font-semibold text-zinc-400">
                    <PackageCheck className="h-3 w-3 text-indigo-400" />
                    <span>Included Spares & Accessories:</span>
                  </div>
                  <ul className="list-inside list-disc space-y-0.5 text-[11px] text-zinc-300">
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
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-semibold shadow-md transition-all ${
              !isAvailable
                ? "cursor-not-allowed bg-zinc-800 text-zinc-500"
                : isInCart
                  ? "border border-zinc-700 bg-zinc-800 text-zinc-200 hover:bg-zinc-700"
                  : "bg-indigo-600 text-white hover:bg-indigo-500"
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>
              {isInCart ? "In Cart" : isAvailable ? "Add to Cart" : "Sold"}
            </span>
          </button>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center rounded-xl border border-emerald-600/40 bg-emerald-950/40 p-2.5 text-emerald-300 transition-colors hover:bg-emerald-900/50"
            title="Ask technical questions via WhatsApp"
          >
            <MessageCircle className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
