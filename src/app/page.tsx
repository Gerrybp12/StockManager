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
  const buttonClass = "py-10 px-20";

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
        alert("Product added!");
        setName("");
        setPrice("");
        setStock("");
        setModal("");
        setColorSelected("burgundiMaron");
        setAddProductOpen(false); // Close modal on success
      }
    } catch (error) {
      alert("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen flex-col gap-5">
      {globalError && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription className="flex items-center justify-between">
            <span>{globalError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={getProfile}
              className="ml-4"
            >
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}
      <Button
        className={buttonClass}
        onClick={() => setAddProductOpen(true)}
        disabled={isAnyLoading}
      >
        Add Product
      </Button>
      <Button
        className={buttonClass}
        onClick={() => navigateTo("/dashboard", "dashboard")}
        disabled={isAnyLoading}
      >
        {isLoading("dashboard") ? "Loading..." : "Dashboard"}
      </Button>
      <Button
        className={buttonClass}
        onClick={() => navigateTo("/profile", "profile")}
        disabled={isAnyLoading}
      >
        {isLoading("profile") ? "Loading..." : "Profile"}
      </Button>

      {addProductOpen && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{
            background: "rgba(49,49,49,0.8)",
          }}
        >
          <div className="flex flex-col gap-3 p-10 rounded-md bg-white items-center justify-center">
            <h1 className="">Add Product</h1>
            <div className="flex flex-row">
              <div className="flex flex-col">
                <input
                  type="text"
                  placeholder="Product Name"
                  className="border p-2 rounded my-0.5"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Price"
                  className="border p-2 rounded my-0.5"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Stock"
                  className="border p-2 rounded my-0.5"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Modal"
                  className="border p-2 rounded my-0.5"
                  value={modal}
                  onChange={(e) => setModal(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col">
                <h1 className="border p-2 rounded my-0.5">
                  Warna : {getProductColorDisplayName(colorSelected)}
                </h1>
                <div className="flex flex-wrap w-60">
                  {(Object.entries(colors) as [string, string][]).map(
                    ([name, hex]) => (
                      <div key={name} className="text-center ">
                        <Button
                          className={`border-2 ${
                            colorSelected === name ? "w-13 h-13" : ""
                          }`}
                          onClick={() => setColorSelected(name)}
                          style={{ backgroundColor: hex }}
                        ></Button>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAddProductOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Adding..." : "Add Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-row gap-4">
        {(profile?.role == "tiktok" || profile?.role == "manager") && (
          <Button
            className={buttonClass}
            onClick={() => navigateTo("/cart/tiktok", "cart")}
            disabled={isAnyLoading}
          >
            {isLoading("dashboard") ? "Loading..." : "Tiktok"}
          </Button>
        )}
        {(profile?.role == "shopee" || profile?.role == "manager") && (
          <Button
            className={buttonClass}
            onClick={() => navigateTo("/cart/shopee", "cart")}
            disabled={isAnyLoading}
          >
            {isLoading("dashboard") ? "Loading..." : "Shopee"}
          </Button>
        )}
        {(profile?.role == "toko" || profile?.role == "manager") && (
          <Button
            className={buttonClass}
            onClick={() => navigateTo("/cart/toko", "cart")}
            disabled={isAnyLoading}
          >
            {isLoading("dashboard") ? "Loading..." : "Tiktok"}
          </Button>
        )}
      </div>
    </div>
  );
}
