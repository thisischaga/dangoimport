import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaFileContract, FaChevronRight, FaArrowUp, FaUserTie } from "react-icons/fa";

const SECTIONS = [
  {
    id: "preambule",
    title: "1. PRÉAMBULE",
    content: `Les présentes Conditions Générales d’Utilisation – VENDEURS RÉFÉRENCÉS (CGU Vendeurs) – DANGO IMPORT MARKETPLACE\nDernière mise à jour : 21 mai 2026\n\nLes présentes Conditions Générales d’Utilisation (CGU Vendeurs) régissent la relation entre DANGO HUB (ci-après « la Plateforme ») et tout vendeur référencé sur la marketplace.\nDANGO HUB agit en tant qu’intermédiaire de mise en relation, de commercialisation, de gestion des commandes, des paiements et de la logistique.`
  },
  {
    id: "objet",
    title: "2. OBJET",
    content: `Définir les conditions d’inscription, de référencement des produits, de fixation des prix, de commissions, de paiement, de livraison, de retours et les obligations réciproques des parties.`
  },
  {
    id: "statut",
    title: "3. STATUT DU VENDEUR",
    content: `Le Vendeur agit en tant que commerçant indépendant. Il reste seul responsable de ses produits, de leur conformité légale, fiscale et commerciale.`
  },
  {
    id: "inscription",
    title: "4. INSCRIPTION ET RÉFÉRENCEMENT",
    content: `DANGO HUB se réserve le droit d’accepter, refuser, suspendre ou radier tout vendeur. Le Vendeur s’engage à fournir des informations exactes et des justificatifs (identité, RCCM, etc.) sur demande.`
  },
  {
    id: "produits",
    title: "5. PRODUITS ET MISE EN LIGNE",
    content: `Le Vendeur garantit :\n• La disponibilité réelle des produits\n• L’exactitude des descriptions et photos\n• La conformité légale et la qualité des produits. Les produits contrefaits, illicites, dangereux ou non conformes sont interdits.`
  },
  {
    id: "prix",
    title: "6. FIXATION DES PRIX",
    content: `• Le prix affiché sur la plateforme est le prix final consommateur (TTC).\n• Le prix est déterminé d’un commun accord entre DANGO HUB et le Vendeur.\n• DANGO HUB peut refuser ou demander l’ajustement d’un prix non conforme au marché.\n• Toute modification de prix doit être validée par DANGO HUB.`
  },
  {
    id: "commissions",
    title: "7. COMMISSIONS",
    content: `Phase de lancement (6 premiers mois) :\nCatégorie | Commission Dango | Minimum par commande\nMode, Beauté, Chaussures | 12 – 15 % | 500 FCFA\nMaison, Bazar, Décoration | 10 – 13 % | 500 FCFA\nÉlectronique & Accessoires | 8 – 10 % | 500 FCFA\nProduits importés via Dango Import | 7 – 10 % | 1 000 FCFA\n\n• Offre de bienvenue : 0 % de commission Dango sur les 5 premières ventes.\n• Tarif dégressif selon le volume mensuel de ventes.\n• La commission est calculée sur le prix HT et déduite automatiquement.`
  },
  {
    id: "frais-prestataires",
    title: "8. FRAIS DES PRESTATAIRES DE PAIEMENT",
    content: `Les prestataires de paiements prélèvent des frais lors du paiement final par le client (environ 2 à 4% en fonction du moyen de paiement). Ces frais sont propres aux prestataires de paiement et sont imputables au client lors de l'achat.`
  },
  {
    id: "paiement",
    title: "9. PAIEMENT ET REVERSEMENT",
    content: `• DANGO HUB encaisse l’intégralité des paiements clients.\n• Le reversement au Vendeur est effectué sous 48 heures maximum (J+2 ouvrés) après confirmation de livraison.\n• En cas de réclamation ou retour dans le délai de 7 jours, le reversement est suspendu jusqu’à résolution du litige.`
  },
  {
    id: "livraison",
    title: "10. LIVRAISON ET LOGISTIQUE",
    content: `Le Vendeur doit préparer les commandes dans un délai maximum de 12 heures après validation.\nDélais de livraison exigés : même jour pour les commandes locales et maximum 24 heures pour le Bénin et le Togo.\nLa livraison est assurée par DANGO HUB ou ses partenaires logistiques.`
  },
  {
    id: "retours",
    title: "11. RETOURS ET REMBOURSEMENTS",
    content: `Les retours et remboursements sont régis par <a href="https://dangoimport.com/politique-retour" target="_blank" rel="noopener noreferrer" style="color:#2563EB">la Politique de Retour et de Remboursement de DANGO HUB</a>. Les frais de retour sont supportés selon la responsabilité de chaque partie (Vendeur, Plateforme ou Client).`
  },
  {
    id: "interdiction",
    title: "12. INTERDICTION DE CONTACT DIRECT AVEC LES CLIENTS",
    content: `Le Vendeur s’interdit strictement de contacter directement les clients acquis via la plateforme afin de contourner DANGO HUB. Toute violation entraîne la suspension immédiate et la résiliation possible du compte.`
  },
  {
    id: "obligations",
    title: "13. OBLIGATIONS DU VENDEUR",
    content: `• Maintenir des stocks à jour\n• Respecter les délais de préparation et de qualité\n• Répondre aux réclamations clients dans les 24 heures\n• Coopérer avec DANGO HUB pour le bon fonctionnement de la marketplace.`
  },
  {
    id: "donnees",
    title: "15. DONNÉES ET CONFORMITÉ",
    content: `Le Vendeur autorise Dango Import à :
• utiliser ses données commerciales pour la gestion des ventes ;
• diffuser ses produits sur la plateforme ;
• collecter les données nécessaires à la transaction.`,
  },
  {
    id: "radiation",
    title: "16. SUSPENSION ET RADIATION",
    content: `Dango Import peut suspendre ou supprimer un Vendeur en cas de :
• fraude ;
• mauvaise qualité répétée ;
• non-respect des délais ;
• litiges multiples ;
• violation des présentes CGU.`,
  },
  {
    id: "limitation",
    title: "17. LIMITATION DE RESPONSABILITÉ",
    content: `Dango Import agit en tant qu’intermédiaire et ne saurait être responsable :
• des défauts intrinsèques des produits ;
• des informations fournies par les Vendeurs ;
• des retards imputables aux Vendeurs ;
• des comportements frauduleux des Vendeurs.`,
  },
  {
    id: "modification",
    title: "18. MODIFICATION DES CGU",
    content: `Dango Import se réserve le droit de modifier les présentes CGU à tout moment. Les Vendeurs seront informés des mises à jour.`,
  },
  {
    id: "acceptation",
    title: "19. ACCEPTATION",
    content: `L’inscription et la mise en vente sur la plateforme impliquent l’acceptation pleine et entière des présentes CGU.`,
  },
];


