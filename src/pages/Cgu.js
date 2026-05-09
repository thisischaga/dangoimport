import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: "objet",
    title: "1. Objet des CGU",
    content: `Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site internet de Dango Import, accessible à l'adresse www.dangoimport.com, ainsi que les services proposés via cette plateforme.\n\nEn accédant au site et en utilisant nos services, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre site.`,
  },
  {
    id: "services",
    title: "2. Services proposés",
    content: `Dango Import propose les services suivants :\n\n• Une vitrine de produits importés directement de Chine (montres, chaussures, accessoires, produits de beauté, électronique, etc.).\n• Un service de sourcing personnalisé : localisation de fournisseurs chinois selon les besoins des clients.\n• Un service de commande groupée et de logistique (transport maritime ou aérien) à destination de l'Afrique de l'Ouest.\n• Un service de conseil en importation pour les grossistes et revendeurs.\n\nNos services sont destinés à des acheteurs professionnels (grossistes, revendeurs) et particuliers résidant principalement en Afrique de l'Ouest.`,
  },
  {
    id: "compte",
    title: "3. Création de compte",
    content: `Pour accéder à certaines fonctionnalités du site (suivi de commande, historique d'achats, etc.), vous devrez créer un compte utilisateur.\n\nLors de la création de votre compte, vous vous engagez à :\n• Fournir des informations exactes, complètes et à jour.\n• Maintenir la confidentialité de vos identifiants de connexion.\n• Informer immédiatement Dango Import de toute utilisation non autorisée de votre compte.\n\nDango Import se réserve le droit de suspendre ou de supprimer tout compte en cas de violation des présentes CGU ou d'activité suspecte.`,
  },
  {
    id: "commandes",
    title: "4. Commandes et paiements",
    content: `Toute commande passée sur le site constitue un engagement d'achat ferme et définitif.\n\n4.1 Processus de commande\nLe client choisit le(s) produit(s), renseigne ses informations de livraison, confirme sa commande et procède au paiement. Un email de confirmation est envoyé après validation.\n\n4.2 Prix\nLes prix affichés sont en Francs CFA (FCFA) et incluent les frais de base. Les frais de livraison sont indiqués séparément avant la validation finale.\n\n4.3 Paiement\nLe paiement est sécurisé. Les fonds sont conservés jusqu'à la réception et validation de la marchandise par le client. En cas de litige, les fonds sont retenus jusqu'à résolution.`,
  },
  {
    id: "livraison",
    title: "5. Livraison",
    content: `5.1 Délais\nLes délais de livraison varient selon le mode de transport choisi :\n• Maritime : 30 à 45 jours ouvrables.\n• Aérien : 7 à 15 jours ouvrables.\n\n5.2 Suivi\nUn numéro de suivi est communiqué au client une fois la marchandise expédiée depuis la Chine.\n\n5.3 Réception\nLe client est responsable de s'assurer de la présence d'une personne autorisée lors de la livraison. Toute anomalie (colis endommagé, manquant) doit être signalée dans les 48h suivant la réception.`,
  },
  {
    id: "retours",
    title: "6. Retours et réclamations",
    content: `En raison de la nature internationale de nos importations, les retours de marchandises vers la Chine sont généralement impossibles. Toutefois, en cas de produit non conforme, défectueux ou endommagé à la livraison :\n\n• Le client dispose de 48 heures pour signaler le problème avec photos à l'appui.\n• Dango Import s'engage à proposer une solution (remplacement, avoir, remboursement partiel) dans un délai de 5 jours ouvrables.\n• Aucune réclamation ne sera acceptée après ce délai.`,
  },
  {
    id: "propriete",
    title: "7. Propriété intellectuelle",
    content: `L'ensemble des contenus présents sur le site (textes, images, logos, vidéos, graphismes) sont la propriété exclusive de Dango Import ou de ses partenaires et sont protégés par le droit de la propriété intellectuelle.\n\nToute reproduction, représentation, modification, publication, transmission ou dénaturation, totale ou partielle, du site ou de son contenu, par quelque procédé que ce soit, et sur quelque support que ce soit, est interdite sans l'autorisation préalable et écrite de Dango Import.`,
  },
  {
    id: "responsabilite",
    title: "8. Limitation de responsabilité",
    content: `Dango Import met tout en œuvre pour assurer la disponibilité et la fiabilité de ses services. Toutefois, la société ne saurait être tenue responsable :\n\n• Des interruptions temporaires du site pour maintenance.\n• Des retards de livraison causés par des événements indépendants de notre volonté (grèves, douanes, catastrophes naturelles).\n• Des erreurs dans les informations fournies par les fournisseurs tiers.\n• De l'utilisation frauduleuse de vos données personnelles si vous avez manqué à vos obligations de sécurité.`,
  },
  {
    id: "modification",
    title: "9. Modification des CGU",
    content: `Dango Import se réserve le droit de modifier les présentes CGU à tout moment. Les modifications prennent effet dès leur publication sur le site. Il vous appartient de consulter régulièrement cette page.\n\nVotre utilisation continue du site après toute modification constitue votre acceptation des nouvelles conditions.`,
  },
  {
    id: "droit",
    title: "10. Droit applicable et litiges",
    content: `Les présentes CGU sont soumises au droit béninois. En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, tout litige sera soumis à la compétence exclusive des tribunaux du Bénin.`,
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