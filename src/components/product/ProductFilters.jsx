import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  Filter,
  Flame,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Zap,
  X,
} from 'lucide-react';
import { getCategories } from '../../api';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Pertinence' },
  { value: 'newest', label: 'Plus récents' },
  { value: 'price-asc', label: 'Prix croissant' },
  { value: 'price-desc', label: 'Prix décroissant' },
  { value: 'popular', label: 'Plus populaires' },
  { value: 'bestSelling', label: 'Meilleures ventes' },
  { value: 'bestRating', label: 'Meilleures notes' },
];

const QUICK_FILTERS = [
  { key: 'promotion', label: 'Promotions', icon: Flame },
  { key: 'topRated', label: 'Les mieux notés', icon: Star },
  { key: 'freeShipping', label: 'Livraison gratuite', icon: Truck },
  { key: 'newArrival', label: 'Nouveautés', icon: Sparkles },
  { key: 'favorites', label: 'Coups de cœur', icon: ShieldCheck },
  { key: 'verifiedSeller', label: 'Boutiques vérifiées', icon: ShieldCheck },
  { key: 'bestSelling', label: 'Meilleures ventes', icon: Zap },
];

const CONDITION_OPTIONS = ['Neuf', 'Occasion', 'Reconditionné'];





function CategoryCard({ category, active, onClick }) {
  return (
    <motion.button
      type="button"
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`group relative flex min-h-[140px] flex-col justify-between overflow-hidden rounded-[28px] border p-5 text-left transition shadow-sm ${active ? 'border-[#FF6B00] bg-[#FFF4E5] shadow-lg' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'}`}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-2xl font-semibold text-slate-700">
          {category.name?.charAt(0) || 'C'}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FF6B00]">{category.name}</p>
          <p className="mt-2 text-sm text-slate-600">{category.productCount ?? 0} produit{(category.productCount ?? 0) !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#FF6B00]">
        Voir <ArrowRight size={16} />
      </span>
    </motion.button>
  );
}

function QuickFilterButton({ label, Icon, active, onClick }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? 'border-[#FF6B00] bg-[#FFF4E5] text-[#FF6B00]' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
      aria-pressed={active}
    >
      <Icon size={16} />
      {label}
    </motion.button>
  );
}

