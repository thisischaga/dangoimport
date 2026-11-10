import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, Menu, ShoppingCart, LogOut, ShoppingBag, Home, User, X } from 'lucide-react';
import client from '../apiClient';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/imageUrl';
import PhoneUpdateBanner from './PhoneUpdateBanner';

// Exports de compatibilité pour les autres pages
export const CATEGORY_LINKS = [];
export const QUICK_LINKS = [];

export function buildCategoryHref(name, slug = '') {
  const safe = (name || slug || '').trim();
  if (!safe) return '/shopping';
  return `/shopping?category=${encodeURIComponent(safe)}`;
}

const SEARCH_FALLBACK_TERMS = ['Chaussures', 'Smartphone', 'Montre', 'Écouteurs', 'Sac à dos', 'T-shirt'];

function buildSearchSuggestions(items, query) {
  const q = String(query || '').toLowerCase().trim();
  const unique = new Set();
  for (const item of items) {
    const name = typeof item?.name === 'string' ? item.name.trim() : '';
    if (!name) continue;
    const n = name.toLowerCase();
    if (n !== q && n.includes(q)) unique.add(name);
  }
  return Array.from(unique).slice(0, 6);
}

function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Accueil Dango import"
      className="flex shrink-0 items-center gap-1.5"
    >
      <span className="text-[22px] font-black tracking-tight text-slate-900 md:text-[24px] lg:text-[26px]">Dango</span>
      <span className="rounded-lg bg-[#FF6B00] px-2 py-0.5 text-[15px] font-black leading-none text-white md:text-[16px] lg:px-2.5 lg:py-1 lg:text-[18px]">
        import
      </span>
    </button>
  );
}

