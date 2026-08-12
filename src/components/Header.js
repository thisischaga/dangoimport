import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Store, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../apiClient';
import { Link } from 'react-router-dom';

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

  return (
    <header
      className="border-b border-slate-200"
      style={{
        position: 'fixed',
        width: '100%',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        backgroundColor: '#fff',
        borderBottom: '1px solid #E5E7EB',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="mx-auto flex flex-wrap items-center gap-3 max-w-7xl px-4 py-3 lg:px-8">
        {/* Logo + nom du site — toujours visible (mobile & desktop) */}
        <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left flex-shrink-0">
          <div className="rounded-2xl bg-[#FF6B00] p-2 text-white shadow-sm">
            <Store size={18} />
          </div>
          <div className="min-w-0">
            <p className="hidden sm:block text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF6B00]">Marketplace</p>
            <h1 className="text-base sm:text-lg font-black text-[#111827] truncate">Dangoimport</h1>
          </div>
        </button>

        {/* Compte — masqué sur mobile, visible à partir de md */}
        <div className="hidden md:flex items-center gap-2 flex-shrink-0 ml-auto order-2">
          <div className="relative" ref={accountRef}>
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
                    {user && (
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
                    )}
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

        {/* Barre de recherche — visible sur toutes les tailles.
            Sur mobile elle passe sur sa propre ligne (w-full, order-3).
            Sur desktop elle reste centrée entre logo et compte. */}
        <div className="w-full order-3 md:order-none md:flex-1 md:w-auto flex justify-center min-w-0 relative">
          <form onSubmit={handleSearch} className="w-full min-w-0 items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm flex">
            <Search size={16} className="text-slate-500" />
            <input
              className="ml-2 min-w-0 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder:text-slate-400"
              placeholder="Cherchez un produit, une marque ou une catégorie"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
            />
            <button className="rounded-full bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white cursor-pointer" type="submit">
              Rechercher
            </button>
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
      </div>

      {/* Navigation secondaire / catégories — desktop uniquement */}
      <div className="hidden md:block bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-2 lg:px-8 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-6">
            <Link to="/category/electronique" className="hover:text-[#FF6B00] transition">Électronique</Link>
            <Link to="/category/mode" className="hover:text-[#FF6B00] transition">Mode</Link>
            <Link to="/category/maison" className="hover:text-[#FF6B00] transition">Maison</Link>
            <Link to="/category/beaute" className="hover:text-[#FF6B00] transition">Beauté</Link>
            <Link to="/category/telephones" className="hover:text-[#FF6B00] transition">Téléphones</Link>
            <Link to="/category/informatique" className="hover:text-[#FF6B00] transition">Informatique</Link>
            <Link to="/category/accessoires" className="hover:text-[#FF6B00] transition">Accessoires</Link>
            <Link to="/category/sport" className="hover:text-[#FF6B00] transition">Sport</Link>
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <span>Livraison gratuite dès 50 000 FCFA</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;