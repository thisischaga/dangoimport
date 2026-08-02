import React from 'react';
import PageHeader from '../components/ui/PageHeader';
import ContactForm from '../components/ui/ContactForm';

export default function Contact(){
  return (
    <div>
      <PageHeader title="Contact" subtitle="Nous sommes là pour vous aider" breadcrumbs={[{label:'Accueil', to:'/'},{label:'Contact'}]} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold mb-3">Coordonnées</h3>
            <p className="text-sm text-[#6b7280]">ABOMEY-CALAVI, Bénin</p>
            <p className="text-sm text-[#6b7280] mt-2">Tel: +229 0158266342</p>
            <p className="text-sm text-[#6b7280] mt-1">Email: contact@dangoimport.com</p>
            <div className="mt-4">
              <h4 className="font-semibold">Horaires</h4>
              <p className="text-sm text-[#6b7280]">Lun–Sam 09:00–18:00</p>
            </div>
          </div>
          <div className="lg:col-span-2">
            <ContactForm />
          </div>
        </div>
      </main>
    </div>
  );
}
