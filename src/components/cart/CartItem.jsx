import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaHeart, FaRegClock } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const price = Number(item.price || 0);
  const promo = Number(item.salePrice || item.promoPrice || 0) || 0;
  const display = promo > 0 && promo < price ? promo : price;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col md:flex-row gap-4 items-start">
      <div className="w-28 h-28 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
      </div>

      <div className="flex-1">
        <Link to={`/product/${item._id || item.id}`} className="font-semibold text-gray-900 block mb-1">{item.name}</Link>
        <div className="text-sm text-gray-500">{item.vendorName || item.storeName}</div>
        {item.attributes && <div className="text-sm text-gray-600 mt-2">{Object.entries(item.attributes || {}).map(([k,v])=>`${k}: ${v}`).join(' • ')}</div>}
      </div>

      <div className="w-44 flex flex-col items-end gap-3">
        <div className="text-right">
          <div className="text-xl font-black text-gray-900">{display.toLocaleString()} FCFA</div>
          {promo > 0 && promo < price && <div className="text-sm text-gray-400 line-through">{price.toLocaleString()} FCFA</div>}
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) - 1)} className="px-3 py-1 bg-gray-100 rounded"><FaMinus /></button>
          <input type="number" value={item.quantity || 1} onChange={(e) => updateQuantity(item._id || item.id, Math.max(1, Number(e.target.value || 1)))} className="w-12 text-center border rounded px-2 py-1" />
          <button onClick={() => updateQuantity(item._id || item.id, (item.quantity || 1) + 1)} className="px-3 py-1 bg-gray-100 rounded"><FaPlus /></button>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => removeFromCart(item._id || item.id)} className="text-red-500 text-sm flex items-center gap-2"><FaTrash />Supprimer</button>
          <button className="text-gray-600 text-sm flex items-center gap-2"><FaHeart />Favoris</button>
          <button className="text-gray-600 text-sm flex items-center gap-2"><FaRegClock />Acheter plus tard</button>
        </div>
      </div>
    </div>
  );
}
