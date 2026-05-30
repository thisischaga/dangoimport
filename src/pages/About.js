import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <main className="w-full block">
        {/* HERO SECTION */}
        <section className="py-24 px-6 xl:px-20 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block mb-4 text-yellow-500 tracking-[0.2em] font-bold text-sm uppercase">À Propos de Dango HUB</span>
            <h1 className="mb-6 text-4xl md:text-5xl font-bold leading-tight text-gray-900">
              Transformer le commerce en ligne au Bénin et au Togo
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Dango HUB est une entreprise béninoise fondée par Ayatoulaye Dango Nadey. À travers sa marque Dango Import, nous opérons une marketplace locale, tout en proposant un service complémentaire d’importation depuis la Chine.
            </p>
          </div>
        </section>

        {/* NOTRE HISTOIRE & NOTRE VISION */}
        <section className="max-w-6xl mx-auto py-20 px-6 xl:px-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Histoire</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Née de la volonté de résoudre les vraies problématiques des entrepreneurs et consommateurs locaux, Dango Import a vu le jour avec une conviction forte : <strong className="text-gray-900">Il est possible de créer une marketplace moderne, fiable et adaptée au contexte ouest-africain.</strong>
            </p>
            <p className="text-gray-600 leading-relaxed">
              Nous avons commencé par accompagner les importateurs depuis la Chine, puis nous avons rapidement compris le besoin d’une véritable marketplace locale où les vendeurs béninois et togolais peuvent écouler leurs produits dans de bonnes conditions. Aujourd’hui, nous combinons ces deux forces.
            </p>
          </div>
          <div className="bg-yellow-50 p-10 rounded-2xl border border-yellow-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Vision</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Nous voulons bâtir la marketplace de référence au Bénin et au Togo, où :</p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 font-bold mt-1">✓</span>
                <span>Les acheteurs trouvent des produits de qualité à des prix justes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 font-bold mt-1">✓</span>
                <span>Les vendeurs locaux ont une visibilité réelle et des commissions équitables.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-yellow-500 font-bold mt-1">✓</span>
                <span>Le commerce en ligne devient simple, accessible et rentable pour tous.</span>
              </li>
            </ul>
          </div>
        </section>

        {/* CE QUI NOUS DISTINGUE */}
        <section className="py-20 px-6 xl:px-20 bg-gray-900 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold">Ce qui nous distingue</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Priorité à la marketplace locale</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  La majorité des produits disponibles sur Dango Import proviennent de vendeurs béninois et togolais.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Import Chine intelligent</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Un service complémentaire qui permet aux vendeurs de renouveler leurs stocks dans les meilleures conditions.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Accompagnement humain</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nous ne sommes pas qu’une plateforme, nous sommes un partenaire qui comprend les réalités du terrain.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Transparence</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Commissions claires, politiques honnêtes et service client réactif.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* NOS VALEURS & ENGAGEMENT */}
        <section className="py-20 px-6 xl:px-20 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Nos Valeurs</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
                <h3 className="font-bold text-gray-900">Confiance</h3>
                <p className="text-xs text-gray-500 mt-2">Nous travaillons chaque jour pour mériter la vôtre.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h3 className="font-bold text-gray-900">Proximité</h3>
                <p className="text-xs text-gray-500 mt-2">Une équipe basée au Bénin, qui comprend vos besoins.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
                <h3 className="font-bold text-gray-900">Ambition</h3>
                <p className="text-xs text-gray-500 mt-2">Accompagner la croissance des entrepreneurs locaux.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-yellow-100 text-yellow-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
                <h3 className="font-bold text-gray-900">Innovation</h3>
                <p className="text-xs text-gray-500 mt-2">Créer des solutions adaptées au contexte africain.</p>
              </div>
            </div>

            <div className="bg-gray-50 p-10 rounded-2xl border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Engagement</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Que vous soyez un acheteur à la recherche de bons produits ou un vendeur qui veut développer son activité, Dango HUB s’engage à vous offrir une expérience simple, fiable et rentable.
              </p>
              <p className="text-gray-900 font-bold text-lg">Ensemble, construisons le futur du commerce local.</p>
              <p className="text-gray-500 text-sm mt-4 italic">— Ayatoulaye Dango Nadey, Fondateur & CEO, Dango HUB</p>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="bg-yellow-400 py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Prêt à faire partie de l’aventure ?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={() => navigate('/shopping')} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition-colors">
                Découvrir la Marketplace
              </button>
              <button onClick={() => navigate('/devenir-vendeur')} className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-3 rounded-lg font-bold transition-colors border border-transparent shadow-sm">
                Devenir Vendeur
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;