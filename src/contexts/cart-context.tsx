"use client";

import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Cart } from "@/lib/types";
import { createContext, useCallback, useContext, useEffect, useState } from "react";

type CartContextValue = {
  cart: Cart | null;
  cartQuantity: number;
  isGuestCart: boolean;
  loading: boolean;
  mutating: boolean;
  refreshCart: () => Promise<void>;
  addItem: (productId: string, quantity: number) => Promise<void>;
  updateItem: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  checkout: () => Promise<{ sessionId: string }>;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);
const GUEST_CART_STORAGE_KEY = "ecommerce_guest_cart_v1";

type GuestCartItem = {
  productId: string;
  quantity: number;
  productName: string;
  unitPrice: number;
};

function readGuestCart(): GuestCartItem[] {
  try {
    const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as GuestCartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) =>
      item &&
      typeof item.productId === "string" &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0 &&
      typeof item.productName === "string" &&
      Number.isFinite(item.unitPrice) &&
      item.unitPrice >= 0
    );
  } catch {
    return [];
  }
}

function writeGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { token, effectiveCustomerId, user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [optimisticQuantityDelta, setOptimisticQuantityDelta] = useState(0);
  const [loading, setLoading] = useState(false);
  const [mutating, setMutating] = useState(false);
  const isGuest = !user;
  const isGuestCart = isGuest && !token;

  const refreshCart = useCallback(async () => {
    if (isGuestCart) {
      const items = readGuestCart();
      setCart({
        id: "guest-cart",
        customerId: "guest",
        items: items.map((item) => ({
          id: item.productId,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.unitPrice * item.quantity
        })),
        totalAmount: items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
      });
      setOptimisticQuantityDelta(0);
      return;
    }
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
  }, [token, effectiveCustomerId, isGuestCart]);

  useEffect(() => {
    refreshCart().catch(() => undefined);
  }, [refreshCart]);

  useEffect(() => {
    if (!token || !effectiveCustomerId) return;
    const pendingGuestItems = readGuestCart();
    if (!pendingGuestItems.length) return;
    let cancelled = false;
    setMutating(true);
    (async () => {
      try {
        for (const item of pendingGuestItems) {
          await api.addToCart(token, effectiveCustomerId, item.productId, Math.max(1, Math.trunc(item.quantity)));
        }
        if (!cancelled) {
          localStorage.removeItem(GUEST_CART_STORAGE_KEY);
          await refreshCart();
        }
      } finally {
        if (!cancelled) setMutating(false);
      }
    })().catch(() => {
      if (!cancelled) setMutating(false);
    });
    return () => {
      cancelled = true;
    };
  }, [token, effectiveCustomerId, refreshCart]);

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
    if (isGuestCart) {
      setMutating(true);
      setOptimisticQuantityDelta((prev) => prev + quantity);
      try {
        const product = await api.getProduct(productId);
        const currentItems = readGuestCart();
        const existing = currentItems.find((entry) => entry.productId === productId);
        const nextItems = existing
          ? currentItems.map((entry) =>
              entry.productId === productId
                ? {
                    ...entry,
                    quantity: entry.quantity + quantity
                  }
                : entry
            )
          : [
              ...currentItems,
              {
                productId,
                quantity,
                productName: product.name,
                unitPrice: product.price
              }
            ];
        writeGuestCart(nextItems);
        await refreshCart();
      } catch (err) {
        setOptimisticQuantityDelta(0);
        throw err;
      } finally {
        setMutating(false);
      }
      return;
    }
    if (!token || !effectiveCustomerId) throw new Error("Login to use cart.");
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
    if (isGuestCart) {
      setMutating(true);
      try {
        const nextItems = readGuestCart().map((item) =>
          item.productId === itemId ? { ...item, quantity: Math.max(1, Math.trunc(quantity)) } : item
        );
        writeGuestCart(nextItems);
        await refreshCart();
      } finally {
        setMutating(false);
      }
      return;
    }
    if (!token || !effectiveCustomerId) throw new Error("Login to use cart.");
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
    if (isGuestCart) {
      setMutating(true);
      try {
        const nextItems = readGuestCart().filter((item) => item.productId !== itemId);
        writeGuestCart(nextItems);
        await refreshCart();
      } finally {
        setMutating(false);
      }
      return;
    }
    if (!token || !effectiveCustomerId) throw new Error("Login to use cart.");
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
    if (isGuestCart) throw new Error("Login to checkout. Your guest cart will be merged automatically.");
    if (!token || !effectiveCustomerId) throw new Error("Login to checkout.");
    setMutating(true);
    try {
      const session = await api.createCheckoutSession(token);
      setOptimisticQuantityDelta(0);
      return { sessionId: session.id };
    } finally {
      setMutating(false);
    }
  };

  const cartQuantity = (cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0) + optimisticQuantityDelta;
  const value = { cart, cartQuantity, isGuestCart, loading, mutating, refreshCart, addItem, updateItem, removeItem, checkout };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
