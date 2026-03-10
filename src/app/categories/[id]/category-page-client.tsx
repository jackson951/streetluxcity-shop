"use client";

import { VirtualizedProductGrid } from "@/components/virtualized-product-grid";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { ArrowLeft, ArrowRight, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useMemo, useState } from "react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";

const CATEGORY_IMAGES: Record<string, string> = {
  electronics:     "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&q=80",
  clothing:        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  fashion:         "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&q=80",
  shoes:           "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  footwear:        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200&q=80",
  furniture:       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80",
  "home & living": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  home:            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80",
  beauty:          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
  cosmetics:       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80",
  sports:          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
  fitness:         "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
  food:            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80",
  grocery:         "https://images.unsplash.com/photo-1543168256-418811576931?w=1200&q=80",
  toys:            "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1200&q=80",
  kids:            "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=1200&q=80",
  books:           "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80",
  garden:          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=1200&q=80",
  automotive:      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200&q=80",
  pets:            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1200&q=80",
  jewelry:         "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1200&q=80",
  accessories:     "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1200&q=80",
  bags:            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=1200&q=80",
  health:          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1200&q=80",
};

const FALLBACKS = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
];

function getCategoryImage(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return FALLBACKS[name.length % FALLBACKS.length];
}

export default function CategoryDetailPage() {
  const params       = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const categoryId   = params.id;

  const [category, setCategory]       = useState<Category | null>(null);
  const [products, setProducts]       = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [query, setQuery]             = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy]           = useState<SortOption>(
    (searchParams.get("sort") as SortOption) || "relevance"
  );
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    if (!categoryId) return;
    setLoading(true);
    setError(null);
    Promise.all([api.listCategories(), api.listProducts()])
      .then(([cats, prods]) => {
        setCategory(cats.find((c) => c.id === categoryId) || null);
        setAllProducts(prods);
        setProducts(prods.filter((p) => p.category.id === categoryId));
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [categoryId]);

  const filteredProducts = useMemo(() => {
    const term = deferredQuery.trim().toLowerCase();
    let result = products.filter((p) =>
      !term ||
      p.name.toLowerCase().includes(term) ||
      (p.description || "").toLowerCase().includes(term)
    );
    if (sortBy === "price-asc")  result = [...result].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    if (sortBy === "name-asc")   result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [products, deferredQuery, sortBy]);

  const relatedCategories = useMemo(() => {
    const seen = new Set<string>();
    const related: Category[] = [];
    for (const p of allProducts) {
      const c = p.category;
      if (!c || c.id === categoryId || seen.has(c.id)) continue;
      seen.add(c.id);
      related.push(c);
      if (related.length >= 5) break;
    }
    return related;
  }, [allProducts, categoryId]);

  const heroImage = category ? getCategoryImage(category.name) : FALLBACKS[0];

  return (
    <section className="space-y-6">

      {/* Hero banner */}
      <div className="relative overflow-hidden rounded-3xl" style={{ minHeight: 220 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={category?.name || "Category"}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="relative flex min-h-[220px] flex-col justify-between gap-6 p-7 sm:p-10">
          <Link
            href="/categories"
            className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> All Categories
          </Link>
          <div className="space-y-2">
            <span className="inline-block rounded-full border border-rose-500/40 bg-rose-500/20 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-rose-300">
              Browsing category
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {loading ? "Loading…" : (category?.name || "Category")}
            </h1>
            {category?.description && (
              <p className="max-w-lg text-sm text-white/70 leading-relaxed">{category.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Search & sort bar */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${category?.name || "this category"}…`}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100"
          />
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="h-4 w-4 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition"
          >
            <option value="relevance">Best match</option>
            <option value="price-asc">Cheapest first</option>
            <option value="price-desc">Most expensive first</option>
            <option value="name-asc">A to Z</option>
          </select>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
          Loading products for you…
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
          Something went wrong. Please try refreshing the page.
        </div>
      )}

      {/* Category not found */}
      {!loading && !error && !category && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-3xl mb-2">🔍</p>
          <p className="font-semibold text-slate-800">Category not found</p>
          <p className="mt-1 text-sm text-slate-500">It may have been moved or removed.</p>
          <Link
            href="/categories"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition-colors"
          >
            Browse all categories
          </Link>
        </div>
      )}

      {/* Results summary */}
      {!loading && !error && category && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-600">
          <p>
            Showing{" "}
            <span className="font-bold text-slate-900">{filteredProducts.length}</span>{" "}
            {filteredProducts.length === 1 ? "product" : "products"}
            {query && <> matching <span className="font-bold text-slate-900">"{query}"</span></>}
          </p>
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 transition-colors"
            >
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Product grid */}
      <VirtualizedProductGrid products={filteredProducts} />

      {/* Empty state */}
      {!loading && !error && category && filteredProducts.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-3xl mb-2">😕</p>
          <p className="font-semibold text-slate-800">Nothing found</p>
          <p className="mt-1 text-sm text-slate-500">
            Try a different search or browse another category.
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-rose-600 transition-colors"
          >
            Show all in {category.name}
          </button>
        </div>
      )}

      {/* Related categories */}
      {relatedCategories.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">
            You might also like
          </p>
          <div className="flex flex-wrap gap-2">
            {relatedCategories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 transition-all"
              >
                {cat.name}
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>
        </div>
      )}

    </section>
  );
}