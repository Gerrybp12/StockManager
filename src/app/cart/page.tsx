"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProductsPageProps } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import ProductFilters from "@/components/cart/ProductFilter";
import ProductsTable from "@/components/cart/ProductTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ProductsPage: React.FC<ProductsPageProps> = ({}) => {
  const {
    filteredProducts,
    loading,
    error,
    searchTerm,
    colorFilter,
    setSearchTerm,
    setColorFilter,
    stats,
    fetchProducts,
  } = useProducts();

  const { cart, addProduct } = useCart();

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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cart</h1>
          <p className="text-muted-foreground">checkout barang</p>
        </div>
        <Button onClick={fetchProducts} disabled={loading}>
          Refresh
        </Button>
      </div>

      <div className="flex flex-row">
        <div className="container mx-auto p-6 space-y-6">
          {/* Filters */}
          <ProductFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            colorFilter={colorFilter}
            onColorFilterChange={setColorFilter}
          />

          {/* Products Table */}
          <ProductsTable
            products={filteredProducts}
            totalProducts={stats.totalProducts}
            loading={loading}
            role="tiktok"
            addProduct={addProduct}
            cart={cart}
          />
        </div>
        <div className="container mx-auto p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Keranjang</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>{Object.keys(cart).length}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {Object.keys(cart).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={10}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No products found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      Object.entries(cart).map(([id, quantity]) => (
                        <TableRow key={id}>
                          <TableCell>#{id}</TableCell>
                          <TableCell>{quantity}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
