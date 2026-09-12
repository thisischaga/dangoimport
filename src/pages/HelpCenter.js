import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Package, CreditCard, Truck, ShieldCheck, User } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

const TOPICS = [
  { label: 'Commandes', icon: Package },
  { label: 'Livraison', icon: Truck },
  { label: 'Paiements', icon: CreditCard },
  { label: 'Sécurité', icon: ShieldCheck },
  { label: 'Mon Compte', icon: User },
  { label: 'Autres', icon: MessageCircle },
];

const ALL_FAQS = [
  {
    topic: 'Commandes',
    questions: [
      { q: 'Comment passer une commande ?', a: 'Ajoutez le produit au panier, confirmez votre adresse et validez le paiement.' },
      { q: 'Comment suivre ma commande ?', a: 'Connectez-vous puis ouvrez « Mes commandes » depuis le menu de votre compte.' },
      { q: 'Puis-je annuler une commande ?', a: 'Contactez le support dans les 2 heures si la commande n\'est pas encore expédiée.' },
    ],
  },
  {
    topic: 'Livraison',
    questions: [
      { q: 'Quels sont vos délais de livraison ?', a: 'Stock local : 1 à 3 jours. Import Chine : 7 à 21 jours selon l\'expédition.' },
      { q: 'Livrez-vous au Bénin et au Togo ?', a: 'Oui, nous livrons principalement au Bénin et au Togo.' },
    ],
  },
  {
    topic: 'Paiements',
    questions: [
      { q: 'Quels moyens de paiement acceptez-vous ?', a: 'Mobile Money (MTN, Moov), virement bancaire et paiements partenaires.' },
      { q: 'Mon paiement est-il sécurisé ?', a: 'Oui, vos transactions sont protégées via nos partenaires de paiement certifiés.' },
    ],
  },
  {
    topic: 'Sécurité',
    questions: [
      { q: 'Mes données sont-elles protégées ?', a: 'Oui, vos informations personnelles sont chiffrées et ne sont pas revendues.' },
    ],
  },
  {
    topic: 'Mon Compte',
    questions: [
      { q: 'Comment créer un compte ?', a: 'Cliquez sur « Se connecter » puis « Créer un compte » et suivez le formulaire.' },
      { q: 'Mot de passe oublié ?', a: 'Utilisez « Mot de passe oublié » sur la page de connexion.' },
    ],
  },
  {
    topic: 'Autres',
    questions: [
      { q: 'Comment contacter le support ?', a: 'Rendez-vous sur la page Contact ou écrivez à contact@dangoimport.com.' },
    ],
  },
];

const QUICK_LINKS = [
  { label: 'Mes commandes', to: '/mes-commandes' },
  { label: 'Livraison', to: '/livraison' },
  { label: 'Retours', to: '/retours' },
  { label: 'Contact', to: '/contact' },
];

export default function HelpCenter() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState('Commandes');
  const [openFaq, setOpenFaq] = useState(null);
  const [search, setSearch] = useState('');

  const currentFaqs = ALL_FAQS.find((f) => f.topic === activeTopic)?.questions || [];
  const filtered = search.trim()
    ? ALL_FAQS.flatMap((t) => t.questions).filter(
        (q) =>
          q.q.toLowerCase().includes(search.toLowerCase()) ||
          q.a.toLowerCase().includes(search.toLowerCase())
      )
    : currentFaqs;

  return (
    <div className="min-h-screen bg-[#f8f9fc]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="mb-6 text-xs text-slate-500">
          <button type="button" onClick={() => navigate('/')} className="hover:text-[#FF6B00]">
            Accueil
          </button>
          <span className="mx-2">/</span>
          <span className="font-semibold text-slate-800">Centre d&apos;aide</span>
        </p>

        <div className="mb-8 overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm sm:p-10">
          <div className="absolute pointer-events-none" aria-hidden />
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="mt-2 max-w-2xl text-slate-600">
            Commandes, livraison, paiements — trouvez rapidement une réponse.
          </p>

          <div className="relative mt-6 max-w-xl">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              placeholder="Rechercher une question..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpenFaq(null);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#FF6B00] focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/20"
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {QUICK_LINKS.map(({ label, to }) => (
              <Link
                key={to}
                to={to}
                className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-[#FF6B00] hover:text-[#FF6B00]"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {!search.trim() && (
            <aside className="lg:col-span-1">
              <div className="sticky top-24 space-y-1 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                {TOPICS.map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setActiveTopic(label);
                      setOpenFaq(null);
                    }}
                    className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activeTopic === label
                        ? 'bg-[#FFF8F3] text-[#FF6B00]'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} />
                    {label}
                  </button>
                ))}
              </div>
            </aside>
          )}

          <div className={search.trim() ? 'lg:col-span-4' : 'lg:col-span-3'}>
            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
                  <p className="text-lg font-bold text-slate-900">Aucun résultat</p>
                  <p className="mt-1 text-slate-500">Essayez un autre mot-clé ou contactez le support.</p>
                </div>
              ) : (
                filtered.map((faq, i) => (
                  <div
                    key={`${faq.q}-${i}`}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left"
                    >
                      <span className="pr-4 text-sm font-bold text-slate-900 sm:text-base">{faq.q}</span>
                      <span
                        className={`text-xl font-light transition-transform ${
                          openFaq === i ? 'rotate-45 text-[#FF6B00]' : 'text-slate-400'
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {openFaq === i && (
                      <div className="border-t border-slate-100 px-6 pb-5 pt-4 text-sm leading-relaxed text-slate-600">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#FFE4CC] bg-[#FFF8F3] p-6 sm:flex-row sm:items-center">
          <div>
            <h3 className="font-bold text-slate-900">Besoin d&apos;une aide personnalisée ?</h3>
            <p className="mt-1 text-sm text-slate-600">Notre équipe support vous répond sous 24h.</p>
          </div>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#E85F00]"
          >
            <MessageCircle size={16} />
            Contacter le support
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
