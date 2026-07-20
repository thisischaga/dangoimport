import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import {
  FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes,
  FaSignOutAlt, FaSun, FaMoon, FaChevronDown,
  FaRegListAlt, FaGlobe
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
  const [searchFocused, setSearchFocused] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();
  const { getCartCount } = useCart();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
    setUserMenuOpen(false);
    navigate('/login');
  };

  const cartCount = getCartCount();
  const isActive = (path) => location.pathname === path;

  return (
    <header className="w-full sticky top-0 z-50 flex flex-col bg-white dark:bg-[#1a1d24] shadow-sm">

      {/* ─── 1. Thin Top Utility Bar ─── */}
      <div className="hidden md:flex items-center justify-between bg-[#f5f5f5] dark:bg-[#0d0f12] border-b border-gray-200 dark:border-gray-800 px-6 lg:px-10 h-9 text-[12px] text-[#555] dark:text-gray-400">
        <div className="flex items-center gap-5">
          <span className="cursor-pointer hover:text-[#ffdc2b] transition-colors" onClick={() => navigate('/services')}>Sourcing Chine</span>
        </div>
        <div className="flex items-center gap-5">
          <button type="button" onClick={toggleTheme} className="flex items-center gap-1.5 hover:text-[#ffdc2b] transition-colors">
            {isDarkMode ? <FaSun size={11} /> : <FaMoon size={11} />}
            <span>{isDarkMode ? 'Mode Clair' : 'Mode Sombre'}</span>
          </button>
          <div className="flex items-center gap-1.5 cursor-pointer hover:text-[#ffdc2b] transition-colors">
            <FaGlobe size={11} /> Français · FCFA
          </div>
        </div>
      </div>

      {/* ─── 2. Main Row: Logo + Search + Icons ─── */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3 md:py-4 flex items-center gap-4 md:gap-8">

        {/* Logo */}
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0 group">
          <img
            src={logo}
            alt="Dango Import"
            className="h-10 w-10 md:h-11 md:w-11 rounded-xl object-cover transition-transform duration-200 group-hover:scale-105"
          />
          <div className="text-left hidden sm:block">
            <p className="text-[17px] md:text-[20px] font-black text-[#111] dark:text-white leading-none tracking-tight">DANGO</p>
            <p className="text-[9px] md:text-[10px] font-bold text-[#ffdc2b] tracking-[0.22em] uppercase">IMPORT</p>
          </div>
        </button>

        {/* ── Big Search Bar (Desktop) ── */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1">
          <div className={`w-full flex items-stretch rounded-full overflow-hidden border-2 transition-all duration-200 ${
            searchFocused
              ? 'border-[#ffdc2b] shadow-[0_0_0_4px_rgba(255,102,0,0.10)]'
              : 'border-[#ffdc2b]'
          } bg-white dark:bg-gray-800`}>
            {/* Category dropdown hint */}
            <div className="hidden lg:flex items-center gap-1.5 px-4 border-r border-gray-200 dark:border-gray-700 text-[13px] text-[#444] dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 cursor-pointer shrink-0 select-none">
              Produits <FaChevronDown size={10} className="mt-0.5 text-gray-400" />
            </div>
            <input
              ref={searchRef}
              type="text"
              placeholder="Que recherchez-vous ?"
              className="flex-1 bg-transparent border-none py-3 px-4 focus:outline-none text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 min-w-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="px-2 text-gray-400 hover:text-gray-600 transition-colors shrink-0">
                <FaTimes size={13} />
              </button>
            )}
            <button
              type="submit"
              className="bg-[#ffdc2b] hover:bg-[#e6c600] text-[#1a202c] px-7 py-3 text-[14px] font-bold transition-colors shrink-0 flex items-center gap-2"
            >
              <FaSearch size={13} /> Rechercher
            </button>
          </div>
        </form>

        {/* ── Right Action Icons (Desktop) ── */}
        <div className="hidden md:flex items-center gap-6 shrink-0">

          {/* User */}
          <div className="relative" ref={userMenuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex flex-col items-center gap-0.5 text-[#555] dark:text-gray-300 hover:text-[#ffdc2b] dark:hover:text-[#ffdc2b] transition-colors cursor-pointer"
            >
              {user ? (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#ffdc2b] to-[#e6c600] flex items-center justify-center text-white text-[11px] font-black shadow">
                  {(user.firstname || user.userFirstname || 'U')[0].toUpperCase()}
                </div>
              ) : (
                <FaUser size={20} />
              )}
              <span className="text-[11px] font-medium leading-none">
                {user ? (user.firstname || user.userFirstname || '').split(' ')[0] : 'Se connecter'}
              </span>
            </button>

            {/* Dropdown */}
            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 py-2 z-50 animate-slide-down">
                {user ? (
                  <>
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                      <p className="text-[13px] font-black text-gray-900 dark:text-white truncate">{user.firstname || user.userFirstname}</p>
                      <p className="text-[11px] text-gray-400 truncate">{user.email || user.userEmail}</p>
                    </div>
                    <button type="button" onClick={() => { navigate('/mes-commandes'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                      <FaRegListAlt size={12} className="text-gray-400" /> Mes commandes
                    </button>
                    {user.isVendor && (
                      <button type="button" onClick={() => { navigate('/dashboard-vendeur'); setUserMenuOpen(false); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
                        <FaUser size={12} className="text-gray-400" /> Espace Vendeur
                      </button>
                    )}
                    <div className="border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
                      <button type="button" onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 text-left rounded-b-2xl">
                        <FaSignOutAlt size={12} /> Se déconnecter
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="px-4 py-4 flex flex-col gap-2">
                    <button onClick={() => { navigate('/login'); setUserMenuOpen(false); }} className="w-full bg-[#ffdc2b] hover:bg-[#e6c600] text-white font-bold py-2.5 rounded-full text-[13px] transition-colors">
                      Se connecter
                    </button>
                    <button onClick={() => { navigate('/register'); setUserMenuOpen(false); }} className="w-full border border-gray-300 dark:border-gray-700 text-[#222] dark:text-white font-bold py-2.5 rounded-full text-[13px] hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      Créer un compte
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notifications */}
          {user && (
            <div className="flex flex-col items-center gap-0.5 text-[#555] dark:text-gray-300 hover:text-[#ffdc2b] dark:hover:text-[#ffdc2b] transition-colors cursor-pointer">
              <NotificationPanel />
            </div>
          )}

          {/* Orders */}
          <button type="button" onClick={() => navigate('/mes-commandes')} className="flex flex-col items-center gap-0.5 text-[#555] dark:text-gray-300 hover:text-[#ffdc2b] dark:hover:text-[#ffdc2b] transition-colors">
            <FaRegListAlt size={20} />
            <span className="text-[11px] font-medium leading-none">Commandes</span>
          </button>

          {/* Cart */}
          <button type="button" onClick={() => navigate('/cart')} className="flex flex-col items-center gap-0.5 text-[#555] dark:text-gray-300 hover:text-[#ffdc2b] dark:hover:text-[#ffdc2b] transition-colors relative">
            <div className="relative">
              <FaShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2.5 bg-[#ffdc2b] text-white text-[9px] font-black min-w-[16px] h-[16px] px-0.5 rounded-full flex items-center justify-center border-2 border-white dark:border-[#1a1d24]">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium leading-none">Panier</span>
          </button>
        </div>

        {/* ── Mobile: Hamburger + Cart ── */}
        <div className="flex md:hidden items-center gap-3 ml-auto">
          <button type="button" onClick={toggleTheme} className="p-2 text-gray-500 dark:text-gray-400">
            {isDarkMode ? <FaSun size={16} /> : <FaMoon size={16} />}
          </button>
          <button type="button" onClick={() => navigate('/cart')} className="p-2 text-gray-700 dark:text-gray-200 relative">
            <FaShoppingCart size={20} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0.5 bg-[#ffdc2b] text-white text-[9px] font-black min-w-[15px] h-[15px] px-0.5 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button type="button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-700 dark:text-gray-200">
            {mobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* ─── 3. Dark Bottom Nav Bar (Alibaba-style) ─── */}
      <div className="hidden md:block bg-[#1a1a1a] dark:bg-[#0d0f12]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
          <nav className="flex items-center justify-between h-10">
            <div className="flex items-center gap-7 text-[13px] font-semibold text-gray-300">
              <button type="button" onClick={() => navigate('/toutes-les-categories')} className="flex items-center gap-1.5 hover:text-white transition-colors">
                <FaBars size={12} /> All categories
              </button>
              <button type="button" onClick={() => navigate('/selection-vedette')} className="hover:text-white transition-colors">Featured selection</button>
            </div>
            <div className="flex items-center gap-7 text-[12px] font-medium text-gray-400">
              <button type="button" onClick={() => navigate('/centre-aide')} className="hover:text-white transition-colors">Help center</button>
            </div>
          </nav>
        </div>
      </div>

      {/* ─── Mobile Search ─── */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex items-center bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full overflow-hidden">
          <FaSearch className="ml-3.5 text-gray-400 shrink-0" size={13} />
          <input
            type="text"
            placeholder="Rechercher..."
            className="flex-1 bg-transparent border-none py-2.5 px-3 focus:outline-none text-sm text-gray-800 dark:text-white placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit" className="bg-[#ffdc2b] text-[#1a202c] px-5 py-2.5 text-[13px] font-bold shrink-0">
            OK
          </button>
        </form>
      </div>

      {/* ─── Mobile Menu Dropdown ─── */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-2xl z-40">
          <nav className="flex flex-col py-2">
            {[
              { label: 'Accueil', path: '/' },
              { label: 'Marketplace', path: '/shopping' },
              { label: 'Toutes les catégories', path: '/toutes-les-categories' },
              { label: 'Sourcing Chine', path: '/services' },
              ...(user ? [{ label: 'Mes commandes', path: '/mes-commandes' }] : []),
              ...(user?.isVendor ? [{ label: 'Espace Vendeur', path: '/dashboard-vendeur' }] : []),
            ].map((link) => (
              <button
                key={link.path}
                type="button"
                onClick={() => { navigate(link.path); setMobileMenuOpen(false); }}
                className={`text-left px-5 py-3.5 text-[14px] font-semibold transition-colors ${
                  isActive(link.path)
                    ? 'text-[#ffdc2b] bg-orange-50 dark:bg-orange-900/10'
                    : 'text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="h-px bg-gray-100 dark:bg-gray-800 my-1" />
            {user ? (
              <button type="button" onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="text-left px-5 py-3.5 text-[14px] font-semibold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2">
                <FaSignOutAlt size={13} /> Se déconnecter
              </button>
            ) : (
              <button type="button" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }} className="text-left px-5 py-3.5 text-[14px] font-bold text-[#ffdc2b]">
                Se connecter / Créer un compte
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
