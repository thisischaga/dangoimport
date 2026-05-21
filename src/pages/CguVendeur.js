import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp, FaUserTie } from "react-icons/fa";

const SECTIONS = [
  {
    id: "preambule",
    title: "1. PRÉAMBULE",
    content: `Les présentes Conditions Générales d’Utilisation (ci-après « CGU Vendeurs ») régissent les relations contractuelles entre :
• Dango Import (ci-après « la Plateforme » ou « Dango Import »), opérateur de marketplace et intermédiaire commercial ;
• et tout vendeur professionnel ou particulier référencé sur la plateforme (ci-après « le Vendeur »).

Dango Import agit en qualité de plateforme intermédiaire de mise en relation, de commercialisation et de gestion des commandes, incluant le traitement des paiements et la coordination logistique.`,
  },
  {
    id: "objet",
    title: "2. OBJET",
    content: `Les présentes CGU ont pour objet de définir :
• les conditions d’inscription des Vendeurs ;
• les modalités de mise en ligne des produits ;
• les règles de fixation des prix ;
• les conditions de vente via la plateforme ;
• les modalités de paiement et reversement ;
• les obligations de qualité et de service ;
• les règles de responsabilité et de sanctions.`,
  },
  {
    id: "statut",
    title: "3. STATUT DU VENDEUR",
    content: `Le Vendeur reconnaît agir en qualité de :
• commerçant indépendant, ou
• fournisseur partenaire référencé,
et reste seul responsable :
• de ses produits ;
• de sa conformité légale ;
• de ses obligations fiscales et commerciales.`,
  },
  {
    id: "selection",
    title: "4. SÉLECTION ET RÉFÉRENCEMENT",
    content: `Dango Import se réserve le droit de :
• accepter ou refuser tout Vendeur ;
• suspendre ou retirer un Vendeur sans préavis en cas de non-respect des présentes CGU ;
• demander des pièces justificatives (identité, localisation, RCCM si disponible).`,
  },
  {
    id: "mise_en_vente",
    title: "5. MODALITÉS DE MISE EN VENTE",
    content: `Les produits sont :
• soit intégrés par Dango Import après négociation avec le Vendeur ;
• soit fournis par le Vendeur selon un accord de référencement.

Le Vendeur garantit :
• la disponibilité réelle des produits ;
• la conformité des descriptions ;
• la véracité des informations fournies.`,
  },
  {
    id: "prix",
    title: "6. FIXATION DES PRIX",
    content: `Les prix affichés sur la plateforme sont :
• fixés après négociation entre Dango Import et le Vendeur ;
• exprimés en francs CFA (FCFA) ;
• TTC des commissions de la plateforme.

Le Vendeur accepte que :
• le prix final consommateur soit déterminé par Dango Import après ajout de sa commission ;
• toute modification de prix nécessite validation préalable.`,
  },
  {
    id: "commission",
    title: "7. COMMISSION DE DANGO IMPORT",
    content: `Le Vendeur accepte l’application d’une commission :
• standard : 15 % du prix net vendeur ;
• minimum : 1 000 FCFA par commande.

La commission est automatiquement déduite lors du traitement de la commande.`,
  },
  {
    id: "paiement",
    title: "8. PAIEMENT ET REVERSEMENT AU VENDEUR",
    content: `8.1 Encaissement
Dango Import encaisse l’intégralité du paiement client en qualité d’intermédiaire.

8.2 Reversement
Le Vendeur est payé selon les règles suivantes :
• J+1 (24h ouvrées après confirmation de livraison) ;
• sous réserve : o absence de litige ; o validation de livraison ; o absence de fraude ou contestation.

8.3 Gel des fonds
Dango Import peut suspendre le reversement en cas de :
• litige client ;
• produit non conforme ;
• suspicion de fraude ;
• retour en cours de traitement.`,
  },
  {
    id: "livraison",
    title: "9. LIVRAISON",
    content: `La livraison est assurée :
• soit par Dango Import ;
• soit par un prestataire logistique partenaire ;
• soit exceptionnellement par le Vendeur selon accord.

Le Vendeur doit :
• préparer correctement les produits ;
• respecter les délais convenus ;
• assurer la conformité du colis.`,
  },
  {
    id: "retours",
    title: "10. RETOURS ET REMBOURSEMENTS",
    content: `Le Vendeur accepte que :
• les retours soient gérés par Dango Import ;
• les remboursements puissent être décidés par la plateforme ;
• les coûts liés à une erreur ou défaut vendeur soient à sa charge.`,
  },
  {
    id: "responsabilite",
    title: "11. RESPONSABILITÉ DU VENDEUR",
    content: `Le Vendeur est responsable :
• de la qualité des produits ;
• des défauts de fabrication ;
• des erreurs de description ;
• des retards imputables à son activité ;
• de tout dommage causé par ses produits.`,
  },
  {
    id: "contournement",
    title: "12. INTERDICTION DE CONTOURNEMENT",
    content: `Il est strictement interdit au Vendeur de :
• contacter directement un client identifié via la plateforme dans le but de contourner Dango Import ;
• finaliser une vente hors plateforme après mise en relation initiale par Dango Import.

Sanctions :
• 1er manquement : suspension + pénalité financière ;
• récidive : radiation définitive.`,
  },
  {
    id: "coherence",
    title: "13. COHÉRENCE COMMERCIALE",
    content: `Le Vendeur s’engage à :
• maintenir une cohérence de prix sur ses produits référencés ;
• éviter toute pratique visant à détourner le trafic généré par Dango Import ;
• coopérer dans une logique de partenariat commercial.`,
  },
  {
    id: "obligations",
    title: "14. OBLIGATIONS DU VENDEUR",
    content: `Le Vendeur doit :
• fournir des informations exactes ;
• maintenir ses stocks à jour ;
• respecter les délais ;
• répondre aux réclamations ;
• assurer un minimum de qualité de service.`,
  },
  {
    id: "donnees",
    title: "15. DONNÉES ET CONFORMITÉ",
    content: `Le Vendeur autorise Dango Import à :
• utiliser ses données commerciales pour la gestion des ventes ;
• diffuser ses produits sur la plateforme ;
• collecter les données nécessaires à la transaction.`,
  },
  {
    id: "radiation",
    title: "16. SUSPENSION ET RADIATION",
    content: `Dango Import peut suspendre ou supprimer un Vendeur en cas de :
• fraude ;
• mauvaise qualité répétée ;
• non-respect des délais ;
• litiges multiples ;
• violation des présentes CGU.`,
  },
  {
    id: "limitation",
    title: "17. LIMITATION DE RESPONSABILITÉ",
    content: `Dango Import agit en tant qu’intermédiaire et ne saurait être responsable :
• des défauts intrinsèques des produits ;
• des informations fournies par les Vendeurs ;
• des retards imputables aux Vendeurs ;
• des comportements frauduleux des Vendeurs.`,
  },
  {
    id: "modification",
    title: "18. MODIFICATION DES CGU",
    content: `Dango Import se réserve le droit de modifier les présentes CGU à tout moment. Les Vendeurs seront informés des mises à jour.`,
  },
  {
    id: "acceptation",
    title: "19. ACCEPTATION",
    content: `L’inscription et la mise en vente sur la plateforme impliquent l’acceptation pleine et entière des présentes CGU.`,
  },
];

