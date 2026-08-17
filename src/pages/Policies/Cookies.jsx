import React from 'react';
import { Cookie } from 'lucide-react';
import LegalPageLayout from '../../components/LegalPageLayout';

const SECTIONS = [
  {
    id: 'types-de-cookies',
    title: 'Types de cookies',
    html: true,
    content: '<ul class="list-disc pl-6 space-y-2"><li><strong>Essentiels :</strong> Nécessaires au fonctionnement du site.</li><li><strong>Performance :</strong> Pour analyser l\'utilisation et améliorer l\'expérience.</li><li><strong>Marketing :</strong> Pour proposer des contenus pertinents.</li></ul>',
  },
];

export default function Cookies() {
  return (
    <LegalPageLayout
      title="Politique des cookies"
      description="Nos pratiques de collecte et d'utilisation des cookies sur Dangoimport."
      icon={Cookie}
      breadcrumbs={[{ label: 'Informations légales', to: '/cgu' }, { label: 'Cookies' }]}
      sections={SECTIONS}
    >
      <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="text-base leading-7 text-slate-700">
          <p>Dans cet espace, vous pouvez gérer vos préférences de cookies en fonction de votre niveau de confidentialité.</p>
        </div>
        <div className="mt-6 flex justify-start">
          <button className="inline-flex items-center justify-center rounded-2xl bg-[#F68B1E] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#dd7f0b]">
            Gérer mes préférences
          </button>
        </div>
      </div>
    </LegalPageLayout>
  );
}
