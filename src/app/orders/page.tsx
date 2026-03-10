"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { getOrderStatusLabel } from "@/lib/order-tracking";
import { Order, OrderTracking, PaymentTransaction } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  CreditCard,
  Package,
  PackageSearch,
  ShoppingBasket,
  Truck,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusStyle(status: string) {
  switch (status) {
    case "DELIVERED": return { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
    case "SHIPPED":   return { color: "bg-blue-100 text-blue-700",       icon: Truck };
    case "CANCELLED": return { color: "bg-red-100 text-red-700",         icon: Clock3 };
    default:          return { color: "bg-amber-100 text-amber-700",     icon: Clock3 };
  }
}

// ─── Tracking timeline ────────────────────────────────────────────────────────

function TrackingTimeline({ tracking }: { tracking: OrderTracking }) {
  return (
    <div className="space-y-0">
      {tracking.stages.map((stage, i) => {
        const isLast = i === tracking.stages.length - 1;
        return (
          <div key={stage.status} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                  stage.completed || stage.current
                    ? stage.current
                      ? "border-rose-500 bg-rose-500 text-white"
                      : "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-200 bg-white text-slate-400"
                }`}
              >
                {stage.completed && !stage.current ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  stage.step
                )}
              </div>
              {!isLast && (
                <div
                  className={`w-0.5 flex-1 my-1 ${stage.completed ? "bg-emerald-300" : "bg-slate-200"}`}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>
            <div className={`pb-6 ${isLast ? "pb-0" : ""}`}>
              <p className={`text-sm font-bold ${stage.current ? "text-rose-600" : stage.completed ? "text-slate-900" : "text-slate-400"}`}>
                {stage.label}
              </p>
              {stage.current && (
                <span className="mt-1 inline-block rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-600">
                  Current stage
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment row ──────────────────────────────────────────────────────────────

function PaymentRow({ payment }: { payment: PaymentTransaction }) {
  const approved = payment.status === "APPROVED";
  return (
    <div className={`rounded-xl border px-4 py-3 ${approved ? "border-emerald-200 bg-emerald-50" : "border-red-100 bg-red-50"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <CreditCard className={`h-4 w-4 ${approved ? "text-emerald-600" : "text-red-500"}`} />
          <span className={`text-sm font-bold ${approved ? "text-emerald-700" : "text-red-700"}`}>
            {approved ? "Payment successful" : "Payment declined"}
          </span>
        </div>
        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${approved ? "bg-emerald-200 text-emerald-800" : "bg-red-200 text-red-800"}`}>
          {payment.status}
        </span>
      </div>
      {payment.gatewayMessage && (
        <p className="mt-1 text-xs text-slate-500">{payment.gatewayMessage}</p>
      )}
      <p className="mt-1 text-xs text-slate-400">{formatDate(payment.processedAt)}</p>
    </div>
  );
}

// ─── Order card ───────────────────────────────────────────────────────────────

function OrderCard({ order }: { order: Order }) {
  const { color, icon: Icon } = statusStyle(order.status);
  const label = getOrderStatusLabel(order.status);
  const itemCount = order.items?.reduce((s, i) => s + i.quantity, 0) || 0;
  const preview = (order.items || []).slice(0, 2);
  const remaining = (order.items?.length || 0) - preview.length;

  return (
    <article className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Top row */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Order</p>
          <p className="font-extrabold text-slate-900 tracking-tight">{order.orderNumber}</p>
          <p className="mt-0.5 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${color}`}>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </span>
          {order.isDelivery && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
              <Truck className="h-3 w-3 text-rose-500" /> Delivery
            </span>
          )}
        </div>
      </div>

      <div className="my-4 h-px bg-slate-100" />

      {/* Items preview */}
      <ul className="space-y-2">
        {preview.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-slate-700 truncate max-w-[60%]">
              {item.productName}
              <span className="ml-1.5 text-slate-400">× {item.quantity}</span>
            </span>
            <span className="font-semibold text-slate-900 shrink-0">{formatCurrency(item.subtotal)}</span>
          </li>
        ))}
        {remaining > 0 && (
          <li className="text-xs text-slate-400">+{remaining} more {remaining === 1 ? "item" : "items"}</li>
        )}
      </ul>

      {/* Footer */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">{itemCount} {itemCount === 1 ? "item" : "items"} · Total</p>
          <p className="text-lg font-extrabold text-rose-500">{formatCurrency(order.totalAmount)}</p>
        </div>
        <Link
          href={`/orders?id=${order.id}`}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
        >
          View details <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OrdersPage() {
  const { token, isAdmin, effectiveCustomerId } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [orders, setOrders]     = useState<Order[]>([]);
  const [order, setOrder]       = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading]           = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError]               = useState<string | null>(null);

  // Load orders list
  useEffect(() => {
    if (!token) { setLoading(false); return; }
    if (!isAdmin && !effectiveCustomerId) { setOrders([]); setLoading(false); return; }

    setLoading(true);
    setError(null);

    const load = async () => {
      try {
        const data = isAdmin
          ? await api.adminListOrders(token)
          : await api.listOrders(token, effectiveCustomerId as string);
        setOrders(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token, effectiveCustomerId, isAdmin]);

  // Load order detail when orderId changes
  useEffect(() => {
    if (!orderId || !token) {
      setOrder(null);
      setTracking(null);
      setPayments([]);
      return;
    }

    setDetailLoading(true);
    setError(null);

    const loadDetail = async () => {
      try {
        const [orderData, trackingData, paymentData] = await Promise.all([
          api.getOrder(token, orderId),
          api.getOrderTracking(token, orderId),
          api.listOrderPayments(token, orderId),
        ]);
        setOrder(orderData);
        setTracking(trackingData);
        setPayments(paymentData);
      } catch (err) {
        setError((err as Error).message);
        setOrder(null);
        setTracking(null);
        setPayments([]);
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [orderId, token]);

  const hasApprovedPayment = payments.some((p) => p.status === "APPROVED");
  const { color, icon: StatusIcon } = order
    ? statusStyle(order.status)
    : { color: "", icon: Clock3 };

  const canCancelOrder = order && (
    order.status === "ORDER_RECEIVED" ||
    order.status === "PROCESSING_PACKING"
  );

  const handleCancelOrder = async () => {
    if (!order || !canCancelOrder) return;
    if (!window.confirm("Are you sure you want to cancel this order? This action cannot be undone.")) return;
    try {
      await api.cancelOrder(token!, order.id);
      const [orderData, trackingData, paymentData] = await Promise.all([
        api.getOrder(token!, orderId!),
        api.getOrderTracking(token!, orderId!),
        api.listOrderPayments(token!, orderId!),
      ]);
      setOrder(orderData);
      setTracking(trackingData);
      setPayments(paymentData);
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <RequireAuth>
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">

        {orderId ? (
          /* ════════════════════════════════════════
             ORDER DETAIL VIEW
          ════════════════════════════════════════ */
          <>
            {/* Detail loading */}
            {detailLoading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                Loading order details…
              </div>
            )}

            {/* Detail error */}
            {!detailLoading && error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Something went wrong loading this order. Please try again.
              </div>
            )}

            {/* Not found */}
            {!detailLoading && !error && !order && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <Package className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">Order not found</h2>
                <p className="mt-1 text-sm text-slate-500">This order may have been removed or doesn't exist.</p>
                <Link
                  href="/orders"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white hover:bg-rose-600 transition-colors"
                >
                  Back to My Orders
                </Link>
              </div>
            )}

            {/* Detail content */}
            {!detailLoading && !error && order && (
              <div className="space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                  <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
                    <ShoppingBasket className="h-4 w-4 text-white" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Order Details</h1>
                    <p className="text-sm text-slate-500">Everything about your order in one place.</p>
                  </div>
                  <Link
                    href={isAdmin ? "/admin/orders" : "/orders"}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="h-4 w-4" /> {isAdmin ? "Orders" : "My Orders"}
                  </Link>
                </div>

                {/* Order summary */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">Order number</p>
                      <p className="text-xl font-extrabold tracking-tight text-slate-900">{order.orderNumber}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold ${color}`}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {getOrderStatusLabel(order.status, { paymentApproved: hasApprovedPayment })}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between rounded-xl bg-slate-50 px-5 py-4">
                    <div>
                      <p className="text-xs text-slate-400">Order total</p>
                      <p className="text-2xl font-extrabold text-rose-500">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    {hasApprovedPayment && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Paid
                      </span>
                    )}
                  </div>

                  {order.isDelivery && (
                    <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-rose-500" />
                        <span className="text-xs font-semibold text-slate-600">Delivery Information</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-xs text-slate-400">Delivery Fee</span>
                          <p className="font-semibold text-slate-900">{formatCurrency(order.deliveryFee || 0)}</p>
                        </div>
                        <div>
                          <span className="text-xs text-slate-400">Shipping Address</span>
                          <p className="font-semibold text-slate-900">{order.shippingAddress || "Not provided"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Tracking */}
                {tracking && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-5 w-5 text-rose-500" />
                        <h2 className="font-bold text-slate-900">Delivery progress</h2>
                      </div>
                      {tracking.isDelivery && (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                          <Truck className="h-3 w-3 text-rose-500" /> Delivery Order
                        </span>
                      )}
                    </div>
                    {tracking.isDelivery && tracking.shippingAddress && (
                      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                        <p className="text-xs text-slate-400 mb-1">Shipping to</p>
                        <p className="text-sm font-semibold text-slate-900">{tracking.shippingAddress}</p>
                      </div>
                    )}
                    <TrackingTimeline tracking={tracking} />
                  </div>
                )}

                {/* Items */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-rose-500" />
                    <h2 className="font-bold text-slate-900">Items ordered</h2>
                  </div>
                  <ul className="space-y-3">
                    {(order.items || []).map((item) => (
                      <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.productName}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{item.quantity} × {formatCurrency(item.unitPrice)}</p>
                        </div>
                        <span className="shrink-0 font-bold text-slate-900">{formatCurrency(item.subtotal)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-sm font-semibold text-slate-600">
                      {(order.items || []).reduce((s, i) => s + i.quantity, 0)} items
                    </span>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Total</p>
                      <p className="text-lg font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                    </div>
                  </div>
                </div>

                {/* Payment */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-rose-500" />
                      <h2 className="font-bold text-slate-900">Payment</h2>
                    </div>
                    {canCancelOrder && (
                      <button
                        onClick={handleCancelOrder}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-100 transition-colors"
                      >
                        <XCircle className="h-4 w-4" /> Cancel Order
                      </button>
                    )}
                  </div>
                  {payments.length === 0 ? (
                    <p className="text-sm text-slate-400">No payment records found for this order.</p>
                  ) : (
                    <div className="space-y-3">
                      {payments.map((payment) => (
                        <PaymentRow key={payment.id} payment={payment} />
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}
          </>
        ) : (
          /* ════════════════════════════════════════
             ORDERS LIST VIEW
          ════════════════════════════════════════ */
          <>
            {/* Header */}
            <div className="mb-8 flex items-center gap-3">
              <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/25">
                <ShoppingBasket className="h-4 w-4 text-white" />
              </Link>
              <div>
                <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
                  {isAdmin ? "All Orders" : "My Orders"}
                </h1>
                <p className="text-sm text-slate-500">
                  {isAdmin ? "All customer purchases across the store." : "Track your purchases and deliveries."}
                </p>
              </div>
            </div>

            {/* Summary pills */}
            {!loading && !error && orders.length > 0 && (
              <div className="mb-6 flex flex-wrap gap-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
                  <Package className="h-4 w-4 text-rose-500" />
                  {orders.length} {orders.length === 1 ? "order" : "orders"} total
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {orders.filter(o => o.status === "DELIVERED").length} delivered
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700">
                  <Clock3 className="h-4 w-4" />
                  {orders.filter(o => o.status !== "DELIVERED" && o.status !== "CANCELLED").length} in progress
                </div>
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
                Loading your orders…
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                Something went wrong loading your orders. Please try refreshing the page.
              </div>
            )}

            {/* Empty */}
            {!loading && !error && orders.length === 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
                  <PackageSearch className="h-8 w-8 text-slate-400" />
                </div>
                <h2 className="text-lg font-bold text-slate-900">No orders yet</h2>
                <p className="mt-1 text-sm text-slate-500">When you place an order, it'll show up here.</p>
                <Link
                  href="/products"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors"
                >
                  Start Shopping <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Orders list */}
            {!loading && !error && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map((o) => (
                  <OrderCard key={o.id} order={o} />
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </RequireAuth>
  );
}