import React from 'react';
import { Link } from 'react-router-dom';
import {
  FaFacebook, FaInstagram, FaTiktok, FaTwitter,
  FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
} from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const linkClass = 'text-[13px] text-[#dddddd] hover:text-white hover:underline leading-snug block py-2 sm:py-1';
const headingClass = 'text-white font-bold text-sm mb-4';

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const columns = [
    {
      title: 'Boutique',
      links: [
        { label: 'Accueil', to: '/' },
        { label: 'Tous les produits', to: '/shopping' },
        { label: 'Mon panier', to: '/cart' },
        { label: 'Blog', to: '/blog/articles' },
      ],
    },
    {
      title: 'Aide & infos',
      links: [
        { label: 'À propos', to: '/about' },
        { label: 'Services & sourcing', to: '/services' },
        { label: 'Politique de retour', to: '/politique-de-retour' },
        { label: 'Politique de confidentialité', to: '/politique-de-confidentialité' },
        { label: 'CGU', to: '/cgu' },
        { label: 'Mentions légales', to: '/mentions-legales' },
      ],
    },
    {
      title: 'Paiement & livraison',
      links: [
        { label: 'Paiement FedaPay (MTN, Moov, carte)', to: '/shopping', note: true },
        { label: 'Livraison au Bénin & Togo', to: '/services' },
        { label: 'Mes commandes', to: '/mes-commandes' },
      ],
    },
    {
      title: 'Vendeurs',
      links: [
        { label: 'Créer un compte vendeur', to: '/devenir-vendeur', highlight: true },
        { label: 'CGU vendeurs', to: '/cgu-vendeur' },
      ],
    },
  ];

  const socials = [
    { href: 'https://www.facebook.com/share/1CSKDF4dLi/?mibextid=wwXIfr', icon: FaFacebook, label: 'Facebook' },
    { href: 'https://www.instagram.com/dango_hub?igsh=eTVnNm96eGJlODRr&utm_source=qr', icon: FaInstagram, label: 'Instagram' },
    { href: 'https://www.tiktok.com/@dangoimport?_r=1&_t=ZN-96ZY6iOteqM', icon: FaTiktok, label: 'TikTok' },
    { href: 'https://twitter.com/dangoimport', icon: FaTwitter, label: 'Twitter' },
  ];

  return (
    <footer className="mt-16">
      <button
        type="button"
        onClick={scrollToTop}
        className="w-full bg-[#4a6274] hover:bg-[#5a7284] text-white text-sm py-3.5 transition-colors"
      >
        Retour en haut
      </button>

      <div className="bg-[#344955] text-[#e8eaed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 py-10 sm:py-12 grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className={headingClass}>{col.title}</h4>
              <ul className="space-y-1">
                {col.links.map((link) => (
                  <li key={link.to + link.label}>
                    {link.note ? (
                      <span className="text-[12px] text-[#999] leading-snug block py-0.5">
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        to={link.to}
                        className={`${linkClass} ${link.highlight ? '!text-[#fffbeb] font-semibold hover:!text-[#ffdc2b]' : ''}`}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-[#344955] border-t border-[#4a6274]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-10 py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Dango Import" className="h-9 w-9 rounded object-cover" />
            <div>
              <p className="text-white font-bold text-sm">Dango Import</p>
              <p className="text-[#999] text-xs">Marketplace · Bénin & Togo</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-5 text-xs text-[#cccccc]">
            <span className="flex items-center gap-2">
              <FaMapMarkerAlt size={11} className="text-[#999] shrink-0" />
              ABOMEY-CALAVI, Bénin
            </span>
            <a href="tel:+2290158266342" className="flex items-center gap-2 hover:text-white transition-colors">
              <FaPhoneAlt size={11} className="text-[#999] shrink-0" />
              +229 0158266342
            </a>
            <a href="mailto:contact@dangoimport.com" className="flex items-center gap-2 hover:text-white transition-colors">
              <FaEnvelope size={11} className="text-[#999] shrink-0" />
              contact@dangoimport.com
            </a>
          </div>

          <div className="flex gap-2">
            {socials.map(({ href, icon: Icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="w-10 h-10 sm:w-9 sm:h-9 rounded border border-[#555] flex items-center justify-center text-[#ccc] hover:border-white hover:text-white transition-colors"
              >
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#2a3640] py-5">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-[11px] text-[#999]">
          <Link to="/" className="hover:text-white transition-colors">Accueil</Link>
          <Link to="/shopping" className="hover:text-white transition-colors">Marketplace</Link>
          <Link to="/services" className="hover:text-white transition-colors">Services</Link>
          <span className="hidden sm:inline text-[#555]">|</span>
          <p>© {new Date().getFullYear()} Dango Import. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
