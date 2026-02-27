"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import {
  ChevronDown,
  LogIn,
  LogOut,
  MapPin,
  Menu,
  Search,
  Shield,
  ShoppingBasket,
  ShoppingCart,
  UserRound,
  UserPlus,
  X
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

export function Navbar() {
  const { user, isAdmin, hasAdminRole, viewMode, toggleViewMode, logout } = useAuth();
  const { cartQuantity } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    setMenuOpen(false);
    setCategoryMenuOpen(false);
  }, [pathname, hydrated]);

  useEffect(() => {
    api
      .listCategories()
      .then((data) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    const q = searchParams.get("q") || "";
    const category = searchParams.get("category") || "all";
    setSearchQuery(q);
    setSearchCategory(category);
  }, [searchParams]);

  const resolvedPathname = hydrated ? pathname : "";
  const resolvedUser = hydrated ? user : null;
  const resolvedIsAdmin = hydrated ? isAdmin : false;
  const resolvedHasAdminRole = hydrated ? hasAdminRole : false;
  const resolvedViewMode = hydrated ? viewMode : "CUSTOMER";
  const resolvedCartQuantity = hydrated ? cartQuantity : 0;

  const quickLinks = useMemo(
    () => [
      { href: "/", label: "Marketplace" },
      { href: "/orders", label: "Returns & Orders" }
    ],
    []
  );

  function handleSearchSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const params = new URLSearchParams();
    const trimmed = searchQuery.trim();
    if (trimmed) params.set("q", trimmed);
    if (searchCategory !== "all") params.set("category", searchCategory);
    const target = params.toString() ? `/?${params.toString()}` : "/";
    router.push(target);
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-slate-900/20 bg-slate-950 text-white shadow-[0_10px_35px_rgba(15,23,42,0.28)]">
      <div className="border-b border-white/10 bg-slate-900/65">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between gap-3 px-3 py-2 text-xs text-slate-200 sm:px-5 lg:px-8">
          <p className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            Delivering across South Africa
          </p>
          <div className="hidden items-center gap-3 sm:flex">
            <span>Trusted payments</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>Fast fulfillment</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>Enterprise demo store</span>
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[1500px] px-3 sm:px-5 lg:px-8">
        <div className="flex items-center gap-2 py-3 lg:gap-4">
          <Link href="/" className="inline-flex min-w-fit items-center gap-2 rounded-lg px-1 py-1.5">
            <span className="rounded-lg bg-brand-500 p-2 text-white">
              <ShoppingBasket className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold tracking-tight sm:text-base">StreetLuxCity</span>
          </Link>

          <button
            onClick={() => setCategoryMenuOpen((value) => !value)}
            className="hidden min-w-fit items-center gap-1 rounded-md border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 md:inline-flex"
            aria-expanded={categoryMenuOpen}
            aria-haspopup="menu"
          >
            Categories
            <ChevronDown className={`h-4 w-4 transition ${categoryMenuOpen ? "rotate-180" : ""}`} />
          </button>

          <form
            onSubmit={handleSearchSubmit}
            className="hidden min-w-0 flex-1 items-center overflow-hidden rounded-md border border-white/15 bg-white text-slate-900 md:flex"
          >
            <select
              value={searchCategory}
              onChange={(e) => setSearchCategory(e.target.value)}
              className="h-full border-r border-slate-300 bg-slate-100 px-2 py-2 text-xs text-slate-700 outline-none"
              aria-label="Search category"
            >
              <option value="all">All</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 outline-none"
              placeholder="Search products, brands and categories"
              aria-label="Search products"
            />
            <button type="submit" className="inline-flex h-full items-center bg-amber-400 px-3 text-slate-900 hover:bg-amber-300" aria-label="Search">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            {resolvedHasAdminRole ? (
              <button
                onClick={toggleViewMode}
                className="rounded-md border border-brand-400/60 bg-brand-500/20 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-100 hover:bg-brand-500/30"
              >
                {resolvedViewMode === "ADMIN" ? "Customer View" : "Admin View"}
              </button>
            ) : null}
            {quickLinks.map((link) => {
              const active = resolvedPathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-2.5 py-2 text-sm transition ${
                    active ? "bg-white/10 text-white" : "text-slate-200 hover:bg-white/10"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {resolvedUser ? (
              <Link href="/profile" className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-slate-200 hover:bg-white/10">
                <UserRound className="h-4 w-4" />
                Account
              </Link>
            ) : null}
            {resolvedIsAdmin ? (
              <Link href="/admin" className="inline-flex items-center gap-1 rounded-md bg-brand-500/20 px-2.5 py-2 text-sm text-brand-100">
                <Shield className="h-4 w-4" />
                Admin
              </Link>
            ) : null}
            <Link
              href="/cart"
              className="inline-flex items-center gap-1 rounded-md border border-white/20 bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              <span className="rounded bg-amber-300 px-1.5 text-xs font-semibold text-slate-900">{resolvedCartQuantity}</span>
            </Link>
            {resolvedUser ? (
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-slate-200 hover:bg-white/10"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="inline-flex items-center gap-1 rounded-md px-2.5 py-2 text-sm text-slate-200 hover:bg-white/10">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1 rounded-md bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-300"
                >
                  <UserPlus className="h-4 w-4" />
                  Join
                </Link>
              </>
            )}
          </div>

          <button
            className="ml-auto inline-flex items-center rounded-lg border border-white/20 p-2 text-slate-100 md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {categoryMenuOpen ? (
          <div className="hidden border-t border-white/10 py-4 md:block">
            <div className="grid gap-4 rounded-xl border border-white/15 bg-slate-900/95 p-4 lg:grid-cols-3">
              {categories.slice(0, 18).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="rounded-lg border border-white/10 bg-slate-950/60 px-3 py-2 text-sm text-slate-200 hover:border-brand-400/50 hover:text-white"
                >
                  {category.name}
                </Link>
              ))}
              {!categories.length ? <p className="text-sm text-slate-400">No categories available.</p> : null}
            </div>
          </div>
        ) : null}
      </div>

        <div className={`${menuOpen ? "max-h-[85vh] border-t border-white/10 py-3" : "max-h-0"} overflow-hidden transition-all duration-300 md:hidden`}>
        <div className="mx-auto grid w-full max-w-[1500px] gap-2 px-3 sm:px-5">
          <form onSubmit={handleSearchSubmit} className="space-y-2 rounded-lg border border-white/15 bg-slate-900 p-3">
            <label className="text-xs uppercase tracking-wide text-slate-300">Search marketplace</label>
            <div className="grid gap-2 sm:grid-cols-[1fr_auto]">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-lg border border-white/15 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-400"
                placeholder="Search products"
              />
              <button type="submit" className="inline-flex items-center justify-center rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">
                Search
              </button>
            </div>
          </form>
          {resolvedHasAdminRole ? (
            <button
              onClick={toggleViewMode}
              className="rounded-lg border border-brand-400/50 bg-brand-500/20 px-3 py-2 text-left text-sm text-brand-100"
            >
              {resolvedViewMode === "ADMIN" ? "Switch to Customer View" : "Switch to Admin View"}
            </button>
          ) : null}
          <div className="rounded-lg border border-white/15 bg-slate-900">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-300">Departments</p>
            <div className="grid gap-1 px-2 pb-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="rounded-lg px-3 py-2 text-sm text-slate-200 hover:bg-white/10"
                >
                  {category.name}
                </Link>
              ))}
              {!categories.length ? <p className="px-3 py-2 text-xs text-slate-400">No categories available.</p> : null}
            </div>
          </div>
          {quickLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200">
              {link.label}
            </Link>
          ))}
          {resolvedUser ? (
            <Link href="/profile" className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200">
              Account
            </Link>
          ) : null}
          {resolvedIsAdmin ? (
            <Link href="/admin" className="rounded-lg border border-brand-400/40 bg-brand-500/20 px-3 py-2 text-sm text-brand-100">
              Admin Dashboard
            </Link>
          ) : null}
          <Link href="/cart" className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-100">
            Cart ({resolvedCartQuantity})
          </Link>
          {resolvedUser ? (
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-lg border border-white/20 bg-slate-900 px-3 py-2 text-left text-sm text-slate-200"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-white/15 bg-slate-900 px-3 py-2 text-sm text-slate-200">
                Sign In
              </Link>
              <Link href="/register" className="rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-slate-900">
                Create account
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
