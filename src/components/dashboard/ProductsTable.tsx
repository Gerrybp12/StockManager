import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Package, ChevronLeft, ChevronRight } from "lucide-react";
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
  updateProduct: (id: number, updates: Partial<Product>) => Promise<Product>;
  isAnyLoading?: boolean;
}

interface StockUpdate {
  tiktok: number;
  shopee: number;
  toko: number;
}

const INITIAL_STOCK_VALUES: StockUpdate = {
  tiktok: 0,
  shopee: 0,
  toko: 0,
};

const ITEMS_PER_PAGE = 10;

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  totalProducts,
  loading,
  updateProduct,
  isAnyLoading = false,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockValues, setStockValues] = useState<StockUpdate>(INITIAL_STOCK_VALUES);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Pagination calculations
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentProducts = products.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const isModalOpen = selectedProduct !== null;
  const totalStockToDeduct = Object.values(stockValues).reduce((sum, val) => sum + val, 0);
  const newTotalStock = selectedProduct 
    ? Math.max(0, selectedProduct.total_stock - totalStockToDeduct)
    : 0;
  const canUpdate = totalStockToDeduct > 0 && 
    totalStockToDeduct <= (selectedProduct?.total_stock || 0);

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setStockValues(INITIAL_STOCK_VALUES);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setStockValues(INITIAL_STOCK_VALUES);
  };

  const handleStockChange = (platform: keyof StockUpdate, value: string) => {
    setStockValues(prev => ({
      ...prev,
      [platform]: parseInt(value) || 0,
    }));
  };

  const handleUpdateStock = async () => {
    if (!selectedProduct || !canUpdate) return;

    setIsUpdating(true);
    try {
      await updateProduct(selectedProduct.id as number, {
        tiktok_stock: selectedProduct.tiktok_stock + stockValues.tiktok,
        shopee_stock: selectedProduct.shopee_stock + stockValues.shopee,
        toko_stock: selectedProduct.toko_stock + stockValues.toko,
        total_stock: newTotalStock,
      });
      closeModal();
    } catch (error) {
      console.error('Failed to update stock:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevPage = () => {
    if (hasPrevPage) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToNextPage = () => {
    if (hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Reset to first page when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>Loading products...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }, (_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products List</CardTitle>
          <CardDescription>
            Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of {products.length} products
            {totalProducts !== products.length && ` (${totalProducts} total)`}
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
                  <TableHead className="text-center">TikTok</TableHead>
                  <TableHead className="text-center">Shopee</TableHead>
                  <TableHead className="text-center">Toko</TableHead>
                  <TableHead>Color</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product) => {
                    const stockStatus = getTotalStockStatus(product);
                    const stockDisplays = {
                      total: getStockDisplay(product.total_stock),
                      tiktok: getStockDisplay(product.tiktok_stock),
                      shopee: getStockDisplay(product.shopee_stock),
                      toko: getStockDisplay(product.toko_stock),
                    };

                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">#{product.id}</TableCell>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{formatCurrency(product.price)}</TableCell>
                        <TableCell className="text-center">
                          <span className={stockDisplays.total.className}>
                            {stockDisplays.total.value}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={stockDisplays.tiktok.className}>
                            {stockDisplays.tiktok.value}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={stockDisplays.shopee.className}>
                            {stockDisplays.shopee.value}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <span className={stockDisplays.toko.className}>
                            {stockDisplays.toko.value}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: getProductColorHex(product.color) }}
                              title={getProductColorDisplayName(product.color)}
                            />
                            <span>{getProductColorDisplayName(product.color)}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(product.created_at)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openModal(product)}
                            className="h-8 w-8 p-0"
                            title="Manage Stock"
                            disabled={isAnyLoading || isUpdating}
                          >
                            {isUpdating && selectedProduct?.id === product.id ? (
                              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                            ) : (
                              <Package className="h-4 w-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </div>
              
              <div className="flex items-center space-x-2">
                {/* Previous Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToPrevPage}
                  disabled={!hasPrevPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {/* Show first page */}
                  {currentPage > 3 && (
                    <>
                      <Button
                        variant={1 === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(1)}
                        className="h-8 w-8 p-0"
                      >
                        1
                      </Button>
                      {currentPage > 4 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                    </>
                  )}

                  {/* Show pages around current page */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      if (totalPages <= 7) return true;
                      if (page === 1 || page === totalPages) return false;
                      return Math.abs(page - currentPage) <= 1;
                    })
                    .map(page => (
                      <Button
                        key={page}
                        variant={page === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(page)}
                        className="h-8 w-8 p-0"
                      >
                        {page}
                      </Button>
                    ))}

                  {/* Show last page */}
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={totalPages === currentPage ? "default" : "outline"}
                        size="sm"
                        onClick={() => goToPage(totalPages)}
                        className="h-8 w-8 p-0"
                      >
                        {totalPages}
                      </Button>
                    </>
                  )}
                </div>

                {/* Next Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToNextPage}
                  disabled={!hasNextPage}
                  className="h-8 w-8 p-0"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stock Management Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !isUpdating && !isAnyLoading && !open && closeModal()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Manage Stock - {selectedProduct?.name}
            </DialogTitle>
            <DialogDescription>
              Add stock to different platforms. Total stock will be reduced accordingly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Stock Info */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Current Stock</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Total: <span className="font-medium">{selectedProduct?.total_stock || 0}</span></div>
                <div>TikTok: <span className="font-medium">{selectedProduct?.tiktok_stock || 0}</span></div>
                <div>Shopee: <span className="font-medium">{selectedProduct?.shopee_stock || 0}</span></div>
                <div>Toko: <span className="font-medium">{selectedProduct?.toko_stock || 0}</span></div>
              </div>
            </div>

            {/* Stock Input Fields */}
            <div className="space-y-3">
              {(["tiktok", "shopee", "toko"] as const).map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={`${platform}-stock`}>
                    Add to {platform.charAt(0).toUpperCase() + platform.slice(1)} Stock
                  </Label>
                  <Input
                    id={`${platform}-stock`}
                    type="number"
                    min="0"
                    value={stockValues[platform]}
                    onChange={(e) => handleStockChange(platform, e.target.value)}
                    placeholder="0"
                    disabled={isUpdating || isAnyLoading}
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            {totalStockToDeduct > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">Preview Changes</div>
                <div className="text-sm text-blue-700">
                  <div>Stock to distribute: <span className="font-medium">{totalStockToDeduct}</span></div>
                  <div>New total stock: <span className="font-medium">{newTotalStock}</span></div>
                </div>
                {newTotalStock === 0 && (
                  <div className="text-xs text-amber-600 mt-1">
                    Warning: Total stock will become 0
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {totalStockToDeduct > (selectedProduct?.total_stock || 0) && (
              <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                <div className="text-sm text-red-700">
                  Error: Cannot distribute more stock than available ({selectedProduct?.total_stock || 0})
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={closeModal}
              disabled={isUpdating || isAnyLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdateStock}
              disabled={isUpdating || isAnyLoading || !canUpdate}
              className="min-w-[100px]"
            >
              {isUpdating ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </div>
              ) : (
                "Update Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsTable;