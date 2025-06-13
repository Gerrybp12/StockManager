"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { ProductsPageProps } from "@/types/product";
import { useProducts } from "@/hooks/useProducts";
import ProductFilters from "@/components/cart/ProductFilter";
import ProductsTable from "@/components/cart/ProductTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCart } from "@/hooks/useCart";
import { useNavigation } from "@/hooks/useNavigation";
import { FloatingNavigation } from "@/components/ui/floating-buttons";
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
import { CartProduct } from "@/types/cart";
import { useParams } from "next/navigation";
import { useLog } from "@/hooks/useLog";

const ProductsPage: React.FC<ProductsPageProps> = ({}) => {
  const params = useParams<{ role: string }>();
  const role = params.role;
  const { newLog } = useLog(false);

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

  const { refresh, isLoading } = useNavigation();
  const [updating, setUpdating] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { cart, addProduct } = useCart();

  const totalHarga = cart.reduce(
    (sum, cartProduct) => sum + cartProduct.price * cartProduct.quantity,
    0
  );

  const handleAddStockTiktok = async (cartProduct: CartProduct) => {
    await updateProduct(cartProduct.id as unknown as number, {
      tiktok_stock: cartProduct.initial_stock - cartProduct.quantity,
    });
  };

  const handleAddStockShopee = async (cartProduct: CartProduct) => {
    await updateProduct(cartProduct.id as unknown as number, {
      shopee_stock: cartProduct.initial_stock - cartProduct.quantity,
    });
  };

  const handleAddStockToko = async (cartProduct: CartProduct) => {
    await updateProduct(cartProduct.id as unknown as number, {
      toko_stock: cartProduct.initial_stock - cartProduct.quantity,
    });
  };

  const handleRefresh = () => {
    fetchProducts();
    refresh();
  };

  const handleCheckout = async () => {
    setUpdating(true);
    try {
      const promises = cart.map(async (cartProduct) => {
        if (role === "tiktok") {
          await handleAddStockTiktok(cartProduct);
        } else if (role === "shopee") {
          await handleAddStockShopee(cartProduct);
        } else {
          await handleAddStockToko(cartProduct);
        }

        newLog(
          "Pembelian di " + role,
          `Pengurangan stok ${role} produk ${cartProduct.id} dari ${
            cartProduct.initial_stock
          } menjadi ${cartProduct.initial_stock - cartProduct.quantity}`
        );
      });

      await Promise.all(promises);
      setShowSuccessModal(true);
    } catch (error) {
      console.error("Failed to update stock:", error);
      // You might want to show a proper error toast here
      alert("Failed to update stock");
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <FloatingNavigation />
        <div className="container mx-auto p-6 pt-24">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Error loading products: {error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <FloatingNavigation />

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-sm mx-4">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Checkout Berhasil!
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Stok produk telah berhasil diperbarui.
              </p>
              <Button onClick={handleCloseModal} className="w-full">
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto p-6 pt-24 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Cart - {role?.toUpperCase()}
            </h1>
            <p className="text-gray-600 mt-1">Kelola keranjang belanja Anda</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={loading || isLoading("refresh")}
            variant="outline"
            className="gap-2"
          >
            <RefreshCcw
              className={`h-4 w-4 ${
                loading || isLoading("refresh") ? "animate-spin" : ""
              }`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Products Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl">Pilih Produk</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProductFilters
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  colorFilter={colorFilter}
                  onColorFilterChange={setColorFilter}
                />
                <ProductsTable
                  products={filteredProducts}
                  totalProducts={stats.totalProducts}
                  loading={loading}
                  role={role}
                  addProduct={addProduct}
                  cart={cart}
                />
              </CardContent>
            </Card>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-sm sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-xl flex items-center justify-between">
                  Keranjang
                  <span className="text-sm font-normal bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {cart.length} item{cart.length !== 1 ? "s" : ""}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5-5M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z"
                        />
                      </svg>
                    </div>
                    <p>Keranjang masih kosong</p>
                    <p className="text-sm">
                      Tambahkan produk untuk melanjutkan
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {cart.map((cartProduct, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              #{cartProduct.id}
                            </span>
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{
                                backgroundColor: getProductColorHex(
                                  cartProduct.color
                                ),
                              }}
                              title={getProductColorDisplayName(
                                cartProduct.color
                              )}
                            />
                          </div>
                          <div className="text-xs text-gray-600">
                            {getProductColorDisplayName(cartProduct.color)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Qty: {cartProduct.quantity}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {formatCurrency(
                              cartProduct.price * cartProduct.quantity
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {cart.length > 0 && (
                  <div className="pt-4 border-t">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-semibold">Total:</span>
                      <span className="text-lg font-bold text-blue-600">
                        {formatCurrency(totalHarga)}
                      </span>
                    </div>
                    <Button
                      onClick={handleCheckout}
                      disabled={updating}
                      className="w-full"
                      size="lg"
                    >
                      {updating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                          Processing...
                        </>
                      ) : (
                        "Checkout"
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
