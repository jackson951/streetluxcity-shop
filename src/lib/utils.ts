const DEFAULT_USD_TO_ZAR = 18.5;
const parsedUsdToZar = Number(process.env.NEXT_PUBLIC_USD_TO_ZAR);
const USD_TO_ZAR = Number.isFinite(parsedUsdToZar) && parsedUsdToZar > 0 ? parsedUsdToZar : DEFAULT_USD_TO_ZAR;

export function formatCurrency(value: number, options?: { convertFromUsd?: boolean }) {
  const convertFromUsd = options?.convertFromUsd ?? true;
  const amount = convertFromUsd ? value * USD_TO_ZAR : value;
  return new Intl.NumberFormat("en-ZA", {
    style: "currency",
    currency: "ZAR"
  }).format(amount);
}

export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(date);
}

export const FALLBACK_PRODUCT_IMAGE =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80";

export function getProductImage(imageUrls?: string[]) {
  return imageUrls?.find((url) => typeof url === "string" && url.trim().length > 0) || FALLBACK_PRODUCT_IMAGE;
}

export function toSafeQuantity(value: number, max: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(Math.trunc(value), Math.max(1, max)));
}
