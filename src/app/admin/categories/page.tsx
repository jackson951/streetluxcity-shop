"use client";

import { RequireAdmin } from "@/components/route-guards";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { FormEvent, useEffect, useState } from "react";

export default function AdminCategoriesPage() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  async function load() {
    setCategories(await api.listCategories());
  }

  useEffect(() => {
    load().catch((err) => setMessage((err as Error).message));
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (!name.trim()) {
      setMessage("Category name is required.");
      return;
    }
    try {
      await api.createCategory(token, { name, description });
      setName("");
      setDescription("");
      setMessage("Category created.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function onDelete(category: Category) {
    if (!token) return;
    const confirmed = window.confirm(`Delete category "${category.name}"?`);
    if (!confirmed) return;

    setMessage(null);
    setDeletingId(category.id);
    try {
      await api.deleteCategory(token, category.id);
      setMessage("Category deleted.");
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <RequireAdmin>
      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-6">
          <h1 className="text-2xl font-semibold">Create Category</h1>
          <div className="mt-4 grid gap-3">
            <input className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Category name" required value={name} onChange={(e) => setName(e.target.value)} />
            <textarea className="rounded-xl border border-slate-300 px-4 py-2" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="rounded-xl bg-brand-600 px-4 py-2 text-white hover:bg-brand-700">Save category</button>
            {message && <p className="text-sm text-slate-600">{message}</p>}
          </div>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-semibold">Existing Categories</h2>
          <ul className="mt-4 space-y-2">
            {categories.map((c) => (
              <li key={c.id} className="flex items-start justify-between gap-3 rounded-lg bg-slate-50 p-3">
                <div>
                  <p className="font-medium">{c.name}</p>
                  <p className="text-sm text-slate-600">{c.description}</p>
                </div>
                <button
                  onClick={() => onDelete(c)}
                  disabled={deletingId === c.id}
                  className="rounded-md border border-red-200 bg-white px-3 py-1 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {deletingId === c.id ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </RequireAdmin>
  );
}
