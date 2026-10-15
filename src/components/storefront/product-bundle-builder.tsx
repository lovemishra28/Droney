"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Check, ShoppingBag, Sparkles } from "lucide-react";
import { useCartStore } from "@/stores/cart-store";
import { formatINR } from "@/lib/utils";
import { checkAddToCartAllowed } from "@/lib/auth-client";

interface BundleItem {
  id: string;
  name: string;
  slug: string;
  pricePaise: number;
  originalPricePaise: number;
  image: string;
  isPrimary?: boolean;
}

interface ProductBundleBuilderProps {
  primaryProduct: {
    id: string;
    name: string;
    slug: string;
    basePricePaise: number;
    thumbnailUrl: string;
  };
}

export function ProductBundleBuilder({
  primaryProduct,
}: ProductBundleBuilderProps) {
  const router = useRouter();
  const { addItem, setIsOpen } = useCartStore();

  const bundleItems: BundleItem[] = [
    {
      id: primaryProduct.id,
      name: primaryProduct.name,
      slug: primaryProduct.slug,
      pricePaise: primaryProduct.basePricePaise,
      originalPricePaise: Math.round(primaryProduct.basePricePaise * 1.15),
      image: primaryProduct.thumbnailUrl,
      isPrimary: true,
    },
    {
      id: "bundle-chg-65w-001",
      name: "65W GaN Fast Charger & Dual Hub",
      slug: "65w-portable-fast-charger-acc-chg",
      pricePaise: 349000,
      originalPricePaise: 429000,
      image: "/images/accessory-battery.jpg",
    },
    {
      id: "bundle-prop-ln-002",
      name: "Low-Noise Propellers Set (2 Pairs)",
      slug: "low-noise-propellers-diy-prop",
      pricePaise: 189000,
      originalPricePaise: 249000,
      image: "/images/diy-propellers.jpg",
    },
  ];

  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({
    [primaryProduct.id]: true,
    "bundle-chg-65w-001": true,
    "bundle-prop-ln-002": true,
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toggleItem = (id: string) => {
    // Primary item cannot be deselected in bundle
    if (id === primaryProduct.id) return;
    setSelectedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeBundleItems = bundleItems.filter((i) => selectedItems[i.id]);

  const totalPaise = activeBundleItems.reduce(
    (acc, curr) => acc + curr.pricePaise,
    0
  );

  const originalTotalPaise = activeBundleItems.reduce(
    (acc, curr) => acc + curr.originalPricePaise,
    0
  );

  const savingsPaise = Math.max(0, originalTotalPaise - totalPaise);

  const handleAddBundleToCart = async () => {
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

    activeBundleItems.forEach((item) => {
      addItem({
        productId: item.id,
        name: item.name,
        slug: item.slug,
        basePricePaise: item.pricePaise,
        thumbnailUrl: item.image,
        isSecondHand: false,
        quantity: 1,
        stockAvailable: 10,
      });
    });

    setToastMessage(`Added ${activeBundleItems.length} items to Flight Bag!`);
    setTimeout(() => {
      setToastMessage(null);
      setIsOpen(true);
    }, 500);
  };

  return (
    <div className="mt-12 rounded-2xl border border-zinc-200/90 bg-zinc-50/70 p-6 sm:p-8">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-black px-4 py-2.5 text-xs font-bold text-white shadow-2xl animate-in slide-in-from-bottom-3">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#7ba500]" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-black">
              Frequently Bought Together
            </span>
          </div>
          <p className="mt-1 text-xs text-zinc-500">
            Combine essential flight power & protective spares with bundle-exclusive pricing.
          </p>
        </div>

        {savingsPaise > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8f33b]/20 border border-[#c8f33b]/50 px-3 py-1 text-xs font-black text-black self-start sm:self-auto">
            Save {formatINR(savingsPaise)} on Combo
          </span>
        )}
      </div>

      {/* Bundle Products Visual Layout */}
      <div className="mt-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        
        {/* Product Cards Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 flex-1">
          {bundleItems.map((item, idx) => {
            const isChecked = selectedItems[item.id];
            return (
              <React.Fragment key={item.id}>
                {idx > 0 && (
                  <div className="hidden sm:flex h-8 w-8 items-center justify-center rounded-full bg-zinc-200 text-zinc-600">
                    <Plus className="h-4 w-4 stroke-[2.5]" />
                  </div>
                )}

                <div
                  onClick={() => toggleItem(item.id)}
                  className={`group relative flex flex-col justify-between w-[150px] sm:w-[170px] rounded-xl border p-3 transition-all cursor-pointer ${
                    isChecked
                      ? "border-black bg-white shadow-sm ring-1 ring-black/5"
                      : "border-zinc-200 bg-zinc-100/60 opacity-60 hover:opacity-80"
                  }`}
                >
                  {/* Checkbox */}
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-4.5 w-4.5 items-center justify-center rounded border transition ${
                        isChecked
                          ? "border-black bg-black text-white"
                          : "border-zinc-300 bg-white"
                      }`}
                    >
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>

                    {item.isPrimary && (
                      <span className="rounded bg-zinc-100 px-1.5 py-0.5 text-[9px] font-mono font-bold text-zinc-600 uppercase">
                        This Item
                      </span>
                    )}
                  </div>

                  {/* Thumbnail */}
                  <div className="my-2 aspect-square w-full overflow-hidden rounded-lg bg-zinc-100 relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Info */}
                  <div>
                    <h4 className="text-xs font-bold text-black line-clamp-1 group-hover:underline">
                      {item.name}
                    </h4>
                    <div className="mt-1 flex items-baseline gap-1.5">
                      <span className="text-xs font-black font-mono text-black">
                        {formatINR(item.pricePaise)}
                      </span>
                      <span className="text-[10px] text-zinc-400 line-through font-mono">
                        {formatINR(item.originalPricePaise)}
                      </span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Action / Summary Column */}
        <div className="flex flex-col justify-center rounded-xl border border-zinc-200 bg-white p-5 lg:w-72 shrink-0 shadow-2xs">
          <span className="text-[11px] font-mono text-zinc-500 uppercase">
            Total Bundle Price ({activeBundleItems.length} items):
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-black tracking-tight text-black font-mono">
              {formatINR(totalPaise)}
            </span>
            {savingsPaise > 0 && (
              <span className="text-xs text-zinc-400 line-through font-mono">
                {formatINR(originalTotalPaise)}
              </span>
            )}
          </div>

          <p className="mt-1 text-[11px] text-emerald-700 font-medium">
            ✓ In stock & ready for express dispatch
          </p>

          <button
            type="button"
            onClick={handleAddBundleToCart}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-xs font-bold text-white shadow-md hover:bg-zinc-800 transition active:scale-98"
          >
            <ShoppingBag className="h-4 w-4 text-[#c8f33b]" />
            <span>Add {activeBundleItems.length} to Flight Bag</span>
          </button>
        </div>

      </div>
    </div>
  );
}
