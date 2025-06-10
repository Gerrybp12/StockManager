"use client";
import { Button } from "@/components/ui/button";
import ColorPicker from "@/components/ui/ColorPicker";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";
import colors from "@/lib/data"; // Import colors from data file

export default function AddProductPage() {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [modal, setModal] = useState("");
  const [colorSelected, setColorSelected] = useState("burgundiMaron"); // Default color
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("products").insert({
      name,
      price: parseFloat(price),
      stock: parseInt(stock),
      color: colorSelected,
      modal: parseFloat(modal),
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
    <div className="flex flex-col gap-3 items-center justify-center h-screen">
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
        <div className="flex flex-wrap m=5 w-60 bg-gray-100">
          {(Object.entries(colors) as [string, string][]).map(([name, hex]) => (
            <div key={name} className="text-center ">
              <Button
                className={`border-2 ${
                  colorSelected === name ? "w-13 h-13" : ""
                }`}
                onClick={() => setColorSelected(name)}
                style={{ backgroundColor: hex }}
              ></Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={handleSubmit}>Submit</Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
