import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: "presentation",
    title: "1. PRÉSENTATION DE DANGO IMPORT",
    content: `Dango Import est une plateforme spécialisée dans :
• l’assistance à l’importation de produits depuis la Chine ;
• la recherche et la négociation avec des fournisseurs ;
• la coordination logistique ;
• la mise en relation commerciale ;
• la vente de produits proposés par des vendeurs partenaires situés principalement au Bénin et au Togo.

Dango Import agit principalement comme :
• intermédiaire commercial ;
• plateforme numérique ;
• facilitateur logistique ;
• coordinateur de commandes.`,
  },
  {
    id: "acceptation",
    title: "2. ACCEPTATION DES CONDITIONS",
    content: `L’utilisation du site implique l’acceptation pleine et entière des présentes CGU. Si vous n’acceptez pas ces conditions, vous ne devez pas utiliser les services proposés par Dango Import.`,
  },
  {
    id: "services",
    title: "3. SERVICES PROPOSÉS",
    content: `La plateforme Dango Import propose notamment :

3.1 Service d’importation depuis la Chine
• recherche fournisseurs ;
• négociation commerciale ;
• établissement de devis ;
• assistance à l’importation ;
• suivi logistique ;
• livraison finale.

3.2 Marketplace locale
Le site permet également à des vendeurs partenaires indépendants de proposer leurs produits aux utilisateurs. Les produits disponibles sur la marketplace peuvent être proposés par :
• des commerçants locaux ;
• des partenaires indépendants ;
• des vendeurs tiers situés au Bénin ou au Togo.`,
  },
  {
    id: "role",
    title: "4. RÔLE DE DANGO IMPORT",
    content: `Dango Import agit principalement comme une plateforme intermédiaire entre acheteurs, vendeurs partenaires et fournisseurs. À ce titre :
• Dango Import facilite les transactions ;
• Dango Import coordonne certaines opérations logistiques ;
• Dango Import peut centraliser les paiements ;
• Dango Import peut assister dans le suivi des commandes.

Toutefois, Dango Import n’est pas systématiquement propriétaire des produits proposés sur la marketplace.`,
  },
  {
    id: "devis",
    title: "5. DEMANDE DE DEVIS PERSONNALISÉ",
    content: `5.1 Fonctionnement
Les utilisateurs souhaitant obtenir un devis personnalisé pour une importation doivent soumettre une demande via la plateforme. Cette prestation peut inclure :
• recherche de fournisseurs ;
• négociation de prix ;
• estimation des frais ;
• étude logistique ;
• établissement d’un devis détaillé.

5.2 Acompte obligatoire
Toute demande de devis personnalisé nécessite le paiement préalable d’un acompte de 5 000 FCFA. Cet acompte permet notamment de couvrir :
• le temps de traitement ;
• les négociations fournisseurs ;
• les recherches commerciales ;
• les frais opérationnels engagés.

5.3 Déduction de l’acompte
Si le client valide sa commande, le montant de l’acompte sera déduit du montant final à payer.
Exemple : montant commande : 30 000 FCFA ; acompte déjà payé : 5 000 FCFA ; reste à payer : 25 000 FCFA.

5.4 Non-remboursement de l’acompte
En cas d’abandon du projet, de refus du devis, d’absence de validation de commande ou d’annulation volontaire par le client après traitement, l’acompte reste acquis à Dango Import et ne pourra faire l’objet d’aucun remboursement.`,
  },
  {
    id: "delais",
    title: "6. DÉLAIS",
    content: `Les délais communiqués par Dango Import sont donnés à titre indicatif. Ces délais peuvent varier en fonction :
• des fournisseurs ;
• du transport ;
• des procédures douanières ;
• des contraintes logistiques ;
• des cas de force majeure.

Dango Import ne saurait être tenu responsable des retards indépendants de sa volonté.`,
  },
  {
    id: "produits",
    title: "7. PRODUITS ET DISPONIBILITÉ",
    content: `Les produits proposés sur la plateforme peuvent être :
• importés ;
• fournis par des partenaires locaux ;
• proposés par des vendeurs tiers.

La disponibilité des produits dépend des stocks des partenaires et fournisseurs. Dango Import ne garantit pas la disponibilité permanente des produits affichés sur la plateforme.`,
  },
  {
    id: "responsabilite_vendeurs",
    title: "8. RESPONSABILITÉ DES VENDEURS PARTENAIRES",
    content: `Les vendeurs partenaires restent seuls responsables :
• des produits proposés ;
• de leur conformité ;
• de leur qualité ;
• de leur disponibilité ;
• des garanties applicables ;
• des informations communiquées sur les produits.

Dango Import agit principalement comme intermédiaire commercial et logistique.`,
  },
  {
    id: "limitation",
    title: "9. LIMITATION DE RESPONSABILITÉ",
    content: `Dango Import ne saurait être tenu responsable :
• des variations mineures de couleurs ou textures dues aux prises de vue ou aux écrans ;
• des différences mineures d’emballage ;
• des erreurs de fournisseurs ou partenaires ;
• des ruptures de stock ;
• des retards de livraison indépendants de sa volonté ;
• des dommages causés par une mauvaise utilisation des produits ;
• des informations inexactes fournies par les vendeurs partenaires ;
• des pertes indirectes liées à l’utilisation des produits ou services.`,
  },
  {
    id: "prix",
    title: "10. PRIX ET PAIEMENTS",
    content: `Les prix affichés sur la plateforme peuvent être modifiés à tout moment sans préavis. Les paiements peuvent être effectués via les moyens proposés sur la plateforme.
Dango Import se réserve le droit de suspendre toute commande en cas de suspicion de fraude, de paiement non validé, de litige ou d’informations incorrectes.`,
  },
  {
    id: "livraison",
    title: "11. LIVRAISON",
    content: `Les livraisons peuvent être assurées :
• par Dango Import ;
• par des partenaires logistiques ;
• par les vendeurs partenaires eux-mêmes.

Les délais de livraison restent indicatifs. Le client est responsable de fournir des informations exactes concernant son adresse et ses coordonnées.`,
  },
  {
    id: "retours",
    title: "12. POLITIQUE DE RETOUR ET REMBOURSEMENT",
    content: `12.1 Conditions générales
Les demandes de retour doivent être effectuées dans un délai raisonnable après réception du produit. Les produits retournés doivent être non utilisés, être dans leur état d’origine, et être accompagnés de leurs accessoires éventuels.

12.2 Produits non retournables
Ne sont notamment pas éligibles au retour : les commandes personnalisées, les produits importés spécialement pour le client, les produits utilisés ou endommagés après réception, les produits ouverts ou incomplets, les produits commandés sur mesure.

12.3 Validation des retours
Dango Import se réserve le droit d’accepter ou de refuser toute demande de retour après analyse du dossier.`,
  },
  {
    id: "compte",
    title: "13. COMPTE UTILISATEUR",
    content: `L’utilisateur est responsable de la confidentialité de ses identifiants, des activités effectuées depuis son compte, et des informations fournies sur la plateforme.
Dango Import se réserve le droit de suspendre ou supprimer un compte en cas de fraude, d’utilisation abusive, de comportement nuisible ou de violation des présentes CGU.`,
  },
  {
    id: "propriete",
    title: "14. PROPRIÉTÉ INTELLECTUELLE",
    content: `Tous les contenus présents sur la plateforme (textes, logos, images, graphismes, éléments visuels, structure du site) restent la propriété exclusive de Dango Import ou de leurs propriétaires respectifs. Toute reproduction non autorisée est interdite.`,
  },
  {
    id: "communications",
    title: "15. COMMUNICATIONS ÉLECTRONIQUES",
    content: `En utilisant la plateforme, l’utilisateur accepte de recevoir des communications électroniques : emails, notifications, messages WhatsApp, SMS, informations liées aux commandes.`,
  },
  {
    id: "force_majeure",
    title: "16. FORCE MAJEURE",
    content: `Dango Import ne pourra être tenu responsable des retards ou inexécutions causés par des événements indépendants de sa volonté : catastrophes naturelles, conflits, coupures internet, blocages douaniers, grèves, crises sanitaires, défaillance transporteurs.`,
  },
  {
    id: "modification",
    title: "17. MODIFICATION DES CONDITIONS",
    content: `Dango Import se réserve le droit de modifier les présentes CGU à tout moment. Les nouvelles versions prendront effet dès leur publication sur la plateforme.`,
  },
  {
    id: "droit",
    title: "18. DROIT APPLICABLE",
    content: `Les présentes CGU sont régies par les lois applicables en République du Bénin et, le cas échéant, par les réglementations applicables au Togo pour certaines opérations commerciales locales.`,
  },
  {
    id: "contact",
    title: "19. CONTACT",
    content: `Pour toute question concernant les présentes conditions :
Dango Import
Email : Contact@dangoimport.com
Téléphone / WhatsApp : 0158266342 / 0159387180
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
            Dernière mise à jour : <span className="text-yellow-400 font-bold">1er mai 2026</span>
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