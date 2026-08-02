import React, {
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackageSearch } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import ProductFilters from './ProductFilters';

const PAGE_SIZE = 12;

function applyFilters(products, filters) {
  let result = [...products];

  // Category
  if (filters.category && filters.category !== 'Tous') {
    result = result.filter(
      (p) => p.category?.toLowerCase() === filters.category.toLowerCase()
    );
  }

  // Only promo
  if (filters.onlyPromo) {
    result = result.filter((p) => p.promoPrice && p.promoPrice < p.price);
  }

  // Free shipping
  if (filters.onlyFreeShip) {
    result = result.filter((p) => p.freeShipping !== false);
  }

  // Min rating
  if (filters.minRating > 0) {
    result = result.filter((p) => (p.rating ?? 4) >= filters.minRating);
  }

  // Sort
  switch (filters.sort) {
    case 'price_asc':
      result.sort((a, b) => (a.promoPrice || a.price) - (b.promoPrice || b.price));
      break;
    case 'price_desc':
      result.sort((a, b) => (b.promoPrice || b.price) - (a.promoPrice || a.price));
      break;
    case 'promo':
      result.sort((a, b) => {
        const da = a.promoPrice ? Math.round((1 - a.promoPrice / a.price) * 100) : 0;
        const db = b.promoPrice ? Math.round((1 - b.promoPrice / b.price) * 100) : 0;
        return db - da;
      });
      break;
    case 'popular':
      result.sort((a, b) => Number(b.isBoosted) - Number(a.isBoosted));
      break;
    default:
      break;
  }

  return result;
}

function EmptyState({ filters }) {
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
        Essayez d'ajuster vos filtres.
      </p>
    </motion.div>
  );
}

function ProductGrid({ products = [], loading = false, onAddToCart }) {
  const [filters, setFilters] = useState({
    category: 'Tous',
    sort: 'default',
    onlyPromo: false,
    onlyFreeShip: false,
    minRating: 0,
  });
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef(null);

  // Reset page when filters change
  const handleFiltersChange = useCallback((newFilters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const filtered = useMemo(() => applyFilters(products, filters), [products, filters]);
  const visible = useMemo(() => filtered.slice(0, page * PAGE_SIZE), [filtered, page]);
  const hasMore = visible.length < filtered.length;

  // Infinite scroll via IntersectionObserver
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

  const skeletonCount = 10;

  return (
    <div>
      <ProductFilters onFiltersChange={handleFiltersChange} />

      <div
        className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"
        style={{ paddingTop: '24px', paddingBottom: '40px' }}
      >
        {/* Results count */}
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
          </p>
        )}

        {/* Grid */}
        <div id="product-grid-main" style={{ display: 'grid', gap: '10px' }}>
          <style>{`
            #product-grid-main {
              grid-template-columns: repeat(2, 1fr);
            }
            @media (min-width: 640px) {
              #product-grid-main { grid-template-columns: repeat(3, 1fr); }
            }
            @media (min-width: 1024px) {
              #product-grid-main { grid-template-columns: repeat(5, 1fr); }
            }
            @media (min-width: 1280px) {
              #product-grid-main { grid-template-columns: repeat(6, 1fr); }
            }
          `}</style>

          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : visible.length === 0
            ? <EmptyState filters={filters} />
            : visible.map((product, idx) => (
                <motion.div
                  key={product.id || idx}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(idx % PAGE_SIZE, 6) * 0.05 }}
                >
                  <ProductCard
                    product={product}
                    onAddToCart={onAddToCart}
                  />
                </motion.div>
              ))}

          {/* Loading more skeletons */}
          {loadingMore &&
            Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={`more-${i}`} />
            ))}
        </div>

        {/* Infinite scroll sentinel */}
        {hasMore && !loading && (
          <div ref={sentinelRef} style={{ height: '40px', marginTop: '20px' }} />
        )}

        {/* End of results */}
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
