import React, { useState } from 'react';

export default function CartCoupon({ onApply }) {
  const [code, setCode] = useState('');
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4">
      <h3 className="text-sm font-bold mb-2">Code promo</h3>
      <div className="flex gap-2">
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Saisir le code" className="flex-1 border rounded px-3 py-2" />
        <button onClick={() => onApply && onApply(code)} className="px-4 py-2 bg-gray-800 text-white rounded">Appliquer</button>
      </div>
    </div>
  );
}
