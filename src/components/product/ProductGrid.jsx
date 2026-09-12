import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PackageSearch,
  LayoutGrid,
  Wand2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';

import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { applyProductFilters } from '../../utils/productFilters';
import {
  isProductOnPromo,
  isProductNewArrival,
  isProductBestSeller,
  getDiscountPercent,
} from '../../utils/productPromo';

const PAGE_SIZE = 12;

const BANNER_SLIDES = [
  {
    key: 'new',
    title: 'Les Nouveautés',
    subtitle: 'Soyez le premier à découvrir nos tout derniers arrivages',
    badge: 'Nouveaux',
    btnText: 'Découvrir',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },
  {
    key: 'promo',
    title: 'Nos Promotions Spéciales',
    subtitle: 'Profitez de réductions incroyables et de prix cassés',
    badge: 'Promos -50%',
    btnText: 'Profiter des offres',
    gradient: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
  }
];

/* =========================================================
   TAB FILTER
========================================================= */

const CATALOG_TABS = [
  { key: 'all', label: 'Tous' },
  { key: 'promo', label: 'Promotions' },
  { key: 'new', label: 'Nouveautés' },
  { key: 'bestseller', label: 'Meilleures ventes' },
];

function matchesTab(product, tabKey) {
  if (tabKey === 'all') return true;

  switch (tabKey) {
    case 'bestseller':
      return isProductBestSeller(product);

    case 'recommended':
      return Boolean(product?.isRecommended ?? product?.recommended);

    case 'forYou':
      return Boolean(product?.isForYou ?? product?.forYou ?? product?.recommendedForUser);

    case 'new':
      return isProductNewArrival(product);

    case 'promo':
      return isProductOnPromo(product);

    default:
      return true;
  }
}

