import React, { useState, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';
import { Mail, PhoneCall, MapPin, Clock } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok, FaTwitter, FaLinkedinIn } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { memo } from 'react';
import logo from '../images/logo.jpeg';
import fedapayLogo from '../images/fedapay.jfif'

const FooterColumn = ({ title, links }) => (
  <div>
    <h4 className="text-sm font-bold text-[#111] mb-4">{title}</h4>
    <ul className="space-y-2">
      {links.map((l) => (
        <li key={l.label}>
          {l.to ? (
            <Link to={l.to} className="text-sm text-[#374151] hover:text-[#F68B1E] transition-colors block" aria-label={l.label}>{l.label}</Link>
          ) : (
            <span className="text-sm text-[#374151]">{l.label}</span>
          )}
        </li>
      ))}
    </ul>
  </div>
);

const socialBtn = 'w-10 h-10 flex items-center justify-center rounded-md border border-slate-200 text-[#374151] hover:border-[#F68B1E] hover:text-[#F68B1E] transition-colors';

function PaymentsGrid() {
  return (
    <div className="flex items-center ml-0">
      <img src={fedapayLogo} alt='logo de fedapay' className="h-23 w-30" loading="lazy" />
    </div>
  );
}

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleNewsletter = useCallback(async (e) => {
    e && e.preventDefault();
    if (!newsletterEmail) return toast.error('Entrez une adresse e-mail valide');
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email: newsletterEmail });
      toast.success("Merci ! Vous êtes bien inscrit à notre newsletter.");
      setNewsletterEmail('');
      setDone(true);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Erreur lors de l\'inscription');
    } finally { setLoading(false); }
  }, [newsletterEmail]);

  const columns = useMemo(() => ({
    marketplace: [
      { label: 'Accueil', to: '/' },
      { label: 'Produits', to: '/shopping' },
      { label: 'Promotions', to: '/promotions' },
      { label: 'Nouveautés', to: '/nouveautes' },
      { label: 'Meilleures ventes', to: '/best-sellers' },
    ],
    sellers: [
      { label: 'Ouvrir une boutique', to: '/seller' },
    ],
    support: [
      { label: 'Centre d\'aide', to: '/centre-aide' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Contact', to: '/contact' },
      { label: 'Livraison', to: '/livraison' },
      
    ],

    legal: [
      { label: 'Conditions générales', to: '/cgu' },
      { label: 'Politique de confidentialité', to: '/politique-confidentialite' },
      { label: 'Retours', to: '/retours' },
      { label: 'Politique de remboursement', to: '/refund-policy' },
      { label: 'Mentions légales', to: '/mentions-legales' },
      
    ],
  }), []);

  return (
    <footer className="bg-white text-[#0f172a] mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
          {/* Presentation */}
          <div className="sm:col-span-2 md:col-span-3 lg:col-span-2">
            <div className="flex flex-col sm:flex-row items-start gap-3">
            
              <div className="min-w-0">
                <h3 className="text-lg font-bold">DangoImport</h3>
                <p className="text-sm text-[#6b7280] mt-1">Achetez et vendez en toute confiance auprès de milliers de vendeurs vérifiés. Achetez malin, livrez vite.</p>
                <p className="text-xs text-[#94a3b8] mt-3">Marketplace · Bénin & Togo</p>
              </div>
            </div>

          </div>

          {/* Columns */}
          <FooterColumn title="Marketplace" links={columns.marketplace} />
          <FooterColumn title="Vendeurs" links={columns.sellers} />
          <FooterColumn title="Support" links={columns.support} />
          <FooterColumn title="Légal" links={columns.legal} />
        </motion.div>

        {/* Contact + Newsletter + Socials */}
        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.12 }} className="mt-10 border-t pt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-bold mb-3">Contact</h4>
              <div className="text-sm text-[#374151] space-y-2">
                <div className="flex flex-wrap items-center gap-2"><MapPin size={16} className="text-[#6b7280]" /> ABOMEY-CALAVI, Bénin</div>
                <div className="flex flex-wrap items-center gap-2"><PhoneCall size={16} className="text-[#6b7280]" /> <a href="tel:+2290158266342" className="hover:text-[#F68B1E]">+229 0158266342</a></div>
                <div className="flex flex-wrap items-center gap-2"><Mail size={16} className="text-[#6b7280]" /> <a href="mailto:contact@dangoimport.com" className="hover:text-[#F68B1E]">contact@dangoimport.com</a></div>
                <div className="flex flex-wrap items-center gap-2"><Clock size={16} className="text-[#6b7280]" /> Lun–Sam 09:00–18:00</div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold mb-2">Moyens de paiement</h4>
              <PaymentsGrid />
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <h4 className="text-sm font-bold">Recevez nos meilleures offres</h4>
                <p className="text-sm text-[#6b7280]">Inscrivez-vous à la newsletter pour recevoir les promos et nouveautés.</p>
                {done ? (
                  <div className="bg-green-50 border border-green-200 rounded px-4 py-2 text-sm text-green-700">Merci ! Vous êtes inscrit(e).</div>
                ) : (
                  <form onSubmit={handleNewsletter} className="flex flex-col gap-3 md:flex-row md:items-center">
                    <input aria-label="Votre adresse e-mail" value={newsletterEmail} onChange={(e) => setNewsletterEmail(e.target.value)} placeholder="Votre adresse e-mail" className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#F68B1E]" />
                    <button type="submit" disabled={loading} className="w-full md:w-auto bg-[#F68B1E] hover:bg-[#d36f14] text-white px-4 py-2 rounded-md text-sm font-bold">{loading ? '...' : 'S\'abonner'}</button>
                  </form>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div>
                  <h4 className="text-sm font-bold">Suivez‑nous</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <motion.a whileHover={{ scale: 1.08 }} className={socialBtn} href="https://facebook.com" aria-label="Facebook" target="_blank" rel="noreferrer"><FaFacebookF /></motion.a>
                  <motion.a whileHover={{ scale: 1.08 }} className={socialBtn} href="https://instagram.com" aria-label="Instagram" target="_blank" rel="noreferrer"><FaInstagram /></motion.a>
                  <motion.a whileHover={{ scale: 1.08 }} className={socialBtn} href="https://twitter.com" aria-label="X" target="_blank" rel="noreferrer"><FaTwitter /></motion.a>
                  <motion.a whileHover={{ scale: 1.08 }} className={socialBtn} href="https://tiktok.com" aria-label="TikTok" target="_blank" rel="noreferrer"><FaTiktok /></motion.a>
                  <motion.a whileHover={{ scale: 1.08 }} className={socialBtn} href="https://linkedin.com" aria-label="LinkedIn" target="_blank" rel="noreferrer"><FaLinkedinIn /></motion.a>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="mt-8 border-t pt-6 text-sm text-[#6b7280] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>© {new Date().getFullYear()} DangoImport. Tous droits réservés.</div>
  
        </div>
      </div>
    </footer>
  );
};

export default memo(Footer);
