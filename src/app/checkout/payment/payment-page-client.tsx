"use client";

import { PaymentMethodForm } from "@/components/payment-method-form";
import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { CheckoutSession, PaymentMethod } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

function getSessionStatusLabel(status?: string) {
  switch (status) {
    case "INITIATED":
      return "Awaiting Payment";
    case "PAYMENT_PENDING":
      return "Payment Pending";
    case "APPROVED":
      return "Approved - Ready to Finalize";
    case "FAILED":
      return "Payment Failed";
    case "EXPIRED":
      return "Session Expired";
    case "CONSUMED":
      return "Order Created";
    default:
      return status || "Unknown";
  }
}

export function CheckoutPaymentClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, effectiveCustomerId, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const sessionId = searchParams.get("sessionId") || "";

  const [session, setSession] = useState<CheckoutSession | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);
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
    if (!token || !effectiveCustomerId || !sessionId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [sessionData, methodsData] = await Promise.all([
        api.getCheckoutSession(token, sessionId),
        api.listPaymentMethods(token, effectiveCustomerId)
      ]);
      setSession(sessionData);
      setPaymentMethods(methodsData);
    } catch (loadError) {
      setError((loadError as Error).message);
    } finally {
      setLoading(false);
    }
  }, [token, effectiveCustomerId, sessionId]);

  useEffect(() => {
    loadData().catch(() => undefined);
  }, [loadData]);

  useEffect(() => {
    if (!selectedMethodId && defaultMethod) {
      setSelectedMethodId(defaultMethod.id);
    }
  }, [defaultMethod, selectedMethodId]);

  const canPaySession = session?.status === "INITIATED" || session?.status === "PAYMENT_PENDING" || session?.status === "FAILED";
  const cvvValid = /^\d{3,4}$/.test(cvv.trim());

  return (
    <RequireAuth>
      <section className="space-y-6">
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold text-slate-900">Checkout Payment</h1>
          <p className="mt-1 text-sm text-slate-600">
            Flow: cart checkout creates an order, then payment authorizes it. Declines are safe to retry with another method.
          </p>
        </div>

        {!canUseCustomerFeatures ? (
          <p className="rounded-xl bg-amber-50 p-4 text-sm text-amber-800">
            {hasAdminRole && viewMode === "ADMIN"
              ? "Switch to Customer View from the header to process checkout payments."
              : "Only customer accounts can process checkout payments."}
          </p>
        ) : null}
        {!sessionId ? (
          <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">Missing checkout session ID. Start checkout from the cart page.</p>
        ) : null}

        {loading ? (
          <p className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 text-sm text-slate-600">Loading payment details...</p>
        ) : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {message ? <p className="rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700">{message}</p> : null}

        {session ? (
          <div className="grid gap-6 lg:grid-cols-2">
            <article className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900">Checkout summary</h2>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-sm text-slate-500">Session #{session.id.slice(0, 8)}</p>
                <p className="text-2xl font-bold text-brand-700">{formatCurrency(session.totalAmount)}</p>
                {session.createdAt ? <p className="text-xs text-slate-500">{formatDate(session.createdAt)}</p> : null}
                <p
                  className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    session.status === "CONSUMED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {session.status === "CONSUMED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                  {getSessionStatusLabel(session.status)}
                </p>
              </div>
              <ul className="space-y-2 text-sm">
                {session.items.map((item) => (
                  <li key={item.productId} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                    <span>
                      {item.productName} x {item.quantity}
                    </span>
                    <span className="font-medium">{formatCurrency(item.subtotal)}</span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-2">
                <Link href="/orders" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  Back to orders
                </Link>
                <Link href="/cart" className="rounded-lg border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50">
                  Back to cart
                </Link>
              </div>
            </article>

            <article className="space-y-4 rounded-3xl border border-slate-200/80 bg-white/90 p-5 shadow-sm">
              <h2 className="inline-flex items-center gap-2 text-xl font-semibold text-slate-900">
                <CreditCard className="h-5 w-5 text-brand-600" />
                Pay now
              </h2>

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
                        {method.brand} **** {method.last4} {method.defaultMethod ? "(Default)" : ""}
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
                      disabled={!method.enabled || !canPaySession}
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
                  disabled={!canPaySession}
                />
              </label>

              <button
                disabled={processing || !canPaySession || !selectedMethodId || !cvvValid}
                className="w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                onClick={async () => {
                  if (!token || !selectedMethodId) {
                    setError("Choose a payment method first.");
                    return;
                  }
                  if (!cvvValid) {
                    setError("Enter a valid CVV (3 or 4 digits).");
                    return;
                  }
                  setProcessing(true);
                  setError(null);
                  setMessage(null);
                  try {
                    const result = await api.payCheckoutSession(token, session.id, selectedMethodId, cvv);
                    if (result.status === "APPROVED") {
                      const finalized = await api.finalizeCheckoutSession(token, session.id);
                      setMessage("Payment approved. Order created. Redirecting...");
                      router.push(`/orders/${finalized.orderId}`);
                    } else {
                      setError(result.gatewayMessage || "Payment declined.");
                    }
                    setSession(await api.getCheckoutSession(token, session.id));
                  } catch (processError) {
                    setError((processError as Error).message);
                  } finally {
                    setProcessing(false);
                  }
                }}
              >
                {processing ? "Processing..." : !canPaySession ? "Payment unavailable for this session" : `Pay ${formatCurrency(session.totalAmount)}`}
              </button>
              {canPaySession && !cvvValid ? <p className="text-xs text-amber-700">Enter a valid CVV to enable payment.</p> : null}
              {!canPaySession ? <p className="text-xs text-slate-600">This checkout session can no longer be paid.</p> : null}

              <div className="rounded-2xl bg-slate-50 p-3 text-xs text-slate-600">
                <p className="font-medium text-slate-800">Payment flow notes</p>
                <p className="mt-1">Payment approval finalizes this checkout session and creates the order atomically.</p>
              </div>

              {canPaySession ? (
                <details className="rounded-xl border border-slate-200 p-3">
                  <summary className="cursor-pointer text-sm font-medium">Add a new card</summary>
                  <div className="mt-3">
                    <PaymentMethodForm
                      submitting={savingMethod}
                      buttonLabel="Save and use this card"
                      onSubmit={async (payload) => {
                        if (!token || !effectiveCustomerId) return;
                        setSavingMethod(true);
                        setError(null);
                        setMessage(null);
                        try {
                          const method = await api.createPaymentMethod(token, effectiveCustomerId, payload);
                          const updatedMethods = await api.listPaymentMethods(token, effectiveCustomerId);
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
