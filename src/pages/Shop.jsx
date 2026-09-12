import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, X } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ProductCard from '../components/product/ProductCard';
import ShopSeo from '../components/shop/ShopSeo';
import ShopHeader from '../components/shop/ShopHeader';
import ShopStats from '../components/shop/ShopStats';
import ShopFilters from '../components/shop/ShopFilters';
import ShopAbout from '../components/shop/ShopAbout';
import ShopEmptyState from '../components/shop/ShopEmptyState';
import { useStore, useStoreProducts } from '../hooks/useStore';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/ToastProvider';
import { getProductImage } from '../utils/imageUrl';
import './Shop.css';

const LIMIT = 24;

function useDebouncedValue(value, delay = 300) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

function SkeletonGrid({ count = 8 }) {
  return (
    <div className="shop-grid" aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="shop-skel-card" />
      ))}
    </div>
  );
}

function normalizeProduct(p, sellerVerified) {
  if (!p) return null;
  return {
    ...p,
    image: getProductImage(p) || p.image,
    promoPrice: p.promoPrice ?? p.salePrice,
    sellerName: p.sellerName || p.vendorName,
    sellerVerified: p.sellerVerified ?? sellerVerified,
    isNew: p.isNew ?? p.isNewArrival,
  };
}

function buildWhatsAppUrl(raw) {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (!digits) return null;
  return `https://wa.me/${digits}`;
}

