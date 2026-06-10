import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaSignOutAlt
} from 'react-icons/fa';
import logo from '../images/logo.jpeg';
import NotificationPanel from './NotificationPanel';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef(null);

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
    const interval = setInterval(checkAuth, 15000);
    window.addEventListener('authChange', checkAuth);
    return () => {
      clearInterval(interval);
      window.removeEventListener('authChange', checkAuth);
    };
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
    <header className={`sticky top-0 z-50 transition-all duration-300 border-b border-gray-100 ${scrolled ? 'header-scrolled' : 'bg-white'}`}>
      {/* Bandeau info */}
      <div className="bg-[#fffbeb] border-b border-[#ffdc2b]/25 text-center py-1.5 px-4">
        <p className="text-[11px] font-semibold text-[#2d3748]">
          Livraison J+1 à Cotonou · Mobile Money & Cash ·
          <button
            type="button"
            onClick={() => navigate('/services')}
            className="underline underline-offset-2 ml-1 hover:opacity-80"
          >
            Sourcing Chine
          </button>
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 shrink-0 group"
          >
            <img
              src={logo}
              alt="Dango Import"
              className="h-9 w-9 rounded-lg border border-gray-200 object-cover group-hover:border-gray-300 transition-colors"
            />
            <div className="hidden sm:block text-left">
              <p className="text-base font-black text-gray-900 leading-none tracking-tight">DANGO</p>
              <p className="text-[10px] font-bold text-gray-500 tracking-widest">IMPORT</p>
            </div>
          </button>

          {/* Recherche */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-4">
            <div className={`w-full flex items-center rounded-lg border transition-all duration-200 ${
              searchFocused ? 'border-[#e6c600]/50 bg-white shadow-sm ring-1 ring-[#ffdc2b]/20' : 'border-gray-200 bg-gray-50 hover:border-gray-300'
            }`}>
              <FaSearch className={`ml-3.5 text-sm ${searchFocused ? 'text-gray-700' : 'text-gray-400'}`} />
              <input
                ref={searchRef}
                type="text"
                placeholder="Rechercher un produit..."
                className="w-full bg-transparent border-none rounded-lg py-2.5 px-3 focus:outline-none text-sm text-gray-800 placeholder:text-gray-400"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <button
                type="submit"
                className="mr-1.5 bg-[#2d3748] text-white px-4 py-1.5 rounded-md text-xs font-bold hover:bg-[#3d4f5f] transition-colors shadow-[inset_0_-2px_0_#ffdc2b]"
              >
                Chercher
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {user ? (
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">
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
                className="hidden sm:flex items-center gap-1.5 text-gray-700 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                <FaUser size={13} /> Connexion
              </button>
            )}

            {user && <NotificationPanel />}

            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="relative flex items-center gap-1.5 border border-gray-200 hover:border-[#e6c600]/40 hover:bg-[#fffbeb] text-[#2d3748] px-3 py-2 rounded-lg transition-colors text-sm font-medium"
            >
              <FaShoppingCart size={14} />
              <span className="hidden sm:inline text-xs">Panier</span>
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-[#ffdc2b] text-[#2d3748] text-[10px] font-bold w-4.5 h-4.5 min-w-[18px] min-h-[18px] flex items-center justify-center rounded-full ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-700"
            >
              {mobileMenuOpen ? <FaTimes size={15} /> : <FaBars size={15} />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-0.5 h-10">
            {mainLinks.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => navigate(link.path)}
                className={`px-3.5 h-full text-sm font-medium transition-colors border-b-2 ${
                  isActive(link.path)
                    ? 'text-[#2d3748] border-[#e6c600]'
                    : 'text-gray-500 border-transparent hover:text-[#2d3748]'
                }`}
              >
                {link.name}
              </button>
            ))}
            <span className="ml-auto text-[11px] text-gray-400 font-medium">
              Support 24/7
            </span>
          </nav>
        </div>
      </div>

      {/* Menu mobile */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg animate-slide-down absolute w-full left-0">
          <div className="p-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                placeholder="Rechercher..."
                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 focus:outline-none focus:border-gray-900 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            <nav className="flex flex-col gap-0.5">
              {mainLinks.map((link) => (
                <button
                  key={link.name}
                  type="button"
                  onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                  className={`text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-[#fffbeb] text-[#2d3748] border-l-2 border-[#e6c600]'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {link.name}
                </button>
              ))}
            </nav>

            <div className="pt-3 border-t border-gray-100">
              {user ? (
                <div className="flex items-center justify-between px-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstname || user.userFirstname}
                  </p>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5"
                  >
                    <FaSignOutAlt size={12} /> Déconnexion
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                  className="w-full btn-brand py-2.5 rounded-lg text-sm"
                >
                  Se connecter
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
