import React from 'react';
import PageHeader from '../../components/ui/PageHeader';

export default function Privacy(){
  return (
    <div>
      <PageHeader title="Politique de confidentialité" subtitle="Comment nous traitons vos données" breadcrumbs={[{label:'Accueil', to:'/'},{label:'Politique de confidentialité'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-bold">Collecte des données</h2>
          <p className="text-sm text-[#6b7280] mt-2">Nous collectons uniquement les données nécessaires pour fournir nos services...</p>
        </section>
        <section className="bg-white border rounded-lg p-6 mt-4">
          <h2 className="text-lg font-bold">Durée de conservation</h2>
          <p className="text-sm text-[#6b7280] mt-2">Les données sont conservées en fonction des obligations légales et du service.</p>
        </section>
      </main>
    </div>
  );
}
