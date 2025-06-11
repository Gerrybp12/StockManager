import { Product } from "@/types/product";
import { useState } from "react";

export const useCart = () => {
  const [cart, setCart] = useState<{ [id: string]: number }>({});

  const addProduct = (id: string, quantity: number) => {
    setCart((prev) => ({
      ...prev,
      [id]: quantity,
    }));
  };
  return {
    cart,
    addProduct,
  };
};
