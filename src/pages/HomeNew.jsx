import React, { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowRight, Store, BadgeCheck as BadgeCheckAlt, SlidersHorizontal } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <Header cartCount={cartCount} />

      <main style={{
        marginTop: "90px",
        '@media (max-width: 768px)': {
          marginTop: "0px",
        }
      }}>
        {/**!searchQuery && (
          <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-xl bg-slate-950 text-white min-h-[300px] lg:h-[300px] px-8 lg:px-12 py-10 shadow-lg">
              <div
                className="absolute inset-0 bg-cover bg-center opacity-45"
                style={{ backgroundImage: `url(${bannerImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
              <div className="relative z-10 max-w-2xl">
                <h1 className="text-3xl lg:text-5xl font-extrabold text-white leading-tight">
                  Les meilleures offres <br />
                  <span className="text-[#FF6B00]">au meilleur prix</span>
                </h1>
                <p className="text-slate-200 text-sm mt-4 font-semibold max-w-lg leading-relaxed">
                  Découvrez notre catalogue avec livraison au Bénin et Togo.
                </p>
              </div>
            </div>
          </section>
        ) */}

        <section id="marketplace-feeds" className="bg-[#f6f6f7] pb-12">
          

          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            drawerOpen={drawerOpen}
            setDrawerOpen={setDrawerOpen}
          />

          <ProductGrid
            products={products}
            loading={loading}
            onAddToCart={addToCart}
            filters={filters}
            onFiltersChange={handleFiltersChange}
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
  };
}

export default HomeNew;
