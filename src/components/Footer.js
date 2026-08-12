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
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaTwitter,
  FaLinkedinIn,
} from 'react-icons/fa';

import { motion } from 'framer-motion';

import logo from '../images/logo.png';
import fedapayLogo from '../images/fedapay.jfif';


/* =========================================================
   FOOTER COLUMN
========================================================= */

const FooterColumn = ({ title, links = [] }) => (
  <div>
    <h4 className="mb-4 text-sm font-bold text-[#111]">
      {title}
    </h4>

    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.label}>
          {link.external ? (
            <a
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                group
                inline-flex
                items-center
                gap-1
                text-sm
                text-[#374151]
                transition-colors
                hover:text-[#F68B1E]
              "
            >
              {link.label}

              <ChevronRight
                size={13}
                className="
                  opacity-0
                  -translate-x-1
                  transition-all
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
              />
            </a>
          ) : (
            <Link
              to={link.to}
              className="
                group
                inline-flex
                items-center
                gap-1
                text-sm
                text-[#374151]
                transition-colors
                hover:text-[#F68B1E]
              "
            >
              {link.label}

              <ChevronRight
                size={13}
                className="
                  opacity-0
                  -translate-x-1
                  transition-all
                  group-hover:translate-x-0
                  group-hover:opacity-100
                "
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
  h-10
  w-10
  items-center
  justify-center
  rounded-lg
  border
  border-slate-200
  bg-white
  text-[#374151]
  shadow-sm
  transition-all
  duration-200
  hover:border-[#F68B1E]
  hover:bg-[#FFF7F0]
  hover:text-[#F68B1E]
`;


/* =========================================================
   PAYMENT METHODS
========================================================= */

function PaymentsGrid() {
  return (
    <div className="mt-3">
      <div
        className="
          inline-flex
          min-h-[62px]
          items-center
          justify-center
          border
          border-slate-200
          bg-white
          px-5
          py-3
          shadow-sm
          transition
          hover:border-[#F68B1E]/30
          hover:shadow-md
        "
      >
        <img
          src={fedapayLogo}
          alt="FedaPay"
          loading="lazy"
          className="
            block
            h-auto
            max-h-[38px]
            w-auto
            max-w-[130px]
            object-contain
          "
        />
      </div>

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
        await axios.post(
          `${API_BASE_URL}/api/newsletter/subscribe`,
          { email }
        );

        toast.success(
          'Merci ! Vous êtes bien inscrit à notre newsletter.'
        );

        setNewsletterEmail('');
        setDone(true);
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            "Erreur lors de l'inscription"
        );
      } finally {
        setLoading(false);
      }
    },
    [newsletterEmail]
  );


  /* =======================================================
     LINKS
  ======================================================= */

  const columns = useMemo(
    () => ({
      marketplace: [
        { label: 'Accueil', to: '/' },
        { label: 'Produits', to: '/shopping' },
        { label: 'Promotions', to: '/promotions' },
        { label: 'Nouveautés', to: '/nouveautes' },
        { label: 'Meilleures ventes', to: '/best-sellers' },
      ],

      sellers: [
        {
          label: 'Portail vendeur',
          href: 'https://seller.dangoimport.com',
          external: true,
        },
      ],

      support: [
        { label: "Centre d'aide", to: '/centre-aide' },
        { label: 'FAQ', to: '/faq' },
        { label: 'Contact', to: '/contact' },
        { label: 'Livraison', to: '/livraison' },
      ],

      legal: [
        { label: 'Conditions générales', to: '/cgu' },
        {
          label: 'Politique de confidentialité',
          to: '/politique-confidentialite',
        },
        { label: 'Retours', to: '/retours' },
        {
          label: 'Politique de remboursement',
          to: '/refund-policy',
        },
        {
          label: 'Mentions légales',
          to: '/mentions-legales',
        },
      ],
    }),
    []
  );


  return (
    <footer className="mt-12 bg-white text-[#0f172a]">

      {/* =====================================================
          MAIN FOOTER
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="
            grid
            grid-cols-1
            gap-10
            py-10
            sm:grid-cols-2
            md:grid-cols-3
            lg:grid-cols-6
            lg:gap-8
          "
        >

          {/* =================================================
              PRESENTATION
          ================================================= */}

          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">

            <div className="flex flex-col items-start">

              {/* Logo */}

              <Link
                to="/"
                className="inline-flex items-center"
                aria-label="DangoImport"
              >
                <img
                  src={logo}
                  alt="DangoImport"
                  loading="lazy"
                  className="
                    h-22
                    w-auto
                    max-w-[190px]
                    object-contain
                  "
                />
              </Link>

              <p className="mt-4 max-w-sm text-sm leading-6 text-[#6b7280]">
                Achetez et vendez en toute confiance auprès
                de milliers de vendeurs vérifiés. Achetez malin,
                livrez vite.
              </p>


            </div>

          </div>


          {/* =================================================
              COLUMNS
          ================================================= */}

          <FooterColumn
            title="Marketplace"
            links={columns.marketplace}
          />

          <FooterColumn
            title="Vendeurs"
            links={columns.sellers}
          />

          <FooterColumn
            title="Support"
            links={columns.support}
          />

          <FooterColumn
            title="Légal"
            links={columns.legal}
          />

        </motion.div>


        {/* =====================================================
            CONTACT / NEWSLETTER / SOCIAL
        ===================================================== */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: 0.12,
          }}
          className="
            grid
            grid-cols-1
            gap-10
            border-t
            border-slate-100
            py-8
            lg:grid-cols-3
            lg:gap-12
          "
        >

          {/* =================================================
              CONTACT
          ================================================= */}

          <div className="space-y-7">

            <div>

              <h4 className="mb-4 text-sm font-bold text-[#111]">
                Contact
              </h4>

              <div className="space-y-3 text-sm text-[#374151]">

                <div className="flex items-start gap-2.5">
                  <MapPin
                    size={16}
                    className="mt-0.5 shrink-0 text-[#6b7280]"
                  />
                  <span>
                    ABOMEY-CALAVI, Bénin
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <PhoneCall
                    size={16}
                    className="shrink-0 text-[#6b7280]"
                  />

                  <a
                    href="tel:+2290158266342"
                    className="transition-colors hover:text-[#F68B1E]"
                  >
                    +229 0158266342
                  </a>
                </div>

                <div className="flex items-center gap-2.5">

                  <Mail
                    size={16}
                    className="shrink-0 text-[#6b7280]"
                  />

                  <a
                    href="mailto:contact@dangoimport.com"
                    className="break-all transition-colors hover:text-[#F68B1E]"
                  >
                    contact@dangoimport.com
                  </a>

                </div>

                <div className="flex items-center gap-2.5">

                  <Clock
                    size={16}
                    className="shrink-0 text-[#6b7280]"
                  />

                  <span>
                    Lun–Sam · 09:00–18:00
                  </span>

                </div>

              </div>

            </div>


            {/* PAYMENT */}

            <div>

              <h4 className="text-sm font-bold text-[#111]">
                Moyens de paiement
              </h4>

              <PaymentsGrid />

            </div>

          </div>


          {/* =================================================
              NEWSLETTER + SOCIAL
          ================================================= */}

          <div className="lg:col-span-2">

            <div className="grid gap-8 md:grid-cols-2">

              {/* NEWSLETTER */}

              <div>

                <h4 className="text-sm font-bold text-[#111]">
                  Recevez nos meilleures offres
                </h4>

                <p className="mt-2 text-sm leading-6 text-[#6b7280]">
                  Inscrivez-vous à la newsletter pour recevoir
                  nos promos et nouveautés.
                </p>

                <div className="mt-4">

                  {done ? (

                    <div
                      className="
                        rounded-lg
                        border
                        border-green-200
                        bg-green-50
                        px-4
                        py-3
                        text-sm
                        font-medium
                        text-green-700
                      "
                    >
                      Merci ! Vous êtes inscrit(e).
                    </div>

                  ) : (

                    <form
                      onSubmit={handleNewsletter}
                      className="
                        flex
                        flex-col
                        gap-2
                        sm:flex-row
                      "
                    >

                      <input
                        aria-label="Votre adresse e-mail"
                        type="email"
                        value={newsletterEmail}
                        onChange={(e) =>
                          setNewsletterEmail(e.target.value)
                        }
                        placeholder="Votre adresse e-mail"
                        className="
                          min-w-0
                          flex-1
                          rounded-lg
                          border
                          border-slate-200
                          bg-white
                          px-3
                          py-2.5
                          text-sm
                          outline-none
                          transition
                          focus:border-[#F68B1E]
                          focus:ring-2
                          focus:ring-[#F68B1E]/15
                        "
                      />

                      <button
                        type="submit"
                        disabled={loading}
                        className="
                          shrink-0
                          rounded-lg
                          bg-[#F68B1E]
                          px-5
                          py-2.5
                          text-sm
                          font-bold
                          text-white
                          shadow-sm
                          transition
                          hover:bg-[#d36f14]
                          disabled:cursor-not-allowed
                          disabled:opacity-60
                        "
                      >
                        {loading ? '...' : "S'abonner"}
                      </button>

                    </form>

                  )}

                </div>

              </div>


              {/* SOCIAL */}

              <div>

                <h4 className="text-sm font-bold text-[#111]">
                  Suivez-nous
                </h4>

                <p className="mt-2 text-sm text-[#6b7280]">
                  Retrouvez Dangoimport sur nos réseaux sociaux.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">

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
            COPYRIGHT
        ===================================================== */}

        <div
          className="
            flex
            flex-col
            items-center
            justify-between
            gap-3
            border-t
            border-slate-100
            py-6
            text-center
            text-sm
            text-[#6b7280]
            sm:flex-row
            sm:text-left
          "
        >

          <div>
            © {new Date().getFullYear()} Dango Hub.
            Tous droits réservés.
          </div>

          <div className="text-xs text-slate-400">
            Marketplace · Bénin & Togo
          </div>

        </div>

      </div>

    </footer>
  );
};

export default memo(Footer);