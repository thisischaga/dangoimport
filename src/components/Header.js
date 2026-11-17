import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Search,
  Menu,
  ShoppingCart,
  X,
  ChevronRight,
  ChevronDown,
  Home,
  UserRound,
  Package,
  LogOut,
} from 'lucide-react';

import client from '../apiClient';
import { useCart } from '../context/CartContext';
import { getProductImage } from '../utils/imageUrl';
import PhoneUpdateBanner from './PhoneUpdateBanner';

// Compatibilité avec les anciens imports
export const CATEGORY_LINKS = [];
export const QUICK_LINKS = [];

export function buildCategoryHref(name, slug = '') {
  const safe = (name || slug || '').trim();
  if (!safe) return '/shopping';
  return `/shopping?category=${encodeURIComponent(safe)}`;
}

const PANEL_ITEMS = [
  {
    title: 'Direct usine',
    text: 'Sourcing auprès de fabricants certifiés, sans intermédiaire ni surcoût.',
  },
  {
    title: 'Contrôle qualité',
    text: "Inspection physique rigoureuse avant l'embarquement.",
  },
  {
    title: 'Transit & livraison',
    text: 'Fret calculé au kilo réel (10 000 F/kg), avec livraison locale.',
  },
  {
    title: 'Paiement local sécurisé',
    text: 'T-Money, Moov, MTN, Celtiis et carte bancaire.',
  },
];

// --------------------------------------------------
// LOGO
// --------------------------------------------------

function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Accueil Dango import"
      className="flex shrink-0 items-baseline whitespace-nowrap tracking-[-1.2px]"
    >
      <span className="text-[22px] font-black leading-none text-white sm:text-[25px] lg:text-[28px]">
        Dango
      </span>
      <span className="ml-0.5 text-[22px] font-black leading-none text-slate-900 sm:text-[25px] lg:text-[28px]">
        import
      </span>
    </button>
  );
}

// --------------------------------------------------
// RECHERCHE
// --------------------------------------------------

function SearchBox({
  wrapperRef,
  inputRef,
  value,
  onChange,
  onFocus,
  onSubmit,
  onClear,
  placeholder,
  compact = false,
  children,
}) {
  return (
    <div ref={wrapperRef} className="relative min-w-0 flex-1">
      <form
        onSubmit={onSubmit}
        role="search"
        className={`flex w-full items-center overflow-hidden rounded-xl bg-white shadow-sm transition-shadow duration-200 focus-within:shadow-md ${
          compact ? 'h-11' : 'h-[50px]'
        }`}
      >
        <Search
          size={18}
          strokeWidth={1.8}
          className="ml-3.5 shrink-0 text-slate-400"
        />

        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          autoComplete="off"
          enterKeyHint="search"
          aria-label="Rechercher un produit"
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:outline-none"
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Effacer la recherche"
            className="mr-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Rechercher"
          className={`flex h-full shrink-0 items-center justify-center bg-[#FF6B00] font-bold text-white transition-colors hover:bg-[#E55E00] ${
            compact ? 'w-12' : 'px-7 text-sm'
          }`}
        >
          {compact ? <Search size={18} /> : 'Rechercher'}
        </button>
      </form>

      {children}
    </div>
  );
}

