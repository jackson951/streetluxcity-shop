"use client";

import { VirtualizedProductGrid } from "@/components/virtualized-product-grid";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { BarChart3, Flame, ShieldCheck, Truck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useMemo, useState } from "react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";
type StockFilter = "all" | "in-stock" | "out-of-stock";
const VALID_SORT_OPTIONS: SortOption[] = ["relevance", "price-asc", "price-desc", "name-asc"];
const VALID_STOCK_FILTERS: StockFilter[] = ["all", "in-stock", "out-of-stock"];

function isInStock(product: Product) {
  return product.active && product.stockQuantity > 0;
}

function parsePositiveNumber(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}

function parseStockFilter(value: string | null): StockFilter {
  return VALID_STOCK_FILTERS.includes(value as StockFilter) ? (value as StockFilter) : "all";
}

function parseSortOption(value: string | null): SortOption {
  return VALID_SORT_OPTIONS.includes(value as SortOption) ? (value as SortOption) : "relevance";
}

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [stockFilter, setStockFilter] = useState<StockFilter>(parseStockFilter(searchParams.get("stock")));
  const [sortBy, setSortBy] = useState<SortOption>(parseSortOption(searchParams.get("sort")));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([loadedProducts, loadedCategories]) => {
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const nextQuery = searchParams.get("q") || "";
    const nextCategory = searchParams.get("category") || "all";
    const nextMin = searchParams.get("minPrice") || "";
    const nextMax = searchParams.get("maxPrice") || "";
    const nextStock = parseStockFilter(searchParams.get("stock"));
    const nextSort = parseSortOption(searchParams.get("sort"));

    if (nextQuery !== query) setQuery(nextQuery);
    if (nextCategory !== selectedCategory) setSelectedCategory(nextCategory);
    if (nextMin !== minPrice) setMinPrice(nextMin);
    if (nextMax !== maxPrice) setMaxPrice(nextMax);
    if (nextStock !== stockFilter) setStockFilter(nextStock);
    if (nextSort !== sortBy) setSortBy(nextSort);
  }, [searchParams, query, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  useEffect(() => {
    const safeStock = parseStockFilter(stockFilter);
    if (safeStock !== stockFilter) {
      setStockFilter(safeStock);
      return;
    }
    const safeSort = parseSortOption(sortBy);
    if (safeSort !== sortBy) {
      setSortBy(safeSort);
    }
  }, [stockFilter, sortBy]);

  useEffect(() => {
    if (!products.length || selectedCategory === "all") return;
    const normalized = selectedCategory.toLowerCase();
    const isValid = products.some(
      (product) => String(product.category.id) === normalized || product.category.name.toLowerCase() === normalized
    );
    if (!isValid) {
      setSelectedCategory("all");
    }
  }, [products, selectedCategory]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (sortBy !== "relevance") params.set("sort", sortBy);

    const next = params.toString();
    const current = searchParams.toString();
    if (next !== current) {
      router.replace(next ? `/?${next}` : "/", { scroll: false });
    }
  }, [query, selectedCategory, minPrice, maxPrice, stockFilter, sortBy, router, searchParams]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      const id = product.category?.id;
      if (!id) continue;
      counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const normalizedQuery = deferredQuery.trim().toLowerCase();
    const normalizedCategory = selectedCategory.trim().toLowerCase();
    const knownCategoryIds = new Set(products.map((product) => String(product.category.id)));
    const knownCategoryNames = new Set(products.map((product) => product.category.name.toLowerCase()));
    const effectiveCategory =
      normalizedCategory === "all" || knownCategoryIds.has(normalizedCategory) || knownCategoryNames.has(normalizedCategory)
        ? normalizedCategory
        : "all";

    const effectiveStockFilter = parseStockFilter(stockFilter);
    const effectiveSort = parseSortOption(sortBy);

    let min = parsePositiveNumber(minPrice.trim());
    let max = parsePositiveNumber(maxPrice.trim());
    if (min != null && max != null && min > max) {
      [min, max] = [max, min];
    }

    let result = products.filter((product) => {
      const matchesQuery =
        !normalizedQuery ||
        product.name.toLowerCase().includes(normalizedQuery) ||
        (product.description || "").toLowerCase().includes(normalizedQuery) ||
        product.category.name.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        effectiveCategory === "all" ||
        String(product.category.id) === effectiveCategory ||
        product.category.name.toLowerCase() === effectiveCategory;

      const matchesMin = min == null || product.price >= min;
      const matchesMax = max == null || product.price <= max;

      const inStock = isInStock(product);
      const matchesStock =
        effectiveStockFilter === "all" ||
        (effectiveStockFilter === "in-stock" && inStock) ||
        (effectiveStockFilter === "out-of-stock" && !inStock);

      return matchesQuery && matchesCategory && matchesMin && matchesMax && matchesStock;
    });

    if (effectiveSort === "price-asc") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (effectiveSort === "price-desc") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (effectiveSort === "name-asc") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, deferredQuery, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  const totalInStock = useMemo(() => products.filter((product) => isInStock(product)).length, [products]);

  function resetFilters() {
    setQuery("");
    setSelectedCategory("all");
    setMinPrice("");
    setMaxPrice("");
    setStockFilter("all");
    setSortBy("relevance");
  }

  return (
    <section className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-[1.7fr_1fr]">
        <article className="overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-950 via-slate-900 to-brand-700 text-white">
          <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-4">
              <p className="inline-flex rounded-full border border-white/25 px-3 py-1 text-xs uppercase tracking-[0.16em] text-amber-300">
                Marketplace Week
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Discover high-demand products at retail scale.</h1>
              <p className="max-w-xl text-sm text-slate-200 sm:text-base">
                Enterprise-ready catalog browsing, dynamic checkout sessions, and robust order lifecycle management.
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-200 sm:text-sm">
                <span className="rounded-full bg-white/10 px-3 py-1">Real-time stock indicators</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Role-aware customer/admin flows</span>
                <span className="rounded-full bg-white/10 px-3 py-1">High-volume catalog virtualization</span>
              </div>
            </div>
            <div className="grid gap-2 rounded-2xl border border-white/15 bg-slate-950/45 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-300">Marketplace health</p>
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-slate-300">Products</p>
                  <p className="text-2xl font-semibold">{products.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-slate-300">Departments</p>
                  <p className="text-2xl font-semibold">{categories.length}</p>
                </div>
                <div className="rounded-xl bg-white/10 p-3">
                  <p className="text-xs text-slate-300">In stock now</p>
                  <p className="text-2xl font-semibold">{totalInStock}</p>
                </div>
              </div>
            </div>
          </div>
        </article>

        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
              <Truck className="h-4 w-4" />
              Fulfillment
            </p>
            <p className="mt-2 text-sm text-slate-700">Nationwide dispatch pipeline for reliable shipping operations.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <ShieldCheck className="h-4 w-4" />
              Payments
            </p>
            <p className="mt-2 text-sm text-slate-700">Tokenized payment sessions with explicit status tracking.</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-amber-700">
              <Flame className="h-4 w-4" />
              Trending
            </p>
            <p className="mt-2 text-sm text-slate-700">High-intent category merchandising with conversion-first filters.</p>
          </article>
        </div>
      </div>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-base font-semibold text-slate-900 sm:text-lg">
            <BarChart3 className="h-4 w-4 text-brand-600" />
            Catalog control center
          </h2>
          <button onClick={resetFilters} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
            Reset all
          </button>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search product, keyword or department"
            className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 outline-none ring-brand-500 focus:ring xl:col-span-2"
          />
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as StockFilter)} className="rounded-xl border border-slate-300 bg-white px-4 py-2">
            <option value="all">All stock</option>
            <option value="in-stock">In stock</option>
            <option value="out-of-stock">Out of stock</option>
          </select>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="Min price"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2"
          />
          <input
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="Max price"
            className="rounded-xl border border-slate-300 bg-white px-4 py-2"
          />
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="rounded-xl border border-slate-300 bg-white px-4 py-2">
            <option value="relevance">Sort: Relevance</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            onClick={resetFilters}
            className={`rounded-full border px-3 py-1 text-sm ${
              selectedCategory === "all"
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
            }`}
          >
            All departments ({products.length})
          </button>
          {categories.map((category) => {
            const active = selectedCategory === String(category.id) || selectedCategory.toLowerCase() === category.name.toLowerCase();
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(String(category.id))}
                className={`rounded-full border px-3 py-1 text-sm ${
                  active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:border-brand-400"
                }`}
              >
                {category.name} ({categoryCounts.get(category.id) || 0})
              </button>
            );
          })}
        </div>
      </article>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-700">
        <p>
          Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{products.length}</span> products
        </p>
        <p>Live inventory: <span className="font-semibold">{totalInStock}</span></p>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading catalog...</p>}
      {!loading && !error && !filtered.length ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">No products matched these filters. Try widening your criteria.</p>
      ) : null}

      <VirtualizedProductGrid products={filtered} viewportClassName="h-[70vh]" />
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">Loading catalog...</div>}>
      <HomeContent />
    </Suspense>
  );
}
