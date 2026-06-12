import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Footer from '../components/Footer';
import Header from '../components/Header';
import DevisForm from '../components/DevisForm';
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { 
  FaTimes, FaSearch, FaFileInvoiceDollar, FaCheckDouble, 
  FaShippingFast, FaHandshake, FaChartLine, FaEnvelopeOpenText, FaStar, FaGlobeAfrica
} from 'react-icons/fa';

import slide1Img from "../images/sourcing_slide.png";
import slide2Img from "../images/slide2.png";
import slide3Img from "../images/slide3.png";

const Services = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f9fa] text-gray-900 font-sans">
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
                autoplaySpeed={4000}
                arrows={false}
                appendDots={dots => (
                  <div style={{ bottom: '10px' }}>
                    <ul style={{ margin: "0px" }}> {dots} </ul>
                  </div>
                )}
              >
                {/* Slide 1 - Sourcing */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white p-6 sm:p-12 flex items-center justify-between relative overflow-hidden">
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-[#ffdc2b]/10 blur-[80px] rounded-full"></div>
                    <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-500/10 blur-[100px] rounded-full"></div>
                    
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%] relative">
                      <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#ffdc2b] to-[#e6c600] text-[#1a202c] text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm shadow-[#ffdc2b]/20">
                        <FaGlobeAfrica size={10} /> Import B2B
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2 tracking-tight">
                        Services sur mesure : <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdc2b] to-white">Sourcing Chine</span>
                      </h1>
                      <p className="text-xs sm:text-base text-gray-300 mb-5 line-clamp-2 sm:line-clamp-none">
                        Dango Import vous guide à chaque étape : sourcing fiable, négociation, contrôle qualité et livraison sécurisée.
                      </p>
                      <div className="flex gap-3">
                        <button onClick={() => setShowForm(true)} className="bg-[#ffdc2b] text-[#0f172a] hover:bg-[#e6c600] px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-all shadow-lg shadow-[#ffdc2b]/20">
                          Demander un devis
                        </button>
                      </div>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative z-10">
                      <img src={slide1Img} alt="Sourcing Chine Premium" className="max-h-[110%] object-contain origin-right drop-shadow-2xl hover:scale-105 transition-transform duration-500" />
                    </div>
                  </div>
                </div>

                {/* Slide 2 - Logistique */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-r from-blue-900 to-indigo-900 text-white p-6 sm:p-12 flex items-center justify-between">
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%]">
                      <span className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                        <FaShippingFast size={10} /> Livraison
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2">
                        Logistique & Expédition
                      </h1>
                      <p className="text-xs sm:text-base text-blue-200 mb-5 line-clamp-2 sm:line-clamp-none">
                        Une chaîne d'approvisionnement optimisée pour réduire vos coûts et accélérer la réception de vos marchandises.
                      </p>
                      <button onClick={() => setShowForm(true)} className="bg-white hover:bg-gray-100 text-blue-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                        Nous contacter
                      </button>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative">
                      <img src={slide2Img} alt="Logistique" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                    </div>
                  </div>
                </div>

                {/* Slide 3 - Qualité */}
                <div className="outline-none">
                  <div className="h-[280px] sm:h-[400px] bg-gradient-to-r from-rose-900 to-pink-800 text-white p-6 sm:p-12 flex items-center justify-between">
                    <div className="flex-1 z-10 max-w-[60%] sm:max-w-[50%]">
                      <span className="inline-flex items-center gap-1.5 bg-rose-100 text-rose-800 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit mb-3 shadow-sm">
                        <FaCheckDouble size={10} /> Inspection
                      </span>
                      <h1 className="text-2xl sm:text-4xl font-black leading-tight mb-2">
                        Contrôle Qualité
                      </h1>
                      <p className="text-xs sm:text-base text-rose-200 mb-5 line-clamp-2 sm:line-clamp-none">
                        Ne prenez aucun risque. Nos équipes inspectent vos produits avant l'embarquement pour garantir 100% de conformité.
                      </p>
                      <button onClick={() => navigate('/shopping')} className="bg-white hover:bg-gray-100 text-rose-900 px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-xs sm:text-sm font-black transition-colors shadow-lg">
                        Explorer nos offres
                      </button>
                    </div>
                    <div className="w-[40%] sm:w-[50%] h-full flex items-center justify-end relative">
                      <img src={slide3Img} alt="Contrôle qualité" className="max-h-[110%] object-contain origin-right drop-shadow-2xl" />
                    </div>
                  </div>
                </div>

              </Slider>
            </div>
          </div>
        </section>

        {/* PROCESS SECTION */}
        <section className="py-24 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Un processus simple et transparent</h2>
            <p className="text-gray-500 mt-4 max-w-2xl mx-auto font-medium">De la recherche de l'usine jusqu'à la livraison finale, nous nous occupons de tout pour vous garantir un import réussi.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#ffdc2b]/50 hover:shadow-[0_8px_30px_rgba(255,220,43,0.1)] transition-all group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaSearch size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">1. Sourcing</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Nous identifions les usines les plus fiables et les produits les plus compétitifs selon vos besoins spécifiques.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#ffdc2b]/50 hover:shadow-[0_8px_30px_rgba(255,220,43,0.1)] transition-all group">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaFileInvoiceDollar size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">2. Devis</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Nous envoyons un devis clair et détaillé qui inclut produit, transport, douane et nos garanties.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#ffdc2b]/50 hover:shadow-[0_8px_30px_rgba(255,220,43,0.1)] transition-all group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaCheckDouble size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">3. Qualité</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Contrôle qualité rigoureux sur place, validation des commandes et suivi permanent jusqu'à l'expédition.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 hover:border-[#ffdc2b]/50 hover:shadow-[0_8px_30px_rgba(255,220,43,0.1)] transition-all group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FaShippingFast size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">4. Livraison</h3>
              <p className="text-gray-500 text-sm leading-relaxed">Livraison directe à domicile ou en point relais sécurisé au Bénin et au Togo avec suivi régulier.</p>
            </div>
          </div>
        </section>

        {/* BENTO GRID DETAILS */}
        <section className="py-16 px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="md:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-10 text-white relative overflow-hidden flex flex-col justify-center">
              <div className="absolute -right-10 -bottom-10 opacity-10">
                <FaHandshake size={200} />
              </div>
              <div className="relative z-10 max-w-lg">
                <span className="bg-[#ffdc2b] text-gray-900 text-xs font-black uppercase px-3 py-1 rounded-full mb-4 inline-block">Partenaire de confiance</span>
                <h3 className="text-3xl font-black mb-4">Plus qu’un service, <br/> un vrai partenaire</h3>
                <p className="text-gray-300 leading-relaxed text-lg">
                  Nous apportons une expertise concrète, une communication claire et une prise en charge complète pour que votre import soit fiable et surtout rentable.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm flex flex-col justify-center">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center text-gray-900 mb-5">
                <FaChartLine size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Transparence</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Chaque commande est suivie avec des rapports clairs et des échanges réguliers afin que vous restiez informé en permanence de l'avancement.
              </p>
            </div>

            <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-[#fffbeb] text-[#d4b000] rounded-full flex items-center justify-center">
                  <FaStar size={16} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Ce qui nous distingue</h3>
              </div>
              <ul className="space-y-3">
                {['Fournisseurs strictement validés', 'Transport 100% sécurisé', 'Suivi personnalisé WhatsApp', 'Respect scrupuleux des délais'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-gray-600 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#ffdc2b]"></span> {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-2 bg-[#ffdc2b] rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8 justify-between">
              <div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Prêt à lancer votre import ?</h3>
                <p className="text-gray-800 font-medium max-w-md">Contactez-nous et obtenez une solution sur mesure pour votre première commande B2B ou B2C.</p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowForm(true)} 
                className="bg-gray-900 text-white hover:bg-black px-8 py-4 rounded-full font-black whitespace-nowrap shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center gap-2"
              >
                <FaEnvelopeOpenText /> Commencer
              </button>
            </div>

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