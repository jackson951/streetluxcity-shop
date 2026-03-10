"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { adminProductSchema, getFirstValidationError } from "@/lib/validation";
import { formatCurrency, getProductImage } from "@/lib/utils";
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

type ProductFormState = {
  name: string;
  description: string;
  price: string;
  stockQuantity: string;
  categoryId: string;
  imageUrls: string;
  active: boolean;
};

const EMPTY_FORM = (categoryId = ""): ProductFormState => ({
  name: "",
  description: "",
  price: "0",
  stockQuantity: "0",
  categoryId,
  imageUrls: "",
  active: true,
});

const ITEMS_PER_PAGE = 8;

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100";

function validateProductForm(form: ProductFormState) {
  return adminProductSchema.safeParse({
    name: form.name,
    description: form.description,
    price: Number(form.price),
    stockQuantity: Number(form.stockQuantity),
    categoryId: form.categoryId,
    imageUrls: form.imageUrls.split(",").map((v) => v.trim()).filter(Boolean),
    active: form.active,
  });
}

function ProductForm({
  title,
  form,
  setForm,
  categories,
  onSubmit,
  submitting,
  submitLabel,
  onCancel,
  accent = false,
}: {
  title: string;
  form: ProductFormState;
  setForm: (f: ProductFormState) => void;
  categories: Category[];
  onSubmit: (e: FormEvent) => void;
  submitting: boolean;
  submitLabel: string;
  onCancel?: () => void;
  accent?: boolean;
}) {
  function update(field: keyof ProductFormState) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm({ ...form, [field]: e.target.value });
  }

  return (
    <form onSubmit={onSubmit} className={`rounded-2xl border bg-white p-6 shadow-sm ${accent ? "border-rose-200" : "border-slate-200"}`}>
      <div className="mb-5 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {accent ? <Pencil className="h-5 w-5 text-rose-500" /> : <Plus className="h-5 w-5 text-rose-500" />}
          <h2 className="font-bold text-slate-900">{title}</h2>
        </div>
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
            <X className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
      </div>

      <div className="space-y-3">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">Product name</span>
          <input className={inputClass} placeholder="e.g. Air Max Sneakers" required value={form.name} onChange={update("name")} />
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">Description <span className="font-normal text-slate-400">(optional)</span></span>
          <textarea className={inputClass + " min-h-20 resize-none"} placeholder="Short product description…" value={form.description} onChange={update("description")} />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Price (R)</span>
            <input className={inputClass} type="number" step="0.01" min={0} placeholder="0.00" value={form.price} onChange={update("price")} />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-slate-700">Stock qty</span>
            <input className={inputClass} type="number" min={0} placeholder="0" value={form.stockQuantity} onChange={update("stockQuantity")} />
          </label>
        </div>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">Category</span>
          <select className={inputClass} value={form.categoryId} onChange={update("categoryId")}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-slate-700">Image URLs <span className="font-normal text-slate-400">(comma-separated)</span></span>
          <textarea className={inputClass + " min-h-16 resize-none"} placeholder="https://…, https://…" value={form.imageUrls} onChange={update("imageUrls")} />
        </label>

        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
          <input
            type="checkbox"
            className="h-4 w-4 accent-rose-500 rounded"
            checked={form.active}
            onChange={(e) => setForm({ ...form, active: e.target.checked })}
          />
          <span className="font-medium text-slate-700">Listed in store</span>
          <span className="ml-auto text-xs text-slate-400">{form.active ? "Visible to customers" : "Hidden from customers"}</span>
        </label>

        <button
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/20 transition hover:bg-rose-600 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
        >
          {submitting ? (
            <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> Saving…</>
          ) : submitLabel}
        </button>
      </div>
    </form>
  );
}

