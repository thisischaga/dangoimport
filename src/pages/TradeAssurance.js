import React from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import {
  FaShieldAlt, FaCheckCircle, FaHandshake, FaTruck,
  FaUndo, FaLock, FaHeadset, FaArrowRight
} from 'react-icons/fa';

const PROTECTIONS = [
  {
    icon: FaShieldAlt, color: 'bg-blue-500',
    title: 'Protection des paiements',
    desc: 'Votre argent est sécurisé en escrow jusqu\'à la confirmation de livraison. Le vendeur ne touche rien avant que vous ayez confirmé.',
  },
  {
    icon: FaHandshake, color: 'bg-indigo-500',
    title: 'Fournisseurs vérifiés',
    desc: 'Tous les vendeurs sur Dango Import sont contrôlés et validés par notre équipe. Zéro escroquerie tolérée.',
  },
  {
    icon: FaTruck, color: 'bg-green-500',
    title: 'Suivi de livraison',
    desc: 'Suivez votre commande en temps réel, de l\'entrepôt jusqu\'à votre porte au Bénin ou au Togo.',
  },
  {
    icon: FaUndo, color: 'bg-purple-500',
    title: 'Politique de retour',
    desc: 'Vous avez reçu un produit endommagé ou non conforme ? Nous prenons en charge le remboursement ou le renvoi.',
  },
  {
    icon: FaLock, color: 'bg-rose-500',
    title: 'Données sécurisées',
    desc: 'Vos informations personnelles et bancaires sont protégées avec un chiffrement de niveau bancaire.',
  },
  {
    icon: FaHeadset, color: 'bg-teal-500',
    title: 'Support dédié',
    desc: 'Notre équipe est disponible 7j/7 pour résoudre tout litige entre acheteurs et vendeurs.',
  },
];

const STEPS = [
  { num: '01', title: 'Passez votre commande', desc: 'Trouvez le produit, ajoutez au panier et confirmez votre achat en toute sécurité.' },
  { num: '02', title: 'Paiement sécurisé', desc: 'Votre paiement est mis en escrow — le vendeur ne reçoit rien avant votre confirmation.' },
  { num: '03', title: 'Livraison & Réception', desc: 'Recevez votre commande et vérifiez qu\'elle est conforme à la description.' },
  { num: '04', title: 'Paiement libéré', desc: 'Une fois satisfait, le paiement est libéré au vendeur. Simple et transparent.' },
];

const STATS = [
  { val: '5 000+', label: 'Acheteurs protégés' },
  { val: '100%', label: 'Paiements sécurisés' },
  { val: '48h', label: 'Délai de résolution' },
  { val: '7j/7', label: 'Support disponible' },
];

export default function TradeAssurance() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115]">
      <Header />
      <main>

        {/* Hero */}
        <section className="bg-gradient-to-br from-[#111] via-[#1a1a2e] to-[#111] text-white py-20 px-4 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#ffdc2b] rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
          </div>
          <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="w-20 h-20 bg-[#ffdc2b]/20 border-2 border-[#ffdc2b]/40 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt size={32} className="text-[#ffdc2b]" />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black mb-5 leading-tight">
              Trade <span className="text-[#ffdc2b]">Assurance</span>
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-10">
              Chaque transaction sur Dango Import est protégée. Achetez en toute confiance, nous avons tout prévu.
            </p>
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-10">
              {STATS.map(s => (
                <div key={s.label} className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                  <p className="text-2xl font-black text-[#ffdc2b]">{s.val}</p>
                  <p className="text-[12px] text-gray-300 mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('/shopping')}
              className="inline-flex items-center gap-2 bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black px-8 py-4 rounded-full transition-all text-[15px] hover:shadow-xl hover:-translate-y-0.5"
            >
              Commencer mes achats <FaArrowRight size={14} />
            </button>
          </div>
        </section>

        {/* How it works */}
        <section className="py-16 px-4 bg-white dark:bg-[#1a1d24]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">Processus</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Comment ça marche ?</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STEPS.map((step, i) => (
                <div key={step.num} className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden lg:block absolute top-7 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 z-0" style={{ width: 'calc(100% - 28px)', left: '50%' }} />
                  )}
                  <div className="relative z-10 text-center">
                    <div className="w-14 h-14 bg-[#ffdc2b] text-[#111] rounded-full flex items-center justify-center mx-auto mb-4 font-black text-[18px] shadow-lg">
                      {step.num}
                    </div>
                    <h3 className="font-black text-gray-900 dark:text-white mb-2 text-[15px]">{step.title}</h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Protections */}
        <section className="py-16 px-4 bg-[#f5f5f5] dark:bg-[#0f1115]">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <span className="text-[12px] font-black text-[#ffdc2b] uppercase tracking-widest">Garanties</span>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mt-2">Vos protections incluses</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {PROTECTIONS.map(({ icon: Icon, color, title, desc }) => (
                <div key={title} className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-lg transition-shadow">
                  <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center text-white mb-4 shadow-sm`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-black text-gray-900 dark:text-white mb-2 text-[16px]">{title}</h3>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-[#ffdc2b]">
          <div className="max-w-2xl mx-auto text-center px-4">
            <FaCheckCircle size={40} className="mx-auto mb-4 text-[#111]" />
            <h2 className="text-2xl md:text-3xl font-black text-[#111] mb-3">Prêt à acheter en confiance ?</h2>
            <p className="text-[#444] text-[14px] mb-8">Rejoignez des milliers d'acheteurs satisfaits qui font confiance à Dango Import.</p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={() => navigate('/register')} className="bg-[#111] text-white font-black px-8 py-3.5 rounded-full transition-all hover:bg-[#333]">
                Créer un compte
              </button>
              <button onClick={() => navigate('/shopping')} className="bg-white text-[#111] font-black px-8 py-3.5 rounded-full transition-all hover:bg-gray-100 border border-[#ddd]">
                Explorer le catalogue
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
