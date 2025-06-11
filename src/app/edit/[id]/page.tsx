"use client";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { useParams } from "next/navigation";
import { useState } from "react";

type Product = {
  id: number;
  name: string;
  price: number;
};

export default function editPage() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id);
  const [jumlahPembelian, setJumlahPembelian] = useState("");
  const { updateProduct, fetchProducts, products, searchProducts } =
    useProducts();
  const thisProduct = products.find((product) => product.id === id);

  const handleUpdateProduct = async () => {
    if (!thisProduct) {
      alert("Product not found.");
      return;
    }
    try {
      await updateProduct(thisProduct.id, {
        total_stock: thisProduct.total_stock - parseInt(jumlahPembelian),
      });
      alert("berhasil");
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
      <Button onClick={() => handleUpdateProduct()}>Edit Stock</Button>
    </div>
  );
}
