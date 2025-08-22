
'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  addItem: (product: Product, quantity?: number, variantId?: string) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  applyCoupon: (couponCode: string) => boolean;
  removeCoupon: () => void;
  couponCode?: string;
  discountAmount: number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      itemCount: 0,
      discountAmount: 0,

      addItem: (product: Product, quantity = 1, variantId?: string) => {
        const { items } = get();
        const existingItemIndex = items.findIndex(
          item => item.productId === product.id && item.variantId === variantId
        );

        let newItems: CartItem[];
        
        if (existingItemIndex >= 0) {
          newItems = [...items];
          newItems[existingItemIndex].quantity += quantity;
        } else {
          const newItem: CartItem = {
            id: `${product.id}_${variantId || 'default'}_${Date.now()}`,
            productId: product.id,
            variantId,
            quantity,
            price: product.salePrice || product.basePrice,
            vendorId: product.vendorId
          };
          newItems = [...items, newItem];
        }

        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ 
          items: newItems, 
          total: newTotal, 
          itemCount: newItemCount 
        });
      },

      removeItem: (productId: string, variantId?: string) => {
        const { items } = get();
        const newItems = items.filter(
          item => !(item.productId === productId && item.variantId === variantId)
        );
        
        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ 
          items: newItems, 
          total: newTotal, 
          itemCount: newItemCount 
        });
      },

      updateQuantity: (productId: string, quantity: number, variantId?: string) => {
        if (quantity <= 0) {
          get().removeItem(productId, variantId);
          return;
        }

        const { items } = get();
        const newItems = items.map(item => {
          if (item.productId === productId && item.variantId === variantId) {
            return { ...item, quantity };
          }
          return item;
        });

        const newTotal = newItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

        set({ 
          items: newItems, 
          total: newTotal, 
          itemCount: newItemCount 
        });
      },

      clearCart: () => {
        set({ 
          items: [], 
          total: 0, 
          itemCount: 0, 
          couponCode: undefined, 
          discountAmount: 0 
        });
      },

      applyCoupon: (couponCode: string) => {
        // In a real app, this would validate against the backend
        // For now, we'll simulate coupon validation
        const validCoupons = ['WELCOME20', 'SAVE10'];
        
        if (validCoupons.includes(couponCode)) {
          const { total } = get();
          let discount = 0;
          
          if (couponCode === 'WELCOME20') {
            discount = Math.min(total * 0.2, 50); // 20% off, max $50
          } else if (couponCode === 'SAVE10') {
            discount = total >= 100 ? 10 : 0; // $10 off orders over $100
          }

          set({ couponCode, discountAmount: discount });
          return true;
        }
        return false;
      },

      removeCoupon: () => {
        set({ couponCode: undefined, discountAmount: 0 });
      }
    }),
    {
      name: 'cart-storage',
    }
  )
);
