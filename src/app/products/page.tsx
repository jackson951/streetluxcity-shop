"use client";

import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { formatCurrency, getProductImage } from "@/lib/utils";
import {
  ArrowUpDown,
  LayoutGrid,
  LayoutList,
  ListFilter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Tag,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Star } from "lucide-react";

type SortOption = "relevance" | "price-asc" | "price-desc" | "name-asc";
type StockFilter = "all" | "in-stock" | "out-of-stock";

const VALID_SORT_OPTIONS: SortOption[] = ["relevance", "price-asc", "price-desc", "name-asc"];
const VALID_STOCK_FILTERS: StockFilter[] = ["all", "in-stock", "out-of-stock"];

function isInStock(p: Product) {
  return p.active && p.stockQuantity > 0;
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

// ── Inline product card (no dependency on VirtualizedProductGrid) ──
function ProductCard({ product, wide = false }: { product: Product; wide?: boolean }) {
  const { addItem, mutating } = useCart();
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const [msg, setMsg] = useState<string | null>(null);
  const inStock = isInStock(product);
  const promoPercent = ((product.name.length + product.category.name.length) % 22) + 8;

  async function handleAdd() {
    if (!inStock) { setMsg("Currently out of stock."); return; }
    if (user && !canUseCustomerFeatures) {
      setMsg(hasAdminRole && viewMode === "ADMIN" ? "Switch to Customer View." : "Login as customer.");
      return;
    }
    try {
      await addItem(product.id, 1);
      setMsg("Added to cart ✓");
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      setMsg((err as Error).message);
    }
  }

  if (wide) {
    // 2-col layout: image left, details right
    return (
      <article className="group flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
        <Link href={`/products/${product.id}`} className="relative w-44 shrink-0 overflow-hidden">
          <Image
            src={getProductImage(product.imageUrls)}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-2 top-2 rounded-full bg-rose-600 px-2 py-0.5 text-xs font-bold text-white">
            -{promoPercent}%
          </span>
        </Link>
        <div className="flex flex-1 flex-col justify-between p-4 gap-2">
          <div className="space-y-1">
            <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">{product.category.name}</p>
            <Link href={`/products/${product.id}`} className="line-clamp-2 text-base font-bold text-slate-900 hover:text-rose-600 transition-colors">
              {product.name}
            </Link>
            <p className="line-clamp-2 text-sm text-slate-500">{product.description}</p>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-extrabold text-slate-900">{formatCurrency(product.price)}</p>
              <span className={`text-xs font-semibold ${inStock ? "text-emerald-600" : "text-slate-400"}`}>
                {inStock ? "✓ Available" : "Out of stock"}
              </span>
            </div>
            <button
              onClick={handleAdd}
              disabled={!inStock || mutating}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
            >
              {inStock ? "Add to cart" : "Unavailable"}
            </button>
          </div>
          {msg && <p className="text-xs text-slate-500">{msg}</p>}
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden h-52">
          <Image
            src={getProductImage(product.imageUrls)}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2.5 py-0.5 text-xs font-bold text-white shadow">
            -{promoPercent}%
          </span>
          {!inStock && (
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-slate-700">Out of stock</span>
            </div>
          )}
        </div>
      </Link>
      <div className="p-4 space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500">{product.category.name}</p>
        <Link href={`/products/${product.id}`} className="line-clamp-1 text-sm font-bold text-slate-900 hover:text-rose-600 transition-colors block">
          {product.name}
        </Link>
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
          <span className="ml-1 text-xs text-slate-400">(4.8)</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-base font-extrabold text-slate-900">{formatCurrency(product.price)}</span>
          <span className={`text-xs font-semibold ${inStock ? "text-emerald-600" : "text-slate-400"}`}>
            {inStock ? "✓ In stock" : "Unavailable"}
          </span>
        </div>
        <button
          onClick={handleAdd}
          disabled={!inStock || mutating}
          className="mt-1 w-full rounded-xl bg-slate-900 py-2.5 text-xs font-bold text-white hover:bg-rose-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
        >
          {inStock ? "Add to cart" : "Unavailable"}
        </button>
        {msg && <p className="text-xs text-slate-500">{msg}</p>}
      </div>
    </article>
  );
}

// ── Sidebar category row ──
function SidebarCategoryRow({ label, count, active, onClick }: {
  label: string; count: number; active: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
        active
          ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-200"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
      }`}
    >
      <span className="truncate">{label}</span>
      <span className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-xs font-bold ${
        active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-slate-200"
      }`}>
        {count}
      </span>
    </button>
  );
}

