import React from 'react';
import { useCart } from '../../context/CartContext';

export default function CartSummary({ onCheckout }) {
  const { cart, subtotal, savings, shipping, total, cartCount } = useCart();
  const fmt = (n) => Number(n).toLocaleString('fr-FR');

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6"> 
      <h2 className="text-lg font-black mb-4">RÉSUMÉ DE LA COMMANDE</h2>
      <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Articles ({cartCount})</span><span className="font-black">{fmt(subtotal)} FCFA</span></div>
      <div className="flex justify-between mb-2"><span className="text-sm text-gray-600">Réduction</span><span className="text-sm text-gray-600">-{fmt(savings)} FCFA</span></div>
      <div className="flex justify-between mb-4"><span className="text-sm text-gray-600">Livraison (est.)</span><span className="font-black">{fmt(shipping)} FCFA</span></div>
      <div className="border-t pt-4 flex justify-between items-center mb-4"><span className="text-sm text-gray-600">Total</span><span className="text-xl font-black">{fmt(total)} FCFA</span></div>
      <button onClick={onCheckout} className="w-full bg-[#F68B1E] text-white font-black py-3 rounded-full">Passer la commande</button>
    </div>
  );
}
