import React, { useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import { useFeaturedProducts, useProductsCatalog } from "../hooks/useProducts";
import { getProductImage } from "../utils/imageUrl";

import heroImg from "../images/premium_cover_dango.png";
import parfum1 from "../images/WhatsApp Image 2026-05-11 at 21.49.32 (3).jpeg";
import parfum2 from "../images/WhatsApp Image 2026-05-11 at 21.49.33 (2).jpeg";
import parfum3 from "../images/WhatsApp Image 2026-05-11 at 21.49.34.jpeg";

import {
  FaArrowRight, FaTimes, FaShieldAlt, FaShippingFast,
  FaLock, FaStore, FaHandshake, FaGlobe, FaPercent, FaStar,
  FaCheckCircle, FaTruck, FaBoxOpen, FaUsers, FaSmile,
  FaGlobeAfrica, FaEnvelope, FaQuoteLeft, FaChevronRight,
  FaFire, FaBolt, FaSearch, FaTag, FaMedal, FaClock,
  FaMobileAlt, FaTshirt, FaSprayCan, FaHome,
  FaFutbol, FaUtensils
} from "react-icons/fa";

const FALLBACK_FEATURED = [
  { _id: '1', name: "Genie's Secret Bombshell", price: 3000, image: parfum1, category: 'Parfum', isNewArrival: true },
  { _id: '2', name: 'Kaly (Vanilla & Marshmallow)', price: 4500, image: parfum2, category: 'Parfum', isNewArrival: true },
  { _id: '3', name: 'Mayar Eau de Parfum', price: 2500, image: parfum3, category: 'Parfum', isNewArrival: false },
];

const CATEGORIES = [
  { name: 'Électronique', icon: FaMobileAlt, color: 'bg-blue-50 text-blue-600' },
  { name: 'Vêtements', icon: FaTshirt, color: 'bg-purple-50 text-purple-600' },
  { name: 'Beauté', icon: FaSprayCan, color: 'bg-pink-50 text-pink-600' },
  { name: 'Parfum', icon: FaSprayCan, color: 'bg-rose-50 text-rose-600' },
  { name: 'Montres', icon: FaClock, color: 'bg-slate-100 text-slate-700' },
  { name: 'Maison', icon: FaHome, color: 'bg-amber-50 text-amber-700' },
  { name: 'Sport', icon: FaFutbol, color: 'bg-green-50 text-green-600' },
  { name: 'Alimentation', icon: FaUtensils, color: 'bg-orange-50 text-orange-600' },
];

const TRUST_BADGES = [
  { icon: FaShieldAlt, title: 'Paiement sécurisé', desc: 'FedaPay & Cash' },
  { icon: FaTruck, title: 'Livraison 24h', desc: 'Cotonou & environs' },
  { icon: FaMedal, title: 'Vendeurs vérifiés', desc: 'Qualité contrôlée' },
  { icon: FaGlobe, title: 'Sourcing Chine', desc: 'Import B2B' },
];

const STATS = [
  { value: 1000, display: "1 000+", label: "Produits", icon: <FaBoxOpen />, bg: "bg-[#ffdc2b]/20" },
  { value: 5000, display: "5 000+", label: "Clients", icon: <FaUsers />, bg: "bg-gray-100" },
  { value: 98, display: "98%", label: "Satisfaction", icon: <FaSmile />, bg: "bg-[#ffdc2b]/20" },
  { value: 2, display: "2", label: "Pays", icon: <FaGlobeAfrica />, bg: "bg-gray-100" },
];

const TESTIMONIALS = [
  { name: "Aïcha K.", role: "Vendeuse mode", text: "Mes ventes ont triplé en 3 mois. La plateforme est simple et efficace !", rating: 5 },
  { name: "Kofi M.", role: "Client régulier", text: "Livraison le jour même à Cotonou. Je commande tous mes produits tech ici.", rating: 5 },
  { name: "Fatou D.", role: "Entrepreneuse", text: "Le sourcing depuis la Chine est excellent. Stock arrivé rapidement.", rating: 5 },
];

function fmtPrice(p) {
  const n = Number(p?.salePrice ?? p?.price ?? 0);
  return n.toLocaleString('fr-FR');
}

function ProductCard({ product, badge, onClick }) {
  const img = getProductImage(product);
  const price = product?.salePrice ?? product?.price;
  const hasPromo = product?.salePrice && product.salePrice < product.price;

  return (
    <button type="button" onClick={onClick} className="home-product-card group">
      <div className="aspect-square bg-gray-50 flex items-center justify-center p-3 relative overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="product-img max-w-full max-h-full object-contain" loading="lazy" />
        ) : (
          <FaBoxOpen className="text-gray-200 text-3xl" />
        )}
        {badge && (
          <span className="absolute top-2 left-2 text-[9px] font-black uppercase px-2 py-0.5 rounded bg-[#ffdc2b] text-[#2d3748]">
            {badge}
          </span>
        )}
        {product?.isNewArrival && !badge && (
          <span className="badge-new absolute top-2 left-2">Nouveau</span>
        )}
        {hasPromo && (
          <span className="absolute top-2 right-2 text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-3 border-t border-gray-100">
        <p className="text-[11px] text-gray-400 font-medium mb-1 line-clamp-1">{product.category || 'Marketplace'}</p>
        <h3 className="text-xs sm:text-sm font-semibold text-gray-800 line-clamp-2 min-h-[2.5rem] group-hover:text-[#c9a800] transition-colors">
          {product.name}
        </h3>
        <div className="mt-2 flex items-baseline gap-1 flex-wrap">
          <span className="text-base sm:text-lg font-black text-[#2d3748]">{fmtPrice(product)}</span>
          <span className="text-[10px] font-bold text-gray-400">FCFA</span>
          {hasPromo && (
            <span className="text-[10px] text-gray-400 line-through ml-1">{Number(product.price).toLocaleString('fr-FR')}</span>
          )}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">MOQ : 1 pièce · Livraison locale</p>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mt-1.5">
            <FaStar className="text-[#ffdc2b] text-[10px]" />
            <span className="text-[10px] font-bold text-gray-600">{product.rating}</span>
            {product.totalReviews > 0 && (
              <span className="text-[10px] text-gray-400">({product.totalReviews})</span>
            )}
          </div>
        )}
      </div>
    </button>
  );
}

