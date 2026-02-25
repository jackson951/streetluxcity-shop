import {
  AdminUser,
  AdminUserUpdatePayload,
  AuthResponse,
  Cart,
  Category,
  CustomerProfile,
  Order,
  PaymentMethod,
  PaymentTransaction,
  Product
} from "@/lib/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/api/v1";
const GET_CACHE_TTL_MS = 60_000;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
};

const responseCache = new Map<string, CacheEntry<unknown>>();
const inFlightRequests = new Map<string, Promise<unknown>>();

function getCacheKey(path: string, method: Method, token?: string) {
  return `${method}:${path}:${token || ""}`;
}

function readCachedValue<T>(key: string): T | null {
  const entry = responseCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    responseCache.delete(key);
    return null;
  }
  return entry.value as T;
}

function writeCachedValue<T>(key: string, value: T) {
  responseCache.set(key, {
    value,
    expiresAt: Date.now() + GET_CACHE_TTL_MS
  });
}

function invalidateGetCache(prefixes: string[]) {
  for (const key of responseCache.keys()) {
    for (const prefix of prefixes) {
      if (key.startsWith(`GET:${prefix}:`)) {
        responseCache.delete(key);
        break;
      }
    }
  }

  for (const key of inFlightRequests.keys()) {
    for (const prefix of prefixes) {
      if (key.startsWith(`GET:${prefix}:`)) {
        inFlightRequests.delete(key);
        break;
      }
    }
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.message || `Request failed (${res.status})`);
  }

  if (res.status === 204) return {} as T;

  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) return {} as T;
  const text = await res.text();
  if (!text.trim()) return {} as T;
  return JSON.parse(text) as T;
}

async function request<T>(path: string, method: Method, token?: string, body?: unknown): Promise<T> {
  const cacheKey = getCacheKey(path, method, token);

  if (method === "GET") {
    const cached = readCachedValue<T>(cacheKey);
    if (cached) return cached;

    const pending = inFlightRequests.get(cacheKey);
    if (pending) return pending as Promise<T>;
  }

  const fetchPromise = fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    cache: "no-store"
  }).then((res) => parseResponse<T>(res));

  if (method === "GET") {
    const trackedPromise = fetchPromise
      .then((data) => {
        writeCachedValue(cacheKey, data);
        return data;
      })
      .finally(() => {
        inFlightRequests.delete(cacheKey);
      });

    inFlightRequests.set(cacheKey, trackedPromise as Promise<unknown>);
    return trackedPromise;
  }

  return fetchPromise;
}

