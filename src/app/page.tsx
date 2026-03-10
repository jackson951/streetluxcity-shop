"use client";

import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Category, Product } from "@/lib/types";
import { 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Star, 
  Truck, 
  Zap,
  Sparkles,
  Gift,
  Clock,
  CheckCircle,
  ChevronRight,
  ShoppingBag
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { formatCurrency } from "@/lib/utils";
import toast from "react-hot-toast";

// ─── Native detection hook ───────────────────────────────────────────────────
function useIsNative() {
  const [isNative, setIsNative] = useState(false);
  useEffect(() => {
    setIsNative(!!(window as any).Capacitor?.isNativePlatform());
  }, []);
  return isNative;
}

// ─── Data ────────────────────────────────────────────────────────────────────
const CATEGORY_IMAGES: Record<string, string> = {
  electronics:     "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=800&q=80",
  clothing:        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  fashion:         "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&q=80",
  shoes:           "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  footwear:        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80",
  furniture:       "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80",
  "home & living": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  home:            "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&q=80",
  beauty:          "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  cosmetics:       "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&q=80",
  sports:          "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
  fitness:         "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
  food:            "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
  grocery:         "https://images.unsplash.com/photo-1543168256-418811576931?w=800&q=80",
  toys:            "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80",
  kids:            "https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=800&q=80",
  books:           "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80",
  stationery:      "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800&q=80",
  garden:          "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&q=80",
  automotive:      "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80",
  pets:            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80",
  jewelry:         "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&q=80",
  accessories:     "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80",
  bags:            "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80",
  health:          "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=800&q=80",
};

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80",
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80",
  "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=800&q=80",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&q=80",
  "https://images.unsplash.com/photo-1619033218078-7db8f53d4b7b?w=800&q=80",
];

function getCategoryImage(name: string, index: number): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(CATEGORY_IMAGES)) {
    if (key.includes(k) || k.includes(key)) return v;
  }
  return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
}

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ target }: { target: number }) {
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (started.current || target === 0) return;
    started.current = true;
    const duration = 1500;
    const start = performance.now();
    function animate(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, [target]);

  return <>{display.toLocaleString()}</>;
}

