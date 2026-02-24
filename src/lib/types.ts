export type Category = {
  id: number;
  name: string;
  description?: string;
};

export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stockQuantity: number;
  active: boolean;
  imageUrls: string[];
  category: Category;
};

export type CartItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Cart = {
  id: number;
  customerId: number;
  items: CartItem[];
  totalAmount: number;
};

export type OrderItem = {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
};

export type Order = {
  id: number;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  customerId: number;
  items: OrderItem[];
  customerName?: string;
  customerEmail?: string;
  customer?: {
    id: number;
    fullName?: string;
    email?: string;
  };
};

export type AuthUser = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  customerId: number | null;
};

export type AuthResponse = {
  tokenType: string;
  accessToken: string;
  accessTokenExpiresInSeconds: number;
  refreshToken: string;
  user: AuthUser;
};

export type AdminUser = {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
  enabled?: boolean;
  accountNonLocked?: boolean;
  accountNonExpired?: boolean;
  credentialsNonExpired?: boolean;
  createdAt?: string;
  updatedAt?: string;
};
