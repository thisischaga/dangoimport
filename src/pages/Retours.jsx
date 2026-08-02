import React from 'react';
import PageHeader from '../components/ui/PageHeader';

export default function Retours() {
  return (
    <div>
      <PageHeader
        title="Retours"
        subtitle="Comment retourner un produit et obtenir un remboursement."
        breadcrumbs={[{ label: 'Accueil', to: '/' }, { label: 'Retours' }]}
      />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="space-y-6 bg-white border rounded-xl p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Conditions de retour</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Les retours sont possibles pour les produits reçus endommagés, non conformes ou incorrects. Vous devez signaler le problème dans les 7 jours suivant la réception.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Procédure</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Contactez notre support client avec votre numéro de commande et des photos du produit. Nous vous indiquerons la marche à suivre pour le retour ou l'échange.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Remboursement</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Une fois le retour approuvé et le produit réceptionné, le remboursement est traité sous 14 jours sur votre moyen de paiement initial.</p>
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#111827]">Contact</h2>
            <p className="mt-3 text-sm text-[#475569] leading-7">Pour toute demande de retour, écrivez à <a href="mailto:contact@dangoimport.com" className="text-[#F68B1E] underline">contact@dangoimport.com</a> ou appelez <a href="tel:+2290158266342" className="text-[#F68B1E] underline">+229 0158266342</a>.</p>
          </div>
        </section>
      </main>
    </div>
  );
}
