import React, { use, useState } from "react";
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
import { Calendar, Edit, Plus } from "lucide-react";
import { Product } from "@/types/product";
import { useCart } from "@/hooks/useCart";
import {
  formatCurrency,
  formatDate,
  getTotalStockStatus,
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
    price: number,
    color: string
  ) => void;
  cart: CartProduct[];
}

const ProductsTable: React.FC<ProductsTableProps> = ({
  products,
  totalProducts,
  role,
  loading,
  addProduct,
  cart,
}) => {
  const router = useRouter();
  const tiktok = role === "tiktok";
  const shopee = role === "shopee";
  const toko = role === "toko";
  const [popup, setPopup] = useState(false);
  const [quantity, setQuantity] = useState("");
  const [productDipilih, setProductDipilih] = useState<Product>();
  const [confirm, setConfirm] = useState(false);
  const [produkAda, setProdukAda] = useState(false);

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
            productDipilih.price,
            productDipilih.color
          );
          alert("berhasil");
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
      </CardContent>
    </Card>
  );
};

export default ProductsTable;
