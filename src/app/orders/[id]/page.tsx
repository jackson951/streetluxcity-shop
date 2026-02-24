"use client";

import { RequireAuth } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
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

  const orderId = Number(params.id);
  const order = useMemo(() => orders.find((entry) => entry.id === orderId), [orders, orderId]);

  return (
    <RequireAuth>
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-3xl font-semibold">Order Details</h1>
          <Link href="/orders" className="text-sm font-medium text-brand-700 hover:text-brand-800">
            Back to orders
          </Link>
        </div>
        {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading order...</p> : null}
        {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
        {!loading && !error && !order ? <p className="rounded-xl bg-white p-4 text-sm">Order not found.</p> : null}

        {order ? (
          <article className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Order Number</p>
                <p className="text-lg font-semibold">{order.orderNumber}</p>
              </div>
              <div className="text-right">
                <p className="text-sm uppercase text-slate-500">{order.status}</p>
                <p className="text-sm text-slate-500">{formatDate(order.createdAt)}</p>
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm text-slate-600">Total</p>
              <p className="text-2xl font-bold text-brand-700">{formatCurrency(order.totalAmount)}</p>
            </div>
            <ul className="space-y-3">
              {(order.items || []).map((item) => (
                <li key={item.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                  <div>
                    <p className="font-medium">{item.productName}</p>
                    <p className="text-sm text-slate-500">
                      Qty {item.quantity} x {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
                </li>
              ))}
            </ul>
          </article>
        ) : null}
      </section>
    </RequireAuth>
  );
}
