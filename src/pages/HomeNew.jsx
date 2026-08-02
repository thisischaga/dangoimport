import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BadgeCheck,
  Search,
  ShoppingCart,
  Store,
  UserRound,
  BadgeCheck as BadgeCheckAlt,
} from 'lucide-react';
import ProductCard from '../components/product/ProductCard';
import ProductGrid from '../components/product/ProductGrid';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import { mockProducts } from '../data/mockData';
import bannerImage from '../images/baniere.jfif';
import Header from '../components/Header';
import Footer from '../components/Footer';

// HOME_CATEGORIES removed — categories block intentionally omitted

function FlashTimer() {
  const [timeLeft, setTimeLeft] = useState({ h: 3, m: 47, s: 22 });
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {[pad(timeLeft.h), pad(timeLeft.m), pad(timeLeft.s)].map((unit, i) => (
        <React.Fragment key={i}>
          <span style={{
            background: '#1A1A1A', color: '#FF6B00', fontWeight: 800,
            fontSize: '13px', borderRadius: '6px', padding: '4px 8px',
            fontVariantNumeric: 'tabular-nums', letterSpacing: '0.05em',
            minWidth: '30px', textAlign: 'center', display: 'inline-block'
          }}>{unit}</span>
          {i < 2 && <span style={{ color: '#FF6B00', fontWeight: 800, fontSize: '14px' }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

function HomeNew({ cartCount: cartCountProp }) {
  const { addToCart, cartCount: contextCount } = useCart();
  const cartCount = cartCountProp ?? contextCount;
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      try {
        setLoading(true);
        const [catalogResponse, featuredResponse] = await Promise.all([
          client.get('/products?limit=12'),
          client.get('/products/featured'),
        ]);

        const catalog = Array.isArray(catalogResponse?.data?.data) ? catalogResponse.data.data : [];
        const featured = Array.isArray(featuredResponse?.data?.data) ? featuredResponse.data.data : [];
        const merged = [...featured, ...catalog];
        const unique = Array.from(new Map(merged.map((product) => [product._id || product.id, product])).values());

        if (isMounted) {
          setProducts(unique.map(normalizeProduct));
          setError('');
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.message || 'Impossible de charger les produits');
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
  }, []);

  const allProducts = useMemo(() => {
    return [...products].sort((a, b) => {
      if (a.isBoosted !== b.isBoosted) return Number(b.isBoosted) - Number(a.isBoosted);
      if (a.promoPrice && !b.promoPrice) return -1;
      if (!a.promoPrice && b.promoPrice) return 1;
      return Number(b.isFeatured) - Number(a.isFeatured);
    });
  }, [products]);

  const flashProducts = useMemo(() => allProducts.filter((product) => product.promoPrice && product.promoPrice < product.price).slice(0, 5), [allProducts]);

  const popularStores = useMemo(() => {
    return Array.from(
      products.reduce((map, product) => {
        const sellerName = product.sellerName || 'Vendeur indépendant';
        if (!map.has(sellerName)) {
          map.set(sellerName, {
            sellerName,
            sellerLogo: product.image,
            sellerVerified: Boolean(product.sellerVerified),
          });
        }
        return map;
      }, new Map()).values()
    ).slice(0, 4);
  }, [products]);

  return (
    <div className="min-h-screen bg-[#f6f6f7] text-slate-900">
      <Header
        cartCount={cartCount}
      />

      <main>
        {/**error && (
          <div className="mx-auto mt-4 max-w-7xl rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error} — affichage du contenu de secours.
          </div>
        ) */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="overflow-hidden rounded-[28px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(135deg, rgba(255, 106, 0, 0.87), rgba(186, 186, 180, 0.15)), url(${bannerImage})` }}>
            <div className="relative z-10 min-h-[320px] sm:min-h-[360px] lg:min-h-[420px] px-6 py-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20">
              <h1 className="max-w-2xl text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Achetez malin,
                <span className="block text-4xl sm:text-5xl lg:text-6xl font-black mt-3">livrez vite</span>
              </h1>
              <p className="mt-6 max-w-2xl text-sm sm:text-base text-white/85 leading-relaxed">
                Découvrez des produits vérifiés et livrés rapidement par des vendeurs fiables à travers l’Afrique.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
                <button onClick={() => navigate('/shopping')} className="inline-flex items-center justify-center rounded-full bg-[#FF6B00] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-200/30 transition hover:bg-[#e06500]">
                  Parcourir la boutique
                </button>
                <button onClick={() => navigate('/contact')} className="inline-flex items-center justify-center rounded-full border border-white/50 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:border-white hover:bg-white/15">
                  Nous contacter
                </button>
              </div>
            </div>
          </div>
        </section>
        

        
        {/* Categories section removed per request */}

        {/* ── PRODUITS — grille complète avec filtres + infinite scroll ── */}
        <section style={{ background: '#f6f6f7', paddingBottom: '0' }}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" style={{ paddingTop: '32px', paddingBottom: '0' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <p style={{ color: '#FF6B00', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '4px' }}>Sélection</p>
                <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f0f0f', margin: 0 }}>Produits tendance</h2>
              </div>
            </div>
          </div>
          <ProductGrid
            products={allProducts}
            loading={loading}
            onAddToCart={addToCart}
          />
        </section>


        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">Vendeurs</p>
            <h2 className="text-2xl font-bold text-slate-900">Boutiques populaires</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {popularStores.map((store) => (
              <Link to={`/store/${store.sellerName}`} key={store.sellerName} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-[#FF6B00]">
                <img src={store.sellerLogo} alt={store.sellerName} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-semibold text-slate-900">{store.sellerName}</h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500">
                    {store.sellerVerified && <BadgeCheck size={14} className="text-[#FF6B00]" />}
                    <span>Vendeur vérifié</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-[#FFD9BE] bg-[#FFF3EA] p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.7fr] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#FF6B00]">Devenir vendeur</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-900">Ouvrez votre boutique et atteignez des milliers d’acheteurs.</h2>
                <p className="mt-4 max-w-2xl text-lg text-slate-600">
                  Gérez vos stocks, vos promos et vos ventes en toute simplicité depuis votre tableau de bord.
                </p>
              </div>
              <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3 text-[#FF6B00]">
                  <Store size={22} />
                  <span className="font-semibold">Créer votre boutique</span>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                  <li className="flex items-center gap-2"><BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Vendez gratuitement en quelques minutes</li>
                  <li className="flex items-center gap-2"><BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Activez des promos et boostez vos produits</li>
                  <li className="flex items-center gap-2"><BadgeCheckAlt size={16} className="text-[#FF6B00]" /> Recevez vos paiements en Mobile Money</li>
                </ul>
                <Link to="/seller" className="mt-6 inline-flex items-center gap-2 font-semibold text-[#FF6B00]">
                  Ouvrir ma boutique <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer/>
    </div>
  );
}

function normalizeProduct(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.salePrice ?? product?.promoPrice ?? 0) || 0;
  const image = product?.image || product?.images?.[0]?.url || product?.images?.[0] || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';
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
