import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { motion } from 'framer-motion';
import {
  PackageSearch,
  LayoutGrid,
  Flame,
  Sparkles,
  Wand2,
  Zap,
  Tag,
} from 'lucide-react';

import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { applyProductFilters } from '../../utils/productFilters';

const PAGE_SIZE = 12;

const TABS = [
  { key: 'all', label: 'Tous', Icon: LayoutGrid },
  { key: 'bestseller', label: 'Meilleures ventes', Icon: Flame },
  { key: 'recommended', label: 'Recommandé', Icon: Sparkles },
  { key: 'forYou', label: 'Pour vous', Icon: Wand2 },
  { key: 'new', label: 'Nouveautés', Icon: Zap },
  { key: 'promo', label: 'Promotions', Icon: Tag },
];

/* =========================================================
   TAB FILTER
========================================================= */

function matchesTab(product, tabKey) {
  if (tabKey === 'all') return true;

  switch (tabKey) {
    case 'bestseller':
      return Boolean(
        product?.isBestSeller ??
          product?.bestSeller ??
          product?.bestseller
      );

    case 'recommended':
      return Boolean(
        product?.isRecommended ??
          product?.recommended
      );

    case 'forYou':
      return Boolean(
        product?.isForYou ??
          product?.forYou ??
          product?.recommendedForUser
      );

    case 'new':
      return Boolean(
        product?.isNewArrival ??
          product?.newArrival ??
          product?.isNew
      );

    case 'promo':
      return Boolean(
        product?.promoPrice ||
          product?.isPromo ||
          product?.discount ||
          product?.onSale
      );

    default:
      return true;
  }
}

/* =========================================================
   TAB BAR
========================================================= */

function TabBar({ active, onChange, counts }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative mb-4">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          marginBottom: '20px',
        }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          .product-tab {
            position: relative;
            border: none;
            outline: none;
            cursor: pointer;
            background: transparent;
            color: #64748b;
            transition:
              color 0.2s ease,
              background-color 0.2s ease;
          }

          .product-tab:hover {
            color: #111827;
            background: #f8fafc;
          }

          .product-tab--active {
            color: #111827;
          }

          .product-tab--active::after {
            content: "";
            position: absolute;
            left: 10px;
            right: 10px;
            bottom: -1px;
            height: 2px;
            background: #111827;
          }
        `}</style>

        {TABS.map(({ key, label, Icon }) => {
          const isActive = active === key;
          const count = counts?.[key];

          return (
            <button
              key={key}
              type="button"
              onClick={() => onChange(key)}
              className={`
                product-tab
                ${isActive ? 'product-tab--active' : ''}
                relative
                flex
                shrink-0
                items-center
                gap-1.5
                px-3.5
                py-2
                text-xs
                sm:text-sm
                font-semibold
                whitespace-nowrap
              `}
              aria-pressed={isActive}
            >
              {/*
                Icône volontairement désactivée pour garder
                l'interface sobre.
              */}
              {/*
              <Icon
                size={14}
                className={isActive ? 'text-slate-900' : 'text-slate-400'}
              />
              */}

              {label}

              {typeof count === 'number' && count > 0 && (
                <span
                  className={`
                    ml-0.5
                    rounded-full
                    px-1.5
                    py-0.5
                    text-[10px]
                    font-bold
                    leading-none
                    ${
                      isActive
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-500'
                    }
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Indication de scroll horizontal sur mobile */}
      <div
        className="
          pointer-events-none
          absolute
          right-0
          top-0
          h-full
          w-8
          bg-gradient-to-l
          from-white
          to-transparent
          sm:hidden
        "
      />
    </div>
  );
}

/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({ onReset }) {
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
        textAlign: 'center',
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      <PackageSearch
        size={52}
        style={{
          color: '#d5d5d5',
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
          className="
            mt-2
            rounded-full
            bg-[#FF6B00]
            px-5
            py-2.5
            text-sm
            font-semibold
            text-white
            transition-colors
            hover:bg-[#e75b00]
          "
        >
          Réinitialiser les filtres
        </button>
      ) : null}
    </motion.div>
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
}) {
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

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
     TAB COUNTS
  ======================================================= */

  const tabCounts = useMemo(() => {
    const counts = {};

    TABS.forEach(({ key }) => {
      counts[key] =
        key === 'all'
          ? filtered.length
          : filtered.filter((product) =>
              matchesTab(product, key)
            ).length;
    });

    return counts;
  }, [filtered]);

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
     RESET FILTERS
  ======================================================= */

  const handleReset = useCallback(() => {
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
  }, [onFiltersChange]);

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
          px-4
          sm:px-6
          lg:px-8
        "
        style={{
          marginTop: 0,
          paddingTop: 0,
        }}
      >
        {/* ================================================
            TABS
        ================================================= */}

        <TabBar
          active={activeTab}
          onChange={setActiveTab}
          counts={tabCounts}
        />

        {/* ================================================
            PRODUCT GRID
        ================================================= */}

        <div
          id="product-grid-main"
          style={{
            display: 'grid',
            gap: '10px',
            marginTop: '20px',

            /*
             * IMPORTANT :
             * Les cartes restent alignées en haut.
             *
             * On ne force PAS leur hauteur.
             * Chaque carte conserve donc sa hauteur
             * naturelle en fonction de son contenu.
             */
            alignItems: 'start',
          }}
        >
          <style>{`
            #product-grid-main {
              grid-template-columns:
                repeat(2, minmax(0, 1fr));

              align-items: start;
            }

            #product-grid-main > * {
              min-width: 0;
              align-self: start;
            }

            @media (min-width: 640px) {
              #product-grid-main {
                grid-template-columns:
                  repeat(3, minmax(0, 1fr));
              }
            }

            @media (min-width: 768px) {
              #product-grid-main {
                grid-template-columns:
                  repeat(4, minmax(0, 1fr));
              }
            }

            @media (min-width: 1024px) {
              #product-grid-main {
                grid-template-columns:
                  repeat(5, minmax(0, 1fr));
              }
            }
          `}</style>

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
              onReset={
                onFiltersChange
                  ? handleReset
                  : undefined
              }
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
                marginTop: '32px',
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