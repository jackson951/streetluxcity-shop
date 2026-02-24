"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { getProductImage } from "@/lib/utils";
import { FormEvent, useCallback, useEffect, useState } from "react";

export default function AdminProductsPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "0",
    stockQuantity: "0",
    categoryId: "",
    imageUrls: "",
    active: true
  });

  const load = useCallback(async () => {
    const [cats, prods] = await Promise.all([api.listCategories(), api.listProducts()]);
    setCategories(cats);
    setProducts(prods);
    if (!form.categoryId && cats.length > 0) setForm((f) => ({ ...f, categoryId: String(cats[0].id) }));
  }, [form.categoryId]);

  useEffect(() => {
    load().catch((err) => setMessage((err as Error).message));
  }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!form.name.trim()) {
      setMessage("Product name is required.");
      return;
    }

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      stockQuantity: Number(form.stockQuantity),
      categoryId: Number(form.categoryId),
      imageUrls: form.imageUrls
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
      active: form.active
    };

    try {
      await api.createProduct(token, payload);
      setMessage("Product created.");
      setForm({
        name: "",
        description: "",
        price: "0",
        stockQuantity: "0",
        categoryId: form.categoryId,
        imageUrls: "",
        active: true
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function onDelete(product: Product) {
    if (!token) return;
    const confirmed = window.confirm(`Delete product "${product.name}"?`);
    if (!confirmed) return;

    setMessage(null);
    setDeletingId(product.id);
    try {
      await api.deleteProduct(token, product.id);
      setMessage("Product deleted.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Create Product</h1>
          <div className="mt-4 grid gap-3">
            <input className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <textarea className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <input className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Price" type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              <input className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Stock" type="number" min={0} value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: e.target.value })} />
            </div>
            <select className="rounded-xl border border-slate-300 px-4 py-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <textarea className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Image URLs (comma separated)" value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} />
            <label className="inline-flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
              Active product
            </label>
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Save product</button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Catalog</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {products.map((p) => (
              <article key={p.id} className="rounded-xl border border-slate-200 p-3">
                <img src={getProductImage(p.imageUrls)} alt={p.name} className="h-28 w-full rounded-lg object-cover" />
                <p className="mt-2 line-clamp-1 font-medium">{p.name}</p>
                <p className="text-xs text-slate-500">{p.category.name}</p>
                <button
                  onClick={() => onDelete(p)}
                  disabled={deletingId === p.id}
                  className="mt-3 rounded-md border border-red-200 bg-white px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === p.id ? "Deleting..." : "Delete"}
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </RequireAdmin>
  );
}
