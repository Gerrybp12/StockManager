import { supabase } from "@/lib/supabaseClient";
import { Log } from "@/types/log";
import { Product } from "@/types/product";

// Product service functions
export const productService = {
  async fetchProducts(): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return data || [];
  },
  async fetchLogs(): Promise<Log[]> {
    const { data, error } = await supabase
      .from("log")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch log: ${error.message}`);
    }

    return data || [];
  },

  async fetchProductById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw new Error(`Failed to fetch product: ${error.message}`);
    }

    return data;
  },

  async createProduct(
    product: Omit<Product, "id" | "created_at">
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert([product])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create product: ${error.message}`);
    }

    return data;
  },

  async updateProduct(id: number, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update product: ${error.message}`);
    }

    return data;
  },

  async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      throw new Error(`Failed to delete product: ${error.message}`);
    }
  },

  async createMultipleProducts(
    products: Omit<Product, "id" | "created_at">[]
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .insert(products)
      .select();

    if (error) {
      throw new Error(`Failed to create products: ${error.message}`);
    }

    return data || [];
  },

  async fetchProductsPaginated(
    page: number = 0,
    limit: number = 10
  ): Promise<{
    data: Product[];
    count: number | null;
  }> {
    const from = page * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("products")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to fetch products: ${error.message}`);
    }

    return {
      data: data || [],
      count,
    };
  },

  async searchProducts(searchTerm: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(`Failed to search products: ${error.message}`);
    }

    return data || [];
  },
};
