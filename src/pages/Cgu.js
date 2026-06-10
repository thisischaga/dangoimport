import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp, FaBalanceScale } from "react-icons/fa";

const SECTIONS = [
  {
    id: "preambule",
    title: "PRÉAMBULE",
    content: `Les présentes Conditions Générales d'Utilisation (ci-après « CGU ») régissent l'accès, la navigation et l'utilisation du site internet www.dangoimport.com, ainsi que l'ensemble des services proposés par Dango HUB.\nEn accédant au site, en créant un compte ou en passant commande, vous reconnaissez avoir lu, compris et accepté sans réserve les présentes CGU. Si vous n'acceptez pas ces conditions, nous vous prions de ne pas utiliser la plateforme.\nDango HUB agit exclusivement en tant qu'intermédiaire entre les acheteurs et les vendeurs partenaires. La plateforme ne vend pas directement les produits sauf mention expresse.`,
  },
  {
    id: "objet",
    title: "1. OBJET",
    content: `Les présentes CGU ont pour objet de définir :\n• Les conditions d'accès et d'utilisation de la plateforme Dango Import ;\n• Les règles applicables aux commandes, paiements, livraisons et retours ;\n• Les droits et obligations des utilisateurs (clients) ;\n• Les limitations de responsabilité de Dango HUB.`,
  },
  {
    id: "definitions",
    title: "2. DÉFINITIONS",
    content: `• Dango HUB : Structure juridique exploitant la plateforme.\n• Dango Import : Marketplace en ligne.\n• Utilisateur / Client : Toute personne physique ou morale accédant au site ou passant commande.\n• Vendeur Partenaire : Tiers indépendant qui propose des produits sur la marketplace.\n• Plateforme : Le site www.dangoimport.com et l'ensemble des services associés.`,
  },
  {
    id: "services",
    title: "3. NATURE DES SERVICES",
    content: `Dango Import est une marketplace qui permet aux clients d'acheter des produits proposés par des vendeurs partenaires locaux (Bénin et Togo).\nUn service complémentaire d'accompagnement à l'importation depuis la Chine est également proposé.`,
  },
  {
    id: "acces",
    title: "4. ACCÈS ET COMPTE UTILISATEUR",
    content: `L'accès à la plateforme est gratuit et ouvert à toute personne âgée d'au moins 18 ans. Certaines fonctionnalités nécessitent la création d'un compte.\nVous êtes entièrement responsable de la confidentialité de vos identifiants de connexion et de toutes les actions réalisées sous votre compte. Dango HUB se réserve le droit de suspendre ou supprimer un compte en cas d'usage frauduleux, d'informations fausses ou de violation des CGU.`,
  },
  {
    id: "commandes",
    title: "5. COMMANDES",
    content: `Toute commande passée sur la plateforme est ferme et définitive une fois confirmée par le client. Dango Import se réserve le droit d'annuler une commande en cas d'indisponibilité du produit, d'erreur de prix ou de suspicion de fraude.`,
  },
  {
    id: "prix",
    title: "6. PRIX ET PAIEMENT",
    content: `Les prix affichés sur le site sont les prix de vente de la marchandise (TTC). Ils ne comprennent pas les frais prélevés par le prestataire de paiement.\nLors de la validation de votre commande, des frais de transaction seront ajoutés. Ces frais correspondent aux commissions prélevées par le prestataire de paiement (FedaPay ou tout autre prestataire utilisé) :\n• Environ 1,8% à 2% pour les paiements Mobile Money (MTN, Moov/Flooz)\n• Jusqu'à 4% pour les paiements par carte bancaire\n\nCes frais sont clairement indiqués avant la confirmation finale de la commande et sont à la charge du client.\nLes moyens de paiement acceptés sont :\n• Mobile Money (MTN, Moov/Flooz)\n• Cash on Delivery (paiement à la livraison)\n• Paiement bancaire`,
  },
  {
    id: "livraison",
    title: "7. LIVRAISON",
    content: `Les délais de livraison sont indiqués sur chaque fiche produit. Ils varient selon la destination :\n• Même jour pour Cotonou et Abomey-Calavi\n• Sous 24 heures dans le reste du Bénin\n• Sous 48 heures au Togo\n\nLe client est responsable de fournir une adresse complète et exacte. En cas d'absence répétée, des frais supplémentaires de livraison pourront être appliqués.`,
  },
  {
    id: "retours",
    title: "8. RETOURS ET REMBOURSEMENTS",
    html: true,
    content: `Les retours sont régis par la <a href="/politique-de-retour" style="color:#2563EB;font-weight:600;">Politique de Retour et de Remboursement</a> disponible sur le site. Vous disposez d'un délai de 7 jours calendaires à compter de la réception pour formuler une réclamation.`,
  },
  {
    id: "responsabilite",
    title: "9. RESPONSABILITÉ",
    content: `Dango HUB, en tant qu'intermédiaire, ne saurait être tenue responsable de :\n• La qualité, la conformité, la sécurité ou la légalité des produits vendus par les Vendeurs Partenaires ;\n• Les retards de livraison imputables aux prestataires logistiques ;\n• Les dommages résultant d'une mauvaise utilisation des produits par le client.`,
  },
  {
    id: "propriete",
    title: "10. PROPRIÉTÉ INTELLECTUELLE",
    content: `Tous les éléments du site (logos, textes, images, design, etc.) sont la propriété exclusive de Dango HUB. Toute reproduction ou utilisation non autorisée est interdite.`,
  },
  {
    id: "donnees",
    title: "11. DONNÉES PERSONNELLES",
    content: `Le traitement de vos données est effectué conformément à notre Politique de Confidentialité, accessible sur le site.`,
  },
  {
    id: "modification",
    title: "12. MODIFICATION DES CGU",
    content: `Dango HUB se réserve le droit de modifier les présentes CGU à tout moment. La version publiée sur le site fait foi.`,
  },
  {
    id: "droit",
    title: "13. DROIT APPLICABLE ET LITIGES",
    content: `Les présentes CGU sont régies par le droit de la République du Bénin. Tout litige sera soumis aux tribunaux compétents de Cotonou.`,
  },
  {
    id: "contact",
    title: "14. CONTACT",
    content: `Dango HUB\nEmail : contact@dangoimport.com\nWhatsApp : +229 01 58 26 63 42 / +229 01 59 38 71 80\nAdresse : Abomey-Calavi, Bénin`,
  },
];

