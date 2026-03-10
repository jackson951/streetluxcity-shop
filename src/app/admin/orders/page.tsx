"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { getNextTrackingStatus, getOrderStatusLabel } from "@/lib/order-tracking";
import { Order } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Package,
  Search,
  TrendingUp,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function getCustomerLabel(order: Order) {
  return order.customerName || order.customer?.fullName || `Customer #${order.customerId ?? "N/A"}`;
}

function getCustomerEmail(order: Order) {
  return order.customerEmail || order.customer?.email || "—";
}

function statusStyle(status: string) {
  const s = status.toUpperCase();
  if (s === "DELIVERED") return { color: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 };
  if (s === "SHIPPED")   return { color: "bg-blue-100 text-blue-700",       icon: Truck };
  if (s === "CANCELLED") return { color: "bg-red-100 text-red-600",         icon: Clock3 };
  return                        { color: "bg-amber-100 text-amber-700",     icon: Clock3 };
}

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

const PER_PAGE = 10;

export default function AdminOrdersPage() {
  const { token } = useAuth();

  const [orders, setOrders]                 = useState<Order[]>([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState<string | null>(null);
  const [message, setMessage]               = useState<string | null>(null);
  const [query, setQuery]                   = useState("");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [sortBy, setSortBy]                 = useState<"newest" | "amount-desc" | "amount-asc">("newest");
  const [page, setPage]                     = useState(1);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  function notify(text: string) {
    setMessage(text);
    setTimeout(() => setMessage(null), 4000);
  }

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

  const totalRevenue   = useMemo(() => orders.reduce((s, o) => s + (o.totalAmount || 0), 0), [orders]);
  const inProgressCount = useMemo(() => orders.filter((o) => !["DELIVERED", "CANCELLED"].includes(o.status)).length, [orders]);
  const deliveredCount  = useMemo(() => orders.filter((o) => o.status === "DELIVERED").length, [orders]);

  const statuses = useMemo(() => {
    const all = Array.from(new Set(orders.map((o) => String(o.status).toUpperCase())));
    return ["all", ...all];
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = orders.filter((o) => {
      const matchStatus = statusFilter === "all" || String(o.status).toUpperCase() === statusFilter;
      const matchQuery =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        getCustomerLabel(o).toLowerCase().includes(q) ||
        getCustomerEmail(o).toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
    if (sortBy === "amount-desc") result = [...result].sort((a, b) => b.totalAmount - a.totalAmount);
    if (sortBy === "amount-asc")  result = [...result].sort((a, b) => a.totalAmount - b.totalAmount);
    return result;
  }, [orders, query, statusFilter, sortBy]);

  const totalPages  = Math.max(1, Math.ceil(filteredOrders.length / PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const pagedOrders = filteredOrders.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  async function advanceStage(order: Order) {
    if (!token) return;
    const next = getNextTrackingStatus(order.status);
    if (!next) return;
    setUpdatingOrderId(order.id);
    setError(null);
    try {
      const updated = await api.adminUpdateOrderStatus(token, order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: updated.status } : o)));
      notify(`Order ${order.orderNumber} moved to ${getOrderStatusLabel(updated.status)}.`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <RequireAdmin>
      <div className="space-y-6">

        {/* Page header */}
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500">Manage and advance every order placed in your store.</p>
        </div>

        {/* Stat cards */}
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-slate-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Orders</p>
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{orders.length}</p>
            <p className="mt-1 text-xs text-slate-400">{deliveredCount} delivered</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-rose-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Total Revenue</p>
            </div>
            <p className="text-3xl font-extrabold text-rose-500">{formatCurrency(totalRevenue)}</p>
            <p className="mt-1 text-xs text-slate-400">across all orders</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Clock3 className="h-4 w-4 text-amber-400" />
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">In Progress</p>
            </div>
            <p className="text-3xl font-extrabold text-amber-500">{inProgressCount}</p>
            <p className="mt-1 text-xs text-slate-400">need attention</p>
          </div>
        </div>

        {/* Notifications */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}
        {message && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {message}
          </div>
        )}

        {/* Filters */}
        {!loading && !error && (
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                className={inputClass + " pl-10"}
                placeholder="Search by order number, customer or email…"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className={inputClass + " sm:w-48"}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s === "all" ? "All statuses" : getOrderStatusLabel(s) || s}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className={inputClass + " sm:w-48"}
            >
              <option value="newest">Newest first</option>
              <option value="amount-desc">Highest value</option>
              <option value="amount-asc">Lowest value</option>
            </select>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            Loading orders…
          </div>
        )}

        {/* Orders table */}
        {!loading && !error && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            {/* Table header */}
            <div className="hidden border-b border-slate-100 bg-slate-50 px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 sm:grid sm:grid-cols-[1.5fr_1.5fr_80px_100px_auto]">
              <span>Order</span>
              <span>Customer</span>
              <span>Items</span>
              <span>Total</span>
              <span>Actions</span>
            </div>

            {pagedOrders.length === 0 && (
              <div className="p-10 text-center">
                <Package className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No orders match your filters</p>
              </div>
            )}

            <ul className="divide-y divide-slate-100">
              {pagedOrders.map((order) => {
                const { color, icon: StatusIcon } = statusStyle(order.status);
                const next = getNextTrackingStatus(order.status);
                const isUpdating = updatingOrderId === order.id;

                return (
                  <li key={order.id} className="px-5 py-4">
                    {/* Mobile layout */}
                    <div className="flex flex-wrap items-start justify-between gap-3 sm:hidden">
                      <div>
                        <p className="font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                        <p className="mt-1 text-sm text-slate-700">{getCustomerLabel(order)}</p>
                        <p className="text-xs text-slate-400">{getCustomerEmail(order)}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {getOrderStatusLabel(order.status)}
                        </span>
                        <p className="mt-2 text-base font-extrabold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden sm:grid sm:grid-cols-[1.5fr_1.5fr_80px_100px_auto] sm:items-center sm:gap-4">
                      <div>
                        <p className="font-bold text-slate-900">{order.orderNumber}</p>
                        <p className="text-xs text-slate-400">{formatDate(order.createdAt)}</p>
                        <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${color}`}>
                          <StatusIcon className="h-3 w-3" />
                          {getOrderStatusLabel(order.status)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800 truncate">{getCustomerLabel(order)}</p>
                        <p className="text-xs text-slate-400 truncate">{getCustomerEmail(order)}</p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">{order.items?.length ?? 0}</p>
                      <p className="text-sm font-extrabold text-rose-500">{formatCurrency(order.totalAmount)}</p>
                    </div>

                    {/* Action row */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/orders?id=${order.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
                      >
                        View order <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      {next && (
                        <button
                          onClick={() => advanceStage(order)}
                          disabled={isUpdating}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-rose-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-600 transition-colors disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          {isUpdating ? (
                            <>
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                              Updating…
                            </>
                          ) : (
                            <>
                              Move to {getOrderStatusLabel(next)}
                              <ArrowRight className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-slate-600">
            <p>
              Showing <span className="font-bold text-slate-900">{pagedOrders.length}</span> of{" "}
              <span className="font-bold text-slate-900">{filteredOrders.length}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </RequireAdmin>
  );
}