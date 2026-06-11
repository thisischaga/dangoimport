import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import axios from "axios";
import API_BASE_URL from "../apiConfig";
import { useFeaturedProducts } from "../hooks/useProducts";
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
  FaFire, FaBolt
} from "react-icons/fa";

const getProductImg = (p) => getProductImage(p);

const FALLBACK_FEATURED = [
  { _id: '1', name: "Genie's Secret Bombshell", price: 3000, image: parfum1, category: 'Parfum', isNewArrival: true },
  { _id: '2', name: 'Kaly (Vanilla & Marshmallow)', price: 4500, image: parfum2, category: 'Parfum', isNewArrival: true },
  { _id: '3', name: 'Mayar Eau de Parfum', price: 2500, image: parfum3, category: 'Parfum', isNewArrival: false },
];

const STATS = [
  { value: 1000, display: "1 000+", label: "Produits",     icon: <FaBoxOpen />,     color: "text-gray-900", bg: "bg-[#ffdc2b]/20" },
  { value: 5000, display: "5 000+", label: "Clients",      icon: <FaUsers />,       color: "text-gray-900", bg: "bg-gray-100" },
  { value: 98,   display: "98%",    label: "Satisfaction", icon: <FaSmile />,       color: "text-gray-900", bg: "bg-[#ffdc2b]/20" },
  { value: 2,    display: "2",      label: "Pays",         icon: <FaGlobeAfrica />, color: "text-gray-900", bg: "bg-gray-100" },
];

const AVANTAGES = [
  { icon: <FaPercent />,      title: "Commissions avantageuses", desc: "Parmi les plus basses du marché pour maximiser vos bénéfices.",     color: "bg-gray-100 text-gray-800" },
  { icon: <FaShippingFast />, title: "Livraison rapide",         desc: "Même jour à Cotonou · 24h partout au Bénin & Togo.",               color: "bg-[#fffbeb] text-[#2d3748]" },
  { icon: <FaLock />,         title: "Paiement sécurisé FedaPay", desc: "Mobile Money (MTN, Moov) ou paiement à la livraison.",            color: "bg-gray-100 text-gray-800" },
  { icon: <FaStar />,         title: "Visibilité locale",        desc: "Vos produits mis en avant auprès de milliers d'acheteurs.",        color: "bg-[#fffbeb] text-[#2d3748]" },
  { icon: <FaHandshake />,    title: "Accompagnement humain",    desc: "Une équipe basée au Bénin, disponible pour vous.",                 color: "bg-gray-100 text-gray-800" },
];

const TESTIMONIALS = [
  { name: "Aïcha K.", role: "Vendeuse mode", text: "Depuis que j'ai rejoint Dango Import, mes ventes ont triplé en 3 mois. La plateforme est simple et efficace !", rating: 5 },
  { name: "Kofi M.", role: "Client régulier", text: "La livraison le jour même à Cotonou, c'est incroyable. Je commande désormais tous mes produits tech ici.", rating: 5 },
  { name: "Fatou D.", role: "Entrepreneuse", text: "Le service de sourcing depuis la Chine est excellent. Mon stock est arrivé en parfait état et rapidement.", rating: 5 },
];

/* ── Animated counter ─────────────────────── */
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
    <div className={`${stat.bg} rounded-2xl p-6 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300`}>
      <div className={`text-3xl mb-3 ${stat.color}`}>{stat.icon}</div>
      <p className={`text-3xl font-black mb-1 ${stat.color}`}>{formatted}</p>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{stat.label}</p>
    </div>
  );
}

