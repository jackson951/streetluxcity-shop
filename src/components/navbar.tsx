"use client";

import { api } from "@/lib/api";
import { Category } from "@/lib/types";
import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { ChevronDown, LogIn, LogOut, Menu, Shield, ShoppingBag, ShoppingCart, UserRound, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function Navbar() {
  const { user, isAdmin, hasAdminRole, viewMode, toggleViewMode, logout } = useAuth();
  const { cartQuantity } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const navLinks = [
    { href: "/", label: "Products" },
    { href: "/orders", label: "Orders" }
  ];

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

  const resolvedPathname = hydrated ? pathname : "";
  const resolvedUser = hydrated ? user : null;
  const resolvedIsAdmin = hydrated ? isAdmin : false;
  const resolvedHasAdminRole = hydrated ? hasAdminRole : false;
  const resolvedViewMode = hydrated ? viewMode : "CUSTOMER";
  const resolvedCartQuantity = hydrated ? cartQuantity : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 rounded-lg px-1 py-1 text-brand-700">
          <span className="rounded-lg bg-brand-100 p-1.5">
            <ShoppingBag className="h-4 w-4" />
          </span>
          <span className="text-sm font-semibold tracking-tight sm:text-base">StreetLuxCity</span>
        </Link>

        <nav className="hidden items-center gap-2 text-sm md:flex">
          {resolvedHasAdminRole ? (
            <button
              onClick={toggleViewMode}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-brand-700 hover:bg-brand-100"
            >
              {resolvedViewMode === "ADMIN" ? "Switch to Customer View" : "Switch to Admin View"}
            </button>
          ) : null}
          <div className="relative">
            <button
              onClick={() => setCategoryMenuOpen((v) => !v)}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 transition ${
                resolvedPathname.startsWith("/categories/") ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
              }`}
              aria-expanded={categoryMenuOpen}
              aria-haspopup="menu"
            >
              Categories
              <ChevronDown className={`h-4 w-4 transition ${categoryMenuOpen ? "rotate-180" : ""}`} />
            </button>
            {categoryMenuOpen ? (
              <div className="absolute left-0 top-12 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                <div className="max-h-80 overflow-auto pr-1">
                  {categories.map((category) => (
                    <Link
                      key={category.id}
                      href={`/categories/${category.id}`}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {category.name}
                    </Link>
                  ))}
                  {!categories.length ? <p className="px-3 py-2 text-xs text-slate-500">No categories available.</p> : null}
                </div>
              </div>
            ) : null}
          </div>
          {navLinks.map((link) => {
            const active = resolvedPathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 transition ${
                  active ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          {resolvedUser ? (
            <Link href="/profile" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-slate-700 hover:bg-slate-100">
              <UserRound className="h-4 w-4" />
              Profile
            </Link>
          ) : null}
          {resolvedIsAdmin ? (
            <Link href="/admin" className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-3 py-2 text-brand-700">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          ) : null}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link href="/cart" className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
            <ShoppingCart className="h-4 w-4" />
            Cart
            <span className="rounded bg-slate-200 px-1.5 text-xs">{resolvedCartQuantity}</span>
          </Link>
          {resolvedUser ? (
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700">
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </>
          )}
        </div>

        <button
          className="inline-flex items-center rounded-lg border border-slate-300 p-2 text-slate-700 md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

        <div className={`${menuOpen ? "max-h-[80vh] border-t border-slate-200 py-3" : "max-h-0"} overflow-hidden transition-all md:hidden`}>
        <div className="mx-auto grid max-w-7xl gap-2 px-4">
          {resolvedHasAdminRole ? (
            <button
              onClick={toggleViewMode}
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-left text-sm font-medium text-brand-700"
            >
              {resolvedViewMode === "ADMIN" ? "Customer View" : "Admin View"}
            </button>
          ) : null}
          <div className="rounded-lg border border-slate-200">
            <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Categories</p>
            <div className="grid gap-1 px-2 pb-2">
              {categories.slice(0, 8).map((category) => (
                <Link
                  key={category.id}
                  href={`/categories/${category.id}`}
                  className="rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                >
                  {category.name}
                </Link>
              ))}
              {!categories.length ? <p className="px-3 py-2 text-xs text-slate-500">No categories available.</p> : null}
            </div>
          </div>
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              {link.label}
            </Link>
          ))}
          {resolvedUser ? (
            <Link href="/profile" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
              Profile
            </Link>
          ) : null}
          {resolvedIsAdmin ? (
            <Link href="/admin" className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-2 text-sm text-brand-700">
              Admin Dashboard
            </Link>
          ) : null}
          <Link href="/cart" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
            Cart ({resolvedCartQuantity})
          </Link>
          {resolvedUser ? (
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-left text-sm text-slate-700"
            >
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                Login
              </Link>
              <Link href="/register" className="rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
