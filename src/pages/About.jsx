import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import HeroSection from '../components/ui/HeroSection';

export default function About(){
  return (
    <div>
      <HeroSection title="À propos de Dangoimport" subtitle="Nous connectons les acheteurs et vendeurs en Afrique avec fiabilité et rapidité." />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader title="Notre histoire" subtitle="Une marketplace pensée pour l'Afrique" />

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-bold">Notre mission</h3>
            <p className="text-sm text-[#6b7280] mt-2">Permettre aux entrepreneurs locaux d'accéder à un marché plus large, tout en offrant aux consommateurs une expérience d'achat fiable.</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-bold">Notre vision</h3>
            <p className="text-sm text-[#6b7280] mt-2">Être la marketplace de référence en Afrique de l'Ouest pour le commerce en ligne.</p>
          </div>
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-bold">Nos valeurs</h3>
            <ul className="text-sm text-[#6b7280] mt-2 space-y-2">
              <li>Confiance</li>
              <li>Transparence</li>
              <li>Accessibilité</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
