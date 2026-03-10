import CategoryDetailPage from "./category-page-client";

export async function generateStaticParams() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/categories`);
    const categories = await res.json();
    return categories.map((category: { id: string }) => ({ id: category.id }));
  } catch (e) {
    console.error('generateStaticParams failed:', e);
    return [];
  }
}

export default function CategoryPage() {
  return <CategoryDetailPage />;
}