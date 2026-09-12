import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: 'article1',
    title: 'ARTICLE 1 : RESPONSABLE DU TRAITEMENT ET CONTACT DPO',
    content: `Le responsable du traitement des données à caractère personnel est l’établissement DANGO HUB (exploitant le nom commercial Dango Import), entreprise immatriculée au Bénin, dont le siège social est situé à Abomey-Calavi, Bénin. Pour toute question relative à la protection de vos données ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :\n\n• Adresse e-mail dédiée : contact@dangoimport.com, privacy@dangoimport.com\n• Courrier postal : DANGO HUB - Service Protection des Données, Cotonou, Bénin.`
  },
  {
    id: 'article2',
    title: 'ARTICLE 2 : DONNÉES PERSONNELLES COLLECTÉES',
    content: `DANGO HUB collecte des données personnelles auprès des Acheteurs (Clients) et des Vendeurs (Partenaires commerciaux).\n\n• Données collectées auprès des Acheteurs (dangoimport.com) :\n  - Identité et coordonnées : Nom, prénom, adresse e-mail, numéro de téléphone, adresse exacte de livraison (ville, quartier, indications géographiques).\n  - Données de transaction : Historique des commandes, détails des achats, choix du mode de paiement, suivi des livraisons.\n  - Données techniques et de navigation : Adresse IP, identifiants d'appareils, données de connexion, type de navigateur, cookies.\n\n• Données collectées auprès des Vendeurs (business.dangoimport.com) :\n  - Identification professionnelle (KYC) : Nom, prénom du représentant, pièce d'identité officielle, extrait RCCM, numéro IFU, nom commercial de la boutique.\n  - Coordonnées bancaires et financières : Numéro de compte Mobile Money (MTN, Moov, TMoney, Flooz) ou Relevé d'Identité Bancaire (RIB) pour le reversement des ventes.\n  - Données d'exploitation : Historique des produits ajoutés, volume des ventes, commissions prélevées et solde du compte.`,
  },
  {
    id: 'article3',
    title: 'ARTICLE 3 : FINALITÉS ET BASES LÉGALES DU TRAITEMENT',
    isTable: true,
    table: {
      headers: ['Finalité du traitement', "Catégorie d'utilisateurs", 'Base légale (RGPD / Code du Numérique)'],
      rows: [
        ['Gestion des commandes, paiements et livraisons', 'Acheteurs', 'Exécution du contrat de vente'],
        ['Gestion et vérification des comptes Vendeurs (KYC)', 'Vendeurs', 'Exécution du contrat de service & Obligation légale'],
        ['Reversement des fonds et facturation des commissions', 'Vendeurs', 'Exécution du contrat & Obligation comptable/légale'],
        ['Service client, réclamations et médiation des litiges', 'Acheteurs & Vendeurs', 'Exécution du contrat & Intérêt légitime'],
        ["Envoi d'offres promotionnelles et newsletters", 'Acheteurs & Vendeurs', 'Consentement (Opt-in) ou Intérêt légitime'],
        ['Sécurité du site, prévention de la fraude et contrefaçon', 'Tous', 'Intérêt légitime & Obligation légale']
      ]
    }
  },
  {
    id: 'article4',
    title: 'ARTICLE 4 : DESTINATAIRES ET PARTAGE DES DONNÉES',
    content: `DANGO HUB ne vend ni ne loue vos données personnelles. Les données sont strictement partagées avec les destinataires suivants dans le cadre strict de l'exécution des services :\n\n• Vendeurs Tiers : Les données de livraison (nom, téléphone, adresse) sont transmises au Vendeur concerné uniquement pour la préparation de la commande.\n• Prestataires Logistiques et Livreurs : Transmissions des informations de contact pour l'acheminement des colis au Bénin, au Togo et dans la sous-région.\n• Partenaires de Paiement Sécurisé : Les passerelles de paiement Mobile Money et bancaires partenaires (ex: FedaPay, KKiaPay, etc.) pour le traitement des transactions.\n• Autorités Publiques : Sur réquisition judiciaire ou légale (APDP, administrations fiscales, forces de l'ordre).`,
  },
  {
    id: 'article5',
    title: 'ARTICLE 5 : TRANSFERTS TRANSFRONTALIERS DE DONNÉES',
    content: `Dans le cadre des activités de DANGO HUB entre le Bénin, le Togo et d'autres pays de la sous-région :\n\n• Les transferts de données au sein de la zone CEDEAO/OHADA sont sécurisés et encadrés par des conventions de traitement conformes aux exigences de l'APDP.\n• En cas de recours à des sous-traitants techniques (hébergement cloud, services e-mail) situés en dehors de l'Espace Économique Européen (EEE) ou de la sous-région, DANGO HUB s'assure qu'ils appliquent des Clauses Contractuelles Types (CCT) validées par la Commission Européenne et conformes aux directives du RGPD.`,
  },
  {
    id: 'article6',
    title: 'ARTICLE 6 : DURÉE DE CONSERVATION DES DONNÉES',
    content: `DANGO HUB conserve vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :\n\n• Données de compte client/vendeur : Conservées pendant toute la durée de vie du compte, puis archivées pendant 3 ans à compter de la dernière activité.\n• Données de transaction et facturation : Conservées pendant 10 ans conformément aux obligations légales, fiscales et comptables en vigueur (Code de commerce / OHADA).\n• Données de prospection commerciale : Conservées pendant 3 ans à compter du dernier contact avec l'utilisateur.`,
  },
  {
    id: 'article7',
    title: 'ARTICLE 7 : VOS DROITS (RGPD & APDP BÉNIN)',
    content: `Conformément à la réglementation applicable (RGPD et Livre V du Code du Numérique), vous disposez des droits suivants sur vos données :\n\n• Droit d'accès : Obtenir la confirmation que vos données sont traitées et en recevoir une copie.\n• Droit de rectification : Demander la correction de données inexactes ou incomplètes.\n• Droit à l'effacement ("Droit à l'oubli") : Demander la suppression de vos données lorsqu'elles ne sont plus nécessaires.\n• Droit à la limitation du traitement : Demander le gel temporaire du traitement de vos données dans certains cas.\n• Droit à la portabilité : Recevoir vos données dans un format structuré, couramment utilisé et lisible par machine.\n• Droit d'opposition : S'opposer à tout moment au traitement de vos données à des fins de prospection commerciale.\n• Droit de retirer votre consentement : Pour tous les traitements basés sur le consentement (ex: newsletters).\n\nComment exercer vos droits ? Envoyez votre demande accompagnée d'une copie d'une pièce d'identité à l'adresse: privacy@dangoimport.com\n\nUne réponse vous sera apportée sous un délai maximum d'un (01) mois. Si vous estimez que vos droits ne sont pas respectés, vous avez le droit de porter réclamation auprès de l’APDP (Autorité de Protection des Données à Caractère Personnel du Bénin) ou de l'autorité de protection des données de votre pays de résidence.`,
  },
  {
    id: 'article8',
    title: 'ARTICLE 8 : SÉCURITÉ DES DONNÉES',
    content: `DANGO HUB met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la destruction, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé :\n\n• Protocoles de chiffrement SSL/TLS (HTTPS) sur l'ensemble des domaines (site, dangoimport, business).\n• Accès restreint aux données personnelles réservé au seul personnel habilité.\n• Audit et contrôle régulier des systèmes d'information.`,
  },
  {
    id: 'article9',
    title: 'ARTICLE 9 : POLITIQUE RELATIVE AUX COOKIES',
    content: `Lors de votre navigation sur les sites de DANGO HUB, des cookies sont déposés sur votre terminal :\n\n• Cookies strictement nécessaires : Indispensables au fonctionnement de la Marketplace (gestion du panier, session utilisateur).\n• Cookies d'analyse et de performance : Permettent de mesurer l'audience et l'utilisation du site pour en améliorer l'ergonomie.\n• Cookies publicitaires : Utilisés pour vous proposer des offres ciblées.\n\nVous pouvez configurer ou refuser le dépôt des cookies à tout moment via le bandeau de consentement affiché lors de votre première visite ou via les paramètres de votre navigateur web.`,
  }
];
export default function Politique() {
  const [active, setActive] = useState("article1");
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
            <strong>Votre vie privée compte.</strong> Dangoimport s'engage à protéger vos données personnelles avec le plus grand soin. Cette politique vous explique de manière transparente comment nous les utilisons.
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">Septembre 2026</span>
          </p>
        </div>

        <div className="prose-container space-y-8">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-5">{s.title}</h2>
              <div className="space-y-4">
                {s.isTable ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border border-gray-200 divide-y divide-gray-200 table-auto text-sm">
                      <thead className="bg-gray-50">
                        <tr>
                          {s.table.headers.map((h, hi) => (
                            <th key={hi} className="px-4 py-3 text-left text-xs font-semibold text-gray-700 border-b">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {s.table.rows.map((row, ri) => (
                          <tr key={ri} className={ri % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            {row.map((cell, ci) => (
                              <td key={ci} className="px-4 py-3 align-top text-gray-700 border-t">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  s.content.split("\n").map((line, i) => {
                    if (line.trim() === "") return null;
                    if (line.startsWith("-") || line.startsWith("•")) {
                      return (
                        <p key={i} className="flex items-start gap-3 text-gray-700 text-base leading-relaxed pl-4">
                          <span className="text-[#e6c600] mt-1 shrink-0 text-lg">•</span>
                          <span>{line.slice(1).trim()}</span>
                        </p>
                      );
                    }
                    return <p key={i} className="text-gray-700 text-base leading-relaxed">{line}</p>;
                  })
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center mt-12">
          <p className="text-gray-500 text-sm">
            Voir aussi nos{" "}
            <Link to="/cgu" className="text-[#e6c600] font-bold underline">Conditions Générales d'Utilisation</Link>
            {" "}— © 2026 Dangoimport Group. Tous droits réservés.
          </p>
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