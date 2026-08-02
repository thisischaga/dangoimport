import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import FAQAccordion from '../components/ui/FAQAccordion';

const categories = {
  Commandes: [
    { q: 'Comment modifier ma commande ?', a: 'Vous pouvez modifier une commande tant qu\'elle n\'a pas été expédiée.' },
  ],
  Paiements: [
    { q: 'Quels moyens de paiement sont acceptés ?', a: 'Mobile Money, cartes bancaires et partenaires locaux.' },
  ],
};

export default function FAQ(){
  return (
    <div>
      <PageHeader title="FAQ" subtitle="Questions fréquemment posées" breadcrumbs={[{label:'Accueil', to:'/'},{label:'FAQ'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(categories).map(([k, items]) => (
            <div key={k} className="bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-3">{k}</h3>
              <FAQAccordion items={items} />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
