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
import parfum1 from "../images/WhatsApp Image 2026-05-11 at 21.49.32 (3).jpeg";
import parfum2 from "../images/WhatsApp Image 2026-05-11 at 21.49.33 (2).jpeg";
import parfum3 from "../images/WhatsApp Image 2026-05-11 at 21.49.34.jpeg";

import {
  FaArrowRight, FaTimes, FaShieldAlt, FaShippingFast,
  FaLock, FaStore, FaHandshake, FaGlobe, FaPercent, FaStar,
  FaCheckCircle, FaTruck, FaBoxOpen, FaUsers, FaSmile, FaGlobeAfrica, FaEnvelope
} from "react-icons/fa";

const FEATURED = [
  { id: 1, name: "Genie's Secret Bombshell", price: "3 000", img: parfum1, tag: "Parfum" },
  { id: 2, name: "Kaly (Vanilla & Marshmallow)", price: "4 500", img: parfum2, tag: "Parfum" },
  { id: 3, name: "Mayar Eau de Parfum", price: "2 500", img: parfum3, tag: "Parfum" },
];

const STATS = [
  { value: "1 000+", label: "Produits", icon: <FaBoxOpen className="text-yellow-500" /> },
  { value: "5 000+", label: "Clients", icon: <FaUsers className="text-yellow-500" /> },
  { value: "98%", label: "Satisfaction", icon: <FaSmile className="text-yellow-500" /> },
  { value: "2", label: "Pays", icon: <FaGlobeAfrica className="text-yellow-500" /> },
];

