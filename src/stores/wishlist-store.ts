"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface WishlistItem {
  productId: string;
  slug: string;
  name: string;
  basePricePaise: number;
  thumbnailUrl: string;
  isSecondHand?: boolean;
}

interface WishlistStoreState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (productId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getItemCount: () => number;
}

export const useWishlistStore = create<WishlistStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const current = get().items;
        if (!current.some((i) => i.productId === item.productId)) {
          set({ items: [item, ...current] });
        }
      },

      removeItem: (productId) => {
        set({ items: get().items.filter((i) => i.productId !== productId) });
      },

      toggleItem: (item) => {
        const current = get().items;
        const exists = current.some((i) => i.productId === item.productId);
        if (exists) {
          set({ items: current.filter((i) => i.productId !== item.productId) });
        } else {
          set({ items: [item, ...current] });
        }
      },

      isInWishlist: (productId) => {
        return get().items.some((i) => i.productId === productId);
      },

      clearWishlist: () => {
        set({ items: [] });
      },

      getItemCount: () => {
        return get().items.length;
      },
    }),
    {
      name: "flight-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
