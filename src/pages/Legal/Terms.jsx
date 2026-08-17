import React from 'react';
import PageHeader from '../../components/ui/PageHeader';

export default function Terms(){
  const toc = [
    'Introduction','Accès et utilisation','Responsabilités','Propriété intellectuelle','Loi applicable'
  ];
  return (
    <div>
      <PageHeader title="Conditions Générales" subtitle="Conditions d'utilisation de Dangoimport" breadcrumbs={[{label:'Accueil', to:'/'},{label:'Conditions générales'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <aside className="hidden lg:block">
            <nav className="sticky top-24 space-y-2">
              {toc.map((t,i)=> <a key={t} href={`#sec${i}`} className="block text-sm text-[#6b7280] hover:text-[#F68B1E]">{t}</a>)}
            </nav>
          </aside>
          <div className="lg:col-span-3 space-y-6">
            {toc.map((t,i)=> (
              <section id={`sec${i}`} key={t} className="bg-white border rounded-lg p-6">
                <h2 className="text-lg font-bold mb-3">{`${i+1}. ${t}`}</h2>
                <p className="text-sm text-[#6b7280]">Contenu détaillé pour la section {t}. Ce texte explique les conditions et obligations applicables aux utilisateurs.</p>
              </section>
            ))}
            <div className="flex justify-end"><a href="#top" className="text-sm text-[#F68B1E]">Retour en haut</a></div>
          </div>
        </div>
      </main>
    </div>
  );
}
