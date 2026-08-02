import React from 'react';
import { ShieldCheck } from 'lucide-react';
import LegalPageLayout from '../components/LegalPageLayout';

const SECTIONS = [
  {
    id: 'donnees-collectees',
    title: '1. Données collectées',
    content: 'Nous collectons votre nom, votre email, votre téléphone, votre adresse ainsi que les données de paiement via FedaPay lors de vos transactions.',
  },
  {
    id: 'utilisation-donnees',
    title: '2. Utilisation des données',
    content: 'Vos données sont utilisées pour traiter vos commandes, vos livraisons et assurer un service client de qualité.',
  },
  {
    id: 'partage-donnees',
    title: '3. Partage des données',
    content: 'Nous ne vendons pas vos données. Elles sont partagées uniquement avec les transporteurs et le prestataire de paiement FedaPay.',
  },
  {
    id: 'securite',
    title: '4. Sécurité',
    content: 'Vos données sont stockées de manière sécurisée conformément aux bonnes pratiques de protection.',
  },
  {
    id: 'vos-droits',
    title: '5. Vos droits',
    html: true,
    content: 'Vous pouvez demander la suppression de vos données à l’adresse <a href="mailto:contact@dangoimport.com" class="text-[#F68B1E] underline">contact@dangoimport.com</a>.',
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
