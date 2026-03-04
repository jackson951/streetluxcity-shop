"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { api } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Lock,
  Minus,
  Package,
  Plus,
  ShieldCheck,
  ShoppingBag,
  ShoppingBasket,
  Trash2,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const STANDARD_SHIPPING = 79;
const FREE_SHIPPING_THRESHOLD = 1200;

export default function CartPage() {
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const { cart, isGuestCart, loading, mutating, updateItem, removeItem, checkout } = useCart();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const [productImages, setProductImages] = useState<Record<string, string>>({});

  // Fetch product images for cart items
  useEffect(() => {
    if (cart?.items && cart.items.length > 0) {
      const fetchImages = async () => {
        const imagePromises = cart.items.map(async (item) => {
          try {
            const product = await api.getProduct(item.productId);
            return { productId: item.productId, imageUrl: product.imageUrls[0] || '/placeholder-image.jpg' };
          } catch {
            return { productId: item.productId, imageUrl: '/placeholder-image.jpg' };
          }
        });
        
        const results = await Promise.all(imagePromises);
        const imageMap = results.reduce((acc, { productId, imageUrl }) => {
          acc[productId] = imageUrl;
          return acc;
        }, {} as Record<string, string>);
        
        setProductImages(imageMap);
      };
      
      fetchImages();
    }
  }, [cart?.items]);

  const canCheckout = Boolean(user && canUseCustomerFeatures && !isGuestCart);
  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING : 0;
  const total = subtotal + shipping;
  const freeShippingRemaining = FREE_SHIPPING_THRESHOLD - subtotal;
  const freeShippingProgress = Math.min((subtotal / FREE_SHIPPING_THRESHOLD) * 100, 100);

  const itemCount = useMemo(
    () => cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0,
    [cart?.items]
  );

  async function handleQty(id: string, qty: number) {
    setError(null);
    setUpdatingItemId(id);
    try {
      await updateItem(id, qty);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleRemove(id: string) {
    setError(null);
    setUpdatingItemId(id);
    try {
      await removeItem(id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingItemId(null);
    }
  }

  async function handleCheckout() {
    setError(null);
    setMessage(null);
    setCheckingOut(true);
    try {
      const { sessionId } = await checkout();
      setMessage("Taking you to payment…");
      router.push(`/checkout/payment?sessionId=${sessionId}`);
    } catch (err) {
      setError((err as Error).message);
      setCheckingOut(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">

      {/* Page header */}
      <div className="mb-8 flex items-center gap-3">
        <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
          <ShoppingBasket className="h-4 w-4 text-white" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Your Cart</h1>
          {itemCount > 0 && (
            <p className="text-sm text-slate-500">{itemCount} {itemCount === 1 ? "item" : "items"} ready to order</p>
          )}
        </div>
      </div>

      {/* Auth notices */}
      {!user && (
        <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You're browsing as a guest. <Link href="/login" className="font-semibold underline">Sign in</Link> to complete your purchase.
        </div>
      )}
      {user && !canUseCustomerFeatures && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {hasAdminRole && viewMode === "ADMIN"
            ? "Switch to Customer View to use your cart."
            : "Only customer accounts can checkout."}
        </div>
      )}

      {/* Errors / success */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
      )}
      {message && (
        <div className="mb-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          <ShieldCheck className="h-4 w-4 shrink-0" /> {message}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
          Loading your cart…
        </div>
      )}

      {/* Empty cart */}
      {!loading && !cart?.items.length && (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <ShoppingBag className="h-8 w-8 text-slate-400" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Your cart is empty</h2>
          <p className="mt-1 text-sm text-slate-500">Looks like you haven't added anything yet.</p>
          <Link
            href="/products"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      )}

      {/* Cart content */}
      {cart?.items.length ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">

          {/* ── Items ── */}
          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 px-5 py-4 flex items-center gap-2">
                <Package className="h-4 w-4 text-rose-500" />
                <h2 className="font-bold text-slate-900">Items ({itemCount})</h2>
              </div>

              <ul className="divide-y divide-slate-100">
                {cart.items.map((item) => {
                  const isUpdating = updatingItemId === item.id;
                  const productImage = productImages[item.productId];
                  return (
                    <li
                      key={item.id}
                      className={`flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center transition-opacity ${isUpdating ? "opacity-50" : ""}`}
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        <div className="h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                          {productImage ? (
                            <Image
                              src={productImage}
                              alt={item.productName}
                              width={64}
                              height={64}
                              className="h-full w-full object-cover"
                              priority
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <Package className="h-8 w-8" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Product info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 truncate">{item.productName}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{formatCurrency(item.unitPrice)} each</p>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50">
                          <button
                            onClick={() => handleQty(item.id, item.quantity - 1)}
                            disabled={mutating || item.quantity <= 1}
                            className="flex h-9 w-9 items-center justify-center rounded-l-xl text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQty(item.id, item.quantity + 1)}
                            disabled={mutating}
                            className="flex h-9 w-9 items-center justify-center rounded-r-xl text-slate-600 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <span className="w-24 text-right text-sm font-bold text-slate-900">
                          {formatCurrency(item.subtotal)}
                        </span>

                        <button
                          onClick={() => handleRemove(item.id)}
                          disabled={mutating}
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-400 hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-40 transition-all"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>

          {/* ── Order summary ── */}
          <aside className="h-fit space-y-4 lg:sticky lg:top-24">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-900">Order summary</h2>

              {/* Free shipping progress */}
              <div className="mb-5 rounded-xl bg-slate-50 p-3">
                <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-2">
                  <span className="flex items-center gap-1">
                    <Truck className="h-3.5 w-3.5 text-emerald-500" />
                    {shipping === 0 ? "You've got free shipping! 🎉" : `Add ${formatCurrency(freeShippingRemaining)} for free shipping`}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${freeShippingProgress}%` }}
                  />
                </div>
              </div>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-medium text-slate-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span className={`font-medium ${shipping === 0 ? "text-emerald-600" : "text-slate-900"}`}>
                    {shipping === 0 ? "Free" : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="border-t border-slate-100 pt-3 flex justify-between">
                  <span className="font-bold text-slate-900">Total</span>
                  <span className="text-xl font-extrabold text-slate-900">{formatCurrency(total)}</span>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-5 space-y-3">
                {canCheckout ? (
                  <button
                    onClick={handleCheckout}
                    disabled={mutating || checkingOut}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                  >
                    {checkingOut ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Starting checkout…
                      </>
                    ) : (
                      <>
                        <Lock className="h-4 w-4" />
                        Checkout securely
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
                  >
                    Sign in to checkout
                  </Link>
                )}

                {/* Trust signals */}
                <div className="flex items-center justify-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Secure payment
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" /> Encrypted
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}