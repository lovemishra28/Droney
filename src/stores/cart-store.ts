import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  basePricePaise: number;
  quantity: number;
  thumbnailUrl: string;
  isSecondHand: boolean;
  stockAvailable: number;
}

export type AddCartItemInput = Omit<CartItem, "quantity" | "stockAvailable"> & {
  quantity?: number;
  stockAvailable?: number;
};

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: AddCartItemInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalPaise: () => number;
  getItemCount: () => number;
  // Backward compatibility alias
  getTotalItems: () => number;
}

export const useCartStore = create<CartStoreState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      setIsOpen: (isOpen) => set({ isOpen }),

      addItem: (item, quantityOverride) => {
        const qty = quantityOverride ?? item.quantity ?? 1;
        const available = item.stockAvailable ?? 99;
        const currentItems = get().items;
        const existingItem = currentItems.find(
          (i) => i.productId === item.productId
        );

        if (existingItem) {
          // Prevent cart from exceeding available physical inventory
          const nextQuantity = Math.min(
            existingItem.quantity + qty,
            existingItem.stockAvailable || available
          );

          set({
            items: currentItems.map((i) =>
              i.productId === item.productId
                ? { ...i, quantity: nextQuantity }
                : i
            ),
            isOpen: true,
          });
        } else {
          set({
            items: [
              ...currentItems,
              {
                productId: item.productId,
                slug: item.slug,
                name: item.name,
                basePricePaise: item.basePricePaise,
                thumbnailUrl: item.thumbnailUrl,
                isSecondHand: item.isSecondHand,
                stockAvailable: available,
                quantity: Math.min(qty, available),
              },
            ],
            isOpen: true,
          });
        }
      },

      removeItem: (productId) => {
        set({
          items: get().items.filter((item) => item.productId !== productId),
        });
      },

      updateQuantity: (productId, quantity) => {
        const targetItem = get().items.find((i) => i.productId === productId);
        if (!targetItem) return;

        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map((item) =>
            item.productId === productId
              ? { ...item, quantity: Math.min(quantity, item.stockAvailable) }
              : item
          ),
        });
      },

      clearCart: () => set({ items: [] }),

      getTotalPaise: () => {
        return get().items.reduce(
          (total, item) => total + item.basePricePaise * item.quantity,
          0
        );
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalItems: () => {
        return get().getItemCount();
      },
    }),
    {
      name: "aero_cart_storage",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? localStorage : ({} as Storage)
      ),
      partialize: (state) => ({ items: state.items }),
    }
  )
);
