import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Filter, Palette } from "lucide-react";
import { StockFilter } from "@/types/product";
import { getColorOptions } from "@/lib/colors";

interface ProductFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  colorFilter: string;
  onColorFilterChange: (value: string) => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  searchTerm,
  onSearchChange,
  colorFilter,
  onColorFilterChange,
}) => {
  const colorOptions = getColorOptions();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductFilters;
