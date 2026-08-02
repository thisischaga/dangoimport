import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CartItem from '../components/cart/CartItem';
import CartSummary from '../components/cart/CartSummary';
import CartCoupon from '../components/cart/CartCoupon';
import EmptyCart from '../components/cart/EmptyCart';

export default function Cart() {
  const navigate = useNavigate();
  const { cart, clearCart } = useCart();

  const handleCheckout = () => navigate('/checkout');

  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
        <Header />
        <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <EmptyCart />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <Header />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-4">
            <h1 className="text-2xl font-black">Mon panier ({cart.length})</h1>
            {cart.map(it => <CartItem key={it._id || it.id} item={it} />)}
          </div>

          <div className="lg:col-span-4 space-y-4">
            <CartCoupon onApply={(code) => console.log('apply coupon', code)} />
            <CartSummary onCheckout={handleCheckout} />
            <div className="bg-white rounded-2xl border border-gray-100 p-4">Vus récemment (placeholder)</div>
            <div className="text-sm text-gray-500"> <button onClick={() => clearCart()} className="text-red-500">Vider le panier</button></div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