export default function Cgu() {
  const [active, setActive] = useState("preambule");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = "Conditions Générales d'Utilisation – Dango Import";
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
          <div className="w-16 h-16 bg-[#ffdc2b]/10 border border-[#ffdc2b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaFileContract className="text-[#ffdc2b] text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Conditions Générales d'Utilisation</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">21 mai 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FaBalanceScale className="text-[#e6c600] text-xs" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sommaire</p>
            </div>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    active === s.id
                      ? "bg-[#fff0a0] text-gray-900 shadow-md shadow-[#fff0a0]/40 border border-[#f5dc7a]"
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
          <div className="bg-[#fffbeb] border border-[#ffdc2b]/25 rounded-2xl p-6">
            <p className="text-sm text-[#2d3748] leading-relaxed font-medium">
              <strong>Important :</strong> En utilisant la plateforme Dango Import, vous acceptez les présentes CGU dans leur intégralité. Nous vous encourageons à les lire attentivement. Pour toute question, contactez-nous à{" "}
              <a href="mailto:contact@dangoimport.com" className="underline font-bold text-[#2d3748]">contact@dangoimport.com</a>.
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
              {s.html ? (
                <p className="text-gray-600 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: s.content }} />
              ) : (
                s.content.split("\n").map((line, i) =>
                  line.trim() === "" ? <div key={i} className="h-2" /> :
                  line.startsWith("•") ? (
                    <p key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed mb-1">
                      <span className="text-[#e6c600] mt-1 shrink-0">•</span>
                      {line.slice(1).trim()}
                    </p>
                  ) : line.match(/^\d+\.\d+/) ? (
                    <p key={i} className="text-gray-900 font-black text-sm mt-4 mb-1">{line}</p>
                  ) : (
                    <p key={i} className="text-gray-600 text-sm leading-relaxed">{line}</p>
                  )
                )
              )}
            </section>
          ))}

          <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center">
            <p className="text-gray-400 text-xs">
              Voir aussi nos{" "}
              <Link to="/cgu-vendeurs" className="text-[#e6c600] font-bold underline">CGU Vendeurs</Link>
              {" "}et notre{" "}
              <Link to="/politique-de-confidentialite" className="text-[#e6c600] font-bold underline">Politique de Confidentialité</Link>
              {" "}— © 2026 Dango Import Group. Tous droits réservés.
            </p>
          </div>
        </article>
      </div>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 btn-brand rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}