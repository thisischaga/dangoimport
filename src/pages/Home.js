import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { toast } from "react-toastify";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

import heroImg from "../images/premium_cover_dango.png";
import chinaAfrica from "../images/slide_china_africa.png";
import watch from "../images/poedagar_premium.png";
import shoe from "../images/sneakers_premium.png";
import beauty from "../images/beauty_premium.png";
import gshock from "../images/gshock_premium.png";
import secImage from "../images/service_security.png";
import srcImage from "../images/service_sourcing.png";
import logImage from "../images/service_logistics.png";

import {
  FaArrowRight, FaTimes, FaShieldAlt, FaStar,
  FaShippingFast, FaHeadset, FaCheckCircle,
  FaTruck, FaLock, FaBoxOpen, FaQuoteLeft,
  FaEnvelope, FaPhone, FaWhatsapp,
  FaSearch, FaClipboardCheck, FaHandshake
} from "react-icons/fa";

const TESTIMONIALS = [
  { name: "Kofi Mensah",    role: "Grossiste — Cotonou",     rating: 5, text: "Dango Import m'a permis de réduire mes coûts de 35% en traitant directement avec les usines chinoises. Livraison parfaite en 3 semaines." },
  { name: "Aïssa Traoré",   role: "Revendeuse — Lomé",       rating: 5, text: "Service impeccable. J'ai commandé des montres et des accessoires, tout est arrivé conforme à mes attentes. Je recommande sans hésiter." },
  { name: "Ibrahim Diallo",  role: "Entrepreneur — Dakar",    rating: 5, text: "Le service de sourcing est exceptionnel. L'équipe m'a trouvé un fournisseur en 48h et a géré toute la logistique. Excellent." },
  { name: "Fatou Sow",       role: "Commerçante — Abidjan",   rating: 5, text: "J'apprécie la transparence sur les prix et les délais. Aucune mauvaise surprise. Je passe ma 5ème commande cette année." },
];

const HOW_IT_WORKS = [
  { step: "01", icon: <FaSearch size={22} />, title: "Vous choisissez", desc: "Parcourez notre catalogue ou envoyez une image / un lien du produit que vous souhaitez importer." },
  { step: "02", icon: <FaClipboardCheck size={22} />, title: "Nous sourceons", desc: "Nos agents à Guangzhou contactent les usines, négocient les prix et inspectent la qualité." },
  { step: "03", icon: <FaShippingFast size={22} />, title: "On expédie", desc: "La marchandise est emballée et expédiée par voie maritime ou aérienne selon vos besoins." },
  { step: "04", icon: <FaHandshake size={22} />, title: "Vous recevez", desc: "La livraison est effectuée à votre porte ou en point relais. Paiement libéré à la réception." },
];

const STATS = [
  { value: "500+", label: "Produits importés" },
  { value: "2 000+", label: "Clients satisfaits" },
  { value: "98%", label: "Taux de satisfaction" },
  { value: "5 ans", label: "D'expérience" },
];

const FEATURED = [
  { id: 1, name: "Montre Poedagar Luxe",   price: "17 000", badge: "Bestseller", img: watch,   rating: 4.8, reviews: 128 },
  { id: 2, name: "Sneakers Urban Elite",   price: "12 000", badge: "Nouveau",    img: shoe,    rating: 4.6, reviews: 87  },
  { id: 3, name: "Sérum Beauté Premium",   price: "1 500",  badge: "Promo",      img: beauty,  rating: 4.9, reviews: 214 },
  { id: 4, name: "G-Shock Original",       price: "13 000", badge: "Populaire",  img: gshock,  rating: 4.7, reviews: 176 },
];

const BADGE_COLOR = {
  Bestseller: "bg-yellow-400 text-gray-900",
  Nouveau:    "bg-emerald-500 text-white",
  Promo:      "bg-red-500 text-white",
  Populaire:  "bg-blue-500 text-white",
};

