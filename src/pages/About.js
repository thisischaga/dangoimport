import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { FaGlobeAfrica, FaStore, FaHandshake } from 'react-icons/fa';

import slide1Img from "../images/sourcing_slide.png";
import slide2Img from "../images/slide2.png";
import slide3Img from "../images/slide3.png";

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <Header />

      <main className="w-full block">
        {/* HERO SECTION SLIDER */}
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
            <div className="rounded-2xl overflow-hidden relative shadow-sm">
              <Slider
                dots={true}
                infinite={true}
                speed={500}
                slidesToShow={1}
                slidesToScroll={1}
                autoplay={true}
                autoplaySpeed={4500}
                arrows={false}
                appendDots={dots => (
                  <div style={{ bottom: '10px' }}>
                    <ul style={{ margin: "0px" }}> {dots} </ul>
                  </div>
                )}
              >
                {/* Slide 1 - Vision */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-12 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ffdc2b]/10 blur-[80px] rounded-full"></div>
                    <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full"></div>
                    
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%] relative">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ffdc2b] to-[#e6c600] text-[#1a202c] text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm shadow-[#ffdc2b]/20">
                        <FaGlobeAfrica size={10} /> À Propos de nous
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2 tracking-tight">
                        Transformer le commerce en ligne <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdc2b] to-white">au Bénin & Togo</span>
                      </h1>
                      <p className="text-xs sm:text-base text-gray-300 mb-5 line-clamp-2 sm:line-clamp-none">
                        Dango HUB est une entreprise fondée par Ayatoulaye Dango Nadey, dédiée à l'accompagnement des entrepreneurs et consommateurs.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => navigate('/shopping')} className="bg-[#ffdc2b] text-[#0f172a] hover:bg-[#e6c600] px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-all shadow-lg shadow-[#ffdc2b]/20">
                          Découvrir la Marketplace
                        </button>
                      </div>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative z-10">
                      <img src={slide1Img} alt="Dango Import Vision" className="max-h-[110%] object-contain origin-right drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                    </div>
                  </div>
                </div>

                {/* Slide 2 - Marketplace */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-12 flex items-center justify-between">
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%]">
                      <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                        <FaStore size={10} /> Marketplace Locale
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2">
                        Donner de la visibilité aux vendeurs
                      </h1>
                      <p className="text-xs sm:text-base text-blue-200 mb-5 line-clamp-2 sm:line-clamp-none">
                        Une plateforme conçue pour les réalités ouest-africaines, avec des commissions justes et un accompagnement humain.
                      </p>
                      <button onClick={() => navigate('/shopping')} className="bg-white hover:bg-gray-100 text-blue-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                        Soutenir nos vendeurs
                      </button>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative">
                      <img src={slide2Img} alt="Marketplace" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                    </div>
                  </div>
                </div>

                {/* Slide 3 - Import */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-r from-rose-900 to-pink-800 text-white p-6 sm:p-12 flex items-center justify-between">
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%]">
                      <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                        <FaHandshake size={10} /> Import Chine
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2">
                        Des achats B2B sécurisés
                      </h1>
                      <p className="text-xs sm:text-base text-rose-200 mb-5 line-clamp-2 sm:line-clamp-none">
                        Un service complémentaire d'importation depuis la Chine, avec un suivi de bout en bout jusqu'à la livraison.
                      </p>
                      <button onClick={() => navigate('/services')} className="bg-white hover:bg-gray-100 text-rose-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                        En savoir plus
                      </button>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative">
                      <img src={slide3Img} alt="Import Chine" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                    </div>
                  </div>
                </div>

              </Slider>
            </div>
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
          <div className="bg-[#fffbeb] p-10 rounded-2xl border border-[#fffbeb]">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Notre Vision</h2>
            <p className="text-gray-600 leading-relaxed mb-4">Nous voulons bâtir la marketplace de référence au Bénin et au Togo, où :</p>
            <ul className="space-y-4 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-[#e6c600] font-bold mt-1">✓</span>
                <span>Les acheteurs trouvent des produits de qualité à des prix justes.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#e6c600] font-bold mt-1">✓</span>
                <span>Les vendeurs locaux ont une visibilité réelle et des commissions équitables.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-[#e6c600] font-bold mt-1">✓</span>
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
                <h3 className="text-xl font-bold text-[#ffdc2b] mb-4">Priorité à la marketplace locale</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  La majorité des produits disponibles sur Dango Import proviennent de vendeurs béninois et togolais.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-[#ffdc2b] mb-4">Import Chine intelligent</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Un service complémentaire qui permet aux vendeurs de renouveler leurs stocks dans les meilleures conditions.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-[#ffdc2b] mb-4">Accompagnement humain</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nous ne sommes pas qu’une plateforme, nous sommes un partenaire qui comprend les réalités du terrain.
                </p>
              </div>
              <div className="bg-gray-800 p-8 rounded-xl border border-gray-700">
                <h3 className="text-xl font-bold text-[#ffdc2b] mb-4">Transparence</h3>
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
                <div className="w-16 h-16 mx-auto bg-[#fffbeb] text-[#e6c600] rounded-full flex items-center justify-center font-bold text-xl mb-4">1</div>
                <h3 className="font-bold text-gray-900">Confiance</h3>
                <p className="text-xs text-gray-500 mt-2">Nous travaillons chaque jour pour mériter la vôtre.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#fffbeb] text-[#e6c600] rounded-full flex items-center justify-center font-bold text-xl mb-4">2</div>
                <h3 className="font-bold text-gray-900">Proximité</h3>
                <p className="text-xs text-gray-500 mt-2">Une équipe basée au Bénin, qui comprend vos besoins.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#fffbeb] text-[#e6c600] rounded-full flex items-center justify-center font-bold text-xl mb-4">3</div>
                <h3 className="font-bold text-gray-900">Ambition</h3>
                <p className="text-xs text-gray-500 mt-2">Accompagner la croissance des entrepreneurs locaux.</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto bg-[#fffbeb] text-[#e6c600] rounded-full flex items-center justify-center font-bold text-xl mb-4">4</div>
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
        <section className="bg-[#ffdc2b] py-16 px-6 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-black text-gray-900 mb-6">Prêt à faire partie de l’aventure ?</h2>
            <div className="flex justify-center">
              <button onClick={() => navigate('/shopping')} className="bg-gray-900 hover:bg-black text-white px-8 py-3 rounded-lg font-bold transition-colors">
                Découvrir la Marketplace
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