// Product-related TypeScript interfaces and types

export interface Product {
  id: number;
  product_id: string;
  price: number;
  total_stock: number;
  tiktok_stock: number;
  shopee_stock: number;
  toko_stock: number;
  color: string;
  created_at: string;
}

// Remove the ProductsPageProps interface since it's not needed for Next.js page components
// The component will use useParams() to get the role parameter

export interface StockStatus {
  label: string;
  variant: "default" | "destructive" | "secondary";
}

export type ColorFilter = string;
export type StockFilter = "all" | "available" | "low" | "out";