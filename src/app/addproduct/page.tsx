"use client";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/ColorPicker";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      color: "light green",
    });
    if (!error) {
      router.back();
    }
    if (error) {
      alert("Error: " + error.message);
    } else {
      alert("Product added!");
      setName("");
      setPrice("");
      setStock("");
    }
  };
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Product Name"
          className="border p-2 rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Price"
          className="border p-2 rounded"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <input
          type="number"
          placeholder="Stock"
          className="border p-2 rounded"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          required
        />
        <ColorPicker></ColorPicker>
        <div className="flex justify-between">
          <Button type="submit">Submit</Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
