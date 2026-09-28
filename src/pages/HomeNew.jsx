import React, { useCallback, useMemo, useState } from 'react';
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
  Star,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import Header, { CATEGORY_LINKS } from '../components/Header';
import Footer from '../components/Footer';
import { getProductSellableStock, getProductOriginLabel, sanitizeProductForDisplay } from '../utils/publicProduct';
import { isProductOnPromo, isProductBestSeller, getDiscountPercent } from '../utils/productPromo';

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

function MiniCatalogCard({ item }) {
  const rawPrice = Number(item.price || 0);
  const rawPromo = Number(item.promoPrice || item.salePrice || 0);
  const hasPromo = rawPromo > 0 && rawPromo < rawPrice;
  const currentPrice = hasPromo ? rawPromo : rawPrice;
  const oldPrice = hasPromo ? rawPrice : null;
  const discount = hasPromo ? getDiscountPercent(item) : 0;
  const rating = item.rating != null ? Number(item.rating) : null;
  const sales = Number(item.soldCount || item.sales || item.totalSold || 0);
  const formatPrice = (amount) => `${Number(amount || 0).toLocaleString('fr-FR')} F`;

  return (
    <Link
      to={`/product/${item.id || item._id}`}
      className="group flex h-full cursor-pointer flex-col justify-between"
    >
      <div>
        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
          <img
            src={
              item.image
              || item.images?.[0]?.url
              || item.images?.[0]
              || 'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg'
            }
            alt={item.name || 'Produit'}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </div>
        <h4 className="mt-2 line-clamp-2 text-xs font-semibold leading-snug text-slate-800 group-hover:text-[#FF6B00] sm:text-sm">
          {item.name || 'Produit'}
        </h4>
      </div>
      <div className="mt-2">
        <div className="text-sm font-black leading-tight text-[#C50012] sm:text-base">
          {formatPrice(currentPrice)}
        </div>
        {oldPrice ? (
          <div className="text-[11px] leading-tight text-slate-400 line-through">{formatPrice(oldPrice)}</div>
        ) : null}
        {discount > 0 ? (
          <div className="mt-1.5 w-max rounded bg-[#C50012] px-1.5 py-0.5 text-[10px] font-black text-white sm:text-xs">
            -{discount}%
          </div>
        ) : null}
        {(rating > 0 || sales > 0) && discount <= 0 ? (
          <div className="mt-1 flex items-center gap-1 text-[10px] font-medium text-slate-500 sm:text-[11px]">
            {rating > 0 ? (
              <>
                <Star size={11} className="shrink-0 fill-amber-400 text-amber-400" />
                <span>{rating.toFixed(1)}</span>
              </>
            ) : null}
            {sales > 0 ? <span>+ {sales} vendu(s)</span> : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}

function DailyDealsSection({ products }) {
  if (!products || products.length === 0) return null;

  const promoProducts = products.filter(isProductOnPromo).slice(0, 3);
  const bestSellers = [...products]
    .filter(isProductBestSeller)
    .sort((a, b) => {
      const salesA = Number(a.soldCount || a.sales || a.totalSold || 0);
      const salesB = Number(b.soldCount || b.sales || b.totalSold || 0);
      return salesB - salesA;
    })
    .slice(0, 3);

  const showDeals = promoProducts.length > 0;
  const showBest = bestSellers.length > 0;
  if (!showDeals && !showBest) return null;

  const maxPromoPercent = promoProducts.reduce((max, d) => Math.max(max, getDiscountPercent(d)), 0);
  const sectionTitle = showDeals && showBest
    ? 'Offres du jour'
    : showDeals
      ? 'Promotions'
      : 'Meilleures ventes';

  return (
    <section className="mx-auto max-w-7xl px-3 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {sectionTitle}
        </h2>
      </div>

      <div className={`grid grid-cols-1 gap-6 ${showDeals && showBest ? 'lg:grid-cols-2' : ''}`}>
        {showBest ? (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Meilleures ventes</h3>
                <Link
                  to="/best-sellers"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-200"
                >
                  Voir tout
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {bestSellers.map((item) => (
                  <MiniCatalogCard key={item.id || item._id} item={item} />
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {showDeals ? (
          <div className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:p-6">
            <div>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-lg font-bold text-slate-900 sm:text-xl">Deal du jour</h3>
                <Link
                  to="/promotions"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 transition-colors hover:bg-red-100"
                >
                  {maxPromoPercent > 0 ? `Jusqu’à -${maxPromoPercent}%` : 'Promotions'}
                  <ChevronRight size={14} className="stroke-[2.5]" />
                </Link>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                {promoProducts.map((item) => (
                  <MiniCatalogCard key={item.id || item._id} item={item} />
                ))}
              </div>
            </div>
          </div>
        ) : null}
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
          <DailyDealsSection products={allProducts} />
        )}

        <section style={{ background: '#f6f6f7', paddingBottom: '24px' }}>

          <ProductGrid
            products={allProducts}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
          />
        </section>

      </main>

      <Footer/>
    </div>
  );
}

function normalizeProduct(product) {
  const sanitized = sanitizeProductForDisplay(product) || product || {};
  const price = Number(sanitized?.price ?? 0) || 0;
  const promoPrice = Number(sanitized?.salePrice ?? sanitized?.promoPrice ?? 0) || 0;
  const image = sanitized?.image || sanitized?.images?.[0]?.url || sanitized?.images?.[0] || 'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg';
  const sellerName = sanitized?.vendorName || sanitized?.sellerName || 'Vendeur indépendant';

  return {
    ...sanitized,
    id: sanitized?._id || sanitized?.id,
    name: sanitized?.name || 'Article Dango Import',
    description: sanitized?.shortDescription || sanitized?.description || '',
    price,
    promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : null,
    image,
    category: sanitized?.category || 'Produit',
    sellerName,
    originLabel: getProductOriginLabel(sanitized),
    sellerVerified: Boolean(sanitized?.sellerVerified || sanitized?.vendorName),
    stock: getProductSellableStock(sanitized),
    isFeatured: Boolean(sanitized?.isFeatured),
    isBoosted: Boolean(sanitized?.isFeatured || sanitized?.isBestSeller || sanitized?.isBoosted),
  };
}

export default HomeNew;