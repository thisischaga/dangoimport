import React, { useState, useCallback, useMemo, memo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from '../utils/toast';
import API_BASE_URL from '../apiConfig';

import {
  Mail,
  PhoneCall,
  MapPin,
  Clock,
  ChevronRight,
  ShieldCheck,
  CreditCard,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

import { motion } from 'framer-motion';

/* =========================================================
   FOOTER COLUMN
========================================================= */

const FooterColumn = ({ title, links = [] }) => (
  <div className="flex flex-col">
    <h4 className="mb-3 sm:mb-4 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-100 pb-2">
      {title}
    </h4>

    <ul className="space-y-2 sm:space-y-2.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-1 text-xs sm:text-sm text-slate-600 transition-colors hover:text-[#FF6B00]"
            >
              <span>{link.label}</span>
              <ChevronRight
                size={12}
                className="opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-[#FF6B00]"
              />
            </a>
          ) : (
            <Link
              to={link.to}
              className="group inline-flex items-center gap-1 text-xs sm:text-sm text-slate-600 transition-colors hover:text-[#FF6B00]"
            >
              <span>{link.label}</span>
              <ChevronRight
                size={12}
                className="opacity-0 -translate-x-1 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-[#FF6B00]"
              />
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
);

/* =========================================================
   SOCIAL BUTTON
========================================================= */

const socialBtn = `
  flex
  h-9
  w-9
  sm:h-10
  sm:w-10
  items-center
  justify-center
  rounded-xl
  border
  border-slate-200
  bg-white
  text-slate-600
  shadow-sm
  transition-all
  duration-200
  hover:border-[#FF6B00]
  hover:bg-[#FFF3EB]
  hover:text-[#FF6B00]
`;

/* =========================================================
   PAYMENT BADGES
========================================================= */

function PaymentsGrid() {
  const methods = [
    { label: 'T-Money', bg: 'bg-[#FFDE00]/15 text-slate-800 border-yellow-300/50' },
    { label: 'Moov Money', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { label: 'MTN MoMo', bg: 'bg-yellow-50 text-amber-700 border-yellow-300' },
    { label: 'Celtiis Cash', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    { label: 'Carte Bancaire', bg: 'bg-slate-50 text-slate-700 border-slate-200' },
  ];

  return (
    <div className="mt-3">
      <div className="flex flex-wrap gap-2">
        {methods.map((m) => (
          <span
            key={m.label}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${m.bg}`}
          >
            <CreditCard size={11} className="shrink-0" />
            {m.label}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
        <ShieldCheck size={13} className="text-[#0a7a56]" />
        Paiement sécurisé et vérifié en FCFA
      </p>
    </div>
  );
}

/* =========================================================
   FOOTER
========================================================= */

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleNewsletter = useCallback(
    async (e) => {
      e?.preventDefault();

      const email = newsletterEmail.trim();

      if (!email) {
        return toast.error('Entrez une adresse e-mail valide');
      }

      setLoading(true);

      try {
        await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email });

        toast.success('Merci ! Vous êtes bien inscrit(e) à notre newsletter.');

        setNewsletterEmail('');
        setDone(true);
      } catch (err) {
        toast.error(
          err?.response?.data?.message || "Erreur lors de l'inscription"
        );
      } finally {
        setLoading(false);
      }
    },
    [newsletterEmail]
  );

  /* =======================================================
     LINKS COLUMNS
  ======================================================= */

  const columns = useMemo(
    () => ({
      company: [
        { label: 'À propos de nous', to: '/a-propos' },
        { label: 'Accueil', to: '/' },
        { label: 'Boutique', to: '/shopping' },
        { label: 'Nouveautés', to: '/nouveautes' },
        { label: 'Meilleures ventes', to: '/best-sellers' },
      ],

      services: [
        { label: 'Commandes direct usine', to: '/shopping' },
        { label: 'Fret Chine → Afrique', to: '/livraison' },
        { label: 'Suivi de commande', to: '/mes-commandes' },
        {
          label: 'Espace Vendeurs & Grossistes',
          href: 'https://business.dangoimport.com',
          external: true,
        },
      ],

      support: [
        { label: "Centre d'aide & FAQ", to: '/centre-aide' },
        { label: 'Frais & Délais d’importation', to: '/livraison' },
        { label: 'Contactez-nous', to: '/contact' },
        { label: 'Politique de retours', to: '/retours' },
      ],

      legal: [
        { label: 'Conditions générales (CGU)', to: '/cgu' },
        { label: 'Politique de confidentialité', to: '/politique-confidentialite' },
        { label: 'Remboursements', to: '/refund-policy' },
        { label: 'Mentions légales', to: '/mentions-legales' },
      ],
    }),
    []
  );

  return (
    <footer className="mt-16 bg-white border-t border-slate-200 text-slate-800 pb-24 lg:pb-8">
      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 gap-8 py-10 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 lg:gap-8"
        >
          {/* =================================================
              PRÉSENTATION MARQUE
          ================================================= */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex flex-col items-start">
              {/* Logo */}
              <Link to="/" className="inline-flex items-center gap-1 group">
                <span className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight">
                  Dango
                </span>
                <span className="text-2xl sm:text-3xl font-bold text-[#FF6B00] tracking-tight">
                  import
                </span>
              </Link>

              <p className="mt-3 text-xs sm:text-sm leading-relaxed text-slate-600 max-w-sm">
                La plateforme de référence pour commander directement auprès des fabricants en Chine et être livré en toute sécurité à Lomé et Cotonou.
              </p>

              <div className="mt-4">
                <Link
                  to="/a-propos"
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#FF6B00] hover:underline"
                >
                  En savoir plus sur notre histoire &amp; vision
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          </div>

          {/* =================================================
              COLONNES DE LIENS (2 colonnes sur mobile)
          ================================================= */}
          <div className="grid grid-cols-2 gap-6 sm:contents">
            <FooterColumn title="Entreprise" links={columns.company} />
            <FooterColumn title="Services" links={columns.services} />
          </div>

          <div className="grid grid-cols-2 gap-6 sm:contents">
            <FooterColumn title="Support" links={columns.support} />
            <FooterColumn title="Légal" links={columns.legal} />
          </div>
        </motion.div>

        {/* =====================================================
            CONTACT / NEWSLETTER / SOCIAL
        ===================================================== */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 gap-8 border-t border-slate-100 py-8 lg:grid-cols-3 lg:gap-12"
        >
          {/* =================================================
              CONTACT & PAIEMENTS
          ================================================= */}
          <div className="space-y-6">
            <div>
              <h4 className="mb-3 text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Service Client &amp; Agences
              </h4>

              <div className="space-y-2.5 text-xs sm:text-sm text-slate-600">
                <div className="flex items-start gap-2.5">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-[#FF6B00]" />
                  <span>Abomey-Calavi (Bénin) &amp; Lomé (Togo)</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <PhoneCall size={15} className="shrink-0 text-[#FF6B00]" />
                  <a
                    href="tel:+2290158266342"
                    className="font-medium text-slate-800 transition-colors hover:text-[#FF6B00]"
                  >
                    +229 0158266342
                  </a>
                  <span className="text-[11px] text-slate-400">/ Appel &amp; WhatsApp</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <Mail size={15} className="shrink-0 text-[#FF6B00]" />
                  <a
                    href="mailto:contact@dangoimport.com"
                    className="font-medium text-slate-800 break-all transition-colors hover:text-[#FF6B00]"
                  >
                    contact@dangoimport.com
                  </a>
                </div>

                <div className="flex items-center gap-2.5">
                  <Clock size={15} className="shrink-0 text-slate-400" />
                  <span>Lun–Sam · 08:30–18:30</span>
                </div>
              </div>
            </div>

            {/* PAIEMENTS */}
            <div>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                Moyens de paiement acceptés
              </h4>
              <h1>TOUS LES PAIEMENTS MOBILES DISPONIBLES AU BENIN ET AU TOGO</h1>
            </div>
          </div>

          {/* =================================================
              NEWSLETTER + RÉSEAUX SOCIAUX
          ================================================= */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 md:grid-cols-2">
              {/* NEWSLETTER */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  Restez informé des arrivages
                </h4>

                <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-slate-500">
                  Recevez nos offres exclusives, catalogues usine et bons plans d'importation en avant-première.
                </p>

                <div className="mt-3.5">
                  {done ? (
                    <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs sm:text-sm font-semibold text-emerald-800 flex items-center gap-2">
                      <ShieldCheck size={16} />
                      Merci ! Vous êtes bien inscrit(e).
                    </div>
                  ) : (
                    <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2">
                      <input
                        aria-label="Votre adresse e-mail"
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Votre adresse e-mail"
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-[#FF6B00]/15"
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="shrink-0 rounded-xl bg-[#FF6B00] px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-sm transition hover:bg-[#E55E00] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {loading ? 'Inscription…' : "S'abonner"}
                      </button>
                    </form>
                  )}
                </div>
              </div>

              {/* RÉSEAUX SOCIAUX */}
              <div>
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-900">
                  Rejoignez notre communauté
                </h4>

                <p className="mt-1.5 text-xs sm:text-sm text-slate-500">
                  Suivez les actualités des usines et de nos conteneurs sur nos réseaux sociaux.
                </p>

                <div className="mt-3.5 flex flex-wrap gap-2">
                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://wa.me/2290158266342"
                    aria-label="WhatsApp"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaWhatsapp size={16} className="text-[#25D366]" />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://facebook.com"
                    aria-label="Facebook"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaFacebookF size={15} />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://instagram.com"
                    aria-label="Instagram"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaInstagram size={15} />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://tiktok.com"
                    aria-label="TikTok"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaTiktok size={15} />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://twitter.com"
                    aria-label="X"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaTwitter size={15} />
                  </motion.a>

                  <motion.a
                    whileHover={{ scale: 1.06 }}
                    className={socialBtn}
                    href="https://linkedin.com"
                    aria-label="LinkedIn"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaLinkedinIn size={15} />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* =====================================================
            COPYRIGHT & BAS DE PAGE
        ===================================================== */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 py-6 text-center text-xs text-slate-500 sm:flex-row sm:text-left">
          <div>
            © {new Date().getFullYear()} <span className="font-bold text-slate-800">Dango Import</span>. Tous droits réservés.
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <Link to="/a-propos" className="hover:text-[#FF6B00] transition-colors">
              À propos
            </Link>
            <span>·</span>
            <Link to="/cgu" className="hover:text-[#FF6B00] transition-colors">
              Conditions générales
            </Link>
            <span>·</span>
            <Link to="/politique-confidentialite" className="hover:text-[#FF6B00] transition-colors">
              Confidentialité
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
