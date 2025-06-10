import { useState, useEffect } from 'react';
import { Product, StockFilter } from '@/types/product';
import { SupabaseService, createSupabaseService } from '@/services/supabaseService';
import { applyAllFilters } from '@/utils/productFilters';
import { calculateProductStats, getUniqueColors } from '@/utils/productUtils';

interface UseProductsProps {
  supabaseUrl?: string;
  supabaseKey?: string;
}

export const useProducts = ({ supabaseUrl, supabaseKey }: UseProductsProps = {}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const supabaseService = createSupabaseService(supabaseUrl, supabaseKey);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await supabaseService.fetchProducts();
      setProducts(data);
      setFilteredProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever products or filter values change
  useEffect(() => {
    const filtered = applyAllFilters(products, searchTerm, colorFilter, stockFilter);
    setFilteredProducts(filtered);
  }, [products, searchTerm, colorFilter, stockFilter]);

  // Load data on hook initialization
  useEffect(() => {
    fetchProducts();
  }, []);

  // Computed values
  const uniqueColors = getUniqueColors(products);
  const stats = calculateProductStats(products);

  return {
    // Data
    products,
    filteredProducts,
    
    // Loading states
    loading,
    error,
    
    // Filter states
    searchTerm,
    colorFilter,
    stockFilter,
    
    // Filter setters
    setSearchTerm,
    setColorFilter,
    setStockFilter,
    
    // Computed values
    uniqueColors,
    stats,
    
    // Actions
    fetchProducts,
    supabaseService, // Expose service for additional operations
  };
};