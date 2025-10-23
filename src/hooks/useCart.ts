import { CartProduct } from "@/types/cart";
import { useState } from "react";

export const useCart = () => {
  const [cart, setCart] = useState<CartProduct[]>([]);

  const addProduct = (
    id: string,
    product_id: string,
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
        product_id: product_id,
      },
    ]);
  };
  return {
    cart,
    addProduct,
  };
};
