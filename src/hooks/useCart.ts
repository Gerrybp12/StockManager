import { CartProduct } from "@/types/cart";
import { Product } from "@/types/product";
import { useState } from "react";

export const useCart = () => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addProduct = (
    id: string,
    quantity: number,
    initial_stock: number,
    price: number,
    color: string
  ) => {
    setCart((prev) => [
      ...prev,
      {
        quantity: quantity,
        initial_stock: initial_stock,
        id: id,
        price: price,
        color: color,
      },
    ]);
  };
  return {
    cart,
    addProduct,
  };
};
