"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { ProductsPageProps } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import ProductFilters from "@/components/cart/ProductFilter";
import ProductsTable from "@/components/cart/ProductTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useNavigation } from "@/hooks/useNavigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  formatCurrency,
  getProductColorDisplayName,
  getProductColorHex,
} from "@/utils/productUtils";
import { UserProfile } from "@/types/user";
import { getProfile } from "../../login/actions";
import { CartProduct } from "@/types/cart";
import { useParams } from "next/navigation";
import { useRouter } from "next/router";

const ProductsPage: React.FC<ProductsPageProps> = ({}) => {
  const params = useParams<{ role: string }>();
  const role = params.role;
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
    updateProduct,
  } = useProducts();

  const { navigateTo } = useNavigation();

  const [updating, setUpdating] = useState(false);
  const { cart, addProduct } = useCart();
  const [popup, setPopup] = useState(false);
  const totalHarga = cart.reduce(
    (sum, cartProduct) => sum + cartProduct.price * cartProduct.quantity,
    0
  );

  const handleAddStockTiktok = async (cartProduct: CartProduct) => {
    try {
      await updateProduct(cartProduct.id as unknown as number, {
        tiktok_stock: cartProduct.initial_stock - cartProduct.quantity,
      });
    } catch (error) {
      throw error;
    }
  };
  const handleAddStockShopee = async (cartProduct: CartProduct) => {
    try {
      await updateProduct(cartProduct.id as unknown as number, {
        shopee_stock: cartProduct.initial_stock - cartProduct.quantity,
      });
    } catch (error) {
      throw error;
    }
  };
  const handleAddStockToko = async (cartProduct: CartProduct) => {
    try {
      await updateProduct(cartProduct.id as unknown as number, {
        toko_stock: cartProduct.initial_stock - cartProduct.quantity,
      });
    } catch (error) {
      throw error;
    }
  };

  const handleUpdate = () => {
    setUpdating(true);
    try {
      for (const cartProduct of cart) {
        if (role === "tiktok") {
          handleAddStockTiktok(cartProduct);
        } else if (role === "shopee") {
          handleAddStockShopee(cartProduct);
        } else {
          handleAddStockToko(cartProduct);
        }
      }
      setPopup(true);
    } catch (error) {
      alert("Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

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
      {popup && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(49,49,49,0.8)",
          }}
        >
          <div className="bg-white flex flex-col gap-3 p-10 rounded-md items-center justify-center">
            <h1>Berhasil</h1>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                onClick={() => {
                  window.location.reload();
                }}
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}
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
            role={role}
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
                      <TableHead>Warna</TableHead>
                      <TableHead>Jumlah</TableHead>
                      <TableHead>Harga</TableHead>
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
                      cart.map((cartProduct, index) => (
                        <TableRow key={index}>
                          <TableCell>#{cartProduct.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div
                                className="w-4 h-4 rounded-full border border-gray-300"
                                style={{
                                  backgroundColor: getProductColorHex(
                                    cartProduct.color
                                  ),
                                }}
                                title={getProductColorDisplayName(
                                  cartProduct.color
                                )}
                              />
                              <span>
                                {getProductColorDisplayName(cartProduct.color)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>{cartProduct.quantity}</TableCell>
                          <TableCell>
                            {formatCurrency(
                              cartProduct.price * cartProduct.quantity
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
              <div className="flex flex-row justify-between">
                <h1>TOTAL: {formatCurrency(totalHarga)}</h1>
                <Button disabled={cart.length == 0} onClick={handleUpdate}>
                  {updating ? "Loading" : "Checkout"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
