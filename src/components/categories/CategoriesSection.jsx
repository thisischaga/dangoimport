import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../apiClient';
import { Link } from 'react-router-dom';

async function fetchCategories() {
  const res = await client.get('/categories');
  return res.data.data || [];
}

export default function CategoriesSection() {
  const { data: categories = [], isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories, staleTime: 1000 * 60 * 5 });

  if (isLoading) return <div className="py-6">Chargement des catégories...</div>;

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">Catégories</p>
        <h2 className="text-2xl font-bold text-slate-900">Parcourir par catégorie</h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((cat) => (
          <Link to={`/category/${cat.slug}`} key={cat._id || cat.slug} className="group block rounded-lg border bg-white p-4 text-center hover:shadow-md">
            {cat.image ? <img src={cat.image} alt={cat.name} className="mx-auto mb-3 h-16 w-16 object-cover" /> : <div className="mx-auto mb-3 h-16 w-16 rounded bg-gray-100" />}
            <div className="text-sm font-semibold text-slate-900">{cat.name}</div>
            <div className="text-xs text-slate-500">{cat.productCount ?? 0} produits</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
