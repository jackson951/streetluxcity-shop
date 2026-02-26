"use client";

import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Cart } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type CartContextValue = {
  cart: Cart | null;
  cartQuantity: number;
  loading: boolean;
  mutating: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<string>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, effectiveCustomerId } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [optimisticQuantityDelta, setOptimisticQuantityDelta] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token || !effectiveCustomerId) {
      setCart(null);
      setOptimisticQuantityDelta(0);
      return;
    }
    setLoading(true);
    try {
      setCart(await api.getCart(token, effectiveCustomerId));
    } finally {
      setLoading(false);
    }
  }, [token, effectiveCustomerId]);

  useEffect(() => {
    refreshCart().catch(() => undefined);
  }, [refreshCart]);

  const syncCartFromMutation = useCallback(
    async (nextCart: Cart | null | undefined) => {
      if (nextCart && Array.isArray(nextCart.items)) {
        setCart(nextCart);
      }
      // Always re-fetch after mutations so the navbar/cart badge stays in sync with server state.
      await refreshCart();
      setOptimisticQuantityDelta(0);
    },
    [refreshCart]
  );

  const addItem = async (productId: string, quantity: number) => {
    if (!token || !effectiveCustomerId) throw new Error("Switch to customer view to use cart.");
    setMutating(true);
    setOptimisticQuantityDelta((prev) => prev + quantity);
    try {
      const nextCart = await api.addToCart(token, effectiveCustomerId, productId, quantity);
      await syncCartFromMutation(nextCart);
    } catch (err) {
      setOptimisticQuantityDelta(0);
      throw err;
    } finally {
      setMutating(false);
    }
  };

  const updateItem = async (itemId: string, quantity: number) => {
    if (!token || !effectiveCustomerId) throw new Error("Switch to customer view to use cart.");
    setMutating(true);
    try {
      const nextCart = await api.updateCartItem(token, effectiveCustomerId, itemId, quantity);
      await syncCartFromMutation(nextCart);
    } catch (err) {
      setOptimisticQuantityDelta(0);
      throw err;
    } finally {
      setMutating(false);
    }
  };

  const removeItem = async (itemId: string) => {
    if (!token || !effectiveCustomerId) throw new Error("Switch to customer view to use cart.");
    setMutating(true);
    try {
      const nextCart = await api.removeCartItem(token, effectiveCustomerId, itemId);
      await syncCartFromMutation(nextCart);
    } catch (err) {
      setOptimisticQuantityDelta(0);
      throw err;
    } finally {
      setMutating(false);
    }
  };

  const checkout = async () => {
    if (!token || !effectiveCustomerId) throw new Error("Switch to customer view to checkout.");
    setMutating(true);
    try {
      const order = await api.checkout(token, effectiveCustomerId);
      await refreshCart();
      setOptimisticQuantityDelta(0);
      return order.id;
    } finally {
      setMutating(false);
    }
  };

  const cartQuantity = (cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0) + optimisticQuantityDelta;
  const value = { cart, cartQuantity, loading, mutating, refreshCart, addItem, updateItem, removeItem, checkout };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