// ── Mobile filter pill ──
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-all duration-150 ${
        active
          ? "border-rose-500 bg-rose-500 text-white shadow-sm"
          : "border-slate-200 bg-white text-slate-600 hover:border-rose-300 hover:text-rose-600"
      }`}
    >
      {label}
    </button>
  );
}

// ── Price input ──
function PriceInput({ value, onChange, placeholder }: {
  value: string; onChange: (v: string) => void; placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">R</span>
      <input
        type="number" min={0} value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-7 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
      />
    </div>
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isFirstMount = useRef(true);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "all");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [stockFilter, setStockFilter] = useState<StockFilter>(parseStockFilter(searchParams.get("stock")));
  const [sortBy, setSortBy] = useState<SortOption>(parseSortOption(searchParams.get("sort")));
  const [loading, setLoading] = useState(true);
  // "grid" = compact cards, "wide" = landscape list cards
  const [viewMode, setViewMode] = useState<"grid" | "wide">("grid");

  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    setLoading(true);
    Promise.all([api.listProducts(), api.listCategories()])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (isFirstMount.current) { isFirstMount.current = false; return; }
    setQuery(searchParams.get("q") || "");
    setSelectedCategory(searchParams.get("category") || "all");
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
    setStockFilter(parseStockFilter(searchParams.get("stock")));
    setSortBy(parseSortOption(searchParams.get("sort")));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (selectedCategory !== "all") params.set("category", selectedCategory);
    if (minPrice.trim()) params.set("minPrice", minPrice.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (stockFilter !== "all") params.set("stock", stockFilter);
    if (sortBy !== "relevance") params.set("sort", sortBy);
    const next = params.toString();
    if (next !== searchParams.toString()) {
      router.replace(next ? `/products?${next}` : "/products", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const p of products) {
      const id = p.category?.id;
      if (id) counts.set(id, (counts.get(id) || 0) + 1);
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    const q = deferredQuery.trim().toLowerCase();
    const catNorm = selectedCategory.trim().toLowerCase();
    const knownIds = new Set(products.map((p) => String(p.category.id)));
    const knownNames = new Set(products.map((p) => p.category.name.toLowerCase()));
    const effectiveCat =
      catNorm === "all" || knownIds.has(catNorm) || knownNames.has(catNorm) ? catNorm : "all";

    let min = parsePositiveNumber(minPrice.trim());
    let max = parsePositiveNumber(maxPrice.trim());
    if (min != null && max != null && min > max) [min, max] = [max, min];

    let result = products.filter((p) => {
      const matchQ = !q || p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || p.category.name.toLowerCase().includes(q);
      const matchCat = effectiveCat === "all" || String(p.category.id) === effectiveCat || p.category.name.toLowerCase() === effectiveCat;
      const matchMin = min == null || p.price >= min;
      const matchMax = max == null || p.price <= max;
      const inStock = isInStock(p);
      const matchStock = stockFilter === "all" || (stockFilter === "in-stock" && inStock) || (stockFilter === "out-of-stock" && !inStock);
      return matchQ && matchCat && matchMin && matchMax && matchStock;
    });

    if (sortBy === "price-asc") result = [...result].sort((a, b) => a.price - b.price);
    else if (sortBy === "price-desc") result = [...result].sort((a, b) => b.price - a.price);
    else if (sortBy === "name-asc") result = [...result].sort((a, b) => a.name.localeCompare(b.name));

    return result;
  }, [products, deferredQuery, selectedCategory, minPrice, maxPrice, stockFilter, sortBy]);

  const totalInStock = useMemo(() => products.filter(isInStock).length, [products]);
  const totalOutOfStock = products.length - totalInStock;

  const priceRange = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  function resetFilters() {
    setQuery(""); setSelectedCategory("all");
    setMinPrice(""); setMaxPrice("");
    setStockFilter("all"); setSortBy("relevance");
  }

  const hasActiveFilters = !!(query || selectedCategory !== "all" || minPrice || maxPrice || stockFilter !== "all" || sortBy !== "relevance");

  const currentCategoryName =
    selectedCategory === "all"
      ? "All Products"
      : categories.find((c) => String(c.id) === selectedCategory || c.name.toLowerCase() === selectedCategory.toLowerCase())?.name ?? "Products";

  return (
    /*
      KEY FIX: The outer page scrolls naturally — no fixed-height overflow containers.
      The sidebar is sticky so it follows the scroll. Products render in a normal flow grid.
      This eliminates all virtualized-scroll flicker and the "never reaches bottom" issue.
    */
    <div className="flex gap-6 items-start">

      {/* ═══════════════════════════════
          PERMANENT SIDEBAR (lg+)
      ═══════════════════════════════ */}
      <aside className="hidden lg:flex w-64 xl:w-72 shrink-0 flex-col gap-4 sticky top-6">

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-900">
              <SlidersHorizontal className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-base font-extrabold text-slate-900">Filters</h2>
          </div>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <RotateCcw className="h-3 w-3" /> Reset
            </button>
          )}
        </div>

        {/* Search */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
            <Search className="h-3 w-3" /> Search
          </p>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything…"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-8 text-sm outline-none placeholder:text-slate-400 focus:border-rose-400 focus:bg-white focus:ring-2 focus:ring-rose-100 transition-all"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-lg leading-none text-slate-400 hover:text-slate-700">
                ×
              </button>
            )}
          </div>
        </div>

        {/* Categories */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            <Tag className="h-3 w-3" /> Categories
          </p>
          <SidebarCategoryRow label="All Products" count={products.length} active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")} />
          {categories.map((cat) => (
            <SidebarCategoryRow
              key={cat.id}
              label={cat.name}
              count={categoryCounts.get(cat.id) || 0}
              active={selectedCategory === String(cat.id) || selectedCategory.toLowerCase() === cat.name.toLowerCase()}
              onClick={() => setSelectedCategory(String(cat.id))}
            />
          ))}
        </div>

        {/* Price */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-3">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400">
            <TrendingUp className="h-3 w-3" /> Price Range
          </p>
          {!loading && <p className="text-xs text-slate-400">R{priceRange.min.toLocaleString()} – R{priceRange.max.toLocaleString()}</p>}
          <div className="grid grid-cols-2 gap-2">
            <PriceInput value={minPrice} onChange={setMinPrice} placeholder="Min" />
            <PriceInput value={maxPrice} onChange={setMaxPrice} placeholder="Max" />
          </div>
          {(minPrice || maxPrice) && (
            <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="text-xs font-semibold text-rose-500 hover:text-rose-600">
              Clear price filter
            </button>
          )}
        </div>

        {/* Availability */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-1">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">
            <Sparkles className="h-3 w-3" /> Availability
          </p>
          {([
            { value: "all" as StockFilter, label: "Show all", count: products.length },
            { value: "in-stock" as StockFilter, label: "Available now", count: totalInStock },
            { value: "out-of-stock" as StockFilter, label: "Out of stock", count: totalOutOfStock },
          ]).map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStockFilter(opt.value)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-150 ${
                stockFilter === opt.value
                  ? "bg-rose-500 text-white font-semibold shadow-md shadow-rose-200"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <span>{opt.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${stockFilter === opt.value ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {opt.count}
              </span>
            </button>
          ))}
        </div>

        {/* Store snapshot */}
        {/* {!loading && (
          <div className="rounded-2xl p-4 text-white space-y-3" style={{ background: "linear-gradient(135deg, #0f172a, #be123c)" }}>
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Store snapshot</p>
            <div className="space-y-2">
              {[
                { label: "Total products", value: products.length, color: "" },
                { label: "In stock", value: totalInStock, color: "text-emerald-300" },
                { label: "Categories", value: categories.length, color: "" },
              ].map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/70">{label}</span>
                    <span className={`text-sm font-extrabold ${color}`}>{value}</span>
                  </div>
                  <div className="mt-2 h-px bg-white/10 last:hidden" />
                </div>
              ))}
            </div>
          </div>
        )} */}
      </aside>

      {/* ═══════════════════════════════
          MAIN CONTENT
      ═══════════════════════════════ */}
      <div className="flex-1 min-w-0 space-y-5">

        {/* Top bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">{currentCategoryName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {loading ? "Loading…" : `${filtered.length} of ${products.length} products`}
              {hasActiveFilters && (
                <button onClick={resetFilters} className="ml-2 font-semibold text-rose-500 hover:text-rose-600">· Clear filters</button>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-700 shadow-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 transition-all appearance-none"
              >
                <option value="relevance">Best match</option>
                <option value="price-asc">Cheapest first</option>
                <option value="price-desc">Most expensive first</option>
                <option value="name-asc">A to Z</option>
              </select>
            </div>

            {/* View toggle */}
            <div className="hidden lg:flex items-center rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <button
                onClick={() => setViewMode("grid")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${viewMode === "grid" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-700"}`}
                title="Grid view"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("wide")}
                className={`flex h-10 w-10 items-center justify-center transition-colors ${viewMode === "wide" ? "bg-slate-900 text-white" : "text-slate-400 hover:text-slate-700"}`}
                title="List view"
              >
                <LayoutList className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile filters */}
        <div className="lg:hidden space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search anything…"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 transition-all shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 flex items-center gap-1 text-xs font-semibold text-slate-500">
              <ListFilter className="h-3.5 w-3.5" /> Filter:
            </span>
            <FilterPill label={`All (${products.length})`} active={selectedCategory === "all"} onClick={() => setSelectedCategory("all")} />
            {categories.map((cat) => (
              <FilterPill
                key={cat.id}
                label={`${cat.name} (${categoryCounts.get(cat.id) || 0})`}
                active={selectedCategory === String(cat.id) || selectedCategory.toLowerCase() === cat.name.toLowerCase()}
                onClick={() => setSelectedCategory(String(cat.id))}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            {(["all", "in-stock", "out-of-stock"] as StockFilter[]).map((s) => (
              <FilterPill
                key={s}
                label={s === "all" ? "All" : s === "in-stock" ? "Available now" : "Out of stock"}
                active={stockFilter === s}
                onClick={() => setStockFilter(s)}
              />
            ))}
          </div>
        </div>

        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Active:</span>
            {query && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                "{query}" <button onClick={() => setQuery("")} className="hover:text-rose-900">×</button>
              </span>
            )}
            {selectedCategory !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                {categories.find((c) => String(c.id) === selectedCategory)?.name || selectedCategory}
                <button onClick={() => setSelectedCategory("all")} className="hover:text-rose-900">×</button>
              </span>
            )}
            {minPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                Min R{minPrice} <button onClick={() => setMinPrice("")} className="hover:text-rose-900">×</button>
              </span>
            )}
            {maxPrice && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                Max R{maxPrice} <button onClick={() => setMaxPrice("")} className="hover:text-rose-900">×</button>
              </span>
            )}
            {stockFilter !== "all" && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
                {stockFilter === "in-stock" ? "Available now" : "Out of stock"}
                <button onClick={() => setStockFilter("all")} className="hover:text-rose-900">×</button>
              </span>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-8 text-sm text-slate-500 shadow-sm">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
            Loading products…
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">🔍</div>
            <h3 className="text-base font-bold text-slate-900">No products found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your filters or search.</p>
            <button
              onClick={resetFilters}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Show everything
            </button>
          </div>
        )}

        {/*
          PRODUCTS GRID — plain CSS grid, page scrolls naturally.
          No virtualization, no fixed height container, no flicker, no bottomless scroll.
          "wide" mode switches to a single-column landscape card layout.
        */}
        {!loading && filtered.length > 0 && (
          viewMode === "wide" ? (
            <div className="space-y-3">
              {filtered.map((p) => <ProductCard key={p.id} product={p} wide />)}
            </div>
          ) : (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-rose-400 border-t-transparent" />
          Loading your shop…
        </div>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}