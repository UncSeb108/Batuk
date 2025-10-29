"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  uid: string;
  title: string;
  price: string;
  src: string;
  status?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (uid: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
  };

  const removeFromCart = (uid: string) => {
    setCart((prev) => prev.filter((item) => item.uid !== uid));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}