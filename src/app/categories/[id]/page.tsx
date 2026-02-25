"use client";

import { VirtualizedProductGrid } from "@/components/virtualized-product-grid";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

export default function CategoryDetailPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId = params.id;
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState<SortOption>((searchParams.get("sort") as SortOption) || "relevance");
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);

    Promise.all([api.listCategories(), api.listProducts()])
      .then(([categories, productsData]) => {
        const foundCategory = categories.find((entry) => entry.id === categoryId) || null;
        setCategory(foundCategory);
        setAllProducts(productsData);
        setProducts(productsData.filter((product) => product.category.id === categoryId));
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filteredProducts = useMemo(() => {
    const searchTerm = deferredQuery.trim().toLowerCase();
    let result = products.filter((product) => {
      if (!searchTerm) return true;
      return (
        product.name.toLowerCase().includes(searchTerm) ||
        (product.description || "").toLowerCase().includes(searchTerm)
      );
    });

    if (sortBy === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortBy === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [products, deferredQuery, sortBy]);

  const relatedCategories = useMemo(() => {
    const ids = new Set<string>();
    const related: Category[] = [];
    for (const product of allProducts) {
      const entry = product.category;
      if (!entry || entry.id === categoryId || ids.has(entry.id)) continue;
      ids.add(entry.id);
      related.push(entry);
      if (related.length >= 4) break;
    }
    return related;
  }, [allProducts, categoryId]);

  return (
    <section className="space-y-7">
      <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-brand-700">Category</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900">{category?.name || "Category"}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              {category?.description || "Discover products in this collection with modern filters and quick sorting."}
            </p>
          </div>
          <Link href="/" className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50">
            Back to products
          </Link>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search inside this category..."
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none ring-brand-500 focus:ring"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2"
        >
          <option value="relevance">Sort: Relevance</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name-asc">Name: A to Z</option>
        </select>
      </div>

      {loading ? <p className="rounded-xl bg-white p-4 text-sm text-slate-600">Loading category...</p> : null}
      {error ? <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}
      {!loading && !error && !category ? <p className="rounded-xl bg-white p-4 text-sm">Category not found.</p> : null}

      {!loading && !error ? (
        <div className="flex items-center justify-between rounded-xl bg-slate-100 px-4 py-3 text-sm text-slate-700">
          <p>
            Showing <span className="font-semibold">{filteredProducts.length}</span> items
          </p>
          <p className="hidden sm:block">Collection: {category?.name || "-"}</p>
        </div>
      ) : null}

      <VirtualizedProductGrid products={filteredProducts} />

      {!loading && !error && !filteredProducts.length ? (
        <p className="rounded-xl bg-white p-4 text-sm text-slate-600">No products matched this category filter.</p>
      ) : null}

      {relatedCategories.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm font-semibold text-slate-900">Explore More Collections</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {relatedCategories.map((entry) => (
              <Link
                key={entry.id}
                href={`/categories/${entry.id}`}
                className="rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 hover:border-brand-400"
              >
                {entry.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
