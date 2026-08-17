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

function matchesTab(product, tabKey) {
  if (tabKey === 'all') return true;

  switch (tabKey) {
    case 'bestseller':
      return Boolean(
        product?.isBestSeller ?? product?.bestSeller ?? product?.bestseller
      );
    case 'recommended':
      return Boolean(
        product?.isRecommended ?? product?.recommended
      );
    case 'forYou':
      return Boolean(
        product?.isForYou ?? product?.forYou ?? product?.recommendedForUser
      );
    case 'new':
      return Boolean(
        product?.isNewArrival ?? product?.newArrival ?? product?.isNew
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

function TabBar({ active, onChange, counts }) {
  const scrollRef = useRef(null);

  return (
    <div className="relative mb-4">
      <div
        ref={scrollRef}
        className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', marginBottom: '20px' }}
      >
        <style>{`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
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
                relative flex shrink-0 items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold duration-200 whitespace-nowrap bg-white text-slate-600`}
            >
              {/* <Icon
                size={14}
                className={isActive ? 'text-white' : 'text-slate-400'}
              /> */}
              {label}
              {typeof count === 'number' && count > 0 && (
                <span
                  className={`
                    ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none
                    ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'}
                  `}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Fondu pour indiquer le scroll horizontal sur mobile */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent sm:hidden" />
    </div>
  );
}

function EmptyState({ onReset }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
      <PackageSearch size={52} style={{ color: '#d5d5d5' }} />
      <p style={{ fontSize: '16px', fontWeight: 700, color: '#555', margin: 0 }}>
        Aucun produit trouvé
      </p>
      <p style={{ fontSize: '13px', color: '#9a9a9a', margin: 0 }}>
        Essayez d&apos;ajuster vos filtres ou votre recherche.
      </p>
      {onReset ? (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 rounded-full bg-[#FF6B00] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#e75b00]"
        >
          Réinitialiser les filtres
        </button>
      ) : null}
    </motion.div>
  );
}

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

  useEffect(() => {
    setPage(1);
  }, [filters, products, activeTab]);

  const filtered = useMemo(
    () => applyProductFilters(products, filters),
    [products, filters]
  );

  const tabFiltered = useMemo(
    () => filtered.filter((p) => matchesTab(p, activeTab)),
    [filtered, activeTab]
  );

  const tabCounts = useMemo(() => {
    const counts = {};
    TABS.forEach(({ key }) => {
      counts[key] =
        key === 'all'
          ? filtered.length
          : filtered.filter((p) => matchesTab(p, key)).length;
    });
    return counts;
  }, [filtered]);

  const visible = useMemo(
    () => tabFiltered.slice(0, page * PAGE_SIZE),
    [tabFiltered, page]
  );
  const hasMore = visible.length < tabFiltered.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setLoadingMore(true);
          setTimeout(() => {
            setPage((p) => p + 1);
            setLoadingMore(false);
          }, 400);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, visible.length]);

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

  return (
    <div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{
          marginTop: 0,
          paddingTop: 0,
        }}
      >
        <TabBar active={activeTab} onChange={setActiveTab} />

          <div id="product-grid-main">
            <style>{`
              #product-grid-main {
                column-count: 2;
                column-gap: 10px;
                margin-top: 20px;
              }

              #product-grid-main > * {
                break-inside: avoid;
                -webkit-column-break-inside: avoid;
                margin-bottom: 10px;
                width: 100%;
              }

              @media (min-width: 640px) {
                #product-grid-main {
                  column-count: 3;
                }
              }

              @media (min-width: 768px) {
                #product-grid-main {
                  column-count: 4;
                }
              }

              @media (min-width: 1024px) {
                #product-grid-main {
                  column-count: 5;
                }
              }
            `}</style>
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : visible.length === 0
              ? <EmptyState onReset={onFiltersChange ? handleReset : undefined} />
              : visible.map((product, idx) => (
                  <motion.div
                    key={product.id || product._id || idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.25,
                      delay: Math.min(idx % PAGE_SIZE, 6) * 0.05,
                    }}
                  >
                    <ProductCard product={product} onAddToCart={onAddToCart} />
                  </motion.div>
                ))}

          {loadingMore &&
            Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={`more-${i}`} />
            ))}
        </div>

        {hasMore && !loading && (
          <div ref={sentinelRef} style={{ height: '40px', marginTop: '20px' }} />
        )}

        {!hasMore && !loading && tabFiltered.length > 0 && (
          <p
            style={{
              textAlign: 'center',
              marginTop: '32px',
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