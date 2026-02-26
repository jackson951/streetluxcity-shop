"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CartPage() {
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const { cart, isGuestCart, loading, mutating, updateItem, removeItem, checkout } = useCart();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const canCheckout = Boolean(user && canUseCustomerFeatures && !isGuestCart);

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-semibold">Your Cart</h1>
      {!user ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
          You are shopping as guest. You can add and edit items now, then login to checkout.
        </p>
      ) : null}
      {user && !canUseCustomerFeatures ? (
        <p className="rounded-xl bg-white p-4 text-sm">
          {hasAdminRole && viewMode === "ADMIN"
            ? "Switch to Customer View from the header to use cart and checkout."
            : "Only customer accounts can use the cart and checkout flow."}
        </p>
      ) : null}
        {loading && <p>Loading cart...</p>}
        {!cart?.items.length && !loading && <p className="rounded-xl bg-white p-4">Your cart is empty.</p>}

        <div className="space-y-3">
          {cart?.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-sm text-slate-500">{formatCurrency(item.unitPrice)}</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={1}
                  value={item.quantity}
                  onChange={async (e) => {
                    const q = Number(e.target.value);
                    if (!Number.isFinite(q) || q < 1) return;
                    setMessage(null);
                    setUpdatingItemId(item.id);
                    try {
                      await updateItem(item.id, q);
                    } catch (err) {
                      setMessage((err as Error).message);
                    } finally {
                      setUpdatingItemId(null);
                    }
                  }}
                  className="w-20 rounded border border-slate-300 px-2 py-1"
                  disabled={mutating}
                />
                <p className="w-24 text-right font-semibold">{formatCurrency(item.subtotal)}</p>
                <button
                  className="rounded bg-slate-100 px-2 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-60"
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
              {updatingItemId === item.id ? <p className="text-xs text-slate-500">Updating item...</p> : null}
            </div>
          ))}
        </div>

        {cart?.items.length ? (
          <div className="flex items-center justify-between rounded-xl bg-white p-4">
            <p className="text-lg font-semibold">Total: {formatCurrency(cart.totalAmount)}</p>
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
                className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {mutating ? "Processing..." : "Checkout"}
              </button>
            ) : (
              <Link href="/login" className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">
                Login to Checkout
              </Link>
            )}
          </div>
        ) : null}

        {message && <p className="text-sm text-slate-600">{message}</p>}
        {message?.includes("session created") ? (
          <Link href="/checkout/payment" className="inline-flex text-sm font-medium text-brand-700 hover:text-brand-800">
            Open payment screen
          </Link>
        ) : null}
    </section>
  );
}
