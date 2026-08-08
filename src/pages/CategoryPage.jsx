import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal, X, Star, CheckCircle, Truck, Package, ShieldCheck } from 'lucide-react';
import client from '../apiClient';
import ProductGrid from '../components/product/ProductGrid';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { applyProductFilters } from '../utils/productFilters';
import { useCart } from '../context/CartContext';

async function fetchCategory(slug) {
  const res = await client.get(`/categories/${slug}`);
  return res.data.data;
}

async function fetchCategoryProducts(slug) {
  const res = await client.get(`/categories/${slug}/products?limit=100`);
  return res.data.data || res.data;
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const { data: cat, isLoading: loadingCat, error: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory(slug),
    enabled: !!slug
  });
  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: () => fetchCategoryProducts(slug),
    enabled: !!slug
  });

  // Filters State
  const [filters, setFilters] = useState({
    category: '',
    sort: 'relevance',
    minPrice: '',
    maxPrice: '',
    onlyPromo: false,
    inStock: false,
    newArrival: false,
    brand: '',
    condition: '',
    rating: '',
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];

  // Filter and sort items client side for maximum reliability
  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    // Price filters
    if (filters.minPrice) {
      result = result.filter(p => (p.promoPrice || p.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter(p => (p.promoPrice || p.price) <= Number(filters.maxPrice));
    }

    // Rating filters
    if (filters.rating) {
      result = result.filter(p => (p.rating || 4.5) >= Number(filters.rating));
    }

    // In Stock filter
    if (filters.inStock) {
      result = result.filter(p => Number(p.stock || 0) > 0);
    }

    // Free Shipping filter
    if (filters.freeShipping) {
      result = result.filter(p => p.freeShipping || p.price >= 50000);
    }

    // Brand filter
    if (filters.brand) {
      result = result.filter(p => p.brand?.toLowerCase().includes(filters.brand.toLowerCase()));
    }

    // Sorting
    if (filters.sort === 'price-asc') {
      result.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
    } else if (filters.sort === 'popular' || filters.sort === 'relevance') {
      result.sort((a, b) => Number(b.isBoosted || false) - Number(a.isBoosted || false));
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return result;
  }, [productsList, filters]);

  const handleResetFilters = () => {
    setFilters({
      category: '',
      sort: 'relevance',
      minPrice: '',
      maxPrice: '',
      onlyPromo: false,
      inStock: false,
      newArrival: false,
      brand: '',
      condition: '',
      rating: '',
    });
  };

  const isLoaded = !loadingCat && !categoryError && cat;

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900 flex flex-col justify-between">
      <div>
        <Header />

        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-slate-400 font-semibold mb-4 flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#FF6B00] transition">Accueil</Link>
            <span>/</span>
            <span className="text-slate-600 truncate">{isLoaded ? cat.name : 'Catégorie'}</span>
          </nav>

          {/* Header row */}
          <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {isLoaded ? cat.name : 'Chargement...'}
              </h1>
              {isLoaded && cat.description && (
                <p className="text-xs text-slate-500 mt-1 font-medium">{cat.description}</p>
              )}
            </div>
            <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-full text-xs font-bold text-slate-600">
              {filteredProducts.length} produits trouvés
            </span>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ── LEFT SIDEBAR FILTERS (Desktop) ── */}
            <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-3xl p-5 shadow-sm space-y-6 h-fit sticky top-24">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <SlidersHorizontal size={14} className="text-[#FF6B00]" /> Filtres
                </h3>
                <button onClick={handleResetFilters} className="text-xs font-bold text-[#FF6B00] hover:underline cursor-pointer">
                  Effacer
                </button>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prix (FCFA)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note minimale</h4>
                <select
                  value={filters.rating}
                  onChange={e => setFilters(p => ({ ...p, rating: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                >
                  <option value="">Toutes les notes</option>
                  <option value="4.5">4.5 ★ & plus</option>
                  <option value="4">4.0 ★ & plus</option>
                  <option value="3">3.0 ★ & plus</option>
                </select>
              </div>

              {/* Availability & Shipping toggles */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Options</h4>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={e => setFilters(p => ({ ...p, inStock: e.target.checked }))}
                    className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span>En stock uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.freeShipping}
                    onChange={e => setFilters(p => ({ ...p, freeShipping: e.target.checked }))}
                    className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span>Livraison gratuite</span>
                </label>
              </div>

              {/* Brand filter */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marque</h4>
                <input
                  type="text"
                  placeholder="Ex. Samsung"
                  value={filters.brand}
                  onChange={e => setFilters(p => ({ ...p, brand: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                />
              </div>
            </aside>

            {/* ── MAIN CONTENT LISTING (9 cols) ── */}
            <main className="lg:col-span-9 space-y-4">
              {/* Sort controls and mobile filter button */}
              <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {/* Mobile filter button */}
                  <button
                    onClick={() => setMobileFiltersOpen(true)}
                    className="lg:hidden flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Filter size={14} /> Filtres
                  </button>
                </div>

                {/* Sort selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline">Trier par:</span>
                  <select
                    value={filters.sort}
                    onChange={e => setFilters(p => ({ ...p, sort: e.target.value }))}
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-[#FF6B00] cursor-pointer"
                  >
                    <option value="relevance">Pertinence</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="newest">Nouveautés</option>
                  </select>
                </div>
              </div>

              {/* Products feed */}
              <ProductGrid
                products={filteredProducts}
                loading={loadingProducts}
                onAddToCart={addToCart}
                showFilters={false}
              />
            </main>
          </div>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER (Mobile) ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setMobileFiltersOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal size={16} className="text-[#FF6B00]" /> Filtres
                </h3>
                <button onClick={() => setMobileFiltersOpen(false)} className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>

              {/* Price range */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Prix (FCFA)</h4>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={e => setFilters(p => ({ ...p, minPrice: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={e => setFilters(p => ({ ...p, maxPrice: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                  />
                </div>
              </div>

              {/* Rating */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Note minimale</h4>
                <select
                  value={filters.rating}
                  onChange={e => setFilters(p => ({ ...p, rating: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                >
                  <option value="">Toutes les notes</option>
                  <option value="4.5">4.5 ★ & plus</option>
                  <option value="4">4.0 ★ & plus</option>
                  <option value="3">3.0 ★ & plus</option>
                </select>
              </div>

              {/* Availability & Shipping */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Options</h4>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.inStock}
                    onChange={e => setFilters(p => ({ ...p, inStock: e.target.checked }))}
                    className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span>En stock uniquement</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={filters.freeShipping}
                    onChange={e => setFilters(p => ({ ...p, freeShipping: e.target.checked }))}
                    className="rounded text-[#FF6B00] focus:ring-[#FF6B00]"
                  />
                  <span>Livraison gratuite</span>
                </label>
              </div>

              {/* Brand */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marque</h4>
                <input
                  type="text"
                  placeholder="Ex. Samsung"
                  value={filters.brand}
                  onChange={e => setFilters(p => ({ ...p, brand: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-[#FF6B00]"
                />
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Effacer
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-xl bg-[#FF6B00] py-2.5 text-xs font-bold text-white shadow hover:bg-[#e75b00]"
              >
                Appliquer
              </button>
            </div>
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
}
