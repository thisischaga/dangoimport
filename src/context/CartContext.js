import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from '../utils/toast';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('dangoCart');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        return Array.isArray(parsed)
          ? parsed.map((item) => ({ ...item, _id: item._id || item.id }))
          : [];
      } catch (e) {
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
    const productId = product._id || product.id;
    const stock = Number(product.stock ?? 999);

    // Rupture totale
    if (stock <= 0) {
      toast.error(`"${product.name}" est en rupture de stock.`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => (item._id || item.id) === productId);

      if (existing) {
        const currentQty = existing.quantity || 0;
        const newQty = currentQty + quantityToAdd;

        // Dépassement du stock
        if (newQty > stock) {
          const addable = stock - currentQty;
          if (addable <= 0) {
            toast.warn(`Stock maximum atteint pour "${product.name}" (${stock} en stock).`);
            return prevCart;
          }
          toast.warn(`Seulement ${addable} unité(s) ajoutée(s) — stock limité à ${stock}.`);
          return prevCart.map((item) =>
            (item._id || item.id) === productId
              ? { ...item, ...product, _id: productId, quantity: stock }
              : item
          );
        }

        toast.info(`Quantité mise à jour : ${newQty}×`);
        return prevCart.map((item) =>
          (item._id || item.id) === productId
            ? { ...item, ...product, _id: productId, quantity: newQty }
            : item
        );
      }

      // Nouveau produit
      const addQty = Math.min(quantityToAdd, stock);
      toast.success(`${product.name} ajouté au panier`);
      return [...prevCart, { ...product, _id: productId, quantity: addQty }];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setCart((prev) => prev.filter((item) => (item._id || item.id) !== productId));
    toast.warn('Article retiré du panier');
  }, []);

  const updateQuantity = useCallback((productId, newQuantity) => {
    setCart((prev) =>
      prev.map((item) => {
        if ((item._id || item.id) !== productId) return item;
        const stock = Number(item.stock ?? 999);
        const clamped = Math.max(1, Math.min(newQuantity, stock));
        return { ...item, quantity: clamped };
      })
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem('dangoCart');
    toast.info('Panier vidé');
  }, []);

  const cartCount = useMemo(
    () => cart.reduce((n, item) => n + (item.quantity || 1), 0),
    [cart]
  );

  const subtotal = useMemo(
    () =>
      cart.reduce((total, item) => {
        const itemPrice =
          Number(item.promoPrice) > 0 && Number(item.promoPrice) < Number(item.price)
            ? Number(item.promoPrice)
            : Number(item.salePrice) > 0
            ? Number(item.salePrice)
            : Number(item.price || 0);
        return total + itemPrice * (Number(item.quantity) || 1);
      }, 0),
    [cart]
  );

  const savings = useMemo(
    () =>
      cart.reduce((total, item) => {
        const orig = Number(item.price || 0);
        const sale =
          Number(item.promoPrice) > 0 && Number(item.promoPrice) < orig
            ? Number(item.promoPrice)
            : Number(item.salePrice) > 0
            ? Number(item.salePrice)
            : orig;
        return total + (orig - sale) * (Number(item.quantity) || 1);
      }, 0),
    [cart]
  );

  const shipping = useMemo(() => (subtotal >= 50000 ? 0 : 2000), [subtotal]);

  const total = useMemo(() => subtotal + shipping, [subtotal, shipping]);

  // Legacy compat
  const getCartTotal = useCallback(() => subtotal, [subtotal]);
  const getCartCount = useCallback(() => cartCount, [cartCount]);

  const value = useMemo(
    () => ({
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount,
      subtotal,
      savings,
      shipping,
      total,
      getCartTotal,
      getCartCount,
    }),
    [cart, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, subtotal, savings, shipping, total, getCartTotal, getCartCount]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
