"use client";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { getProfile } from "./login/actions";
import colors from "@/lib/colors";
import { getProductColorDisplayName } from "@/utils/productUtils";
import { useNavigation } from "@/hooks/useNavigation";
import { createClient } from "@/utils/supabase/client";
import { UserProfile } from "@/types/user";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [modal, setModal] = useState("");
  const [colorSelected, setColorSelected] = useState("burgundiMaron");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const supabase = createClient();

  // Fixed destructuring syntax
  const { navigateTo, isLoading, isAnyLoading } = useNavigation();
  const { newLog } = useLog(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      setLoading(true);
      setGlobalError(null);

      const result = await getProfile();

      if (result.error) {
        setGlobalError(result.error);
        if (result.error === "User not authenticated") {
          navigateTo("/login", "login");
        }
        return;
      }
      setProfile(result.profile);
    } catch (error) {
      console.error("Error loading profile:", error);
      setGlobalError("Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("products").insert({
        name,
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
          `Penambahan produk dengan id ... warna ${colorSelected}`
        );
        alert("Product added!");
        setName("");
        setPrice("");
        setStock("");
        setModal("");
        setColorSelected("burgundiMaron");
        setAddProductOpen(false);
      }
    } catch (error) {
      alert("An unexpected error occurred");
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
      show: profile?.role === "tiktok" || profile?.role === "manager",
      variant: "secondary" as const,
    },
    {
      icon: Store,
      label: "Shopee",
      onClick: () => navigateTo("/cart/shopee", "cart"),
      show: profile?.role === "shopee" || profile?.role === "manager",
      variant: "secondary" as const,
    },
    {
      icon: Truck,
      label: "Toko",
      onClick: () => navigateTo("/cart/toko", "cart"),
      show: profile?.role === "toko" || profile?.role === "manager",
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

        {/* Error Alert */}
        {globalError && (
          <Alert variant="destructive" className="mb-8">
            <AlertDescription className="flex items-center justify-between">
              <span>{globalError}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={loadProfile}
                className="ml-4"
              >
                Try Again
              </Button>
            </AlertDescription>
          </Alert>
        )}

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
                    {button.loading ? "Loading..." : button.label}
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
              {platformButtons
                .filter((button) => button.show)
                .map((button, index) => {
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
                      <Label htmlFor="name">Product Name</Label>
                      <Input
                        id="name"
                        type="text"
                        placeholder="Enter product name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
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
                    onClick={() => setAddProductOpen(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
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
