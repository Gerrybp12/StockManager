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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Calendar,
  Package,
  ChevronLeft,
  ChevronRight,
  Plus,
} from "lucide-react";
import { Product } from "@/types/product";
import {
  formatCurrency,
  formatDate,
  getTotalStockStatus,
  getStockDisplay,
  getProductColorHex,
  getProductColorDisplayName,
} from "@/utils/productUtils";
import { useLog } from "@/hooks/useLog";

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

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  totalProducts,
  loading,
  updateProduct,
  isAnyLoading = false,
}) => {
  const { newLog } = useLog(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [stockValues, setStockValues] =
    useState<StockUpdate>(INITIAL_STOCK_VALUES);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [addStockProduct, setAddStockProduct] = useState<Product | null>(null);
  const [addStockAmount, setAddStockAmount] = useState(0);
  const [isAddingStock, setIsAddingStock] = useState(false);

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const isModalOpen = selectedProduct !== null;
  const isAddStockModalOpen = addStockProduct !== null;
  const totalStockToDeduct = Object.values(stockValues).reduce(
    (sum, val) => sum + val,
    0
  );
  const newTotalStock = selectedProduct
    ? Math.max(0, selectedProduct.total_stock - totalStockToDeduct)
    : 0;
  const canUpdate =
    totalStockToDeduct > 0 &&
    totalStockToDeduct <= (selectedProduct?.total_stock || 0);
  const canAddStock = addStockAmount > 0;

  const openModal = (product: Product) => {
    setSelectedProduct(product);
    setStockValues(INITIAL_STOCK_VALUES);
  };

  const closeModal = () => {
    setSelectedProduct(null);
    setStockValues(INITIAL_STOCK_VALUES);
  };

  const openAddStockModal = (product: Product) => {
    console.log("Opening add stock modal for product:", product.product_id); // Debug log
    setAddStockProduct(product);
    setAddStockAmount(0);
  };

  const closeAddStockModal = () => {
    console.log("Closing add stock modal"); // Debug log
    setAddStockProduct(null);
    setAddStockAmount(0);
  };

  const handleStockChange = (platform: keyof StockUpdate, value: string) => {
    setStockValues((prev) => ({
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
      newLog(
        "Pemindahan stok",
        `Stok gudang: ${newTotalStock}, stok tiktok: ${
          selectedProduct.tiktok_stock + stockValues.tiktok
        }, stok shopee: ${
          selectedProduct.shopee_stock + stockValues.shopee
        }, stok toko: ${selectedProduct.toko_stock + stockValues.toko}`
      );
      closeModal();
    } catch (error) {
      console.error("Failed to update stock:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddStock = async () => {
    if (!addStockProduct || !canAddStock) return;

    setIsAddingStock(true);
    try {
      const newTotalStock = addStockProduct.total_stock + addStockAmount;
      await updateProduct(addStockProduct.id as number, {
        total_stock: newTotalStock,
      });
      newLog(
        "Penambahan stok",
        `Menambah ${addStockAmount} stok ke ${addStockProduct.product_id}. Total stok sekarang: ${newTotalStock}`
      );
      closeAddStockModal();
    } catch (error) {
      console.error("Failed to add stock:", error);
    } finally {
      setIsAddingStock(false);
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

  const handleItemsPerPageChange = (value: string) => {
    const newItemsPerPage = parseInt(value);
    setItemsPerPage(newItemsPerPage);
    // Reset to first page when changing items per page
    setCurrentPage(1);
  };

  // Reset to first page when products change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [products.length]);

  if (loading) {
    return (
      <>
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
      </>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Products List</CardTitle>
              <CardDescription>
                Showing {startIndex + 1}-{Math.min(endIndex, products.length)}{" "}
                of {products.length} products
                {totalProducts !== products.length &&
                  ` (${totalProducts} total)`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Label
                htmlFor="items-per-page"
                className="text-sm whitespace-nowrap"
              >
                Show:
              </Label>
              <Select
                value={itemsPerPage.toString()}
                onValueChange={handleItemsPerPageChange}
              >
                <SelectTrigger id="items-per-page" className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option} value={option.toString()}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Action Buttons Legend - Always visible */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
            <div className="text-sm font-medium mb-2">Action Buttons:</div>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                <span>Add Total Stock</span>
              </div>
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>Distribute Stock to Platforms</span>
              </div>
            </div>
          </div>

          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
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
                    <TableCell
                      colSpan={11}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  currentProducts.map((product, index) => {
                    // Create a unique key using multiple properties as fallback
                    const uniqueKey = product.id || `${product.product_id}-${startIndex + index}`;
                    
                    const stockStatus = getTotalStockStatus(product);
                    const stockDisplays = {
                      total: getStockDisplay(product.total_stock),
                      tiktok: getStockDisplay(product.tiktok_stock),
                      shopee: getStockDisplay(product.shopee_stock),
                      toko: getStockDisplay(product.toko_stock),
                    };

                    return (
                      <TableRow key={uniqueKey}>
                        <TableCell className="font-medium">
                          RF{product.product_id}
                        </TableCell>
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
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log(
                                  "Plus button clicked for product:",
                                  product.product_id
                                );
                                openAddStockModal(product);
                              }}
                              className="h-8 w-8 p-0"
                              title="Add Total Stock"
                              disabled={
                                isAnyLoading || isUpdating || isAddingStock
                              }
                            >
                              {isAddingStock &&
                              addStockProduct?.id === product.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Plus className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                openModal(product);
                              }}
                              className="h-8 w-8 p-0"
                              title="Distribute Stock"
                              disabled={
                                isAnyLoading || isUpdating || isAddingStock
                              }
                            >
                              {isUpdating &&
                              selectedProduct?.id === product.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                              ) : (
                                <Package className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
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
                  {/* Always show first page if not in visible range */}
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
                    .filter((page) => {
                      // If total pages <= 7, show all pages
                      if (totalPages <= 7) return true;

                      // Don't show first/last page here (handled separately)
                      if (page === 1 && currentPage > 3) return false;
                      if (page === totalPages && currentPage < totalPages - 2)
                        return false;

                      // Show current page and adjacent pages
                      return Math.abs(page - currentPage) <= 1;
                    })
                    .map((page) => (
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

                  {/* Always show last page if not in visible range */}
                  {currentPage < totalPages - 2 && totalPages > 7 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 text-muted-foreground">...</span>
                      )}
                      <Button
                        variant={
                          totalPages === currentPage ? "default" : "outline"
                        }
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

      {/* Add Stock Modal */}
      <Dialog
        open={isAddStockModalOpen}
        onOpenChange={(open) => {
          console.log("Add stock modal onOpenChange:", open);
          if (!isAddingStock && !isAnyLoading && !open) {
            closeAddStockModal();
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Stock - {addStockProduct?.product_id}
            </DialogTitle>
            <DialogDescription>
              Add stock to the total inventory. This will increase the total
              stock count.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Stock Info */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">
                Current Total Stock
              </div>
              <div className="text-2xl font-bold">
                {addStockProduct?.total_stock || 0}
              </div>
            </div>

            {/* Add Stock Input */}
            <div className="space-y-2">
              <Label htmlFor="add-stock-amount">Amount to Add</Label>
              <Input
                id="add-stock-amount"
                type="number"
                min="1"
                value={addStockAmount || ""}
                onChange={(e) =>
                  setAddStockAmount(parseInt(e.target.value) || 0)
                }
                placeholder="Enter amount to add"
                disabled={isAddingStock || isAnyLoading}
              />
            </div>

            {/* Preview */}
            {addStockAmount > 0 && (
              <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                <div className="text-sm font-medium text-green-800 mb-1">
                  Preview Changes
                </div>
                <div className="text-sm text-green-700">
                  <div>
                    Current stock:{" "}
                    <span className="font-medium">
                      {addStockProduct?.total_stock || 0}
                    </span>
                  </div>
                  <div>
                    Adding:{" "}
                    <span className="font-medium">+{addStockAmount}</span>
                  </div>
                  <div>
                    New total stock:{" "}
                    <span className="font-medium">
                      {(addStockProduct?.total_stock || 0) + addStockAmount}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={closeAddStockModal}
              disabled={isAddingStock || isAnyLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddStock}
              disabled={isAddingStock || isAnyLoading || !canAddStock}
              className="min-w-[100px]"
            >
              {isAddingStock ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Adding...
                </div>
              ) : (
                "Add Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stock Distribution Modal */}
      <Dialog
        open={isModalOpen}
        onOpenChange={(open) =>
          !isUpdating && !isAnyLoading && !open && closeModal()
        }
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Distribute Stock - {selectedProduct?.product_id}
            </DialogTitle>
            <DialogDescription>
              Distribute stock from total inventory to different platforms.
              Total stock will be reduced accordingly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Current Stock Info */}
            <div className="bg-muted p-3 rounded-lg">
              <div className="text-sm font-medium mb-2">Current Stock</div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  Total:{" "}
                  <span className="font-medium">
                    {selectedProduct?.total_stock || 0}
                  </span>
                </div>
                <div>
                  TikTok:{" "}
                  <span className="font-medium">
                    {selectedProduct?.tiktok_stock || 0}
                  </span>
                </div>
                <div>
                  Shopee:{" "}
                  <span className="font-medium">
                    {selectedProduct?.shopee_stock || 0}
                  </span>
                </div>
                <div>
                  Toko:{" "}
                  <span className="font-medium">
                    {selectedProduct?.toko_stock || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Stock Input Fields */}
            <div className="space-y-3">
              {(["tiktok", "shopee", "toko"] as const).map((platform) => (
                <div key={platform} className="space-y-2">
                  <Label htmlFor={`${platform}-stock`}>
                    Add to{" "}
                    {platform.charAt(0).toUpperCase() + platform.slice(1)} Stock
                  </Label>
                  <Input
                    id={`${platform}-stock`}
                    type="number"
                    min="0"
                    value={stockValues[platform]}
                    onChange={(e) =>
                      handleStockChange(platform, e.target.value)
                    }
                    placeholder="0"
                    disabled={isUpdating || isAnyLoading}
                  />
                </div>
              ))}
            </div>

            {/* Preview */}
            {totalStockToDeduct > 0 && (
              <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <div className="text-sm font-medium text-blue-800 mb-1">
                  Preview Changes
                </div>
                <div className="text-sm text-blue-700">
                  <div>
                    Stock to distribute:{" "}
                    <span className="font-medium">{totalStockToDeduct}</span>
                  </div>
                  <div>
                    New total stock:{" "}
                    <span className="font-medium">{newTotalStock}</span>
                  </div>
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
                  Error: Cannot distribute more stock than available (
                  {selectedProduct?.total_stock || 0})
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
                  Distributing...
                </div>
              ) : (
                "Distribute Stock"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ProductsTable;