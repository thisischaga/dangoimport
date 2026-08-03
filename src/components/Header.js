import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Store, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';
import client from '../apiClient';

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shopping' },
  { label: 'Mes commandes', to: '/mes-commandes' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

const SEARCH_FALLBACK_TERMS = [
  'T-shirt',
  'Chaussures',
  'Sac à dos',
  'Smartphone',
  'Parfum',
  'Montre',
  'Chargeur',
  'Écouteurs',
];

function buildSearchSuggestions(items, query) {
  const normalizedQuery = String(query || '').toLowerCase().trim();
  const unique = new Set();

  for (const item of items) {
    const name = item?.name;
    if (typeof name !== 'string') continue;
    const trimmedName = name.trim();
    if (!trimmedName) continue;
    const normalizedName = trimmedName.toLowerCase();

    if (normalizedName === normalizedQuery) continue;
    if (normalizedName.includes(normalizedQuery)) {
      unique.add(trimmedName);
    }
  }

  return Array.from(unique).slice(0, 6).map((value) => String(value));
}

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const suggestionTimer = useRef(null);


  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('dangoUser');
      if (stored) {
        try { setUser(JSON.parse(stored)); } catch { setUser(null); }
      } else {
        setUser(null);
      }
    };
    loadUser();
    window.addEventListener('authChange', loadUser);
    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  useEffect(() => {
    const query = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(query);
  }, [location.search]);

  useEffect(() => {
    if (suggestionTimer.current) {
      clearTimeout(suggestionTimer.current);
    }

    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);
    suggestionTimer.current = window.setTimeout(async () => {
      try {
        const response = await client.get(`/products?limit=10&search=${encodeURIComponent(trimmed)}`);
        const items = Array.isArray(response?.data?.data)
          ? response.data.data
          : [];
        const terms = buildSearchSuggestions(items, trimmed).filter((term) => typeof term === 'string');
        setSuggestions(terms.length > 0
          ? terms
          : SEARCH_FALLBACK_TERMS.filter((term) => term.toLowerCase().includes(trimmed.toLowerCase()) && term.toLowerCase() !== trimmed.toLowerCase())
        );
      } catch {
        setSuggestions(SEARCH_FALLBACK_TERMS.filter((term) => term.toLowerCase().includes(trimmed.toLowerCase()) && term.toLowerCase() !== trimmed.toLowerCase()));
      } finally {
        setSuggestionLoading(false);
      }
    }, 250);

    return () => {
      if (suggestionTimer.current) {
        clearTimeout(suggestionTimer.current);
      }
    };
  }, [searchQuery]);

  const handleLogout = () => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSuggestionSelect = (term) => {
    const normalizedTerm = String(term || '').trim();
    if (!normalizedTerm) return;
    setSearchQuery(normalizedTerm);
    setShowSuggestions(false);
    navigate(`/shopping?q=${encodeURIComponent(normalizedTerm)}`);
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const userDisplayName = user?.userFirstname || user?.firstname || user?.userName || user?.name || 'Compte';
  const userEmail = user?.userEmail || user?.email || '';
  const userSurname = user?.userSurname || user?.surname || '';

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    };

    window.addEventListener('pointerdown', handleClickOutside);
    return () => {
      window.removeEventListener('pointerdown', handleClickOutside);
    };
  }, []);

  const cartCount = getCartCount();

  return (
    <header className="border-b border-slate-200 bg-[#FFF7F1]">
      <div className="mx-auto flex flex-wrap items-center justify-between gap-3 max-w-7xl px-4 py-3 lg:px-8">
        {/* Logo and nav */}
        <div className="flex flex-1 min-w-0 items-center gap-3">
          <button type="button" aria-label="Ouvrir le menu" onClick={() => setDrawerOpen(true)} className="md:hidden p-2 rounded-md text-slate-700 flex-shrink-0 cursor-pointer">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left flex-shrink-0">
            <div className="rounded-2xl bg-[#FF6B00] p-2 text-white shadow-sm">
              <Store size={18} />
            </div>
            <div className="hidden sm:block min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF6B00]">Marketplace</p>
              <h1 className="text-lg font-black text-[#111827] truncate">Dangoimport.com</h1>
            </div>
          </button>

        </div>

        {/* Search + actions */}
        <div className="flex flex-1 min-w-0 items-center gap-2 justify-end">
          <div className="hidden md:flex flex-1 justify-center min-w-0 relative">
            <form onSubmit={handleSearch} className="w-full max-w-[950px] min-w-0 items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm flex">
              <Search size={16} className="text-slate-500" />
              <input
                className="ml-2 min-w-0 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder:text-slate-400"
                placeholder="Cherchez un produit, une marque ou une catégorie"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
              />
              <button className="rounded-full bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white" type="submit">Rechercher</button>
            </form>

            {showSuggestions && (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">
                  Suggestions de recherche
                </div>

                {suggestionLoading ? (
                  <div className="px-4 py-3 text-sm text-slate-500">Recherche...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((term) => (
                    <button
                      key={term}
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionSelect(term)}
                      className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 transition"
                    >
                      <div className="font-medium">{term}</div>
                    </button>
                  ))
                ) : (
                  <div className="space-y-2 px-4 py-3">
                    <p className="text-sm text-slate-500">Pas de terme exact, essayez :</p>
                    <div className="flex flex-wrap gap-2">
                      {SEARCH_FALLBACK_TERMS.filter((term) => term.toLowerCase() !== searchQuery.toLowerCase()).map((term) => (
                        <button
                          key={term}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSuggestionSelect(term)}
                          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
            <button onClick={() => setMobileSearchOpen(true)} className="md:hidden rounded-full border border-slate-200 bg-white p-2 text-slate-600">
              <Search size={18} />
            </button>

            <button type="button" onClick={() => navigate('/cart')} className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white whitespace-nowrap cursor-pointer">
              <ShoppingCart size={16} />
              <span className="hidden sm:inline">Panier</span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#111827]">{cartCount > 99 ? '99+' : cartCount}</span>
            </button>

            <div className="hidden md:flex relative" ref={accountRef}>
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => setAccountOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 cursor-pointer"
              >
                <span>{user?.userFirstname ? `${user.userFirstname}` : 'Compte'}</span>
                <ChevronDown size={16} />
              </button>

              <AnimatePresence>
                {accountOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    onPointerDown={(e) => e.stopPropagation()}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    className="absolute right-0 mt-2 w-72 z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
                  >
                    <div className="px-4 py-4">
                      {user ? (
                        <>
                          <p className="text-sm font-semibold text-slate-900">{userDisplayName} {userSurname}</p>
                          <p className="text-sm text-slate-500">{userEmail}</p>
                        </>
                      ) : (
                        <div className="flex items-center justify-center">
                          <p className="text-sm text-slate-500 text-center">Aucun utilisateur connecté</p>
                        </div>
                      )}
                    </div>
                    <div className="border-t border-slate-100 px-4 py-3 space-y-2">
                      <button
                        type="button"
                        onClick={() => {
                          navigate('/mes-commandes');
                          setAccountOpen(false);
                        }}
                        className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer flex justify-center items-center"
                      >
                        Mes commandes
                      </button>
                      {user ? (
                        <button
                          type="button"
                          onClick={() => {
                            handleLogout();
                            setAccountOpen(false);
                          }}
                          className="w-full rounded-2xl bg-[#FFF7F1] px-4 py-3 text-center text-sm font-semibold text-[#FF6B00] hover:bg-[#FEF1E6] cursor-pointer flex justify-center items-center"
                        >
                          Déconnexion
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            navigate('/login');
                            setAccountOpen(false);
                          }}
                          className="w-full rounded-2xl bg-[#FFF7F1] px-4 py-3 text-center text-sm font-semibold text-[#FF6B00] hover:bg-[#FEF1E6] cursor-pointer flex justify-center items-center"
                        >
                          Se connecter
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer + mobile search overlays */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative z-10 w-80 max-w-full h-full bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative p-4 border-b text-center">
                <div className="flex items-center justify-center gap-3">
                  <div className="rounded-2xl bg-[#FF6B00] p-2 text-white"><Store size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#FF6B00]">Marketplace</p>
                    <h2 className="font-black">Dangoimport</h2>
                  </div>
                </div>
                <button type="button" aria-label="Fermer" onClick={() => setDrawerOpen(false)} className="absolute right-4 top-4 p-2 cursor-pointer">
                  <X size={18} />
                </button>
              </div>

              <nav className="px-4 py-6 space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.to}
                    type="button"
                    onClick={() => {
                      navigate(item.to);
                      setDrawerOpen(false);
                    }}
                    className="w-full rounded-2xl px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto border-t px-4 py-5 space-y-3">
                {user ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      setDrawerOpen(false);
                    }}
                    className="w-full rounded-full border border-slate-200 bg-[#FFF7F1] px-4 py-3 text-center text-sm font-semibold text-[#FF6B00] cursor-pointer flex justify-center items-center"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      navigate('/login');
                      setDrawerOpen(false);
                    }}
                    className="w-full rounded-full border border-slate-200 bg-[#FFF7F1] px-4 py-3 text-center text-sm font-semibold text-[#FF6B00] cursor-pointer flex justify-center items-center"
                  >
                    Se connecter
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    navigate('/cart');
                    setDrawerOpen(false);
                  }}
                  className="w-full rounded-full bg-[#FF6B00] px-4 py-3 text-center text-sm font-semibold text-white cursor-pointer flex justify-center items-center"
                >
                  Voir mon panier ({cartCount > 99 ? '99+' : cartCount})
                </button>
              </div>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {mobileSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-start pt-12 px-4">
            <div className="absolute inset-0 bg-black/30" onClick={() => setMobileSearchOpen(false)} />
            <motion.div initial={{ y: -20 }} animate={{ y: 0 }} exit={{ y: -20 }} className="relative w-full max-w-2xl mx-auto z-50">
              <form onSubmit={(e) => { handleSearch(e); setMobileSearchOpen(false); }} className="flex items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow">
                <Search size={16} className="text-slate-500" />
                <input autoFocus className="ml-2 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-0" placeholder="Cherchez un produit, une marque ou une catégorie" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                <button className="rounded-full bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white" type="submit">Rechercher</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