function ProductRow({ title, subtitle, icon, products, viewAllPath, badge }) {
  const navigate = useNavigate();
  if (!products?.length) return null;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          {icon && <span className="w-9 h-9 rounded-lg bg-[#fffbeb] border border-[#ffdc2b]/40 flex items-center justify-center text-[#e6c600]">{icon}</span>}
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900">{title}</h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="text-xs font-bold text-[#e6c600] hover:underline flex items-center gap-1 shrink-0"
          >
            Voir tout <FaChevronRight size={9} />
          </button>
        )}
      </div>
      <div className="home-product-row">
        {products.map((p, i) => (
          <ProductCard
            key={p._id || i}
            product={p}
            badge={badge}
            onClick={() => navigate(p._id ? `/product/${p._id}` : '/shopping')}
          />
        ))}
      </div>
    </section>
  );
}

function AnimatedStat({ stat, visible }) {
  const [displayed, setDisplayed] = useState(0);
  const raf = useRef(null);

  useEffect(() => {
    if (!visible) return;
    const duration = 1400;
    const start = Date.now();
    const tick = () => {
      const progress = Math.min((Date.now() - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * stat.value));
      if (progress < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [visible, stat.value]);

  const formatted = stat.display.includes('+')
    ? displayed.toLocaleString('fr-FR') + '+'
    : stat.display.includes('%')
      ? displayed + '%'
      : displayed.toString();

  return (
    <div className={`${stat.bg} rounded-xl p-5 flex flex-col items-center text-center`}>
      <div className="text-2xl mb-2 text-gray-800">{stat.icon}</div>
      <p className="text-2xl font-black text-gray-900">{formatted}</p>
      <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide mt-1">{stat.label}</p>
    </div>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [heroSearch, setHeroSearch] = useState("");
  const statsRef = useRef(null);

  const { data: featuredFromApi = [], isLoading: featuredLoading } = useFeaturedProducts();
  const { data: catalog = [], isLoading: catalogLoading } = useProductsCatalog({ limit: 48 });

  const featuredProducts = useMemo(() => {
    if (featuredFromApi.length > 0) return featuredFromApi.slice(0, 12);
    if (catalog.length > 0) return catalog.filter((p) => p.isFeatured).slice(0, 12);
    return FALLBACK_FEATURED;
  }, [featuredFromApi, catalog]);

  const newArrivals = useMemo(() => {
    const fromCatalog = catalog.filter((p) => p.isNewArrival);
    if (fromCatalog.length >= 4) return fromCatalog.slice(0, 10);
    return catalog.slice(0, 10);
  }, [catalog]);

  const bestSellers = useMemo(() => {
    const fromCatalog = catalog.filter((p) => p.isBestSeller);
    if (fromCatalog.length >= 4) return fromCatalog.slice(0, 10);
    return [...catalog].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 10);
  }, [catalog]);

  const deals = useMemo(() => {
    return catalog.filter((p) => p.salePrice && p.salePrice < p.price).slice(0, 10);
  }, [catalog]);

  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  const handleHeroSearch = (e) => {
    e?.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/shopping?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/shopping');
    }
  };

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: newsletterEmail });
      toast.success("Merci ! Vous êtes bien inscrit à notre newsletter.");
      setNewsletterEmail("");
      setNewsletterDone(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invoiceToken = params.get("token");
    const paymentType = params.get("type");
    if (!invoiceToken) return;
    if (paymentType === "devis") {
      toast.success("Paiement du devis reçu. Merci.");
    } else {
      clearCart();
      toast.success("Paiement réussi : votre panier a bien été vidé.");
    }
    window.history.replaceState({}, document.title, location.pathname);
  }, [location.search, clearCart, location.pathname]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.state?.openSourcing || params.get("sourcing") === "true") {
      setShowForm(true);
      if (location.state?.openSourcing) {
        window.history.replaceState({ ...location.state, openSourcing: undefined }, document.title);
      } else if (params.get("sourcing") === "true") {
        params.delete("sourcing");
        const newSearch = params.toString();
        window.history.replaceState({}, document.title, location.pathname + (newSearch ? `?${newSearch}` : ''));
      }
    }
  }, [location.state, location.search, location.pathname]);

  return (
    <div className="bg-[#f5f5f5] min-h-screen text-gray-900 flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">

        {/* ══ MARKETPLACE HERO (style Alibaba) ══════════ */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Catégories — sidebar desktop */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="bg-[#fafafa] border border-gray-200 rounded-xl overflow-hidden h-full min-h-[280px]">
                  <p className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500 border-b border-gray-200 bg-white">
                    Catégories
                  </p>
                  <ul className="py-1">
                    {CATEGORIES.map((cat) => (
                      <li key={cat.name}>
                        <button
                          type="button"
                          onClick={() => navigate(`/shopping?category=${encodeURIComponent(cat.name)}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-[#fffbeb] hover:text-[#e6c600] transition-colors text-left"
                        >
                          <cat.icon size={14} className="text-gray-400 shrink-0" />
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bannière principale */}
              <div className="lg:col-span-7">
                <div
                  className="home-promo-banner"
                  style={{ backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.92), rgba(15,23,42,0.6)), url(${heroImg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                >
                  <span className="inline-flex items-center gap-1.5 bg-[#ffdc2b] text-[#2d3748] text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3">
                    <FaFire size={10} /> Offres du moment
                  </span>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl font-black leading-tight max-w-lg">
                    La marketplace Bénin & Togo
                  </h1>
                  <p className="text-sm text-gray-300 mt-2 max-w-md">
                    Des milliers de produits locaux, livraison rapide et sourcing depuis la Chine.
                  </p>

                  <form onSubmit={handleHeroSearch} className="mt-5 flex gap-2 max-w-lg">
                    <div className="flex-1 flex items-center bg-white rounded-lg overflow-hidden border-2 border-[#ffdc2b]">
                      <FaSearch className="ml-3 text-gray-400 shrink-0" size={14} />
                      <input
                        type="text"
                        placeholder="Rechercher produits, catégories..."
                        className="flex-1 px-3 py-3 text-sm text-gray-800 focus:outline-none"
                        value={heroSearch}
                        onChange={(e) => setHeroSearch(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn-home px-5 py-3 rounded-lg text-sm font-black shrink-0">
                      Chercher
                    </button>
                  </form>
                </div>
              </div>

              {/* Promos latérales */}
              <div className="lg:col-span-3 flex flex-row lg:flex-col gap-3">
                <button
                  type="button"
                  onClick={() => navigate('/shopping')}
                  className="flex-1 rounded-xl border border-[#ffdc2b]/50 bg-[#fffbeb] p-4 text-left hover:shadow-md transition-all group"
                >
                  <FaTag className="text-[#e6c600] text-xl mb-2" />
                  <p className="text-sm font-black text-gray-900">Produits vedettes</p>
                  <p className="text-[11px] text-gray-500 mt-1">Sélection top qualité</p>
                  <span className="text-[11px] font-bold text-[#e6c600] mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Explorer <FaArrowRight size={9} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white p-4 text-left hover:shadow-md transition-all group"
                >
                  <FaGlobe className="text-gray-700 text-xl mb-2" />
                  <p className="text-sm font-black text-gray-900">Sourcing Chine</p>
                  <p className="text-[11px] text-gray-500 mt-1">Devis import B2B gratuit</p>
                  <span className="text-[11px] font-bold text-gray-700 mt-2 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                    Demander <FaArrowRight size={9} />
                  </span>
                </button>
              </div>
            </div>

            {/* Catégories mobile — scroll horizontal */}
            <div className="mt-4 lg:hidden home-product-row py-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => navigate(`/shopping?category=${encodeURIComponent(cat.name)}`)}
                  className="home-category-pill"
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center ${cat.color}`}>
                    <cat.icon size={16} />
                  </span>
                  <span className="text-[10px] font-bold text-gray-700 text-center leading-tight">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TRUST STRIP ══════════════════════════════ */}
        <section className="bg-[#fffbeb] border-b border-[#ffdc2b]/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TRUST_BADGES.map((b, i) => (
                <div key={i} className="flex items-center gap-3">
                  <b.icon className="text-[#e6c600] shrink-0" size={18} />
                  <div>
                    <p className="text-xs font-black text-gray-900">{b.title}</p>
                    <p className="text-[10px] text-gray-500">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ PRODUITS — zone principale marketplace ═══ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          {(featuredLoading || catalogLoading) && !featuredProducts.length && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="skeleton h-56 rounded-lg" />
              ))}
            </div>
          )}

          <ProductRow
            title="Produits vedettes"
            subtitle="Notre sélection premium — qualité garantie"
            icon={<FaFire size={16} />}
            products={featuredProducts}
            viewAllPath="/shopping"
            badge="Top"
          />

          {deals.length > 0 && (
            <ProductRow
              title="Promos & bonnes affaires"
              subtitle="Prix réduits — quantités limitées"
              icon={<FaPercent size={16} />}
              products={deals}
              viewAllPath="/shopping"
              badge="Promo"
            />
          )}

          <ProductRow
            title="Nouveautés"
            subtitle="Derniers produits ajoutés sur la marketplace"
            icon={<FaClock size={16} />}
            products={newArrivals}
            viewAllPath="/shopping"
          />

          <ProductRow
            title="Meilleures ventes"
            subtitle="Les plus populaires auprès de nos acheteurs"
            icon={<FaMedal size={16} />}
            products={bestSellers}
            viewAllPath="/shopping"
            badge="Hot"
          />

          {/* Grille vedette — mise en avant large */}
          <div className="mt-4 bg-white border border-gray-200 rounded-2xl p-5 sm:p-8">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#2d3748] bg-[#fffbeb] border border-[#ffdc2b]/40 px-3 py-1 rounded-full">
                  Recommandé pour vous
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-gray-900 mt-2">Explorer le catalogue</h2>
              </div>
              <button type="button" onClick={() => navigate('/shopping')} className="btn-home px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2">
                Tout voir <FaArrowRight size={11} />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {(catalog.length ? catalog : featuredProducts).slice(0, 12).map((p, i) => (
                <ProductCard
                  key={p._id || i}
                  product={p}
                  onClick={() => navigate(p._id ? `/product/${p._id}` : '/shopping')}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ══ BANNIÈRE B2B SOURCING ═══════════════════ */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-[#1e2a33] to-[#344955] text-white grid md:grid-cols-2 gap-6 p-8 sm:p-10 items-center">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#ffdc2b]">Import B2B</span>
              <h2 className="text-2xl sm:text-3xl font-black mt-2">Sourcing depuis la Chine</h2>
              <p className="text-gray-300 text-sm mt-3 leading-relaxed">
                Fournisseurs vérifiés, négociation des prix, dédouanement et livraison jusqu'à vos locaux au Bénin & Togo.
              </p>
              <ul className="mt-4 space-y-2">
                {['Recherche fournisseurs', 'Contrôle qualité', 'Logistique complète'].map((t) => (
                  <li key={t} className="flex items-center gap-2 text-sm text-gray-200">
                    <FaCheckCircle className="text-[#ffdc2b] shrink-0" size={13} /> {t}
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setShowForm(true)} className="btn-home mt-6 px-6 py-3 rounded-xl text-sm font-black">
                Demander un devis gratuit
              </button>
            </div>
            <div className="hidden md:grid grid-cols-2 gap-3">
              {[
                { icon: FaShippingFast, label: 'Livraison internationale' },
                { icon: FaHandshake, label: 'Agent dédié' },
                { icon: FaLock, label: 'Paiement sécurisé' },
                { icon: FaPercent, label: 'Prix négociés' },
              ].map((item) => (
                <div key={item.label} className="bg-white/10 rounded-xl p-4 border border-white/10">
                  <item.icon className="text-[#ffdc2b] text-xl mb-2" />
                  <p className="text-xs font-bold">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ STATS ═══════════════════════════════════ */}
        <section className="py-14 px-4 sm:px-6 bg-white border-y border-gray-100" ref={statsRef}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-gray-900">Dango Import en chiffres</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STATS.map((s, i) => (
                <AnimatedStat key={i} stat={s} visible={statsVisible} />
              ))}
            </div>
          </div>
        </section>

        {/* ══ TÉMOIGNAGES ═════════════════════════════ */}
        <section className="py-14 px-4 sm:px-6 bg-[#f5f5f5]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl font-black text-gray-900">Ils nous font confiance</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6">
                  <FaQuoteLeft className="text-[#ffdc2b] mb-3" />
                  <p className="text-sm text-gray-600 italic mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-[#ffdc2b] flex items-center justify-center font-black text-sm text-gray-900">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-[11px] text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEWSLETTER ══════════════════════════════ */}
        <section className="py-14 px-4 sm:px-6 bg-gray-900">
          <div className="max-w-xl mx-auto text-center">
            <FaEnvelope className="text-[#ffdc2b] text-3xl mx-auto mb-4" />
            <h3 className="text-xl font-black text-white mb-2">Newsletter Dango Import</h3>
            <p className="text-gray-400 text-sm mb-6">Offres exclusives et nouveautés marketplace.</p>
            {newsletterDone ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-5 py-3 text-green-300 font-bold text-sm">
                Merci ! Vous êtes inscrit(e) 🎉
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
                <input
                  required
                  type="email"
                  placeholder="Votre e-mail"
                  className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:border-[#ffdc2b]"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
                <button disabled={newsletterLoading} type="submit" className="btn-home px-6 py-3 rounded-lg text-sm font-black disabled:opacity-50">
                  {newsletterLoading ? "..." : "S'inscrire"}
                </button>
              </form>
            )}
          </div>
        </section>
      </main>

      <Footer />

      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] bg-white rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-red-50 hover:text-red-500 p-2.5 rounded-xl z-10"
            >
              <FaTimes size={14} />
            </button>
            <div className="p-6 md:p-8">
              <DevisForm showForm={setShowForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