export const api = {
  login: (email: string, password: string) =>
    request<AuthResponse>("/auth/login", "POST", undefined, { email, password }),
  register: (payload: { fullName: string; email: string; password: string; phone?: string; address?: string }) =>
    request<AuthResponse>("/auth/register", "POST", undefined, payload),
  me: (token: string) => request<AuthResponse["user"]>("/auth/me", "GET", token),
  getCustomer: (token: string, customerId: string) =>
    request<CustomerProfile>(`/customers/${customerId}`, "GET", token),
  updateCustomer: async (
    token: string,
    customerId: string,
    payload: { fullName: string; email: string; phone?: string; address?: string }
  ) => {
    const customer = await request<CustomerProfile>(`/customers/${customerId}`, "PUT", token, payload);
    invalidateGetCache([`/customers/${customerId}`]);
    return customer;
  },

  listProducts: () => request<Product[]>("/products", "GET"),
  getProduct: (id: string) => request<Product>(`/products/${id}`, "GET"),
  createProduct: async (token: string, payload: unknown) => {
    const created = await request<Product>("/products", "POST", token, payload);
    invalidateGetCache(["/products"]);
    return created;
  },
  updateProduct: async (token: string, productId: string, payload: unknown) => {
    const updated = await request<Product>(`/products/${productId}`, "PUT", token, payload);
    invalidateGetCache(["/products"]);
    return updated;
  },
  deleteProduct: async (token: string, productId: string) => {
    await request<void>(`/products/${productId}`, "DELETE", token);
    invalidateGetCache(["/products"]);
  },

  listCategories: () => request<Category[]>("/categories", "GET"),
  createCategory: async (token: string, payload: { name: string; description?: string }) => {
    const created = await request<Category>("/categories", "POST", token, payload);
    invalidateGetCache(["/categories", "/products"]);
    return created;
  },
  updateCategory: async (
    token: string,
    categoryId: string,
    payload: { name: string; description?: string }
  ) => {
    const updated = await request<Category>(`/categories/${categoryId}`, "PUT", token, payload);
    invalidateGetCache(["/categories", "/products"]);
    return updated;
  },
  deleteCategory: async (token: string, categoryId: string) => {
    await request<void>(`/categories/${categoryId}`, "DELETE", token);
    invalidateGetCache(["/categories", "/products"]);
  },
  adminListOrders: (token: string) => request<Order[]>("/admin/orders", "GET", token),
  adminListUsers: (token: string) => request<AdminUser[]>("/admin/users", "GET", token),
  adminSetUserAccess: async (token: string, userId: string, enabled: boolean) => {
    const updated = await request<AdminUser>(`/admin/users/${userId}/access?enabled=${enabled}`, "PATCH", token);
    invalidateGetCache(["/admin/users"]);
    return updated;
  },
  adminUpdateUser: async (token: string, userId: string, payload: AdminUserUpdatePayload) => {
    const updated = await request<AdminUser>(`/admin/users/${userId}`, "PUT", token, payload);
    invalidateGetCache(["/admin/users"]);
    return updated;
  },

  getCart: (token: string, customerId: string) => request<Cart>(`/customers/${customerId}/cart`, "GET", token),
  addToCart: async (token: string, customerId: string, productId: string, quantity: number) => {
    const cart = await request<Cart>(`/customers/${customerId}/cart/items`, "POST", token, { productId, quantity });
    invalidateGetCache([`/customers/${customerId}/cart`]);
    return cart;
  },
  updateCartItem: async (token: string, customerId: string, itemId: string, quantity: number) => {
    const cart = await request<Cart>(`/customers/${customerId}/cart/items/${itemId}`, "PATCH", token, { quantity });
    invalidateGetCache([`/customers/${customerId}/cart`]);
    return cart;
  },
  removeCartItem: async (token: string, customerId: string, itemId: string) => {
    const cart = await request<Cart>(`/customers/${customerId}/cart/items/${itemId}`, "DELETE", token);
    invalidateGetCache([`/customers/${customerId}/cart`]);
    return cart;
  },
  checkout: async (token: string, customerId: string) => {
    const order = await request<Order>(`/customers/${customerId}/orders/checkout`, "POST", token);
    invalidateGetCache([`/customers/${customerId}/cart`, `/customers/${customerId}/orders`, "/admin/orders"]);
    return order;
  },
  listOrders: (token: string, customerId: string) => request<Order[]>(`/customers/${customerId}/orders`, "GET", token),
  getOrder: (token: string, orderId: string) => request<Order>(`/orders/${orderId}`, "GET", token),

  listPaymentMethods: (token: string, customerId: string) =>
    request<PaymentMethod[]>(`/customers/${customerId}/payment-methods`, "GET", token),
  createPaymentMethod: async (
    token: string,
    customerId: string,
    payload: {
      provider?: "CARD";
      cardHolderName: string;
      cardNumber: string;
      brand?: string;
      expiryMonth: number;
      expiryYear: number;
      billingAddress?: string;
      defaultMethod?: boolean;
    }
  ) => {
    const method = await request<PaymentMethod>(`/customers/${customerId}/payment-methods`, "POST", token, payload);
    invalidateGetCache([`/customers/${customerId}/payment-methods`]);
    return method;
  },
  setDefaultPaymentMethod: async (token: string, customerId: string, paymentMethodId: string) => {
    const method = await request<PaymentMethod>(
      `/customers/${customerId}/payment-methods/${paymentMethodId}/default`,
      "PATCH",
      token
    );
    invalidateGetCache([`/customers/${customerId}/payment-methods`]);
    return method;
  },
  setPaymentMethodEnabled: async (token: string, customerId: string, paymentMethodId: string, enabled: boolean) => {
    const method = await request<PaymentMethod>(
      `/customers/${customerId}/payment-methods/${paymentMethodId}/access?enabled=${enabled}`,
      "PATCH",
      token
    );
    invalidateGetCache([`/customers/${customerId}/payment-methods`]);
    return method;
  },
  processOrderPayment: async (token: string, orderId: string, paymentMethodId: string, cvv: string) => {
    const payment = await request<PaymentTransaction>(`/orders/${orderId}/payments`, "POST", token, {
      paymentMethodId,
      cvv
    });
    invalidateGetCache([`/orders/${orderId}/payments`, `/orders/${orderId}`, "/admin/orders"]);
    return payment;
  },
  listOrderPayments: (token: string, orderId: string) =>
    request<PaymentTransaction[]>(`/orders/${orderId}/payments`, "GET", token),
  listCustomerPayments: (token: string, customerId: string) =>
    request<PaymentTransaction[]>(`/customers/${customerId}/payments`, "GET", token)
};
