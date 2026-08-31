import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ArrowRight, Store, BadgeCheck as BadgeCheckAlt, SlidersHorizontal, Tag, Flame } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import ProductFilters from '../components/product/ProductFilters';
import client from '../apiClient';
import bannerImage from '../images/baniere.jfif';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import {
  buildProductQueryParams,
  DEFAULT_CATALOG_FILTERS,
} from '../utils/productFilters';
import { getProductImage } from '../utils/imageUrl';
import PromoBanner from '../components/PromoBanner';


function HomeNew({ cartCount: cartCountProp }) {
  const location = useLocation();
  const { addToCart, cartCount: contextCount } = useCart();
  const cartCount = cartCountProp ?? contextCount;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_CATALOG_FILTERS);
  const searchQuery = new URLSearchParams(location.search).get('q')?.trim() || '';

  //useHeaderOffset();

  const handleFiltersChange = useCallback((next) => {
    setFilters(next);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const params = buildProductQueryParams(filters, searchQuery);
        const catalogResponse = await client.get(`/products?${params.toString()}`);
        const catalog = Array.isArray(catalogResponse?.data?.data)
          ? catalogResponse.data.data
          : [];

        if (isMounted) {
          setProducts(catalog.map(normalizeProduct));
        }
      } catch {
        if (isMounted) setProducts([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, [searchQuery, filters.category, filters.minPrice, filters.maxPrice, filters.sort]);

  const catalogTitle = searchQuery
    ? `Résultats pour « ${searchQuery} »`
    : filters.category
      ? filters.category
      : 'Catalogue produits';

  // Meilleures ventes (triées par ventes ou par défaut)
  const bestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (Number(b.totalSales || 0)) - (Number(a.totalSales || 0)))
      .slice(0, 3);
  }, [products]);

  // Produits en promo pour la section "Deal du Jour"
  const dealsOfTheDay = useMemo(() => {
    const promos = products.filter(p => p.promoPrice !== null && p.promoPrice > 0 && p.promoPrice < p.price);
    if (promos.length > 0) {
      return promos.slice(0, 3);
    }
    // Simulation si aucune promo en DB pour la démo
    return products.slice(0, 3).map((p, idx) => ({
      ...p,
      promoPrice: Math.round(p.price * (0.7 - idx * 0.1)) // -30%, -40%, -50%
    }));
  }, [products]);

  return (
    <div className="min-h-screen text-slate-900">
      <Header cartCount={cartCount} />

      <main

      >
        {/**!searchQuery && (
          <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="overflow-hidden rounded-2xl shadow-lg">
              <PromoBanner />
            </div>
          </section>
        ) */}

        {/* Section Offres du jour */}
        {!searchQuery && products.length > 0 && (
          <section className="mx-auto max-w-5xl px-4 pt-8 pb-4">
            {/* Titre principal centré */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-black text-slate-900">Offres du jour</h2>
            </div>

            {/* Cadre avec bordure, sans background ni border-radius */}
            <div style={{ border: '1px solid #e2e8f0', borderRadius: 0, background: 'none', padding: '24px' }}>
              <div className="grid gap-8 md:grid-cols-2">
                
                {/* 1. Meilleures ventes */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-extrabold text-slate-900">Meilleures ventes</h3>
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#FFF9F3] text-[#FF6B00] px-3 py-1 text-xs font-bold rounded-full">
                      <span>De super prix et choix de qualité</span>
                      <span>&gt;</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {bestSellers.map((p) => {
                      const hasPromo = p.promoPrice !== null && p.promoPrice < p.price;
                      return (
                        <Link key={p.id} to={`/product/${p.id}`} className="group block text-decoration-none">
                          <div style={{ aspectRatio: '1', border: '1px solid #f1f5f9', borderRadius: 0, overflow: 'hidden', background: '#f8fafc' }}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                                {p.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-left">
                            <p className="text-xs font-medium text-slate-700 truncate mb-0.5">{p.name}</p>
                            <p className="text-sm font-black text-[#FF6B00] m-0">
                              {Number(hasPromo ? p.promoPrice : p.price).toLocaleString('fr-FR')} F
                            </p>
                            {hasPromo && (
                              <p className="text-[10px] text-slate-400 line-through m-0">
                                {Number(p.price).toLocaleString('fr-FR')} F
                              </p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Deal du Jour */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div className="text-center mb-5">
                    <h3 className="text-lg font-extrabold text-slate-900">Deal du Jour</h3>
                    <div className="mt-2 inline-flex items-center gap-1 bg-[#FFF0F0] text-[#FF3B30] px-3 py-1 text-xs font-bold rounded-full">
                      <span>Jusqu'à -80%</span>
                      <span>&gt;</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {dealsOfTheDay.map((p) => {
                      const discountPercent = Math.round(((p.price - p.promoPrice) / p.price) * 100);
                      return (
                        <Link key={p.id} to={`/product/${p.id}`} className="group block text-decoration-none">
                          <div style={{ aspectRatio: '1', border: '1px solid #f1f5f9', borderRadius: 0, overflow: 'hidden', background: '#f8fafc' }}>
                            {p.image ? (
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold text-slate-300">
                                {p.name?.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div className="mt-2 text-left">
                            <p className="text-xs font-medium text-slate-700 truncate mb-0.5">{p.name}</p>
                            <p className="text-sm font-black text-slate-900 m-0">
                              {Number(p.promoPrice).toLocaleString('fr-FR')} F
                            </p>
                            <p className="text-[10px] text-slate-400 line-through m-0">
                              {Number(p.price).toLocaleString('fr-FR')} F
                            </p>
                            <span className="inline-block bg-red-600 text-white text-[9px] font-black px-1 mt-1">
                              -{discountPercent}%
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}

        <section id="marketplace-feeds" className=" pb-12" style={{ marginTop: '10px' }}>
          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </section>

        {/**<section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[18px] border border-[#FFD9BE] bg-[#FFF3EA] p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">
                  Devenir vendeur
                </p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">
                  Ouvrez votre boutique et atteignez des milliers d&apos;acheteurs.
                </h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-600">
                  Gérez vos stocks, vos promos et vos ventes depuis votre tableau de bord.
                </p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-[#FF6B00]">
                  <Store size={22} />
                  <span className="font-semibold">Créer votre boutique</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" />
                    Vendez gratuitement en quelques minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" />
                    Activez des promos et boostez vos produits
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" />
                    Recevez vos paiements en Mobile Money
                  </li>
                </ul>
                
                  className="mt-6 inline-flex items-center gap-2 font-semibold text-[#FF6B00]"
                  href="https://seller.dangoimport.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ouvrir ma boutique <ArrowRight size={16} />
                </a>
              </div>
            </div>
          </div>
        </section> */}
      </main>

      <Footer />
    </div>
  );
}

function normalizeProduct(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.salePrice ?? product?.promoPrice ?? 0) || 0;
  const image = getProductImage(product) || '';
  const sellerName = product?.vendorName || product?.sellerName || '';

  return {
    ...product,
    id: product?._id || product?.id,
    name: product?.name || '',
    price,
    promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : null,
    image,
    brand: product?.brand || '',
    sellerName,
    sellerVerified: Boolean(product?.sellerVerified),
    stock: Number(product?.stock ?? 0) || 0,
    minStock: Number(product?.minStock ?? 10) || 10,
    rating: product?.rating != null ? Number(product.rating) : null,
    totalReviews: product?.totalReviews != null ? Number(product.totalReviews) : null,
    vendorSlug: product?.vendorSlug || product?.storeSlug,
    totalSales: Number(product?.totalSales ?? 0) || 0
  };
}

export default HomeNew;
