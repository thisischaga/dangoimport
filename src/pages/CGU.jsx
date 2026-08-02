import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const CGU = () => {
  return (
    <LegalPageLayout title="Conditions Générales d'Utilisation">
      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">1. Objet</h2>
        <p className="mb-4 text-justify">Les présentes conditions générales régissent l'utilisation du site DangoImport et de ses services.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">2. Compte Utilisateur</h2>
        <p className="mb-4 text-justify">L'utilisateur est responsable de la confidentialité de ses identifiants et de toutes les actions effectuées depuis son compte.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">3. Commandes et Paiement</h2>
        <p className="mb-4 text-justify">Toute commande implique l'acceptation des prix affichés. Le paiement peut être effectué via FedaPay, Mobile Money ou à la livraison, selon les modalités disponibles.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">4. Livraison</h2>
        <p className="mb-4 text-justify">Les délais de livraison sont estimés selon les zones desservies et peuvent varier en fonction des transporteurs et des contraintes logistiques.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">5. Responsabilité</h2>
        <p className="mb-4 text-justify">DangoImport ne peut être tenu responsable des retards liés au transporteur ou de toute cause indépendante de sa volonté.</p>
      </section>
    </LegalPageLayout>
  );
};

export default CGU;
