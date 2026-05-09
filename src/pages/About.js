import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <main className="w-full block">
        {/* HERO SECTION - Centered text without image */}
        <section className="py-24 px-6 xl:px-20 bg-gray-50">
          <div className="max-w-4xl mx-auto text-center">
            <span className="inline-block mb-4 text-yellow-500 tracking-[0.2em] font-bold text-sm uppercase">Qui sommes-nous</span>
            <h1 className="mb-6 text-4xl md:text-5xl font-bold leading-tight text-gray-900">Nous simplifions l'import entre la Chine et l'Afrique de l'Ouest</h1>
            <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto">
              Dango Import accompagne les commerçants, entrepreneurs et particuliers avec un service transparent, sécurisé et adapté à chaque besoin.
            </p>
          </div>
        </section>

        {/* INFO GRID - Fidèle au CSS d'origine (2 colonnes, bordures simples) */}
        <section className="max-w-6xl mx-auto py-20 px-6 xl:px-20 grid grid-cols-1 md:grid-cols-2 gap-8">
          <article className="bg-gray-50 p-10 rounded-lg border border-gray-200 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Qui sommes-nous ?</h3>
            <p className="text-gray-600 leading-relaxed">
              Dango Import est un accompagnement personnalisé pour importer des produits de qualité depuis la Chine, sans stress ni mauvaises surprises.
            </p>
          </article>
          <article className="bg-gray-50 p-10 rounded-lg border border-gray-200 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Pourquoi ce projet ?</h3>
            <p className="text-gray-600 leading-relaxed">
              Après avoir vécu les difficultés de l’importation (fraudes, produits non conformes, blocages), notre équipe a créé une solution fiable et accessible.
            </p>
          </article>
          <article className="bg-gray-50 p-10 rounded-lg border border-gray-200 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Ce que nous faisons</h3>
            <p className="text-gray-600 leading-relaxed">
              Nous recherchons des fournisseurs fiables, préparons des devis transparents et assurons l’achat, le transport, le dédouanement et la livraison.
            </p>
          </article>
          <article className="bg-gray-50 p-10 rounded-lg border border-gray-200 text-left">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Nos engagements</h3>
            <ul className="space-y-2 text-gray-600 list-disc list-inside">
              <li>Sécurité des paiements</li>
              <li>Respect des délais</li>
              <li>Qualité des produits</li>
              <li>Accompagnement transparent</li>
            </ul>
          </article>
        </section>

        {/* COMMITMENTS SECTION - Fidèle au CSS d'origine (Grille de 4, fond gris clair) */}
        <section className="py-20 px-6 xl:px-20 bg-gray-50">
          <div className="max-w-6xl mx-auto mb-10 text-left">
            <span className="uppercase tracking-[0.24em] text-gray-500 text-sm font-bold block mb-1">Notre approche</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Une démarche claire et humaine</h2>
          </div>
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Clarté</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Des devis compréhensibles et un suivi transparent à chaque étape.</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Fiabilité</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Fournisseurs vérifiés et contrôle qualité avant expédition.</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Sécurité</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Accompagnement sécurisé du paiement à la livraison finale.</p>
            </div>
            <div className="bg-white p-8 rounded-lg border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Proximité</h3>
              <p className="text-sm text-gray-600 leading-relaxed">Un service adapté au Bénin, Togo et Ghana, avec un support local et humain.</p>
            </div>
          </div>
        </section>

        {/* SUMMARY SECTION - Fidèle au CSS d'origine */}
        <section className="py-16 px-6 text-center text-gray-900">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">En résumé</h2>
            <p className="text-lg leading-relaxed text-gray-600">
              Dango Import est la solution simple, fiable et professionnelle pour vos achats en Chine. Nous vous aidons à lancer votre projet d’importation en toute sérénité.
            </p>
          </div>
        </section>

        {/* CTA SECTION - Fidèle au CSS d'origine (Fond sombre) */}
        <section className="bg-gray-900 text-white py-20 px-6 xl:px-20 text-center">
          <div className="max-w-4xl mx-auto flex flex-col items-center">
            <div className="mb-8">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Envie de démarrer votre projet ?</h2>
              <p className="text-lg text-gray-300">Contactez-nous pour une première analyse gratuite et un accompagnement sur mesure.</p>
            </div>
            <button type="button" onClick={() => navigate('/shopping')} className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 px-8 py-3 rounded shadow-md font-bold transition-colors">
              Découvrir nos produits
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default About;