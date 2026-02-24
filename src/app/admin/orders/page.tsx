"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

function getCustomerLabel(order: Order) {
  return order.customerName || order.customer?.fullName || `Customer #${order.customerId ?? "N/A"}`;
}

function getCustomerEmail(order: Order) {
  return order.customerEmail || order.customer?.email || "No email";
}

export default function AdminOrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    api
      .adminListOrders(token)
      .then(setOrders)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [token]);

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0), [orders]);
  const pendingCount = useMemo(
    () => orders.filter((order) => String(order.status).toUpperCase().includes("PENDING")).length,
    [orders]
  );

  return (
    <RequireAdmin>
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold">All Orders</h1>

        <div className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Total Orders</p>
            <p className="mt-1 text-2xl font-bold text-slate-900">{orders.length}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Gross Revenue</p>
            <p className="mt-1 text-2xl font-bold text-brand-700">{formatCurrency(totalRevenue)}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Pending Orders</p>
            <p className="mt-1 text-2xl font-bold text-amber-600">{pendingCount}</p>
          </article>
        </div>

        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading orders...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && !orders.length ? <p className="rounded-xl bg-white p-4 text-sm">No orders found.</p> : null}

        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{order.orderNumber}</p>
                  <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase text-slate-700">
                  {order.status}
                </span>
              </div>

              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Customer</p>
                  <p className="text-sm font-medium text-slate-800">{getCustomerLabel(order)}</p>
                  <p className="text-xs text-slate-500">{getCustomerEmail(order)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Items</p>
                  <p className="text-sm font-medium text-slate-800">{order.items?.length ?? 0}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Total</p>
                  <p className="text-sm font-semibold text-brand-700">{formatCurrency(order.totalAmount)}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </RequireAdmin>
  );
}
