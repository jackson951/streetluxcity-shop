"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { getOrderStatusLabel } from "@/lib/order-tracking";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import { CheckCircle2, Clock3 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { token, isAdmin, effectiveCustomerId } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!isAdmin && !effectiveCustomerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const loadOrders = async () => {
      try {
        const data = isAdmin ? await api.adminListOrders(token) : await api.listOrders(token, effectiveCustomerId as string);
        setOrders(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, effectiveCustomerId, isAdmin]);

  return (
    <RequireAuth>
      <section className="space-y-5">
        <div className="rounded-3xl border border-slate-200/80 bg-white/85 p-6 shadow-sm backdrop-blur">
          <h1 className="text-3xl font-semibold text-slate-900">{isAdmin ? "Order Intelligence" : "My Orders"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            {isAdmin ? "Track all storefront purchases and payment status in one feed." : "Monitor your purchases and complete pending payments quickly."}
          </p>
        </div>
        {loading ? (
          <p className="rounded-2xl border border-slate-200/70 bg-white/85 p-4 text-sm text-slate-600">Loading orders...</p>
        ) : null}
        {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && !orders.length ? <p className="rounded-2xl border border-slate-200/70 bg-white/85 p-4">No orders found.</p> : null}
        <div className="grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{order.orderNumber}</p>
                <p
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    order.status === "DELIVERED" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {order.status === "DELIVERED" ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />}
                  {getOrderStatusLabel(order.status)}
                </p>
              </div>
              <p className="mt-1 text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              <p className="mt-2 font-semibold text-brand-700">{formatCurrency(order.totalAmount)}</p>
              <ul className="mt-3 space-y-1 text-sm text-slate-700">
                {(order.items || []).slice(0, 3).map((item) => (
                  <li key={item.id}>
                    {item.productName} x {item.quantity} - {formatCurrency(item.subtotal)}
                  </li>
                ))}
              </ul>
              {(order.items?.length || 0) > 3 ? <p className="mt-2 text-xs text-slate-500">+{(order.items?.length || 0) - 3} more items</p> : null}
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="inline-flex rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  View order details
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </RequireAuth>
  );
}
