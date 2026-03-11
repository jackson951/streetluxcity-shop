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
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export function Navbar() {
  const { user, isAdmin, hasAdminRole, logout } = useAuth();
  const { cartQuantity } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const categoryMenuRef = useRef<HTMLDivElement>(null);

  // Hydrate once
  useEffect(() => setHydrated(true), []);

  // Close everything on route change
  useEffect(() => {
    setMenuOpen(false);
    setCategoryMenuOpen(false);
  }, [pathname]);

  // Sync search input from URL
  useEffect(() => {
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  // Load categories
  useEffect(() => {
    api.listCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  // Close category dropdown when clicking outside
  useEffect(() => {
    if (!categoryMenuOpen) return;
    function handleClick(e: MouseEvent) {
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target as Node)) {
        setCategoryMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [categoryMenuOpen]);

  // Resolve SSR-safe values
  const resolvedUser         = hydrated ? user          : null;
  const resolvedIsAdmin      = hydrated ? isAdmin       : false;
  const resolvedHasAdminRole = hydrated ? hasAdminRole  : false;
  const resolvedCart         = hydrated ? cartQuantity  : 0;

  const navLinks = useMemo(() => [
    { href: "/products",   label: "All Products" },
    { href:isAdmin?"/admin/orders" :"/orders",     label: isAdmin?"Orders":"My Orders"    },
  ], []);

  function handleSearchSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    const params = new URLSearchParams();
    if (trimmed) params.set("q", trimmed);
    router.push(params.toString() ? `/products?${params.toString()}` : "/products");
    setMenuOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-950 text-white shadow-[0_4px_30px_rgba(0,0,0,0.4)]">

      {/* ── Top announcement bar ── */}
      <div className="border-b border-white/10 bg-slate-900/80">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-1.5 text-[11px] text-slate-400 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3 w-3 text-rose-400" />
            Delivering across South Africa
          </span>
          <span className="hidden gap-3 sm:flex">
            <span>✓ Trusted payments</span>
            <span>✓ Fast delivery</span>
            <span>✓ Easy returns</span>
          </span>
        </div>
      </div>

      {/* ── Main nav row ── */}
      <div className="mx-auto flex max-w-[1500px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link href="/" className="flex shrink-0 items-center gap-2 rounded-xl px-1">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-500 shadow-lg shadow-rose-500/30">
            <ShoppingBasket className="h-4 w-4 text-white" />
          </span>
          <span className="hidden text-base font-extrabold tracking-tight sm:block">
            StreetLux<span className="text-rose-400">City</span>
          </span>
        </Link>

        {/* Categories dropdown — desktop */}
        <div className="relative hidden md:block" ref={categoryMenuRef}>
          <button
            onClick={() => setCategoryMenuOpen((v) => !v)}
            className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-200 hover:bg-slate-800 transition-colors"
            aria-expanded={categoryMenuOpen}
          >
            Shop
            <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${categoryMenuOpen ? "rotate-180" : ""}`} />
          </button>

          {categoryMenuOpen && (
            <div className="absolute left-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-900 shadow-2xl">
              <div className="border-b border-white/10 px-4 py-3">
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Browse by category</p>
              </div>
              <div className="max-h-72 overflow-y-auto p-2">
                <Link
                  href="/categories"
                  className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-400 hover:bg-white/5 transition-colors"
                >
                  All Categories
                  <ChevronDown className="h-3.5 w-3.5 -rotate-90" />
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm text-slate-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search bar — desktop */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden flex-1 overflow-hidden rounded-xl border border-white/10 bg-slate-900 md:flex"
        >
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for products, brands or categories…"
            className="w-full bg-transparent px-4 py-2.5 text-sm text-slate-100 outline-none placeholder:text-slate-500"
          />
          <button
            type="submit"
            className="flex items-center gap-1.5 bg-rose-500 px-4 text-sm font-semibold text-white hover:bg-rose-600 transition-colors"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>

        {/* Desktop right actions */}
        <div className="ml-auto hidden items-center gap-1.5 md:flex">


          {/* Nav links */}
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-xl px-3 py-2 text-sm transition-colors ${
                pathname === link.href
                  ? "bg-white/10 text-white font-semibold"
                  : "text-slate-300 hover:bg-white/8 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}

          {/* Account */}
          {resolvedUser && (
            <Link
              href="/profile"
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
            >
              <UserRound className="h-4 w-4" />
              Account
            </Link>
          )}

          {/* Admin link */}
          {resolvedIsAdmin && (
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-xl bg-rose-500/15 px-3 py-2 text-sm font-semibold text-rose-300 hover:bg-rose-500/25 transition-colors"
            >
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}

          {/* Cart */}
          <Link
            href="/cart"
            className="relative flex items-center gap-2 rounded-xl border border-white/10 bg-slate-800 px-3 py-2 text-sm text-white hover:bg-slate-700 transition-colors"
          >
            <ShoppingCart className="h-4 w-4" />
            Cart
            {resolvedCart > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-500 px-1.5 text-[10px] font-bold text-white">
                {resolvedCart}
              </span>
            )}
          </Link>

          {/* Auth */}
          {resolvedUser ? (
            <button
              onClick={() => { logout(); router.push("/"); }}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Link>
              <Link
                href="/register"
                className="flex items-center gap-1.5 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                Join Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="ml-auto flex items-center gap-2 md:hidden">
          <Link
            href="/cart"
            className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-800"
          >
            <ShoppingCart className="h-4 w-4" />
            {resolvedCart > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                {resolvedCart}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-slate-800"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* ── Mobile drawer ── */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
          menuOpen ? "max-h-[90vh]" : "max-h-0"
        }`}
      >
        <div className="border-t border-white/10 bg-slate-900/95 backdrop-blur-sm">
          <div className="mx-auto max-w-[1500px] space-y-3 px-4 py-4 sm:px-6">

            {/* Mobile search */}
            <form onSubmit={handleSearchSubmit} className="flex overflow-hidden rounded-xl border border-white/10">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for anything…"
                className="w-full bg-slate-800 px-4 py-3 text-sm text-slate-100 outline-none placeholder:text-slate-500"
              />
              <button type="submit" className="bg-rose-500 px-4 text-white hover:bg-rose-600 transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </form>


            {/* Categories */}
            <div className="rounded-xl border border-white/10 bg-slate-800/50">
              <p className="border-b border-white/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                Categories
              </p>
              <div className="grid grid-cols-2 gap-1 p-2">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.id}`}
                    className="rounded-lg px-3 py-2.5 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors"
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Nav links */}
            <div className="grid gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-4 py-3 text-sm transition-colors ${
                    pathname === link.href
                      ? "bg-white/10 font-semibold text-white"
                      : "text-slate-300 hover:bg-white/8 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              {resolvedUser && (
                <Link href="/profile" className="rounded-xl px-4 py-3 text-sm text-slate-300 hover:bg-white/8 hover:text-white transition-colors">
                  My Account
                </Link>
              )}
              {resolvedIsAdmin && (
                <Link href="/admin" className="rounded-xl bg-rose-500/10 px-4 py-3 text-sm font-semibold text-rose-300">
                  Admin Dashboard
                </Link>
              )}
            </div>

            {/* Auth */}
            <div className="grid gap-2 border-t border-white/10 pt-3">
              {resolvedUser ? (
                <button
                  onClick={() => { logout(); router.push("/"); setMenuOpen(false); }}
                  className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm text-slate-300"
                >
                  <LogOut className="h-4 w-4" /> Sign Out
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link href="/login" className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-sm text-slate-300">
                    <LogIn className="h-4 w-4" /> Sign In
                  </Link>
                  <Link href="/register" className="flex items-center justify-center gap-2 rounded-xl bg-rose-500 py-3 text-sm font-bold text-white">
                    <UserPlus className="h-4 w-4" /> Join Free
                  </Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}