const Header = () => {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const [catOpen, setCatOpen] = useState(false);
  const [activeCatKey, setActiveCatKey] = useState(null);
  const catTriggerRef = useRef(null);
  const catPanelRef = useRef(null);
  const catCloseTimer = useRef(null);

  // Hauteur réelle du header : sert d'espaceur et suit les changements de taille
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const update = () => {
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  useEffect(() => {
    const load = () => {
      const stored = localStorage.getItem('dangoUser');
      try { setUser(stored ? JSON.parse(stored) : null); } catch { setUser(null); }
    };
    load();
    window.addEventListener('authChange', load);
    return () => window.removeEventListener('authChange', load);
  }, []);

  const { data: categories = [], isLoading: catLoading, isError: catError } = useQuery({
    queryKey: ['headerCategories'],
    queryFn: async () => {
      const res = await client.get('/categories');
      const raw = res?.data?.data || res?.data?.categories || res?.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 300_000,
  });

  const activeCategory = useMemo(
    () => categories.find((c) => (c.slug || c.name) === activeCatKey) || categories[0] || null,
    [categories, activeCatKey],
  );
  const activeName = activeCategory?.name;

  const { data: categoryProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['headerCatProducts', activeName],
    enabled: Boolean(activeName),
    queryFn: async () => {
      const res = await client.get(`/products?category=${encodeURIComponent(activeName)}&limit=8`);
      const d = res?.data;
      if (Array.isArray(d?.data)) return d.data;
      if (Array.isArray(d?.products)) return d.products;
      if (Array.isArray(d)) return d;
      return [];
    },
    staleTime: 120_000,
  });

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  useEffect(() => {
    setCatOpen(false);
    setAccountOpen(false);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (mobileSearchOpen) mobileSearchInputRef.current?.focus();
  }, [mobileSearchOpen]);

  useEffect(() => {
    const trimmed = searchQuery.trim();
    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return undefined;
    }
    setSuggestionLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await client.get(`/products?limit=8&search=${encodeURIComponent(trimmed)}`);
        const items = Array.isArray(res?.data?.data) ? res.data.data : [];
        const terms = buildSearchSuggestions(items, trimmed);
        setSuggestions(terms.length > 0 ? terms : SEARCH_FALLBACK_TERMS.slice(0, 5));
      } catch {
        setSuggestions(SEARCH_FALLBACK_TERMS.slice(0, 5));
      } finally {
        setSuggestionLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    const onPointerDown = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
      const inCat = catTriggerRef.current?.contains(e.target) || catPanelRef.current?.contains(e.target);
      if (!inCat) setCatOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, []);

  const openCats = useCallback(() => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    setCatOpen(true);
  }, []);
  const closeCatsLater = useCallback(() => {
    catCloseTimer.current = setTimeout(() => setCatOpen(false), 180);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    window.dispatchEvent(new Event('authChange'));
    setAccountOpen(false);
    navigate('/');
  }, [navigate]);

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSelectSuggestion = (term) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    navigate(`/shopping?q=${encodeURIComponent(term)}`);
  };

  const userName = useMemo(
    () => user?.userFirstname || user?.firstname || user?.name || user?.userName || '',
    [user],
  );

  const onHome = location.pathname === '/';
  const onCart = location.pathname.startsWith('/cart');
  const onAccount = location.pathname.startsWith('/mes-commandes') || location.pathname.startsWith('/login');

  const suggestionsPanel = (
    <AnimatePresence>
      {showSuggestions && (searchQuery.trim().length >= 2 || suggestions.length > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-xl"
        >
          <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {suggestionLoading ? 'Recherche en cours...' : 'Suggestions'}
          </div>
          <ul className="py-1">
            {suggestions.map((term) => (
              <li key={term}>
                <button
                  type="button"
                  onClick={() => handleSelectSuggestion(term)}
                  className="flex w-full items-center px-4 py-2.5 text-left text-sm font-semibold text-slate-700 transition hover:bg-orange-50 hover:text-[#FF6B00]"
                >
                  {term}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <header
        ref={headerRef}
        className="fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {user && <PhoneUpdateBanner user={user} onUpdated={setUser} />}

        <div className="mx-auto flex h-[60px] max-w-[1280px] items-center gap-3 px-4 md:h-[68px] md:gap-4 md:px-6 lg:h-[76px] lg:gap-6 lg:px-8">

          {/* MOBILE : recherche ouverte, remplace le logo sur la ligne */}
          {mobileSearchOpen && (
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-11 min-w-0 flex-1 items-stretch overflow-hidden rounded-md border border-[#FF6B00] bg-white md:hidden"
            >
              <input
                ref={mobileSearchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un produit..."
                className="min-w-0 flex-1 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button type="submit" aria-label="Rechercher" className="flex w-11 shrink-0 items-center justify-center bg-[#FF6B00] text-white">
                <Search size={18} />
              </button>
              <button
                type="button"
                onClick={() => setMobileSearchOpen(false)}
                aria-label="Fermer la recherche"
                className="flex w-11 shrink-0 items-center justify-center text-slate-600"
              >
                <X size={20} />
              </button>
            </form>
          )}

          {/* MOBILE : logo + loupe */}
          {!mobileSearchOpen && (
            <>
              <BrandLogo onClick={() => navigate('/')} />
              <button
                type="button"
                onClick={() => setMobileSearchOpen(true)}
                aria-label="Ouvrir la recherche"
                className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-800 transition hover:bg-slate-100 md:hidden"
              >
                <Search size={22} />
              </button>
            </>
          )}

          {/* TABLETTE + DESKTOP : logo */}
          <div className="hidden md:flex">
            <BrandLogo onClick={() => navigate('/')} />
          </div>

          {/* DESKTOP : bouton catégories avec libellé (lg et plus) */}
          <div
            ref={catTriggerRef}
            className="relative hidden lg:block"
            onMouseEnter={openCats}
            onMouseLeave={closeCatsLater}
          >
            <button
              type="button"
              onClick={() => setCatOpen((v) => !v)}
              aria-expanded={catOpen}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-bold text-slate-900 transition hover:text-[#FF6B00]"
            >
              <Menu size={22} />
              <span>Catégories</span>
            </button>
          </div>

          {/* TABLETTE + DESKTOP : recherche */}
          <div ref={searchRef} className="relative hidden min-w-0 flex-1 md:block">
            <form
              onSubmit={handleSearchSubmit}
              className="flex h-11 items-stretch overflow-hidden rounded-md border border-slate-300 bg-white transition focus-within:border-[#FF6B00] lg:h-12"
            >
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Rechercher un produit..."
                className="min-w-0 flex-1 bg-transparent px-4 text-[15px] text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                aria-label="Rechercher"
                className="flex w-12 shrink-0 items-center justify-center bg-[#FF6B00] text-white transition hover:bg-[#E85F00] lg:w-14"
              >
                <Search size={20} />
              </button>
            </form>
            {suggestionsPanel}
          </div>

          {/* TABLETTE + DESKTOP : panier et compte */}
          {!mobileSearchOpen && (
            <div className="ml-auto hidden shrink-0 items-center gap-2 md:flex lg:gap-3">
              <Link
                to="/cart"
                aria-label={`Panier (${cartCount} articles)`}
                className="relative flex h-10 items-center gap-2 rounded-md px-2 text-slate-800 transition hover:text-[#FF6B00]"
              >
                <span className="relative">
                  <ShoppingCart size={24} />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[11px] font-bold text-white">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden text-sm font-bold lg:inline">Panier</span>
              </Link>

              <div className="relative" ref={accountRef}>
                {user ? (
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    aria-expanded={accountOpen}
                    className="flex h-10 items-center gap-2 rounded-md border border-[#FF6B00] px-3 text-sm font-bold text-[#FF6B00] transition hover:bg-orange-50"
                  >
                    <span className="max-w-[90px] truncate lg:max-w-[110px]">{userName || 'Compte'}</span>
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="flex h-10 items-center rounded-md border border-[#FF6B00] px-3 text-sm font-bold text-[#FF6B00] transition hover:bg-orange-50 lg:px-4"
                  >
                    Se connecter
                  </Link>
                )}

                <AnimatePresence>
                  {accountOpen && user && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-50 mt-2 w-64 rounded-md border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      <div className="border-b border-slate-100 px-3 py-2">
                        <p className="text-sm font-bold text-slate-900">{userName}</p>
                        <p className="truncate text-xs text-slate-500">{user.userEmail || user.email}</p>
                      </div>
                      <Link
                        to="/mes-commandes"
                        onClick={() => setAccountOpen(false)}
                        className="flex items-center gap-2.5 rounded px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-[#FF6B00]"
                      >
                        <ShoppingBag size={16} className="text-slate-400" />
                        <span>Mes commandes</span>
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2.5 rounded px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
                      >
                        <LogOut size={16} />
                        <span>Déconnexion</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          )}
        </div>

        {/* Panneau catégories (desktop) */}
        <AnimatePresence>
          {catOpen && (
            <motion.div
              ref={catPanelRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.16 }}
              onMouseEnter={openCats}
              onMouseLeave={closeCatsLater}
              className="absolute left-0 right-0 top-full z-50 hidden flex-col border-t border-slate-200 bg-white shadow-2xl lg:flex lg:h-[60vh] lg:flex-row"
            >
              <div className="w-full overflow-y-auto bg-slate-50 py-4 lg:w-[300px] lg:shrink-0 lg:border-r lg:border-slate-200">
                <p className="px-5 pb-2 text-[12px] font-black uppercase tracking-wider text-slate-500">Catégories</p>

                {catLoading && <p className="px-5 py-6 text-sm font-bold text-slate-400">Chargement...</p>}
                {catError && <p className="px-5 py-6 text-sm font-bold text-slate-500">Impossible de charger les catégories</p>}
                {!catLoading && !catError && categories.length === 0 && (
                  <p className="px-5 py-6 text-sm font-bold text-slate-500">Aucune catégorie trouvée</p>
                )}

                {categories.map((cat) => {
                  const key = cat.slug || cat.name;
                  const selected = activeCategory && (activeCategory.slug || activeCategory.name) === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onMouseEnter={() => setActiveCatKey(key)}
                      onClick={() => {
                        setCatOpen(false);
                        navigate(buildCategoryHref(cat.name, cat.slug));
                      }}
                      className={`flex w-full items-center justify-between px-5 py-3.5 text-left text-[15px] font-bold transition ${
                        selected ? 'bg-white text-[#FF6B00]' : 'text-slate-800 hover:bg-white'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      {cat.productCount != null && (
                        <span className="ml-3 text-xs font-bold text-slate-400">{cat.productCount}</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-1 flex-col overflow-hidden p-6">
                {activeCategory ? (
                  <>
                    <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                      <div>
                        <p className="text-xs font-black uppercase tracking-wider text-[#FF6B00]">{activeCategory.name}</p>
                        <h3 className="text-2xl font-black text-slate-900">Produits populaires</h3>
                      </div>
                      <Link
                        to={buildCategoryHref(activeCategory.name, activeCategory.slug)}
                        onClick={() => setCatOpen(false)}
                        className="text-sm font-black text-[#FF6B00] hover:underline"
                      >
                        Tout voir{activeCategory.productCount != null ? ` (${activeCategory.productCount})` : ''}
                      </Link>
                    </div>

                    <div className="flex-1 overflow-y-auto pt-5">
                      {productsLoading ? (
                        <div className="grid grid-cols-4 gap-4 xl:grid-cols-6">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                              <div className="aspect-square w-full rounded-lg bg-slate-100" />
                              <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                            </div>
                          ))}
                        </div>
                      ) : categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-4 gap-4 xl:grid-cols-6">
                          {categoryProducts.slice(0, 8).map((product) => {
                            const imgUrl = getProductImage(product);
                            const prodName = product.name || product.title || 'Produit';
                            const prodId = product._id || product.id;
                            return (
                              <Link
                                key={prodId}
                                to={`/product/${prodId}`}
                                onClick={() => setCatOpen(false)}
                                title={prodName}
                                className="group flex flex-col"
                              >
                                <div className="aspect-square w-full overflow-hidden rounded-lg bg-slate-50">
                                  {imgUrl && (
                                    <img
                                      src={imgUrl}
                                      alt={prodName}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                                    />
                                  )}
                                </div>
                                <span className="mt-2 line-clamp-2 text-sm font-black leading-snug text-slate-900 group-hover:text-[#FF6B00]">
                                  {prodName}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                          <p className="text-sm font-bold text-slate-500">Aucun aperçu disponible pour cette catégorie</p>
                          <Link
                            to={buildCategoryHref(activeCategory.name, activeCategory.slug)}
                            onClick={() => setCatOpen(false)}
                            className="rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-black text-white hover:bg-[#E85F00]"
                          >
                            Explorer le catalogue
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                    Survolez une catégorie pour voir les produits
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Espaceur : réserve la place du header fixe */}
      <div aria-hidden="true" style={{ height: 'var(--header-h, 120px)' }} />

      {/* Barre de navigation mobile */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-slate-200 bg-white md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navigation principale"
      >
        <Link
          to="/"
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${onHome ? 'text-[#FF6B00]' : 'text-slate-500'}`}
        >
          <Home size={22} />
          <span>Accueil</span>
        </Link>

        <button
          type="button"
          onClick={() => setCatOpen((v) => !v)}
          aria-expanded={catOpen}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${catOpen ? 'text-[#FF6B00]' : 'text-slate-500'}`}
        >
          <Menu size={22} />
          <span>Catégories</span>
        </button>

        <Link
          to="/cart"
          className={`relative flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${onCart ? 'text-[#FF6B00]' : 'text-slate-500'}`}
        >
          <span className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </span>
          <span>Panier</span>
        </Link>

        <Link
          to={user ? '/mes-commandes' : '/login'}
          className={`flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-bold ${onAccount ? 'text-[#FF6B00]' : 'text-slate-500'}`}
        >
          <User size={22} />
          <span>{user ? 'Compte' : 'Connexion'}</span>
        </Link>
      </nav>
    </>
  );
};

export default React.memo(Header);