"use client";

import { PaymentMethodForm } from "@/components/payment-method-form";
import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order, PaymentMethod, PaymentTransaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export function CheckoutPaymentClient() {
  const searchParams = useSearchParams();
  const { user, token } = useAuth();
  const customerId = user?.customerId;
  const orderId = Number(searchParams.get("orderId") || "");

  const [order, setOrder] = useState<Order | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<number | null>(null);
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingMethod, setSavingMethod] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const defaultMethod = useMemo(
    () => paymentMethods.find((method) => method.defaultMethod && method.enabled) || paymentMethods.find((method) => method.enabled),
    [paymentMethods]
  );

  const loadData = useCallback(async () => {
    if (!token || !customerId || !Number.isFinite(orderId)) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [orderData, methodsData, paymentsData] = await Promise.all([
        api.getOrder(token, orderId),
        api.listPaymentMethods(token, customerId),
        api.listOrderPayments(token, orderId)
      ]);
      setOrder(orderData);
      setPaymentMethods(methodsData);
      setPayments(paymentsData);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, customerId, orderId]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  useEffect(() => {
    if (!selectedMethodId && defaultMethod) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [defaultMethod, selectedMethodId]);

  const isPaid = order?.status === "PAID";

  return (
    <RequireAuth>
      <section className="space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <h1 className="text-3xl font-semibold">Checkout Payment</h1>
          <p className="mt-1 text-sm text-slate-600">
            Flow: Cart checkout creates order, then payment authorizes the order. Declines are safe to retry with another method.
          </p>
        </div>

        {!customerId ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">Only customer accounts can process checkout payments.</p>
        ) : null}
        {!Number.isFinite(orderId) ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Missing order ID. Open checkout from the cart page.</p>
        ) : null}

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading payment details...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

        {order ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Order summary</h2>
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">{order.orderNumber}</p>
                <p className="text-2xl font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                <p className="text-xs text-slate-500">{formatDate(order.createdAt)}</p>
                <p className="mt-2 text-xs uppercase tracking-wide text-slate-600">Status: {order.status}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Link href={`/orders/${order.id}`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  View order details
                </Link>
                <Link href="/orders" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  Back to orders
                </Link>
              </div>
            </article>

            <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="text-xl font-semibold">Pay now</h2>

              <div className="space-y-2">
                {paymentMethods.length ? null : <p className="text-sm text-slate-600">No payment methods yet. Add one below.</p>}
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center justify-between rounded-xl border px-3 py-2 ${
                      method.enabled ? "border-slate-200" : "border-amber-300 bg-amber-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {method.brand} •••• {method.last4} {method.defaultMethod ? "(Default)" : ""}
                      </p>
                      <p className="text-xs text-slate-500">
                        exp {String(method.expiryMonth).padStart(2, "0")}/{method.expiryYear}
                      </p>
                    </div>
                    <input
                      type="radio"
                      name="payment-method"
                      checked={selectedMethodId === method.id}
                      onChange={() => setSelectedMethodId(method.id)}
                      disabled={!method.enabled || isPaid}
                    />
                  </label>
                ))}
              </div>

              <label className="space-y-1 text-sm">
                <span className="text-slate-600">CVV</span>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 outline-none ring-brand-500 focus:ring"
                  placeholder="123"
                  disabled={isPaid}
                />
              </label>

              <button
                disabled={processing || isPaid}
                className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={async () => {
                  if (!token || !selectedMethodId) {
                    setError("Choose a payment method first.");
                    return;
                  }
                  setProcessing(true);
                  setError(null);
                  setMessage(null);
                  try {
                    const result = await api.processOrderPayment(token, order.id, selectedMethodId, cvv);
                    setPayments(await api.listOrderPayments(token, order.id));
                    setOrder(await api.getOrder(token, order.id));
                    if (result.status === "APPROVED") {
                      setMessage("Payment approved. Your order is now paid.");
                    } else {
                      setError(result.gatewayMessage || "Payment declined.");
                    }
                  } catch (processError) {
                    setError((processError as Error).message);
                  } finally {
                    setProcessing(false);
                  }
                }}
              >
                {processing ? "Processing..." : isPaid ? "Order already paid" : `Pay ${formatCurrency(order.totalAmount)}`}
              </button>

              <div className="rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-800">Payment flow notes</p>
                <p className="mt-1">Approved payment sets order status to PAID. Declined attempts are logged with reason and can be retried.</p>
              </div>

              <details className="rounded-xl border border-slate-200 p-3">
                <summary className="cursor-pointer text-sm font-medium">Recent payment attempts</summary>
                <div className="mt-3 space-y-2 text-sm">
                  {payments.length ? null : <p className="text-slate-500">No attempts yet.</p>}
                  {payments.map((payment) => (
                    <div key={payment.id} className="rounded-lg border border-slate-200 px-3 py-2">
                      <p className={`font-medium ${payment.status === "APPROVED" ? "text-emerald-700" : "text-red-700"}`}>
                        {payment.status}
                      </p>
                      <p className="text-xs text-slate-500">
                        {payment.gatewayResponseCode || "N/A"} | {payment.gatewayMessage || "No gateway message"}
                      </p>
                      <p className="text-xs text-slate-500">{formatDate(payment.processedAt)}</p>
                    </div>
                  ))}
                </div>
              </details>

              {!isPaid ? (
                <details className="rounded-xl border border-slate-200 p-3">
                  <summary className="cursor-pointer text-sm font-medium">Add a new card</summary>
                  <div className="mt-3">
                    <PaymentMethodForm
                      submitting={savingMethod}
                      buttonLabel="Save and use this card"
                      onSubmit={async (payload) => {
                        if (!token || !customerId) return;
                        setSavingMethod(true);
                        setError(null);
                        setMessage(null);
                        try {
                          const method = await api.createPaymentMethod(token, customerId, payload);
                          const updatedMethods = await api.listPaymentMethods(token, customerId);
                          setPaymentMethods(updatedMethods);
                          setSelectedMethodId(method.id);
                          setMessage("Payment method added. You can pay now.");
                        } finally {
                          setSavingMethod(false);
                        }
                      }}
                    />
                  </div>
                </details>
              ) : null}
            </article>
          </div>
        ) : null}
      </section>
    </RequireAuth>
  );
}
