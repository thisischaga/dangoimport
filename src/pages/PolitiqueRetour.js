import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaUndo, FaChevronRight, FaArrowUp, FaMoneyBillWave } from "react-icons/fa";

const SECTIONS = [
  {
    id: "champ",
    title: "1. Champ d’application",
    content: `La présente Politique s’applique :
• aux produits commercialisés sur la Marketplace locale Dango Import (produits proposés par des vendeurs partenaires référencés au Bénin et au Togo) ;
• aux services de livraison organisés ou coordonnés par Dango Import ;
• aux commandes spécifiques d’importation via le service Import Chine sur devis, sous réserve des dispositions particulières prévues à l’article 11 ci-dessous.`,
  },
  {
    id: "delai",
    title: "2. Délai de réclamation et de demande de retour",
    content: `Toute demande de retour, de remboursement ou de réclamation relative à un produit livré doit être introduite dans un délai maximum de soixante-douze (72) heures suivant la confirmation de livraison.

Passé ce délai :
• la commande est réputée acceptée ;
• le produit est considéré comme conforme ;
• aucune réclamation ne pourra être garantie, sauf vice caché ou garantie spécifique du vendeur.

Les demandes peuvent être adressées via l’espace client, par email, ou via le canal officiel WhatsApp de Dango Import.`,
  },
  {
    id: "conditions",
    title: "3. Conditions générales d’acceptation d’un retour",
    content: `3.1 Produit défectueux
Le produit présente un défaut de fabrication, un dysfonctionnement anormal, une casse imputable au transport ou un vice apparent constaté à réception.

3.2 Produit non conforme
Le produit livré ne correspond pas à la commande (mauvais article, mauvaise taille, mauvaise référence, caractéristiques substantielles différentes).

3.3 Produit endommagé à la livraison
Le colis ou son contenu a subi un dommage avant remise au client.`,
  },
  {
    id: "non-eligibles",
    title: "4. Produits non éligibles au retour",
    content: `Sauf disposition légale contraire, les produits suivants ne sont pas retournables :
• produits alimentaires et périssables ;
• cosmétiques et produits d’hygiène ouverts ;
• sous-vêtements ;
• produits personnalisés ou fabriqués sur mesure ;
• produits commandés spécialement pour un client ;
• produits ouverts, utilisés ou consommés au-delà d’un usage raisonnable de vérification ;
• produits détériorés par le client ;
• commandes d’importation sur devis validées (sauf cas exceptionnels).`,
  },
  {
    id: "frais",
    title: "5. Frais de retour",
    content: `5.1 Retour imputable au vendeur partenaire
Lorsque le retour résulte d’un défaut produit, d’une erreur de préparation ou d’une non-conformité, les frais de retour sont à la charge du vendeur partenaire concerné.

5.2 Retour exceptionnel (Convenance commerciale)
Lorsqu’un retour est accepté à titre de geste commercial (hors défaut ou erreur), les frais de retour sont à la charge du client.`,
  },
  {
    id: "remboursement",
    title: "6. Modalités de remboursement",
    content: `6.1 Produit défectueux / erreur vendeur
Le client bénéficie d’un remboursement comprenant le prix du produit et les frais de livraison.

6.2 Commande non livrée
En cas de commande non livrée pour une raison imputable à Dango Import ou au vendeur, le client bénéficie d’un remboursement intégral (100 %).

6.3 Délais de remboursement
Après validation, les remboursements Mobile Money sont traités sous quelques jours ouvrés. Les remboursements bancaires dépendent des délais interbancaires.`,
  },
  {
    id: "echec-livraison",
    title: "7. Livraison échouée / client absent",
    content: `En cas d’absence du client ou d’adresse incomplète, une première reprogrammation est gratuite. Toute tentative supplémentaire pourra être facturée au client selon la grille logistique applicable.`,
  },
  {
    id: "deterioration",
    title: "8. Produits détériorés par le client",
    content: `Aucun retour ni remboursement ne sera accepté lorsque le produit a été endommagé, cassé, modifié ou utilisé de manière excessive par le client.`,
  },
  {
    id: "procedure",
    title: "8. PROCÉDURE DE RETOUR",
    content: `1. Contactez le service client via WhatsApp avec le numéro de commande + photos/vidéos explicites.
2. Attendez la validation de Dango Import.
3. Retournez le produit dans son état d’origine (emballage compris).
4. Une fois le produit vérifié et accepté, le remboursement ou l’échange est traité.`
  },
  {
    id: "import",
    title: "9. CAS PARTICULIER – SERVICE IMPORT CHINE (SUR DEVIS)",
    content: `Les commandes réalisées via le service Import sur devis sont non annulables et non remboursables, sauf en cas de :
• Défaut majeur ou vice caché
• Non-conformité substantielle et manifeste
• Fraude avérée
Les acomptes versés pour le sourcing et les négociations restent acquis à Dango Import.`
  },
  {
    id: "abus",
    title: "10. LUTTE CONTRE LES ABUS",
    content: `Dango Import se réserve le droit de refuser toute demande abusive, frauduleuse ou répétée. En cas d’abus constaté, des mesures (refus de retour, suspension de compte) pourront être prises.`
  },
  {
    id: "role",
    title: "11. RÔLE DE DANGO IMPORT",
    content: `Dango Import agit en tant qu’intermédiaire et coordinateur. Elle facilite le traitement des retours tout en veillant à un équilibre équitable entre clients et vendeurs partenaires.`
  },
  {
    id: "modification",
    title: "12. MODIFICATION DE LA POLITIQUE",
    content: `Dango Import se réserve le droit de modifier cette politique à tout moment. La version en vigueur est celle publiée sur le site.`
  },
  {
    id: "contact",
    title: "13. CONTACT",
    content: `• WhatsApp / Téléphone : +229 01 58 26 63 42 / +229 01 59 38 71 80
• Email : contact@dangoimport.com
• Adresse : Abomey-Calavi, Bénin`
  },
];

