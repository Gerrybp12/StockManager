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

export interface ProductsPageProps {
  supabaseUrl?: string;
  supabaseKey?: string;
}

export interface StockStatus {
  label: string;
  variant: "default" | "destructive" | "secondary";
}

export type ColorFilter = string;
export type StockFilter = "all" | "available" | "low" | "out";
