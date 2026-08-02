import React from 'react';
import PageHeader from '../components/ui/PageHeader';

export default function Livraison() {
  return (
    <div>
      <PageHeader
        title="Livraison"
        subtitle="Toutes les informations sur nos délais, frais et suivi de livraison."
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Livraison' }]}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="space-y-6 bg-white border rounded-xl p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Délais de livraison</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Nous livrons principalement au Bénin et au Togo. Les commandes locales sont généralement livrées sous 1 à 3 jours ouvrés. Les produits importés peuvent prendre entre 7 et 21 jours selon la disponibilité et le mode de transport.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Frais de livraison</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Le montant de la livraison est calculé au moment du paiement en fonction du poids, de la destination et du mode d'expédition choisi. Certaines offres peuvent inclure la livraison gratuite.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Suivi de commande</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Vous pouvez suivre l'état de votre commande depuis l'espace "Mes commandes". Vous recevrez également des notifications par SMS et email lorsque votre colis est expédié et livré.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">En cas de problème</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Si votre livraison est retardée ou si le produit n'arrive pas, contactez notre support via <a href="mailto:contact@dangoimport.com" className="text-[#F68B1E] underline">contact@dangoimport.com</a> ou par WhatsApp au <a href="tel:+2290158266342" className="text-[#F68B1E] underline">+229 0158266342</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
