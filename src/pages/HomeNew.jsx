import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  ArrowRight,
  Store,
  BadgeCheck as BadgeCheckAlt,
  Flame,
  Sparkles,
  Star,
  TrendingUp,
  Compass,
} from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import ProductCard from '../components/product/ProductCard';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import { mockProducts } from '../data/mockData';
import bannerImage from '../images/baniere.jfif';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  buildProductQueryParams,
  DEFAULT_CATALOG_FILTERS,
} from '../utils/productFilters';

function HomeNew({ cartCount: cartCountProp }) {
  const location = useLocation();
  const { addToCart, cartCount: contextCount } = useCart();
  const cartCount = cartCountProp ?? contextCount;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_CATALOG_FILTERS);
  const searchQuery = new URLSearchParams(location.search).get('q')?.trim() || '';

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

        let uniqueProducts = catalog;

        const hasServerFilters =
          filters.category ||
          filters.minPrice ||
          filters.maxPrice ||
          searchQuery;

        if (!hasServerFilters) {
          const featuredResponse = await client.get('/products/featured');
          const featured = Array.isArray(featuredResponse?.data?.data)
            ? featuredResponse.data.data
            : [];
          const merged = [...featured, ...catalog];
          uniqueProducts = Array.from(
            new Map(merged.map((p) => [p._id || p.id, p])).values()
          );
        }

        if (isMounted) {
          setProducts(uniqueProducts.map(normalizeProduct));
        }
      } catch {
        if (isMounted) {
          setProducts([]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [searchQuery, filters.category, filters.minPrice, filters.maxPrice, filters.sort]);

  const offersOfDay = useMemo(() => {
    return products.filter(p => p.promoPrice && p.promoPrice < p.price).slice(0, 5);
  }, [products]);

  const popularProducts = useMemo(() => {
    return products.filter(p => p.isBoosted || p.isFeatured).slice(0, 5);
  }, [products]);

  const bestSellers = useMemo(() => {
    return [...products].sort((a, b) => (b.totalSales || 0) - (a.totalSales || 0)).slice(0, 5);
  }, [products]);

  const newArrivals = useMemo(() => {
    return products.filter(p => p.isNewArrival || p.isNew).slice(0, 5);
  }, [products]);

  const sectionTitle = searchQuery
    ? `Résultats pour «${searchQuery}»`
    : 'Recommandé pour vous';

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <Header cartCount={cartCount} />

      <main>
        {/* ── Desktop Hero Section + Category Sidebar ── */}
        {!searchQuery && (
          <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-slate-950 text-white min-h-[300px] lg:h-[300px]  px-8 lg:px-12 py-10 shadow-lg ">
              <div className="absolute inset-0 bg-cover bg-center opacity-45" style={{ backgroundImage: `url(${bannerImage})` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
              <div className="relative z-10 max-w-2xl mx-auto " style={{float: "left"}}>
                <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">
                  Les meilleures offres <br />
                  <span className="text-[#FF6B00]">au meilleur prix</span>
                </h1>
                <p className="text-slate-200 text-sm mt-4 font-semibold max-w-lg leading-relaxed">
                  Découvrez notre catalogue de produit avec livraison rapide au Bénin et Togo.
                </p>
                <button
                  onClick={() => {
                    const gridEl = document.getElementById('marketplace-feeds');
                    if (gridEl) gridEl.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="mt-8 rounded-full bg-[#FF6B00] px-8 py-3 text-sm font-black text-white hover:bg-[#e75b00] cursor-pointer transition shadow-md hover:shadow-lg"
                >
                  Acheter maintenant
                </button>
              </div>
            </div>
          </section>
        )}

        {/* ── Promotional Header for Search ── */}
        {searchQuery && (
          <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#FF6B00]">
                Résultats de recherche
              </p>
              <h2 className="mt-3 text-3xl font-bold text-slate-900">{sectionTitle}</h2>
            </div>
          </section>
        )}

        {/* ── Marketplace Sections (Only when not searching) ── */}
        {!searchQuery && (
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10 pt-8">
            {/* 1. Offres du jour */}
            {offersOfDay.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                  <Flame className="text-[#FF6B00]" size={20} />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Offres du jour</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {offersOfDay.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              </section>
            )}

            {/* 2. Produits populaires */}
            {popularProducts.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                  <Compass className="text-[#FF6B00]" size={20} />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Produits populaires</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {popularProducts.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              </section>
            )}

            {/* 3. Meilleures ventes */}
            {bestSellers.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                  <TrendingUp className="text-[#FF6B00]" size={20} />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Meilleures ventes</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {bestSellers.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              </section>
            )}

            {/* 4. Nouveautés */}
            {newArrivals.length > 0 && (
              <section className="space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-150 pb-2">
                  <Sparkles className="text-[#FF6B00]" size={20} />
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">Nouveautés</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {newArrivals.map((product) => (
                    <ProductCard key={product.id || product._id} product={product} onAddToCart={addToCart} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {/* ── 5. Recommandé pour vous (Main Catalog Grid Feed) ── */}
        <section id="marketplace-feeds" className="bg-[#f6f6f7] pb-12">
          <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
            <div className="mb-4 border-b border-slate-150 pb-2 flex items-center gap-2">
              <Star className="text-[#FF6B00]" size={20} />
              <h2 className="text-lg font-black text-slate-900 tracking-tight">{sectionTitle}</h2>
            </div>
          </div>

          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
            onFiltersChange={handleFiltersChange}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />
        </section>

        {/* ── Becoming a seller footer promo ── */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
                  Gérez vos stocks, vos promos et vos ventes en toute simplicité depuis
                  votre tableau de bord.
                </p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-[#FF6B00]">
                  <Store size={22} />
                  <span className="font-semibold">Créer votre boutique</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Vendez
                    gratuitement en quelques minutes
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Activez des
                    promos et boostez vos produits
                  </li>
                  <li className="flex items-center gap-2">
                    <BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Recevez vos
                    paiements en Mobile Money
                  </li>
                </ul>
                <a
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
        </section>
      </main>

      <Footer />
    </div>
  );
}

function normalizeProduct(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.salePrice ?? product?.promoPrice ?? 0) || 0;
  const image =
    product?.image ||
    product?.images?.[0]?.url ||
    product?.images?.[0] ||
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';
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
    brand: product?.brand || '',
    condition: product?.condition || 'Neuf',
    sellerName,
    sellerVerified: Boolean(product?.sellerVerified || product?.vendorName),
    stock: Number(product?.stock ?? 0) || 0,
    isFeatured: Boolean(product?.isFeatured),
    isNewArrival: Boolean(product?.isNewArrival),
    isNew: Boolean(product?.isNewArrival),
    isBoosted: Boolean(
      product?.isFeatured || product?.isBestSeller || product?.isBoosted
    ),
    totalSales: Number(product?.totalSales ?? 0),
    createdAt: product?.createdAt,
  };
}

export default HomeNew;
