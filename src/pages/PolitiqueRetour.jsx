import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';


const SECTIONS = [
  {
    id: "champ",
    title: "1. Champ d’application",
    content: `La présente Politique s’applique :
• aux produits commercialisés sur la Marketplace locale Dangoimport (produits proposés par des vendeurs partenaires référencés au Bénin et au Togo) ;
• aux services de livraison organisés ou coordonnés par Dangoimport ;
• aux commandes spécifiques d’importation via le service Import Chine sur devis, sous réserve des dispositions particulières prévues à l’article 11 ci-dessous.`,
  },
  {
    id: "delai",
    title: "2. Délai de réclamation et de demande de retour",
    content: `Toute demande de retour, de remboursement ou de réclamation relative à un produit livré doit être introduite dans un délai maximum de soixante-douze (72) heures suivant la confirmation de livraison.

Passé ce délai :
• la commande est réputée acceptée ;
• le produit est considéré comme conforme ;
• aucune réclamation ne pourra être garantie, sauf vice caché ou garantie spécifique du vendeur.

Les demandes peuvent être adressées via l’espace client, par email, ou via le canal officiel WhatsApp de Dangoimport.`,
  },
  {
    id: "conditions",
    title: "3. Conditions générales d’acceptation d’un retour",
    content: `3.1 Produit défectueux
Le produit présente un défaut de fabrication, un dysfonctionnement anormal, une casse imputable au transport ou un vice apparent constaté à réception.

3.2 Produit non conforme
Le produit livré ne correspond pas à la commande (mauvais article, mauvaise taille, mauvaise référence, caractéristiques substantielles différentes).

3.3 Produit endommagé à la livraison
Le colis ou son contenu a subi un dommage avant remise au client.`,
  },
  {
    id: "non-eligibles",
    title: "4. Produits non éligibles au retour",
    content: `Sauf disposition légale contraire, les produits suivants ne sont pas retournables :
• produits alimentaires et périssables ;
• cosmétiques et produits d’hygiène ouverts ;
• sous-vêtements ;

• produits commandés spécialement pour un client ;
• produits ouverts, utilisés ou consommés au-delà d’un usage raisonnable de vérification ;
• produits détériorés par le client ;
• commandes d’importation sur devis validées (sauf cas exceptionnels).`,
  },
  {
    id: "frais",
    title: "5. Frais de retour",
    content: `5.1 Retour imputable au vendeur partenaire
Lorsque le retour résulte d’un défaut produit, d’une erreur de préparation ou d’une non-conformité, les frais de retour sont à la charge du vendeur partenaire concerné.

5.2 Retour exceptionnel (Convenance commerciale)
Lorsqu’un retour est accepté à titre de geste commercial (hors défaut ou erreur), les frais de retour sont à la charge du client.`,
  },
  {
    id: "remboursement",
    title: "6. Modalités de remboursement",
    content: `6.1 Produit défectueux / erreur vendeur
Le client bénéficie d’un remboursement comprenant le prix du produit et les frais de livraison.

6.2 Commande non livrée
En cas de commande non livrée pour une raison imputable à Dangoimport ou au vendeur, le client bénéficie d’un remboursement intégral (100 %).

6.3 Délais de remboursement
Après validation, les remboursements Mobile Money sont traités sous quelques jours ouvrés. Les remboursements bancaires dépendent des délais interbancaires.`,
  },
  {
    id: "echec-livraison",
    title: "7. Livraison échouée / client absent",
    content: `En cas d’absence du client ou d’adresse incomplète, une première reprogrammation est gratuite. Toute tentative supplémentaire pourra être facturée au client selon la grille logistique applicable.`,
  },
  {
    id: "deterioration",
    title: "8. Produits détériorés par le client",
    content: `Aucun retour ni remboursement ne sera accepté lorsque le produit a été endommagé, cassé, modifié ou utilisé de manière excessive par le client.`,
  },
  {
    id: "procedure",
    title: "8. PROCÉDURE DE RETOUR",
    content: `1. Contactez le service client via WhatsApp avec le numéro de commande + photos/vidéos explicites.
2. Attendez la validation de Dangoimport.
3. Retournez le produit dans son état d’origine (emballage compris).
4. Une fois le produit vérifié et accepté, le remboursement ou l’échange est traité.`
  },
  {
    id: "import",
    title: "9. CAS PARTICULIER – SERVICE IMPORT CHINE (SUR DEVIS)",
    content: `Les commandes réalisées via le service Import sur devis sont non annulables et non remboursables, sauf en cas de :
• Défaut majeur ou vice caché
• Non-conformité substantielle et manifeste
• Fraude avérée
Les acomptes versés pour le sourcing et les négociations restent acquis à Dangoimport.`
  },
  {
    id: "abus",
    title: "10. LUTTE CONTRE LES ABUS",
    content: `Dangoimport se réserve le droit de refuser toute demande abusive, frauduleuse ou répétée. En cas d’abus constaté, des mesures (refus de retour, suspension de compte) pourront être prises.`
  },
  {
    id: "role",
    title: "11. RÔLE DE Dangoimport",
    content: `Dangoimport agit en tant qu’intermédiaire et coordinateur. Elle facilite le traitement des retours tout en veillant à un équilibre équitable entre clients et vendeurs partenaires.`
  },
  {
    id: "modification",
    title: "12. MODIFICATION DE LA POLITIQUE",
    content: `Dangoimport se réserve le droit de modifier cette politique à tout moment. La version en vigueur est celle publiée sur le site.`
  },
  {
    id: "contact",
    title: "13. CONTACT",
    content: `• WhatsApp / Téléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80
• Email : contact@dangoimport.com
• Adresse : Abomey-Calavi, Bénin`
  },
];

const PolitiqueRetour = () => {
  return (
    <LegalPageLayout
      title="Politique de Retour et de Remboursement"
      description="Les conditions de retour des produits et le délai de remboursement pour votre commande."
      icon={ShieldCheck}
      breadcrumbs={[{ label: 'Informations légales', to: '/cgu' }, { label: 'Politique de remboursement' }]}
      sections={SECTIONS}
    />
  );
};

export default PolitiqueRetour;
