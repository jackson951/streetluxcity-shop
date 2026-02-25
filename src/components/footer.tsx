"use client";

import { useAuth } from "@/contexts/auth-context";
import Link from "next/link";
import { useRouter } from "next/navigation";

const year = new Date().getFullYear();

export function Footer() {
  const { user, hasAdminRole, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = Boolean(user);

  return (
    <footer className="mt-8 border-t border-slate-200/80 bg-white/80 backdrop-blur">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">StreetLuxCity</h3>
          <p className="mt-2 text-sm text-slate-600">Modern ecommerce storefront for products, carts, and orders.</p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link href="/" className="hover:text-brand-700">Products</Link></li>
            {isLoggedIn ? <li><Link href="/cart" className="hover:text-brand-700">Cart</Link></li> : null}
            {isLoggedIn ? <li><Link href="/orders" className="hover:text-brand-700">Orders</Link></li> : null}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {isLoggedIn ? (
              <>
                <li><Link href="/profile" className="hover:text-brand-700">Profile</Link></li>
                {hasAdminRole ? <li><Link href="/admin" className="hover:text-brand-700">Admin Dashboard</Link></li> : null}
                <li>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="text-left hover:text-brand-700"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-brand-700">Login</Link></li>
                <li><Link href="/register" className="hover:text-brand-700">Register</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-slate-900">Support</h4>
          <p className="mt-3 text-sm text-slate-600">Need help with an order?</p>
          <p className="mt-1 text-sm font-medium text-slate-800">support@StreetLuxCity.local</p>
        </div>
      </div>

      <div className="border-t border-slate-200/80">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 text-xs text-slate-500">
          <p>{year} StreetLuxCity. All rights reserved.</p>
          <p>Built for reliable, production-ready ecommerce.</p>
        </div>
      </div>
    </footer>
  );
}
