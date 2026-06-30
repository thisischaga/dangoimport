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

import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { motion } from "framer-motion";

import slide1Img from "../images/sourcing_slide.png";
import slide2Img from "../images/slide2.png";
import slide3Img from "../images/slide3.png";

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
    <button type="button" onClick={onClick} className="group bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col text-left transition-all h-full shadow-sm hover:shadow-md hover:border-[#ffdc2b]">
      <div className="aspect-square w-full product-img-container flex items-center justify-center p-3 relative">
        {img ? (
          <img src={img} alt={product.name} className="product-img max-w-full max-h-full object-contain" loading="lazy" />
        ) : (
          <FaBoxOpen className="text-gray-300 text-4xl" />
        )}
        {badge && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#ffdc2b] text-white z-10 rounded-sm">
            {badge}
          </span>
        )}
        {hasPromo && (
          <span className="absolute top-2 right-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#ffdc2b] text-white z-10 rounded-sm">
            -{Math.round((1 - product.salePrice / product.price) * 100)}%
          </span>
        )}
      </div>
      <div className="p-2.5 flex-1 flex flex-col">
        <h3 className="text-[12px] sm:text-[13px] text-[#000000] dark:text-white line-clamp-2 mb-1 group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 leading-snug">
          {product.name}
        </h3>
        {product.rating > 0 && (
          <div className="flex items-center gap-1 mb-1">
            <div className="flex text-[#FFA41C] text-[10px]">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className={i < Math.floor(product.rating) ? "text-[#FFA41C]" : "text-gray-300"} />
              ))}
            </div>
            {product.totalReviews > 0 && (
              <span className="text-[10px] text-[#2563EB]">{product.totalReviews}</span>
            )}
          </div>
        )}
        <div className="mt-auto pt-1">
          <div className="flex items-baseline gap-1">
            <span className="text-[15px] sm:text-[17px] font-bold text-[#B12704]">{fmtPrice(product)}</span>
            <span className="text-[10px] text-[#B12704] font-medium">FCFA</span>
          </div>
          {hasPromo && (
            <span className="text-[10px] text-[#565959] line-through">Prix: {Number(product.price).toLocaleString('fr-FR')} FCFA</span>
          )}
        </div>
      </div>
    </button>
  );
}

