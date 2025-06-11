"use client";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useState } from "react";
import { useNavigation } from "@/hooks/useNavigation";
import colors from "@/lib/data";

export default function Home() {
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [modal, setModal] = useState("");
  const [colorSelected, setColorSelected] = useState("burgundiMaron");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fixed destructuring syntax
  const { navigateTo, isLoading, isAnyLoading } = useNavigation();
  const buttonClass = "py-10 px-20";

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-row gap-4">
                <div className="flex flex-col flex-1">
                  <input
                    type="text"
                    placeholder="Product Name"
                    className="border p-2 rounded mb-2"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Price"
                    className="border p-2 rounded mb-2"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Stock"
                    className="border p-2 rounded mb-2"
                    value={stock}
                    onChange={(e) => setStock(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Modal"
                    className="border p-2 rounded mb-2"
                    value={modal}
                    onChange={(e) => setModal(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex flex-col">
                  <h3 className="text-sm font-medium mb-2">Select Color:</h3>
                  <div className="flex flex-wrap gap-2 p-3 bg-gray-100 rounded max-w-60">
                    {(Object.entries(colors) as [string, string][]).map(
                      ([name, hex]) => (
                        <div key={name} className="text-center">
                          <Button
                            type="button"
                            className={`w-8 h-8 border-2 rounded ${
                              colorSelected === name 
                                ? "border-black scale-110" 
                                : "border-gray-300"
                            }`}
                            onClick={() => setColorSelected(name)}
                            style={{ backgroundColor: hex }}
                          />
                        </div>
                      )
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-2">
                    Selected: {colorSelected}
                  </p>
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Adding..." : "Add Product"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}