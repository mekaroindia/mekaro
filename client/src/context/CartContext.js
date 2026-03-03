import { createContext, useState, useEffect } from "react";

export const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("cart");
    if (saved) {
      setCart(JSON.parse(saved));
    }
  }, []);

  // Save cart to localStorage when it updates
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  const addToCart = (product, quantity = 1) => {
    const exists = cart.find((item) => item.id === product.id);

    if (exists) {
      // Increase quantity
      setCart(
        cart.map((item) =>
          item.id === product.id
            ? { ...item, qty: item.qty + quantity }
            : item
        )
      );
    } else {
      setCart([...cart, { ...product, qty: quantity }]);
    }
  };

  // Update quantity
  const updateQty = (id, qty) => {
    setCart(
      cart.map((item) =>
        item.id === id ? { ...item, qty: qty } : item
      )
    );
  };

  // Remove item
  const removeItem = (id) => {
    setCart(cart.filter((item) => item.id !== id));
  };

  // Clear cart
  const clearCart = () => {
    setCart([]);
  };

  // Buy Now (Replace cart)
  const buyNow = (product, quantity = 1) => {
    setCart([{ ...product, qty: quantity }]);
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, updateQty, removeItem, clearCart, buyNow }}>
      {children}
    </CartContext.Provider>
  );
}
