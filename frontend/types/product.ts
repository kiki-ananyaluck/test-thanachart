export interface Product {
  id: string;
  name: string;
  price: number;
  description?: string;
  stockQuantity: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ProductsResponse {
  items: Product[];
  totalItems: number;
  pageNumber: number;
  pageSize: number;
}
