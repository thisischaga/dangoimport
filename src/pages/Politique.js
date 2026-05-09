import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaShieldAlt, FaChevronRight, FaArrowUp, FaLock } from "react-icons/fa";

const SECTIONS = [
  {
    id: "intro",
    title: "1. Introduction",
    content: `Dango Import (ci-après « nous », « notre » ou « la société ») attache une grande importance à la protection de vos données personnelles. Cette Politique de Confidentialité décrit comment nous collectons, utilisons, stockons et protégeons vos informations lorsque vous utilisez notre site www.dangoimport.com.\n\nEn utilisant nos services, vous consentez à la collecte et à l'utilisation de vos données conformément à la présente politique.`,
  },
  {
    id: "collecte",
    title: "2. Données collectées",
    content: `Nous collectons les types de données suivants :\n\n2.1 Données fournies directement par vous\n• Informations d'identification : prénom, nom, adresse email, numéro de téléphone.\n• Informations de commande : adresse de livraison, produits commandés, quantités.\n• Communications : messages envoyés via notre formulaire de contact ou notre service client.\n\n2.2 Données collectées automatiquement\n• Données de navigation : adresse IP, type de navigateur, pages visitées, durée de visite.\n• Cookies et technologies similaires : pour améliorer votre expérience sur le site.\n\n2.3 Données de tiers\nNous pouvons recevoir des données vous concernant de la part de partenaires de paiement ou de services de vérification d'identité.`,
  },
  {
    id: "utilisation",
    title: "3. Utilisation des données",
    content: `Nous utilisons vos données personnelles aux fins suivantes :\n\n• Traitement et suivi de vos commandes.\n• Communication sur l'avancement de vos livraisons.\n• Amélioration de nos services et de l'expérience utilisateur.\n• Envoi de newsletters et offres promotionnelles (avec votre consentement).\n• Détection et prévention des fraudes.\n• Respect de nos obligations légales et réglementaires.\n• Réponse à vos demandes d'assistance et réclamations.`,
  },
  {
    id: "partage",
    title: "4. Partage des données",
    content: `Dango Import ne vend, ne loue et ne cède pas vos données personnelles à des tiers à des fins commerciales. Vos données peuvent cependant être partagées avec :\n\n• Nos partenaires logistiques (transporteurs, transitaires) pour l'exécution des commandes.\n• Nos prestataires techniques (hébergement, emailing) qui agissent en tant que sous-traitants.\n• Les autorités compétentes en cas d'obligation légale ou de réquisition judiciaire.\n\nTous nos partenaires sont soumis à des obligations de confidentialité strictes.`,
  },
  {
    id: "conservation",
    title: "5. Conservation des données",
    content: `Vos données personnelles sont conservées pour la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées :\n\n• Données de compte : conservées jusqu'à la suppression de votre compte + 1 an.\n• Données de commande : conservées 5 ans conformément aux obligations comptables.\n• Données de navigation : conservées 13 mois maximum.\n• Données de newsletter : conservées jusqu'à votre désinscription.\n\nPassé ces délais, vos données sont supprimées ou anonymisées.`,
  },
  {
    id: "droits",
    title: "6. Vos droits",
    content: `Conformément à la réglementation applicable en matière de protection des données, vous disposez des droits suivants :\n\n• Droit d'accès : obtenir une copie de vos données personnelles.\n• Droit de rectification : corriger des données inexactes ou incomplètes.\n• Droit à l'effacement : demander la suppression de vos données.\n• Droit d'opposition : vous opposer au traitement de vos données à des fins de prospection.\n• Droit à la portabilité : recevoir vos données dans un format structuré.\n• Droit de retrait du consentement : à tout moment pour les traitements basés sur votre consentement.\n\nPour exercer ces droits, contactez-nous à : privacy@dangoimport.com`,
  },
  {
    id: "cookies",
    title: "7. Politique de cookies",
    content: `Notre site utilise des cookies pour améliorer votre expérience de navigation.\n\n7.1 Types de cookies utilisés\n• Cookies essentiels : nécessaires au fonctionnement du site (authentification, panier).\n• Cookies analytiques : mesure d'audience pour améliorer nos contenus (Google Analytics).\n• Cookies de personnalisation : mémorisation de vos préférences.\n\n7.2 Gestion des cookies\nVous pouvez à tout moment modifier vos préférences en matière de cookies via les paramètres de votre navigateur. Le refus de certains cookies peut affecter votre expérience sur le site.`,
  },
  {
    id: "securite",
    title: "8. Sécurité des données",
    content: `Dango Import met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, modification, divulgation ou destruction :\n\n• Chiffrement SSL/TLS de toutes les communications.\n• Accès restreint aux données personnelles au personnel autorisé uniquement.\n• Surveillance régulière de nos systèmes pour détecter les vulnérabilités.\n• Mots de passe hashés et stockés de manière sécurisée.\n\nEn cas de violation de données susceptible d'affecter vos droits, nous nous engageons à vous notifier dans les meilleurs délais.`,
  },
  {
    id: "modification",
    title: "9. Modification de la politique",
    content: `Nous nous réservons le droit de modifier la présente Politique de Confidentialité à tout moment. La date de dernière mise à jour est indiquée en haut de cette page.\n\nNous vous encourageons à consulter régulièrement cette page. En cas de modification substantielle, nous vous en informerons par email ou par une notification visible sur le site.`,
  },
  {
    id: "contact",
    title: "10. Nous contacter",
    content: `Pour toute question relative à la présente Politique de Confidentialité ou à l'exercice de vos droits, vous pouvez nous contacter :\n\n• Par email : privacy@dangoimport.com\n• Par courrier : Dango Import Group, Cotonou, République du Bénin\n• Via notre formulaire de contact disponible sur le site\n\nNous nous engageons à répondre à toute demande dans un délai de 30 jours.`,
  },
];

export default function Politique() {
  const [active, setActive] = useState("intro");
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
            Dernière mise à jour : <span className="text-blue-400 font-bold">1er mai 2026</span>
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