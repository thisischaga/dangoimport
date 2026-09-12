import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { FaArrowUp } from "react-icons/fa";

const SECTIONS = [
  {
    id: 'prelude',
    title: 'CONDITIONS GÉNÉRALES D’UTILISATION ET DE VENTE (CGU / CGV)',
    content: `Plateforme : dangoimport.com\nDernière mise à jour : Septembre 2026\n\nLes présentes Conditions Générales d'Utilisation et de Vente visent à définir les droits et obligations des utilisateurs de la marketplace Dangoimport opérée par DANGO HUB. Toute commande implique l'acceptation sans réserve des présentes conditions.`,
  },
  {
    id: 'mentions',
    title: 'ARTICLE 1 : MENTIONS LÉGALES ET DÉFINITIONS',
    content: `MENTIONS LÉGALES\n\nARTICLE 1 : ÉDITEUR DU SITE ET EXPLOITANT\nLes sites internet accessibles aux adresses suivantes :\n• Site Institutionnel : https://site.dangoimport.com\n• Marketplace Clients : https://dangoimport.com\n• Espace Business / Vendeurs : https://business.dangoimport.com\n\nsont édités et exploités par l'entreprise individuelle (Établissement) DANGO HUB, opérant sous le nom commercial Dango Import.\n\n• Forme juridique : Entreprise Individuelle (Établissement)\n• Siège social : Îlot : CSB, Parcelle n° CSB, Maison : Sahidou DANGO NADEY, Atlantique, Abomey-Calavi, Godomey, Agonkanmey – Bénin\n• Numéro RCCM : RB/ABC/26 A 140935\n• Numéro IFU : 0202350716611\n• Directeur de la Publication : Ayatoulaye DANGO NADEY\n• Contact Support Client : contact@dangoimport.com\n• Contact Protection des Données (DPO) : privacy@dangoimport.com\n\nARTICLE 2 : HÉBERGEMENT DES SITES ET INFRASTRUCTURE TECHNIQUE\nL’infrastructure technique de la plateforme est hébergée par des prestataires garantissant la sécurité et la haute disponibilité des services :\n\n2.1 Hébergement du Frontend (Interface Utilisateur & Site Web)\n• Hébergeur Principal et Déploiement : Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis — https://vercel.com\n• Serveur de Secours / Backup : Hostinger International Ltd., 61 Lordou Vironos Street, 6023 Larnaca, Chypre — https://hostinger.com\n\n2.2 Hébergement du Backend et Base de Données Cloud\n• Base de données et Services applicatifs : MongoDB Atlas (MongoDB, Inc.), 1633 Broadway, 38th Floor, New York, NY 10019, États-Unis — https://www.mongodb.com/cloud/atlas\n\nARTICLE 3 : PROPRIÉTÉ INTELLECTUELLE\n1. Signes Distinctifs et Marques : La dénomination sociale DANGO HUB, le nom commercial Dango Import, ainsi que les logos, chartes graphiques, slogans, visuels et éléments d'interface présents sur les sous-domaines de dangoimport.com sont la propriété exclusive de DANGO HUB ou font l'objet d'un droit d'utilisation concédé par ses partenaires.\n\n2. Droits d'Auteur : Toute reproduction, représentation, modification, publication ou adaptation de tout ou partie des éléments des sites, quel que soit le moyen ou le procédé utilisé, est interdite sans l'autorisation écrite préalable du Directeur de la publication (Ayatoulaye DANGO NADEY).\n\n3. Produits des Vendeurs Tiers : Les marques, logos et visuels de produits mis en ligne par les vendeurs partenaires restent la propriété exclusive de leurs titulaires respectifs.\n\nARTICLE 4 : PROTECTION DES DONNÉES PERSONNELLES ET COOKIES\nConformément au Livre V du Code du Numérique en République du Bénin (Loi n° 201720) et aux standards internationaux du RGPD, DANGO HUB a mis en place une politique rigoureuse de traitement et de protection des données personnelles. Pour en savoir plus sur la collecte, la conservation et l'exercice de vos droits (accès, rectification, suppression), veuillez consulter notre Politique de Confidentialité accessible sur le site.\n\nARTICLE 5 : RÈGLEMENT DES LITIGES ET JURIDICTION COMPÉTENTE\nLes présentes mentions légales sont régies par le droit béninois. En cas de litige relatif à l'utilisation de la plateforme ou aux services fournis, et à défaut de résolution amiable via la procédure de médiation interne de DANGO HUB, les Tribunaux compétents de Cotonou ou d'Abomey-Calavi (République du Bénin) seront seuls compétents.`,
  },
  {
    id: 'objet',
    title: 'ARTICLE 2 : OBJET ET CHAMP D’APPLICATION',
    content: `Les présentes CGU/CGV définissent les droits et obligations relatifs à l'utilisation de la marketplace et à l'achat de produits proposés par des Vendeurs tiers via la plateforme. Toute commande implique l'acceptation de ces CGU au moment de la validation.`,
  },
  {
    id: 'role',
    title: 'ARTICLE 3 : RÔLE ET STATUT DE LA PLATEFORME',
    content: `3.1 Courtier e‑commerce : DANGO HUB agit comme intermédiaire technique ; les contrats de vente sont conclus entre l'Acheteur et le Vendeur identifié.\n3.2 Mandat d'encaissement : DANGO HUB est mandaté par les Vendeurs pour encaisser les paiements au nom et pour le compte des Vendeurs.`,
  },
  {
    id: 'compte',
    title: 'ARTICLE 4 : CRÉATION DE COMPTE CLIENT ET SÉCURITÉ',
    content: `4.1 Inscription : l'Acheteur fournit des informations exactes et à jour (nom, téléphone, adresse).\n4.2 Confidentialité des identifiants : l'utilisateur est responsable de ses identifiants ; DANGO HUB peut suspendre/desactiver un compte en cas d'usage frauduleux.`,
  },
  {
    id: 'produits',
    title: 'ARTICLE 5 : PRODUITS ET PRIX',
    content: `Les produits sont vendus sous la responsabilité des Vendeurs. Les prix sont indiqués en Francs CFA (XOF) TTC, hors frais de livraison.`,
  },
  {
    id: 'commande_paiement',
    title: 'ARTICLE 6 : COMMANDE ET PAIEMENT',
    content: `6.1 Validation : la commande est ferme après vérification de la disponibilité et validation du paiement.\n6.2 Modalités : paiements via passerelles sécurisées (Mobile Money, cartes, etc.).\n6.3 Réserve de propriété : le produit reste la propriété du Vendeur jusqu'au paiement intégral.`,
  },
  {
    id: 'livraison',
    title: 'ARTICLE 7 : LIVRAISON ET RÉCEPTION',
    content: `7.1 Frais et délais : calculés automatiquement selon la distance.\n7.2 QR Code de livraison : un QR Code est fourni ; son scan par le livreur constitue preuve de livraison et déclenche le délai de réclamation de 48 heures.\n7.3 Absence : en cas d'absence répétée, des frais de re‑livraison peuvent être appliqués.`,
  },
  {
    id: 'retours',
    title: 'ARTICLE 8 : POLITIQUE DE RETOUR, RÉCLAMATION ET REMBOURSEMENT',
    content: `Conformément au Code du Numérique du Bénin, l'Acheteur dispose de 48 heures à compter de la réception pour émettre une réclamation pour non‑conformité, produit défectueux ou erreur de livraison. Les modalités de retour et remboursement sont précisées dans la politique de retour disponible sur le site.`,
  },
  {
    id: 'responsabilite',
    title: 'ARTICLE 9 : RESPONSABILITÉ',
    content: `DANGO HUB n'est pas responsable de l'exécution du contrat de vente imputable au Vendeur ou cas de force majeure. La plateforme met en œuvre des moyens raisonnables pour assurer la disponibilité du service mais n'en garantit pas l'absence d'interruptions.`,
  },
  {
    id: 'donnees_personnelles',
    title: 'ARTICLE 10 : PROTECTION DES DONNÉES PERSONNELLES',
    content: `Les données collectées sont nécessaires au traitement et à la livraison. L'Acheteur dispose d'un droit d'accès, rectification et suppression conformément au Code du Numérique béninois ; pour exercer ces droits : contact@dangoimport.com.`,
  },
  {
    id: 'retraits',
    title: 'ARTICLE 11 : RETRAITS VENDEUR (REMARQUE)',
    content: `Note : les modalités de retrait des Vendeurs (wallet, demandes de retrait, paiements) sont gérées par la plateforme selon les processus annoncés et les prestataires de paiement utilisés. Le paiement effectif au Vendeur n'est pas automatique et peut dépendre d'un processus de validation interne (statut pending → processing → completed/failed).`,
  },
  {
    id: 'modif',
    title: 'ARTICLE 12 : MODIFICATION DES CGU',
    content: `DANGO HUB peut modifier les CGU à tout moment ; les conditions applicables sont celles publiées au moment de la validation de la commande.`,
  },
  {
    id: 'mediation',
    title: 'ARTICLE 13 : RÈGLEMENT DES LITIGES, MÉDIATION INTERNE ET JURIDICTION',
    content: `13.1 Tentative amiable : en cas de litige, les parties s'engagent à tenter un règlement amiable.\n13.2 Procédure interne : saisir le support client à contact@dangoimport.com ou via l'espace d'assistance ; DANGO HUB peut suspendre le versement des fonds pendant la procédure.\n13.3 Juridiction : à défaut d'accord amiable, les litiges relatifs à la plateforme relèvent du droit béninois ; tribunaux compétents de Cotonou (sous réserve des règles impératives applicables aux consommateurs).`,
  },
  {
    id: 'contact',
    title: 'ARTICLE 14 : CONTACT',
    content: `DANGO HUB\nEmail : contact@dangoimport.com\nSite : https://site.dangoimport.com\nSiège : Abomey‑Calavi, Bénin`,
  },
];

