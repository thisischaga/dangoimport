import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  FaBoxOpen, FaShoppingCart, FaHeart, FaTruck, FaUndo,
  FaHeadset, FaChevronDown, FaChevronUp, FaCheckCircle, FaArrowRight
} from 'react-icons/fa';

const GUIDES = [
  {
    icon: FaShoppingCart, color: 'bg-orange-500',
    title: 'Comment passer une commande',
    steps: [
      'Recherchez votre produit dans la barre de recherche ou parcourez les catégories.',
      'Cliquez sur le produit pour voir les détails, photos, et prix.',
      'Cliquez "Ajouter au panier" puis rendez-vous sur la page Panier.',
      'Confirmez votre adresse de livraison et procédez au paiement.',
      'Vous recevez une confirmation par email avec un numéro de suivi.',
    ],
  },
  {
    icon: FaHeart, color: 'bg-rose-500',
    title: 'Gérer mes favoris',
    steps: [
      'Cliquez sur le ❤️ sur une carte produit pour l\'ajouter à vos favoris.',
      'Retrouvez vos favoris dans votre espace "Mes commandes".',
      'Comparez les produits favoris avant d\'acheter.',
    ],
  },
  {
    icon: FaTruck, color: 'bg-blue-500',
    title: 'Suivre ma livraison',
    steps: [
      'Rendez-vous dans "Mes commandes" depuis votre profil.',
      'Cliquez sur la commande concernée pour voir l\'état d\'avancement.',
      'Vous recevrez aussi une notification par email à chaque étape clé.',
    ],
  },
  {
    icon: FaUndo, color: 'bg-purple-500',
    title: 'Retours & Remboursements',
    steps: [
      'En cas de produit défectueux ou non-conforme, contactez le support dans les 48h.',
      'Prenez des photos du produit et joignez-les à votre demande.',
      'Notre équipe traite votre dossier sous 3-5 jours ouvrés.',
      'Le remboursement est effectué via le même moyen de paiement utilisé.',
    ],
  },
];

const FAQS = [
  { q: 'Comment créer un compte ?', a: 'Cliquez sur "Connexion" dans le menu, puis sur "Créer un compte". Remplissez votre nom, email et mot de passe. Un email de confirmation vous sera envoyé.' },
  { q: 'Quels sont les délais de livraison ?', a: 'Pour les produits en stock au Bénin/Togo : 1-3 jours. Pour les produits importés de Chine : 7-21 jours selon le mode d\'expédition.' },
  { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Nous acceptons Mobile Money (MTN, Moov), les virements bancaires et les paiements en espèces à Cotonou et Lomé.' },
  { q: 'Est-ce que je peux annuler ma commande ?', a: 'Oui, vous pouvez annuler dans les 2h suivant la commande si elle n\'est pas encore expédiée. Contactez le support immédiatement.' },
  { q: 'Comment contacter un vendeur ?', a: 'Allez sur la page du produit, cliquez sur le nom du vendeur pour accéder à son profil. Vous trouverez ses coordonnées de contact.' },
];

export default function BuyerCentral() {
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115]">
      <Header />
      <main>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#111] via-[#1a1a2e] to-[#111] text-white py-16 px-4 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-10">
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#ffdc2b] rounded-full blur-[100px] translate-x-1/4 translate-y-1/4" />
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-[#ffdc2b]/20 border-2 border-[#ffdc2b]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBoxOpen size={30} className="text-[#ffdc2b]" />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black mb-4">Espace <span className="text-[#ffdc2b]">Acheteurs</span></h1>
            <p className="text-gray-300 text-lg max-w-xl mx-auto mb-8">
              Tout ce dont vous avez besoin pour acheter facilement, suivre vos commandes et résoudre vos problèmes.
            </p>
            <button
              onClick={() => navigate('/shopping')}
              className="inline-flex items-center gap-2 bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black px-8 py-4 rounded-full transition-all text-[15px] hover:-translate-y-0.5"
            >
              Commencer mes achats <FaArrowRight size={13} />
            </button>
          </div>
        </section>

        {/* Guides */}
        <section className="py-16 px-4 bg-white dark:bg-[#1a1d24]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-10">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">Guides</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Comment acheter sur Dango Import ?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {GUIDES.map(({ icon: Icon, color, title, steps }) => (
                <div key={title} className="bg-[#f9f9f9] dark:bg-[#1e2130] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-11 h-11 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-sm`}>
                    <Icon size={20} />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white mb-4 text-[16px]">{title}</h3>
                  <ol className="space-y-3">
                    {steps.map((step, i) => (
                      <li key={i} className="flex gap-3 text-[13px] text-gray-600 dark:text-gray-300">
                        <span className="w-6 h-6 rounded-full bg-[#ffdc2b] text-[#111] font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4 bg-[#f5f5f5] dark:bg-[#0f1115]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">FAQ</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Questions fréquentes</h2>
            </div>
            <div className="space-y-3">
              {FAQS.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-4 text-left font-bold text-gray-900 dark:text-white text-[14px]"
                  >
                    {faq.q}
                    {openFaq === i
                      ? <FaChevronUp size={12} className="shrink-0 text-[#ffdc2b]" />
                      : <FaChevronDown size={12} className="shrink-0 text-gray-400" />
                    }
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-5 text-[13px] text-gray-600 dark:text-gray-300 border-t border-gray-100 dark:border-gray-800 pt-4 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Contact */}
            <div className="mt-10 bg-[#ffdc2b] rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-5">
              <div className="w-14 h-14 bg-[#111]/10 rounded-full flex items-center justify-center shrink-0">
                <FaHeadset size={26} className="text-[#111]" />
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="font-black text-[#111] text-[16px]">Vous n'avez pas trouvé la réponse ?</p>
                <p className="text-[13px] text-[#444] mt-0.5">Notre support est disponible 7j/7 pour vous aider.</p>
              </div>
              <a
                href="mailto:contact@dangoimport.com"
                className="shrink-0 bg-[#111] text-white font-black px-6 py-3 rounded-full text-[13px] hover:bg-[#333] transition-colors whitespace-nowrap"
              >
                Contacter le support
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
