import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Filter, SlidersHorizontal, X, ChevronDown, Star, ArrowUp, ArrowDown } from 'lucide-react';
import client from '../apiClient';
import ProductGrid from '../components/product/ProductGrid';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';

async function fetchCategory(slug) {
  const res = await client.get(`/categories/${slug}`);
  return res.data.data;
}

async function fetchCategoryProducts(slug) {
  const res = await client.get(`/categories/${slug}/products?limit=100`);
  return res.data.data || res.data;
}

const INITIAL_FILTERS = {
  sort: 'relevance',
  minPrice: '',
  maxPrice: '',
  inStock: false,
  freeShipping: false,
  brand: '',
  rating: '',
};

const RATING_TIERS = [4.5, 4, 3, 2];

function countActiveFilters(filters) {
  let count = 0;
  if (filters.minPrice) count += 1;
  if (filters.maxPrice) count += 1;
  if (filters.rating) count += 1;
  if (filters.inStock) count += 1;
  if (filters.freeShipping) count += 1;
  if (filters.brand) count += 1;
  return count;
}

/* ── Small building blocks, AliExpress-style ─────────────────────────── */

function FilterSection({ title, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 py-4 first:pt-0 last:border-b-0 last:pb-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</h4>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="mt-3 space-y-2">{children}</div>}
    </div>
  );
}