/* ═══════════════════════════════════════════ */
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterDone, setNewsletterDone] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const { data: featuredFromApi = [] } = useFeaturedProducts();
  const featuredProducts = featuredFromApi.length > 0
    ? featuredFromApi.slice(0, 6)
    : FALLBACK_FEATURED;
  const statsRef = useRef(null);

  /* Intersection observer for stats count-up */
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

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
    <div style={{ fontFamily: "'Outfit', sans-serif" }} className="bg-[#f8f9fa] min-h-screen text-gray-900 flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">

        {/* ══ HERO ════════════════════════════════════ */}
        <section
          className="relative min-h-[80vh] flex items-center justify-center bg-cover bg-center overflow-hidden"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950/90 via-gray-900/80 to-gray-950/85" />

          {/* Floating decoration */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#ffdc2b]/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-48 h-48 bg-white/5 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />

          <div className="relative z-10 text-center w-full max-w-5xl px-6 py-24 flex flex-col items-center">
            {/* Tag 
            <div className="inline-flex items-center gap-2 bg-[#ffdc2b]/20 border border-[#ffdc2b]/40 text-[#ffdc2b] px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 animate-fade-in">
              <FaFire size={10} className="animate-pulse" />
              Marketplace N°1 au Bénin & Togo
            </div>*/}

            {/* Heading */}
            <h1 className="mb-4 leading-tight tracking-tight animate-fade-in-up">
              <span className="block text-5xl md:text-7xl font-black text-white">Dango Import</span>
              <span className="block text-xl md:text-3xl font-bold mt-3">
                <span className="gradient-text">La Marketplace Locale</span>
                <span className="text-white"> du Bénin & Togo</span>
              </span>
            </h1>

            <p className="mb-10 max-w-2xl text-base md:text-lg text-gray-300 leading-relaxed font-medium animate-fade-in-up delay-200">
              Achetez des produits de qualité auprès de vendeurs locaux vérifiés et développez votre business sur une plateforme fiable, rapide et sécurisée.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in-up delay-300">
              <button
                onClick={() => navigate("/shopping")}
                className="btn-home px-8 py-4 rounded-xl font-black text-sm uppercase tracking-wide flex items-center gap-2.5 hover:scale-105 active:scale-95"
              >
                <FaStore size={14} /> Découvrir la boutique
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-wide transition-all flex items-center gap-2.5 backdrop-blur-sm hover:scale-105"
              >
                <FaGlobe size={14} /> Sourcing depuis la Chine
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-400 font-semibold animate-fade-in-up delay-400">
              {[
                { icon: <FaLock className="text-[#ffdc2b]" />, text: "Paiement sécurisé" },
                { icon: <FaTruck className="text-[#ffdc2b]" />, text: "Livraison 24h" },
                { icon: <FaShieldAlt className="text-[#ffdc2b]" />, text: "Vendeurs vérifiés" },
                { icon: <FaBolt className="text-[#ffdc2b]" />, text: "Support réactif" },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  {b.icon} {b.text}
                </span>
              ))}
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-40">
            <div className="w-px h-8 bg-white/50" />
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-bounce" />
          </div>
        </section>

        {/* ══ À PROPOS + STATS ════════════════════════ */}
        <section className="py-20 px-6 bg-white border-b border-gray-100" ref={statsRef}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="animate-fade-in-up">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest bg-[#ffdc2b]/20 px-3 py-1.5 rounded-full">Notre histoire</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mt-4 mb-6 leading-tight">
                À propos de<br /><span className="text-[#ffdc2b]">Dango Import</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>Dango Import</strong> est un produit exclusif de la société <strong>Dango Hub</strong>.
                </p>
                <p>
                  Nous sommes la marketplace 100% locale dédiée au Bénin et au Togo. Notre mission est de simplifier le commerce en connectant directement acheteurs et vendeurs sur une plateforme sécurisée, rapide et adaptée aux réalités ouest-africaines.
                </p>
              </div>
              <button
                onClick={() => navigate("/shopping")}
                className="mt-8 inline-flex items-center gap-2 btn-home px-6 py-3 rounded-xl font-bold text-sm hover:scale-105"
              >
                Explorer la plateforme <FaArrowRight size={12} />
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <div key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                  <AnimatedStat stat={s} visible={statsVisible} />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NOS SERVICES ════════════════════════════ */}
        <section className="py-20 px-6 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12 text-center animate-fade-in-up">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest bg-[#ffdc2b]/20 px-3 py-1.5 rounded-full">Ce qu'on offre</span>
              <h2 className="text-3xl font-black text-gray-900 mt-4">Nos Services</h2>
              <p className="text-gray-500 mt-2 max-w-xl mx-auto text-sm">Des solutions e-commerce complètes pour particuliers et professionnels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Marketplace */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#2d3748] text-[#ffdc2b] rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-[#2d3748]/15">
                    <FaStore />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Marketplace Locale</h3>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Achat & Vente</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Achetez ou vendez une large gamme de produits (Mode, Beauté, Électronique, Maison) avec des vendeurs locaux vérifiés.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {["Des milliers de produits disponibles","Commandes sécurisées","Livraison rapide (24h/48h)","Cash on Delivery & Mobile Money"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-500 shrink-0" size={13} /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate("/shopping")}
                  className="flex items-center gap-2 btn-home px-6 py-2.5 rounded-xl font-bold text-sm"
                >
                  Accéder à la boutique <FaChevronRight size={10} />
                </button>
              </div>

              {/* Sourcing */}
              <div className="bg-white border border-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group animate-fade-in-up delay-200">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-[#fffbeb] text-[#2d3748] border border-[#ffdc2b]/35 rounded-2xl flex items-center justify-center text-2xl shadow-sm">
                    <FaShippingFast />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">Importation Chine</h3>
                    <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Sourcing B2B</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                  Renouvelez votre stock facilement. Nos agents gèrent l'intégralité du processus, de l'usine en Chine jusqu'à vos locaux.
                </p>
                <ul className="space-y-2.5 mb-8">
                  {["Recherche de fournisseurs fiables","Négociation des prix d'achat","Dédouanement pris en charge","Logistique complète jusqu'à livraison"].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-500 shrink-0" size={13} /> {item}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => setShowForm(true)}
                  className="flex items-center gap-2 btn-home px-6 py-2.5 rounded-xl font-bold text-sm"
                >
                  Demander un devis <FaChevronRight size={10} />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ══ VITRINE PRODUITS ════════════════════════ */}
        <section className="py-20 px-6 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-black text-[#2d3748] uppercase tracking-widest bg-[#fffbeb] border border-[#ffdc2b]/35 px-3 py-1.5 rounded-full">
                  Vitrine
                </span>
                <h2 className="section-title mt-3">Nos produits</h2>
                <p className="section-subtitle">Découvrez la sélection du moment sur la marketplace.</p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/shopping')}
                className="btn-home px-5 py-2.5 rounded-xl text-sm flex items-center gap-2"
              >
                Voir tout le catalogue <FaArrowRight size={11} />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4 sm:gap-6">
              {(featuredProducts.length ? featuredProducts : FALLBACK_FEATURED).map((p, i) => {
                const imgSrc = getProductImg(p);
                const price = p.salePrice || p.price;
                return (
                  <button
                    key={p._id || i}
                    type="button"
                    onClick={() => navigate(p._id ? `/product/${p._id}` : '/shopping')}
                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 text-left group hover:-translate-y-1"
                  >
                    <div className="bg-gray-50 aspect-square flex items-center justify-center p-4 relative overflow-hidden">
                      {imgSrc ? (
                        <img
                          src={imgSrc}
                          alt={p.name}
                          className="product-img max-w-full max-h-full object-contain"
                        />
                      ) : (
                        <FaBoxOpen className="text-gray-200 text-4xl" />
                      )}
                      {p.isNewArrival && (
                        <span className="badge-new absolute top-3 left-3">Nouveau</span>
                      )}
                      {p.category && (
                        <span className="absolute top-3 right-3 bg-gray-900/80 text-white text-[9px] font-bold px-2 py-1 rounded-md">
                          {p.category}
                        </span>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-gray-600 transition-colors">
                        {p.name}
                      </h3>
                      <p className="text-lg font-black text-gray-900">
                        {Number(price || 0).toLocaleString('fr-FR')}{' '}
                        <span className="text-xs font-bold text-gray-400">FCFA</span>
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ AVANTAGES ═══════════════════════════════ */}
        <section className="py-20 px-6 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <span className="text-xs font-black text-gray-900 uppercase tracking-widest bg-[#ffdc2b]/30 px-3 py-1.5 rounded-full">
                Pourquoi nous
              </span>
              <h2 className="section-title mt-4">Pourquoi Dango Import ?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {AVANTAGES.map((adv, i) => (
                <div
                  key={i}
                  className="card-dango p-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg mb-4 ${adv.color}`}>
                    {adv.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{adv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ TÉMOIGNAGES ═════════════════════════════ */}
        <section className="py-20 px-6 bg-white border-y border-gray-100">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <span className="text-xs font-black text-gray-700 uppercase tracking-widest bg-gray-100 px-3 py-1.5 rounded-full">Avis clients</span>
              <h2 className="text-3xl font-black text-gray-900 mt-4">Ce qu'ils disent de nous</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-gray-50 to-white border border-gray-100 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  <FaQuoteLeft className="text-[#ffdc2b] text-2xl mb-4" />
                  <p className="text-gray-600 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#ffdc2b] to-[#e6c600] flex items-center justify-center text-gray-900 font-black text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-[11px] text-gray-400 font-medium">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {Array(t.rating).fill(0).map((_, j) => (
                        <FaStar key={j} size={11} className="text-[#ffdc2b]" />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ NEWSLETTER ══════════════════════════════ */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 bg-[#ffdc2b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-[#ffdc2b] text-2xl" />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white mb-3">
              Ne manquez aucune opportunité
            </h3>
            <p className="text-gray-400 text-sm mb-8 leading-relaxed">
              Inscrivez-vous à notre newsletter pour recevoir nos nouveautés, offres exclusives et actualités e-commerce.
            </p>

            {newsletterDone ? (
              <div className="bg-green-500/20 border border-green-500/30 rounded-2xl px-6 py-4 flex items-center justify-center gap-3">
                <FaCheckCircle className="text-green-400 text-xl" />
                <p className="text-green-300 font-bold">Merci ! Vous êtes inscrit(e) 🎉</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
                <input
                  required
                  type="email"
                  placeholder="Votre adresse e-mail"
                  className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-gray-500 focus:outline-none focus:border-[#ffdc2b] focus:bg-white/15 text-sm transition-all"
                  value={newsletterEmail}
                  onChange={e => setNewsletterEmail(e.target.value)}
                />
                <button
                  disabled={newsletterLoading}
                  type="submit"
                  className="btn-home px-8 py-3.5 rounded-xl font-black text-sm disabled:opacity-50 whitespace-nowrap hover:scale-105 active:scale-95"
                >
                  {newsletterLoading ? "En cours..." : "S'inscrire"}
                </button>
              </form>
            )}
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Modal Sourcing ── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] bg-white rounded-2xl shadow-2xl relative max-h-[90vh] overflow-y-auto animate-scale-in">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-red-50 hover:text-red-500 text-gray-500 p-2.5 rounded-xl transition-all"
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
