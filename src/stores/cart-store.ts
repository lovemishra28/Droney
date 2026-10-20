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
  hasInsurance?: boolean;
}

export type AddCartItemInput = Omit<CartItem, "quantity" | "stockAvailable"> & {
  quantity?: number;
  stockAvailable?: number;
  hasInsurance?: boolean;
};

export const productIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidProductId(productId: string): boolean {
  if (!productId || typeof productId !== "string") return false;
  return productIdPattern.test(productId) || productId.trim().length >= 8;
}

interface CartStoreState {
  items: CartItem[];
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  addItem: (item: AddCartItemInput, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  setAllInsurance: (hasInsurance: boolean) => void;
  toggleItemInsurance: (productId: string) => void;
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
        if (!isValidProductId(item.productId)) {
          console.error(
            "[Cart] Refused to add a product without a valid database ID:",
            item.productId
          );
          return;
        }

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
                hasInsurance: !!item.hasInsurance,
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

      setAllInsurance: (hasInsurance: boolean) => {
        set({
          items: get().items.map((i) => ({ ...i, hasInsurance })),
        });
      },

      toggleItemInsurance: (productId: string) => {
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, hasInsurance: !i.hasInsurance }
              : i
          ),
        });
      },

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
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<CartStoreState> | null;
        return {
          ...currentState,
          ...persisted,
          items: (persisted?.items || []).filter((item) =>
            isValidProductId(item.productId)
          ),
        };
      },
      partialize: (state) => ({ items: state.items }),
    }
  )
);
