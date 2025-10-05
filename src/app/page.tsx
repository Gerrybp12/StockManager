"use client";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import colors from "@/lib/colors";
import { getProductColorDisplayName } from "@/utils/productUtils";
import { useNavigation } from "@/hooks/useNavigation";
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  BarChart3,
  ShoppingBag,
  Store,
  Truck,
  History,
} from "lucide-react";
import { FloatingNavigation } from "@/components/ui/floating-buttons";
import { useLog } from "@/hooks/useLog";

export default function Home() {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [price, setPrice] = useState("");
  const [potongan, setPotongan] = useState("");
  const [stock, setStock] = useState("");
  const [modal, setModal] = useState("");
  const [colorSelected, setColorSelected] = useState("burgundimaron");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [id, setId] = useState("");
  const [idValid, setIdValid] = useState(false);

  const supabase = createClient();

  // Fixed destructuring syntax
  const { navigateTo, isLoading, isAnyLoading } = useNavigation();
  const { newLog } = useLog(false);
  const colorKeys = Object.keys(colors);
  let colorIndex = colorKeys.indexOf(colorSelected).toString();
  while (colorIndex.length < 2) {
    colorIndex = "0" + colorIndex;
  }
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("products").insert({
        product_id: id + colorIndex,
        potongan: potongan,
        price: parseFloat(price),
        total_stock: parseInt(stock),
        color: colorSelected,
        modal: parseFloat(modal),
      });

      if (error) {
        alert("Error: " + error.message);
      } else {
        newLog(
          "Penambahan produk",
          `Penambahan produk dengan id ${id} warna ${colorSelected}`
        );
        alert("Product added!");
        setPrice("");
        setStock("");
        setModal("");
        setColorSelected("burgundimaron");
        setAddProductOpen(false);
        window.location.reload();
      }
    } catch (error) {
      alert("An unexpected error occurred :" + error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const mainButtons = [
    {
      icon: Plus,
      label: "Add Product",
      onClick: () => setAddProductOpen(true),
      variant: "default" as const,
    },
    {
      icon: BarChart3,
      label: "Dashboard",
      onClick: () => navigateTo("/dashboard", "dashboard"),
      variant: "outline" as const,
      loading: isLoading("dashboard"),
    },
  ];

  const platformButtons = [
    {
      icon: ShoppingBag,
      label: "TikTok",
      onClick: () => navigateTo("/cart/tiktok", "cart"),
      variant: "secondary" as const,
    },
    {
      icon: Store,
      label: "Shopee",
      onClick: () => navigateTo("/cart/shopee", "cart"),
      variant: "secondary" as const,
    },
    {
      icon: Truck,
      label: "Toko",
      onClick: () => navigateTo("/cart/toko", "cart"),
      variant: "secondary" as const,
    },
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Floating Navigation Buttons */}
      <FloatingNavigation
        showBack={false} // Home page doesn't need back button
        showProfile={true}
        disabled={isAnyLoading}
      />

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Your Dashboard
          </h1>
          <p className="text-lg text-gray-600">
            Manage your products and sales efficiently
          </p>
        </div>

        {/* Main Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {mainButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-8">
                  <Button
                    size="lg"
                    variant={button.variant}
                    onClick={button.onClick}
                    disabled={isAnyLoading}
                    className="w-full h-20 text-lg font-semibold"
                  >
                    <Icon className="mr-3 h-6 w-6" />
                    {button.label}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Platform Access */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-center text-2xl">
              Sales Platforms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {platformButtons.map((button, index) => {
                const Icon = button.icon;
                return (
                  <Button
                    key={index}
                    size="lg"
                    variant={button.variant}
                    onClick={button.onClick}
                    disabled={isAnyLoading}
                    className="h-16 text-base font-medium"
                  >
                    <Icon className="mr-2 h-5 w-5" />
                    {button.label}
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
        <Card className="mb-8">
          <CardContent>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigateTo("/log", "log")}
              disabled={isAnyLoading}
              className="h-16 w-full text-base font-medium"
            >
              <History />
              Riwayat Log
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Add Product Modal */}
      {addProductOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <Card className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Add New Product</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Product Details */}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="id">ID</Label>
                      <Input
                        id="id"
                        type="number"
                        placeholder={
                          "Enter ID"
                        }
                        value={id}
                        onChange={(e) => {
                          setId(e.target.value);
                          if (e.target.value.length === 5) setIdValid(true);
                          else setIdValid(false);
                        }}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="potongan"
                        type="number"
                        placeholder="Potongan ke-"
                        value={potongan}
                        onChange={(e) => setPotongan(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input
                        id="price"
                        type="number"
                        placeholder="Enter price"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        placeholder="Enter stock quantity"
                        value={stock}
                        onChange={(e) => setStock(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="modal">Modal</Label>
                      <Input
                        id="modal"
                        type="number"
                        placeholder="Enter modal amount"
                        value={modal}
                        onChange={(e) => setModal(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div className="space-y-4">
                    <div>
                      <Label>Selected Color</Label>
                      <div className="p-3 border rounded-md bg-gray-50">
                        <span className="font-medium">
                          {getProductColorDisplayName(colorSelected)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Label>Choose Color</Label>
                      <div className="grid grid-cols-6 gap-2 p-4 border rounded-md bg-gray-50">
                        {(Object.entries(colors) as [string, string][]).map(
                          ([name, hex]) => (
                            <Button
                              key={name}
                              type="button"
                              size="sm"
                              className={`w-10 h-10 rounded-full border-2 transition-all ${
                                colorSelected === name
                                  ? "border-gray-900 scale-110"
                                  : "border-gray-300 hover:border-gray-400"
                              }`}
                              onClick={() => setColorSelected(name)}
                              style={{ backgroundColor: hex }}
                              title={getProductColorDisplayName(name)}
                            />
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setAddProductOpen(false);
                      setIdValid(false);
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !idValid}>
                    {isSubmitting ? "Adding..." : "Add Product"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
