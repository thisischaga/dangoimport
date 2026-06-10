import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaChevronRight, FaArrowUp, FaGavel } from "react-icons/fa";

const SECTIONS = [
  {
    id: "edition",
    title: "1. ÉDITION DU SITE",
    content: `Le site internet dangoimport.com est édité par :\nDANGO HUB Entreprise Individuelle\nReprésentée par : Ayatoulaye Dango Nadey\nSiège social : Îlot : CSB, AGONKANMEY, ABOMEY- CALAVI, GODOMEY, République du Bénin\nTéléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80\nEmail : contact@dangoimport.com\nNuméro d’identification RCCM : RB/ABC/26 A 140935\nNuméro IFU : 0202350716611`
  },
  {
    id: "hebergement",
    title: "2. HÉBERGEMENT",
    content: `Hébergement du Frontend (Site Web) :\n• Vercel Inc. (hébergement principal et déploiement)\n• Hostinger (domaine)\nHébergement du Backend et Base de Données :\n• MongoDB Atlas (base de données cloud)\n• Render.com (Serveur de secours/backend)`
  },
  {
    id: "activite",
    title: "3. ACTIVITÉ",
    content: `Dango Import est une marketplace en ligne permettant la mise en relation entre acheteurs et vendeurs partenaires, ainsi qu’un service d’accompagnement à l’importation de produits depuis la Chine.\nDango HUB agit en qualité d’intermédiaire et n’est pas le vendeur des produits proposés par les vendeurs partenaires.`
  },
  {
    id: "propriete",
    title: "4. PROPRIÉTÉ INTELLECTUELLE",
    content: `L’ensemble du site (structure, design, logos, textes, images, vidéos, charte graphique, etc.) est la propriété exclusive de Dango HUB. Toute reproduction, représentation, modification, publication, adaptation ou exploitation, totale ou partielle, des éléments du site, par quelque procédé et sur quelque support que ce soit, sans autorisation préalable et écrite de Dango HUB, est strictement interdite.`
  },
  {
    id: "responsabilite",
    title: "5. LIMITATION DE RESPONSABILITÉ",
    content: `Dango HUB ne saurait être tenue responsable :\n• Des produits vendus par les vendeurs partenaires (qualité, conformité, sécurité) ;\n• Des dommages directs ou indirects résultant de l’utilisation du site ;\n• Des interruptions de service dues à des cas de force majeure, pannes techniques, maintenance ou mises à jour ;\n• Des contenus publiés par les utilisateurs ou vendeurs.\nLes informations et contenus présents sur le site sont fournis à titre indicatif. Dango HUB ne garantit pas leur exactitude complète et se réserve le droit de les modifier à tout moment.`
  },
  {
    id: "liens",
    title: "6. LIENS HYPERTEXTES",
    content: `La mise en place de liens hypertextes vers le site dangoimport.com est autorisée avec accord préalable de Dango HUB. Dango HUB décline toute responsabilité quant aux contenus des sites externes vers lesquels des liens sont présents sur son site.`
  },
  {
    id: "donnees",
    title: "7. DONNÉES PERSONNELLES",
    content: `Le traitement des données personnelles est régi par notre Politique de Confidentialité, disponible sur le site.`
  },
  {
    id: "droit",
    title: "8. DROIT APPLICABLE",
    content: `Les présentes mentions légales sont régies par le droit en vigueur en République du Bénin. Tout litige relatif à l’utilisation du site sera soumis à la compétence exclusive des tribunaux de Cotonou.`
  },
  {
    id: "contact",
    title: "9. CONTACT",
    content: `Dango HUB\nEmail : contact@dangoimport.com\nWhatsApp / Téléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80`
  }
];

export default function MentionsLegales() {
  const [active, setActive] = useState("edition");
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
          <div className="w-16 h-16 bg-[#ffdc2b]/10 border border-[#ffdc2b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaGavel className="text-[#ffdc2b] text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Mentions Légales – Dango Hub</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">21 mai 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Sommaire</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    active === s.id ? "bg-[#fff0a0] text-gray-900 shadow-md shadow-[#fff0a0]/40 border border-[#f5dc7a]" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <FaChevronRight size={8} className="shrink-0" />
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>
        <article className="flex-1 min-w-0 space-y-10">
          <div className="bg-[#fffbeb] border border-[#fffbeb] rounded-2xl p-6">
            <p className="text-sm text-[#2d3748] leading-relaxed font-medium">
              <strong>Mentions légales de Dango HUB</strong> – Toutes les informations obligatoires concernant la société, l’hébergement, les responsabilités et les contacts.
            </p>
          </div>
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-32" onMouseEnter={() => setActive(s.id)}>
              <h2 className="text-xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">{s.title}</h2>
              {s.content.split("\n").map((line, i) => (
                line.trim() === "" ? <div key={i} className="h-2" /> :
                line.startsWith("•") ? (
                  <p key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed mb-1">
                    <span className="text-[#e6c600] mt-1 shrink-0">•</span>{line.slice(1).trim()}
                  </p>
                ) : (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{line}</p>
                )
              ))}
            </section>
          ))}
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