function CatalogTabs({ activeTab, onChange }) {
  return (
    <div
      className="mb-4 flex gap-2 overflow-x-auto px-2 pb-1 sm:px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="tablist"
      aria-label="Filtrer les produits"
    >
      {CATALOG_TABS.map(({ key, label }) => {
        const active = activeTab === key;
        return (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(key)}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-[#FF6B00] text-white shadow-sm'
                : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

/* =========================================================
   BANNER SLIDER (Large sliding banner representing each category)
========================================================= */

function BannerSlider({ activeTab, onChange, products = [] }) {
  const matchedIndex = BANNER_SLIDES.findIndex(s => s.key === activeTab);
  const currentIndex = matchedIndex >= 0 ? matchedIndex : 0;
  const slide = BANNER_SLIDES[currentIndex];

  // Dynamically find a matching product image from the database products list
  const getProductImageForCategory = (key) => {
    if (key === 'new') {
      const match = products.find(p => p.isNewArrival || p.isNew || p.isFeatured);
      return match?.image || '';
    } else if (key === 'promo') {
      const match = products.find(p => p.promoPrice || p.isPromo);
      return match?.image || '';
    }
    return '';
  };

  const productImage = getProductImageForCategory(slide.key);

  const handlePrev = () => {
    const nextIndex = (currentIndex - 1 + BANNER_SLIDES.length) % BANNER_SLIDES.length;
    onChange(BANNER_SLIDES[nextIndex].key);
  };

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % BANNER_SLIDES.length;
    onChange(BANNER_SLIDES[nextIndex].key);
  };

  return (
    <div className="relative w-full mb-8 px-2 sm:px-0">
      <style>{`
        .dango-banner {
          position: relative;
          width: 100%;
          min-height: 190px;
          border-radius: 20px;
          padding: 28px 36px;
          color: #ffffff;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: space-between;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04);
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .dango-banner__bg-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.12;
          background-image: radial-gradient(circle at 1px 1px, white 1px, transparent 0);
          background-size: 20px 20px;
          z-index: 1;
        }

        .dango-banner__content {
          position: relative;
          z-index: 2;
          max-width: 70%;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }

        .dango-banner__badge {
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          background: rgba(255, 255, 255, 0.25);
          padding: 4px 12px;
          border-radius: 9999px;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .dango-banner__title {
          font-size: clamp(20px, 4vw, 30px);
          font-weight: 900;
          line-height: 1.1;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .dango-banner__subtitle {
          font-size: clamp(12px, 2vw, 14px);
          font-weight: 500;
          opacity: 0.9;
          margin: 0;
          line-height: 1.4;
        }

        .dango-banner__btn {
          margin-top: 12px;
          background: #ffffff;
          color: #0f172a;
          border: none;
          padding: 8px 20px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }

        .dango-banner__btn:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 15px rgba(0,0,0,0.1);
        }

        .dango-banner__visual {
          position: relative;
          z-index: 2;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .dango-banner__img-wrap {
          position: relative;
          z-index: 2;
          width: 130px;
          height: 130px;
          border-radius: 16px;
          overflow: hidden;
          background: #ffffff;
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid rgba(255, 255, 255, 0.3);
          transition: transform 0.3s ease;
        }

        .dango-banner:hover .dango-banner__img-wrap {
          transform: scale(1.05) rotate(2deg);
        }

        .dango-banner__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dango-banner__img-placeholder {
          width: 130px;
          height: 130px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.25);
          backdrop-filter: blur(8px);
          border: 2px dashed rgba(255, 255, 255, 0.4);
        }

        .dango-banner-nav {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          z-index: 10;
          width: 38px;
          height: 38px;
          background: rgba(255, 255, 255, 0.92);
          border: 1px solid rgba(0,0,0,0.05);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0f172a;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }

        .dango-banner-nav:hover {
          background: #ffffff;
          transform: translateY(-50%) scale(1.08);
        }

        .dango-banner-nav--prev { left: 16px; }
        .dango-banner-nav--next { right: 16px; }

        @media (max-width: 640px) {
          .dango-banner {
            padding: 20px;
            min-height: 160px;
          }
          .dango-banner__content {
            max-width: 75%;
          }
          .dango-banner__img-wrap,
          .dango-banner__img-placeholder {
            width: 100px;
            height: 100px;
          }
          .dango-banner-nav {
            display: none;
          }
        }

        /* ── Dots ── */
        .dango-banner-dots {
          display: flex;
          justify-content: center;
          gap: 6px;
          margin-top: 12px;
        }

        .dango-banner-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #e2e8f0;
          border: none;
          cursor: pointer;
          padding: 0;
          transition: all 0.2s;
        }

        .dango-banner-dot--active {
          width: 24px;
          border-radius: 4px;
          background: #FF6B00;
        }
      `}</style>

      {/* Nav Prev */}


      {/* Slide Container */}
      <div className="dango-banner" style={{ background: slide.gradient }}>
        <div className="dango-banner__bg-pattern" />
        
        <div className="dango-banner__content">
          <h2 className="dango-banner__title">{slide.title}</h2>
          <p className="dango-banner__subtitle">{slide.subtitle}</p>
          <button className="dango-banner__btn" type="button">
            {slide.btnText}
          </button>
        </div>

        <div className="dango-banner__visual">
          {productImage ? (
            <div className="dango-banner__img-wrap">
              <img src={productImage} alt={slide.title} className="dango-banner__img" />
            </div>
          ) : (
            <div className="dango-banner__img-placeholder" />
          )}
        </div>
      </div>

      {/* Nav Next 
      <button className="dango-banner-nav dango-banner-nav--next" onClick={handleNext} type="button">
        <ChevronRight size={20} />
      </button>*/}

      {/* Dots Indicator */}
      <div className="dango-banner-dots">
        {BANNER_SLIDES.map((s, idx) => {
          const isDotActive = activeTab === s.key || (activeTab === 'all' && idx === 0);
          return (
            <button
              key={s.key}
              className={`dango-banner-dot ${isDotActive ? 'dango-banner-dot--active' : ''}`}
              onClick={() => onChange(s.key)}
              type="button"
              aria-label={`Slide ${idx + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ onReset, retrying = false }) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      style={{
        gridColumn: '1 / -1',
        columnSpan: 'all',
        textAlign: 'center',
        padding: '40px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        maxWidth: '560px',
        margin: '0 auto',
        breakInside: 'avoid',
      }}
    >
      <PackageSearch
        size={52}
        style={{
          color: '#d5d5d5',
          margin: '0 auto',
        }}
      />

      <p
        style={{
          fontSize: '16px',
          fontWeight: 700,
          color: '#555',
          margin: 0,
        }}
      >
        Aucun produit trouvé
      </p>

      <p
        style={{
          fontSize: '13px',
          color: '#9a9a9a',
          margin: 0,
        }}
      >
        Essayez d&apos;ajuster vos filtres ou votre recherche.
      </p>

      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          disabled={retrying}
          className="
            mt-2
            inline-flex
            items-center
            gap-2
            rounded-full
            bg-[#FF6B00]
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition-colors
            hover:bg-[#e75b00]
            disabled:opacity-70
            disabled:cursor-not-allowed
          "
        >
          <RefreshCw size={15} className={retrying ? 'animate-spin' : ''} />
          {retrying ? 'Actualisation...' : 'Réessayer'}
        </button>
      ) : null}
    </motion.div>
  );
}


 /**=========================================================
   DEAL DU JOUR / MEILLEURES VENTES — panneau avec fond dédié
   et défilement automatique entre les pages de produits
 * =========================================================*/

const PROMO_ITEMS_PER_PAGE = 2;
const PROMO_AUTOPLAY_MS = 4500;

function PromoSection({ products = [], onAddToCart }) {
  const promoIds = useMemo(() => {
    const ids = new Set();
    products.forEach((p) => {
      if (isProductOnPromo(p)) ids.add(p._id || p.id);
    });
    return ids;
  }, [products]);

  const bestSellersAll = useMemo(() => {
    return [...products]
      .filter((p) => isProductBestSeller(p) && !promoIds.has(p._id || p.id))
      .sort((a, b) => {
        const salesA = Number(a.totalSales || a.soldCount || a.sales || 0);
        const salesB = Number(b.totalSales || b.soldCount || b.sales || 0);
        if (salesB !== salesA) return salesB - salesA;
        return Number(b.rating || 0) - Number(a.rating || 0);
      })
      .slice(0, 6);
  }, [products, promoIds]);

  const dealsAll = useMemo(() => {
    return products
      .filter((p) => isProductOnPromo(p))
      .sort((a, b) => getDiscountPercent(b) - getDiscountPercent(a))
      .slice(0, 6);
  }, [products]);

  const maxDiscountPercent = useMemo(() => {
    if (dealsAll.length === 0) return 0;
    return Math.max(...dealsAll.map((p) => getDiscountPercent(p)));
  }, [dealsAll]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      Math.max(bestSellersAll.length, dealsAll.length, 1) / PROMO_ITEMS_PER_PAGE
    )
  );

  const [pageIndex, setPageIndex] = useState(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    if (pageIndex >= totalPages) setPageIndex(0);
  }, [totalPages, pageIndex]);

  // Défilement automatique — en pause tant que la souris est sur le panneau
  useEffect(() => {
    if (totalPages <= 1) return undefined;
    const id = setInterval(() => {
      if (!pausedRef.current) {
        setPageIndex((i) => (i + 1) % totalPages);
      }
    }, PROMO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [totalPages]);

  const bestSellersPage = bestSellersAll.slice(
    pageIndex * PROMO_ITEMS_PER_PAGE,
    pageIndex * PROMO_ITEMS_PER_PAGE + PROMO_ITEMS_PER_PAGE
  );
  const dealsPage = dealsAll.slice(
    pageIndex * PROMO_ITEMS_PER_PAGE,
    pageIndex * PROMO_ITEMS_PER_PAGE + PROMO_ITEMS_PER_PAGE
  );

  const goPrev = () => setPageIndex((i) => (i - 1 + totalPages) % totalPages);
  const goNext = () => setPageIndex((i) => (i + 1) % totalPages);

  if (bestSellersAll.length === 0 && dealsAll.length === 0) return null;

  return (
    <div
      className="relative w-full max-w-5xl mx-auto px-2 sm:px-0"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
    >
      <style>{`
        .dango-promo-panel {
          position: relative;
          overflow: hidden;
          border-radius: 0;
          padding: 36px 24px 30px;
          background: linear-gradient(155deg, #FFF6ED 0%, #FFE1BE 60%, #FFEEDE 100%);
        }

        .dango-promo-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.5;
          background-image: radial-gradient(circle at 1px 1px, rgba(15, 27, 48, 0.07) 1px, transparent 0);
          background-size: 22px 22px;
          pointer-events: none;
        }

        .dango-promo-glow {
          position: absolute;
          border-radius: 9999px;
          filter: blur(60px);
          pointer-events: none;
        }
        .dango-promo-glow--1 {
          width: 260px; height: 260px;
          top: -110px; right: -70px;
          background: rgba(255, 107, 0, 0.25);
        }
        .dango-promo-glow--2 {
          width: 200px; height: 200px;
          bottom: -80px; left: -60px;
          background: rgba(37, 99, 235, 0.14);
        }

        .dango-promo-heading {
          text-align: center;
          margin-bottom: 26px;
        }

        .dango-promo-title {
          margin: 0;
          font-size: clamp(24px, 4.5vw, 34px);
          font-weight: 900;
          color: #0f1b30;
          letter-spacing: -0.02em;
          line-height: 1.05;
        }

        .dango-promo-subtitle {
          margin: 6px 0 0;
          font-size: 13px;
          font-weight: 600;
          color: rgba(15, 27, 48, 0.55);
        }

        .dango-promo-columns {
          display: grid;
          grid-template-columns: 1fr;
        }

        .dango-promo-col {
          padding: 0;
        }

        .dango-promo-col + .dango-promo-col {
          margin-top: 26px;
          padding-top: 26px;
          border-top: 1px dashed rgba(15, 27, 48, 0.16);
        }

        @media (min-width: 768px) {
          .dango-promo-columns {
            grid-template-columns: 1fr 1fr;
            column-gap: 32px;
          }
          .dango-promo-col + .dango-promo-col {
            margin-top: 0;
            padding-top: 0;
            padding-left: 32px;
            border-top: none;
            border-left: 1px dashed rgba(15, 27, 48, 0.16);
          }
        }

        .dango-promo-col-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .dango-promo-col-label {
          font-size: 17px;
          font-weight: 800;
          color: #0f1b30;
          margin: 0;
        }

        .dango-promo-col-badge {
          display: inline-flex;
          align-items: center;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 11px;
          border-radius: 999px;
        }

        @media (max-width: 640px) {
          .dango-promo-panel { padding: 26px 16px 22px; }
        }
      `}</style>

      <div className="dango-promo-panel">
        <div className="dango-promo-pattern" />
        <div className="dango-promo-glow dango-promo-glow--1" />
        <div className="dango-promo-glow dango-promo-glow--2" />

        <div className="relative" style={{ zIndex: 2 }}>
          {/* Titre */}
          <div className="dango-promo-heading">
            <h1 className="dango-promo-title">Offres du jour</h1>
            <p className="dango-promo-subtitle">Sélection renouvelée chaque jour</p>
          </div>

          {/* Cadre à deux colonnes, séparées par un simple filet */}
          <div className="dango-promo-columns">
            {/* ---- MEILLEURES VENTES ---- */}
            <div className="dango-promo-col">
              <div className="dango-promo-col-head">
                <h3 className="dango-promo-col-label">Meilleures ventes</h3>
                <span
                  className="dango-promo-col-badge"
                  style={{ background: '#EAF2FF', color: '#2563EB' }}
                >
                  Top produits &rsaquo;
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`best-${pageIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    alignItems: 'start',
                  }}
                >
                  {bestSellersPage.length > 0 ? (
                    bestSellersPage.map((product) => (
                      <ProductCard
                        key={product._id || product.id}
                        product={product}
                        onAddToCart={onAddToCart}
                        isForPromoSection={true}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300/70 bg-white/60 px-4 text-center text-sm text-slate-500">
                      Pas encore de meilleures ventes.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ---- DEAL DU JOUR ---- */}
            <div className="dango-promo-col">
              <div className="dango-promo-col-head">
                <h3 className="dango-promo-col-label">Deal du Jour</h3>
                <span
                  className="dango-promo-col-badge"
                  style={{ background: '#FFEDDC', color: '#FF6B00' }}
                >
                  {maxDiscountPercent > 0 ? `Jusqu'à -${maxDiscountPercent}%` : 'Meilleures offres'}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`deal-${pageIndex}`}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    gap: '10px',
                    alignItems: 'start',
                  }}
                >
                  {dealsPage.length > 0 ? (
                    dealsPage.map((product) => (
                      <ProductCard
                        key={(product._id || product.id) + '-deal'}
                        product={product}
                        onAddToCart={onAddToCart}
                        isForPromoSection={true}
                      />
                    ))
                  ) : (
                    <div
                      className="col-span-2 flex min-h-[120px] items-center justify-center rounded-xl border border-dashed border-slate-300/70 bg-white/60 px-4 text-center text-sm text-slate-500"
                    >
                      Aucune promotion active pour le moment.
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={goPrev}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                aria-label="Page précédente"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="flex gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPageIndex(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === pageIndex ? 'w-6 bg-[#FF6B00]' : 'w-2 bg-slate-300'
                    }`}
                    aria-label={`Page ${idx + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={goNext}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
                aria-label="Page suivante"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}



/* =========================================================
   PRODUCT GRID
========================================================= */

function ProductGrid({
  products = [],
  loading = false,
  onAddToCart,
  filters,
  onFiltersChange,
  onRefresh,
  showPromoSection = false,
  showTabs = false,
  initialTab = 'all',
}) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [retrying, setRetrying] = useState(false);

  const sentinelRef = useRef(null);

  /* =======================================================
     RESET PAGE WHEN DATA / FILTER / TAB CHANGES
  ======================================================= */

  useEffect(() => {
    setPage(1);
  }, [filters, products, activeTab]);

  /* =======================================================
     FILTERS
  ======================================================= */

  const filtered = useMemo(
    () => applyProductFilters(products, filters),
    [products, filters]
  );

  /* =======================================================
     TAB FILTER
  ======================================================= */

  const tabFiltered = useMemo(
    () =>
      filtered.filter((product) =>
        matchesTab(product, activeTab)
      ),
    [filtered, activeTab]
  );

  /* =======================================================
     PAGINATION
  ======================================================= */

  const visible = useMemo(
    () =>
      tabFiltered.slice(
        0,
        page * PAGE_SIZE
      ),
    [tabFiltered, page]
  );

  const hasMore =
    visible.length < tabFiltered.length;

  /* =======================================================
     INFINITE SCROLL
  ======================================================= */

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) {
          return;
        }

        if (loadingMore) {
          return;
        }

        setLoadingMore(true);

        setTimeout(() => {
          setPage((currentPage) => currentPage + 1);
          setLoadingMore(false);
        }, 400);
      },
      {
        threshold: 0.1,
        rootMargin: '200px',
      }
    );

    observer.observe(sentinelRef.current);

    return () => {
      observer.disconnect();
    };
  }, [
    hasMore,
    visible.length,
    loadingMore,
  ]);

  /* =======================================================
     RETRY / REFRESH
     Réinitialise les filtres ET redemande les produits au
     parent (via onRefresh, ex: refetch React Query). Si
     aucun onRefresh n'est fourni, on recharge la page en
     dernier recours pour que le bouton fasse toujours quelque
     chose de concret.
  ======================================================= */

  const handleRetry = useCallback(async () => {
    setActiveTab('all');

    onFiltersChange?.({
      category: '',
      sort: 'relevance',
      minPrice: '',
      maxPrice: '',
      onlyPromo: false,
      inStock: false,
      newArrival: false,
      brand: '',
      condition: '',
    });

    if (onRefresh) {
      try {
        setRetrying(true);
        await onRefresh();
      } finally {
        setRetrying(false);
      }
    } else if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [onFiltersChange, onRefresh]);

  const skeletonCount = 10;

  /* =======================================================
     RENDER
  ======================================================= */


  return (
    <div className="w-full">
      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-0
          sm:px-6
          lg:px-8
        "
        style={{
          marginTop: 0,
          paddingTop: 0,
          paddingBottom: "40px",
          marginBottom:"0px"
        }}
      >
        {/* ================================================
            BANNER CAROUSEL SLIDES
        ================================================= */}
        {showPromoSection && (
          <PromoSection products={products} onAddToCart={onAddToCart} />
        )}

        {/* ================================================
            RÉSULTATS — nombre de produits affichés
        ================================================= */}

        {!loading && tabFiltered.length > 0 && (
          <p
            className="px-2 sm:px-0"
            style={{
              fontSize: '13px',
              color: '#8a8a8a',
              fontWeight: 600,
              margin: '18px 0 12px',
            }}
          >
            {tabFiltered.length} produit{tabFiltered.length > 1 ? 's' : ''}
          </p>
        )}

        {/* ================================================
            PRODUCT GRID
        ================================================= */}

        <style>{`
          #product-grid-main {
            display: block;
            column-count: 2;
            column-gap: 10px;
          }

          #product-grid-main > * {
            display: inline-block;
            width: 100%;
            break-inside: avoid;
            margin-bottom: 10px;
          }

          @media (min-width: 640px) {
            #product-grid-main {
              display: grid;
              grid-template-columns: repeat(3, minmax(0, 1fr));
              gap: 10px;
              align-items: start;
            }

            #product-grid-main > * {
              display: block;
              width: auto;
              break-inside: auto;
              margin-bottom: 0;
              align-self: start;
            }
          }

          @media (min-width: 768px) {
            #product-grid-main {
              grid-template-columns: repeat(4, minmax(0, 1fr));
            }
          }

          @media (min-width: 1024px) {
            #product-grid-main {
              grid-template-columns: repeat(5, minmax(0, 1fr));
            }
          }
        `}</style>

        <div
          id="product-grid-main"

          className="px-2 sm:px-0"
        >

          {/* ==============================================
              LOADING INITIAL
          =============================================== */}

          {loading ? (
            Array.from({
              length: skeletonCount,
            }).map((_, index) => (
              <ProductSkeleton
                key={`skeleton-${index}`}
              />
            ))
          ) : visible.length === 0 ? (
            /* ============================================
               EMPTY
            ============================================= */

            <EmptyState
              onReset={handleRetry}
              retrying={retrying}
            />
          ) : (
            /* ============================================
               PRODUCTS
            ============================================= */

            visible.map((product, index) => (
              <motion.div
                key={
                  product.id ||
                  product._id ||
                  `product-${index}`
                }
                initial={{
                  opacity: 0,
                  y: 12,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                  delay:
                    Math.min(
                      index % PAGE_SIZE,
                      6
                    ) * 0.05,
                }}
                style={{
                  minWidth: 0,
                  alignSelf: 'start',
                }}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </motion.div>
            ))
          )}

          {/* ==============================================
              LOADING MORE
          =============================================== */}

          {loadingMore &&
            Array.from({
              length: 4,
            }).map((_, index) => (
              <ProductSkeleton
                key={`more-${index}`}
              />
            ))}
        </div>

        {/* ================================================
            INFINITE SCROLL SENTINEL
        ================================================= */}

        {hasMore && !loading && (
          <div
            ref={sentinelRef}
            style={{
              height: '40px',
              marginTop: '20px',
            }}
          />
        )}

        {/* ================================================
            END OF PRODUCTS
        ================================================= */}

        {!hasMore &&
          !loading &&
          tabFiltered.length > 0 && (
            <p
              style={{
                textAlign: 'center',
                marginBottom: '20px',
                fontSize: '13px',
                color: '#c0c0c0',
                fontWeight: 500,
              }}
            >
              Tous les produits ont été chargés
            </p>
          )}
      </div>
    </div>
  );
}

export default React.memo(ProductGrid);