export default function Cgu() {
  const [active, setActive] = useState('prelude');
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    document.title = "Conditions générales d'utilisation";
    const onScroll = () => setShowTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActive(id);
  };

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />

      <article className="max-w-3xl mx-auto px-6 py-16 space-y-10">
        <div className="bg-[#fffbeb] border-l-4 border-[#ffdc2b] p-6 rounded-r-2xl">
          <p className="text-sm text-[#2d3748] leading-relaxed font-medium">
            <strong>Important :</strong> En utilisant la plateforme Dangoimport, vous acceptez les présentes CGU dans leur intégralité. Nous vous encourageons à les lire attentivement. Pour toute question, contactez-nous à{' '}
            <a href="mailto:contact@dangoimport.com" className="underline font-bold text-[#2d3748]">contact@dangoimport.com</a>.
          </p>
          <p className="text-gray-400 text-sm md:text-base">
            Dernière mise à jour : <span className="text-[#ffdc2b] font-bold">Septembre 2026</span>
          </p>
        </div>

        <div className="prose-container space-y-10">
          {SECTIONS.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-32">
              <h2 className="text-2xl font-black text-gray-900 mb-5">{s.title}</h2>
              <div className="space-y-4">
                {s.html ? (
                  <div className="text-gray-700 text-base leading-relaxed" dangerouslySetInnerHTML={{ __html: s.content }} />
                ) : (
                  s.content.split('\n').map((line, i) => {
                    if (line.trim() === '') return null;
                    if (line.startsWith('•')) {
                      return (
                        <p key={i} className="flex items-start gap-3 text-gray-700 text-base leading-relaxed pl-4">
                          <span className="text-[#e6c600] mt-1 shrink-0 text-lg">•</span>
                          <span>{line.slice(1).trim()}</span>
                        </p>
                      );
                    }
                    if (line.match(/^\d+\.\d+/)) {
                      return <p key={i} className="text-gray-900 font-black text-base mt-6 mb-2">{line}</p>;
                    }
                    return <p key={i} className="text-gray-700 text-base leading-relaxed">{line}</p>;
                  })
                )}
              </div>
            </section>
          ))}
        </div>

        <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 text-center mt-12">
          <p className="text-gray-500 text-sm">
            Voir aussi nos{' '}
            <Link to="/cgu-vendeur" className="text-[#e6c600] font-bold underline">CGU Vendeurs</Link>
            {' '}et notre{' '}
            <Link to="/politique-de-confidentialite" className="text-[#e6c600] font-bold underline">Politique de Confidentialité</Link>
            {' '}— © 2026 Dangoimport Group. Tous droits réservés.
          </p>
        </div>
      </article>

      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-gray-900 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-[#ffdc2b] hover:text-gray-900 transition-colors"
        >
          <FaArrowUp size={14} />
        </button>
      )}

      <Footer />
    </div>
  );
}