function ProductFilters({ onFiltersChange, showAdvancedOnly = false, drawerOpen: drawerOpenProp, setDrawerOpen: setDrawerOpenProp }) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sort, setSort] = useState('relevance');
  const [internalDrawerOpen, setInternalDrawerOpen] = useState(false);
  const drawerOpen = typeof drawerOpenProp === 'boolean' ? drawerOpenProp : internalDrawerOpen;
  const setDrawerOpen = typeof setDrawerOpenProp === 'function' ? setDrawerOpenProp : setInternalDrawerOpen;
  const [quickFilters, setQuickFilters] = useState({
    promotion: false,
    topRated: false,
    freeShipping: false,
    newArrival: false,
    favorites: false,
    verifiedSeller: false,
    bestSelling: false,
  });
  const [advanced, setAdvanced] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    brand: '',
    country: '',
    condition: '',
    inStock: false,
    freeShipping: false,
    promotions: false,
    verifiedSeller: false,
    premiumSeller: false,
  });

  const { data: categories = [], isLoading: loadingCategories, isError: categoriesError } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    staleTime: 1000 * 60 * 5,
  });

  const category = useMemo(() => {
    if (selectedCategory === 'all') return { name: 'Tous', slug: 'all', productCount: categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0) };
    return categories.find((cat) => cat.slug === selectedCategory) || null;
  }, [categories, selectedCategory]);


  const selectedFilters = useMemo(() => {
    const params = {
      category: category && category.slug !== 'all' ? category.name : undefined,
      sort,
      minPrice: advanced.minPrice || undefined,
      maxPrice: advanced.maxPrice || undefined,
      promo: quickFilters.promotion || advanced.promotions ? 'true' : undefined,
      onlyPromo: quickFilters.promotion || advanced.promotions || undefined,
      onlyFreeShip: quickFilters.freeShipping || advanced.freeShipping || undefined,
      rating: quickFilters.topRated ? '4.5' : advanced.minRating || undefined,
      newArrival: quickFilters.newArrival ? 'true' : undefined,
      bestSeller: quickFilters.bestSelling ? 'true' : undefined,
      verifiedSeller: quickFilters.verifiedSeller || advanced.verifiedSeller ? 'true' : undefined,
      brand: advanced.brand || undefined,
      country: advanced.country || undefined,
      condition: advanced.condition || undefined,
      inStock: advanced.inStock ? 'true' : undefined,
      premiumSeller: advanced.premiumSeller ? 'true' : undefined,
    };

    return Object.keys(params).reduce((acc, key) => {
      if (params[key] !== undefined && params[key] !== '') acc[key] = params[key];
      return acc;
    }, {});
  }, [advanced, category, quickFilters, sort]);

  useEffect(() => {
    onFiltersChange?.(selectedFilters);
  }, [onFiltersChange, selectedFilters]);

  const toggleQuickFilter = useCallback((key) => {
    setQuickFilters((current) => ({
      ...current,
      [key]: !current[key],
    }));
  }, []);

  const handleCategoryClick = useCallback((slug) => {
    setSelectedCategory(slug);
  }, []);

  const handleResetAdvanced = () => {
    setAdvanced({
      minPrice: '',
      maxPrice: '',
      minRating: '',
      brand: '',
      country: '',
      condition: '',
      inStock: false,
      freeShipping: false,
      promotions: false,
      verifiedSeller: false,
      premiumSeller: false,
    });
  };

  return (
    <section >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">

        {!setDrawerOpenProp && (
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-2 rounded-full bg-[#FF6B00] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e75b00] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]/50 cursor-pointer"
            style={{ cursor: 'pointer' }}
          >
            <Filter size={16} /> Filtres avancés
          </button>
        )}
      </div>

      
      <AnimatePresence>
        {drawerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 260, damping: 24 }}
              className="absolute right-0 top-0 flex h-full w-full max-w-[420px] flex-col overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#FF6B00]">Filtres avancés</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-950">Affinez votre univers</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-700 transition hover:bg-slate-100"
                  aria-label="Fermer le panneau de filtres"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-5">
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Prix minimum</label>
                  <input
                    type="number"
                    min="0"
                    value={advanced.minPrice}
                    onChange={(event) => setAdvanced((current) => ({ ...current, minPrice: event.target.value }))}
                    placeholder="Ex. 10000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Prix maximum</label>
                  <input
                    type="number"
                    min="0"
                    value={advanced.maxPrice}
                    onChange={(event) => setAdvanced((current) => ({ ...current, maxPrice: event.target.value }))}
                    placeholder="Ex. 50000"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Note minimale</label>
                    <select
                      value={advanced.minRating}
                      onChange={(event) => setAdvanced((current) => ({ ...current, minRating: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                    >
                      <option value="">Aucune</option>
                      <option value="3">3+</option>
                      <option value="4">4+</option>
                      <option value="4.5">4.5+</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-slate-700">Condition</label>
                    <select
                      value={advanced.condition}
                      onChange={(event) => setAdvanced((current) => ({ ...current, condition: event.target.value }))}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                    >
                      <option value="">Toutes</option>
                      {CONDITION_OPTIONS.map((condition) => (
                        <option key={condition} value={condition}>{condition}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Marque</label>
                  <input
                    type="text"
                    value={advanced.brand}
                    onChange={(event) => setAdvanced((current) => ({ ...current, brand: event.target.value }))}
                    placeholder="Ex. Samsung"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                </div>
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Pays d'origine</label>
                  <input
                    type="text"
                    value={advanced.country}
                    onChange={(event) => setAdvanced((current) => ({ ...current, country: event.target.value }))}
                    placeholder="Ex. France"
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { name: 'Disponibilité', key: 'inStock' },
                    { name: 'Livraison gratuite', key: 'freeShipping' },
                    { name: 'Promotions', key: 'promotions' },
                    { name: 'Vendeurs vérifiés', key: 'verifiedSeller' },
                    { name: 'Boutiques Premium', key: 'premiumSeller' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.key}
                      onClick={() => setAdvanced((current) => ({ ...current, [item.key]: !current[item.key] }))}
                      className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${advanced[item.key] ? 'border-[#FF6B00] bg-[#FFF4E5] text-[#FF6B00]' : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'}`}
                    >
                      {item.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleResetAdvanced}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  Réinitialiser
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-full bg-[#FF6B00] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e75b00]"
                >
                  Appliquer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default React.memo(ProductFilters);