export default function AdminProductsPage() {
  const { token } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts]     = useState<Product[]>([]);
  const [message, setMessage]       = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [updating, setUpdating]     = useState(false);
  const [editingId, setEditingId]   = useState<string | null>(null);

  const [query, setQuery]               = useState("");
  const [stockFilter, setStockFilter]   = useState<"all" | "in-stock" | "out-of-stock">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [sortBy, setSortBy]             = useState<"newest" | "price-asc" | "price-desc" | "stock-desc">("newest");
  const [page, setPage]                 = useState(1);

  const [form, setForm]         = useState<ProductFormState>(EMPTY_FORM());
  const [editForm, setEditForm] = useState<ProductFormState>(EMPTY_FORM());

  function notify(text: string, type: "success" | "error" = "success") {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 4000);
  }

  const load = useCallback(async () => {
    const [cats, prods] = await Promise.all([api.listCategories(), api.listProducts()]);
    setCategories(cats);
    setProducts(prods);
    setForm((f) => ({ ...f, categoryId: f.categoryId || String(cats[0]?.id || "") }));
  }, []);

  useEffect(() => { load().catch((err) => notify((err as Error).message, "error")); }, [load]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    const parsed = validateProductForm(form);
    if (!parsed.success) { notify(getFirstValidationError(parsed.error), "error"); return; }
    setSubmitting(true);
    try {
      await api.createProduct(token, parsed.data);
      notify("Product created successfully.");
      setForm(EMPTY_FORM(form.categoryId));
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function onUpdateProduct(e: FormEvent) {
    e.preventDefault();
    if (!token || !editingId) return;
    const parsed = validateProductForm(editForm);
    if (!parsed.success) { notify(getFirstValidationError(parsed.error), "error"); return; }
    setUpdating(true);
    try {
      await api.updateProduct(token, editingId, parsed.data);
      notify("Product updated.");
      setEditingId(null);
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setUpdating(false);
    }
  }

  async function onDelete(product: Product) {
    if (!token || !window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setDeletingId(product.id);
    try {
      await api.deleteProduct(token, product.id);
      notify("Product deleted.");
      await load();
    } catch (err) {
      notify((err as Error).message, "error");
    } finally {
      setDeletingId(null);
    }
  }

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    let result = products.filter((p) => {
      const inStock      = p.stockQuantity > 0;
      const matchStock   = stockFilter === "all" || (stockFilter === "in-stock" ? inStock : !inStock);
      const matchStatus  = statusFilter === "all" || (statusFilter === "active" ? p.active : !p.active);
      const matchQuery   = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q);
      return matchStock && matchStatus && matchQuery;
    });
    if (sortBy === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "stock-desc") result = [...result].sort((a, b) => b.stockQuantity - a.stockQuantity);
    return result;
  }, [products, query, stockFilter, statusFilter, sortBy]);

  const totalPages    = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const safePage      = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * ITEMS_PER_PAGE, safePage * ITEMS_PER_PAGE);

  return (
    <RequireAdmin>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Products</h1>
            <p className="text-sm text-slate-500">Add, edit and manage everything in your store catalog.</p>
          </div>
          <div className="flex gap-3">
            <span className="rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-600 shadow-sm">
              {products.length} products
            </span>
          </div>
        </div>

        {/* Toast */}
        {message && (
          <div className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            message.type === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}>
            {message.type === "success" && <CheckCircle2 className="h-4 w-4 shrink-0" />}
            {message.text}
          </div>
        )}

        <div className="grid gap-6 xl:grid-cols-[380px_1fr]">

          {/* ── Left: forms ── */}
          <div className="space-y-5">
            <ProductForm
              title="Add new product"
              form={form}
              setForm={setForm}
              categories={categories}
              onSubmit={onSubmit}
              submitting={submitting}
              submitLabel="Add product"
            />

            {editingId && (
              <ProductForm
                title="Edit product"
                form={editForm}
                setForm={setEditForm}
                categories={categories}
                onSubmit={onUpdateProduct}
                submitting={updating}
                submitLabel="Save changes"
                onCancel={() => setEditingId(null)}
                accent
              />
            )}
          </div>

          {/* ── Right: product list ── */}
          <div className="space-y-4">

            {/* Filters */}
            <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                  className={inputClass + " pl-10"}
                  placeholder="Search products or categories…"
                />
              </div>
              <select value={stockFilter} onChange={(e) => { setStockFilter(e.target.value as typeof stockFilter); setPage(1); }} className={inputClass + " sm:w-36"}>
                <option value="all">All stock</option>
                <option value="in-stock">In stock</option>
                <option value="out-of-stock">Out of stock</option>
              </select>
              <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }} className={inputClass + " sm:w-36"}>
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className={inputClass + " sm:w-44"}>
                <option value="newest">Newest first</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="stock-desc">Most stock</option>
              </select>
            </div>

            {/* Grid */}
            {pagedProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
                <ShoppingBag className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                <p className="text-sm font-semibold text-slate-500">No products found</p>
                <p className="mt-1 text-xs text-slate-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pagedProducts.map((p) => {
                  const isEditing = editingId === p.id;
                  return (
                    <article
                      key={p.id}
                      className={`rounded-2xl border bg-white shadow-sm transition-all ${isEditing ? "border-rose-300 ring-2 ring-rose-100" : "border-slate-200"}`}
                    >
                      <div className="relative overflow-hidden rounded-t-2xl">
                        <Image
                          src={getProductImage(p.imageUrls)}
                          alt={p.name}
                          width={640}
                          height={300}
                          className="h-36 w-full object-cover"
                          unoptimized={true}
                        />
                        {/* Status pill */}
                        <span className={`absolute right-2 top-2 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          p.active ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                        }`}>
                          {p.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <div className="p-4">
                        <p className="line-clamp-1 font-bold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-400">{p.category.name}</p>

                        <div className="mt-2 flex items-center justify-between">
                          <p className="text-base font-extrabold text-rose-500">{formatCurrency(p.price)}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            p.stockQuantity > 0
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-600"
                          }`}>
                            {p.stockQuantity > 0 ? `${p.stockQuantity} in stock` : "Out of stock"}
                          </span>
                        </div>

                        <div className="mt-3 flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(p.id);
                              setEditForm({
                                name: p.name,
                                description: p.description || "",
                                price: String(p.price),
                                stockQuantity: String(p.stockQuantity),
                                categoryId: String(p.category.id),
                                imageUrls: (p.imageUrls || []).join(", "),
                                active: p.active,
                              });
                              // Scroll to edit form on mobile
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 py-2 text-xs font-semibold text-slate-600 hover:border-slate-300 hover:bg-white transition-all"
                          >
                            <Pencil className="h-3.5 w-3.5" /> Edit
                          </button>
                          <button
                            onClick={() => onDelete(p)}
                            disabled={deletingId === p.id}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-red-100 bg-red-50 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {deletingId === p.id ? (
                              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                            ) : <Trash2 className="h-3.5 w-3.5" />}
                            {deletingId === p.id ? "Deleting…" : "Delete"}
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between text-sm text-slate-600">
                <p>
                  Showing <span className="font-bold text-slate-900">{pagedProducts.length}</span> of{" "}
                  <span className="font-bold text-slate-900">{filteredProducts.length}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                    {safePage} / {totalPages}
                  </span>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAdmin>
  );
}