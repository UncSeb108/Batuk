"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  uid: string;
  title: string;
  artist: string;
  price: string;
  src: string;
  typeCode: string;
  materials: string;
  duration: string;
  type: string;
  inspiration: string;
  status?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: any) => void;
  removeFromCart: (uid: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: any) => {
    // Transform the item to include all required fields with proper defaults
    const cartItem: CartItem = {
      uid: item.uid || 'unknown',
      title: item.title || 'Untitled Artwork',
      artist: item.artist || 'Batuk',
      price: item.price || '0',
      src: item.src || '',
      typeCode: item.typeCode || 'ART',
      materials: item.materials || 'Not specified',
      duration: item.duration || 'Not specified',
      type: item.type || 'Artwork',
      inspiration: item.inspiration || 'Not specified',
      status: item.status || 'Available'
    };

    console.log("🛒 Adding to cart:", cartItem);
    setCart((prev) => [...prev, cartItem]);
  };

  const removeFromCart = (uid: string) => {
    setCart((prev) => prev.filter((item) => item.uid !== uid));
  };

  const clearCart = () => {
    console.log("🛒 Clearing cart");
    setCart([]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
