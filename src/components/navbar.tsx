"use client";

import { useAuth } from "@/contexts/auth-context";
import { useCart } from "@/contexts/cart-context";
import { LogIn, LogOut, Shield, ShoppingBag, ShoppingCart, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { cart } = useCart();
  const router = useRouter();
  const cartQuantity = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight text-brand-700">
          <ShoppingBag className="h-5 w-5" />
          ShopFlow
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/">Products</Link>
          <Link href="/orders">Orders</Link>
          {isAdmin && (
            <Link href="/admin" className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-brand-700">
              <Shield className="h-4 w-4" />
              Admin
            </Link>
          )}
          <Link href="/cart" className="inline-flex items-center gap-1">
            <ShoppingCart className="h-4 w-4" />
            Cart
            <span className="rounded bg-slate-200 px-1 text-xs">{cartQuantity}</span>
          </Link>

          {user ? (
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </Link>
              <Link href="/register" className="inline-flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
