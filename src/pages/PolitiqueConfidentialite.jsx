import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const SECTIONS = [
  {
    id: 'responsable',
    title: 'ARTICLE 1 : RESPONSABLE DU TRAITEMENT ET CONTACT DPO',
    html: false,
    content: `Le responsable du traitement des données à caractère personnel est l’établissement DANGO HUB (exploitant le nom commercial Dango Import), entreprise immatriculée au Bénin, dont le siège social est situé à Abomey-Calavi, Bénin. Pour toute question relative à la protection de vos données ou pour exercer vos droits, vous pouvez contacter notre Délégué à la Protection des Données (DPO) :\n\n• Adresse e-mail dédiée : contact@dangoimport.com, privacy@dangoimport.com\n• Courrier postal : DANGO HUB - Service Protection des Données, Cotonou, Bénin.`,
  },
  {
    id: 'donnees-collectees',
    title: 'ARTICLE 2 : DONNÉES PERSONNELLES COLLECTÉES',
    content: `DANGO HUB collecte des données personnelles auprès des Acheteurs (Clients) et des Vendeurs (Partenaires commerciaux).\n\n2.1 Données collectées auprès des Acheteurs (dangoimport.com)\n• Identité et coordonnées : Nom, prénom, adresse e-mail, numéro de téléphone, adresse exacte de livraison (ville, quartier, indications géographiques).\n• Données de transaction : Historique des commandes, détails des achats, choix du mode de paiement, suivi des livraisons.\n• Données techniques et de navigation : Adresse IP, identifiants d'appareils, données de connexion, type de navigateur, cookies.\n\n2.2 Données collectées auprès des Vendeurs (business.dangoimport.com)\n• Identification professionnelle (KYC) : Nom, prénom du représentant, pièce d'identité officielle, extrait RCCM, numéro IFU, nom commercial de la boutique.\n• Coordonnées bancaires et financières : Numéro de compte Mobile Money (MTN, Moov, TMoney, Flooz) ou Relevé d'Identité Bancaire (RIB) pour le reversement des ventes.\n• Données d'exploitation : Historique des produits ajoutés, volume des ventes, commissions prélevées et solde du compte.`,
  },
  {
    id: 'finalites',
    title: 'ARTICLE 3 : FINALITÉS ET BASES LÉGALES DU TRAITEMENT',
    content: `Conformément au RGPD et au Code du Numérique béninois, chaque traitement de données repose sur une base légale définie :\n\n• Gestion des commandes, paiements et livraisons (Acheteurs) — Exécution du contrat de vente.\n• Gestion et vérification des comptes Vendeurs (KYC) — Exécution du contrat de service & Obligation légale.\n• Reversement des fonds et facturation des commissions (Vendeurs) — Exécution du contrat & Obligation comptable/légale.\n• Service client, réclamations et médiation des litiges — Exécution du contrat & Intérêt légitime.\n• Envoi d'offres promotionnelles et newsletters — Consentement (Opt-in) ou Intérêt légitime.\n• Sécurité du site, prévention de la fraude et contrefaçon — Intérêt légitime & Obligation légale.`,
  },
  {
    id: 'destinataires',
    title: 'ARTICLE 4 : DESTINATAIRES ET PARTAGE DES DONNÉES',
    content: `DANGO HUB ne vend ni ne loue vos données personnelles. Les données sont strictement partagées avec les destinataires suivants dans le cadre strict de l'exécution des services :\n\n1. Vendeurs Tiers : Les données de livraison (nom, téléphone, adresse) sont transmises au Vendeur concerné uniquement pour la préparation de la commande.\n2. Prestataires Logistiques et Livreurs : Transmissions des informations de contact pour l'acheminement des colis au Bénin, au Togo et dans la sous-région.\n3. Partenaires de Paiement Sécurisé : Les passerelles de paiement Mobile Money et bancaires partenaires (ex: FedaPay, KKiaPay, etc.) pour le traitement des transactions.\n4. Autorités Publiques : Sur réquisition judiciaire ou légale (APDP, administrations fiscales, forces de l'ordre).`,
  },
  {
    id: 'transferts',
    title: 'ARTICLE 5 : TRANSFERTS TRANSFRONTALIERS DE DONNÉES',
    content: `Dans le cadre des activités de DANGO HUB entre le Bénin, le Togo et d'autres pays de la sous-région :\n\n• Les transferts de données au sein de la zone CEDEAO/OHADA sont sécurisés et encadrés par des conventions de traitement conformes aux exigences de l'APDP.\n• En cas de recours à des sous-traitants techniques (hébergement cloud, services e-mail) situés en dehors de l'Espace Économique Européen (EEE) ou de la sous-région, DANGO HUB s'assure qu'ils appliquent des Clauses Contractuelles Types (CCT) validées par la Commission Européenne et conformes aux directives du RGPD.`,
  },
  {
    id: 'conservation',
    title: 'ARTICLE 6 : DURÉE DE CONSERVATION DES DONNÉES',
    content: `DANGO HUB conserve vos données personnelles uniquement pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées :\n\n• Données de compte client/vendeur : Conservées pendant toute la durée de vie du compte, puis archivées pendant 3 ans à compter de la dernière activité.\n• Données de transaction et facturation : Conservées pendant 10 ans conformément aux obligations légales, fiscales et comptables en vigueur (Code de commerce / OHADA).\n• Données de prospection commerciale : Conservées pendant 3 ans à compter du dernier contact avec l'utilisateur.`,
  },
  {
    id: 'droits',
    title: 'ARTICLE 7 : VOS DROITS (RGPD & APDP BÉNIN)',
    html: true,
    content: `Conformément à la réglementation applicable (RGPD et Livre V du Code du Numérique), vous disposez des droits suivants sur vos données :\n\n• Droit d'accès ;\n• Droit de rectification ;\n• Droit à l'effacement ;\n• Droit à la limitation du traitement ;\n• Droit à la portabilité ;\n• Droit d'opposition ;\n• Droit de retirer votre consentement.\n\nPour exercer vos droits : envoyez votre demande accompagnée d'une copie d'une pièce d'identité à l'adresse : <a href="mailto:privacy@dangoimport.com" class="text-[#F68B1E] underline">privacy@dangoimport.com</a>. Une réponse vous sera apportée sous un délai maximum d'un (01) mois. Si vous estimez que vos droits ne sont pas respectés, vous pouvez porter réclamation auprès de l’APDP.`,
  },
  {
    id: 'securite',
    title: 'ARTICLE 8 : SÉCURITÉ DES DONNÉES',
    content: `DANGO HUB met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données contre la destruction, la perte, l'altération, la divulgation non autorisée ou l'accès non autorisé :\n\n• Protocoles de chiffrement SSL/TLS (HTTPS) sur l'ensemble des domaines.\n• Accès restreint aux données personnelles réservé au seul personnel habilité.\n• Audit et contrôle régulier des systèmes d'information.`,
  },
  {
    id: 'cookies',
    title: 'ARTICLE 9 : POLITIQUE RELATIVE AUX COOKIES',
    content: `Lors de votre navigation sur les sites de DANGO HUB, des cookies sont déposés sur votre terminal :\n\n• Cookies strictement nécessaires : Indispensables au fonctionnement de la Marketplace (gestion du panier, session utilisateur).\n• Cookies d'analyse et de performance : Permettent de mesurer l'audience et l'utilisation du site pour en améliorer l'ergonomie.\n• Cookies publicitaires : Utilisés pour vous proposer des offres ciblées.\n\nVous pouvez configurer ou refuser le dépôt des cookies à tout moment via le bandeau de consentement affiché lors de votre première visite ou via les paramètres de votre navigateur web.`,
  },
];

const PolitiqueConfidentialite = () => {
  return (
    <LegalPageLayout
      title="Politique de Confidentialité"
      description="Comment nous collectons, stockons et protégeons vos données personnelles."
      icon={ShieldCheck}
      breadcrumbs={[{ label: 'Informations légales', to: '/cgu' }, { label: 'Politique de confidentialité' }]}
      sections={SECTIONS}
    />
  );
};

export default PolitiqueConfidentialite;
