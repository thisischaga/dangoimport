import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const SECTIONS = [
  {
    id: 'delai-retractation',
    title: '1. Délai de rétractation',
    content: 'Vous disposez de 7 jours à compter de la réception pour nous signaler un problème sur votre commande.',
  },
  {
    id: 'produits-eligibles',
    title: '2. Produits éligibles au retour',
    html: true,
    content: '<ul class="list-disc pl-6 space-y-2"><li>Produit endommagé</li><li>Produit non conforme</li><li>Produit manquant</li></ul>',
  },
  {
    id: 'produits-non-eligibles',
    title: '3. Produits non éligibles',
    html: true,
    content: '<ul class="list-disc pl-6 space-y-2"><li>Produits utilisés</li><li>Produits personnalisés</li></ul>',
  },
  {
    id: 'procedure-retour',
    title: '4. Procédure de retour',
    html: true,
    content: 'Contactez-nous sur WhatsApp au <a href="tel:+228XXXXXXXX" class="text-[#F68B1E] underline">+228 XX XX XX XX</a> avec photo et numéro de commande afin de lancer votre retour.',
  },
  {
    id: 'remboursement',
    title: '5. Remboursement',
    content: 'Le remboursement se fait sous 14 jours sur votre moyen de paiement initial.',
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
