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
import { mockProducts } from '../data/mockData';
import Header from '../components/Header';
import Footer from '../components/Footer';

// Pool d'images distinctes utilisées uniquement en fallback (une catégorie sans image
// n'aura jamais la même image que sa voisine — on pioche dans ce pool via un hash stable)
const CATEGORY_FALLBACK_IMAGES = [
  'https://i.pinimg.com/736x/35/1d/26/351d26f062cf211285ac6a898fa52ada.jpg', // accessoires
  'https://i.pinimg.com/736x/59/80/5f/59805fdb42bd1c60727aa1aaac06dac3.jpg', // électronique
  'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg', // mode
  'https://i.pinimg.com/736x/3a/18/7a/3a187a5ffaecc1df686d0af19706d8d7.jpg', // divers
  'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80', // shoes
  'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80', // watch
  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80', // home
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// Chaque catégorie reçoit une image propre : celle renvoyée par l'API en priorité,
// sinon une image de fallback distincte choisie selon son nom/slug (jamais la même pour toutes)
function getCategoryImage(cat, index) {
  if (cat.banner || cat.image) return cat.banner || cat.image;
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
  const list = categories.slice(0, 8);

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
      limit: 40,
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
          <CategoriesSection categories={categories} />
        )}

        <section style={{ background: '#f6f6f7', paddingBottom: '24px' }}>

          <ProductGrid
            products={allProducts}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
            showFilters={false}
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