// ─── Trust badge ─────────────────────────────────────────────────────────────
function TrustBadge({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="group flex items-start gap-3 p-3 rounded-xl hover:bg-white/5 transition-all duration-300">
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${color} group-hover:scale-110 transition-transform duration-300`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-bold text-white">{title}</p>
        <p className="text-xs text-white/70">{description}</p>
      </div>
    </div>
  );
}

// ─── Product card ─────────────────────────────────────────────────────────────
function ProductCard({ product, index, isNative }: { product: Product; index: number; isNative: boolean }) {
  const inStock = product.active && product.stockQuantity > 0;
  const discount = ((product.name.length + product.category.name.length) % 22) + 8;

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toast.success('✨ Added to your wishlist!', { duration: 2500, position: 'bottom-right', icon: '💖' });
  };

  return (
    <article
      className="group relative overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
      style={{ animation: 'fadeSlideUp 0.6s ease both', animationDelay: `${index * 80}ms` }}
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className={`relative overflow-hidden ${isNative ? 'h-40' : 'h-56'}`}>
          <Image
            src={product.imageUrls?.[0] || "/placeholder-product.jpg"}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            unoptimized={true}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <span className="absolute top-3 left-3 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-2.5 py-0.5 text-[10px] font-bold text-white shadow-lg">
            Save {discount}%
          </span>
          {!inStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-sm">
              <span className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-slate-700 shadow-lg">
                🔔 Notify Me
              </span>
            </div>
          )}
          {/* Wishlist — hidden on native (touch targets need more space) */}
          {!isNative && (
            <button
              onClick={handleWishlist}
              aria-label="Add to wishlist"
              className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-50 hover:scale-110 active:scale-95"
            >
              <Heart className="h-4 w-4 text-rose-500" />
            </button>
          )}
          {/* Quick add — web only */}
          {inStock && !isNative && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toast.success('🛒 Added to cart!', { duration: 2000, position: 'bottom-right' });
              }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-bold text-white opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:bg-rose-600"
            >
              <ShoppingBag className="h-3.5 w-3.5" /> Quick Add
            </button>
          )}
        </div>

        {/* Info */}
        <div className={`space-y-2 ${isNative ? 'p-3' : 'p-5'}`}>
          <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
            {product.category.name}
          </p>
          <h3 className="line-clamp-2 text-sm font-bold text-slate-900 group-hover:text-rose-600 transition-colors leading-tight">
            {product.name}
          </h3>
          {/* Stars — web only to save space on native */}
          {!isNative && (
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`h-3 w-3 ${i < 4 ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
              ))}
              <span className="ml-1 text-xs text-slate-500">(4.8)</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-1">
            <span className="text-base font-extrabold text-slate-900">
              {formatCurrency(product.price)}
            </span>
            {inStock ? (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                <CheckCircle className="h-3 w-3" /> In stock
              </span>
            ) : (
              <span className="text-[10px] font-medium text-slate-400">Out of stock</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

// ─── Category tile ────────────────────────────────────────────────────────────
function CategoryTile({
  category,
  count,
  image,
  large = false,
}: {
  category: Category;
  count: number;
  image: string;
  large?: boolean;
}) {
  return (
    <Link href={`/categories/${category.id}`} className="group relative block h-full w-full overflow-hidden rounded-3xl">
      <div className="absolute inset-0">
        <Image
          src={image}
          alt={category.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-110"
          sizes="(max-width: 768px) 50vw, 33vw"
          unoptimized={true}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>
      <div className="relative h-full flex flex-col justify-end p-4 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-widest text-white/60 mb-1">
          {count} items
        </p>
        <h3 className={`font-display font-black text-white leading-tight ${large ? "text-2xl" : "text-base"}`}>
          {category.name}
        </h3>
        <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/90 group-hover:text-rose-300 transition-colors">
          Shop now <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
        </span>
      </div>
      <Sparkles className="absolute top-3 right-3 h-4 w-4 text-white/0 group-hover:text-white/80 transition-all duration-300" />
    </Link>
  );
}

// ─── Web hero ─────────────────────────────────────────────────────────────────
function WebHero({ categories, products }: { categories: Category[]; products: Product[] }) {
  return (
    <section className="relative overflow-hidden rounded-3xl px-6 py-16 sm:py-24 lg:px-16 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
      <div aria-hidden className="pointer-events-none absolute top-1/2 right-0 h-80 w-80 rounded-full bg-purple-500/20 blur-3xl animate-pulse delay-1000" />
      <div aria-hidden className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-amber-500/15 blur-3xl animate-pulse delay-500" />
      <div aria-hidden className="absolute right-20 top-16 h-12 w-12 rounded-2xl border border-white/10 bg-white/5 animate-float-slow" />
      <div aria-hidden className="absolute right-32 bottom-20 h-8 w-8 rounded-xl border border-rose-500/20 bg-rose-500/10 animate-float-fast" />

      <div className="relative grid gap-12 lg:grid-cols-[1.2fr_1fr] items-center">
        <div className="space-y-8" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
          <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-5 py-2 text-xs font-bold uppercase tracking-wider text-rose-300">
            <Zap className="h-3.5 w-3.5" /> South Africa's Favourite Store
          </span>
          <h1 className="font-display text-5xl font-black leading-[1.1] text-white sm:text-6xl xl:text-7xl">
            Find your<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
              happy place.
            </span>
          </h1>
          <p className="max-w-lg text-base text-white/70 leading-relaxed">
            Discover thousands of amazing products, unbeatable deals, and lightning-fast delivery.
            Shopping made simple, joyful, and totally you.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-rose-500/30 hover:shadow-rose-500/50 transition-all hover:scale-105 active:scale-100"
            >
              Start Exploring <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/categories"
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Browse Categories
            </Link>
          </div>
          <div className="grid gap-3 pt-4 sm:grid-cols-3">
            <TrustBadge icon={Truck}       color="bg-emerald-500/20 text-emerald-400" title="Free Delivery"      description="On orders over R1200" />
            <TrustBadge icon={ShieldCheck} color="bg-sky-500/20 text-sky-400"         title="Secure Shopping"    description="Your info is safe with us" />
            <TrustBadge icon={Heart}       color="bg-rose-500/20 text-rose-400"       title="Love It Guarantee"  description="Easy returns, always" />
          </div>
        </div>

        <div className="flex flex-col gap-5 lg:items-end" style={{ animation: "fadeSlideUp 0.8s ease 0.2s both" }}>
          <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md p-7 space-y-6 w-full max-w-xs">
            <p className="text-xs font-bold uppercase tracking-widest text-white/50">Why shoppers love us</p>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Happy customers</span>
                <span className="font-display text-3xl font-black text-white"><AnimatedNumber target={10000} />+</span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Categories to love</span>
                <span className="font-display text-3xl font-black text-white"><AnimatedNumber target={categories.length} /></span>
              </div>
              <div className="h-px bg-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/80">Years of trust</span>
                <span className="font-display text-3xl font-black text-white">5+</span>
              </div>
            </div>
            <Link
              href="/products"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-xs font-bold text-slate-900 hover:bg-rose-50 transition-colors shadow-md"
            >
              See today's deals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Mobile hero ──────────────────────────────────────────────────────────────
function MobileHero({ user }: { user: any }) {
  return (
    <section className="relative overflow-hidden rounded-3xl px-6 py-12 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-rose-500/20 blur-3xl animate-pulse" />
      <div className="relative space-y-5" style={{ animation: "fadeSlideUp 0.8s ease both" }}>
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/15 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-300">
          <Zap className="h-3.5 w-3.5" /> South Africa's Favourite Store
        </span>
        <h1 className="font-display text-4xl font-black leading-[1.1] text-white">
          Find your<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-pink-400">
            happy place.
          </span>
        </h1>
        <p className="text-sm text-white/70 leading-relaxed max-w-xs">
          Thousands of amazing products and unbeatable deals, right in your pocket.
        </p>
        <div className="flex gap-3">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-rose-500/30"
          >
            Shop Now <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 rounded-2xl border border-white/20 px-6 py-3.5 text-sm font-bold text-white"
          >
            Categories
          </Link>
        </div>
        {!user && (
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-xs font-semibold text-white/70 hover:text-white transition-colors"
          >
            New here? Create a free account <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
    </section>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function HomePage() {
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading]     = useState(true);
  const { user }    = useAuth();
  const isNative    = useIsNative();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.listProducts().catch(err => {
        console.error('Failed to load products:', err);
        toast.error('Could not load products. Please try again.', { duration: 4000, position: 'top-right' });
        return [];
      }),
      api.listCategories().catch(err => {
        console.error('Failed to load categories:', err);
        toast.error('Could not load categories. Please try again.', { duration: 4000, position: 'top-right' });
        return [];
      }),
    ])
      .then(([p, c]) => { setProducts(p); setCategories(c); })
      .finally(() => setLoading(false));
  }, []);

  const featuredProducts = useMemo(() => products.slice(0, isNative ? 6 : 8), [products, isNative]);
  const displayedCats    = categories.slice(0, 6);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <span className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-rose-200 border-t-rose-500" />
            <Sparkles className="absolute inset-0 m-auto h-5 w-5 text-rose-500 animate-ping" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Getting everything ready for you… ✨</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@400;500;700&display=swap');
        .font-display { font-family: 'Playfair Display', serif; }
        .font-body    { font-family: 'DM Sans', sans-serif; }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-20px) rotate(4deg); }
        }
        @keyframes float-fast {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-14px) rotate(-3deg); }
        }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-fast { animation: float-fast 5s ease-in-out infinite; }
        html { scroll-behavior: smooth; }
      `}</style>

      <div className={`font-body ${isNative ? 'space-y-10' : 'space-y-24'}`}>

        {/* ── HERO ── */}
        {isNative
          ? <MobileHero user={user} />
          : <WebHero categories={categories} products={products} />
        }

        {/* ── CATEGORIES ── */}
        <section className="px-4 sm:px-6">
          <div className={`flex items-end justify-between gap-4 ${isNative ? 'mb-5' : 'mb-12'}`}>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Shop by mood</p>
              <h2 className={`font-display font-black text-slate-900 leading-tight ${isNative ? 'text-2xl' : 'text-4xl'}`}>
                {isNative ? 'Categories' : "What's calling your name today?"}
              </h2>
            </div>
            <Link href="/categories" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors shrink-0">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          {displayedCats.length > 0 && (
            <>
              {/* Web desktop — hero layout */}
              {!isNative && (
                <div className="hidden lg:flex gap-5" style={{ height: 480 }}>
                  <div className="w-80 shrink-0 h-full">
                    <CategoryTile
                      category={displayedCats[0]}
                      count={products.filter(p => p.category.id === displayedCats[0].id).length}
                      image={getCategoryImage(displayedCats[0].name, 0)}
                      large
                    />
                  </div>
                  <div className="flex-1 grid grid-cols-3 gap-5" style={{ gridTemplateRows: "1fr 1fr" }}>
                    {displayedCats.slice(1).map((cat, i) => (
                      <div key={cat.id} className="h-full">
                        <CategoryTile
                          category={cat}
                          count={products.filter(p => p.category.id === cat.id).length}
                          image={getCategoryImage(cat.name, i + 1)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mobile grid — compact tiles on native */}
              <div className={`grid grid-cols-2 gap-3 sm:grid-cols-3 ${!isNative ? 'lg:hidden' : ''}`}>
                {displayedCats.map((cat, i) => (
                  <div key={cat.id} style={{ height: isNative ? 130 : 240 }}>
                    <CategoryTile
                      category={cat}
                      count={products.filter(p => p.category.id === cat.id).length}
                      image={getCategoryImage(cat.name, i)}
                    />
                  </div>
                ))}
              </div>
            </>
          )}
        </section>

        {/* ── FEATURED PRODUCTS ── */}
        <section className="px-4 sm:px-6">
          <div className={`flex items-end justify-between gap-4 ${isNative ? 'mb-5' : 'mb-12'}`}>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-rose-500">Just for you</p>
              <h2 className={`font-display font-black text-slate-900 leading-tight ${isNative ? 'text-2xl' : 'text-4xl'}`}>
                {isNative ? 'Featured Products' : 'Handpicked with love today'}
              </h2>
            </div>
            <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-slate-600 hover:text-rose-600 transition-colors shrink-0">
              See all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className={`grid gap-3 ${isNative ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'}`}>
            {featuredProducts.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} isNative={isNative} />
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-900 px-8 py-4 text-sm font-bold text-slate-900 hover:bg-slate-900 hover:text-white transition-all"
            >
              Explore all products <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* ── SPECIAL OFFERS BANNER ── */}
        <section className="px-4 sm:px-6">
          <div
            className="relative overflow-hidden rounded-3xl text-center text-white"
            style={{
              background: "linear-gradient(135deg, #1e1b4b 0%, #be123c 50%, #1e1b4b 100%)",
              padding: isNative ? '2.5rem 1.5rem' : '3.5rem 2rem',
            }}
          >
            <Gift className="absolute -top-8 -left-8 h-24 w-24 text-white/10 animate-float-slow" />
            {!isNative && <Sparkles className="absolute -bottom-6 right-12 h-16 w-16 text-white/15 animate-float-fast" />}

            <div className="relative space-y-5 max-w-2xl mx-auto">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-5 py-2 text-xs font-bold uppercase tracking-wider">
                🎉 Limited Time Magic
              </span>
              <h2 className={`font-display font-black leading-tight ${isNative ? 'text-2xl' : 'text-4xl'}`}>
                Treat yourself to something special
              </h2>
              {!isNative && (
                <p className="text-sm text-white/80 leading-relaxed max-w-lg mx-auto">
                  New arrivals drop every week. Be the first to discover amazing finds at prices that make you smile.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                <Link
                  href="/products"
                  className="rounded-2xl bg-white px-8 py-4 text-sm font-bold text-slate-900 hover:bg-rose-50 hover:scale-105 transition-all shadow-xl"
                >
                  See New Arrivals
                </Link>
                {!user && (
                  <Link
                    href="/register"
                    className="rounded-2xl border-2 border-white/30 px-8 py-4 text-sm font-bold text-white hover:bg-white/10 transition-colors"
                  >
                    {isNative ? 'Create Account' : 'Join & Get 10% Off'}
                  </Link>
                )}
              </div>
              {!isNative && (
                <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs text-white/70">
                  <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" /> Orders ship in 24h</span>
                  <span className="flex items-center gap-1.5"><CheckCircle className="h-3.5 w-3.5" /> 30-day easy returns</span>
                  <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Secure checkout</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS — web only ── */}
        {!isNative && (
          <section className="px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-rose-500">Loved by shoppers</p>
              <h2 className="font-display text-4xl font-black text-slate-900">Real people, real smiles</h2>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { name: "Thandi M.",  text: "Found the perfect gift in minutes! Delivery was super fast too. 🎁", rating: 5 },
                { name: "James K.",   text: "Prices are amazing and the app is so easy to use. Highly recommend! ⭐", rating: 5 },
                { name: "Lerato P.",  text: "Customer service helped me find exactly what I needed. Thank you! 💙", rating: 5 },
              ].map((review, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
                  style={{ animation: 'fadeSlideUp 0.5s ease both', animationDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-1 mb-3">
                    {[...Array(review.rating)].map((_, j) => (
                      <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed mb-4">"{review.text}"</p>
                  <p className="text-xs font-bold text-slate-900">— {review.name}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── APP DOWNLOAD CTA — web only ── */}
        {!isNative && (
          <section className="px-4 sm:px-6">
            <div className="rounded-3xl bg-gradient-to-r from-slate-50 to-rose-50 border border-slate-200 p-8 sm:p-12 text-center">
              <div className="max-w-2xl mx-auto space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-bold text-rose-700">
                  <Sparkles className="h-3.5 w-3.5" /> Shop on the go
                </div>
                <h3 className="font-display text-3xl font-black text-slate-900">
                  Take us with you, everywhere
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto">
                  Get exclusive app-only deals, instant notifications for your wishlist, and checkout in seconds.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
                  <button
                    onClick={() => toast('📱 App coming soon! Stay tuned.', { duration: 3000, position: 'bottom-right', icon: '🚀' })}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    App Store
                  </button>
                  <button
                    onClick={() => toast('📱 App coming soon! Stay tuned.', { duration: 3000, position: 'bottom-right', icon: '🚀' })}
                    className="flex items-center justify-center gap-3 rounded-2xl bg-slate-900 px-6 py-3.5 text-sm font-bold text-white hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.9,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                    </svg>
                    Google Play
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

      </div>
    </>
  );
}