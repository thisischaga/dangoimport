import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';

const TOPICS = [
  { label: 'Commandes' },
  { label: 'Livraison' },
  { label: 'Paiements' },
  { label: 'Sécurité' },
  { label: 'Mon Compte' },
  { label: 'Autres' },
];

const ALL_FAQS = [
  {
    topic: 'Commandes',
    questions: [
      { q: 'Comment passer une commande ?', a: 'Ajoutez le produit au panier, rendez-vous sur la page Panier, confirmez votre adresse et validez le paiement.' },
      { q: 'Puis-je modifier ma commande après validation ?', a: 'Les modifications sont possibles dans les 2 heures suivant la commande. Contactez notre support rapidement.' },
      { q: 'Comment annuler une commande ?', a: 'Contactez le support dans les 2h. Si la commande n\'est pas encore expédiée, l\'annulation est possible avec remboursement complet.' },
    ]
  },
  {
    topic: 'Livraison',
    questions: [
      { q: 'Quels sont vos délais de livraison ?', a: 'Produits en stock local : 1-3 jours. Produits importés (Chine) : 7-21 jours selon la méthode d\'expédition.' },
      { q: 'Livrez-vous dans toute l\'Afrique de l\'Ouest ?', a: 'Nous livrons principalement au Bénin et au Togo. Pour d\'autres pays, contactez-nous pour un devis personnalisé.' },
      { q: 'Comment suivre ma livraison ?', a: 'Rendez-vous dans "Mes commandes" pour voir l\'état en temps réel. Vous recevez aussi des notifications par email.' },
    ]
  },
  {
    topic: 'Paiements',
    questions: [
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Mobile Money (MTN, Moov), virement bancaire, et paiement en espèces à Cotonou/Lomé.' },
      { q: 'Mon paiement est-il sécurisé ?', a: 'Oui. Votre paiement est mis en escrow et n\'est libéré au vendeur qu\'après confirmation de réception.' },
      { q: 'Comment obtenir un remboursement ?', a: 'Signalez votre problème au support dans les 48h avec photos à l\'appui. Remboursement traité sous 3-5 jours ouvrés.' },
    ]
  },
  {
    topic: 'Sécurité',
    questions: [
      { q: 'Comment protégez-vous mes données ?', a: 'Vos données sont chiffrées et stockées de manière sécurisée. Nous ne partageons jamais vos informations avec des tiers sans votre accord.' },
      { q: 'Que faire si je reçois un produit frauduleux ?', a: 'Contactez immédiatement notre support avec preuves. Nous ouvrons un litige et garantissons votre remboursement si la fraude est avérée.' },
    ]
  },
  {
    topic: 'Mon Compte',
    questions: [
      { q: 'Comment créer un compte ?', a: 'Cliquez sur "Connexion" > "Créer un compte". Remplissez le formulaire et confirmez par email.' },
      { q: 'J\'ai oublié mon mot de passe, que faire ?', a: 'Sur la page de connexion, cliquez "Mot de passe oublié" et suivez les instructions envoyées sur votre email.' },
      { q: 'Puis-je avoir plusieurs comptes ?', a: 'Non, un seul compte par personne est autorisé. Plusieurs comptes peuvent entraîner une suspension.' },
    ]
  },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState('Commandes');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const currentFaqs = ALL_FAQS.find(f => f.topic === activeTopic)?.questions || [];
  const filtered = search.trim()
    ? ALL_FAQS.flatMap(t => t.questions).filter(q =>
        q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
      )
    : currentFaqs;

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115]">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Minimal Breadcrumb */}
        <p className="text-[12px] text-gray-500 mb-6">
          <button onClick={() => navigate('/')} className="hover:text-gray-900 dark:hover:text-white transition-colors">Accueil</button>
          <span className="mx-2">/</span>
          <span className="text-gray-900 dark:text-white font-bold">Centre d'aide</span>
        </p>

        {/* Clean, Iconless Premium Header */}
        <div className="relative bg-white dark:bg-[#1a1d24] rounded-2xl p-8 sm:p-12 mb-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 overflow-hidden">
          {/* Subtle background gradient glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#ffdc2b]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          
          <div className="relative z-10 w-full md:w-auto flex-1 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white leading-tight tracking-tight mb-3">
              Centre d'aide
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-[15px] pl-4 border-l-2 border-[#ffdc2b]/30 mb-6">
              Trouvez rapidement des réponses à toutes vos questions concernant vos commandes, paiements, livraisons et la gestion de votre compte.
            </p>

            <div className="relative max-w-md">
              <input
                type="text"
                placeholder="Rechercher une question..."
                value={search}
                onChange={e => { setSearch(e.target.value); setOpenFaq(null); }}
                className="w-full px-5 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-[14px] font-medium focus:outline-none focus:border-[#ffdc2b] focus:ring-1 focus:ring-[#ffdc2b] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="shrink-0 relative z-10 hidden md:block">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 text-center">
              <p className="text-sm font-bold text-gray-900 dark:text-white mb-2">Besoin de plus d'aide ?</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-[200px]">Notre équipe support est disponible 24/7 pour vous assister.</p>
              <button className="bg-[#ffdc2b] text-[#111] hover:bg-[#e6c600] font-black px-6 py-2.5 rounded-full transition-colors text-[13px] w-full shadow-sm">
                Nous contacter
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            {!search.trim() && (
              <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 p-2 sticky top-24 shadow-sm">
                {TOPICS.map(({ label }) => (
                  <button
                    key={label}
                    onClick={() => { setActiveTopic(label); setOpenFaq(null); }}
                    className={`w-full text-left px-5 py-3 rounded-xl text-[14px] font-bold transition-all mb-1 ${
                      activeTopic === label
                        ? 'bg-[#ffdc2b]/10 text-gray-900 dark:text-white border-l-4 border-l-[#ffdc2b]'
                        : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white border-l-4 border-l-transparent'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* FAQs Content */}
          <div className="lg:col-span-3">
            <div className="space-y-3">
              {filtered.length === 0 && (
                <div className="text-center py-16 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</p>
                  <p className="text-gray-500">Nous n'avons pas trouvé de réponse pour « {search} ».</p>
                </div>
              )}
              {filtered.map((faq, i) => (
                <div key={i} className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden shadow-sm transition-all hover:border-gray-300 dark:hover:border-gray-600">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-gray-900 dark:text-white"
                  >
                    <span className="font-bold text-[15px] pr-4">{faq.q}</span>
                    <span className={`text-[18px] font-light transition-transform duration-300 ${openFaq === i ? 'rotate-45 text-[#ffdc2b]' : 'text-gray-400'}`}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div className="px-6 pb-6 text-[14px] text-gray-600 dark:text-gray-300 leading-relaxed border-t border-gray-50 dark:border-gray-800 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {search.trim() && filtered.length > 0 && (
              <p className="text-center text-sm text-gray-400 mt-6 font-medium">
                Affichage des résultats de recherche pour « {search} »
              </p>
            )}
          </div>

        </div>

      </main>
    </div>
  );
}
