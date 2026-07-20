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

/* ──────────────────────────────────────────────
   Alibaba-style product grid components
   ────────────────────────────────────────────── */
function ProductCard({ product, badge, onClick }) {
  const img = getProductImage(product);
  const displayPrice = product?.salePrice ?? product?.price;

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col text-left w-full h-full bg-white dark:bg-[#1e2130] rounded-xl overflow-hidden hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] dark:hover:shadow-black/50 transition-shadow duration-300 relative border border-transparent hover:border-gray-100 dark:hover:border-gray-700"
    >
      {/* Image Container */}
      <div className="w-full aspect-square relative bg-[#f7f8fa] dark:bg-[#14161f] flex items-center justify-center p-4">
        {img ? (
          <img
            src={img}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <FaBoxOpen className="text-gray-300 dark:text-gray-700 text-5xl" />
        )}
        
        {/* Optional Badge */}
        {badge && (
          <div className="absolute top-2 left-2 bg-[var(--color-accent-primary)] text-white text-[10px] font-bold px-2 py-0.5 rounded-full z-10">
            {badge}
          </div>
        )}
      </div>

      {/* Info Container */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col w-full text-left bg-white dark:bg-[#1e2130]">
        {/* Title */}
        <p className="text-[13px] sm:text-[14px] leading-[1.3] text-[#222] dark:text-gray-200 line-clamp-2 mb-2 group-hover:text-[var(--color-accent-primary)] transition-colors min-h-[2.6em] font-normal">
          {product.name}
        </p>

        {/* Price & MOQ */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-1">
            <span className="text-[16px] sm:text-[18px] font-bold text-[#222] dark:text-white leading-none">
              {Number(displayPrice).toLocaleString('fr-FR')}
            </span>
            <span className="text-[12px] font-semibold text-[#222] dark:text-white">FCFA</span>
          </div>
          
          <p className="text-[12px] text-[#666] dark:text-gray-400 mt-1">
            1 pièce <span className="text-[#999]">(Min. order)</span>
          </p>
        </div>
      </div>
    </button>
  );
}

function ProductSection({ title, subtitle, products, viewAllPath, badge, icon }) {
  const navigate = useNavigate();
  if (!products?.length) return null;

  const shown = products.slice(0, 10);

  return (
    <section className="mb-8">
      {/* Section header (Alibaba Style) */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-[#222] dark:text-white leading-tight flex items-center gap-2">
            {title}
          </h2>
          {subtitle && <p className="text-[14px] text-[#666] dark:text-gray-400 mt-1">{subtitle}</p>}
        </div>
        {viewAllPath && (
          <button
            type="button"
            onClick={() => navigate(viewAllPath)}
            className="hidden sm:flex items-center gap-1 text-[14px] text-[#666] hover:text-[var(--color-accent-primary)] transition-colors font-medium"
          >
            Voir plus <FaChevronRight size={10} className="mt-0.5" />
          </button>
        )}
      </div>

      {/* Product grid with gaps */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {shown.map((p, i) => (
          <ProductCard
            key={p._id || i}
            product={p}
            badge={badge}
            onClick={() => navigate(p._id ? `/product/${p._id}` : '/shopping')}
          />
        ))}
      </div>
      
      {/* Mobile view all button */}
      {viewAllPath && (
        <button
          type="button"
          onClick={() => navigate(viewAllPath)}
          className="w-full mt-4 sm:hidden py-3 bg-white dark:bg-[#1e2130] rounded-xl text-[14px] font-medium border border-gray-200 dark:border-gray-800 text-[#222] dark:text-white"
        >
          Voir plus
        </button>
      )}
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


        {/* ══ PRODUITS — Grille style Alibaba ═══════════ */}
        <section className="max-w-[var(--floorWrapperWidth)] mx-auto px-4 sm:px-6 lg:px-8 pb-10 pt-8">
          {(featuredLoading || catalogLoading) && !featuredProducts.length && (
            <div className="mb-8">
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
                {[1,2,3,4,5,6,7,8,9,10].map((i) => (
                  <div key={i} className="bg-white dark:bg-[#1e2130] rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-gray-200 dark:bg-gray-800 animate-pulse w-full aspect-square" />
                    <div className="p-3 sm:p-4 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-1/3 mt-4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <ProductSection
            title="Produits vedettes"
            subtitle="Notre sélection premium — qualité garantie"
            icon={<FaFire size={13} />}
            products={featuredProducts}
            viewAllPath="/shopping"
            badge="Top"
          />

          {deals.length > 0 && (
            <ProductSection
              title="Promos & bonnes affaires"
              subtitle="Prix réduits — quantités limitées"
              icon={<FaPercent size={13} />}
              products={deals}
              viewAllPath="/shopping"
              badge="Promo"
            />
          )}

          <ProductSection
            title="Nouveautés"
            subtitle="Derniers produits ajoutés"
            icon={<FaClock size={13} />}
            products={newArrivals}
            viewAllPath="/shopping"
          />

          <ProductSection
            title="Meilleures ventes"
            subtitle="Les plus populaires auprès de nos acheteurs"
            icon={<FaMedal size={13} />}
            products={bestSellers}
            viewAllPath="/shopping"
            badge="Hot"
          />

          <ProductSection
            title="Recommandés pour vous"
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
