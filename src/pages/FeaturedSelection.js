import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { useFeaturedProducts } from '../hooks/useProducts';

import { getProductImage } from '../utils/imageUrl';

const getPrice = (p) => p?.salePrice ?? p?.price ?? 0;
const fmtCFA = (n) => Number(n).toLocaleString('fr-FR');

export default function FeaturedSelection() {
  const navigate = useNavigate();
  const { data: products = [], isLoading } = useFeaturedProducts();

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115]">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Minimal Breadcrumb */}
        <p className="text-[12px] text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Accueil</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-bold">Sélection Vedette</span>
        </p>

        {/* Clean, Iconless Premium Header */}
        <div className="relative bg-white dark:bg-[#1a1d24] rounded-2xl p-8 sm:p-12 mb-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdc2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-3">
              Sélection Vedette
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] max-w-xl pl-4 border-l-2 border-[#ffdc2b]/30">
              Découvrez notre curation exclusive de produits de haute qualité, directement importés et disponibles en livraison rapide au Bénin et au Togo.
            </p>
          </div>
          <div className="shrink-0 relative z-10">
            <button
              onClick={() => navigate('/shopping')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 font-bold px-8 py-3.5 rounded-full transition-colors text-[14px] shadow-md"
            >
              Voir tout le catalogue
            </button>
          </div>
        </div>

        {/* Products Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Produits du moment
            {!isLoading && <span className="text-sm font-medium text-gray-400 ml-2 font-normal">({products.length} articles)</span>}
          </h2>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array(10).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden animate-pulse border border-gray-100 dark:border-gray-800">
                <div className="aspect-square bg-gray-100 dark:bg-gray-800" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
            <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun produit pour le moment</p>
            <p className="text-gray-500 mb-6">Notre sélection vedette est en cours de mise à jour.</p>
            <button onClick={() => navigate('/shopping')} className="bg-[#ffdc2b] text-[#111] font-black px-8 py-3 rounded-full text-sm hover:bg-[#e6c600] transition-colors">
              Explorer le catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => {
              const img = getProductImage(p);
              const price = getPrice(p);
              return (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => navigate(`/product/${p._id}`)}
                  className="group bg-white dark:bg-[#1a1d24] rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all text-left flex flex-col"
                >
                  <div className="relative w-full aspect-square overflow-hidden bg-white dark:bg-gray-800">
                    {img ? (
                      <img
                        src={img}
                        alt={p.name}
                        className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-50 dark:bg-gray-900" />
                    )}
                    <span className="absolute top-3 left-3 bg-[#ffdc2b] text-[#111] text-[10px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                      Premium
                    </span>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <p className="text-[13px] text-gray-800 dark:text-gray-200 line-clamp-2 mb-3 leading-snug">{p.name}</p>
                    <div className="mt-auto">
                      <p className="font-black text-gray-900 dark:text-white text-[16px]">
                        {fmtCFA(price)} <span className="text-[11px] font-bold text-gray-500">FCFA</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
