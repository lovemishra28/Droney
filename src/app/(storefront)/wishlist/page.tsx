"use client";

import React, { useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight, ShoppingBag, Trash2 } from "lucide-react";
import { useWishlistStore } from "@/stores/wishlist-store";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { resolveImageUrl } from "@/lib/media";
import { checkAddToCartAllowed } from "@/lib/auth-client";

export default function WishlistPage() {
  const router = useRouter();
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, setIsOpen } = useCartStore();

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-white text-zinc-900 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 border border-zinc-200 text-zinc-900 shadow-xs">
            <Heart className="h-8 w-8 text-black fill-black" />
          </div>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-black sm:text-4xl">
            Your Flight Wishlist
          </h1>
          <p className="mt-3 text-xs sm:text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
            Save high-performance camera drones, telemetry components, and certified pre-owned units to monitor drop announcements and instant reservations.
          </p>

          <div className="mt-8 rounded-3xl border border-zinc-200 bg-zinc-50/70 p-8 max-w-lg mx-auto shadow-xs">
            <p className="text-sm font-medium text-zinc-700">
              You currently have <strong className="text-black font-bold">0 items</strong> saved in your flight wishlist.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/catalog"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8f33b] px-6 py-3 text-sm font-bold text-black hover:bg-[#b8e530] transition-all shadow-xs"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/used-drones"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-zinc-300 bg-white px-6 py-3 text-sm font-bold text-zinc-800 hover:bg-zinc-100 transition-all shadow-xs"
              >
                <span>Pre-Owned Fleet</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleAddToCart = async (item: (typeof items)[0]) => {
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
      productId: item.productId,
      slug: item.slug,
      name: item.name,
      basePricePaise: item.basePricePaise,
      thumbnailUrl: item.thumbnailUrl,
      isSecondHand: !!item.isSecondHand,
      quantity: 1,
    });
    setIsOpen(true);
  };

  return (
    <div className="min-h-[70vh] bg-white text-zinc-900 py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-zinc-600 uppercase">
              <span>SAVED FLIGHT RIGS</span>
            </div>
            <h1 className="mt-1 text-3xl sm:text-4xl font-black tracking-tight text-black">
              Your Flight Wishlist
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-zinc-500">
              {items.length} drone{items.length > 1 ? "s" : ""} and gear saved for quick checkout.
            </p>
          </div>

          <button
            type="button"
            onClick={clearWishlist}
            className="self-start sm:self-auto text-xs text-zinc-500 hover:text-red-600 font-semibold transition cursor-pointer"
          >
            Clear Wishlist
          </button>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const imageSrc = resolveImageUrl(item.thumbnailUrl, item.name);

            return (
              <div
                key={item.productId}
                className="group relative flex flex-col justify-between rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs hover:border-zinc-300 hover:shadow-lg transition"
              >
                <div>
                  {/* Image & Remove Action */}
                  <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-zinc-100 border border-zinc-200/80">
                    <Image
                      src={imageSrc}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-zinc-500 shadow-sm hover:text-red-600 hover:bg-white transition cursor-pointer"
                      title="Remove from wishlist"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Metadata */}
                  <div className="mt-4">
                    <Link href={`/product/${item.slug}`}>
                      <h3 className="text-base font-bold text-black hover:underline line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                </div>

                {/* Price & Add to Cart */}
                <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4">
                  <span className="text-lg font-black font-mono text-black">
                    {formatINR(item.basePricePaise)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleAddToCart(item)}
                    className="flex items-center gap-1.5 rounded-full bg-[#c8f33b] hover:bg-[#b8e530] text-black px-4 py-2 text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                  >
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Add to Bag</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
