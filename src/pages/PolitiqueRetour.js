import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import { FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: "champ",
    title: "1. CHAMP D'APPLICATION",
    content: `La présente Politique s’applique :\n• aux produits commercialisés sur la Marketplace locale Dangoimport (produits proposés par des vendeurs partenaires référencés au Bénin et au Togo) ;\n• aux services de livraison organisés ou coordonnés par Dangoimport ;\n• aux commandes spécifiques d’importation via le service Import Chine sur devis, sous réserve des dispositions particulières prévues à l’article 11 ci-dessous.`,
  },
  {
    id: "delai",
    title: "2. DÉLAI DE RÉCLAMATION ET DE DEMANDE DE RETOUR",
    content: `Toute demande de retour, de remboursement ou de réclamation relative à un produit livré doit être introduite dans un délai maximum de soixante-douze (72) heures suivant la confirmation de livraison.\n\nPassé ce délai :\n• la commande est réputée acceptée ;\n• le produit est considéré comme conforme ;\n• aucune réclamation ne pourra être garantie, sauf vice caché ou garantie spécifique du vendeur.\n\nLes demandes peuvent être adressées via l’espace client, par email, ou via le canal officiel WhatsApp de Dangoimport.`,
  },
  {
    id: "conditions",
    title: "3. CONDITIONS GÉNÉRALES D'ACCEPTATION D'UN RETOUR",
    content: `3.1 Produit défectueux\nLe produit présente un défaut de fabrication, un dysfonctionnement anormal, une casse imputable au transport ou un vice apparent constaté à réception.\n\n3.2 Produit non conforme\nLe produit livré ne correspond pas à la commande (mauvais article, mauvaise taille, mauvaise référence, caractéristiques substantielles différentes).\n\n3.3 Produit endommagé à la livraison\nLe colis ou son contenu a subi un dommage avant remise au client.`,
  },
  {
    id: "non-eligibles",
    title: "4. PRODUITS NON ÉLIGIBLES AU RETOUR",
    content: `Sauf disposition légale contraire, les produits suivants ne sont pas retournables :\n• produits alimentaires et périssables ;\n• cosmétiques et produits d’hygiène ouverts ;\n• sous-vêtements ;\n• produits commandés spécialement pour un client ;\n• produits ouverts, utilisés ou consommés au-delà d’un usage raisonnable de vérification ;\n• produits détériorés par le client ;\n• commandes d’importation sur devis validées (sauf cas exceptionnels).`,
  },
  {
    id: "frais",
    title: "5. FRAIS DE RETOUR",
    content: `5.1 Retour imputable au vendeur partenaire\nLorsque le retour résulte d’un défaut produit, d’une erreur de préparation ou d’une non-conformité, les frais de retour sont à la charge du vendeur partenaire concerné.\n\n5.2 Retour exceptionnel (Convenance commerciale)\nLorsqu’un retour est accepté à titre de geste commercial (hors défaut ou erreur), les frais de retour sont à la charge du client.`,
  },
  {
    id: "remboursement",
    title: "6. MODALITÉS DE REMBOURSEMENT",
    content: `6.1 Produit défectueux / erreur vendeur\nLe client bénéficie d’un remboursement comprenant le prix du produit et les frais de livraison.\n\n6.2 Commande non livrée\nEn cas de commande non livrée pour une raison imputable à Dangoimport ou au vendeur, le client bénéficie d’un remboursement intégral (100 %).\n\n6.3 Délais de remboursement\nAprès validation, les remboursements Mobile Money sont traités sous quelques jours ouvrés. Les remboursements bancaires dépendent des délais interbancaires.`,
  },
  {
    id: "echec-livraison",
    title: "7. LIVRAISON ÉCHOUÉE / CLIENT ABSENT",
    content: `En cas d’absence du client ou d’adresse incomplète, une première reprogrammation est gratuite. Toute tentative supplémentaire pourra être facturée au client selon la grille logistique applicable.`,
  },
  {
    id: "deterioration",
    title: "8. PRODUITS DÉTÉRIORÉS PAR LE CLIENT",
    content: `Aucun retour ni remboursement ne sera accepté lorsque le produit a été endommagé, cassé, modifié ou utilisé de manière excessive par le client.`,
  },
  {
    id: "procedure",
    title: "9. PROCÉDURE DE RETOUR",
    content: `• Contactez le service client via WhatsApp avec le numéro de commande + photos/vidéos explicites.\n• Attendez la validation de Dangoimport.\n• Retournez le produit dans son état d’origine (emballage compris).\n• Une fois le produit vérifié et accepté, le remboursement ou l’échange est traité.`
  },
  {
    id: "import",
    title: "10. CAS PARTICULIER – SERVICE IMPORT CHINE (SUR DEVIS)",
    content: `Les commandes réalisées via le service Import sur devis sont non annulables et non remboursables, sauf en cas de :\n• Défaut majeur ou vice caché\n• Non-conformité substantielle et manifeste\n• Fraude avérée\nLes acomptes versés pour le sourcing et les négociations restent acquis à Dangoimport.`
  },
  {
    id: "abus",
    title: "11. LUTTE CONTRE LES ABUS",
    content: `Dangoimport se réserve le droit de refuser toute demande abusive, frauduleuse ou répétée. En cas d’abus constaté, des mesures (refus de retour, suspension de compte) pourront être prises.`
  },
  {
    id: "role",
    title: "12. RÔLE DE Dangoimport",
    content: `Dangoimport agit en tant qu’intermédiaire et coordinateur. Elle facilite le traitement des retours tout en veillant à un équilibre équitable entre clients et vendeurs partenaires.`
  },
  {
    id: "modification",
    title: "13. MODIFICATION DE LA POLITIQUE",
    content: `Dangoimport se réserve le droit de modifier cette politique à tout moment. La version en vigueur est celle publiée sur le site.`
  },
  {
    id: "contact",
    title: "14. CONTACT",
    content: `• WhatsApp / Téléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80\n• Email : contact@dangoimport.com\n• Adresse : Abomey-Calavi, Bénin`
  },
];

export default function PolitiqueRetour() {
  const [active, setActive] = useState("champ");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">

      <article className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="bg-[#fffbeb] border-l-4 border-[#ffdc2b] p-6 rounded-r-2xl">
          <p className="text-sm text-[#2d3748] leading-relaxed font-medium">
            <strong>Important :</strong> Dangoimport place la satisfaction du client au cœur de ses priorités. Cette politique définit de manière claire les règles relatives aux retours, échanges et remboursements.
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">12 mai 2026</span>
          </p>
        </div>

        <div className="prose-container space-y-8">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-5">{s.title}</h2>
              <div className="space-y-4">
                {s.content.split("\n").map((line, i) => {
                  if (line.trim() === "") return null;
                  if (line.startsWith("•") || line.startsWith("-")) {
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
