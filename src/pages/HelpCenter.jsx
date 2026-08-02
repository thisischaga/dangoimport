import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import HelpSearch from '../components/ui/HelpSearch';
import FAQAccordion from '../components/ui/FAQAccordion';
import { Link } from 'react-router-dom';

const helpCats = [
  {title:'Commandes', to:'/help/commandes'},
  {title:'Paiements', to:'/help/paiements'},
  {title:'Livraison', to:'/help/livraison'},
  {title:'Retours', to:'/help/retours'},
  {title:'Vendeurs', to:'/help/vendeurs'},
];

export default function HelpCenter(){
  const faqItems = [
    {q:'Comment suivre ma commande ?', a:'Connectez-vous et allez dans Mes commandes, cliquez sur la commande concernée.'},
    {q:'Quels sont les moyens de paiement ?', a:'Nous acceptons Mobile Money, cartes bancaires et paiements partenaires.'},
  ];

  return (
    <div>
      <PageHeader title="Centre d'aide" subtitle="Trouvez des réponses rapides à vos questions" breadcrumbs={[{label:'Accueil', to:'/'},{label:'Centre d\'aide'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <HelpSearch />
            <div className="mt-6 bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-3">Catégories d'aide</h3>
              <ul className="space-y-2">
                {helpCats.map(c => <li key={c.title}><Link to={c.to} className="text-sm text-[#374151] hover:text-[#F68B1E]">{c.title}</Link></li>)}
              </ul>
            </div>
            <div className="mt-6 bg-white border rounded-lg p-4">
              <h3 className="font-bold mb-3">Articles populaires</h3>
              <ul className="text-sm text-[#6b7280]">
                <li><Link to="/help/track" className="hover:text-[#F68B1E]">Comment suivre ma commande</Link></li>
                <li><Link to="/help/payment" className="hover:text-[#F68B1E]">Options de paiement</Link></li>
              </ul>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xl font-extrabold mb-4">Questions fréquentes</h2>
            <FAQAccordion items={faqItems} />

            <div className="mt-6 bg-white border rounded-lg p-4">
              <h3 className="font-bold">Contact rapide</h3>
              <p className="text-sm text-[#6b7280]">Si vous ne trouvez pas la réponse, envoyez-nous un message ou ouvrez un ticket.</p>
              <div className="mt-3">
                <Link to="/contact" className="inline-block bg-[#F68B1E] text-white px-4 py-2 rounded">Contacter le support</Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