function ProductRow({ title, subtitle, products, viewAllPath, badge }) {
  const navigate = useNavigate();
  if (!products?.length) return null;

  return (
    <section className="mb-6 bg-white sm:border sm:border-gray-200 sm:rounded-md pt-5 pb-2">
      <div className="flex items-end justify-between gap-4 mb-4 px-4 sm:px-6">
        <div>
          <h2 className="text-[19px] sm:text-[21px] font-black text-[#000000] dark:text-white tracking-tight leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="text-[13px] font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline whitespace-nowrap"
          >
            Voir tout
          </button>
        )}
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 px-4 sm:px-6 pb-4 scrollbar-hide">
        {products.slice(0, 10).map((p, i) => (
          <div key={p._id || i} className="snap-start shrink-0 w-[140px] sm:w-[180px]">
            <ProductCard
              product={p}
              badge={badge}
              onClick={() => navigate(p._id ? `/product/${p._id}` : '/shopping')}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [heroSearch, setHeroSearch] = useState("");

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

  const handleHeroSearch = (e) => {
    e?.preventDefault();
    if (heroSearch.trim()) {
      navigate(`/shopping?q=${encodeURIComponent(heroSearch.trim())}`);
    } else {
      navigate('/shopping');
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
    <div className="bg-[#f5f5f5] dark:bg-[#0f1115] min-h-screen text-gray-900 dark:text-gray-100 flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">

        {/* ══ MARKETPLACE HERO (style Alibaba) ══════════ */}
        <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

              {/* Catégories — sidebar desktop */}
              <div className="hidden lg:block lg:col-span-2">
                <div className="bg-[#fafafa] dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden h-full min-h-[280px]">
                  <p className="px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                    Catégories
                  </p>
                  <ul className="py-1">
                    {CATEGORIES.map((cat) => (
                      <li key={cat.name}>
                        <button
                          type="button"
                          onClick={() => navigate(`/shopping?category=${encodeURIComponent(cat.name)}`)}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-[#fffbeb] dark:hover:bg-gray-700 hover:text-[#e6c600] dark:hover:text-white transition-colors text-left"
                        >
                          <cat.icon size={14} className="text-gray-400 shrink-0" />
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bannière principale (Slider) */}
              <div className="lg:col-span-7 flex flex-col gap-4">
                <div className="rounded-2xl overflow-hidden relative shadow-sm">
                  <Slider
                    dots={true}
                    infinite={true}
                    speed={500}
                    slidesToShow={1}
                    slidesToScroll={1}
                    autoplay={true}
                    autoplaySpeed={4000}
                    arrows={false}
                    appendDots={dots => (
                      <div style={{ bottom: '10px' }}>
                        <ul style={{ margin: "0px" }}> {dots} </ul>
                      </div>
                    )}
                  >
                    {/* Slide 1 - Électronique */}
                    <div className="outline-none">
                      <div className="h-[280px] sm:h-[320px] bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-10 flex items-center justify-between">
                        <div className="flex-1 z-10 max-w-[55%] sm:max-w-[50%]">
                          <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                            <FaBolt size={10} /> Nouvel arrivage
                          </span>
                          <h1 className="text-xl sm:text-3xl font-black leading-tight mb-2">
                            Électronique & High-Tech
                          </h1>
                          <p className="text-xs sm:text-sm text-blue-200 mb-5 line-clamp-2 sm:line-clamp-none">
                            Les derniers smartphones et gadgets aux meilleurs prix du marché.
                          </p>
                          <button onClick={() => navigate('/shopping?category=Électronique')} className="bg-white hover:bg-gray-100 text-blue-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                            Acheter maintenant
                          </button>
                        </div>
                        <div className="w-[45%] sm:w-[40%] h-full flex items-center justify-end relative">
                          <img src={featuredProducts.length > 0 ? getProductImage(featuredProducts[0]) : slide2Img} alt="Électronique" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>

                    {/* Slide 2 - Beauté */}
                    <div className="outline-none">
                      <div className="h-[280px] sm:h-[320px] bg-gradient-to-r from-rose-900 to-pink-800 text-white p-6 sm:p-10 flex items-center justify-between">
                        <div className="flex-1 z-10 max-w-[55%] sm:max-w-[50%]">
                          <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                            <FaFire size={10} /> Top Qualité
                          </span>
                          <h1 className="text-xl sm:text-3xl font-black leading-tight mb-2">
                            Parfums & Beauté
                          </h1>
                          <p className="text-xs sm:text-sm text-rose-200 mb-5 line-clamp-2 sm:line-clamp-none">
                            Découvrez notre collection premium de parfums et soins de luxe.
                          </p>
                          <button onClick={() => navigate('/shopping?category=Beauté')} className="bg-white hover:bg-gray-100 text-rose-900 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                            Découvrir
                          </button>
                        </div>
                        <div className="w-[45%] sm:w-[40%] h-full flex items-center justify-end relative">
                          <img src={featuredProducts.length > 1 ? getProductImage(featuredProducts[1]) : slide3Img} alt="Beauté et Parfums" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                        </div>
                      </div>
                    </div>

                    {/* Slide 3 - Sourcing */}
                    <div className="outline-none">
                      <div className="h-[280px] sm:h-[320px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-10 flex items-center justify-between relative overflow-hidden">
                        <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ffdc2b]/10 blur-[80px] rounded-full"></div>
                        <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full"></div>
                        
                        <div className="flex-1 z-10 max-w-[55%] sm:max-w-[50%] relative">
                          <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ffdc2b] to-[#e6c600] text-[#1a202c] text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm shadow-[#ffdc2b]/20">
                            <FaGlobeAfrica size={10} /> Import B2B
                          </span>
                          <h1 className="text-xl sm:text-3xl font-black leading-tight mb-2 tracking-tight">
                            Sourcing <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdc2b] to-white">Chine</span>
                          </h1>
                          <p className="text-xs sm:text-sm text-gray-300 mb-5 line-clamp-2 sm:line-clamp-none">
                            Fournisseurs vérifiés, logistique premium et douane jusqu'au Bénin & Togo.
                          </p>
                          <button onClick={() => setShowForm(true)} className="bg-[#ffdc2b] text-[#0f172a] hover:bg-[#e6c600] px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg text-xs sm:text-sm font-black transition-all shadow-lg shadow-[#ffdc2b]/20">
                            Devis gratuit
                          </button>
                        </div>
                        <div className="w-[45%] sm:w-[40%] h-full flex items-center justify-end relative z-10">
                          <img src={featuredProducts.length > 2 ? getProductImage(featuredProducts[2]) : slide1Img} alt="Sourcing Chine Premium" className="max-h-[110%] object-contain origin-right drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                        </div>
                      </div>
                    </div>
                  </Slider>
                </div>

                {/* Barre de recherche */}
                <form onSubmit={handleHeroSearch} className="flex gap-2">
                  <div className="flex-1 flex items-center bg-white dark:bg-gray-800 rounded-xl overflow-hidden border-2 border-[#ffdc2b] shadow-sm">
                    <FaSearch className="ml-4 text-gray-400 shrink-0" size={14} />
                    <input
                      type="text"
                      placeholder="Rechercher des produits, catégories, marques..."
                      className="flex-1 px-4 py-3 sm:py-3.5 text-sm text-gray-800 dark:text-gray-100 bg-transparent focus:outline-none"
                      value={heroSearch}
                      onChange={(e) => setHeroSearch(e.target.value)}
                    />
                  </div>
                  <button type="submit" className="btn-home px-5 sm:px-8 py-3 sm:py-3.5 rounded-xl text-sm font-black shrink-0 transition-transform active:scale-95">
                    Chercher
                  </button>
                </form>
              </div>

              {/* Promos latérales */}
              <div className="lg:col-span-3 flex flex-row lg:flex-col gap-4">
                <button
                  type="button"
                  onClick={() => navigate('/shopping')}
                  className="flex-1 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-5 text-left text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center mb-3">
                      <FaTag className="text-white text-lg" />
                    </div>
                    <h3 className="text-lg font-bold">Produits vedettes</h3>
                    <p className="text-indigo-100 text-xs mt-1 leading-snug">Découvrez notre sélection des meilleurs articles du moment.</p>
                  </div>
                  <span className="text-sm font-bold text-white mt-4 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Explorer <FaArrowRight size={12} />
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="flex-1 rounded-xl bg-gradient-to-br from-[#1e293b] to-[#0f172a] p-5 text-left text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all group flex flex-col justify-between border border-[#334155]"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#ffdc2b]/10 flex items-center justify-center mb-3">
                      <FaGlobe className="text-[#ffdc2b] text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-[#ffdc2b]">Sourcing Chine</h3>
                    <p className="text-gray-300 text-xs mt-1 leading-snug">Déléguez vos imports B2B. Devis gratuit et logistique complète.</p>
                  </div>
                  <span className="text-sm font-bold text-white mt-4 inline-flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                    Demander <FaArrowRight size={12} />
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



        {/* ══ PRODUITS — zone principale marketplace ═══ */}
        <section className="mx-auto pb-8 sm:pb-10 pt-2 sm:pt-4">
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

          <ProductRow
            title="Produits recommandés pour vous"
            products={catalog.length ? catalog : featuredProducts}
            viewAllPath="/shopping"
          />
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
