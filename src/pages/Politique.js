import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaShieldAlt, FaChevronRight, FaArrowUp, FaLock } from "react-icons/fa";

const SECTIONS = [
  {
    id: "donnees-collectees",
    title: "1. DONNÉES COLLECTÉES",
    content: `Nous collectons les données suivantes :\n- Données d’identification : Nom, prénom, adresse, numéro de téléphone, email, photo de profil.\n- Données de connexion : Adresse IP, type de navigateur, pages visitées, date et heure de connexion.\n- Données de commande : Produits commandés, adresse de livraison, mode de paiement (sans stockage complet des données bancaires).\n- Données vendeurs : RCCM, NIF, pièces d’identité, informations bancaires (pour reversement), historique de ventes.\n- Données de communication : Messages envoyés via WhatsApp, email ou le support client.\n- Cookies et technologies similaires : Données de navigation et préférences.`
  },
  {
    id: "finalites",
    title: "2. FINALITÉS DU TRAITEMENT",
    content: `Nous utilisons vos données pour :\n- Créer et gérer votre compte\n- Traiter vos commandes et assurer la livraison\n- Gérer les paiements et les reversements aux vendeurs\n- Communiquer avec vous (commandes, support, promotions)\n- Améliorer notre plateforme et personnaliser l’expérience\n- Assurer la sécurité et lutter contre la fraude\n- Respecter nos obligations légales`
  },
  {
    id: "base-legale",
    title: "3. BASE LÉGALE DU TRAITEMENT",
    content: `- Exécution du contrat (commandes, reversement)\n- Consentement (pour certaines communications marketing)\n- Intérêt légitime (amélioration du service, sécurité)\n- Obligation légale (comptabilité, lutte contre la fraude)`
  },
  {
    id: "partage",
    title: "4. PARTAGE DES DONNÉES",
    content: `Nous pouvons partager vos données avec :\n- Les Vendeurs Partenaires (uniquement les informations nécessaires à l’exécution de la commande)\n- Les prestataires logistiques et transporteurs\n- FedaPay (ou tout prestataire de paiement)\n- Les autorités compétentes sur demande légale\n- Nos sous‑traitants techniques (hébergement, maintenance)\nNous ne vendons jamais vos données personnelles à des tiers.`
  },
  {
    id: "conservation",
    title: "5. CONSERVATION DES DONNÉES",
    content: `Nous conservons vos données uniquement le temps nécessaire aux finalités :\n- Données de compte : tant que le compte est actif + 2 ans après suppression\n- Données de commande : 5 ans (obligations comptables)\n- Données vendeurs : durée de la relation contractuelle + obligations légales`
  },
  {
    id: "mineurs",
    title: "6. MINORITÉ",
    content: `La plateforme s’adresse aux majeurs (18 ans et plus). Les personnes de moins de 18 ans ne sont pas autorisées à créer un compte ou à passer commande sans le consentement parental vérifiable. Toute inscription ou commande effectuée par un mineur sans consentement sera supprimée. Les parents sont invités à surveiller l’utilisation du service.`
  },
  {
    id: "droits",
    title: "7. VOS DROITS",
    content: `Conformément à la loi béninoise et au RGPD, vous disposez des droits suivants :\n- Droit d’accès : obtenir une copie de vos données\n- Droit de rectification : corriger des informations inexactes\n- Droit à l’effacement (« droit à l’oubli »)\n- Droit d’opposition : vous opposer à un traitement, notamment à des fins marketing\n- Droit à la limitation du traitement\n- Droit à la portabilité des données\n- Droit de retirer votre consentement à tout moment\n- Droit de ne pas faire l’objet d’une décision automatisée` 
  },
  {
    id: "cookies",
    title: "8. COOKIES ET TECHNOLOGIES SIMILAIRES",
    content: `Nous utilisons des cookies pour améliorer votre navigation, analyser le trafic et personnaliser le contenu. Vous pouvez gérer vos préférences via les paramètres de votre navigateur.`
  },
  {
    id: "securite",
    title: "9. SÉCURITÉ DES DONNÉES",
    content: `Nous mettons en place des mesures techniques et organisationnelles (chiffrement, accès restreint, audits) pour protéger vos données contre tout accès non autorisé, perte ou altération.`
  },
  {
    id: "transfert",
    title: "10. TRANSFERT INTERNATIONAL DE DONNÉES",
    content: `Certaines données peuvent être transférées vers des prestataires situés hors du Bénin (ex. serveurs cloud). Nous assurons que ces transferts sont encadrés par des garanties appropriées.`
  },
  {
    id: "modification",
    title: "11. MODIFICATION DE LA POLITIQUE",
    content: `Nous nous réservons le droit de modifier cette politique à tout moment. La version mise à jour sera publiée sur le site avec la nouvelle date. Nous vous encourageons à la consulter régulièrement.`
  },
  {
    id: "contact",
    title: "12. CONTACT",
    content: `Pour toute question relative à cette Politique de Confidentialité ou au traitement de vos données :\nDango HUB\nEmail : contact@dangoimport.com\nWhatsApp : +229 01 58 26 63 42 / +229 01 59 38 71 80\nAdresse : Abomey‑Calavi / Cotonou, Bénin`
  }
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