export default function CguVendeur() {
  const [active, setActive] = useState("preambule");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaUserTie className="text-yellow-400 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">CGU Vendeurs Référencés</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Dernière mise à jour : <span className="text-yellow-400 font-bold">12 mai 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar — Table of contents */}
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Sommaire</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    active === s.id
                      ? "bg-yellow-400 text-gray-900 shadow-md shadow-yellow-400/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <FaChevronRight size={8} className="shrink-0" />
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0 space-y-10">
          {/* Intro box */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6">
            <p className="text-sm text-indigo-900 leading-relaxed font-medium">
              <strong>Espace Vendeur :</strong> En tant que partenaire référencé sur Dango Import, vous vous engagez à respecter ces conditions pour garantir la meilleure expérience client possible.
            </p>
          </div>

          {SECTIONS.map(s => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-32"
              onMouseEnter={() => setActive(s.id)}
            >
              <h2 className="text-xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">{s.title}</h2>
              {s.content.split("\n").map((line, i) =>
                line.trim() === "" ? <div key={i} className="h-2" /> :
                line.startsWith("•") ? (
                  <p key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed mb-1">
                    <span className="text-indigo-500 mt-1 shrink-0">•</span>
                    {line.slice(1).trim()}
                  </p>
                ) : line.match(/^\d+\.\d+/) ? (
                  <p key={i} className="text-gray-900 font-black text-sm mt-4 mb-1">{line}</p>
                ) : (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{line}</p>
                )
              )}
            </section>
          ))}
        </article>
      </div>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}
