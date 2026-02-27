"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import { AlertCircle, CircleCheckBig, LockKeyhole, ShoppingBag, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const STANDARD_SHIPPING = 79;
const FREE_SHIPPING_THRESHOLD = 1200;

export default function CartPage() {
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const { cart, isGuestCart, loading, mutating, updateItem, removeItem, checkout } = useCart();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const canCheckout = Boolean(user && canUseCustomerFeatures && !isGuestCart);

  const subtotal = cart?.totalAmount || 0;
  const shipping = subtotal > 0 && subtotal < FREE_SHIPPING_THRESHOLD ? STANDARD_SHIPPING : 0;
  const total = subtotal + shipping;

  const itemCount = useMemo(() => cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0, [cart?.items]);

  return (
    <section className="space-y-6">
      <div className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-700 text-white">
        <div className="grid gap-4 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-amber-300">Checkout flow</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">Review your cart before secure payment</h1>
            <p className="mt-2 text-sm text-slate-200 sm:text-base">Adjust item quantities, verify totals, and continue to payment session checkout.</p>
          </div>
          <div className="grid gap-2 rounded-2xl border border-white/15 bg-slate-950/40 p-4 text-sm">
            <p className="font-semibold text-white">Flow status</p>
            <p className="inline-flex items-center gap-2 text-slate-100"><CircleCheckBig className="h-4 w-4 text-emerald-400" /> Cart review</p>
            <p className="inline-flex items-center gap-2 text-slate-100"><LockKeyhole className="h-4 w-4 text-amber-300" /> Payment authorization</p>
            <p className="inline-flex items-center gap-2 text-slate-100"><Truck className="h-4 w-4 text-brand-200" /> Order fulfillment</p>
          </div>
        </div>
      </div>

      {!user ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          You are shopping as guest. You can add and edit items now, then login to checkout.
        </p>
      ) : null}
      {user && !canUseCustomerFeatures ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          {hasAdminRole && viewMode === "ADMIN"
            ? "Switch to Customer View from the header to use cart and checkout."
            : "Only customer accounts can use the cart and checkout flow."}
        </p>
      ) : null}

      {loading && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading cart...</p>}
      {!cart?.items.length && !loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-slate-400" />
          <p className="mt-3 font-semibold text-slate-900">Your cart is empty</p>
          <p className="mt-1 text-sm text-slate-600">Browse the catalog and add products to start checkout.</p>
          <Link href="/" className="mt-4 inline-flex rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
            Continue shopping
          </Link>
        </div>
      ) : null}

      {cart?.items.length ? (
        <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
          <article className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="text-xl font-semibold text-slate-900">Items in your cart ({itemCount})</h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-medium text-slate-900">{item.productName}</p>
                    <p className="text-sm text-slate-500">Unit price: {formatCurrency(item.unitPrice)}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                    <button
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={mutating || item.quantity <= 1}
                      onClick={async () => {
                        setMessage(null);
                        setUpdatingItemId(item.id);
                        try {
                          await updateItem(item.id, item.quantity - 1);
                        } catch (err) {
                          setMessage((err as Error).message);
                        } finally {
                          setUpdatingItemId(null);
                        }
                      }}
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      className="rounded-md border border-slate-300 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={mutating}
                      onClick={async () => {
                        setMessage(null);
                        setUpdatingItemId(item.id);
                        try {
                          await updateItem(item.id, item.quantity + 1);
                        } catch (err) {
                          setMessage((err as Error).message);
                        } finally {
                          setUpdatingItemId(null);
                        }
                      }}
                    >
                      +
                    </button>
                    <p className="w-28 text-right font-semibold text-slate-900">{formatCurrency(item.subtotal)}</p>
                    <button
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-1 text-sm text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                      disabled={mutating}
                      onClick={async () => {
                        setMessage(null);
                        setUpdatingItemId(item.id);
                        try {
                          await removeItem(item.id);
                        } catch (err) {
                          setMessage((err as Error).message);
                        } finally {
                          setUpdatingItemId(null);
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                  {updatingItemId === item.id ? <p className="text-xs text-slate-500 sm:col-span-2">Updating item...</p> : null}
                </div>
              ))}
            </div>
          </article>

          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6 xl:sticky xl:top-24">
            <h2 className="text-xl font-semibold text-slate-900">Order summary</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping ? formatCurrency(shipping) : "Free"}</span>
              </div>
              <div className="border-t border-slate-200 pt-2 text-base font-semibold text-slate-900">
                <div className="flex items-center justify-between">
                  <span>Total</span>
                  <span>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs text-emerald-800">
              {shipping ? (
                <>Add {formatCurrency(FREE_SHIPPING_THRESHOLD - subtotal)} more to unlock free shipping.</>
              ) : (
                <>You qualify for free shipping.</>
              )}
            </div>

            {canCheckout ? (
              <button
                onClick={async () => {
                  try {
                    setMessage(null);
                    const { sessionId } = await checkout();
                    setMessage("Checkout session created. Redirecting to payment...");
                    router.push(`/checkout/payment?sessionId=${sessionId}`);
                  } catch (err) {
                    setMessage((err as Error).message);
                  }
                }}
                disabled={mutating}
                className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {mutating ? "Starting checkout..." : "Proceed to secure checkout"}
              </button>
            ) : (
              <Link href="/login" className="mt-4 inline-flex w-full justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">
                Login to checkout
              </Link>
            )}

            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
              <p className="inline-flex items-center gap-1 font-medium text-slate-800"><AlertCircle className="h-4 w-4" /> Checkout note</p>
              <p className="mt-1">Checkout creates a payment session, then finalizes the order only after payment approval.</p>
            </div>
          </aside>
        </div>
      ) : null}

      {message ? (
        <p className={`rounded-xl p-3 text-sm ${message.includes("Redirecting") ? "border border-emerald-200 bg-emerald-50 text-emerald-700" : "border border-slate-200 bg-white text-slate-700"}`}>
          {message}
        </p>
      ) : null}
    </section>
  );
}
