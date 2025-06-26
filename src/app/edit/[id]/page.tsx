"use client";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function EditPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [jumlahPembelian, setJumlahPembelian] = useState("");
  const { updateProduct, products } = useProducts();
  const thisProduct = products.find((product) => product.id === id);

  const handleUpdateProduct = async () => {
    if (!thisProduct) {
      alert("Product not found.");
      return;
    }
    try {
      // Ensure jumlahPembelian is a valid number before subtracting
      const quantityToSubtract = parseInt(jumlahPembelian);
      if (isNaN(quantityToSubtract)) {
        alert("Please enter a valid number for Jumlah Pembelian.");
        return;
      }
      if (thisProduct.total_stock < quantityToSubtract) {
          alert("Not enough stock.");
          return;
      }

      await updateProduct(thisProduct.id, {
        total_stock: thisProduct.total_stock - quantityToSubtract,
      });
      alert("Berhasil!");
      // Product automatically updated in state
    } catch (error) {
      // Error handled in hook
      if (error instanceof Error) {
        alert("Error: " + error.message);
      } else {
        alert("An unknown error occurred.");
      }
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <input
        type="number"
        placeholder="Jumlah Pembelian"
        className="border p-2 rounded my-0.5"
        value={jumlahPembelian}
        onChange={(e) => setJumlahPembelian(e.target.value)}
        required
      />
      <Button onClick={handleUpdateProduct}>Edit Stock</Button>
    </div>
  );
}