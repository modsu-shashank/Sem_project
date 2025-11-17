import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("rgo_cart");
      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setItems(parsedCart);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      setItems([]);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("rgo_cart", JSON.stringify(items));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [items]);

  const addToCart = (product, selectedGrade, quantity = 1) => {
    setItems((prev) => {
      const existingItem = prev.find(
        (item) =>
          item.product.id === product.id &&
          item.selectedGrade.name === selectedGrade.name
      );

      if (existingItem) {
        return prev.map((item) =>
          item.product.id === product.id &&
          item.selectedGrade.name === selectedGrade.name
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, selectedGrade, quantity }];
    });
  };

  const removeFromCart = (cartItemId) => {
    setItems((prev) =>
      prev.filter(
        (item) => `${item.product.id}-${item.selectedGrade.name}` !== cartItemId
      )
    );
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        `${item.product.id}-${item.selectedGrade.name}` === cartItemId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalItems = (items || []).reduce(
    (sum, item) => sum + (item.quantity || 0),
    0
  );

  const totalPrice = (items || []).reduce(
    (sum, item) =>
      sum + (item.selectedGrade?.price || 0) * (item.quantity || 0),
    0
  );

  const value = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    totalItems,
    totalPrice,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
