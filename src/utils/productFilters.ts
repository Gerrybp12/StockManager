import { Product, StockFilter } from '@/types/product';

// Product filtering utilities

export const filterProductsBySearch = (products: Product[], searchTerm: string): Product[] => {
  if (!searchTerm) return products;
  
  return products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

export const filterProductsByColor = (products: Product[], colorFilter: string): Product[] => {
  if (colorFilter === "all") return products;
  
  return products.filter(
    (product) => product.color.toLowerCase() === colorFilter.toLowerCase()
  );
};

export const filterProductsByStock = (products: Product[], stockFilter: StockFilter): Product[] => {
  if (stockFilter === "all") return products;
  
  switch (stockFilter) {
    case "low":
      return products.filter((product) => product.stock < 10);
    case "out":
      return products.filter((product) => product.stock === 0);
    case "available":
      return products.filter((product) => product.stock > 0);
    default:
      return products;
  }
};

export const applyAllFilters = (
  products: Product[],
  searchTerm: string,
  colorFilter: string,
  stockFilter: StockFilter
): Product[] => {
  let filtered = products;
  
  filtered = filterProductsBySearch(filtered, searchTerm);
  filtered = filterProductsByColor(filtered, colorFilter);
  filtered = filterProductsByStock(filtered, stockFilter);
  
  return filtered;
};