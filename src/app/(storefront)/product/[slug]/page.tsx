import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, Zap } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/queries/catalog";
import {
  MediaGallery,
  type MediaAssetItem,
} from "@/components/storefront/media-gallery";
import { HardwareSpecMatrix } from "@/components/storefront/hardware-spec-matrix";
import { ProductCard } from "@/components/storefront/product-card";
import { StickyPurchaseBar } from "@/components/storefront/sticky-purchase-bar";
import { formatINR } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  let product = null;
  try {
    product = await getProductBySlug(slug);
  } catch {
    // Ignore db offline error
  }

  if (!product) {
    return {
      title: `${slug
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())} | AeroStore Drones`,
      description: `Buy ${slug} at AeroStore. Verified technical specs, fast dispatch, and UPI payments.`,
    };
  }

  return {
    title: `${product.name} | AeroStore Drones`,
    description:
      product.description?.slice(0, 160) ||
      `Buy ${product.name} at AeroStore. Fast dispatch, verified technical specs, and UPI payments.`,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;

  let product: any = null;
  let relatedProducts: any[] = [];

  try {
    product = await getProductBySlug(slug);
    if (product) {
      relatedProducts = await getRelatedProducts(
        product.categoryId,
        product.id,
        3
      );
    }
  } catch (error) {
    console.warn("[PDP Server Query Notice]:", error);
  }

  // Development fallback mock item if database connection is pending or offline
  if (!product) {
    product = {
      id: "prod-mock-1",
      slug,
      name:
        slug === "cinelog35-v2-pre-owned"
          ? "GEPRC CineLog35 V2 HD O3 (Grade A Certified Pre-Owned)"
          : slug === "t-motor-f60-pro-v-1950kv"
            ? "T-Motor F60 PRO V 1950KV Brushless Motor"
            : 'ImpulseRC Apex 5" 6S Freestyle Drone (BNF / ELRS 2.4GHz)',
      sku: "DRN-APX5-6S",
      basePricePaise: 2899900,
      stockQuantity: 4,
      isSecondHand: slug.includes("used") || slug.includes("pre-owned"),
      description:
        "High-performance aerial hardware engineered for cinematic freestyle and extreme flight envelopes. Built with precision carbon plates, high-torque brushless power systems, and pre-tuned flight controller profiles.",
      category: {
        name: "BNF Drones",
        slug: "bnf-drones",
      },
      specifications: {
        frameSizeMm: 225,
        weightGrams: 395,
        inputVoltageLipo: "6S LiPo (22.2V)",
        motorKv: "1950KV",
        fcFirmware: "Betaflight 4.5.1",
        escProtocol: "DShot600",
        flightTimeMinutes: 7,
        payloadCapacityGrams: 450,
      },
      secondHandDetails: {
        cosmeticGrade: "A" as const,
        flightHours: 3.5,
        crashHistory: false,
        batteryCycleCount: 8,
        includedAccessories: [
          "4x Gemfan 51466 Props",
          "GoPro TPU Mount",
          "Hardware Screws Set",
        ],
        inspectionNotes:
          "Flawless carbon frame, 0 gyro noise on Betaflight blackbox analysis.",
      },
      media: [
        {
          id: "m-1",
          url: "/placeholders/drone-placeholder.webp",
          mediaType: "image" as const,
          displayOrder: 0,
        },
      ],
    };
  }

  const formattedMedia: MediaAssetItem[] = (product.media || []).map(
    (m: any) => ({
      id: m.id,
      mediaType: m.mediaType as "image" | "video",
      url: m.url,
      displayOrder: m.displayOrder ?? 0,
    })
  );

  const primaryImage =
    formattedMedia.find((m) => m.mediaType === "image")?.url ||
    "/placeholders/drone-placeholder.webp";

  const isAvailable = product.stockQuantity > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 flex items-center gap-1.5 text-xs text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Home
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/catalog" className="hover:text-zinc-300">
          Catalog
        </Link>
        {product.category && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link
              href={`/catalog?category=${product.category.slug}`}
              className="hover:text-zinc-300"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="h-3 w-3" />
        <span className="max-w-[200px] truncate text-zinc-300">
          {product.name}
        </span>
      </nav>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Left Column: WebP Inspection Gallery & Bunny HLS Player */}
        <div>
          <MediaGallery
            productName={product.name}
            media={formattedMedia}
            isSecondHand={product.isSecondHand}
          />
        </div>

        {/* Right Column: Commercial Overview, Real-Time Stock & Purchasing */}
        <div className="flex flex-col">
          <div className="border-b border-zinc-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-semibold tracking-wider text-indigo-400 uppercase">
                SKU: {product.sku}
              </span>
              {product.isSecondHand && (
                <span className="rounded border border-amber-500/30 bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                  Pre-Owned Certified
                </span>
              )}
            </div>

            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-100 sm:text-3xl">
              {product.name}
            </h1>

            <div className="mt-4 flex items-baseline gap-3">
              <span className="text-3xl font-extrabold tracking-tight text-zinc-100">
                {formatINR(product.basePricePaise)}
              </span>
              <span className="text-xs text-zinc-500">
                All taxes included. Direct UPI payment supported.
              </span>
            </div>

            {/* Inventory Status Indicator */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span
                className={`h-2 w-2 rounded-full ${
                  isAvailable ? "bg-emerald-500" : "bg-rose-500"
                }`}
              />
              <span
                className={isAvailable ? "text-emerald-400" : "text-rose-400"}
              >
                {isAvailable
                  ? `In Stock (${product.stockQuantity} ready to dispatch)`
                  : "Currently Out of Stock"}
              </span>
            </div>
          </div>

          {/* Value Highlights */}
          <div className="my-5 grid grid-cols-2 gap-3 text-xs text-zinc-400 sm:grid-cols-3">
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5">
              <Truck className="h-4 w-4 text-indigo-400" />
              <span>Express Indian Courier</span>
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5">
              <ShieldCheck className="h-4 w-4 text-indigo-400" />
              <span>Tested & Verified Electronics</span>
            </div>
            <div className="col-span-2 flex items-center gap-2 rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-2.5 sm:col-span-1">
              <Zap className="h-4 w-4 text-indigo-400" />
              <span>0% Gateway Fee (Direct UPI)</span>
            </div>
          </div>

          {/* Description Copy */}
          {product.description && (
            <div className="mb-6 text-sm leading-relaxed text-zinc-300">
              <p>{product.description}</p>
            </div>
          )}

          {/* Technical Spec Matrix & Pre-Owned Diagnostics */}
          <div className="mt-2 flex-1">
            <HardwareSpecMatrix
              specifications={product.specifications}
              secondHandDetails={product.secondHandDetails}
              isSecondHand={product.isSecondHand}
            />
          </div>
        </div>
      </div>

      {/* Related SKUs Cross-Sell Section */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 border-t border-zinc-800 pt-10">
          <h2 className="text-lg font-bold tracking-tight text-zinc-100 sm:text-xl">
            Related Hardware & Compatible Components
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={{
                  id: item.id,
                  slug: item.slug,
                  name: item.name,
                  sku: item.sku,
                  basePricePaise: item.basePricePaise,
                  stockQuantity: item.stockQuantity,
                  isSecondHand: item.isSecondHand,
                  media: item.media,
                  secondHandDetails: item.secondHandDetails,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Purchase Action Bar */}
      <StickyPurchaseBar
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          basePricePaise: product.basePricePaise,
          stockQuantity: product.stockQuantity,
          isSecondHand: product.isSecondHand,
          thumbnailUrl: primaryImage,
        }}
      />
    </div>
  );
}
