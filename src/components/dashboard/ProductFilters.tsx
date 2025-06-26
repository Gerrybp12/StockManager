import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Filter,
  Palette,
  X,
} from "lucide-react";
import { StockFilter } from '@/types/product';
import { getColorOptions } from '@/lib/colors';

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  colorFilter: string;
  onColorFilterChange: (value: string) => void;
  stockFilter: StockFilter;
  onStockFilterChange: (value: StockFilter) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  colorFilter,
  onColorFilterChange,
  stockFilter,
  onStockFilterChange,
}) => {
  const colorOptions = getColorOptions();
  
  // Check if any filters are active
  const hasActiveFilters = searchTerm !== '' || colorFilter !== 'all' || stockFilter !== 'all';
  
  // Clear all filters function
  const clearAllFilters = () => {
    onSearchChange('');
    onColorFilterChange('all');
    onStockFilterChange('all');
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="h-8 px-3"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by product ID (e.g., RF001, 001)..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
              />
            </div>
          </div>

          <Select value={colorFilter} onValueChange={onColorFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Palette className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by color" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Colors</SelectItem>
              {colorOptions.map((color) => (
                <SelectItem key={color.key} value={color.key}>
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: color.hex }}
                    />
                    {color.displayName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={stockFilter} onValueChange={onStockFilterChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by stock" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stock</SelectItem>
              <SelectItem value="available">In Stock</SelectItem>
              <SelectItem value="low">Low Stock</SelectItem>
              <SelectItem value="out">Out of Stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;