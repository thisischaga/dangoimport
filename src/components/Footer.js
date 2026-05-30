import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTiktok, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt } from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-[#131921] text-white pt-10 sm:pt-16 pb-6 sm:pb-8 border-t-4 border-yellow-500">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 text-sm">

        {/* Col 1: Brand & About */}
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Dango Import" className="h-10 w-10 rounded-lg" />
            <h4 className="font-black text-xl tracking-tight">DANGO <span className="text-yellow-500">IMPORT</span></h4>
          </div>
          <p className="text-gray-400 leading-relaxed font-medium">
            Dango Import est la marketplace locale de référence au Bénin et au Togo. Découvrez des
            milliers de produits de vendeurs béninois et togolais. Achetez malin et vendez facilement
            avec livraison rapide.
          </p>
          <div className="flex gap-4">
            <a href="https://www.facebook.com/share/1CSKDF4dLi/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-gray-900 transition-all">
              <FaFacebook size={16} />
            </a>
            <a href="https://www.instagram.com/dango_hub?igsh=eTVnNm96eGJlODRr&utm_source=qr" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-gray-900 transition-all">
              <FaInstagram size={16} />
            </a>
            <a href="https://www.tiktok.com/@dangoimport?_r=1&_t=ZN-96ZY6iOteqM" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-yellow-500 hover:text-gray-900 transition-all">
              <FaTiktok size={16} />
            </a>
          </div>
        </div>

        {/* Col 2: Services */}
        <div className="space-y-6">
          <h4 className="font-black text-base uppercase tracking-widest text-yellow-500">Nos Services</h4>
          <ul className="space-y-3 text-gray-300 font-medium">
            <li onClick={() => navigate('/services')} className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              Sourcing International
            </li>
            <li onClick={() => navigate('/services')} className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              Logistique & Transport
            </li>
            <li onClick={() => navigate('/services')} className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              Contrôle Qualité
            </li>
            <li onClick={() => navigate('/services')} className="hover:text-yellow-500 cursor-pointer transition-colors flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
              Dango Business Pro
            </li>
          </ul>
        </div>

        {/* Col 3: Links */}
        <div className="space-y-6">
          <h4 className="font-black text-base uppercase tracking-widest text-yellow-500">Informations</h4>
          <ul className="space-y-3 text-gray-300 font-medium">
            <li onClick={() => navigate('/politique-de-confidentialité')} className="hover:text-yellow-500 cursor-pointer transition-colors">Politique de Confidentialité</li>
            <li onClick={() => navigate('/politique-de-retour')} className="hover:text-yellow-500 cursor-pointer transition-colors">Politique de Retour</li>
            <li onClick={() => navigate('/cgu')} className="hover:text-yellow-500 cursor-pointer transition-colors">CGU Dango Import</li>
            <li onClick={() => navigate('/cgu-vendeur')} className="hover:text-yellow-500 cursor-pointer transition-colors">CGU Vendeurs</li>
            <li onClick={() => navigate('/devenir-vendeur')} className="hover:text-yellow-500 cursor-pointer transition-colors font-black text-yellow-400">🛒 Devenir Vendeur</li>
            <li onClick={() => navigate('/about')} className="hover:text-yellow-500 cursor-pointer transition-colors">À propos de nous</li>
            <li onClick={() => navigate('/mentions-legales')} className="hover:text-yellow-500 cursor-pointer transition-colors">Mentions Légales</li>
            <li onClick={() => navigate('/services')} className="hover:text-yellow-500 cursor-pointer transition-colors">Aide &amp; Support</li>
          </ul>
        </div>

        {/* Col 4: Contact */}
        <div className="space-y-6">
          <h4 className="font-black text-base uppercase tracking-widest text-yellow-500">Contactez-nous</h4>
          <ul className="space-y-4 text-gray-400 font-medium">
            <li className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-yellow-500 mt-1 shrink-0" />
              <span>Îlot : CSB, AGONKANMEY<br />ABOMEY-CALAVI</span>
            </li>
            <li className="flex items-center gap-3">
              <FaPhoneAlt className="text-yellow-500 shrink-0" />
              <span>+229 0158266342</span>
            </li>
            <li className="flex items-center gap-3">
              <FaEnvelope className="text-yellow-500 shrink-0" />
              <span>contact@dangoimport.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="mt-16 border-t border-white/5 pt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex gap-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            <span onClick={() => navigate('/')} className="hover:text-white cursor-pointer transition-colors">Accueil</span>
            <span onClick={() => navigate('/shopping')} className="hover:text-white cursor-pointer transition-colors">Marketplace</span>
            <span onClick={() => navigate('/blog/articles')} className="hover:text-white cursor-pointer transition-colors">Blog</span>
          </div>
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
            © 2026 Dango Import. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;