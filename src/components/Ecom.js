import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaTimes, FaSpinner, FaSearch, FaShoppingCart,
  FaUserCircle, FaCheckCircle,
  FaChevronLeft
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';

const API_BASE = API_BASE_URL;

/* ── Component ───────────────────────────────────── */
const Ecom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  const isMaintenance = true; // Marketplace en maintenance

  if (isMaintenance) {
    return (
      <div className="bg-gray-950 min-h-screen font-sans flex flex-col">
        <Header />

        <main className="flex-1 flex items-center justify-center px-6 py-20 relative overflow-hidden">

          {/* Animated background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1.5s' }} />
            <div className="absolute inset-0 opacity-[0.03]" style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.15) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-8">

            {/* Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="w-28 h-28 bg-yellow-400/10 border-2 border-yellow-400/30 rounded-3xl flex items-center justify-center">
                  <FaSpinner className="text-yellow-400 text-5xl animate-spin" />
                </div>
                <span className="absolute -top-2 -right-2 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow-lg">
                  <FaSearch className="text-gray-900 text-xs" />
                </span>
              </div>
            </div>

            {/* Badge */}
            <div className="flex justify-center">
              <span className="inline-flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 text-yellow-300 px-5 py-2 rounded-full text-xs font-black uppercase tracking-[0.2em]">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-ping inline-block" />
                Maintenance en cours
              </span>
            </div>

            {/* Title */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Notre marketplace est<br />
                <span className="text-yellow-400">en cours de mise à jour</span>
              </h1>
              <p className="text-gray-400 text-base md:text-lg leading-relaxed max-w-lg mx-auto">
                Nous travaillons activement pour vous offrir une meilleure expérience d'achat.
                La marketplace sera de retour très prochainement.
              </p>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {[
                { icon: <FaShoppingCart className="text-yellow-400" />, label: "Catalogue produits", text: "Mise à jour en cours" },
                { icon: <FaStar className="text-yellow-400" />, label: "Système d'avis", text: "Améliorations prévues" },
                { icon: <FaCheckCircle className="text-yellow-400" />, label: "Paiement sécurisé", text: "Intégration finalisée" },
              ].map((item, i) => (
                <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
                  <div className="w-8 h-8 bg-yellow-400/10 rounded-lg flex items-center justify-center">
                    {item.icon}
                  </div>
                  <p className="text-white font-bold text-sm">{item.label}</p>
                  <p className="text-gray-500 text-xs">{item.text}</p>
                </div>
              ))}
            </div>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <a
                href="https://wa.me/2290159387180"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black px-8 py-4 rounded-2xl text-sm transition-all shadow-xl shadow-yellow-400/20 hover:scale-105 active:scale-95"
              >
                <FaUserCircle className="text-lg" />
                Commander via WhatsApp
              </a>
              <button
                onClick={() => navigate('/')}
                className="inline-flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-bold px-8 py-4 rounded-2xl text-sm transition-all hover:scale-105 active:scale-95"
              >
                <FaChevronLeft className="text-sm" />
                Retour à l'accueil
              </button>
            </div>

            {/* Contact note */}
            <p className="text-gray-600 text-xs">
              Pour toute urgence : <span className="text-yellow-500 font-bold">+229 01 59 38 71 80</span>
              {' '}·{' '}
              <a href="mailto:contact@dangoimport.com" className="text-yellow-500 font-bold hover:underline">contact@dangoimport.com</a>
            </p>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  // Marketplace normale (réactiver isMaintenance = false pour afficher)
  return null;
};

export default Ecom;
