"use client";

import { RequireAdmin } from "@/components/route-guards";
import Link from "next/link";

export default function AdminPage() {
  return (
    <RequireAdmin>
      <section className="space-y-6">
        <h1 className="text-3xl font-semibold">Admin Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link href="/admin/categories" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm">
            <h2 className="text-xl font-semibold">Manage Categories</h2>
            <p className="mt-2 text-sm text-slate-600">Create and organize product categories.</p>
          </Link>
          <Link href="/admin/products" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm">
            <h2 className="text-xl font-semibold">Manage Products</h2>
            <p className="mt-2 text-sm text-slate-600">Add products with multiple images and pricing.</p>
          </Link>
          <Link href="/admin/orders" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm">
            <h2 className="text-xl font-semibold">All Orders</h2>
            <p className="mt-2 text-sm text-slate-600">View orders across all customers and monitor totals.</p>
          </Link>
          <Link href="/admin/users" className="rounded-2xl border border-slate-200 bg-white p-6 hover:shadow-sm">
            <h2 className="text-xl font-semibold">Manage Users</h2>
            <p className="mt-2 text-sm text-slate-600">Enable or disable user access in real time.</p>
          </Link>
        </div>
      </section>
    </RequireAdmin>
  );
}
