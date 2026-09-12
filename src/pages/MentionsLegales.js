import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaChevronRight, FaArrowUp, FaGavel } from "react-icons/fa";

const SECTIONS = [
  {
    id: "edition",
    title: "1. ÉDITION DU SITE",
    content: `ARTICLE 1 : ÉDITEUR DU SITE ET EXPLOITANT\n\nLes sites internet accessibles aux adresses suivantes :\n• Site Institutionnel : https://site.dangoimport.com\n• Marketplace Clients : https://dangoimport.com\n• Espace Business / Vendeurs : https://business.dangoimport.com\n\nsont édités et exploités par l'entreprise individuelle (Établissement) DANGO HUB, opérant sous le nom commercial Dango Import.\n\n• Forme juridique : Entreprise Individuelle (Établissement)\n• Siège social : Îlot : CSB, Parcelle n° CSB, Maison : Sahidou DANGO NADEY, Atlantique, Abomey-Calavi, Godomey, Agonkanmey – Bénin\n• Numéro RCCM : RB/ABC/26 A 140935\n• Numéro IFU : 0202350716611\n• Directeur de la Publication : Ayatoulaye DANGO NADEY\n• Contact Support Client : contact@dangoimport.com\n• Contact Protection des Données (DPO) : privacy@dangoimport.com`
  },
  {
    id: "hebergement",
    title: "2. HÉBERGEMENT",
    content: `ARTICLE 2 : HÉBERGEMENT DES SITES ET INFRASTRUCTURE TECHNIQUE\n\nL’infrastructure technique de la plateforme est hébergée par des prestataires garantissant la sécurité et la haute disponibilité des services :\n\n2.1 Hébergement du Frontend (Interface Utilisateur & Site Web)\n• Hébergeur Principal et Déploiement : Vercel Inc. 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — https://vercel.com\n• Serveur de Secours / Backup : Hostinger International Ltd. 61 Lordou Vironos Street, 6023 Larnaca, Chypre — https://hostinger.com\n\n2.2 Hébergement du Backend et Base de Données Cloud\n• Base de données et Services applicatifs : MongoDB Atlas (MongoDB, Inc.) 1633 Broadway, 38th Floor, New York, NY 10019, États-Unis — https://www.mongodb.com/cloud/atlas` 
  },
  {
    id: "activite",
    title: "3. ACTIVITÉ",
    content: `Dangoimport est une marketplace en ligne permettant la mise en relation entre acheteurs et vendeurs partenaires, ainsi qu’un service d’accompagnement à l’importation de produits depuis la Chine.\nDango HUB agit en qualité d’intermédiaire et n’est pas le vendeur des produits proposés par les vendeurs partenaires.`
  },
  {
    id: "propriete",
    title: "4. PROPRIÉTÉ INTELLECTUELLE",
    content: `ARTICLE 3 : PROPRIÉTÉ INTELLECTUELLE\n\n1. Signes Distinctifs et Marques : La dénomination sociale DANGO HUB, le nom commercial Dango Import, ainsi que les logos, chartes graphiques, slogans, visuels et éléments d'interface présents sur l'ensemble des sous-domaines de dangoimport.com sont la propriété exclusive de l'entreprise DANGO HUB ou font l'objet d'un droit d'utilisation concédé par ses partenaires/vendeurs.\n\n2. Droits d'Auteur : Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments des sites, quel que soit le moyen ou le procédé utilisé, est strictement interdite sans l'autorisation écrite préalable du Directeur de la publication (Ayatoulaye DANGO NADEY).\n\n3. Produits des Vendeurs Tiers : Les marques, logos et visuels de produits mis en ligne par les vendeurs partenaires restent la propriété exclusive de leurs titulaires respectifs.`
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
    content: `ARTICLE 4 : PROTECTION DES DONNÉES PERSONNELLES ET COOKIES\n\nConformément au Livre V du Code du Numérique en République du Bénin (Loi n° 201720) et aux standards internationaux du RGPD, l'entreprise DANGO HUB a mis en place une politique rigoureuse de traitement et de protection des données personnelles. Pour en savoir plus sur la collecte, la conservation et l'exercice de vos droits d'accès, de rectification ou de suppression des données, veuillez consulter notre Politique de Confidentialité accessible sur les sites du groupe.`
  },
  {
    id: "droit",
    title: "8. DROIT APPLICABLE",
    content: `ARTICLE 5 : RÈGLEMENT DES LITIGES ET JURIDICTION COMPÉTENTE\n\nLes présentes mentions légales sont régies par le droit béninois. En cas de litige relatif à l'utilisation de la plateforme ou aux services fournis par l'éditeur, et à défaut de résolution amiable via la procédure de médiation interne de DANGO HUB, les Tribunaux compétents de Cotonou ou d'Abomey-Calavi (République du Bénin) seront seuls compétents.`
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


      <article className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="bg-[#fffbeb] border-l-4 border-[#ffdc2b] p-6 rounded-r-2xl">
          <p className="text-sm text-[#2d3748] leading-relaxed font-medium">
            <strong>Mentions légales de Dango HUB</strong> – Toutes les informations obligatoires concernant la société, l’hébergement, les responsabilités et les contacts.
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">21 mai 2026</span>
          </p>
        </div>
        
        <div className="prose-container space-y-8">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-5">{s.title}</h2>
              <div className="space-y-4">
                {s.content.split("\n").map((line, i) => {
                  if (line.trim() === "") return null;
                  if (line.startsWith("•")) {
                    return (
                      <p key={i} className="flex items-start gap-3 text-gray-700 text-base leading-relaxed pl-4">
                        <span className="text-[#e6c600] mt-1 shrink-0 text-lg">•</span>
                        <span>{line.slice(1).trim()}</span>
                      </p>
                    );
                  }
                  return <p key={i} className="text-gray-700 text-base leading-relaxed">{line}</p>;
                })}
              </div>
            </section>
          ))}
        </div>
      </article>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#ffdc2b] hover:text-gray-900 transition-colors"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}