const AVANTAGES = [
  { icon: <FaPercent />, title: "Commissions avantageuses", desc: "Parmi les plus basses du marché pour maximiser vos bénéfices.", color: "bg-blue-50 text-blue-600" },
  { icon: <FaShippingFast />, title: "Livraison rapide", desc: "Même jour à Cotonou · 24h partout au Bénin & Togo.", color: "bg-green-50 text-green-600" },
  { icon: <FaLock />, title: "Paiement sécurisé", desc: "Mobile Money (MTN, Moov) ou Cash on Delivery.", color: "bg-yellow-50 text-yellow-600" },
  { icon: <FaStar />, title: "Visibilité locale", desc: "Vos produits mis en avant auprès de milliers d'acheteurs.", color: "bg-purple-50 text-purple-600" },
  { icon: <FaHandshake />, title: "Accompagnement humain", desc: "Une équipe basée au Bénin, disponible pour vous.", color: "bg-orange-50 text-orange-600" },
];

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

        {/* ═══════════════════════════════════════════════════════
            HERO
        ═══════════════════════════════════════════════════════ */}
        <section
          className="relative min-h-[75vh] flex items-center justify-center bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImg})` }}
        >
          {/* Overlays */}
          <div className="absolute inset-0 bg-gray-900/80" />

          <div className="relative z-10 text-center w-full max-w-5xl px-6 py-20 flex flex-col items-center">
            {/* Heading */}
            <h1 className="mb-4 leading-tight tracking-tight">
              <span className="block text-4xl md:text-6xl font-black text-white">Dango Import</span>
              <span className="block text-xl md:text-3xl font-bold text-yellow-400 mt-2">
                La Marketplace Locale du Bénin &amp; Togo
              </span>
            </h1>

            {/* Sub-text */}
            <p className="mb-10 max-w-2xl text-base md:text-lg text-gray-200 leading-relaxed">
              Achetez des produits de qualité auprès de vendeurs locaux et développez votre business sur une plateforme fiable.
            </p>

            {/* CTA buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => navigate("/shopping")}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-950 px-8 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 shadow-sm"
              >
                <FaStore /> Découvrir les produits
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3.5 rounded-lg font-bold text-sm uppercase tracking-wide transition-colors flex items-center gap-2 shadow-sm"
              >
                <FaGlobe /> Sourcing depuis la Chine
              </button>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 text-xs text-gray-300 font-medium">
              {[
                { icon: <FaLock className="text-yellow-400" />, text: "Paiement sécurisé" },
                { icon: <FaTruck className="text-yellow-400" />, text: "Livraison 24h" },
                { icon: <FaShieldAlt className="text-yellow-400" />, text: "Vendeurs vérifiés" },
              ].map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">{b.icon}{b.text}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 1 — QUI SOMMES-NOUS ?
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Text column */}
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-6">
                À propos de Dango Import
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-base">
                <p>
                  <strong>Dango Import</strong> est un produit exclusif de la société <strong>Dango Hub</strong>.
                </p>
                <p>
                  Nous sommes la marketplace 100% locale dédiée au Bénin et au Togo. Notre mission est de simplifier le commerce en connectant directement acheteurs et vendeurs sur une plateforme sécurisée, rapide et adaptée aux réalités ouest-africaines.
                </p>
              </div>

              <button
                onClick={() => navigate("/shopping")}
                className="mt-8 text-blue-600 hover:text-blue-800 font-bold text-sm inline-flex items-center gap-2 hover:underline"
              >
                Explorer la plateforme <FaArrowRight />
              </button>
            </div>

            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-4">
              {STATS.map((s, i) => (
                <div key={i} className="bg-gray-50 border border-gray-100 rounded-xl p-6 flex flex-col items-center text-center">
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <p className="text-2xl font-black text-gray-900 mb-1">{s.value}</p>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 2 — NOS SERVICES (Style Corporate/Pro)
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-3xl font-black text-gray-900">Nos Services</h2>
              <p className="text-gray-500 mt-2 text-sm">Des solutions e-commerce complètes pour particuliers et professionnels.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Service 1 — Marketplace */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-2xl">
                    <FaStore />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Marketplace Locale</h3>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Achat & Vente</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Achetez ou vendez une large gamme de produits (Mode, Beauté, Électronique, Maison) avec des vendeurs locaux vérifiés.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Des milliers de produits disponibles",
                    "Commandes sécurisées",
                    "Livraison rapide (24h/48h)",
                    "Cash on Delivery & Mobile Money",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => navigate("/shopping")}
                  className="w-full sm:w-auto bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
                >
                  Accéder à la boutique
                </button>
              </div>

              {/* Service 2 — Sourcing Chine */}
              <div className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-yellow-50 text-yellow-600 rounded-lg flex items-center justify-center text-2xl">
                    <FaShippingFast />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Importation Chine</h3>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Sourcing B2B</span>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-6">
                  Renouvelez votre stock facilement. Nos agents gèrent l'intégralité du processus, de l'usine en Chine jusqu'à vos locaux au Bénin.
                </p>

                <ul className="space-y-3 mb-8">
                  {[
                    "Recherche de fournisseurs fiables",
                    "Négociation des prix d'achat",
                    "Dédouanement pris en charge",
                    "Logistique complète jusqu'à livraison",
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-gray-700">
                      <FaCheckCircle className="text-green-500 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowForm(true)}
                  className="w-full sm:w-auto bg-white border border-gray-300 hover:bg-gray-50 text-gray-900 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors"
                >
                  Demander un devis
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 3 — PRODUITS VEDETTES
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-white border-y border-gray-200">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-10">
              <h2 className="text-2xl font-black text-gray-900">Produits Vedettes</h2>
              <button
                onClick={() => navigate("/shopping")}
                className="text-blue-600 hover:text-blue-800 text-sm font-bold flex items-center gap-1 hover:underline"
              >
                Voir tout le catalogue <FaArrowRight />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURED.map((p, i) => (
                <div
                  key={p.id}
                  onClick={() => navigate("/shopping")}
                  className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow cursor-pointer flex flex-col group"
                >
                  <div className="bg-gray-50 h-56 flex items-center justify-center p-6">
                    <img
                      src={p.img}
                      alt={p.name}
                      className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                    />
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 mb-4 line-clamp-2">{p.name}</h3>
                    <div className="mt-auto">
                      <span className="text-lg font-black text-gray-900">{p.price} <span className="text-xs font-bold">FCFA</span></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 4 — AVANTAGES
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-[#f8f9fa]">
          <div className="max-w-6xl mx-auto">
            <div className="mb-12">
              <h2 className="text-2xl font-black text-gray-900">Pourquoi Dango Import ?</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {AVANTAGES.map((adv, i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-colors">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl mb-4 ${adv.color}`}>
                    {adv.icon}
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{adv.title}</h3>
                  <p className="text-gray-600 text-sm">{adv.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 5 — CTA VENDEUR
        ═══════════════════════════════════════════════════════ */}
        <section className="py-16 px-6 bg-white border-t border-gray-200">
          <div className="max-w-4xl mx-auto bg-blue-50 border border-blue-100 rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">Vous êtes vendeur ou commerçant ?</h2>
            <p className="text-gray-600 text-sm md:text-base max-w-2xl mx-auto mb-8">
              Rejoignez notre réseau de vendeurs. Bénéficiez de commissions très avantageuses, d'une large visibilité locale et développez votre chiffre d'affaires rapidement.
            </p>
            <button
              onClick={() => navigate("/devenir-vendeur")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-sm transition-colors shadow-sm"
            >
              Créer mon compte Vendeur
            </button>
          </div>
        </section>

        {/* ═══════════════════════════════════════════════════════
            SECTION 6 — NEWSLETTER (Contact removed as requested)
        ═══════════════════════════════════════════════════════ */}
        <section className="py-20 px-6 bg-gray-900">
          <div className="max-w-2xl mx-auto text-center">
            <FaEnvelope className="text-yellow-400 text-3xl mx-auto mb-4" />
            <h3 className="text-2xl font-black text-white mb-3">
              Ne manquez aucune opportunité
            </h3>
            <p className="text-gray-400 text-sm mb-8">
              Inscrivez-vous à notre newsletter pour recevoir nos nouveautés, offres exclusives et actualités e-commerce.
            </p>

            <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="email"
                placeholder="Votre adresse e-mail"
                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-yellow-400 text-sm"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button
                disabled={newsletterLoading}
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded-lg font-bold text-sm transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {newsletterLoading ? "En cours..." : "S'inscrire"}
              </button>
            </form>
          </div>
        </section>

      </main>

      <Footer />

      {/* ── Modal Sourcing ── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-[720px] bg-white rounded-xl shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-full transition-colors"
            >
              <FaTimes size={16} />
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
