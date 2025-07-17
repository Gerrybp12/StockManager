"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Product } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import StatsCards from "@/components/dashboard/StatsCards";
import ProductFilters from "@/components/dashboard/ProductFilters";
import ProductsTable from "@/components/dashboard/ProductsTable";

const ProductsPage: React.FC = () => {
  // All hooks must be called at the top level, unconditionally
  const {
    filteredProducts,
    loading,
    error,
    searchTerm,
    colorFilter,
    stockFilter,
    setSearchTerm,
    setColorFilter,
    setStockFilter,
    stats,
    fetchProducts,
    updateProduct,
  } = useProducts();

  // Global loading state - tracks if any operation is in progress
  const [isAnyLoading, setIsAnyLoading] = React.useState(false);

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Error loading products: {error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  // Wrapper for updateProduct with global loading state
  const handleUpdateProduct = async (id: number, updates: Partial<Product>) => {
    setIsAnyLoading(true);
    try {
      const result = await updateProduct(id, updates);
      return result;
    } finally {
      setIsAnyLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Products</h1>
          <p className="text-muted-foreground">
            Manage and view your product inventory
          </p>
        </div>
        <Button onClick={fetchProducts} disabled={loading}>
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards {...stats} />

      {/* Filters */}
      <ProductFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        colorFilter={colorFilter}
        onColorFilterChange={setColorFilter}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
      />

      {/* Products Table */}
      <ProductsTable
        products={filteredProducts}
        totalProducts={stats.totalProducts}
        loading={loading}
        updateProduct={handleUpdateProduct}
        isAnyLoading={isAnyLoading}
      />
    </div>
  );
};

export default ProductsPage;