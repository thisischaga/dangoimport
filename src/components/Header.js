import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FaSearch, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
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

  const { getCartCount } = useCart();

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
      // Fetch latest status from server
      if (parsedUser.userEmail) {
        try {
          const res = await axios.get(`${API_BASE_URL}/api/users/me/${parsedUser.userEmail}`);
          if (res.data) {
            console.log('Données utilisateur récupérées du serveur:', res.data);
            // Mise à jour avec toutes les données du serveur
            const updatedUser = { 
              ...parsedUser, 
              isVendor: res.data.isVendor || false, 
              vendorName: res.data.vendorName || '',
              balance: res.data.balance || 0,
              bankDetails: res.data.bankDetails || {}
            };
            console.log('Profil mis à jour:', updatedUser);
            setUser(updatedUser);
            localStorage.setItem('dangoUser', JSON.stringify(updatedUser));
          }
        } catch (error) {
          console.error("Erreur rafraîchissement profil:", error);
          // En cas d'erreur, utilise les données du localStorage
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
    
    // Vérifier toutes les 15 secondes si le statut vendeur a changé
    const interval = setInterval(() => {
      checkAuth();
    }, 15000);
    
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
    { name: 'Sourcing Pro', path: '/services' }
  ];
  if (user) {
    console.log('Utilisateur connecté:', user);
    mainLinks.push({ name: 'Mes Commandes', path: '/mes-commandes' });
    if (user.isVendor) {
      mainLinks.push({ name: 'Espace Vendeur', path: '/dashboard-vendeur' });
    }
  }
  mainLinks.push({ name: 'Mentions Légales', path: '/mentions-legales' });

  // Debug: afficher l'état utilisateur
  if (user && typeof window !== 'undefined') {
    window.dangoUserDebug = user;
  }

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">

          {/* Logo */}
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer shrink-0">
            <img src={logo} alt="Dango Import" className="h-10 w-10 rounded-md border border-gray-200 object-cover" />
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900 leading-none">DANGO</h1>
              <p className="text-xs font-medium text-gray-500 mt-0.5">Import</p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-8 relative">
            <input
              type="text"
              placeholder="Rechercher un produit, une catégorie..."
              className="w-full bg-gray-100 border-none rounded-lg py-2 px-4 pl-12 focus:outline-none transition-all text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-900 text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:bg-black transition-colors"
            >
              Chercher
            </button>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-4 sm:gap-6">
            {user ? (
              <div className="hidden sm:flex items-center gap-4">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-medium text-gray-500">Bonjour,</span>
                  <span className="text-sm font-semibold text-gray-900">{user.firstname || 'Utilisateur'}</span>
                </div>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 transition-colors" title="Se déconnecter">
                  <FaSignOutAlt size={20} />
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="hidden sm:flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 transition-colors">
                <FaUser size={20} />
                <span className="text-[10px] font-semibold mt-1">Connexion</span>
              </button>
            )}

            {user && (
              <div className="flex flex-col items-center justify-center">
                <NotificationPanel />
                <span className="text-[10px] font-medium mt-1 hidden sm:block">Notifications</span>
              </div>
            )}

            <button onClick={() => navigate('/cart')} className="flex flex-col items-center justify-center text-gray-600 hover:text-gray-900 transition-colors relative">
              <div className="relative">
                <FaShoppingCart size={22} />
                {getCartCount() > 0 && (
                  <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[10px] font-semibold w-4 h-4 flex items-center justify-center rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-semibold mt-1 hidden sm:block">Panier</span>
            </button>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden text-gray-900 p-2">
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Bottom nav */}
      <div className="border-t border-gray-100 hidden md:block bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-8 h-12">
            <button className="flex items-center gap-2 font-semibold text-sm text-gray-900 hover:text-gray-700">
              <FaBars /> Toutes les catégories
            </button>
            <div className="w-px h-6 bg-gray-300"></div>
            {mainLinks.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`text-sm font-medium transition-colors ${location.pathname === link.path ? 'text-yellow-600 border-b-2 border-yellow-500 h-full' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {link.name}
              </button>
            ))}
            <div className="ml-auto">
              <span className="text-xs font-medium text-green-600 bg-green-100 px-3 py-1 rounded-full">Support 24/7</span>
            </div>
          </nav>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="p-4">
            <div className="relative mb-4">
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Rechercher..."
                  className="w-full bg-gray-100 border-none rounded-lg py-3 px-4 focus:outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </div>
            <nav className="flex flex-col gap-2">
              {mainLinks.map((link) => (
                <button
                  key={link.name}
                  onClick={() => {
                    navigate(link.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`text-left px-4 py-3 rounded-lg font-medium ${location.pathname === link.path ? 'bg-yellow-50 text-yellow-700' : 'text-gray-700 hover:bg-gray-50'}`}
                >
                  {link.name}
                </button>
              ))}
              
              {/* Auth links for mobile */}
              <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
                {user ? (
                  <>
                    <div className="px-4 py-2 flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">Compte</span>
                        <span className="text-sm font-bold text-gray-900">{user.firstname || 'Utilisateur'}</span>
                      </div>
                      <button onClick={handleLogout} className="text-red-500 text-sm font-bold flex items-center gap-2">
                        <FaSignOutAlt /> Déconnexion
                      </button>
                    </div>
                  </>
                ) : (
                  <button 
                    onClick={() => {
                      navigate('/login');
                      setMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-yellow-400 text-gray-900 font-bold"
                  >
                    <FaUser /> Se connecter
                  </button>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
