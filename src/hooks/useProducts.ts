import { useState, useEffect } from "react";
import { Product, StockFilter } from "@/types/product";
import { productService } from "@/services/supabaseService";
import { applyAllFilters } from "@/utils/productFilters";
import { calculateProductStats, getUniqueColors } from "@/utils/productUtils";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilterredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [colorFilter, setColorFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.fetchProducts();
      setProducts(data);
      setFilterredProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'created_at'>) => {
    try {
      setError(null);
      const newProduct = await productService.createProduct(product);
      setProducts(prev => [newProduct, ...prev]);
      return newProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to create product";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const updateProduct = async (id: number, updates: Partial<Product>) => {
    try {
      setError(null);
      const updatedProduct = await productService.updateProduct(id, updates);
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      );
      return updatedProduct;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update product";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteProduct = async (id: number) => {
    try {
      setError(null);
      await productService.deleteProduct(id);
      setProducts(prev => prev.filter(product => product.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete product";
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const searchProducts = async (term: string) => {
    try {
      setLoading(true);
      setError(null);
      const data = await productService.searchProducts(term);
      setProducts(data);
      setFilterredProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to search products");
    } finally {
      setLoading(false);
    }
  };

  // Apply filters whenever products or filter values change
  useEffect(() => {
    const filtered = applyAllFilters(
      products,
      searchTerm,
      colorFilter,
      stockFilter
    );
    setFilterredProducts(filtered);
  }, [products, searchTerm, colorFilter, stockFilter]);

  // Load data on hook initialization
  useEffect(() => {
    fetchProducts();
  }, []);

  // Computed values
  const uniqueColors = getUniqueColors(products);
  const stats = calculateProductStats(products);

  // Clear filters
  const clearFilters = () => {
    setSearchTerm("");
    setColorFilter("all");
    setStockFilter("all");
  };

  // Refresh data
  const refreshProducts = () => {
    fetchProducts();
  };

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
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    clearFilters,
    refreshProducts,
  };
};