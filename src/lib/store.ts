// Zustand store for cart and app state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, CartState, OrderChannel, SelectedOption } from './types';

interface CartStore extends CartState {
  // Actions
  addItem: (item: Omit<CartItem, 'qty'> & { qty?: number }) => void;
  removeItem: (productId: string, options?: SelectedOption[]) => void;
  updateItemQty: (productId: string, qty: number, options?: SelectedOption[]) => void;
  clearCart: () => void;
  applyCoupon: (code: string, discount: number) => void;
  removeCoupon: () => void;
  updateFees: (fees: { service?: number; delivery?: number }) => void;
  setChannel: (channel: OrderChannel) => void;
  setTable: (table: string) => void;
  setRestaurant: (restaurant: string) => void;
  calculateTotals: () => void;
}

const initialState: CartState = {
  items: [],
  restaurant: '',
  table: undefined,
  channel: 'dine_in',
  subtotal: 0,
  discounts: 0,
  fees: {},
  total: 0,
  couponCode: undefined,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      addItem: (item) => {
        const state = get();
        const existingIndex = state.items.findIndex(
          (i) => 
            i.productId === item.productId && 
            JSON.stringify(i.options) === JSON.stringify(item.options)
        );

        let newItems;
        if (existingIndex >= 0) {
          newItems = [...state.items];
          newItems[existingIndex].qty += item.qty || 1;
        } else {
          newItems = [...state.items, { ...item, qty: item.qty || 1 }];
        }

        set({ items: newItems });
        get().calculateTotals();
      },

      removeItem: (productId, options) => {
        const state = get();
        const newItems = state.items.filter(
          (item) => 
            !(item.productId === productId && 
              (!options || JSON.stringify(item.options) === JSON.stringify(options)))
        );
        set({ items: newItems });
        get().calculateTotals();
      },

      updateItemQty: (productId, qty, options) => {
        const state = get();
        const newItems = state.items.map((item) => {
          if (item.productId === productId && 
              (!options || JSON.stringify(item.options) === JSON.stringify(options))) {
            return qty <= 0 ? null : { ...item, qty };
          }
          return item;
        }).filter(Boolean) as CartItem[];

        set({ items: newItems });
        get().calculateTotals();
      },

      clearCart: () => {
        set({ ...initialState, restaurant: get().restaurant });
      },

      applyCoupon: (code, discount) => {
        set({ couponCode: code, discounts: discount });
        get().calculateTotals();
      },

      removeCoupon: () => {
        set({ couponCode: undefined, discounts: 0 });
        get().calculateTotals();
      },

      updateFees: (fees) => {
        set({ fees });
        get().calculateTotals();
      },

      setChannel: (channel) => {
        set({ channel });
        get().calculateTotals();
      },

      setTable: (table) => {
        set({ table });
      },

      setRestaurant: (restaurant) => {
        set({ restaurant });
      },

      calculateTotals: () => {
        const state = get();
        const subtotal = state.items.reduce(
          (sum, item) => {
            const optionsPrice = item.options.reduce((optSum, opt) => optSum + opt.price, 0);
            return sum + (item.price + optionsPrice) * item.qty;
          },
          0
        );

        const feesTotal = Object.values(state.fees).reduce((sum, fee) => sum + (fee || 0), 0);
        const total = subtotal - state.discounts + feesTotal;

        set({ subtotal, total });
      },
    }),
    {
      name: 'cart-store',
      partialize: (state) => ({
        items: state.items,
        restaurant: state.restaurant,
        table: state.table,
        channel: state.channel,
        couponCode: state.couponCode,
      }),
    }
  )
);

// Admin store for managing app state
interface AdminStore {
  selectedRestaurant: string;
  setSelectedRestaurant: (restaurant: string) => void;
}

export const useAdminStore = create<AdminStore>((set) => ({
  selectedRestaurant: 'demo-restaurant',
  setSelectedRestaurant: (restaurant) => set({ selectedRestaurant: restaurant }),
}));