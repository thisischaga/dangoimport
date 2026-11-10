import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search, ChevronDown, Menu, X, ShoppingCart, User,
  LogOut, ShoppingBag, Loader2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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

const SEARCH_FALLBACK_TERMS = [
  'Chaussures', 'Smartphone', 'Montre', 'Écouteurs', 'Sac à dos', 'T-shirt', 'Chargeur', 'Bouteille',
];

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

/** Logo Dango Import épuré sur fond blanc */
function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center gap-1.5 focus:outline-none"
      aria-label="Accueil Dango Import"
    >
      <span
        className="flex items-center gap-1.5 text-slate-900 tracking-tight"
        style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}
      >
        <span className="text-2xl font-black tracking-tighter text-slate-900">
          Dango
        </span>
        <span className="rounded-md bg-[#FF6B00] px-1.5 py-0.5 text-xs font-black uppercase tracking-wider text-white shadow-sm">
          Import
        </span>
      </span>
    </button>
  );
}

const Header = () => {
  const headerRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  // Données utilisateur
  const [user, setUser] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef(null);

  // Recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  // Catégories BDD (endpoint /categories)
  const [categories, setCategories] = useState([]);
  const [catLoading, setCatLoading] = useState(false);
  const [catError, setCatError] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [catMenuOpen, setCatMenuOpen] = useState(false);
  const catMenuRef = useRef(null);
  const catCloseTimer = useRef(null);

  // Produits de la catégorie sélectionnée
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const productsCacheRef = useRef({});

  // Mobile drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Hauteur dynamique du header fixe pour l'espaceur
  const [headerHeight, setHeaderHeight] = useState(115);

  // Synchronisation de la hauteur du header pour le layout et l'espaceur
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;

    const updateHeight = () => {
      const h = el.offsetHeight;
      if (h > 0) {
        setHeaderHeight(h);
        document.documentElement.style.setProperty('--header-h', `${h}px`);
        document.documentElement.style.setProperty('--header-sticky-h', `${h}px`);
      }
    };

    updateHeight();
    const ro = new ResizeObserver(updateHeight);
    ro.observe(el);
    window.addEventListener('resize', updateHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Chargement de l'utilisateur
  useEffect(() => {
    const loadUser = () => {
      setHasToken(Boolean(localStorage.getItem('dangoToken')));
      const stored = localStorage.getItem('dangoUser');
      if (!stored) return setUser(null);
      try { setUser(JSON.parse(stored)); } catch { setUser(null); }
    };
    loadUser();
    window.addEventListener('authChange', loadUser);
    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  // Récupération des catégories de la base de données
  useEffect(() => {
    let isMounted = true;
    setCatLoading(true);
    setCatError(false);

    client.get('/categories')
      .then((res) => {
        if (!isMounted) return;
        const raw = res?.data?.data || res?.data?.categories || res?.data;
        const list = Array.isArray(raw) ? raw : [];
        setCategories(list);
        if (list.length > 0) setActiveCategory(list[0]);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('Erreur chargement catégories BDD:', err);
        setCatError(true);
      })
      .finally(() => {
        if (isMounted) setCatLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  // Produits réels de la catégorie active (avec cache)
  useEffect(() => {
    if (!activeCategory?.name) return;
    const catName = activeCategory.name;

    if (productsCacheRef.current[catName]) {
      setCategoryProducts(productsCacheRef.current[catName]);
      return;
    }

    setProductsLoading(true);
    let isCancelled = false;

    client.get(`/products?category=${encodeURIComponent(catName)}&limit=8`)
      .then((res) => {
        if (isCancelled) return;
        const list = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.products)
            ? res.data.products
            : Array.isArray(res?.data)
              ? res.data
              : [];
        productsCacheRef.current[catName] = list;
        setCategoryProducts(list);
      })
      .catch(() => {
        if (!isCancelled) setCategoryProducts([]);
      })
      .finally(() => {
        if (!isCancelled) setProductsLoading(false);
      });

    return () => { isCancelled = true; };
  }, [activeCategory?.name]);

  // Déconnexion
  const handleLogout = useCallback(() => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    setHasToken(false);
    window.dispatchEvent(new Event('authChange'));
    setAccountOpen(false);
    navigate('/');
  }, [navigate]);

  // Synchroniser la barre de recherche avec l'URL
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('q') || '';
    setSearchQuery(q);
  }, [location.search]);

  // Fermer les menus lors d'un changement de page
  useEffect(() => {
    setCatMenuOpen(false);
    setAccountOpen(false);
    setShowSuggestions(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  // Suggestions de recherche
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

  // Fermeture lors d'un clic en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (accountRef.current && !accountRef.current.contains(e.target)) setAccountOpen(false);
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) setShowSuggestions(false);
      if (catMenuRef.current && !catMenuRef.current.contains(e.target)) setCatMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleClickOutside);
    return () => document.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  // Soumission de recherche
  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    if (searchInputRef.current) searchInputRef.current.blur();
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSelectSuggestion = (term) => {
    setSearchQuery(term);
    setShowSuggestions(false);
    navigate(`/shopping?q=${encodeURIComponent(term)}`);
  };

  // Survol avec délai pour le mega menu
  const handleCatMouseEnter = () => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    setCatMenuOpen(true);
  };

  const handleCatMouseLeave = () => {
    catCloseTimer.current = setTimeout(() => setCatMenuOpen(false), 180);
  };

  const userName = useMemo(() => {
    return user?.userFirstname || user?.firstname || user?.name || user?.userName || '';
  }, [user]);

  const userInitial = useMemo(() => {
    return (userName || 'U').charAt(0).toUpperCase();
  }, [userName]);

  return (
    <>
      <header
        ref={headerRef}
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-200/90 shadow-sm transition-all"
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {user && hasToken && <PhoneUpdateBanner user={user} onUpdated={setUser} />}

        {/* LIGNE 1 : logo | recherche | actions */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-18 items-center justify-between gap-4 py-3 sm:gap-8">

            {/* Menu mobile + logo */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
                aria-label="Ouvrir le menu de navigation"
              >
                <Menu size={24} />
              </button>
              <BrandLogo onClick={() => navigate('/')} />
            </div>

            {/* Grande barre de recherche */}
            <div ref={searchContainerRef} className="relative hidden flex-1 max-w-2xl sm:block">
              <form
                onSubmit={handleSearchSubmit}
                className="flex items-center rounded-full border-2 border-[#FF6B00] bg-white shadow-sm transition-all focus-within:shadow-md"
              >
                <div className="flex flex-1 items-center px-4">
                  <Search size={19} className="mr-2 text-slate-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Rechercher un produit, une référence, un fournisseur..."
                    className="w-full py-2.5 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => { setSearchQuery(''); searchInputRef.current?.focus(); }}
                      className="p-1 text-slate-400 hover:text-slate-600"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-6 py-2.5 text-sm font-bold text-white transition hover:bg-[#E85F00] active:scale-95"
                >
                  <Search size={16} />
                  <span>Rechercher</span>
                </button>
              </form>

              <AnimatePresence>
                {showSuggestions && (searchQuery.trim().length >= 2 || suggestions.length > 0) && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 right-0 mt-2 z-50 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
                  >
                    <div className="px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <span>{suggestionLoading ? 'Recherche en cours...' : 'Suggestions de recherche'}</span>
                      {suggestionLoading && <Loader2 size={13} className="animate-spin text-orange-500" />}
                    </div>
                    <ul className="py-1">
                      {suggestions.map((term) => (
                        <li key={term}>
                          <button
                            type="button"
                            onClick={() => handleSelectSuggestion(term)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm text-slate-700 hover:bg-orange-50 hover:text-[#FF6B00] transition"
                          >
                            <Search size={14} className="text-slate-400" />
                            <span>{term}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Actions droite : panier + compte */}
            <div className="flex items-center gap-2 sm:gap-4">

              <Link
                to="/cart"
                className="relative flex items-center gap-2 rounded-xl p-2.5 text-slate-700 hover:bg-slate-100 hover:text-[#FF6B00] transition"
                aria-label={`Panier (${cartCount} articles)`}
              >
                <div className="relative">
                  <ShoppingCart size={22} />
                  {cartCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[11px] font-bold text-white shadow">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden text-sm font-semibold sm:inline">Panier</span>
              </Link>

              {/* Composant utilisateur */}
              <div className="relative" ref={accountRef}>
                {user ? (
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl p-1.5 hover:bg-slate-100 transition focus:outline-none"
                    aria-expanded={accountOpen}
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-100 font-bold text-[#FF6B00] border border-orange-200">
                      {userInitial}
                    </span>
                    <div className="hidden text-left sm:block">
                      <p className="text-xs font-bold text-slate-900 leading-tight">{userName || 'Mon compte'}</p>
                      <p className="text-[11px] text-slate-500">Compte vérifié</p>
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAccountOpen((v) => !v)}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition"
                  >
                    <User size={16} className="text-[#FF6B00]" />
                    <span className="hidden sm:inline">Mon compte</span>
                    <ChevronDown size={13} className={`text-slate-400 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
                  </button>
                )}

                <AnimatePresence>
                  {accountOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 6 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 z-50 w-64 rounded-2xl border border-slate-200 bg-white p-2.5 shadow-2xl"
                    >
                      {user ? (
                        <>
                          <div className="border-b border-slate-100 px-3 py-2">
                            <p className="text-sm font-bold text-slate-900">{userName}</p>
                            <p className="truncate text-xs text-slate-500">{user.userEmail || user.email}</p>
                          </div>
                          <div className="py-1">
                            <Link
                              to="/mes-commandes"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#FF6B00] transition"
                            >
                              <ShoppingBag size={16} className="text-slate-400" />
                              <span>Mes commandes</span>
                            </Link>
                            <Link
                              to="/cart"
                              onClick={() => setAccountOpen(false)}
                              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-[#FF6B00] transition"
                            >
                              <ShoppingCart size={16} className="text-slate-400" />
                              <span>Mon panier ({cartCount})</span>
                            </Link>
                          </div>
                          <div className="border-t border-slate-100 pt-1">
                            <button
                              type="button"
                              onClick={handleLogout}
                              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition"
                            >
                              <LogOut size={16} />
                              <span>Déconnexion</span>
                            </button>
                          </div>
                        </>
                      ) : (
                        <div className="p-2 space-y-2">
                          <p className="text-xs font-medium text-slate-500 text-center">
                            Accédez à vos commandes et suivez vos colis
                          </p>
                          <Link
                            to="/login"
                            onClick={() => setAccountOpen(false)}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#E85F00] transition"
                          >
                            <User size={15} />
                            <span>Se connecter</span>
                          </Link>
                          <Link
                            to="/register"
                            onClick={() => setAccountOpen(false)}
                            className="flex w-full items-center justify-center rounded-xl border border-slate-200 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                          >
                            Créer un compte
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>

          {/* Recherche mobile */}
          <div className="pb-3 sm:hidden">
            <form onSubmit={handleSearchSubmit} className="flex items-center rounded-full border border-slate-300 bg-slate-50 px-3 py-2 focus-within:border-[#FF6B00] focus-within:bg-white">
              <Search size={16} className="mr-2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher sur Dango Import..."
                className="w-full bg-transparent text-sm text-slate-800 outline-none"
              />
              <button type="submit" className="text-xs font-bold text-[#FF6B00]">OK</button>
            </form>
          </div>
        </div>

        {/* LIGNE 2 : bouton catégories + mega menu (uniquement sur desktop) */}
        <div className="hidden md:block border-t border-slate-100 bg-white">
          <div className="mx-auto flex max-w-7xl items-center px-4 sm:px-6 lg:px-8">
            <div
              className="relative py-1.5"
              ref={catMenuRef}
              onMouseEnter={handleCatMouseEnter}
              onMouseLeave={handleCatMouseLeave}
            >
              <button
                type="button"
                onClick={() => setCatMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold text-slate-900 hover:text-[#FF6B00] transition focus:outline-none"
                aria-expanded={catMenuOpen}
              >
                <Menu size={20} />
                <span>Toutes les catégories</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${catMenuOpen ? 'rotate-180 text-[#FF6B00]' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mega menu : pleine largeur, hauteur 60 % de l'écran */}
          <AnimatePresence>
            {catMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.16 }}
                ref={catMenuRef}
                onMouseEnter={handleCatMouseEnter}
                onMouseLeave={handleCatMouseLeave}
                className="absolute left-0 right-0 top-full z-50 flex h-[60vh] border-t border-slate-200 bg-white shadow-2xl overflow-hidden"
              >
                {/* Colonne gauche : catégories BDD */}
                <div className="w-[280px] shrink-0 border-r border-slate-100 bg-slate-50/70 py-4 overflow-y-auto">
                  <div className="px-5 pb-2 text-[12px] font-black uppercase tracking-wider text-slate-500">
                    Catégories
                  </div>

                  {catLoading && (
                    <div className="px-5 py-10 text-center text-sm font-bold text-slate-400">Chargement...</div>
                  )}

                  {catError && !catLoading && (
                    <div className="px-5 py-6 text-center text-sm font-bold text-slate-500">
                      Impossible de charger les catégories
                    </div>
                  )}

                  {!catLoading && !catError && categories.length === 0 && (
                    <div className="px-5 py-6 text-center text-sm font-bold text-slate-500">
                      Aucune catégorie trouvée
                    </div>
                  )}

                  {!catLoading && categories.map((cat) => {
                    const isSelected = activeCategory?.name === cat.name;
                    return (
                      <div
                        key={cat.slug || cat.name}
                        onMouseEnter={() => setActiveCategory(cat)}
                        onClick={() => {
                          setCatMenuOpen(false);
                          navigate(buildCategoryHref(cat.name, cat.slug));
                        }}
                        className={`flex cursor-pointer items-center justify-between px-5 py-3 text-[15px] font-bold transition ${
                          isSelected ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-slate-800 hover:bg-slate-100'
                        }`}
                      >
                        <span className="truncate">{cat.name}</span>
                        {cat.productCount != null && (
                          <span className="ml-3 text-xs font-bold text-slate-400">{cat.productCount}</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Colonne droite : cartes produits carrées, texte gras, sans icônes */}
                <div className="flex-1 flex flex-col p-6 overflow-hidden">
                  {activeCategory ? (
                    <div className="flex h-full flex-col">
                      <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-[#FF6B00]">
                            {activeCategory.name}
                          </p>
                          <h3 className="text-2xl font-black text-slate-900">Produits populaires</h3>
                        </div>
                        <Link
                          to={buildCategoryHref(activeCategory.name, activeCategory.slug)}
                          onClick={() => setCatMenuOpen(false)}
                          className="text-sm font-black text-[#FF6B00] hover:underline"
                        >
                          Tout voir{activeCategory.productCount != null ? ` (${activeCategory.productCount})` : ''}
                        </Link>
                      </div>

                      <div className="flex-1 overflow-y-auto pt-5">
                        {productsLoading ? (
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
                            {[...Array(8)].map((_, i) => (
                              <div key={i} className="animate-pulse">
                                <div className="aspect-square w-full rounded-lg bg-slate-100" />
                                <div className="mt-2 h-3 w-3/4 rounded bg-slate-100" />
                              </div>
                            ))}
                          </div>
                        ) : categoryProducts.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
                            {categoryProducts.slice(0, 8).map((product) => {
                              const imgUrl = getProductImage(product);
                              const prodName = product.name || product.title || 'Produit';
                              const prodId = product._id || product.id;
                              return (
                                <Link
                                  key={prodId}
                                  to={`/product/${prodId}`}
                                  onClick={() => setCatMenuOpen(false)}
                                  title={prodName}
                                  className="group flex flex-col rounded-lg border border-slate-200 bg-white p-2 transition hover:border-[#FF6B00] hover:shadow-md"
                                >
                                  <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-50">
                                    {imgUrl ? (
                                      <img
                                        src={imgUrl}
                                        alt={prodName}
                                        className="h-full w-full object-contain transition duration-200 group-hover:scale-105"
                                        referrerPolicy="no-referrer"
                                        loading="lazy"
                                      />
                                    ) : null}
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
                              onClick={() => setCatMenuOpen(false)}
                              className="rounded-lg bg-[#FF6B00] px-4 py-2 text-sm font-black text-white hover:bg-[#E85F00]"
                            >
                              Explorer le catalogue
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-bold text-slate-400">
                      Survolez une catégorie pour voir les produits
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Espaceur dynamique qui compense exactement la hauteur du header fixe */}
      <div
        style={{ height: `${headerHeight}px` }}
        aria-hidden="true"
        className="w-full shrink-0 pointer-events-none select-none transition-[height] duration-150"
      />

      {/* Tiroir mobile */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-xs flex-col bg-white shadow-2xl lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
                <BrandLogo onClick={() => { setMobileMenuOpen(false); navigate('/'); }} />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                  aria-label="Fermer"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
                {user ? (
                  <div className="rounded-xl bg-slate-50 p-3.5">
                    <p className="text-xs font-semibold text-slate-500">Connecté en tant que</p>
                    <p className="text-sm font-bold text-slate-900">{userName}</p>
                    <div className="mt-3 flex gap-2">
                      <Link
                        to="/mes-commandes"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex-1 rounded-lg bg-white border border-slate-200 py-2 text-center text-xs font-semibold text-slate-700"
                      >
                        Mes commandes
                      </Link>
                      <button
                        type="button"
                        onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                        className="rounded-lg bg-red-50 border border-red-100 px-3 py-2 text-xs font-semibold text-red-600"
                      >
                        Sortir
                      </button>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] py-3 text-sm font-bold text-white shadow-sm"
                  >
                    <User size={16} />
                    <span>Se connecter</span>
                  </Link>
                )}

                <div>
                  <p className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">Catégories</p>
                  <div className="space-y-1">
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug || cat.name}
                        to={buildCategoryHref(cat.name, cat.slug)}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-bold text-slate-800 hover:bg-orange-50 hover:text-[#FF6B00]"
                      >
                        <span>{cat.name}</span>
                        {cat.productCount != null && (
                          <span className="text-xs font-bold text-slate-400">{cat.productCount}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default React.memo(Header);