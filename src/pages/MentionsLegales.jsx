import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import LegalPageLayout from '../components/LegalPageLayout';

const SECTIONS = [
  {
    id: 'identification',
    title: '1. Identification',
    content: 'Le site Dangoimport est édité par Dangoimport SARL, domiciliée à Lomé, Togo.',
  },
  {
    id: 'contact',
    title: '2. Contact',
    html: true,
    content: 'Pour nous contacter, vous pouvez nous écrire à l\'adresse <a href="mailto:contact@dangoimport.com" class="text-[#F68B1E] underline">contact@dangoimport.com</a>.',
  },
  {
    id: 'hebergement',
    title: '3. Hébergement',
    content: 'Le site est hébergé par Vercel Inc., conformément aux conditions d\'hébergement de sa plateforme.',
  },
  {
    id: 'propriete-intellectuelle',
    title: '4. Propriété Intellectuelle',
    content: 'Tous les contenus du site sont la propriété de Dangoimport. Toute reproduction sans autorisation préalable est interdite.',
  },
  {
    id: 'politique-confidentialite',
    title: '5. Confidentialité',
    html: true,
    content: 'Pour plus d\'informations, consultez notre <a href="/politique-confidentialite" class="text-[#F68B1E] underline">politique de confidentialité</a>.',
  },
];

const MentionsLegales = () => {
  return (
    <LegalPageLayout
      title="Mentions Légales"
      description="Les informations légales obligatoires concernant Dangoimport et son hébergement."
      icon={FileText}
      breadcrumbs={[{ label: 'Informations légales', to: '/cgu' }, { label: 'Mentions légales' }]}
      sections={SECTIONS}
    />
  );
};

export default MentionsLegales;