export default function Shop() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const toast = useToast();

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [inStock, setInStock] = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  const [newOnly, setNewOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(searchInput, 320);

  const queryParams = useMemo(
    () => ({
      page,
      limit: LIMIT,
      search: debouncedSearch,
      category,
      sort,
      minPrice,
      maxPrice,
      inStock: inStock ? 'true' : '',
      isPromo: promoOnly ? 'true' : '',
      isNew: newOnly ? 'true' : '',
    }),
    [page, debouncedSearch, category, sort, minPrice, maxPrice, inStock, promoOnly, newOnly]
  );

  const { data: storePayload, isLoading: storeLoading, isError: storeError } = useStore(slug);
  const store = storePayload?.store;
  const seller = storePayload?.seller;
  const stats = storePayload?.stats || {};

  const productsQuery = useStoreProducts(slug, queryParams);

  const products = useMemo(
    () =>
      (productsQuery.data?.products || [])
        .map((p) => normalizeProduct(p, seller?.isVerified))
        .filter(Boolean),
    [productsQuery.data, seller?.isVerified]
  );

  const pagination = productsQuery.data?.pagination;
  const totalItems = pagination?.totalItems ?? 0;
  const totalPages = pagination?.totalPages ?? 1;

  const hasActiveFilters = Boolean(
    category || minPrice || maxPrice || inStock || promoOnly || newOnly || debouncedSearch
  );

  const resetFilters = useCallback(() => {
    setSearchInput('');
    setCategory('');
    setSort('newest');
    setMinPrice('');
    setMaxPrice('');
    setInStock(false);
    setPromoOnly(false);
    setNewOnly(false);
    setPage(1);
    setMobileFiltersOpen(false);
  }, []);

  const handleContact = useCallback(() => {
    const wa =
      buildWhatsAppUrl(store?.whatsapp) || buildWhatsAppUrl(seller?.phone);
    if (wa) {
      window.open(wa, '_blank', 'noopener,noreferrer');
      return;
    }
    if (seller?.email) {
      window.location.href = `mailto:${seller.email}?subject=${encodeURIComponent(
        `Contact – Boutique ${store?.name || ''}`
      )}`;
      return;
    }
    toast?.info?.('Coordonnées du vendeur indisponibles pour le moment.');
  }, [store, seller, toast]);

  const handleShare = useCallback(async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = store?.name || 'Boutique Dango Import';
    const text = `Découvrez la boutique ${title} sur Dango Import`;
    try {
      if (navigator.share) {
        await navigator.share({ title, text, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast?.success?.('Lien de la boutique copié');
    } catch (err) {
      if (err?.name === 'AbortError') return;
      try {
        await navigator.clipboard.writeText(url);
        toast?.success?.('Lien de la boutique copié');
      } catch {
        /* ignore */
      }
    }
  }, [store?.name, toast]);

  const handleAddToCart = useCallback(
    (product) => {
      addToCart?.(product);
      toast?.success?.('Produit ajouté au panier');
    },
    [addToCart, toast]
  );

  const bumpPage = useCallback((fn) => {
    setPage(fn);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const filterHandlers = {
    searchInput,
    onSearchChange: (v) => {
      setSearchInput(v);
      setPage(1);
    },
    category,
    categories: stats.categories || [],
    onCategoryChange: (v) => {
      setCategory(v);
      setPage(1);
      setMobileFiltersOpen(false);
    },
    sort,
    onSortChange: (v) => {
      setSort(v);
      setPage(1);
    },
    minPrice,
    maxPrice,
    onMinPriceChange: (v) => {
      setMinPrice(v);
      setPage(1);
    },
    onMaxPriceChange: (v) => {
      setMaxPrice(v);
      setPage(1);
    },
    inStock,
    onInStockChange: (v) => {
      setInStock(v);
      setPage(1);
    },
    promoOnly,
    onPromoOnlyChange: (v) => {
      setPromoOnly(v);
      setPage(1);
    },
    newOnly,
    onNewOnlyChange: (v) => {
      setNewOnly(v);
      setPage(1);
    },
    onReset: resetFilters,
    totalItems,
    mobileOpen: mobileFiltersOpen,
    onMobileToggle: () => setMobileFiltersOpen((o) => !o),
  };

  const storeMissing = !storeLoading && (storeError || !storePayload || !store);

  return (
    <div className="shop-page">
      <Header />
      <ShopSeo store={store} seller={seller} productCount={stats.productCount} />

      <div className="shop-container">
        {storeLoading ? (
          <>
            <div className="shop-skel shop-skel-header" />
            <SkeletonGrid />
          </>
        ) : storeMissing ? (
          <div className="shop-not-found">
            <h2>Boutique introuvable</h2>
            <p>La boutique demandée est introuvable ou a été supprimée.</p>
            <Link to="/" className="shop-btn shop-btn--primary" style={{ textDecoration: 'none' }}>
              Retour à l&apos;accueil
            </Link>
          </div>
        ) : (
          <>
            <ShopHeader
              store={store}
              seller={seller}
              stats={stats}
              onContact={handleContact}
              onShare={handleShare}
            />

            <ShopStats stats={stats} joinedYear={stats.joinedYear} />

            <div className="shop-layout">
              <aside className="shop-aside">
                <ShopFilters {...filterHandlers} />
              </aside>

              <main className="shop-main">
                {/* Desktop search / sort (sidebar hides its toolbar via CSS on lg) */}
                <div className="shop-main-toolbar">
                  <div className="shop-filters__search">
                    <Search size={16} aria-hidden />
                    <input
                      type="search"
                      placeholder="Rechercher dans cette boutique…"
                      value={searchInput}
                      onChange={(e) => {
                        setSearchInput(e.target.value);
                        setPage(1);
                      }}
                      aria-label="Rechercher un produit dans la boutique"
                    />
                    {searchInput ? (
                      <button
                        type="button"
                        className="shop-filters__clear-input"
                        onClick={() => {
                          setSearchInput('');
                          setPage(1);
                        }}
                        aria-label="Effacer la recherche"
                      >
                        <X size={14} />
                      </button>
                    ) : null}
                  </div>
                  <div className="shop-filters__sort-wrap">
                    <label htmlFor="shop-sort-main" className="shop-filters__sort-label">
                      Trier par
                    </label>
                    <select
                      id="shop-sort-main"
                      value={sort}
                      onChange={(e) => {
                        setSort(e.target.value);
                        setPage(1);
                      }}
                    >
                      <option value="newest">Nouveautés</option>
                      <option value="price-asc">Prix croissant</option>
                      <option value="price-desc">Prix décroissant</option>
                      <option value="promo">Promotions</option>
                      <option value="name-asc">Nom A → Z</option>
                      <option value="name-desc">Nom Z → A</option>
                    </select>
                  </div>
                </div>

                {/* Horizontal categories on mobile / tablet */}
                <div className="shop-categories" aria-label="Catégories">
                  <button
                    type="button"
                    className={`shop-chip ${!category ? 'is-active' : ''}`}
                    onClick={() => {
                      setCategory('');
                      setPage(1);
                    }}
                  >
                    Toutes
                  </button>
                  {(stats.categories || []).map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`shop-chip ${category === c ? 'is-active' : ''}`}
                      onClick={() => {
                        setCategory(c);
                        setPage(1);
                      }}
                    >
                      {c}
                    </button>
                  ))}
                </div>

                {typeof totalItems === 'number' && !productsQuery.isLoading ? (
                  <p className="shop-results-meta">
                    {totalItems} produit{totalItems > 1 ? 's' : ''}
                    {category ? ` · ${category}` : ''}
                    {debouncedSearch ? ` · « ${debouncedSearch} »` : ''}
                  </p>
                ) : null}

                {productsQuery.isLoading || (productsQuery.isFetching && products.length === 0) ? (
                  <SkeletonGrid />
                ) : productsQuery.isError ? (
                  <div className="shop-empty">
                    <h3>Erreur de chargement</h3>
                    <p>Impossible de charger les produits de cette boutique.</p>
                    <button
                      type="button"
                      className="shop-btn shop-btn--primary"
                      onClick={() => productsQuery.refetch()}
                    >
                      Réessayer
                    </button>
                  </div>
                ) : products.length === 0 ? (
                  <ShopEmptyState
                    filtered={hasActiveFilters || stats.productCount > 0}
                    onReset={hasActiveFilters ? resetFilters : undefined}
                  />
                ) : (
                  <motion.div
                    className="shop-grid"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: productsQuery.isFetching ? 0.65 : 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {products.map((p) => (
                      <ProductCard
                        key={p._id || p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </motion.div>
                )}

                {totalPages > 1 && products.length > 0 ? (
                  <div className="shop-pagination">
                    <button
                      type="button"
                      className="shop-btn shop-btn--ghost"
                      disabled={page <= 1}
                      onClick={() => bumpPage((v) => Math.max(1, v - 1))}
                    >
                      Précédent
                    </button>
                    <span>
                      Page {pagination?.currentPage || page} / {totalPages}
                    </span>
                    <button
                      type="button"
                      className="shop-btn shop-btn--ghost"
                      disabled={page >= totalPages}
                      onClick={() => bumpPage((v) => v + 1)}
                    >
                      Suivant
                    </button>
                  </div>
                ) : null}
              </main>
            </div>

            <ShopAbout store={store} seller={seller} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
