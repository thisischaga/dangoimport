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
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

import ProductCard from './ProductCard';
import ProductSkeleton from './ProductSkeleton';
import { applyProductFilters } from '../../utils/productFilters';

const PAGE_SIZE = 12;

const BANNER_SLIDES = [
  {
    key: 'all',
    title: 'Tous les Produits',
    subtitle: 'Explorez l\'intégralité de notre catalogue marketplace',
    badge: 'Catalogue',
    btnText: 'Tout voir',
    gradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    emoji: '🛍️'
  },
  {
    key: 'bestseller',
    title: 'Meilleures Ventes',
    subtitle: 'Découvrez les produits les plus populaires achetés par la communauté',
    badge: 'Tendances',
    btnText: 'Parcourir',
    gradient: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)',
    emoji: '🔥'
  },
  {
    key: 'recommended',
    title: 'Sélection Recommandée',
    subtitle: 'Nos meilleures recommandations sélectionnées pour vous',
    badge: 'Favoris',
    btnText: 'Voir les recommandations',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    emoji: '⭐'
  },
  {
    key: 'forYou',
    title: 'Sélection Pour Vous',
    subtitle: 'Des suggestions personnalisées adaptées à vos préférences',
    badge: 'Personnalisé',
    btnText: 'Découvrir',
    gradient: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
    emoji: '👤'
  },
  {
    key: 'new',
    title: 'Les Nouveautés',
    subtitle: 'Soyez le premier à découvrir nos tout derniers arrivages',
    badge: 'Nouveaux',
    btnText: 'Découvrir',
    gradient: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
    emoji: '🆕'
  },
  {
    key: 'promo',
    title: 'Nos Promotions Spéciales',
    subtitle: 'Profitez de réductions incroyables et de prix cassés',
    badge: 'Promos -50%',
    btnText: 'Profiter des offres',
    gradient: 'linear-gradient(135deg, #eab308 0%, #d97706 100%)',
    emoji: '💰'
  }
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
   BANNER SLIDER (Large sliding banner representing each category)
========================================================= */

function BannerSlider({ activeTab, onChange }) {
  const currentIndex = BANNER_SLIDES.findIndex(s => s.key === activeTab);
  const slide = BANNER_SLIDES[currentIndex >= 0 ? currentIndex : 0];

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
          font-size: 72px;
          user-select: none;
          filter: drop-shadow(0 10px 15px rgba(0,0,0,0.18));
          animation: dango-float 4s ease-in-out infinite;
        }

        @keyframes dango-float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(4deg); }
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
            max-width: 80%;
          }
          .dango-banner__visual {
            font-size: 48px;
          }
          .dango-banner-nav {
            display: none;
          }
        }
      `}</style>

      {/* Nav Prev */}
      <button className="dango-banner-nav dango-banner-nav--prev" onClick={handlePrev} type="button">
        <ChevronLeft size={20} />
      </button>

      {/* Slide Container */}
      <div className="dango-banner" style={{ background: slide.gradient }}>
        <div className="dango-banner__bg-pattern" />
        
        <div className="dango-banner__content">
          <span className="dango-banner__badge">{slide.badge}</span>
          <h2 className="dango-banner__title">{slide.title}</h2>
          <p className="dango-banner__subtitle">{slide.subtitle}</p>
          <button className="dango-banner__btn" type="button">
            {slide.btnText}
          </button>
        </div>

        <div className="dango-banner__visual">
          {slide.emoji}
        </div>
      </div>

      {/* Nav Next */}
      <button className="dango-banner-nav dango-banner-nav--next" onClick={handleNext} type="button">
        <ChevronRight size={20} />
      </button>

      {/* Dots Indicator */}
      <div className="dango-banner-dots">
        {BANNER_SLIDES.map((s, idx) => (
          <button
            key={s.key}
            className={`dango-banner-dot ${s.key === activeTab ? 'dango-banner-dot--active' : ''}`}
            onClick={() => onChange(s.key)}
            type="button"
            aria-label={`Slide ${idx + 1}`}
          />
        ))}
      </div>
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

  /*const tabCounts = useMemo(() => {
    const counts = {};

    BANNER_SLIDES.forEach(({ key }) => {
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

        <BannerSlider
          activeTab={activeTab}
          onChange={setActiveTab}
        />

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