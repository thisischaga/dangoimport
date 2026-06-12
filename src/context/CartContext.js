import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'react-toastify';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('dangoCart');
    if (savedCart) {
      try {
        return JSON.parse(savedCart);
      } catch (e) {
        console.error('Erreur chargement panier', e);
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('dangoCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = useCallback((product, qty = 1) => {
    const quantityToAdd = Math.max(1, parseInt(qty, 10) || 1);
    let isUpdate = false;
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);
      if (existingItem) {
        isUpdate = true;
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, ...product, quantity: item.quantity + quantityToAdd }
            : item
        );
      }
      isUpdate = false;
      return [...prevCart, { ...product, quantity: quantityToAdd }];
    });
    setTimeout(() => {
      if (isUpdate) {
        toast.info(`Quantité mise à jour pour ${product.name}`);
      } else {
        toast.success(`${product.name} ajouté au panier`);
      }
    }, 0);
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.warn('Article retiré du panier');
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prevCart) =>
      prevCart.map((item) =>
        item._id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('dangoCart');
  }, []);

  const getCartTotal = useCallback(
    () => cart.reduce((total, item) => total + (item.price * item.quantity), 0),
    [cart]
  );

  const getCartCount = useCallback(
    () => cart.reduce((count, item) => count + item.quantity, 0),
    [cart]
  );

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, getCartTotal, getCartCount]
  );

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
