"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function OrdersPage() {
  const { user, token, isAdmin } = useAuth();
  const customerId = user?.customerId;
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    if (!isAdmin && !customerId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const loadOrders = async () => {
      try {
        const data = isAdmin ? await api.adminListOrders(token) : await api.listOrders(token, customerId as number);
        setOrders(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [token, customerId, isAdmin]);

  return (
    <RequireAuth>
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold">{isAdmin ? "All Orders" : "My Orders"}</h1>
        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading orders...</p> : null}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && !error && !orders.length ? <p className="rounded-xl bg-white p-4">No orders found.</p> : null}
        <div className="space-y-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold">{order.orderNumber}</p>
                <p className="text-sm uppercase text-slate-500">{order.status}</p>
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
              <Link href={`/orders/${order.id}`} className="mt-3 inline-flex text-sm font-medium text-brand-700 hover:text-brand-800">
                View order details
              </Link>
            </article>
          ))}
        </div>
      </section>
    </RequireAuth>
  );
}
