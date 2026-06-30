import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaSignOutAlt, FaSun, FaMoon
} from 'react-icons/fa';
import logo from '../images/logo.jpeg';
import NotificationPanel from './NotificationPanel';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { useTheme } from '../context/ThemeContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  const { getCartCount } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shopping?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const checkAuth = async () => {
    const userData = localStorage.getItem('dangoUser');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      if (parsedUser.userEmail) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/users/me/${parsedUser.userEmail}`);
          if (res.data) {
            const updatedUser = {
              ...parsedUser,
              isVendor: res.data.isVendor || false,
              vendorName: res.data.vendorName || '',
              balance: res.data.balance || 0,
              bankDetails: res.data.bankDetails || {}
            };
            setUser(updatedUser);
            localStorage.setItem('dangoUser', JSON.stringify(updatedUser));
          }
        } catch {
          setUser(parsedUser);
        }
      } else {
        setUser(parsedUser);
      }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkAuth();
    window.addEventListener('authChange', checkAuth);
    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    navigate('/login');
  };

  const mainLinks = [
    { name: 'Accueil', path: '/' },
    { name: 'Marketplace', path: '/shopping' },
    { name: 'Sourcing Pro', path: '/services' },
  ];
  if (user) {
    mainLinks.push({ name: 'Mes Commandes', path: '/mes-commandes' });
    if (user.isVendor) {
      mainLinks.push({ name: 'Espace Vendeur', path: '/dashboard-vendeur' });
    }
  }
  mainLinks.push({ name: 'Mentions Légales', path: '/mentions-legales' });

  const cartCount = getCartCount();
  const isActive = (path) => location.pathname === path;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 dark:border-gray-800 ${scrolled ? 'header-scrolled shadow-sm dark:bg-gray-900/95' : 'bg-white dark:bg-gray-900'}`}>
      {/* Bandeau info */}
      <div className="bg-[#000000] text-white text-center py-1.5 px-4 hidden md:block">
        <p className="text-[11px] font-semibold">
          Livraison J+1 à Cotonou · Mobile Money & Cash ·
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="underline underline-offset-2 ml-1 hover:opacity-80 text-[#ffdc2b]"
          >
            Sourcing Chine
          </button>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 md:h-16 md:gap-4">
          <div className="flex items-center justify-between w-full md:w-auto">
            {/* Logo */}
            <button
              type="button"
              onClick={() => navigate('/')}
              className="flex items-center gap-2.5 shrink-0 group"
            >
              <img
                src={logo}
                alt="Dango Import"
                className="h-8 w-8 md:h-9 md:w-9 rounded-lg border border-gray-200 dark:border-gray-700 object-cover group-hover:border-gray-300 transition-colors"
              />
              <div className="text-left">
                <p className="text-base font-black text-gray-900 dark:text-white leading-none tracking-tight">DANGO</p>
                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-widest">IMPORT</p>
              </div>
            </button>

            {/* Mobile Actions */}
            <div className="flex items-center gap-3 md:hidden">
              <button type="button" onClick={toggleTheme} className="text-gray-700 dark:text-gray-300">
                {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
              </button>
              {user ? (
                <button type="button" onClick={() => navigate('/mes-commandes')} className="text-gray-700 dark:text-gray-300">
                  <FaUser size={18} />
                </button>
              ) : (
                <button type="button" onClick={() => navigate('/login')} className="text-gray-700 dark:text-gray-300 text-[12px] font-bold">
                  Connexion
                </button>
              )}
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="relative flex items-center text-[#2d3748] dark:text-gray-300 px-2 py-1"
              >
                <FaShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-[#ffdc2b] text-white text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Recherche (toujours visible, prend 100% sur mobile) */}
          <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl mx-auto">
            <div className={`w-full flex items-center rounded-md border-2 transition-all duration-200 ${
              searchFocused ? 'border-[#ffdc2b] bg-white dark:bg-gray-800 shadow-sm ring-1 ring-[#ffdc2b]/20' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:border-gray-300'
            }`}>
              <FaSearch className={`ml-3.5 text-sm ${searchFocused ? 'text-gray-700' : 'text-gray-400'}`} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher des produits..."
                className="w-full bg-transparent border-none py-2 px-3 focus:outline-none text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
            </div>
          </form>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3 shrink-0">
            <button type="button" onClick={toggleTheme} className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors" title="Changer le thème">
              {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
            </button>
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-[100px] truncate">
                  {user.firstname || user.userFirstname}
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-8 h-8 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 flex items-center justify-center transition-colors"
                  title="Se déconnecter"
                >
                  <FaSignOutAlt size={14} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
              >
                <FaUser size={13} /> Connexion
              </button>
            )}

            {user && <NotificationPanel />}

            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 hover:border-[#ffdc2b]/60 hover:bg-[#fffbeb] dark:hover:bg-gray-800 text-[#2d3748] dark:text-gray-200 px-4 py-2 rounded-lg transition-colors text-sm font-bold"
            >
              <FaShoppingCart size={16} />
              <span>Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ffdc2b] text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation (Desktop) */}
      <div className="bg-[#111111] hidden md:block text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-4 h-10">
            {mainLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => navigate(link.path)}
                className="text-[13px] font-medium hover:outline hover:outline-1 hover:outline-white px-2 py-1 rounded-sm"
              >
                {link.name}
              </button>
            ))}
            <span className="ml-auto text-[13px] text-gray-300 font-bold hover:text-white cursor-pointer">
              Sourcing Chine - Devis Gratuit
            </span>
          </nav>
        </div>
      </div>


    </header>
  );
};

export default Header;
