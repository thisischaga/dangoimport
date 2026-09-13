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

  return (
    <section className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8 py-2">
      <div className="overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 text-slate-900 shadow-sm relative">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-5 relative z-10 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-4xl uppercase">
              OFFRE DU JOUR
            </h2>
          </div>
          <Link
            to="/promotions"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-white hover:text-white transition-colors bg-[#FF6B00] hover:bg-[#E85F00] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-sm"
          >
            <span className="text-white">Voir toutes les promotions</span>
            <ArrowRight size={16} className="text-white" />
          </Link>
        </div>

        <div
          className="
            flex gap-3 sm:gap-4 overflow-x-auto pb-2 -mx-1 px-1
            snap-x snap-mandatory scroll-smooth
            [-ms-overflow-style:none] [scrollbar-width:none]
          "
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {products.map((product) => {
            const price = Number(product.price || 0);
            const promo = Number(product.promoPrice || price * 0.8);
            const discount = product.discountPercent || (price > promo ? Math.round((1 - promo / price) * 100) : 20);

            return (
              <div
                key={product.id || product._id}
                className="
                  snap-start shrink-0
                  w-[200px] sm:w-[240px]
                  rounded-2xl border border-slate-200 bg-white overflow-hidden
                  flex flex-col justify-between
                  hover:border-[#FF6B00]/50 hover:shadow-md transition-all duration-300 group
                "
              >
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[11px] font-black px-2 py-0.5 rounded-md shadow-sm">
                    -{discount}%
                  </span>
                </div>

                <div className="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">{product.sellerName || 'Dango Market'}</p>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-baseline gap-1.5">
                      <span className="text-base sm:text-lg font-black text-[#FF6B00]">
                        {promo.toLocaleString('fr-FR')} FCFA
                      </span>
                      {price > promo && (
                        <span className="text-xs text-slate-400 line-through">
                          {price.toLocaleString('fr-FR')} FCFA
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart && onAddToCart(product)}
                      className="mt-3 w-full bg-[#FF6B00] hover:bg-[#E85F00] active:scale-[0.98] text-white text-xs font-black py-2.5 px-3 rounded-xl transition-all shadow-sm cursor-pointer"
                    >
                      Ajouter au panier
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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