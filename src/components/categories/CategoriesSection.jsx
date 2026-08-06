import React from 'react';
import { useQuery } from '@tanstack/react-query';
import client from '../../apiClient';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

async function fetchCategories() {
  const res = await client.get('/categories');
  return res.data.data || [];
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80';

export default function CategoriesSection() {
  const { data: categories = [], isLoading, isError } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: 1000 * 60 * 5,
  });

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">Catégories</p>
          <h2 className="text-3xl font-bold text-slate-900">Trouvez le rayon qui vous inspire</h2>
        </div>
        <Link
          to="/toutes-les-categories"
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00] transition hover:text-[#d66c00]"
        >
          Toutes les catégories
          <ArrowRight size={16} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm animate-pulse">
              <div className="mb-4 h-40 rounded-2xl bg-slate-100" />
              <div className="h-4 w-3/4 rounded bg-slate-200 mb-2" />
              <div className="h-3 w-1/2 rounded bg-slate-200" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-700">
          Impossible de charger les catégories pour le moment.
        </div>
      ) : categories.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center text-slate-500">
          Aucune catégorie disponible pour l'instant.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {categories.slice(0, 8).map((cat) => (
            <Link
              to={`/category/${cat.slug}`}
              key={cat._id || cat.slug}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
            >
              <div className="h-40 overflow-hidden bg-slate-100">
                <img
                  src={cat.banner || cat.image || FALLBACK_IMAGE}
                  alt={cat.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
              <div className="px-5 py-5 text-left">
                <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                  {cat.description || 'Découvrez des sélections de produits de cette catégorie.'}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[#FF6B00]">
                  <span>{cat.productCount ?? 0} produits</span>
                  <span className="font-bold">Voir</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
