import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaChevronRight } from 'react-icons/fa';
import client from '../apiClient';

const DEFAULT_CATEGORY_IMAGE = 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

export default function AllCategories() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCategories() {
      try {
        setLoading(true);
        const res = await client.get('/categories');
        const fetched = Array.isArray(res?.data?.data) ? res.data.data : [];
        if (isMounted) {
          setCategories(fetched);
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError('Impossible de charger les catégories.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-layer-background-dim)] dark:bg-[#0f1115]">
      <Header />

      <main className="max-w-[var(--floorWrapperWidth)] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header section */}
        <div className="mb-8">
          <p className="text-xs text-[var(--color-on-layer-on-layer-tertiary)] mb-1">
            <button onClick={() => navigate('/')} className="hover:text-[var(--color-accent-primary)]">Accueil</button>
            {' > '}
            <span className="font-semibold text-[var(--color-on-layer-on-layer-primary)] dark:text-white">Toutes les catégories</span>
          </p>
          <h1 className="text-2xl sm:text-3xl font-black text-[var(--color-on-layer-on-layer-primary)] dark:text-white mt-2">
            Toutes les catégories
          </h1>
          <p className="text-[var(--color-on-layer-on-layer-tertiary)] mt-1">
            Explorez notre catalogue complet — des produits authentiques prêts à être expédiés.
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Chargement des catégories...</div>
          ) : error ? (
            <div className="col-span-full rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center text-rose-700">{error}</div>
          ) : categories.length === 0 ? (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Aucune catégorie disponible pour le moment.</div>
          ) : (
            categories.map((cat) => (
              <button
                key={cat._id || cat.slug || cat.name}
                type="button"
                onClick={() => navigate(`/category/${cat.slug}`)}
                className="group flex items-center gap-4 bg-white dark:bg-[#1e2130] rounded-xl border border-[var(--color-outline)] dark:border-gray-800 p-3 text-left transition-all duration-200 hover:border-[var(--color-accent-primary)] hover:shadow-md"
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden shrink-0 shadow-sm bg-gray-100">
                  <img 
                    src={cat.image || DEFAULT_CATEGORY_IMAGE} 
                    alt={cat.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                  <p className="font-black text-[var(--color-on-layer-on-layer-primary)] dark:text-white text-[15px] sm:text-[16px] leading-tight group-hover:text-[var(--color-accent-primary)] transition-colors">
                    {cat.name}
                  </p>
                  <p className="text-[var(--pc-caption-font-size)] text-[var(--color-on-layer-on-layer-tertiary)] mt-1 line-clamp-2">
                    {cat.description || 'Découvrez les produits de cette catégorie.'}
                  </p>
                </div>
                <FaChevronRight size={12} className="text-[var(--color-on-layer-on-layer-tertiary)] group-hover:text-[var(--color-accent-primary)] shrink-0 transition-colors mr-2" />
              </button>
            ))
          )}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-secondary)] rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-black mb-2">Vous ne trouvez pas votre produit ?</h2>
          <p className="text-white/80 mb-5 text-sm">Notre service de sourcing Chine vous permet de commander n'importe quel produit.</p>
          <button
            onClick={() => navigate('/services')}
            className="bg-white text-[var(--color-accent-primary)] font-black px-8 py-3 rounded-full hover:bg-gray-100 transition-colors text-sm"
          >
            Demander un devis gratuit
          </button>
        </div>
      </main>
    </div>
  );
}