const StarRating = ({ rating }) => (
  <div className="flex items-center gap-1">
    {[1,2,3,4,5].map(i => (
      <FaStar
        key={i}
        size={11}
        className={i <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}
      />
    ))}
    <span className="text-[11px] text-gray-500 ml-1 font-medium">{rating}</span>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { clearCart } = useCart();
  const [showForm, setShowForm] = useState(false);
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);

  const handleNewsletter = async (e) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setNewsletterLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: newsletterEmail });
      toast.success("Merci ! Vous êtes bien inscrit à notre newsletter.");
      setNewsletterEmail("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const invoiceToken = params.get('token');
    const paymentType = params.get('type');

    if (!invoiceToken) return;

    if (paymentType === 'devis') {
      toast.success('Paiement du devis reçu. Merci.');
    } else {
      clearCart();
      toast.success('Paiement réussi : votre panier a bien été vidé.');
    }

    window.history.replaceState({}, document.title, location.pathname);
  }, [location.search, clearCart, location.pathname]);

  return (
    <div className="bg-white min-h-screen text-gray-900 font-sans flex flex-col overflow-x-hidden">
      <Header />

      <main className="flex-1 w-full">

        {/* ═══════════════════════════════════════
            HERO
        ════════════════════════════════════════ */}
        <section
          className="relative min-h-[88vh] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          {/* Gradient overlay — top dark, bottom fade */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/80" />

          <div className="relative z-10 text-center w-full max-w-5xl px-6 py-16 flex flex-col items-center">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-[0.25em] mb-6 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
              Plateforme B2B Premium — Bénin & Afrique
            </div>

            <h1 className="mb-6 text-4xl md:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight">
              L'excellence de la Chine,<br />
              <span className="text-yellow-400">directement chez vous.</span>
            </h1>

            <p className="mb-10 max-w-2xl text-base md:text-lg text-gray-300 leading-relaxed">
              Sourcez, commandez et recevez vos produits en toute sécurité.
              Nos agents à Guangzhou traitent avec les usines pour vous.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/shopping")}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-full font-black shadow-2xl shadow-yellow-400/30 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center gap-2 text-sm uppercase tracking-widest"
              >
                Explorer la boutique <FaArrowRight />
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 border border-white/25 rounded-full font-bold transition-all text-sm uppercase tracking-widest hover:-translate-y-0.5"
              >
                Demande de sourcing
              </button>
            </div>

            {/* Trust badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><FaLock className="text-yellow-400" /> Paiement sécurisé</span>
              <span className="flex items-center gap-1.5"><FaTruck className="text-yellow-400" /> Livraison rapide</span>
              <span className="flex items-center gap-1.5"><FaHeadset className="text-yellow-400" /> Support 24/7</span>
            </div>
          </div>
        </section>


        {/* ═══════════════════════════════════════
            SERVICES
        ════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <div className="text-center mb-14">
              <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-xs block mb-3">Ce que nous faisons</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Pourquoi choisir Dango Import ?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                { img: secImage, icon: <FaShieldAlt />, title: "Sécurité absolue",    desc: "Vos fonds sont protégés jusqu'à la livraison complète de la marchandise." },
                { img: srcImage, icon: <FaBoxOpen />,   title: "Sourcing usine",      desc: "Nos agents traitent directement avec les usines pour les meilleurs prix." },
                { img: logImage, icon: <FaShippingFast />, title: "Logistique incluse", desc: "Dédouanement et expédition maritime ou aérienne gérés par nos soins." },
              ].map((s, i) => (
                <article
                  key={i}
                  className="bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.07)] border border-gray-100 hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 group flex flex-col"
                >
                  <div className="h-52 overflow-hidden">
                    <img src={s.img} alt={s.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="p-7 flex flex-col gap-3 flex-1">
                    <div className="w-10 h-10 rounded-2xl bg-yellow-50 flex items-center justify-center text-yellow-500 text-lg">
                      {s.icon}
                    </div>
                    <h3 className="text-lg font-black text-gray-900">{s.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            FEATURED PRODUCTS
        ════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-xs block mb-2">La sélection premium</span>
                <h2 className="text-3xl md:text-4xl font-black text-gray-900">Nos produits les plus demandés</h2>
              </div>
              <button
                onClick={() => navigate("/shopping")}
                className="flex items-center gap-2 text-sm font-black text-gray-900 border-b-2 border-yellow-400 pb-0.5 hover:text-yellow-600 transition-colors"
              >
                Voir tout <FaArrowRight className="text-xs" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURED.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigate("/shopping")}
                  className="bg-white rounded-3xl overflow-hidden text-left shadow-[0_4px_20px_rgba(0,0,0,0.06)] hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col group border border-gray-100 cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative bg-gray-50 h-56 flex items-center justify-center p-6">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="max-w-[80%] max-h-[80%] object-contain group-hover:scale-110 transition-transform duration-300"
                    />
                    {/* Badge */}
                    <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${BADGE_COLOR[p.badge] ?? 'bg-gray-200 text-gray-700'}`}>
                      {p.badge}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-5 flex flex-col gap-2 flex-1">
                    <h3 className="text-sm font-black text-gray-900 leading-tight line-clamp-2">{p.name}</h3>
                    <StarRating rating={p.rating} />
                    <div className="text-[11px] text-gray-400 font-medium">{p.reviews} avis</div>
                    <div className="mt-auto pt-2 flex items-baseline gap-1">
                      <span className="text-xl font-black text-gray-900">{p.price}</span>
                      <span className="text-xs text-gray-400 font-bold">FCFA</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            SOURCING CTA
        ════════════════════════════════════════ */}
        <section
          className="relative min-h-[420px] flex items-center justify-center py-20 px-6 bg-cover bg-center"
          style={{ backgroundImage: `url(${chinaAfrica})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 to-slate-900/60" />
          <div className="relative z-10 w-full max-w-3xl text-center text-white">
            <span className="text-yellow-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 block">Service clé en main</span>
            <h2 className="text-3xl md:text-5xl font-black mb-5 leading-tight">
              Vous avez un produit en tête ?
            </h2>
            <p className="text-gray-300 leading-relaxed mb-10 text-base md:text-lg max-w-2xl mx-auto">
              Nos agents à Guangzhou trouvent l'usine, inspectent la marchandise et l'expédient pour vous.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => setShowForm(true)}
                className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-9 py-4 rounded-full font-black transition-all shadow-2xl shadow-yellow-400/20 hover:-translate-y-0.5 active:scale-95 text-sm uppercase tracking-widest"
              >
                Démarrer une demande
              </button>
              <button
                onClick={() => navigate("/services")}
                className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-8 py-4 border border-white/25 rounded-full font-bold transition-all text-sm uppercase tracking-widest"
              >
                En savoir plus
              </button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            WHY US STRIP
        ════════════════════════════════════════ */}
        <section className="py-10 border-t border-b border-gray-100 bg-white">
          <div className="max-w-5xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { icon: <FaShieldAlt className="text-yellow-500 text-2xl mx-auto mb-2" />, title: "Paiement 100% sécurisé", desc: "Vos fonds libérés uniquement à la livraison" },
              { icon: <FaShippingFast className="text-yellow-500 text-2xl mx-auto mb-2" />, title: "Livraison rapide", desc: "Délai optimisé maritime & aérien" },
              { icon: <FaHeadset className="text-yellow-500 text-2xl mx-auto mb-2" />, title: "Support dédié 24/7", desc: "Une équipe disponible pour chaque étape" },
            ].map((item, i) => (
              <div key={i} className="px-4 py-2">
                {item.icon}
                <p className="font-black text-gray-900 text-sm">{item.title}</p>
                <p className="text-gray-400 text-xs mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ═══════════════════════════════════════
            HOW IT WORKS
        ════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-xs block mb-3">Simple & transparent</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Comment ça marche ?</h2>
              <p className="text-gray-400 mt-3 text-sm max-w-xl mx-auto">De votre idée à la livraison, en 4 étapes simples.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {/* Connecting line (desktop) */}
              <div className="hidden lg:block absolute top-10 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-yellow-200 via-yellow-400 to-yellow-200 z-0" />

              {HOW_IT_WORKS.map((s, i) => (
                <div key={i} className="relative z-10 flex flex-col items-center text-center gap-4 group">
                  {/* Icon circle */}
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-500 flex items-center justify-center text-gray-900 shadow-xl shadow-yellow-400/25 group-hover:scale-110 transition-transform duration-300">
                    {s.icon}
                  </div>
                  <span className="text-[10px] font-black text-yellow-500 tracking-[0.2em] uppercase">{s.step}</span>
                  <h3 className="font-black text-gray-900 text-base leading-tight">{s.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            TESTIMONIALS
        ════════════════════════════════════════ */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <span className="text-yellow-500 font-bold uppercase tracking-[0.3em] text-xs block mb-3">Ils nous font confiance</span>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900">Ce que disent nos clients</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {TESTIMONIALS.map((t, i) => (
                <div
                  key={i}
                  className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col gap-5"
                >
                  {/* Quote icon */}
                  <FaQuoteLeft className="text-yellow-400 text-2xl" />

                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <FaStar key={j} size={13} className="text-yellow-400" />
                    ))}
                  </div>

                  {/* Text */}
                  <p className="text-gray-600 text-sm leading-relaxed italic flex-1">"{t.text}"</p>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-gray-900 font-black text-base shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="font-black text-gray-900 text-sm leading-none">{t.name}</p>
                      <p className="text-gray-400 text-xs mt-1">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════
            CONTACT / NEWSLETTER CTA
        ════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            {/* Left */}
            <div className="lg:max-w-xl">
              <span className="text-yellow-400 font-bold uppercase tracking-[0.3em] text-xs block mb-3">Restez informé</span>
              <h2 className="text-3xl font-black text-white mb-4">Recevez nos meilleures offres</h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                Inscrivez-vous à notre newsletter pour recevoir en avant-première nos nouvelles arrivées, promotions exclusives et conseils d'importation.
              </p>

              {/* Contact info */}
              <div className="mt-8 flex flex-col gap-3">
                <a href="tel:+2290159387180" className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <FaPhone size={13} className="text-yellow-400" />
                  </div>
                  +229 0159387180
                </a>
                <a href="mailto:contact@dangoimport.com" className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-colors text-sm">
                  <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                    <FaEnvelope size={13} className="text-yellow-400" />
                  </div>
                  contact@dangoimport.com
                </a>
              </div>
            </div>

            {/* Right — Subscribe form */}
            <form
              onSubmit={handleNewsletter}
              className="w-full lg:max-w-md flex flex-col gap-4"
            >
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  required
                  type="email"
                  placeholder="Votre adresse e-mail"
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 focus:border-yellow-400/40 transition-all text-sm"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                />
              </div>
              <button
                disabled={newsletterLoading}
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-yellow-400/20 active:scale-95 disabled:opacity-50"
              >
                {newsletterLoading ? "INSCRIPTION..." : "S'inscrire gratuitement"}
              </button>
              <p className="text-gray-500 text-[11px] text-center">Aucun spam. Désabonnement en un clic.</p>
            </form>
          </div>
        </section>

      </main>

      <Footer />


      {/* ── Sourcing Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="w-full max-w-[720px] bg-white rounded-3xl overflow-hidden shadow-[0_32px_120px_rgba(15,23,42,0.2)] relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 p-2 rounded-full z-50 transition-colors"
            >
              <FaTimes size={18} />
            </button>
            <div className="p-8 md:p-10">
              <DevisForm showForm={setShowForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
