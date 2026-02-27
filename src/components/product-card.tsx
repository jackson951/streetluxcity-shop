"use client";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/lib/types";
import { formatCurrency, getProductImage } from "@/lib/utils";
import { Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, mutating } = useCart();
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const inStock = product.active && product.stockQuantity > 0;
  const promoPercent = ((product.name.length + product.category.name.length) % 22) + 8;

  async function handleAdd() {
    if (!inStock) {
      setMessage("This product is currently out of stock.");
      return;
    }
    if (user && !canUseCustomerFeatures) {
      setMessage(
        hasAdminRole && viewMode === "ADMIN"
          ? "Switch to Customer View to add items."
          : "Login as customer to add items."
      );
      return;
    }
    try {
      await addItem(product.id, 1);
      setMessage("Added to cart.");
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_20px_35px_rgba(15,23,42,0.15)]">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative">
          <Image
            src={getProductImage(product.imageUrls)}
            alt={product.name}
            width={640}
            height={480}
            className="h-56 w-full object-cover transition duration-300 group-hover:scale-105"
          />
          <span className="absolute left-3 top-3 rounded-full bg-rose-600 px-2 py-1 text-xs font-semibold text-white">Save {promoPercent}%</span>
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-500">{product.category.name}</p>
          <p className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            4.8
          </p>
        </div>
        <Link href={`/products/${product.id}`} className="line-clamp-1 text-lg font-semibold text-slate-900">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${inStock ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
            {inStock ? "In stock" : "Out of stock"}
          </span>
        </div>
        <div className="pt-1">
          <button
            onClick={handleAdd}
            disabled={!inStock || mutating}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {inStock ? "Add to cart" : "Unavailable"}
          </button>
        </div>
        {message && <p className="text-xs text-slate-500">{message}</p>}
      </div>
    </article>
  );
}
