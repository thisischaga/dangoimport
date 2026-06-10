import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import DevisForm from '../components/DevisForm';
import { FaTimes } from 'react-icons/fa';

// Images (Utilisation des photos premium demandées)
import sourcingImg from '../images/service_sourcing.png';
import devisImg from '../images/service_security.png';
import qualityImg from '../images/service_quality.png';
import deliveryImg from '../images/service_logistics.png';

const Services = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <main className="w-full block">
        {/* HERO SECTION - Fidèle au design d'origine (Fond sombre) */}
        <section className="relative min-h-[45vh] flex items-center justify-center bg-gray-900 text-white">
          <div className="relative z-10 text-center w-full max-w-5xl px-6 py-12">
            <span className="inline-block mb-5 text-[#ffdc2b] tracking-[0.24em] font-bold text-sm uppercase">Services sur mesure</span>
            <h1 className="mb-4 text-4xl md:text-5xl font-black leading-tight text-white">Importer de Chine en toute confiance</h1>
            <p className="mx-auto mb-10 max-w-3xl text-lg text-gray-300 leading-relaxed">
              Dango Import vous guide à chaque étape : sourcing fiable, négociation, contrôle qualité et livraison sécurisée vers le Bénin, le Togo et le Ghana.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button type="button" onClick={() => navigate('/shopping')} className="bg-[#ffdc2b] hover:bg-[#e6c600] text-gray-900 px-8 py-3 rounded shadow-md font-bold transition-colors">
                Voir notre vitrine
              </button>
              <button type="button" onClick={() => setShowForm(true)} className="bg-transparent hover:bg-white/10 text-white px-8 py-3 border border-white/30 rounded font-bold transition-colors">
                Demander un devis
              </button>
            </div>
          </div>
        </section>

        {/* SECTION BLOCK - Fidèle au design d'origine (Grille de 4) */}
        <section className="py-20 px-6 xl:px-20 bg-white">
          <div className="max-w-6xl mx-auto mb-10">
            <span className="uppercase tracking-[0.24em] text-gray-500 text-sm font-bold block mb-1">Étapes clés</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Un processus simple et transparent</h2>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <article className="bg-white border border-gray-200 rounded-lg text-left shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <img src={sourcingImg} alt="Recherche fournisseur" className="w-full h-[200px] object-cover" />
              <div className="p-6">
                <h3 className="m-0 mb-3 text-xl font-bold text-gray-900">Recherche fournisseur</h3>
                <p className="m-0 text-gray-600 leading-relaxed text-sm">Nous identifions les usines les plus fiables et les produits les plus compétitifs selon vos besoins.</p>
              </div>
            </article>
            <article className="bg-white border border-gray-200 rounded-lg text-left shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <img src={devisImg} alt="Devis personnalisé" className="w-full h-[200px] object-cover" />
              <div className="p-6">
                <h3 className="m-0 mb-3 text-xl font-bold text-gray-900">Devis personnalisé</h3>
                <p className="m-0 text-gray-600 leading-relaxed text-sm">Nous envoyons un devis clair qui inclut produit, transport, douane et garanties.</p>
              </div>
            </article>
            <article className="bg-white border border-gray-200 rounded-lg text-left shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <img src={qualityImg} alt="Suivi qualité" className="w-full h-[200px] object-cover" />
              <div className="p-6">
                <h3 className="m-0 mb-3 text-xl font-bold text-gray-900">Suivi qualité</h3>
                <p className="m-0 text-gray-600 leading-relaxed text-sm">Contrôle qualité sur place, validation des commandes et suivi permanent jusqu'à l'expédition.</p>
              </div>
            </article>
            <article className="bg-white border border-gray-200 rounded-lg text-left shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
              <img src={deliveryImg} alt="Livraison ciblée" className="w-full h-[200px] object-cover" />
              <div className="p-6">
                <h3 className="m-0 mb-3 text-xl font-bold text-gray-900">Livraison ciblée</h3>
                <p className="m-0 text-gray-600 leading-relaxed text-sm">Livraison directe à domicile ou en point relais au Bénin, Togo et Ghana.</p>
              </div>
            </article>
          </div>
        </section>

        {/* SECTION HIGHLIGHT - Fidèle au design d'origine */}
        <section className="bg-[#ffdc2b] py-16 px-6 xl:px-20 text-center text-gray-900">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Plus qu’un service, un vrai partenaire</h2>
            <p className="text-lg leading-relaxed">
              Nous apportons une expertise concrète, une communication claire et une prise en charge complète pour que votre import soit fiable et rentable.
            </p>
          </div>
        </section>

        {/* SECTION DETAIL - Fidèle au design d'origine (2 colonnes) */}
        <section className="max-w-6xl mx-auto py-16 px-6 xl:px-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Accompagnement complet</h3>
            <p className="text-gray-600 leading-relaxed">
              De la recherche du fournisseur à la livraison finale, nous coordonnons toutes les étapes pour réduire les risques et les retards.
            </p>
          </div>
          <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Transparence et confiance</h3>
            <p className="text-gray-600 leading-relaxed">
              Chaque commande est suivie avec des rapports clairs et des échanges réguliers afin que vous restiez informé en permanence.
            </p>
          </div>
        </section>

        {/* SECTION BOTTOM GRID - Fidèle au design d'origine */}
        <section className="max-w-6xl mx-auto pb-16 px-6 xl:px-20 grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Études & Newsletter</h3>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Offres prioritaires</li>
              <li>Conseils sourcing</li>
              <li>Actualités du marché chinois</li>
              <li>Guides d’importation pratiques</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-10 rounded-lg border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ce qui nous distingue</h3>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Fournisseurs validés</li>
              <li>Transport sécurisé</li>
              <li>Suivi personnalisé</li>
              <li>Respect des délais</li>
            </ul>
          </div>
        </section>

        {/* CTA SECTION - Fidèle au design d'origine */}
        <section className="bg-gray-900 text-white py-20 px-6 xl:px-20 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Prêt à lancer votre import ?</h2>
            <p className="text-lg text-gray-300 mb-8">Contactez-nous et obtenez une solution sur mesure pour votre première commande.</p>
            <button type="button" onClick={() => setShowForm(true)} className="bg-[#ffdc2b] hover:bg-[#e6c600] text-gray-900 px-8 py-3 rounded shadow-md font-bold transition-colors">
              Commencer maintenant
            </button>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Sourcing Modal ── */}
      {showForm && (
        <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-5 backdrop-blur-sm">
          <div className="w-full max-w-[720px] bg-white rounded-3xl overflow-hidden shadow-[0_32px_120px_rgba(15,23,42,0.2)] relative max-h-[95vh] overflow-y-auto">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 p-2 rounded-full z-50 transition-colors"
            >
              <FaTimes size={18} />
            </button>
            <div className="p-8 md:p-10">
              <DevisForm showForm={setShowForm} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Services;