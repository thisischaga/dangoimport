import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  ShieldCheck,
  PlaneTakeoff,
  Wallet,
  CheckCircle2,
  ArrowRight,
  Factory,
  Truck,
  Building2,
  Users2,
  Sparkles,
} from 'lucide-react';

const APropos = () => {
  return (
    <div className="min-h-screen bg-[#FDFCFB] text-slate-800 flex flex-col font-sans">
      <Header />

      <main className="flex-1">
        {/* ========================================================
            HERO SECTION
        ======================================================== */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[#FFF5ED] via-[#FFF9F5] to-[#FDFCFB] py-16 sm:py-24 border-b border-orange-100/60">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-[#FF6B00]/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#FF6B00]/5 blur-2xl pointer-events-none" />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto">
              Du fabricant jusqu’à votre porte,{' '}
              <span className="text-[#FF6B00]">sans intermédiaire.</span>
            </h1>

            <p className="mt-6 text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Dango Import simplifie l’importation de produits depuis la Chine vers le Togo et le Bénin. Nous connectons les particuliers, commerçants et entreprises directement aux meilleures usines certifiées.
            </p>

            
          </div>
        </section>

        {/* ========================================================
            CHIFFRES CLÉS / IMPACT
        ======================================================== */}
        <section className="py-12 bg-white border-b border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
              <div className="p-4 rounded-2xl ">
                <p className="text-3xl sm:text-4xl font-black text-[#000]">100%</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Direct usine certifiée</p>
              </div>
              <div className="p-4 rounded-2xl ">
                <p className="text-3xl sm:text-4xl font-black text-[#000]">20–30 j</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Délai estimé moyen</p>
              </div>
              <div className="p-4 rounded-2xl ">
                <p className="text-3xl sm:text-4xl font-black text-[#000]">0 CFA</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Frais cachés</p>
              </div>
              <div className="p-4 rounded-2xl ">
                <p className="text-3xl sm:text-4xl font-black text-[#000]">2 Pays</p>
                <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">Togo & Bénin couverts</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            NOTRE MISSION & VISION
        ======================================================== */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Qui sommes-nous ?</span>
                <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 mb-6 tracking-tight leading-snug">
                  Une plateforme pensée pour dynamiser le commerce ouest-africain.
                </h2>
                <div className="space-y-4 text-slate-600 text-sm sm:text-base leading-relaxed text-justify">
                  <p>
                    Dango Import est né d'un constat simple : importer des marchandises depuis les grands centres de production mondiaux comme la Chine a longtemps été réservé à une poignée d'initiés, freiné par la barrière linguistique, les risques de contrefaçon, la complexité des douanes et les arnaques au paiement.
                  </p>
                  <p>
                    Notre mission est de démocratiser le commerce d'importation en offrant une solution complète et transparente : vous choisissez votre produit, nous vérifions sa qualité en usine, gérons l'expédition et le dédouanement, et vous livrons directement à Lomé ou Cotonou avec paiement sécurisé par Mobile Money.
                  </p>
                </div>

                <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Transparence des coûts</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Prix produit en FCFA + fret au kilo clair.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">Paiement Mobile Money</h4>
                      <p className="text-xs text-slate-500 mt-0.5">T-Money, Moov, MTN, Celtiis & Carte.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-60 h-60 bg-[#FF6B00]/15 rounded-full blur-3xl pointer-events-none" />
                <h3 className="text-xl sm:text-2xl font-black tracking-tight mb-4 text-[#FF6B00]">Notre Vision</h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Devenir la référence incontournable de l'approvisionnement transfrontalier en Afrique de l'Ouest, en combinant technologie numérique, rigueur logistique et proximité avec nos clients.
                </p>

                <div className="border-t border-slate-700/80 pt-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200">Siège opérationnel à Lomé (Togo) et Cotonou (Bénin)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200">Équipe d'agents bilingues en Chine pour le contrôle d'usine</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-slate-200">Réseau de distribution local rapide et sécurisé</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            LES 4 PILIERS DE DANGO IMPORT
        ======================================================== */}
        <section className="py-16 bg-white border-y border-slate-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Nos engagements</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
                Pourquoi choisir Dango Import ?
              </h2>
              <p className="mt-3 text-slate-500 text-sm sm:text-base">
                Nous avons éliminé les intermédiaires pour vous offrir une chaîne d'approvisionnement sûre de bout en bout.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pilier 1 */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#FF6B00]/40 hover:shadow-md transition-all">
                
                <h3 className="text-base font-bold text-slate-900 mb-2">Direct Fabricant</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Accédez aux prix de gros réels directement sortis d'usine, sans marges de revendeurs superflues.
                </p>
              </div>

              {/* Pilier 2 */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#FF6B00]/40 hover:shadow-md transition-all">
                
                <h3 className="text-base font-bold text-slate-900 mb-2">Contrôle Qualité</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Chaque article est inspecté dans nos entrepôts de transit avant son embarquement pour l'Afrique.
                </p>
              </div>

              {/* Pilier 3 */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#FF6B00]/40 hover:shadow-md transition-all">
                
                <h3 className="text-base font-bold text-slate-900 mb-2">Fret & Dédouanement</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Tarifs clairs au kilo, gestion douanière intégrée et suivi de votre colis jusqu'à son arrivée locale.
                </p>
              </div>

              {/* Pilier 4 */}
              <div className="p-6 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:border-[#FF6B00]/40 hover:shadow-md transition-all">
                
                <h3 className="text-base font-bold text-slate-900 mb-2">Paiement Local Sécurisé</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Payez simplement en FCFA par Mobile Money (T-Money, Moov, MTN, Celtiis) sans compte en devises étrangères.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            COMMENT ÇA MARCHE ?
        ======================================================== */}
        <section className="py-16 sm:py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-xl mx-auto mb-14">
              <span className="text-xs font-bold text-[#FF6B00] uppercase tracking-wider">Processus simplifié</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-900 mt-2 tracking-tight">
                Comment fonctionne la commande ?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
              <div className="text-center relative">
                <div className="h-14 w-14 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                  1
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Sélection</h4>
                <p className="text-xs sm:text-sm text-slate-500">Parcourez le catalogue et choisissez vos articles ou faites une demande de sourcing.</p>
              </div>

              <div className="text-center relative">
                <div className="h-14 w-14 rounded-2xl bg-white border-2 border-[#FF6B00] text-[#FF6B00] font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  2
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Commande & Usine</h4>
                <p className="text-xs sm:text-sm text-slate-500">Dango Import valide la commande auprès du fabricant certifié et lance la fabrication.</p>
              </div>

              <div className="text-center relative">
                <div className="h-14 w-14 rounded-2xl bg-white border-2 border-[#FF6B00] text-[#FF6B00] font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-sm">
                  3
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Inspection & Expédition</h4>
                <p className="text-xs sm:text-sm text-slate-500">Contrôle qualité dans nos entrepôts en Chine puis expédition vers l'Afrique de l'Ouest.</p>
              </div>

              <div className="text-center relative">
                <div className="h-14 w-14 rounded-2xl bg-[#FF6B00] text-white font-black text-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-orange-500/20">
                  4
                </div>
                <h4 className="text-base font-bold text-slate-900 mb-1">Livraison locale</h4>
                <p className="text-xs sm:text-sm text-slate-500">Réceptionnez votre colis à domicile ou en point relais à Lomé et Cotonou.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================
            CALL TO ACTION
        ======================================================== */}
        <section className="py-16 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(#FF6B00_1px,transparent_1px)] [background-size:24px_24px] opacity-10" />
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-4">
              Prêt à importer vos premiers produits au meilleur prix ?
            </h2>
            <p className="text-slate-300 text-sm sm:text-base mb-8 max-w-xl mx-auto">
              Découvrez dès maintenant notre sélection d'articles en importation directe ou contactez nos experts pour vos besoins spécifiques.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                to="/shopping"
                className="px-8 py-3.5 rounded-xl bg-[#FF6B00] text-white font-bold text-sm hover:bg-[#E55E00] shadow-lg shadow-orange-500/30 transition-all"
              >
                Voir les produits
              </Link>
              <Link
                to="/centre-aide"
                className="px-8 py-3.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 font-bold text-sm hover:bg-slate-700 transition-all"
              >
                Questions fréquentes (FAQ)
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default APropos;
