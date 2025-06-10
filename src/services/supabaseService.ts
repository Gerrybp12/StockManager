import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Product } from '@/types/product';

export class SupabaseService {
  private supabase: SupabaseClient;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Add other product-related database operations here
  async createProduct(product: Omit<Product, 'id' | 'created_at'>): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await this.supabase
      .from("products")
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("products")
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}

// Factory function to create service instance
export const createSupabaseService = (supabaseUrl?: string, supabaseKey?: string) => {
  const url = supabaseUrl || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = supabaseKey || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  return new SupabaseService(url, key);
};