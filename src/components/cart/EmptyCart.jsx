import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { Link } from 'react-router-dom';

export default function EmptyCart() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center">
        <div className="w-28 h-28 mx-auto mb-4 text-gray-300"><FaShoppingCart size={56} /></div>
        <h2 className="text-xl font-black mb-2">Panier vide</h2>
        <p className="text-gray-500 mb-6">Ajoutez des produits pour continuer</p>
        <Link to="/shopping" className="bg-[#F68B1E] text-white px-6 py-3 rounded-full font-black">Continuer les achats</Link>
      </div>
    </div>
  );
}
