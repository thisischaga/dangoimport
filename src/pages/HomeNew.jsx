import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation } from 'react-router-dom';
import {
  ArrowRight,
  Store,
  BadgeCheck as BadgeCheckAlt,
  ShieldCheck,
  Truck,
  Sparkles,
  ChevronRight,
  Clock,
  Star,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import Header, { CATEGORY_LINKS } from '../components/Header';
import Footer from '../components/Footer';

// Pool d'images distinctes utilisées uniquement en fallback (une catégorie sans image
// n'aura jamais la même image que sa voisine — on pioche dans ce pool via un hash stable)
const CATEGORY_FALLBACK_IMAGES = [
  'https://i.pinimg.com/736x/35/1d/26/351d26f062cf211285ac6a898fa52ada.jpg', // accessoires
  'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg', // mode
  'https://tse3.mm.bing.net/th/id/OIP.hMARBl1IfPUEBfYAUi7hFgHaE8?r=0&w=1536&h=1024&rs=1&pid=ImgDetMain&o=7&rm=3', // électronique
  'https://tse2.mm.bing.net/th/id/OIP.F_qtlzc73fefjMftcjPiJQHaEK?r=0&w=1920&h=1080&rs=1&pid=ImgDetMain&o=7&rm=3', // telephone
  'https://tse3.mm.bing.net/th/id/OIP.TWxhCUJGnQojGn_lJwIfnQHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', // informatique
  'https://tse3.mm.bing.net/th/id/OIP.WjtX-x88LIrJ00rHNHB74QHaFl?r=0&rs=1&pid=ImgDetMain&o=7&rm=3', // sport
  'https://tse4.mm.bing.net/th/id/OIP.Tl7Gs-RTAqfS_ZOxXNhsOwHaJ4?r=0&w=3120&h=4160&rs=1&pid=ImgDetMain&o=7&rm=3', // home  
  'https://www.journee-de-la-femme.com/wp-content/uploads/2022/05/accessoires-beaute-indispensables-femme.jpg', //beaute
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Deterministic mapping from known slugs to fallback images so titles match images.
// API-provided image (`banner` or `image`) still takes precedence.
const SLUG_IMAGE_MAP = {
  accessoires: CATEGORY_FALLBACK_IMAGES[0],
  mode: CATEGORY_FALLBACK_IMAGES[1],
  electronique: CATEGORY_FALLBACK_IMAGES[2],
  telephones: CATEGORY_FALLBACK_IMAGES[3],
  informatique: CATEGORY_FALLBACK_IMAGES[4],
  sport: CATEGORY_FALLBACK_IMAGES[5],
  maison: CATEGORY_FALLBACK_IMAGES[6],
  beaute: CATEGORY_FALLBACK_IMAGES[7],
};

function getCategoryImage(cat, index) {
  if (cat.banner || cat.image) return cat.banner || cat.image;
  const slug = String(cat.slug || '').toLowerCase();
  if (slug && SLUG_IMAGE_MAP[slug]) return SLUG_IMAGE_MAP[slug];
  const key = cat.slug || cat.name || String(index);
  const fallbackIndex = hashString(key) % CATEGORY_FALLBACK_IMAGES.length;
  return CATEGORY_FALLBACK_IMAGES[fallbackIndex];
}

/* ------------------------------------------------------------------ */
/* Bannière hero — refaite entièrement                                 */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/* Section catégories — carrousel horizontal partout (mobile + desktop) */
/* ------------------------------------------------------------------ */
function CategoryCard({ cat, index }) {
  const imageSrc = getCategoryImage(cat, index);

  return (
    <Link
      to={`/category/${cat.slug}`}
      className="
        group snap-start shrink-0
        w-[140px] xs:w-[160px] sm:w-[190px] lg:w-[220px]
        overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm
        transition duration-200 hover:-translate-y-1 hover:shadow-lg active:scale-[0.97]
      "
    >
      <div className="h-24 sm:h-32 lg:h-36 overflow-hidden bg-slate-100">
        <img
          src={imageSrc}
          alt={cat.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="p-3 lg:p-4">
        <h3 className="text-sm lg:text-base font-bold text-slate-900 truncate">{cat.name}</h3>
      </div>
    </Link>
  );
}

function CategoriesSection({ categories }) {
  const list = Array.isArray(categories) ? categories : [];

  return (
    <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <style>{`
        .cat-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      <div
        className="
          cat-scroll flex gap-3 lg:gap-4 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0
          snap-x snap-mandatory scroll-smooth
          [-ms-overflow-style:none] [scrollbar-width:none]
        "
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {list.map((cat, index) => (
          <CategoryCard key={cat._id || cat.slug} cat={cat} index={index} />
        ))}
      </div>
    </section>
  );
}

function DailyDealsSection({ products, onAddToCart }) {
  if (!products || products.length === 0) return null;

  // 1. Identify Deals of the Day (products with promo prices or discount)
  const promoProducts = products.filter(
    (p) =>
      (p.promoPrice && Number(p.promoPrice) < Number(p.price)) ||
      (p.salePrice && Number(p.salePrice) < Number(p.price)) ||
      (p.discountPercent && Number(p.discountPercent) > 0)
  );

  const dealsOfDay = (promoProducts.length >= 3 ? promoProducts : products).slice(0, 3);
  const dealIds = new Set(dealsOfDay.map((d) => String(d.id || d._id)));

  // 2. Identify Best Sellers (excluding items already in dealsOfDay)
  const remainingProducts = products.filter((p) => !dealIds.has(String(p.id || p._id)));

  const sortedBestSellers = [...(remainingProducts.length > 0 ? remainingProducts : products)].sort(
    (a, b) => {
      const salesA = Number(a.soldCount || a.sales || a.totalSold || 0);
      const salesB = Number(b.soldCount || b.sales || b.totalSold || 0);
      if (salesB !== salesA) return salesB - salesA;
      const ratingA = Number(a.rating || a.averageRating || 0);
      const ratingB = Number(b.rating || b.averageRating || 0);
      return ratingB - ratingA;
    }
  );

  const bestSellers = sortedBestSellers.slice(0, 3);

  const formatPrice = (amount) => {
    const n = Number(amount || 0);
    return `XOF${n.toLocaleString('fr-FR')}`;
  };

  return (
    <section className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-6">
      {/* Top Header Centered */}
      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
          Offres du jour
        </h2>
      </div>

      {/* Grid containing 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ---------------- CARD 1: Meilleures ventes ---------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Box Header */}
            <div className="text-center sm:text-left mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Meilleures ventes
              </h3>
              <Link
                to="/best-sellers"
                className="inline-flex items-center gap-1.5 bg-[#FFF5EA] text-[#D97706] border border-[#FDE68A] hover:bg-[#FFEEDD] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <span>De super prix et choix de qualité</span>
                <ChevronRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* Products Grid (3 items) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {bestSellers.map((item, idx) => {
                const rawPrice = Number(item.price || 0);
                const rawPromo = Number(item.promoPrice || item.salePrice || 0);
                const hasPromo = rawPromo > 0 && rawPromo < rawPrice;
                const currentPrice = hasPromo ? rawPromo : rawPrice;
                const oldPrice = hasPromo ? rawPrice : null;

                const rating = item.rating != null ? Number(item.rating) : null;
                const sales = Number(item.soldCount || item.sales || item.totalSold || 0);

                return (
                  <Link
                    key={item.id || item._id || idx}
                    to={`/product/${item.id || item._id}`}
                    className="group flex flex-col justify-between h-full cursor-pointer"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                        <img
                          src={
                            item.image ||
                            item.images?.[0]?.url ||
                            item.images?.[0] ||
                            'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg'
                          }
                          alt={item.name || 'Produit'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 mt-2 leading-snug group-hover:text-[#FF6B00] transition-colors">
                        {item.name || 'Produit'}
                      </h4>
                    </div>

                    {/* Price & Real Meta */}
                    <div className="mt-2">
                      <div className="text-sm sm:text-base font-black text-[#E60012] leading-tight">
                        {formatPrice(currentPrice)}
                      </div>
                      {oldPrice && (
                        <div className="text-[11px] text-slate-400 line-through leading-tight">
                          {formatPrice(oldPrice)}
                        </div>
                      )}
                      {(rating > 0 || sales > 0) && (
                        <div className="text-[10px] sm:text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-1">
                          {rating > 0 && (
                            <>
                              <Star
                                size={11}
                                className="fill-amber-400 text-amber-400 shrink-0"
                              />
                              <span>{rating.toFixed(1)}</span>
                            </>
                          )}
                          {rating > 0 && sales > 0 && (
                            <span className="text-slate-300">|</span>
                          )}
                          {sales > 0 && (
                            <span>
                              + {sales >= 1000 ? `${Math.floor(sales / 1000)} 000` : sales} vendu(s)
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* ---------------- CARD 2: Deal du Jour ---------------- */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs flex flex-col justify-between">
          <div>
            {/* Box Header */}
            <div className="text-center sm:text-left mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2">
                Deal du Jour
              </h3>
              <Link
                to="/promotions"
                className="inline-flex items-center gap-1.5 bg-[#FFF0F2] text-[#E60012] border border-[#FECDD3] hover:bg-[#FFE4E8] px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors shadow-2xs"
              >
                <Clock size={14} className="stroke-[2.5]" />
                <span>Jusqu'à -80%</span>
                <ChevronRight size={14} className="stroke-[2.5]" />
              </Link>
            </div>

            {/* Products Grid (3 items) */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {dealsOfDay.map((item, idx) => {
                const rawPrice = Number(item.price || 0);
                const rawPromo = Number(item.promoPrice || item.salePrice || 0);
                const hasPromo = rawPromo > 0 && rawPromo < rawPrice;
                const currentPrice = hasPromo ? rawPromo : rawPrice;
                const oldPrice = hasPromo ? rawPrice : null;

                const discount =
                  item.discountPercent ||
                  (oldPrice && currentPrice < oldPrice
                    ? Math.round((1 - currentPrice / oldPrice) * 100)
                    : null);

                return (
                  <Link
                    key={item.id || item._id || idx}
                    to={`/product/${item.id || item._id}`}
                    className="group flex flex-col justify-between h-full cursor-pointer"
                  >
                    <div>
                      {/* Product Image */}
                      <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-50 border border-slate-100 relative">
                        <img
                          src={
                            item.image ||
                            item.images?.[0]?.url ||
                            item.images?.[0] ||
                            'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg'
                          }
                          alt={item.name || 'Produit'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>

                      {/* Product Title */}
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-2 mt-2 leading-snug group-hover:text-[#FF6B00] transition-colors">
                        {item.name || 'Produit'}
                      </h4>
                    </div>

                    {/* Price & Discount Tag */}
                    <div className="mt-2">
                      <div className="text-sm sm:text-base font-black text-[#E60012] leading-tight">
                        {formatPrice(currentPrice)}
                      </div>
                      {oldPrice && (
                        <div className="text-[11px] text-slate-400 line-through leading-tight">
                          {formatPrice(oldPrice)}
                        </div>
                      )}
                      {discount > 0 && (
                        <div className="bg-[#E60012] text-[#ffffff] text-[10px] sm:text-xs font-black px-1.5 py-0.5 rounded shadow-2xs w-max mt-1.5">
                          -{discount}%
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function HomeNew({ cartCount: cartCountProp }) {
  const location = useLocation();
  const { addToCart, cartCount: contextCount } = useCart();
  const cartCount = cartCountProp ?? contextCount;
  const [filters, setFilters] = useState({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const searchQuery = new URLSearchParams(location.search).get('q')?.trim() || '';

  const buildParams = useCallback(() => {
    return {
      page: 1,
      limit: 60,
      search: searchQuery || undefined,
      ...filters,
    };
  }, [filters, searchQuery]);

  const {
    data: productsData = [],
    isLoading: loading,
    error,
  } = useQuery(
    {
      queryKey: ['homeProducts', searchQuery, filters],
      queryFn: async () => {
        const response = await client.get('/products', { params: buildParams() });
        return Array.isArray(response?.data?.data) ? response.data.data : [];
      },
      keepPreviousData: true,
      staleTime: 1000 * 60 * 1,
      retry: 1,
    }
  );

  const {
    data: categories = [],
    isLoading: loadingCategories,
  } = useQuery(
    {
      queryKey: ['homeCategories'],
      queryFn: async () => {
        const response = await client.get('/categories');
        return Array.isArray(response?.data?.data) ? response.data.data : [];
      },
      staleTime: 1000 * 60 * 5,
      retry: 1,
    }
  );

  const products = useMemo(() => {
    return productsData.map(normalizeProduct);
  }, [productsData]);

  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    if (!normalizedQuery) return products;

    return products.filter((product) => {
      const name = String(product?.name || product?.title || '').toLowerCase();
      const category = String(product?.category || '').toLowerCase();
      const description = String(product?.description || product?.summary || '').toLowerCase();
      return name.includes(normalizedQuery)
        || category.includes(normalizedQuery)
        || description.includes(normalizedQuery);
    });
  }, [products, searchQuery]);

  const allProducts = useMemo(() => {
    return [...filteredProducts];
  }, [filteredProducts]);



  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <Header
        cartCount={cartCount}
      />

      <main>

        {searchQuery && (
          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#FF6B00]">Résultats de recherche</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">Produits pour «{searchQuery}»</h2>
              <p className="mt-2 text-sm text-slate-500">
                {loading
                  ? 'Recherche en cours...'
                  : allProducts.length > 0
                    ? `${allProducts.length} produit${allProducts.length !== 1 ? 's' : ''} trouvé${allProducts.length !== 1 ? 's' : ''}`
                    : `Aucun produit trouvé pour «${searchQuery}»`}
              </p>
            </div>
          </section>
        )}

        {!searchQuery && !loadingCategories && categories.length > 0 && (
          <CategoriesSection
            categories={(() => {
              try {
                const bySlug = new Map(categories.map(c => [c.slug, c]));
                const ordered = [];
                for (const item of Array.isArray(CATEGORY_LINKS) ? CATEGORY_LINKS : []) {
                  const slug = item.slug;
                  const label = item.label || slug;
                  const c = bySlug.get(slug);
                  if (c) {
                    ordered.push(c);
                    bySlug.delete(slug);
                  } else {
                    // placeholder so header categories always appear on Home
                    ordered.push({
                      _id: `placeholder-${slug}`,
                      slug,
                      name: label,
                      banner: SLUG_IMAGE_MAP[slug] || null,
                      productCount: 0,
                      description: '',
                    });
                  }
                }
                return ordered; // header categories (with placeholders if missing)
              } catch (e) {
                return categories;
              }
            })()}
          />
        )}

        {!searchQuery && !loading && allProducts.length > 0 && (
          <DailyDealsSection
            products={(() => {
              const promos = allProducts.filter(p => p.promoPrice || p.isPromo || p.salePrice < p.price);
              if (promos.length >= 3) return promos.slice(0, 10);
              return allProducts.slice(0, 8).map((p, idx) => {
                const disc = [15, 20, 25, 30, 35][idx % 5];
                const calc = p.promoPrice || Math.round(p.price * (1 - disc / 100));
                return {
                  ...p,
                  promoPrice: calc < p.price ? calc : Math.round(p.price * 0.8),
                  discountPercent: disc,
                };
              });
            })()}
            onAddToCart={addToCart}
          />
        )}

        <section style={{ background: '#f6f6f7', paddingBottom: '24px' }}>

          <ProductGrid
            products={allProducts}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
            showTabs
          />
        </section>

      </main>

      <Footer/>
    </div>
  );
}

function normalizeProduct(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.salePrice ?? product?.promoPrice ?? 0) || 0;
  const image = product?.image || product?.images?.[0]?.url || product?.images?.[0] || 'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg';
  const sellerName = product?.vendorName || product?.sellerName || 'Vendeur indépendant';

  return {
    ...product,
    id: product?._id || product?.id,
    name: product?.name || 'Produit premium',
    description: product?.shortDescription || product?.description || '',
    price,
    promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : null,
    image,
    category: product?.category || 'Produit',
    sellerName,
    sellerVerified: Boolean(product?.sellerVerified || product?.vendorName),
    stock: Number(product?.stock ?? 0) || 0,
    isFeatured: Boolean(product?.isFeatured),
    isBoosted: Boolean(product?.isFeatured || product?.isBestSeller || product?.isBoosted),
  };
}

export default HomeNew;