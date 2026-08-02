import React from 'react';
import LegalPageLayout from '../components/LegalPageLayout';

const APropos = () => {
  return (
    <LegalPageLayout title="À Propos de DANGOIMPORT">
      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">1. Qui sommes-nous ?</h2>
        <p className="mb-4 text-justify">DANGOIMPORT est une marketplace dédiée à simplifier l'accès à des produits de qualité au Togo et au Bénin.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">2. Notre Vision</h2>
        <p className="mb-4 text-justify">Nous voulons rendre le commerce en ligne plus accessible, plus rapide et plus fiable pour nos clients et nos partenaires.</p>
      </section>

      <section>
        <h2 className="text-[22px] font-semibold text-[#F68B1E] mt-8 mb-4">3. Notre Service Sourcing</h2>
        <p className="mb-4 text-justify">Nous accompagnons aussi les entreprises et particuliers à identifier les meilleurs fournisseurs adaptés à leur besoin.</p>
      </section>
    </LegalPageLayout>
  );
};

export default APropos;
