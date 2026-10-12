import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, ShieldCheck, Truck, Zap, CheckCircle2 } from "lucide-react";
import { getProductBySlug, getRelatedProducts } from "@/server/queries/catalog";
import {
  MediaGallery,
  type MediaAssetItem,
} from "@/components/storefront/media-gallery";
import { HardwareSpecMatrix } from "@/components/storefront/hardware-spec-matrix";
import { ProductCard } from "@/components/storefront/product-card";
import { StickyPurchaseBar } from "@/components/storefront/sticky-purchase-bar";
import { ProductPurchaseActions } from "@/components/storefront/product-purchase-actions";
import { formatINR } from "@/lib/utils";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

function getProductFallbackImage(name: string, slug: string): string {
  const lower = (name + " " + slug).toLowerCase();
  if (lower.includes("air 3s")) return "/images/dji-air-3s.jpg";
  if (lower.includes("mavic 3")) return "/images/dji-mavic-3-pro.jpg";
  if (lower.includes("avata 2")) return "/images/dji-avata-2.jpg";
  if (lower.includes("neo")) return "/images/dji-neo-palm.jpg";
  if (lower.includes("mini 3")) return "/images/preowned-mini-canyon.jpg";
  if (lower.includes("air 2s")) return "/images/dji-air-3s.jpg";
  if (lower.includes("mini 4")) return "/images/preowned-mini-canyon.jpg";
  return "/images/altitude-hero-bg.jpg";
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
    const formattedTitle = slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return {
      title: `${formattedTitle} | Altitude Aviation Tech`,
      description: `Buy ${formattedTitle} at Altitude. Verified technical specs, fast dispatch, and direct UPI payments.`,
    };
  }

  return {
    title: `${product.name} | Altitude Aviation Tech`,
    description:
      product.description?.slice(0, 160) ||
      `Buy ${product.name} at Altitude. Fast dispatch, verified technical specs, and direct UPI payments.`,
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

  if (!product) {
    notFound();
  }

  const fallbackImg = getProductFallbackImage(product.name, product.slug);

  const formattedMedia: MediaAssetItem[] = (
    product.media && product.media.length > 0
      ? product.media
      : [{ id: "m-1", url: fallbackImg, mediaType: "image", displayOrder: 0 }]
  ).map((m: any) => ({
    id: m.id,
    mediaType: m.mediaType as "image" | "video",
    url: m.url?.includes("placeholder") ? fallbackImg : m.url || fallbackImg,
    displayOrder: m.displayOrder ?? 0,
  }));

  const primaryImage =
    formattedMedia.find((m) => m.mediaType === "image")?.url || fallbackImg;

  const isAvailable = product.stockQuantity > 0;

  return (
    <div className="bg-white min-h-screen text-zinc-900 py-8">
      <div className="mx-auto max-w-[1520px] px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="mb-8 flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
          <Link href="/" className="hover:text-black transition">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/catalog" className="hover:text-black transition">
            Catalog
          </Link>
          {product.category && (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link
                href={`/catalog?category=${product.category.slug}`}
                className="hover:text-black transition"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <ChevronRight className="h-3 w-3" />
          <span className="truncate text-black font-semibold max-w-[240px]">
            {product.name}
          </span>
        </nav>

        {/* Product Hero 2-Column Grid */}
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          
          {/* Left Column: Image Media Gallery */}
          <div className="lg:col-span-6">
            <div className="sticky top-24 rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4 shadow-xs">
              <MediaGallery
                productName={product.name}
                media={formattedMedia}
                isSecondHand={product.isSecondHand}
              />
            </div>
          </div>

          {/* Right Column: Commercial Overview, Real-Time Stock & Purchasing */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            
            {/* Header & Badges */}
            <div className="border-b border-zinc-200 pb-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold tracking-wider text-zinc-500 uppercase">
                  SKU: {product.sku}
                </span>
                {product.isSecondHand ? (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-mono font-bold text-emerald-800 uppercase">
                    Grade {product.secondHandDetails?.cosmeticGrade || "A"} Certified Pre-Owned
                  </span>
                ) : (
                  <span className="rounded-full bg-black px-2.5 py-0.5 text-[10px] font-mono font-bold text-white uppercase">
                    Factory Brand New
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-black leading-tight">
                {product.name}
              </h1>

              {/* Pricing & Tax Note */}
              <div className="flex items-baseline gap-3 pt-1">
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-black">
                  {formatINR(product.basePricePaise)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">
                  All taxes included • 0% UPI Fee
                </span>
              </div>

              {/* Real-time Stock Indicator */}
              <div className="flex items-center gap-2 text-xs font-semibold pt-1">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    isAvailable ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                  }`}
                />
                <span
                  className={isAvailable ? "text-emerald-700" : "text-rose-600"}
                >
                  {isAvailable
                    ? `In Stock (${product.stockQuantity} unit${product.stockQuantity > 1 ? "s" : ""} ready for dispatch)`
                    : "Currently Out of Stock"}
                </span>
              </div>
            </div>

            {/* Value Highlights Grid */}
            <div className="grid grid-cols-3 gap-2.5 text-xs text-zinc-700">
              <div className="flex flex-col items-center justify-center text-center rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-1">
                <Truck className="h-4 w-4 text-black" />
                <span className="font-bold text-[11px]">Express Air</span>
                <span className="text-[10px] text-zinc-500">Delhivery / Blue Dart</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-1">
                <ShieldCheck className="h-4 w-4 text-black" />
                <span className="font-bold text-[11px]">32-Point Test</span>
                <span className="text-[10px] text-zinc-500">Zero Crash Verified</span>
              </div>
              <div className="flex flex-col items-center justify-center text-center rounded-xl border border-zinc-200 bg-zinc-50 p-3 space-y-1">
                <Zap className="h-4 w-4 text-black" />
                <span className="font-bold text-[11px]">Direct UPI</span>
                <span className="text-[10px] text-zinc-500">Zero Markup</span>
              </div>
            </div>

            {/* Description Paragraph */}
            {product.description && (
              <div className="text-sm leading-relaxed text-zinc-600">
                <p>{product.description}</p>
              </div>
            )}

            {/* Desktop & Mobile Purchase Action Box */}
            <ProductPurchaseActions
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

            {/* Technical Specifications Matrix */}
            <div className="pt-4 border-t border-zinc-200">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-500 font-mono mb-3">
                Technical Specifications & Flight Telemetry
              </h2>
              <HardwareSpecMatrix
                specifications={product.specifications || product.droneSpecifications}
                secondHandDetails={product.secondHandDetails}
                isSecondHand={product.isSecondHand}
              />
            </div>

          </div>
        </div>

        {/* Related Hardware Section */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t border-zinc-200 pt-12">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <span className="text-[10px] font-mono font-bold tracking-wider text-zinc-500 uppercase">
                  Cross-Fleet Hardware
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-black mt-1">
                  Compatible Gear & Flight Accessories
                </h2>
              </div>
              <Link
                href="/catalog"
                className="text-xs font-bold text-black hover:underline"
              >
                View all hardware →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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

      </div>
    </div>
  );
}
