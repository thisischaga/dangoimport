import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaShieldAlt, FaChevronRight, FaArrowUp, FaLock } from "react-icons/fa";

const SECTIONS = [
  {
    id: "qui-sommes-nous",
    title: "1. QUI SOMMES-NOUS ?",
    content: `Dango Import est une plateforme spécialisée dans :
• l’assistance à l’importation de produits depuis la Chine ;
• la recherche et la négociation avec des fournisseurs ;
• la coordination logistique ;
• la vente de produits proposés par des partenaires locaux ;
• la mise en relation entre vendeurs partenaires et acheteurs.

Dans le cadre de ses activités, Dango Import collecte certaines données nécessaires au bon fonctionnement de ses services.`,
  },
  {
    id: "donnees-collectees",
    title: "2. DONNÉES PERSONNELLES COLLECTÉES",
    content: `Nous pouvons collecter différentes catégories d’informations personnelles.

2.1 Informations fournies directement par l’utilisateur
Lorsque vous utilisez la plateforme, vous pouvez nous transmettre : nom et prénom, numéro de téléphone, adresse email, adresse de livraison, informations de facturation, ville et pays, messages envoyés via formulaires, WhatsApp ou support client, informations liées aux demandes de devis, informations relatives aux commandes.

2.2 Informations collectées automatiquement
Lors de l’utilisation du site, certaines informations peuvent être collectées automatiquement : adresse IP, type d’appareil, navigateur utilisé, système d’exploitation, pages visitées, durée de navigation, historique d’utilisation, données techniques de connexion.

2.3 Informations liées aux paiements
Selon les moyens de paiement utilisés, certaines informations peuvent être traitées : identifiant de transaction, montant payé, statut du paiement, historique des paiements. Les informations bancaires sensibles peuvent être traitées directement par les prestataires de paiement sécurisés et ne sont pas nécessairement stockées par Dango Import.`,
  },
  {
    id: "finalites",
    title: "3. FINALITÉS DE LA COLLECTE DES DONNÉES",
    content: `Les données collectées sont utilisées notamment pour :
• traiter les commandes ;
• établir les devis personnalisés ;
• contacter les utilisateurs ;
• assurer les livraisons ;
• gérer les paiements ;
• améliorer les services ;
• répondre aux demandes clients ;
• gérer les litiges ;
• prévenir les fraudes ;
• assurer la sécurité de la plateforme ;
• envoyer des informations importantes concernant les services.`,
  },
  {
    id: "devis-importation",
    title: "4. DEMANDES DE DEVIS ET IMPORTATION",
    content: `Dans le cadre des demandes de devis personnalisés :
• certaines informations peuvent être transmises à des fournisseurs ou partenaires logistiques ;
• les informations collectées servent à négocier les prix, vérifier la disponibilité et organiser les opérations d’importation.

Dango Import s’efforce de limiter les données partagées au strict nécessaire.`,
  },
  {
    id: "marketplace",
    title: "5. MARKETPLACE ET VENDEURS PARTENAIRES",
    content: `Certains produits proposés sur la plateforme proviennent de vendeurs partenaires indépendants situés notamment au Bénin et au Togo. Dans ce cadre, certaines informations nécessaires à l’exécution des commandes peuvent être partagées avec les partenaires concernés, notamment : nom, numéro de téléphone, adresse de livraison, détails de commande.
Les vendeurs partenaires s’engagent à utiliser ces informations uniquement dans le cadre du traitement des commandes.`,
  },
  {
    id: "partage-tiers",
    title: "6. PARTAGE DES DONNÉES AVEC DES TIERS",
    content: `Dango Import peut partager certaines données avec : prestataires de paiement, partenaires logistiques, vendeurs partenaires, fournisseurs, services techniques, hébergeurs, autorités compétentes lorsque la loi l’exige.
Dango Import ne vend pas les données personnelles de ses utilisateurs à des tiers.`,
  },
  {
    id: "cookies",
    title: "7. COOKIES ET TECHNOLOGIES SIMILAIRES",
    content: `Le site peut utiliser des cookies et technologies similaires afin de : améliorer l’expérience utilisateur, analyser le trafic, mémoriser certaines préférences, mesurer les performances du site, faciliter certaines fonctionnalités.
Des outils tiers tels que Google Analytics, Meta Pixel, TikTok Pixel ou autres outils analytiques et publicitaires peuvent être utilisés selon les besoins de la plateforme. L’utilisateur peut configurer son navigateur pour limiter ou refuser certains cookies.`,
  },
  {
    id: "conservation",
    title: "8. CONSERVATION DES DONNÉES",
    content: `Les données personnelles sont conservées pendant une durée raisonnable nécessaire au traitement des commandes, au respect des obligations légales, à la gestion des litiges, à la sécurité de la plateforme, au suivi commercial.
Certaines données peuvent être conservées plus longtemps lorsque la loi l’exige.`,
  },
  {
    id: "securite",
    title: "9. SÉCURITÉ DES DONNÉES",
    content: `Dango Import met en œuvre des mesures de sécurité raisonnables afin de protéger les données personnelles contre les accès non autorisés, les pertes, les divulgations, les modifications, les utilisations abusives.
Toutefois, aucun système informatique ou transmission internet ne peut garantir une sécurité absolue.`,
  },
  {
    id: "communications",
    title: "10. COMMUNICATIONS ET MARKETING",
    content: `Dango Import peut envoyer : emails, notifications, messages WhatsApp, SMS, offres promotionnelles, informations relatives aux commandes. L’utilisateur peut demander à ne plus recevoir certaines communications marketing.`,
  },
  {
    id: "droits",
    title: "11. DROITS DES UTILISATEURS",
    content: `Sous réserve des lois applicables, les utilisateurs peuvent demander : l’accès à leurs données, la correction de leurs informations, la suppression de certaines données, la limitation de certains traitements, des informations sur l’utilisation de leurs données.
Toute demande peut être adressée via les coordonnées de contact indiquées ci-dessous.`,
  },
  {
    id: "protection-comptes",
    title: "12. PROTECTION DES COMPTES",
    content: `L’utilisateur est responsable de la confidentialité de ses identifiants, de la sécurité de son compte, et des activités effectuées depuis son espace personnel. Il est recommandé d’utiliser un mot de passe sécurisé et de ne pas partager ses accès.`,
  },
  {
    id: "mineurs",
    title: "13. DONNÉES DES MINEURS",
    content: `Les services de Dango Import ne sont pas destinés aux mineurs sans autorisation parentale. Dango Import ne collecte pas volontairement des données personnelles de mineurs sans consentement approprié.`,
  },
  {
    id: "liens-tiers",
    title: "14. LIENS VERS DES SITES TIERS",
    content: `Le site peut contenir des liens vers des plateformes ou services tiers. Dango Import n’est pas responsable des pratiques de confidentialité de ces services externes. Les utilisateurs sont invités à consulter leurs politiques respectives.`,
  },
  {
    id: "modification",
    title: "15. MODIFICATION DE LA POLITIQUE DE CONFIDENTIALITÉ",
    content: `Dango Import se réserve le droit de modifier la présente Politique de Confidentialité à tout moment. Les modifications prennent effet dès leur publication sur la plateforme. Les utilisateurs sont invités à consulter régulièrement cette politique.`,
  },
  {
    id: "contact",
    title: "16. CONTACT",
    content: `Pour toute question concernant cette Politique de Confidentialité ou le traitement des données personnelles :
Dango Import
Email : contact@dangoimport.com
Téléphone / WhatsApp : 0158266342 / 0159387180
Adresse : Cotonou, Bénin`,
  },
];

export default function Politique() {
  const [active, setActive] = useState("qui-sommes-nous");
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
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-blue-400/10 border border-blue-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaShieldAlt className="text-blue-400 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Politique de Confidentialité</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-blue-400 font-bold">07 mai 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FaLock className="text-blue-500 text-xs" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sommaire</p>
            </div>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    active === s.id
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/20"
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
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <p className="text-sm text-blue-900 leading-relaxed font-medium">
              <strong>Votre vie privée compte.</strong> Dango Import s'engage à protéger vos données personnelles avec le plus grand soin. Cette politique vous explique de manière transparente comment nous les utilisons.
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
                    <span className="text-blue-500 mt-1 shrink-0">•</span>
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

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              Voir aussi nos{" "}
              <Link to="/cgu" className="text-yellow-600 font-bold underline">Conditions Générales d'Utilisation</Link>
              {" "}— © 2026 Dango Import Group. Tous droits réservés.
            </p>
          </div>
        </article>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-blue-500 hover:bg-blue-400 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}