// --------------------------------------------------
// HEADER
// --------------------------------------------------

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const headerRef = useRef(null);
  const accountRef = useRef(null);

  const searchRef = useRef(null);
  const mobileSearchRef = useRef(null);
  const searchInputRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

  const catTriggerRef = useRef(null);
  const catPanelRef = useRef(null);
  const mobileCatPanelRef = useRef(null);
  const mobileCatButtonRef = useRef(null);
  const catCloseTimer = useRef(null);

  const aboutTriggerRef = useRef(null);
  const aboutPanelRef = useRef(null);
  const aboutCloseTimer = useRef(null);

  const [scrolled, setScrolled] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(120);

  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);

  const [catOpen, setCatOpen] = useState(false);
  const [activeCatKey, setActiveCatKey] = useState(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  // --------------------------------------------------
  // HAUTEUR DU HEADER FIXE
  // --------------------------------------------------

  useEffect(() => {
    const element = headerRef.current;
    if (!element) return undefined;

    const updateHeight = () => {
      const h = element.offsetHeight || 120;
      setHeaderHeight(h);
      document.documentElement.style.setProperty('--header-h', `${h}px`);
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    return () => {
      observer.disconnect();
      document.documentElement.style.removeProperty('--header-h');
    };
  }, []);

  // --------------------------------------------------
  // OMBRE AU SCROLL
  // --------------------------------------------------

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 5);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // --------------------------------------------------
  // UTILISATEUR CONNECTÉ
  // --------------------------------------------------

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('dangoUser');
      try {
        setUser(stored ? JSON.parse(stored) : null);
      } catch {
        setUser(null);
      }
    };

    loadUser();
    window.addEventListener('authChange', loadUser);
    return () => window.removeEventListener('authChange', loadUser);
  }, []);

  // --------------------------------------------------
  // CATÉGORIES
  // --------------------------------------------------

  const {
    data: categories = [],
    isLoading: catLoading,
    isError: catError,
  } = useQuery({
    queryKey: ['headerCategories'],
    queryFn: async () => {
      const res = await client.get('/categories');
      const raw = res?.data?.data || res?.data?.categories || res?.data;
      return Array.isArray(raw) ? raw : [];
    },
    staleTime: 300000,
  });

  const activeCategory = useMemo(
    () =>
      categories.find(
        (category) => (category.slug || category.name) === activeCatKey
      ) ||
      categories[0] ||
      null,
    [categories, activeCatKey]
  );

  const activeName = activeCategory?.name;

  const { data: categoryProducts = [], isLoading: productsLoading } = useQuery({
    queryKey: ['headerCatProducts', activeName],
    enabled: Boolean(activeName) && catOpen,
    queryFn: async () => {
      const res = await client.get(
        `/products?category=${encodeURIComponent(activeName)}&limit=8`
      );
      const data = res?.data;
      if (Array.isArray(data?.data)) return data.data;
      if (Array.isArray(data?.products)) return data.products;
      if (Array.isArray(data)) return data;
      return [];
    },
    staleTime: 120000,
  });

  // --------------------------------------------------
  // SYNCHRO RECHERCHE / URL
  // --------------------------------------------------

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  useEffect(() => {
    setCatOpen(false);
    setAccountOpen(false);
    setShowSuggestions(false);
    setAboutOpen(false);
  }, [location.pathname, location.search]);

  // --------------------------------------------------
  // SUGGESTIONS
  // --------------------------------------------------

  useEffect(() => {
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setSuggestionLoading(false);
      return undefined;
    }

    let cancelled = false;
    setSuggestionLoading(true);

    const timer = setTimeout(async () => {
      try {
        const res = await client.get(
          `/products?limit=5&search=${encodeURIComponent(trimmed)}`
        );
        const items = Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res?.data?.products)
            ? res.data.products
            : [];
        if (!cancelled) setSuggestions(items.slice(0, 5));
      } catch {
        if (!cancelled) setSuggestions([]);
      } finally {
        if (!cancelled) setSuggestionLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // --------------------------------------------------
  // FERMETURE AU CLIC EXTÉRIEUR / ESCAPE
  // --------------------------------------------------

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }

      const insideSearch =
        searchRef.current?.contains(event.target) ||
        mobileSearchRef.current?.contains(event.target);
      if (!insideSearch) setShowSuggestions(false);

      const insideCategories =
        catTriggerRef.current?.contains(event.target) ||
        catPanelRef.current?.contains(event.target) ||
        mobileCatPanelRef.current?.contains(event.target) ||
        mobileCatButtonRef.current?.contains(event.target);
      if (!insideCategories) setCatOpen(false);

      const insideAbout =
        aboutTriggerRef.current?.contains(event.target) ||
        aboutPanelRef.current?.contains(event.target);
      if (!insideAbout) setAboutOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCatOpen(false);
        setAboutOpen(false);
        setAccountOpen(false);
        setShowSuggestions(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --------------------------------------------------
  // HOVER : CATÉGORIES & À PROPOS
  // --------------------------------------------------

  const openCats = useCallback(() => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    if (aboutCloseTimer.current) clearTimeout(aboutCloseTimer.current);
    setAboutOpen(false);
    setCatOpen(true);
  }, []);

  const closeCatsLater = useCallback(() => {
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    catCloseTimer.current = setTimeout(() => setCatOpen(false), 180);
  }, []);

  const openAbout = useCallback(() => {
    if (aboutCloseTimer.current) clearTimeout(aboutCloseTimer.current);
    if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
    setCatOpen(false);
    setAboutOpen(true);
  }, []);

  const closeAboutLater = useCallback(() => {
    if (aboutCloseTimer.current) clearTimeout(aboutCloseTimer.current);
    aboutCloseTimer.current = setTimeout(() => setAboutOpen(false), 180);
  }, []);

  useEffect(() => {
    return () => {
      if (catCloseTimer.current) clearTimeout(catCloseTimer.current);
      if (aboutCloseTimer.current) clearTimeout(aboutCloseTimer.current);
    };
  }, []);

  // --------------------------------------------------
  // DÉCONNEXION
  // --------------------------------------------------

  const handleLogout = useCallback(() => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    setAccountOpen(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  }, [navigate]);

  // --------------------------------------------------
  // RECHERCHE
  // --------------------------------------------------

  const handleSearchSubmit = useCallback(
    (event) => {
      if (event) event.preventDefault();

      const query = searchQuery.trim();
      setShowSuggestions(false);
      searchInputRef.current?.blur();
      mobileSearchInputRef.current?.blur();

      navigate(query ? `/shopping?q=${encodeURIComponent(query)}` : '/shopping');
    },
    [navigate, searchQuery]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    const visible =
      window.innerWidth >= 1024 ? searchInputRef.current : mobileSearchInputRef.current;
    visible?.focus();
  }, []);

  // --------------------------------------------------
  // INFOS UTILISATEUR
  // --------------------------------------------------

  const userName = useMemo(
    () =>
      user?.userFirstname ||
      user?.firstname ||
      user?.name ||
      user?.userName ||
      '',
    [user]
  );

  const userInitial = (userName || 'M').charAt(0).toUpperCase();
  const onHome = location.pathname === '/';
  const onCart = location.pathname.startsWith('/cart');
  const onAccount =
    location.pathname.startsWith('/mes-commandes') ||
    location.pathname.startsWith('/login');

  const trimmedQuery = searchQuery.trim();
  const cartLabel = cartCount > 99 ? '99+' : cartCount;

  // --------------------------------------------------
  // PANEL SUGGESTIONS
  // --------------------------------------------------

  const suggestionsPanel = (
    <AnimatePresence>
      {showSuggestions && trimmedQuery.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className="absolute left-0 right-0 top-full z-[80] mt-2 overflow-hidden rounded-xl bg-white shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
        >
          {suggestionLoading && suggestions.length === 0 && (
            <p className="px-4 py-4 text-sm text-slate-400">Recherche en cours...</p>
          )}

          {suggestions.length > 0 && (
            <ul className="max-h-[60vh] overflow-y-auto py-1">
              {suggestions.map((product) => {
                const id = product._id || product.id;
                const name = product.name || product.title || 'Produit';
                const image = getProductImage(product);

                return (
                  <li key={id}>
                    <Link
                      to={`/product/${id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-[#FFF7F0]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-slate-50">
                        {image ? (
                          <img
                            src={image}
                            alt=""
                            referrerPolicy="no-referrer"
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : (
                          <Package size={18} className="text-slate-300" />
                        )}
                      </span>
                      <span className="line-clamp-2 min-w-0 flex-1 text-sm font-semibold text-slate-800">
                        {name}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!suggestionLoading && suggestions.length === 0 && (
            <p className="px-4 py-4 text-sm text-slate-500">
              Aucun produit ne correspond à cette recherche.
            </p>
          )}

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-bold text-[#FF6B00] transition hover:bg-[#FFF7F0]"
          >
            <Search size={16} />
            <span className="truncate">Voir tous les résultats pour « {trimmedQuery} »</span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // --------------------------------------------------
  // RENDU
  // --------------------------------------------------

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-40 bg-[#FF6B00] transition-shadow duration-200 ${
          scrolled ? 'shadow-[0_4px_20px_rgba(0,0,0,0.18)]' : ''
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        {user && <PhoneUpdateBanner user={user} onUpdated={setUser} />}

        {/* ========== MOBILE & TABLETTE ========== */}
        <div className="lg:hidden">
          <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-6">
            <BrandLogo onClick={() => navigate('/')} />

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
              <Link
                to="/a-propos"
                className="rounded-lg px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-white/15 sm:text-sm"
              >
                À propos
              </Link>

              {user ? (
                <Link
                  to="/mes-commandes"
                  aria-label="Mon compte"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-sm font-black text-[#FF6B00] shadow-sm"
                >
                  {userInitial}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-[#FF6B00] shadow-sm transition hover:bg-orange-50 sm:text-sm"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>

          <div className="px-3 pb-3 sm:px-6">
            <SearchBox
              wrapperRef={mobileSearchRef}
              inputRef={mobileSearchInputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onSubmit={handleSearchSubmit}
              onClear={handleClearSearch}
              placeholder="Rechercher un produit..."
              compact
            >
              {suggestionsPanel}
            </SearchBox>
          </div>
        </div>

        {/* ========== DESKTOP ========== */}
        <div className="mx-auto hidden h-[76px] max-w-[1440px] items-center gap-4 px-6 lg:flex xl:gap-6 xl:px-10">
          <BrandLogo onClick={() => navigate('/')} />

          {/* CATÉGORIES */}
          <div
            ref={catTriggerRef}
            className="relative shrink-0"
            onMouseEnter={openCats}
            onMouseLeave={closeCatsLater}
          >
            <button
              type="button"
              onClick={() => {
                setAboutOpen(false);
                setCatOpen((value) => !value);
              }}
              aria-expanded={catOpen}
              className={`flex h-11 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold transition ${
                catOpen ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-white hover:bg-white/15'
              }`}
            >
              <Menu size={19} strokeWidth={2} />
              <span>Toutes les catégories</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
              />
            </button>
          </div>

          {/* À PROPOS */}
          <div
            ref={aboutTriggerRef}
            className="relative shrink-0"
            onMouseEnter={openAbout}
            onMouseLeave={closeAboutLater}
          >
            <Link
              to="/a-propos"
              onClick={() => setAboutOpen(false)}
              className={`flex h-11 items-center gap-1.5 rounded-xl px-3.5 text-sm font-semibold transition ${
                aboutOpen ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-white hover:bg-white/15'
              }`}
            >
              <span>À propos</span>
              <ChevronDown
                size={15}
                className={`transition-transform duration-200 ${aboutOpen ? 'rotate-180' : ''}`}
              />
            </Link>
          </div>

          {/* RECHERCHE */}
          <SearchBox
            wrapperRef={searchRef}
            inputRef={searchInputRef}
            value={searchQuery}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            onSubmit={handleSearchSubmit}
            onClear={handleClearSearch}
            placeholder="Rechercher un produit, une marque..."
          >
            {suggestionsPanel}
          </SearchBox>

          {/* PANIER */}
          <Link
            to="/cart"
            aria-label={`Panier (${cartCount} articles)`}
            className={`flex h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 text-sm font-semibold text-white transition hover:bg-white/15 ${
              onCart ? 'bg-white/20' : ''
            }`}
          >
            <ShoppingCart size={21} strokeWidth={2} />
            <span>
              Panier
              {cartCount > 0 && <span className="ml-1 font-black">({cartLabel})</span>}
            </span>
          </Link>

          {/* COMPTE */}
          <div className="relative shrink-0" ref={accountRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                className="flex h-11 max-w-[200px] items-center gap-2.5 rounded-xl px-2.5 text-sm font-semibold text-white transition hover:bg-white/15"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black text-[#FF6B00]">
                  {userInitial}
                </span>
                <span className="truncate">{userName || 'Mon compte'}</span>
                <ChevronDown
                  size={14}
                  className={`shrink-0 text-white/80 transition-transform duration-200 ${
                    accountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex h-11 items-center justify-center rounded-xl bg-white px-5 text-sm font-bold text-[#FF6B00] shadow-sm transition hover:bg-orange-50"
              >
                Se connecter
              </Link>
            )}

            <AnimatePresence>
              {accountOpen && user && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-full z-[80] mt-3 w-64 overflow-hidden rounded-xl border border-slate-100 bg-white p-2 shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
                >
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">{userName}</p>
                    <p className="truncate text-xs text-slate-500">
                      {user.userEmail || user.email}
                    </p>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  <Link
                    to="/mes-commandes"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF3EB] hover:text-[#FF6B00]"
                  >
                    <Package size={17} />
                    Mes commandes
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <LogOut size={17} />
                    Déconnexion
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ========== MEGA MENU CATÉGORIES (DESKTOP) ========== */}
        <AnimatePresence>
          {catOpen && (
            <motion.div
              ref={catPanelRef}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onMouseEnter={openCats}
              onMouseLeave={closeCatsLater}
              className="absolute left-6 right-6 top-[calc(100%+6px)] z-50 mx-auto hidden max-w-[1360px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.14)] lg:flex xl:left-10 xl:right-10"
              style={{ height: 'min(540px, 72vh)' }}
            >
              <div className="w-[280px] shrink-0 overflow-y-auto border-r border-slate-100 bg-[#FAFAFA] py-4">
                <h3 className="px-5 pb-3 text-sm font-bold text-slate-900">
                  Toutes les catégories
                </h3>

                {catLoading && (
                  <p className="px-5 py-6 text-sm text-slate-400">Chargement...</p>
                )}
                {catError && (
                  <p className="px-5 py-6 text-sm text-red-500">
                    Impossible de charger les catégories.
                  </p>
                )}
                {!catLoading && !catError && categories.length === 0 && (
                  <p className="px-5 py-6 text-sm text-slate-500">
                    Aucune catégorie disponible.
                  </p>
                )}

                {categories.map((cat) => {
                  const key = cat.slug || cat.name;
                  const selected =
                    activeCategory && (activeCategory.slug || activeCategory.name) === key;

                  return (
                    <button
                      key={cat._id || key}
                      type="button"
                      onMouseEnter={() => setActiveCatKey(key)}
                      onFocus={() => setActiveCatKey(key)}
                      onClick={() => {
                        setCatOpen(false);
                        navigate(buildCategoryHref(cat.name, cat.slug));
                      }}
                      className={`flex w-full items-center justify-between px-5 py-2.5 text-left text-sm font-semibold transition ${
                        selected
                          ? 'bg-white text-[#FF6B00] shadow-sm'
                          : 'text-slate-700 hover:bg-white hover:text-[#FF6B00]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>
                      <ChevronRight
                        size={15}
                        className={`shrink-0 ${selected ? 'text-[#FF6B00]' : 'text-slate-400'}`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-6">
                {activeCategory ? (
                  <>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900">
                          {activeCategory.name}
                        </h3>
                        <p className="mt-0.5 text-xs text-slate-500">
                          Sélection de produits populaires dans cette catégorie
                        </p>
                      </div>

                      <Link
                        to={buildCategoryHref(activeCategory.name, activeCategory.slug)}
                        onClick={() => setCatOpen(false)}
                        className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-bold text-[#FF6B00] transition hover:bg-[#FFF3EB]"
                      >
                        Tout voir
                        <ChevronRight size={14} />
                      </Link>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pt-5">
                      {productsLoading ? (
                        <div className="grid grid-cols-4 gap-6 sm:grid-cols-5 xl:grid-cols-6">
                          {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="flex animate-pulse flex-col items-center">
                              <div className="h-20 w-20 rounded-full bg-slate-100" />
                              <div className="mt-2.5 h-3 w-16 rounded bg-slate-100" />
                            </div>
                          ))}
                        </div>
                      ) : categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-4 gap-6 sm:grid-cols-5 xl:grid-cols-6">
                          {categoryProducts.slice(0, 12).map((product) => {
                            const image = getProductImage(product);
                            const productName = product.name || product.title || 'Produit';
                            const productId = product._id || product.id;

                            return (
                              <Link
                                key={productId}
                                to={`/product/${productId}`}
                                onClick={() => setCatOpen(false)}
                                title={productName}
                                className="group flex flex-col items-center text-center"
                              >
                                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F5F5F7] p-2 transition duration-200 group-hover:scale-105 group-hover:bg-[#FFF3EB] group-hover:shadow-md">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={productName}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="h-full w-full rounded-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] text-slate-400">Produit</span>
                                  )}
                                </div>

                                <span className="mt-2 line-clamp-2 max-w-[110px] text-xs font-semibold leading-tight text-slate-800 transition group-hover:text-[#FF6B00]">
                                  {productName}
                                </span>
                              </Link>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                          <p className="text-sm text-slate-500">
                            Aucun aperçu disponible pour cette catégorie.
                          </p>
                          <Link
                            to={buildCategoryHref(activeCategory.name, activeCategory.slug)}
                            onClick={() => setCatOpen(false)}
                            className="rounded-lg bg-[#FF6B00] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#E55E00]"
                          >
                            Explorer la catégorie
                          </Link>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    Sélectionnez une catégorie.
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========== MEGA MENU À PROPOS (DESKTOP) ========== */}
        <AnimatePresence>
          {aboutOpen && (
            <motion.div
              ref={aboutPanelRef}
              initial={{ opacity: 0, y: 8, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.99 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              onMouseEnter={openAbout}
              onMouseLeave={closeAboutLater}
              className="absolute left-6 right-6 top-[calc(100%+6px)] z-50 mx-auto hidden max-w-[1360px] overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_20px_50px_rgba(0,0,0,0.16)] lg:flex xl:left-10 xl:right-10"
            >
              <div className="flex min-w-0 flex-1 flex-col justify-between p-8 xl:p-10">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FF6B00]">
                    Qui sommes-nous
                  </p>

                  <h3 className="mt-3 text-2xl font-black leading-tight tracking-tight text-slate-900 xl:text-[30px]">
                    Dango Import, la passerelle directe avec les usines chinoises.
                  </h3>

                  <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-slate-600">
                    Nous éliminons les intermédiaires pour permettre aux commerçants, revendeurs et
                    particuliers en Afrique de l'Ouest d'importer au vrai prix usine, en toute
                    transparence et sécurité.
                  </p>

                  <ul className="mt-7 grid grid-cols-2 gap-x-10 gap-y-6">
                    {PANEL_ITEMS.map((item) => (
                      <li key={item.title} className="border-l-2 border-[#FF6B00] pl-4">
                        <p className="text-sm font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-[13px] leading-relaxed text-slate-500">
                          {item.text}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-8 flex items-center justify-between gap-6 border-t border-slate-100 pt-5">
                  <span className="text-sm text-slate-500">
                    Une question ? Notre équipe à Lomé et Cotonou est à votre écoute.
                  </span>
                  <Link
                    to="/a-propos"
                    onClick={() => setAboutOpen(false)}
                    className="shrink-0 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#E55E00]"
                  >
                    Découvrir notre histoire
                  </Link>
                </div>
              </div>

              <div className="relative w-[400px] shrink-0 overflow-hidden bg-slate-900 xl:w-[460px]">
                <img
                  src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=900&q=80"
                  alt="Logistique Dango Import Chine Afrique"
                  loading="lazy"
                  className="h-full w-full object-cover opacity-85 transition duration-700 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-7 text-white">
                  <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D]">
                    Fret Chine → Afrique
                  </p>
                  <h4 className="mt-2 text-xl font-bold leading-snug text-white">
                    Du fabricant jusqu'à votre porte, sans stress.
                  </h4>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/80">
                    Plateforme de référence pour vos achats en gros et demi-gros au Togo et au Bénin.
                  </p>
                  <Link
                    to="/a-propos"
                    onClick={() => setAboutOpen(false)}
                    className="mt-4 inline-block text-sm font-bold text-[#FFA94D] transition hover:text-white"
                  >
                    Explorer la page À propos
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========== PANNEAU CATÉGORIES MOBILE & TABLETTE ========== */}
      <AnimatePresence>
        {catOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 z-50 bg-black/35 lg:hidden"
            style={{
              top: 'var(--header-h, 120px)',
              bottom: 'calc(64px + env(safe-area-inset-bottom))',
            }}
            onClick={() => setCatOpen(false)}
          >
            <motion.div
              ref={mobileCatPanelRef}
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.22 }}
              onClick={(event) => event.stopPropagation()}
              className="flex h-full w-[88%] max-w-[420px] flex-col overflow-hidden bg-white shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                <h3 className="text-lg font-bold text-slate-900">Toutes les catégories</h3>
                <button
                  type="button"
                  onClick={() => setCatOpen(false)}
                  aria-label="Fermer les catégories"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <Link
                to="/a-propos"
                onClick={() => setCatOpen(false)}
                className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5 text-sm font-bold text-[#FF6B00] transition hover:bg-[#FFF7F0]"
              >
                À propos de Dango Import
                <ChevronRight size={16} />
              </Link>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {catLoading && (
                  <p className="px-5 py-6 text-sm text-slate-400">Chargement des catégories...</p>
                )}
                {catError && (
                  <p className="px-5 py-6 text-sm text-red-500">
                    Impossible de charger les catégories.
                  </p>
                )}
                {!catLoading && !catError && categories.length === 0 && (
                  <p className="px-5 py-6 text-sm text-slate-500">
                    Aucune catégorie disponible.
                  </p>
                )}

                {categories.map((cat) => (
                  <button
                    key={cat._id || cat.slug || cat.name}
                    type="button"
                    onClick={() => {
                      setCatOpen(false);
                      navigate(buildCategoryHref(cat.name, cat.slug));
                    }}
                    className="flex w-full items-center justify-between border-b border-slate-50 px-5 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-[#FFF7F0] hover:text-[#FF6B00]"
                  >
                    <span>{cat.name}</span>
                    <ChevronRight size={17} className="shrink-0 text-slate-400" />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESPACEUR DU HEADER FIXE */}
      <div aria-hidden="true" style={{ height: `${headerHeight}px` }} />

      {/* ========== NAVIGATION MOBILE (BAS) ========== */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-100 bg-white lg:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        aria-label="Navigation principale"
      >
        <div className="mx-auto grid h-16 max-w-[600px] grid-cols-4">
          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onHome ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home size={22} strokeWidth={onHome ? 2.3 : 1.8} />
            <span className="text-[11px] font-semibold">Accueil</span>
          </Link>

          <button
            ref={mobileCatButtonRef}
            type="button"
            onClick={() => {
              setCatOpen((value) => !value);
              setShowSuggestions(false);
            }}
            aria-expanded={catOpen}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              catOpen ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu size={23} strokeWidth={catOpen ? 2.3 : 1.8} />
            <span className="text-[11px] font-semibold">Catégories</span>
          </button>

          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onCart ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <ShoppingCart size={22} strokeWidth={onCart ? 2.3 : 1.8} />
            <span className="text-[11px] font-semibold">
              Panier{cartCount > 0 && ` (${cartLabel})`}
            </span>
          </Link>

          <Link
            to={user ? '/mes-commandes' : '/login'}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onAccount ? 'text-[#FF6B00]' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserRound size={22} strokeWidth={onAccount ? 2.3 : 1.8} />
            <span className="text-[11px] font-semibold">Compte</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default memo(Header);