function StarRow({ tier, active, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={count === 0}
      className={`flex w-full items-center justify-between rounded-md px-1.5 py-1 text-xs font-semibold transition ${
        active ? 'bg-[#FFF1E5] text-[#FF6B00]' : 'text-slate-600 hover:bg-slate-50'
      } ${count === 0 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={13}
            className={i < Math.floor(tier) ? 'fill-[#FF6B00] text-[#FF6B00]' : 'fill-slate-200 text-slate-200'}
          />
        ))}
        <span className="ml-1">& plus</span>
      </span>
      <span className="text-slate-400">{count}</span>
    </button>
  );
}

function CheckRow({ label, checked, count, onChange }) {
  return (
    <label
      className={`flex items-center justify-between gap-2 rounded-md px-1.5 py-1 text-xs font-semibold cursor-pointer select-none ${
        count === 0 && !checked ? 'opacity-40' : ''
      }`}
    >
      <span className="flex items-center gap-2 text-slate-700">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={count === 0 && !checked}
          className="h-3.5 w-3.5 accent-[#FF6B00]"
        />
        {label}
      </span>
      <span className="text-slate-400">{count}</span>
    </label>
  );
}

/* ── Filter panel shared by desktop sidebar + mobile drawer ─────────── */

function FilterPanel({ filters, setFilters, facets }) {
  return (
    <>
      <FilterSection title="Prix (FCFA)">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="0"
            placeholder={facets.minBound != null ? `Min • ${facets.minBound}` : 'Min'}
            value={filters.minPrice}
            onChange={(e) => setFilters((p) => ({ ...p, minPrice: e.target.value }))}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-[#FF6B00]"
          />
          <input
            type="number"
            min="0"
            placeholder={facets.maxBound != null ? `Max • ${facets.maxBound}` : 'Max'}
            value={filters.maxPrice}
            onChange={(e) => setFilters((p) => ({ ...p, maxPrice: e.target.value }))}
            className="w-full rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs outline-none focus:border-[#FF6B00]"
          />
        </div>
      </FilterSection>

      <FilterSection title="Note des clients">
        {RATING_TIERS.map((tier) => (
          <StarRow
            key={tier}
            tier={tier}
            active={filters.rating === String(tier)}
            count={facets.ratingCounts[tier] || 0}
            onClick={() =>
              setFilters((p) => ({ ...p, rating: p.rating === String(tier) ? '' : String(tier) }))
            }
          />
        ))}
      </FilterSection>

      <FilterSection title="Livraison & stock">
        <CheckRow
          label="En stock uniquement"
          checked={filters.inStock}
          count={facets.inStockCount}
          onChange={(e) => setFilters((p) => ({ ...p, inStock: e.target.checked }))}
        />
        <CheckRow
          label="Livraison gratuite"
          checked={filters.freeShipping}
          count={facets.freeShippingCount}
          onChange={(e) => setFilters((p) => ({ ...p, freeShipping: e.target.checked }))}
        />
      </FilterSection>

      <FilterSection title="Marque">
        {facets.brands.length > 0 ? (
          <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
            {facets.brands.map(({ name, count }) => (
              <CheckRow
                key={name}
                label={name}
                checked={filters.brand === name}
                count={count}
                onChange={() => setFilters((p) => ({ ...p, brand: p.brand === name ? '' : name }))}
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Aucune marque renseignée pour cette catégorie.</p>
        )}
      </FilterSection>
    </>
  );
}

/* ── Removable chips summarising active filters ─────────────────────── */

function ActiveFilterChips({ filters, setFilters, onClearAll }) {
  const chips = [];
  if (filters.minPrice || filters.maxPrice) {
    chips.push({
      key: 'price',
      label: `Prix: ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'} FCFA`,
      clear: () => setFilters((p) => ({ ...p, minPrice: '', maxPrice: '' })),
    });
  }
  if (filters.rating) {
    chips.push({ key: 'rating', label: `${filters.rating}★ & plus`, clear: () => setFilters((p) => ({ ...p, rating: '' })) });
  }
  if (filters.inStock) {
    chips.push({ key: 'stock', label: 'En stock', clear: () => setFilters((p) => ({ ...p, inStock: false })) });
  }
  if (filters.freeShipping) {
    chips.push({ key: 'ship', label: 'Livraison gratuite', clear: () => setFilters((p) => ({ ...p, freeShipping: false })) });
  }
  if (filters.brand) {
    chips.push({ key: 'brand', label: filters.brand, clear: () => setFilters((p) => ({ ...p, brand: '' })) });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pb-1">
      {chips.map((chip) => (
        <button
          key={chip.key}
          type="button"
          onClick={chip.clear}
          className="flex items-center gap-1 rounded-full bg-[#FFF1E5] px-3 py-1 text-xs font-semibold text-[#FF6B00] hover:bg-[#FFE4CC]"
        >
          {chip.label} <X size={12} />
        </button>
      ))}
      <button type="button" onClick={onClearAll} className="text-xs font-bold text-slate-400 hover:text-slate-600 hover:underline">
        Tout effacer
      </button>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function CategoryPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();

  const { data: cat, isLoading: loadingCat, error: categoryError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory(slug),
    enabled: !!slug,
  });

  const { data: productsData, isLoading: loadingProducts } = useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: () => fetchCategoryProducts(slug),
    enabled: !!slug,
  });

  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const productsList = Array.isArray(productsData) ? productsData : productsData?.data || [];

  // Facets are counted straight from the real fetched product list —
  // never invented — so every number in the sidebar is trustworthy.
  const facets = useMemo(() => {
    const brandMap = new Map();
    const ratingCounts = {};
    let inStockCount = 0;
    let freeShippingCount = 0;
    let minBound = null;
    let maxBound = null;

    for (const p of productsList) {
      const price = Number(p.promoPrice || p.price || 0);
      if (price > 0) {
        minBound = minBound == null ? price : Math.min(minBound, price);
        maxBound = maxBound == null ? price : Math.max(maxBound, price);
      }
      if (Number(p.stock || 0) > 0) inStockCount += 1;
      if (Boolean(p.freeShipping) || price >= 50000) freeShippingCount += 1;
      if (p.brand) {
        const key = String(p.brand).trim();
        if (key) brandMap.set(key, (brandMap.get(key) || 0) + 1);
      }
      if (p.rating != null) {
        for (const tier of RATING_TIERS) {
          if (Number(p.rating) >= tier) {
            ratingCounts[tier] = (ratingCounts[tier] || 0) + 1;
          }
        }
      }
    }

    const brands = Array.from(brandMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));

    return { brands, ratingCounts, inStockCount, freeShippingCount, minBound, maxBound };
  }, [productsList]);

  const filteredProducts = useMemo(() => {
    let result = [...productsList];

    if (filters.minPrice) {
      result = result.filter((p) => (p.promoPrice || p.price) >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      result = result.filter((p) => (p.promoPrice || p.price) <= Number(filters.maxPrice));
    }
    if (filters.rating) {
      // A product with no stored rating never satisfies a minimum-rating
      // filter — it's excluded, not assigned a fictional score.
      result = result.filter((p) => p.rating != null && Number(p.rating) >= Number(filters.rating));
    }
    if (filters.inStock) {
      result = result.filter((p) => Number(p.stock || 0) > 0);
    }
    if (filters.freeShipping) {
      result = result.filter((p) => Boolean(p.freeShipping) || (p.promoPrice || p.price) >= 50000);
    }
    if (filters.brand) {
      result = result.filter((p) => p.brand === filters.brand);
    }

    if (filters.sort === 'price-asc') {
      result.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
    } else if (filters.sort === 'price-desc') {
      result.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
    } else if (filters.sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    } else {
      result.sort((a, b) => Number(Boolean(b.isBoosted)) - Number(Boolean(a.isBoosted)));
    }

    return result;
  }, [productsList, filters]);

  const activeFilterCount = countActiveFilters(filters);
  const handleResetFilters = () => setFilters(INITIAL_FILTERS);

  useEffect(() => {
    if (!mobileFiltersOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setMobileFiltersOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileFiltersOpen]);

  const isLoaded = !loadingCat && !categoryError && cat;

  const sortTabs = [
    { key: 'relevance', label: 'Pertinence' },
    { key: 'newest', label: 'Nouveautés' },
  ];
  const priceTabActive = filters.sort === 'price-asc' || filters.sort === 'price-desc';
  const activeSortKey = priceTabActive ? 'price' : filters.sort;

  const togglePriceSort = () => {
    setFilters((p) => ({ ...p, sort: p.sort === 'price-asc' ? 'price-desc' : 'price-asc' }));
  };

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900 flex flex-col justify-between">
      <div>
        <Header />

        <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="text-xs text-slate-400 font-semibold mb-3 flex items-center gap-1.5">
            <Link to="/" className="hover:text-[#FF6B00] transition">Accueil</Link>
            <span>/</span>
            <span className="text-slate-600 truncate">{isLoaded ? cat.name : 'Catégorie'}</span>
          </nav>

          {/* Title */}
          <header className="mb-4">
            {loadingCat ? (
              <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
            ) : isLoaded ? (
              <h1 className="text-xl font-black text-slate-900 tracking-tight">{cat.name}</h1>
            ) : (
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Catégorie introuvable</h1>
            )}
            {isLoaded && cat.description && (
              <p className="text-xs text-slate-500 mt-1 font-medium">{cat.description}</p>
            )}
            {!loadingCat && !isLoaded && (
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Cette catégorie n&apos;existe plus ou son lien est incorrect.
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* ── LEFT SIDEBAR FILTERS (Desktop) ── */}
            <aside className="hidden lg:block lg:col-span-3 bg-white border border-slate-200 rounded-lg p-4 shadow-sm h-fit lg:sticky lg:top-[104px]">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-[11px] font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <SlidersHorizontal size={13} className="text-[#FF6B00]" /> Filtres
                </h3>
                <button onClick={handleResetFilters} className="text-[11px] font-bold text-[#FF6B00] hover:underline cursor-pointer">
                  Effacer
                </button>
              </div>
              <FilterPanel filters={filters} setFilters={setFilters} facets={facets} />
            </aside>

            {/* ── MAIN CONTENT LISTING (9 cols) ── */}
            <main className="lg:col-span-9 space-y-3">
              {/* Sort bar */}
              <div className="bg-white border border-slate-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between gap-3 px-3 py-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setMobileFiltersOpen(true)}
                      className="lg:hidden relative mr-1 flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Filter size={13} /> Filtres
                      {activeFilterCount > 0 && (
                        <span className="ml-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B00] text-[10px] font-bold text-white">
                          {activeFilterCount}
                        </span>
                      )}
                    </button>

                    {sortTabs.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setFilters((p) => ({ ...p, sort: tab.key }))}
                        className={`rounded-md px-3 py-1.5 text-xs font-bold transition ${
                          activeSortKey === tab.key
                            ? 'bg-[#FF6B00] text-white'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}

                    <button
                      onClick={togglePriceSort}
                      className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-bold transition ${
                        priceTabActive ? 'bg-[#FF6B00] text-white' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Prix
                      {filters.sort === 'price-asc' && <ArrowUp size={12} />}
                      {filters.sort === 'price-desc' && <ArrowDown size={12} />}
                    </button>
                  </div>

                  <span className="hidden sm:inline whitespace-nowrap text-xs font-semibold text-slate-400">
                    {loadingProducts ? '…' : `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''}`}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-3 py-2 sm:hidden">
                  <span className="text-xs font-semibold text-slate-400">
                    {loadingProducts ? '…' : `${filteredProducts.length} produit${filteredProducts.length > 1 ? 's' : ''}`}
                  </span>
                </div>
              </div>

              <ActiveFilterChips filters={filters} setFilters={setFilters} onClearAll={handleResetFilters} />

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

      {/* ── MOBILE FILTER DRAWER ── */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Filtres">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setMobileFiltersOpen(false)} />
          <aside className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white shadow-2xl p-5 flex flex-col justify-between overflow-y-auto">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <SlidersHorizontal size={15} className="text-[#FF6B00]" /> Filtres
                </h3>
                <button
                  onClick={() => setMobileFiltersOpen(false)}
                  aria-label="Fermer les filtres"
                  className="p-1 rounded-full text-slate-500 hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <FilterPanel filters={filters} setFilters={setFilters} facets={facets} />
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3 sticky bottom-0 bg-white">
              <button
                onClick={handleResetFilters}
                className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
              >
                Effacer
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="flex-1 rounded-md bg-[#FF6B00] py-2.5 text-xs font-bold text-white shadow hover:bg-[#e75b00]"
              >
                Voir les résultats{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}
              </button>
            </div>
          </aside>
        </div>
      )}

      <Footer />
    </div>
  );
}