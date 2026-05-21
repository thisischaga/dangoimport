import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: "preambule",
    title: "PRÉAMBULE",
    content: `Les présentes Conditions Générales d’Utilisation (ci-après les « CGU ») définissent les règles d’accès et d’utilisation de la plateforme Dango Import.
Dango Import est une plateforme numérique opérant :
• une marketplace de mise en relation entre acheteurs et vendeurs partenaires ;
• un service d’accompagnement à l’importation de produits depuis la Chine.

Dango Import agit en qualité d’intermédiaire technique et commercial, facilitant les transactions entre utilisateurs, sans être systématiquement vendeur des produits proposés. En accédant à la plateforme, tout utilisateur accepte sans réserve les présentes CGU.`,
  },
  {
    id: "objet",
    title: "1. OBJET",
    content: `Les CGU définissent :
• les conditions d’utilisation du site ;
• les règles de fonctionnement de la marketplace ;
• les conditions d’accès aux services ;
• les responsabilités des parties.`,
  },
  {
    id: "definitions",
    title: "2. DÉFINITIONS",
    content: `• Utilisateur : toute personne utilisant la plateforme.
• Client : utilisateur achetant un produit ou un service.
• Vendeur partenaire : tiers proposant des produits via la marketplace.
• Dango Import : opérateur de la plateforme.
• Commande : transaction réalisée sur la plateforme.`,
  },
  {
    id: "nature",
    title: "3. NATURE DES SERVICES",
    content: `3.1 Marketplace locale
Dango Import permet la vente de produits proposés par des vendeurs partenaires sélectionnés.

3.2 Service d’importation Chine
Dango Import propose un service d’accompagnement incluant :
• sourcing fournisseur ;
• négociation ;
• achat ;
• logistique ;
• livraison.`,
  },
  {
    id: "role",
    title: "4. RÔLE DE DANGO IMPORT",
    content: `Dango Import agit uniquement comme :
• intermédiaire commercial ;
• plateforme technique ;
• coordinateur logistique.

👉 Dango Import n’est pas vendeur final des produits des vendeurs partenaires.`,
  },
  {
    id: "acces",
    title: "5. ACCÈS AUX SERVICES",
    content: `L’accès au site est ouvert au public. Certaines fonctionnalités nécessitent la création d’un compte utilisateur.`,
  },
  {
    id: "marketplace",
    title: "6. MARKETPLACE ET PRODUITS",
    content: `Les produits affichés peuvent provenir :
• de vendeurs partenaires locaux ;
• de fournisseurs validés ;
• de partenaires commerciaux.

Les informations produits sont fournies sous la responsabilité des vendeurs.`,
  },
  {
    id: "prix",
    title: "7. PRIX ET STRUCTURE TARIFAIRE",
    content: `Les prix affichés sur la plateforme sont déterminés après validation entre Dango Import et le vendeur.
Le prix inclut :
• coût du produit ;
• commission Dango Import ;
• frais opérationnels éventuels.`,
  },
  {
    id: "commission",
    title: "8. COMMISSION DANGO IMPORT",
    content: `Dango Import perçoit une commission sur chaque transaction.
• Commission minimale : 1 000 FCFA par produit
• Commission variable selon :
o catégorie de produit ;
o complexité logistique ;
o accords commerciaux.`,
  },
  {
    id: "paiements",
    title: "9. PAIEMENTS ET FLUX FINANCIERS",
    content: `9.1 Paiement client
Le client paie via les moyens disponibles sur la plateforme.

9.2 Centralisation des fonds
Dango Import peut centraliser temporairement les paiements afin de sécuriser la transaction.

9.3 Validation de commande
Les fonds ne sont pas immédiatement reversés au vendeur. Ils sont conservés jusqu’à :
• confirmation de livraison, ou
• validation de la commande.

9.4 Reversement aux vendeurs
Après validation, les fonds sont reversés au vendeur après déduction de la commission Dango Import dans un délai de J+24 heures ouvrées.`,
  },
  {
    id: "livraison",
    title: "10. LIVRAISON",
    content: `La livraison peut être assurée par :
• Dango Import ;
• le vendeur ;
• ou un prestataire tiers.

La responsabilité du produit est transférée au client lors de la remise effective ou confirmation de réception.`,
  },
  {
    id: "importation",
    title: "11. SERVICE D’IMPORTATION",
    content: `Le service d’importation est proposé sur devis. Un acompte peut être exigé pour lancement du processus.
Cet acompte :
• couvre les coûts de recherche et négociation ;
• reste acquis en cas d’abandon ou non-validation du projet.`,
  },
  {
    id: "retours",
    title: "12. POLITIQUE DE RETOUR",
    content: `Les retours sont régis par la Politique de Retour officielle de Dango Import.`,
  },
  {
    id: "responsabilite_vendeurs",
    title: "13. RESPONSABILITÉ DES VENDEURS",
    content: `Les vendeurs sont responsables :
• de la conformité des produits ;
• des descriptions ;
• des stocks ;
• de la qualité des articles.`,
  },
  {
    id: "limitation",
    title: "14. LIMITATION DE RESPONSABILITÉ",
    content: `Dango Import ne peut être tenu responsable :
• des variations mineures (couleur, texture, rendu écran) ;
• des erreurs des vendeurs ;
• des retards indépendants de sa volonté ;
• des dommages indirects ;
• de la mauvaise utilisation des produits.`,
  },
  {
    id: "force_majeure",
    title: "15. FORCE MAJEURE",
    content: `Dango Import ne saurait être tenu responsable de tout retard ou inexécution résultant d’un événement de force majeure, incluant notamment :
• catastrophes naturelles (inondations, incendies, tremblements de terre) ;
• crises sanitaires ou pandémies ;
• conflits armés ou troubles sociaux ;
• grèves ou blocages des transports ;
• interruptions de réseau internet ou électrique ;
• blocages douaniers ou restrictions administratives ;
• défaillance des prestataires logistiques ou fournisseurs.

👉 Dans de tels cas, l’exécution des obligations est suspendue pendant toute la durée de l’événement.`,
  },
  {
    id: "compte",
    title: "16. COMPTE UTILISATEUR",
    content: `L’utilisateur est responsable :
• de la confidentialité de ses identifiants ;
• de toute activité réalisée depuis son compte.

Dango Import peut suspendre ou supprimer un compte en cas de violation des CGU.`,
  },
  {
    id: "communications",
    title: "17. COMMUNICATIONS",
    content: `L’utilisateur accepte de recevoir des communications liées aux services :
• email ;
• SMS ;
• WhatsApp ;
• notifications système.`,
  },
  {
    id: "propriete",
    title: "18. PROPRIÉTÉ INTELLECTUELLE",
    content: `Tous les contenus de la plateforme sont protégés et appartiennent à Dango Import ou à ses partenaires.`,
  },
  {
    id: "modification",
    title: "19. MODIFICATION DES CGU",
    content: `Dango Import se réserve le droit de modifier les présentes CGU à tout moment. Les modifications sont applicables dès leur publication.`,
  },
  {
    id: "droit",
    title: "20. DROIT APPLICABLE",
    content: `Les présentes CGU sont régies par le droit en vigueur en République du Bénin.`,
  },
  {
    id: "contact",
    title: "21. CONTACT",
    content: `Dango Import
Email : contact@dangoimport.com
Téléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80
Adresse : Cotonou, Bénin`,
  },
];

export default function Cgu() {
  const [active, setActive] = useState("objet");
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
      <section className="bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaFileContract className="text-yellow-400 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Dernière mise à jour : <span className="text-yellow-400 font-bold">10 mai 2026</span>
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6">
            <p className="text-sm text-yellow-800 leading-relaxed font-medium">
              <strong>Important :</strong> En utilisant la plateforme Dango Import, vous acceptez les présentes CGU dans leur intégralité. Nous vous encourageons à les lire attentivement. Pour toute question, contactez-nous à{" "}
              <a href="mailto:contact@dangoimport.com" className="underline font-bold">contact@dangoimport.com</a>.
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
                    <span className="text-yellow-500 mt-1 shrink-0">•</span>
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

          {/* Footer note */}
          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              Voir aussi notre{" "}
              <Link to="/politique-de-confidentialité" className="text-yellow-600 font-bold underline">Politique de Confidentialité</Link>
              {" "}— © 2026 Dango Import Group. Tous droits réservés.
            </p>
          </div>
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