export default function PolitiqueRetour() {
  const [active, setActive] = useState("champ");
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActive(id);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-emerald-900 via-slate-900 to-emerald-950 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-emerald-400/10 border border-emerald-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaUndo className="text-emerald-400 text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">Politique de Retour & Remboursement</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Dernière mise à jour : <span className="text-emerald-400 font-bold">12 mai 2026</span>
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col lg:flex-row gap-12">

        {/* Sidebar */}
        <aside className="lg:w-72 shrink-0">
          <div className="lg:sticky lg:top-28 bg-gray-50 rounded-3xl border border-gray-100 p-6">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-5">Sommaire</p>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map(s => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all ${
                    active === s.id
                      ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                      : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <FaChevronRight size={8} className="shrink-0" />
                  {s.title}
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content */}
        <article className="flex-1 min-w-0 space-y-10">
          {/* Intro box */}
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-3 text-emerald-700">
              <FaMoneyBillWave />
              <span className="font-black uppercase tracking-widest text-xs">Engagement Satisfaction</span>
            </div>
            <p className="text-sm text-emerald-900 leading-relaxed font-medium">
  PRÉAMBULE<br/>
  Chez Dango Import, nous plaçons la satisfaction du client au cœur de nos priorités tout en <br/>
  protégeant les intérêts des vendeurs partenaires et de la plateforme.<br/>
  Cette politique définit de manière claire et transparente les règles relatives aux retours, <br/>
  échanges et remboursements.<br/>
  En passant une commande sur Dango Import, le client accepte pleinement les dispositions de <br/>
  la présente politique.
</p>
          </div>

          {SECTIONS.map(s => (
            <section
              key={s.id}
              id={s.id}
              className="scroll-mt-32"
              onMouseEnter={() => setActive(s.id)}
            >
              <h2 className="text-xl font-black text-gray-900 mb-4 pb-3 border-b border-gray-100">{s.title}</h2>
              {s.content.split("\n").map((line, i) =>
                line.trim() === "" ? <div key={i} className="h-2" /> :
                line.startsWith("•") ? (
                  <p key={i} className="flex items-start gap-2 text-gray-600 text-sm leading-relaxed mb-1">
                    <span className="text-emerald-500 mt-1 shrink-0">•</span>
                    {line.slice(1).trim()}
                  </p>
                ) : line.match(/^\d+\.\d+/) ? (
                  <p key={i} className="text-gray-900 font-black text-sm mt-4 mb-1">{line}</p>
                ) : (
                  <p key={i} className="text-gray-600 text-sm leading-relaxed">{line}</p>
                )
              )}
            </section>
          ))}
        </article>
      </div>

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-emerald-500 hover:bg-emerald-400 text-white rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}
