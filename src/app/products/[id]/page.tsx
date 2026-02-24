"use client";

import { useCart } from "@/contexts/cart-context";
import { useAuth } from "@/contexts/auth-context";
import { api } from "@/lib/api";
import { Product } from "@/lib/types";
import { formatCurrency, getProductImage, toSafeQuantity } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProductDetailPage() {
  const params = useParams<{ id: string }>();
  const { addItem, mutating } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      setMessage("Invalid product id.");
      setLoading(false);
      return;
    }
    setLoading(true);
    api
      .getProduct(id)
      .then((data) => {
        setProduct(data);
        setQty(toSafeQuantity(1, data.stockQuantity));
      })
      .catch((err) => setMessage((err as Error).message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) return <div className="rounded-xl bg-white p-4">Loading product...</div>;
  if (!product) return <div className="rounded-xl bg-white p-4">Product not found.</div>;

  const inStock = product.active && product.stockQuantity > 0;
  const safeQty = toSafeQuantity(qty, product.stockQuantity);

  return (
    <section className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-3">
        <img src={getProductImage(product.imageUrls)} alt={product.name} className="h-96 w-full rounded-2xl object-cover" />
        <div className="grid grid-cols-3 gap-2">
          {(product.imageUrls?.length ? product.imageUrls : [getProductImage(product.imageUrls)]).map((img, i) => (
            <img key={i} src={img} alt={`${product.name}-${i}`} className="h-24 w-full rounded-lg object-cover" />
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-sm text-slate-500">{product.category.name}</p>
        <h1 className="mt-1 text-3xl font-semibold">{product.name}</h1>
        <p className="mt-4 text-slate-700">{product.description}</p>
        <p className="mt-6 text-2xl font-bold text-brand-700">{formatCurrency(product.price)}</p>
        <p className="mt-1 text-sm text-slate-500">Stock: {product.stockQuantity}</p>

        <div className="mt-6 flex items-center gap-3">
          <input
            type="number"
            min={1}
            max={Math.max(1, product.stockQuantity)}
            value={qty}
            onChange={(e) => setQty(toSafeQuantity(Number(e.target.value), product.stockQuantity))}
            className="w-24 rounded-lg border border-slate-300 px-3 py-2"
            disabled={!inStock || mutating}
          />
          <button
            onClick={async () => {
              if (!inStock) return setMessage("This product is currently out of stock.");
              if (!user?.customerId) return setMessage("Login as customer to add items.");
              try {
                await addItem(product.id, safeQty);
                setMessage("Added to cart.");
              } catch (err) {
                setMessage((err as Error).message);
              }
            }}
            disabled={!inStock || mutating}
            className="rounded-lg bg-brand-600 px-4 py-2 text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {inStock ? "Add to cart" : "Out of stock"}
          </button>
        </div>

        {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      </div>
    </section>
  );
}
