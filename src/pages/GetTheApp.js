import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { FaMobileAlt, FaBell, FaSearch, FaShoppingCart, FaQrcode, FaStar, FaApple, FaCheckCircle, FaArrowRight } from 'react-icons/fa';

const FEATURES = [
  { icon: FaBell, color: 'bg-orange-500', title: 'Notifications en temps réel', desc: 'Alerte dès que votre commande est expédiée ou livrée.' },
  { icon: FaSearch, color: 'bg-blue-500', title: 'Recherche rapide', desc: 'Trouvez des produits en quelques secondes.' },
  { icon: FaShoppingCart, color: 'bg-green-500', title: 'Panier synchronisé', desc: 'Synchronisé sur tous vos appareils.' },
  { icon: FaQrcode, color: 'bg-purple-500', title: 'Scan de produits', desc: 'Scannez un produit pour le retrouver dans le catalogue.' },
  { icon: FaStar, color: 'bg-yellow-500', title: 'Favoris & Listes', desc: 'Sauvegardez vos produits préférés.' },
  { icon: FaMobileAlt, color: 'bg-pink-500', title: 'Interface optimisée', desc: 'Conçue spécialement pour les écrans mobiles.' },
];

const STEPS = [
  { num: '01', label: 'Téléchargez l\'app', desc: 'Disponible bientôt sur Google Play et App Store.' },
  { num: '02', label: 'Créez votre compte', desc: 'Inscription rapide avec email ou numéro de téléphone.' },
  { num: '03', label: 'Explorez le catalogue', desc: 'Des milliers de produits disponibles immédiatement.' },
  { num: '04', label: 'Commandez & Suivez', desc: 'Passez vos commandes et suivez-les en direct.' },
];

export default function GetTheApp() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115]">
      <Header />

      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-[#111] via-[#1a1a2e] to-[#111] text-white py-16 lg:py-24 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#ffdc2b] rounded-full blur-[120px] translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#ffdc2b]/20 text-[#ffdc2b] text-[11px] font-black px-3 py-1.5 rounded-full mb-5 uppercase tracking-wider">
                  <FaMobileAlt size={10} /> Application Mobile
                </span>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-5">
                  Dango Import<br />
                  <span className="text-[#ffdc2b]">dans votre poche</span>
                </h1>
                <p className="text-gray-300 text-[16px] mb-8 leading-relaxed max-w-lg">
                  Accédez à tout le catalogue, suivez vos commandes et profitez des meilleures offres — où que vous soyez, à tout moment.
                </p>

                <div className="flex flex-wrap gap-4 mb-8">
                  <button className="flex items-center gap-3 bg-white text-gray-900 font-black px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <FaApple size={24} />
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-gray-500 leading-none">Bientôt sur</p>
                      <p className="text-[15px] font-black leading-tight">App Store</p>
                    </div>
                  </button>
                  <button className="flex items-center gap-3 bg-white text-gray-900 font-black px-6 py-3.5 rounded-xl hover:bg-gray-100 transition-all hover:-translate-y-0.5 hover:shadow-lg">
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                      <path d="M3 20.5v-17c0-.83 1.01-1.3 1.68-.77l14 8.5c.6.37.6 1.17 0 1.54l-14 8.5c-.67.52-1.68.06-1.68-.77z" fill="#4CAF50"/>
                    </svg>
                    <div className="text-left">
                      <p className="text-[10px] font-medium text-gray-500 leading-none">Bientôt sur</p>
                      <p className="text-[15px] font-black leading-tight">Google Play</p>
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-2 text-[#ffdc2b]">
                  <FaCheckCircle size={14} />
                  <span className="text-[13px] font-medium text-gray-300">Application en cours de développement — restez à l'écoute !</span>
                </div>
              </div>

              {/* Mock Phone */}
              <div className="hidden lg:flex items-center justify-center">
                <div className="relative w-56 h-[460px] bg-[#1a1a1a] rounded-[40px] border-4 border-gray-700 shadow-2xl flex flex-col overflow-hidden">
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#111] rounded-full z-10" />
                  <div className="flex-1 bg-gradient-to-b from-[#ffdc2b] to-[#e6c600] flex items-center justify-center">
                    <div className="text-center">
                      <FaMobileAlt size={50} className="text-[#111] mx-auto mb-3" />
                      <p className="text-[#111] font-black text-[18px]">DANGO</p>
                      <p className="text-[#555] font-bold text-[11px] tracking-widest">IMPORT</p>
                    </div>
                  </div>
                  <div className="bg-[#111] py-4 flex items-center justify-center">
                    <div className="w-10 h-10 bg-gray-800 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-4 bg-white dark:bg-[#1a1d24]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">Fonctionnalités</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Tout ce qu'il vous faut</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="bg-[#f9f9f9] dark:bg-[#1e2130] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-lg transition-shadow flex gap-4">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-gray-900 dark:text-white text-[15px] mb-1">{title}</h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="py-16 px-4 bg-[#f5f5f5] dark:bg-[#0f1115]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">Démarrage</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Comment commencer ?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map(({ num, label, desc }) => (
                <div key={num} className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="w-14 h-14 bg-[#ffdc2b] text-[#111] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-[18px] shadow-lg">
                    {num}
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white mb-2 text-[15px]">{label}</h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-14 bg-[#ffdc2b]">
          <div className="max-w-xl mx-auto text-center px-4">
            <h2 className="text-2xl md:text-3xl font-black text-[#111] mb-3">En attendant l'application…</h2>
            <p className="text-[#444] text-[14px] mb-8">Accédez à tout notre catalogue dès maintenant depuis votre navigateur mobile.</p>
            <button
              onClick={() => navigate('/shopping')}
              className="inline-flex items-center gap-2 bg-[#111] text-white font-black px-8 py-4 rounded-full hover:bg-[#333] transition-all"
            >
              Explorer le marketplace <FaArrowRight size={13} />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
