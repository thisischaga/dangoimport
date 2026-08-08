import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { motion } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { applyProductFilters } from '../../utils/productFilters';

const PAGE_SIZE = 12;

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
  const sentinelRef = useRef(null);

  useEffect(() => {
    setPage(1);
  }, [filters, products]);

  const filtered = useMemo(
    () => applyProductFilters(products, filters),
    [products, filters]
  );

  const visible = useMemo(
    () => filtered.slice(0, page * PAGE_SIZE),
    [filtered, page]
  );
  const hasMore = visible.length < filtered.length;

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
      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '20px', paddingBottom: '40px' }}
      >
        {!loading && (
          <p
            style={{
              fontSize: '13px',
              color: '#9a9a9a',
              marginBottom: '16px',
              fontWeight: 500,
            }}
          >
            {filtered.length} produit{filtered.length !== 1 ? 's' : ''} trouvé
            {filtered.length !== 1 ? 's' : ''}
            {filters?.category ? ` · ${filters.category}` : ''}
          </p>
        )}

        <div id="product-grid-main" style={{ display: 'grid', gap: '10px' }}>
          <style>{`
            #product-grid-main {
              grid-template-columns: repeat(2, 1fr);
            }
            @media (min-width: 640px) {
              #product-grid-main { grid-template-columns: repeat(3, 1fr); }
            }
            @media (min-width: 768px) {
              #product-grid-main { grid-template-columns: repeat(4, 1fr); }
            }
            @media (min-width: 1024px) {
              #product-grid-main { grid-template-columns: repeat(5, 1fr); }
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

        {!hasMore && !loading && filtered.length > 0 && (
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
