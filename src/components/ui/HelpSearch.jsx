import React from 'react';
import { Search } from 'lucide-react';

export default function HelpSearch({ value, onChange, onSubmit, placeholder = 'Rechercher dans l\'aide' }) {
  return (
    <form onSubmit={onSubmit} className="w-full">
      <label className="sr-only">Recherche aide</label>
      <div className="flex items-center gap-2 max-w-2xl">
        <div className="flex items-center bg-white border rounded-lg px-3 py-2 w-full">
          <Search size={16} className="text-slate-400" />
          <input aria-label="Recherche aide" value={value} onChange={onChange} placeholder={placeholder} className="ml-3 w-full outline-none text-sm" />
        </div>
        <button type="submit" className="bg-[#F68B1E] text-white px-4 py-2 rounded-lg">Rechercher</button>
      </div>
    </form>
  );
}
