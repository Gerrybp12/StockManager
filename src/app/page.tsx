"use client";
import { Button } from "@/components/ui/button";
import supabase from "@/lib/supabaseClient";
import { useState } from "react";

export default function Home() {
  const [loading, setLoading] = useState(false);

  const handleAddProduct = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("products").insert({
      name: "New Product",
      price: 1000000,
      stock: 10,
      color: "red",
    });

    if (error) {
      console.error("Insert error:", error.message);
    } else {
      console.log("Inserted product:", data);
    }

    setLoading(false);
  };
  return (
    <div className="flex justify-center items-center h-screen flex-col">
      <Button
        className="py-10 px-20"
        onClick={handleAddProduct}
        disabled={loading}
      >
        {loading ? "Adding..." : "Add Product"}
      </Button>
    </div>
  );
}
