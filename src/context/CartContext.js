import React, { createContext, useContext, useState, useEffect } from 'react';
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
        console.error("Erreur chargement panier", e);
        return [];
      }
    }
    return [];
  });

  // Sauvegarder le panier à chaque modification
  useEffect(() => {
    localStorage.setItem('dangoCart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product) => {
    let isUpdate = false;
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        isUpdate = true;
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      isUpdate = false;
      return [...prevCart, { ...product, quantity: 1 }];
    });
    // Toast appelé après setCart, hors du callback (évite setState-during-render)
    setTimeout(() => {
      if (isUpdate) {
        toast.info(`Quantité mise à jour pour ${product.name}`);
      } else {
        toast.success(`${product.name} ajouté au panier`);
      }
    }, 0);
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item._id !== productId));
    toast.warn("Article retiré du panier");
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(prevCart => prevCart.map(item => 
      item._id === productId ? { ...item, quantity: newQuantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('dangoCart');
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getCartCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      getCartTotal, 
      getCartCount 
    }}>
      {children}
    </CartContext.Provider>
  );
};
