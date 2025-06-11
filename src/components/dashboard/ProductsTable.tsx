import React from "react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Edit } from "lucide-react";
import { Product } from "@/types/product";
import {
  formatCurrency,
  formatDate,
  getTotalStockStatus,
  getStockDisplay,
  getProductColorHex,
  getProductColorDisplayName,
} from "@/utils/productUtils";

interface ProductsTableProps {
  products: Product[];
  totalProducts: number;
  loading: boolean;
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  totalProducts,
  loading,
}) => {
  const router = useRouter();

  const handleEdit = (productId: string | number) => {
    router.push(`/edit/${productId}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Products List</CardTitle>
        <CardDescription>
          {products.length} of {totalProducts} products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Total Stock</TableHead>
                <TableHead className="text-center">TikTok Stock</TableHead>
                <TableHead className="text-center">Shopee Stock</TableHead>
                <TableHead className="text-center">Toko Stock</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => {
                  const stockStatus = getTotalStockStatus(product);
                  const totalStockDisplay = getStockDisplay(
                    product.total_stock
                  );
                  const tiktokStockDisplay = getStockDisplay(
                    product.tiktok_stock
                  );
                  const shopeeStockDisplay = getStockDisplay(
                    product.shopee_stock
                  );
                  const tokoStockDisplay = getStockDisplay(product.toko_stock);

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        #{product.id}
                      </TableCell>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-center">
                        <span className={totalStockDisplay.className}>
                          {totalStockDisplay.value}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={tiktokStockDisplay.className}>
                          {tiktokStockDisplay.value}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={shopeeStockDisplay.className}>
                          {shopeeStockDisplay.value}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={tokoStockDisplay.className}>
                          {tokoStockDisplay.value}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-4 h-4 rounded-full border border-gray-300"
                            style={{
                              backgroundColor: getProductColorHex(
                                product.color
                              ),
                            }}
                            title={getProductColorDisplayName(product.color)}
                          />
                          <span>
                            {getProductColorDisplayName(product.color)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(product.created_at)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={stockStatus.variant}>
                          {stockStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(product.id)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
