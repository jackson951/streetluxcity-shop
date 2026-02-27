"use client";

import { useAuth } from "@/contexts/auth-context";
import { Headset, ShieldCheck, Truck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const year = new Date().getFullYear();

export function Footer() {
  const { user, hasAdminRole, logout } = useAuth();
  const router = useRouter();
  const isLoggedIn = Boolean(user);

  return (
    <footer className="mt-8 border-t border-slate-300 bg-slate-950 text-slate-200">
      <div className="mx-auto grid w-full max-w-[1500px] gap-4 border-b border-white/10 px-3 py-4 sm:grid-cols-3 sm:px-5 lg:px-8">
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <Truck className="h-4 w-4 text-emerald-400" />
          Fast dispatch and tracked delivery
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <ShieldCheck className="h-4 w-4 text-brand-400" />
          Secure checkout and payment session
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
          <Headset className="h-4 w-4 text-amber-300" />
          Dedicated order and returns support
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-[1500px] gap-8 px-3 py-10 sm:grid-cols-2 lg:grid-cols-4 sm:px-5 lg:px-8">
        <div>
          <h3 className="text-lg font-semibold text-white">StreetLuxCity Marketplace</h3>
          <p className="mt-2 text-sm text-slate-400">Scalable ecommerce demo with enterprise-ready customer, checkout, and admin workflows.</p>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Shop</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            <li><Link href="/" className="hover:text-white">Marketplace home</Link></li>
            {isLoggedIn ? <li><Link href="/cart" className="hover:text-white">Cart</Link></li> : null}
            {isLoggedIn ? <li><Link href="/orders" className="hover:text-white">Orders</Link></li> : null}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Account</h4>
          <ul className="mt-3 space-y-2 text-sm text-slate-400">
            {isLoggedIn ? (
              <>
                <li><Link href="/profile" className="hover:text-white">Profile</Link></li>
                {hasAdminRole ? <li><Link href="/admin" className="hover:text-white">Admin dashboard</Link></li> : null}
                <li>
                  <button
                    onClick={() => {
                      logout();
                      router.push("/");
                    }}
                    className="text-left hover:text-white"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li><Link href="/login" className="hover:text-white">Sign in</Link></li>
                <li><Link href="/register" className="hover:text-white">Create account</Link></li>
              </>
            )}
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">Contact</h4>
          <p className="mt-3 text-sm text-slate-400">Support desk for checkout and fulfillment queries.</p>
          <p className="mt-1 text-sm font-semibold text-white">support@streetluxcity.local</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-full max-w-[1500px] flex-wrap items-center justify-between gap-3 px-3 py-4 text-xs text-slate-400 sm:px-5 lg:px-8">
          <p>{year} StreetLuxCity. All rights reserved.</p>
          <p>Built for production-focused ecommerce demos.</p>
        </div>
      </div>
    </footer>
  );
}
