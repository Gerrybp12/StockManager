// Product-related TypeScript interfaces and types

export interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
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