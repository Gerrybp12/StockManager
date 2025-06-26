// Cart
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/types/product";
import {
  formatCurrency,
  getStockDisplay,
  getProductColorHex,
  getProductColorDisplayName,
} from "@/utils/productUtils";
import { CartProduct } from "@/types/cart";

interface ProductsTableProps {
  products: Product[];
  totalProducts: number;
  role: string;
  loading: boolean;
  addProduct: (
    id: string,
    quantity: number,
    initial_stock: number,
    price: number,
    color: string
  ) => void;
  cart: CartProduct[];
}

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 20, 50, 100];

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  totalProducts,
  role,
  loading,
  addProduct,
  cart,
}) => {
  const tiktok = role === "tiktok";
  const shopee = role === "shopee";
  const toko = role === "toko";
  const [popup, setPopup] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [productDipilih, setProductDipilih] = useState<Product>();
  const [confirm, setConfirm] = useState(false);
  const [produkAda, setProdukAda] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Pagination calculations
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = products.slice(startIndex, endIndex);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const handleProdukDouble = () => {
    setConfirm(true);
    setProdukAda(false);
  };

  const handlePopup = (product: Product) => {
    if (cart[product.id] && !confirm) {
      setProdukAda(true);
    }
    setConfirm(false);
    setProductDipilih(product);
    setPopup(true);
  };

  const stock = tiktok
    ? productDipilih?.tiktok_stock
    : shopee
    ? productDipilih?.shopee_stock
    : productDipilih?.toko_stock;

  const addToCart = () => {
    if (productDipilih !== undefined) {
      const jumlah = parseInt(quantity);
      const stok = tiktok
        ? productDipilih.tiktok_stock
        : shopee
        ? productDipilih.shopee_stock
        : productDipilih.toko_stock;
      if (jumlah !== 0) {
        if (jumlah <= stok) {
          addProduct(
            String(productDipilih.id),
            jumlah,
            stock ?? 0,
            productDipilih.price,
            productDipilih.color
          );
        } else {
          alert("jumlah melebihi batas stok");
        }
      } else {
        alert("jumlah tidak boleh 0");
      }
    } else {
      alert("terjadi kesalahan saat mengambil product");
    }
    setPopup(false);
    setConfirm(false);
  };

  // Pagination functions
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
      {popup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(49,49,49,0.8)",
          }}
        >
          <div className="bg-white flex flex-col gap-3 p-10 rounded-md items-center justify-center">
            <h1>Add to Cart</h1>
            <input
              type="number"
              placeholder="Masukkan jumlah"
              className="border p-2 rounded"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setPopup(false)}
              >
                Cancel
              </Button>
              <Button onClick={addToCart}>Add Product</Button>
            </div>
          </div>
        </div>
      )}
      {produkAda && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(49,49,49,0.8)",
          }}
        >
          <div className="bg-white flex flex-col gap-3 p-10 rounded-md items-center justify-center">
            <h1>Produk sudah ada</h1>
            <div className="flex flex-row gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setProdukAda(false);
                  setPopup(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleProdukDouble}>Ubah jumlah</Button>
            </div>
          </div>
        </div>
      )}
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Products List</CardTitle>
            <CardDescription>
              Showing {startIndex + 1}-{Math.min(endIndex, products.length)} of{" "}
              {products.length} products
              {totalProducts !== products.length && ` (${totalProducts} total)`}
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
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Price</TableHead>
                {tiktok && (
                  <TableHead className="text-center">TikTok Stock</TableHead>
                )}
                {shopee && (
                  <TableHead className="text-center">Shopee Stock</TableHead>
                )}
                {toko && (
                  <TableHead className="text-center">Toko Stock</TableHead>
                )}
                <TableHead>Color</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentProducts.length === 0 ? (
                // Add a unique key here for the "No products found" row
                <TableRow key="no-products-found">
                  <TableCell
                    colSpan={10}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No products found.
                  </TableCell>
                </TableRow>
              ) : (
                currentProducts.map((product) => {
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
                        RF{product.product_id}
                      </TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      {tiktok && (
                        <TableCell className="text-center">
                          <span className={tiktokStockDisplay.className}>
                            {tiktokStockDisplay.value}
                          </span>
                        </TableCell>
                      )}
                      {shopee && (
                        <TableCell className="text-center">
                          <span className={shopeeStockDisplay.className}>
                            {shopeeStockDisplay.value}
                          </span>
                        </TableCell>
                      )}
                      {toko && (
                        <TableCell className="text-center">
                          <span className={tokoStockDisplay.className}>
                            {tokoStockDisplay.value}
                          </span>
                        </TableCell>
                      )}
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
                      <TableCell className="text-center">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePopup(product)}
                          className="h-8 w-8 p-0"
                        >
                          <Plus className="h-4 w-4" />
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
  );
};

export default ProductsTable;