import { ProductDetailPageClient } from "./product-page-client";

export async function generateStaticParams() {
  console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL); // ← add this
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/products`);
    const products = await res.json();
    console.log('Products fetched:', products.length); // ← and this
    return products.map((product: { id: string }) => ({ id: product.id }));
  } catch (e) {
    console.error('generateStaticParams failed:', e); // ← and this
    return [];
  }
}

// ✅ params is now a Promise in Next.js 15+
export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProductDetailPageClient id={id} />;
}