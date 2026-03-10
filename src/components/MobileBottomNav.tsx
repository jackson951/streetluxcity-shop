'use client';

import { useIsNative } from '@/hooks/useNative';
import { useAuth } from '@/contexts/auth-context';
import { useCart } from '@/contexts/cart-context';
import { Home, ShoppingBag, Grid3x3, ShoppingCart, User, Package } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function MobileBottomNav() {
  const isNative = useIsNative();
  const { user } = useAuth();
  const { cartQuantity } = useCart();
  const pathname = usePathname();

  if (!isNative) return null;

  const cartCount = cartQuantity || 0;

  // ── Logged IN: Home, Products, Categories, Cart, Orders, Profile (6 tabs)
  // ── Logged OUT: Home, Products, Categories, Cart, Login (5 tabs)
  const tabs = user
    ? [
        { href: '/',           label: 'Home',       icon: Home },
        { href: '/products',   label: 'Products',   icon: ShoppingBag },
        { href: '/categories', label: 'Categories', icon: Grid3x3 },
        { href: '/cart',       label: 'Cart',       icon: ShoppingCart, badge: cartCount },
        { href: '/orders',     label: 'Orders',     icon: Package },
        { href: '/profile',    label: 'Profile',    icon: User },
      ]
    : [
        { href: '/',           label: 'Home',       icon: Home },
        { href: '/products',   label: 'Products',   icon: ShoppingBag },
        { href: '/categories', label: 'Categories', icon: Grid3x3 },
        { href: '/cart',       label: 'Cart',       icon: ShoppingCart, badge: cartCount },
        { href: '/login',      label: 'Login',      icon: User },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(({ href, label, icon: Icon, badge }) => {
          const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className="relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all"
            >
              <div className="relative flex h-6 w-6 items-center justify-center">
                <Icon
                  className={`h-5 w-5 transition-colors ${isActive ? 'text-rose-500' : 'text-slate-400'}`}
                  strokeWidth={isActive ? 2.5 : 1.8}
                />
                {badge != null && badge > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white">
                    {badge > 9 ? '9+' : badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-rose-500' : 'text-slate-400'}`}>
                {label}
              </span>
              {isActive && (
                <span className="absolute -top-0.5 left-1/2 -translate-x-1/2 h-1 w-1 rounded-full bg-rose-500" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}