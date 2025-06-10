import { Product, StockStatus } from '@/types/product';
import { getColorHex, getColorDisplayName } from '@/lib/colors';

// Utility functions for product-related operations

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString("id-ID", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export const getStockStatus = (stock: number): StockStatus => {
  if (stock === 0)
    return { label: "Out of Stock", variant: "destructive" as const };
  if (stock < 10)
    return { label: "Low Stock", variant: "secondary" as const };
  return { label: "In Stock", variant: "default" as const };
};

// Helper function to get stock status for total stock
export const getTotalStockStatus = (product: Product): StockStatus => {
  return getStockStatus(product.total_stock);
};

// Helper function to get stock display with color coding
export const getStockDisplay = (stock: number): { value: number; className: string } => {
  return {
    value: stock,
    className: stock === 0 
      ? "text-red-600 font-medium" 
      : stock < 10 
        ? "text-yellow-600 font-medium" 
        : "text-green-600 font-medium"
  };
};

export const getUniqueColors = (products: Product[]): string[] => {
  return Array.from(new Set(products.map((p) => p.color)));
};

export const calculateProductStats = (products: Product[]) => {
  const totalProducts = products.length;
  const totalValue = products.reduce((sum, p) => sum + p.price * p.total_stock, 0);
  const lowStockCount = products.filter((p) => p.total_stock < 10).length;
  const outOfStockCount = products.filter((p) => p.total_stock === 0).length;

  return {
    totalProducts,
    totalValue,
    lowStockCount,
    outOfStockCount,
  };
};

// Color utility functions
export const getProductColorHex = (colorKey: string): string => {
  return getColorHex(colorKey);
};

export const getProductColorDisplayName = (colorKey: string): string => {
  return getColorDisplayName(colorKey);
};