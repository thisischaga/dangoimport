import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function Breadcrumb({ items = [] }) {
  if (!items.length) return null;
  return (
    <nav aria-label="Breadcrumb" className="mb-3 text-sm text-[#6b7280]">
      <ol className="flex items-center gap-2">
        {items.map((it, idx) => (
          <li key={idx} className="flex items-center gap-2">
            {it.to ? <Link to={it.to} className="hover:underline text-[#6b7280]">{it.label}</Link> : <span className="text-[#374151]">{it.label}</span>}
            {idx < items.length - 1 && <ChevronRight size={14} className="text-[#9ca3af]" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