const CguVendeur = () => {
  const [active, setActive] = useState("preambule");
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
      <section className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 py-20 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="w-16 h-16 bg-[#ffdc2b]/10 border border-[#ffdc2b]/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <FaUserTie className="text-[#ffdc2b] text-2xl" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">CGU Vendeurs Référencés</h1>
          <p className="text-gray-400 text-sm md:text-base leading-relaxed">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">12 mai 2026</span>
          </p>
        </div>
      </section>

      <article className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 p-6 rounded-r-2xl">
          <p className="text-sm text-indigo-900 leading-relaxed font-medium">
            <strong>Espace Vendeur :</strong> En tant que partenaire référencé sur Dango Import, vous vous engagez à respecter ces conditions pour garantir la meilleure expérience client possible.
          </p>
        </div>

        <div className="prose-container space-y-8">
          {SECTIONS.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-5">{s.title}</h2>
              <div className="space-y-4">
                {s.content.split("\n").map((line, i) => {
                  if (line.trim() === "") return null;
                  if (line.startsWith("•")) {
                    return (
                      <p key={i} className="flex items-start gap-3 text-gray-700 text-base leading-relaxed pl-4">
                        <span className="text-indigo-500 mt-1 shrink-0 text-lg">•</span>
                        <span>{line.slice(1).trim()}</span>
                      </p>
                    );
                  }
                  return <p key={i} className="text-gray-700 text-base leading-relaxed">{line}</p>;
                })}
              </div>
            </section>
          ))}
        </div>
      </article>

      {/* Scroll to top */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#ffdc2b] hover:text-gray-900 transition-colors"
        >
          <FaArrowUp size={14} />
        </button>

      <Footer />
    </div>
  );
}


export default CguVendeur;
