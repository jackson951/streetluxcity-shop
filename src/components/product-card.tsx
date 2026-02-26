"use client";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { Product } from "@/lib/types";
import { formatCurrency, getProductImage } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export function ProductCard({ product }: { product: Product }) {
  const { addItem, mutating } = useCart();
  const { user, canUseCustomerFeatures, hasAdminRole, viewMode } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const inStock = product.active && product.stockQuantity > 0;

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
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(22,76,193,0.18)]">
      <Link href={`/products/${product.id}`} className="block">
        <Image
          src={getProductImage(product.imageUrls)}
          alt={product.name}
          width={640}
          height={480}
          className="h-48 w-full object-cover"
        />
      </Link>
      <div className="space-y-2 p-4">
        <p className="text-xs uppercase tracking-wide text-slate-500">{product.category.name}</p>
        <Link href={`/products/${product.id}`} className="line-clamp-1 text-lg font-semibold text-slate-900">
          {product.name}
        </Link>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-base font-bold text-brand-700">{formatCurrency(product.price)}</span>
          <button
            onClick={handleAdd}
            disabled={!inStock || mutating}
            className="rounded-lg bg-brand-600 px-3 py-2 text-sm text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {inStock ? "Add" : "Out of stock"}
          </button>
        </div>
        {message && <p className="text-xs text-slate-500">{message}</p>}
      </div>
    </article>
  );
}
