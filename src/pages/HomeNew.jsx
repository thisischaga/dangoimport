import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Store, BadgeCheck as BadgeCheckAlt } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
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
          setProducts(mockProducts.map(normalizeProduct));
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

  const sectionTitle = searchQuery
    ? `Produits pour «${searchQuery}»`
    : 'Produits tendance';

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <Header cartCount={cartCount} />

      <main>
        {!searchQuery && (
          <section className="hidden lg:block mx-auto max-w-7xl h-[300px] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
            <div
              className="overflow-hidden bg-cover bg-center"
              style={{
                backgroundImage: `linear-gradient(135deg, rgba(255, 106, 0, 0.87), rgba(186, 186, 180, 0.15)), url(${bannerImage})`,
              }}
            >
              <div className="relative z-10 min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
                <h1 className="max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                  Achetez malin,
                  <span className="block text-4xl sm:text-5xl lg:text-6xl font-black mt-3">
                    livrez vite
                  </span>
                </h1>
              </div>
            </div>
          </section>
        )}

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

        <section className="bg-[#f6f6f7] pb-0">
          <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
            <div className="mb-4 font-display">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#FF6B00]">
                {searchQuery ? 'Résultats' : 'Sélection'}
              </p>
              <h2 className="text-[22px] font-extrabold text-[#0f0f0f] tracking-tight">{sectionTitle}</h2>
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
