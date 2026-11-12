
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

// --------------------------------------------------
// LOGO TYPOGRAPHIQUE
// --------------------------------------------------

function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Accueil Dango import"
      className="flex shrink-0 items-baseline whitespace-nowrap tracking-[-1.4px]"
    >
      <span className="text-[25px] font-black leading-none text-[#171717] md:text-[28px]">
        Dango
      </span>

      <span className="text-[25px] font-bold leading-none text-[#F68B1E] md:text-[28px]">
        import
      </span>
    </button>
  );
}

// --------------------------------------------------
// RECHERCHE
// Aucun contour épais, aucun double encadrement
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
    <div
      ref={wrapperRef}
      className="relative min-w-0 flex-1"
    >
      <form
        onSubmit={onSubmit}
        role="search"
        className={`group flex w-full items-center overflow-hidden rounded-xl bg-[#F5F5F5] transition-colors duration-200 focus-within:bg-[#F0F0F0] ${
          compact ? 'h-11' : 'h-[50px]'
        }`}
      >
        <Search
          size={19}
          strokeWidth={1.8}
          className="ml-4 shrink-0 text-slate-500"
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
          className="h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-sm text-slate-800 outline-none ring-0 shadow-none placeholder:text-slate-400 focus:border-0 focus:outline-none focus:ring-0 focus-visible:outline-none focus-visible:ring-0"
          style={{
            border: 'none',
            outline: 'none',
            boxShadow: 'none',
          }}
        />

        {value && (
          <button
            type="button"
            onClick={onClear}
            aria-label="Effacer la recherche"
            className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
          >
            <X size={16} />
          </button>
        )}

        <button
          type="submit"
          aria-label="Rechercher"
          className={`flex h-full shrink-0 items-center justify-center bg-[#F68B1E] font-semibold text-white transition-colors hover:bg-[#E77B10] ${
            compact ? 'w-12' : 'min-w-[125px] px-6 text-sm'
          }`}
        >
          {compact ? (
            <Search size={19} />
          ) : (
            'Rechercher'
          )}
        </button>
      </form>

      {children}
    </div>
  );
}

// --------------------------------------------------
// HEADER PRINCIPAL
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

  const [scrolled, setScrolled] = useState(false);

  // Utilisateur
  const [user, setUser] = useState(null);
  const [accountOpen, setAccountOpen] = useState(false);

  // Recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  // Catégories
  const [catOpen, setCatOpen] = useState(false);
  const [activeCatKey, setActiveCatKey] = useState(null);

  // --------------------------------------------------
  // HAUTEUR DU HEADER FIXE
  // --------------------------------------------------

  useEffect(() => {
    const element = headerRef.current;

    if (!element) return undefined;

    const updateHeight = () => {
      document.documentElement.style.setProperty(
        '--header-h',
        `${element.offsetHeight}px`
      );
    };

    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(element);

    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
      document.documentElement.style.removeProperty('--header-h');
    };
  }, []);

  // --------------------------------------------------
  // OMBRE AU SCROLL
  // --------------------------------------------------

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 5);
    };

    onScroll();

    window.addEventListener('scroll', onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
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

    return () => {
      window.removeEventListener('authChange', loadUser);
    };
  }, []);

  // --------------------------------------------------
  // CATÉGORIES DEPUIS L'API
  // --------------------------------------------------

  const {
    data: categories = [],
    isLoading: catLoading,
    isError: catError,
  } = useQuery({
    queryKey: ['headerCategories'],

    queryFn: async () => {
      const res = await client.get('/categories');

      const raw =
        res?.data?.data ||
        res?.data?.categories ||
        res?.data;

      return Array.isArray(raw) ? raw : [];
    },

    staleTime: 300000,
  });

  const activeCategory = useMemo(() => {
    return (
      categories.find(
        (category) =>
          (category.slug || category.name) === activeCatKey
      ) ||
      categories[0] ||
      null
    );
  }, [categories, activeCatKey]);

  const activeName = activeCategory?.name;

  // --------------------------------------------------
  // PRODUITS DE LA CATÉGORIE ACTIVE
  // --------------------------------------------------

  const {
    data: categoryProducts = [],
    isLoading: productsLoading,
  } = useQuery({
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
  // SYNCHRONISATION RECHERCHE / URL
  // --------------------------------------------------

  useEffect(() => {
    setSearchQuery(
      new URLSearchParams(location.search).get('q') || ''
    );
  }, [location.search]);

  // --------------------------------------------------
  // FERMETURE DES MENUS À LA NAVIGATION
  // --------------------------------------------------

  useEffect(() => {
    setCatOpen(false);
    setAccountOpen(false);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
  }, [location.pathname, location.search]);

  // --------------------------------------------------
  // SUGGESTIONS DE PRODUITS
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

        if (!cancelled) {
          setSuggestions(items.slice(0, 5));
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
        }
      } finally {
        if (!cancelled) {
          setSuggestionLoading(false);
        }
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  // --------------------------------------------------
  // FERMETURE AU CLIC EXTÉRIEUR
  // --------------------------------------------------

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
        setAccountOpen(false);
      }

      const insideSearch =
        searchRef.current?.contains(event.target) ||
        mobileSearchRef.current?.contains(event.target);

      if (!insideSearch) {
        setShowSuggestions(false);
      }

      const insideCategories =
        catTriggerRef.current?.contains(event.target) ||
        catPanelRef.current?.contains(event.target) ||
        mobileCatPanelRef.current?.contains(event.target) ||
        mobileCatButtonRef.current?.contains(event.target);

      if (!insideCategories) {
        setCatOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setCatOpen(false);
        setAccountOpen(false);
        setShowSuggestions(false);
        setMobileSearchOpen(false);
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
  // MENU CATÉGORIES
  // --------------------------------------------------

  const openCats = useCallback(() => {
    if (catCloseTimer.current) {
      clearTimeout(catCloseTimer.current);
    }

    setCatOpen(true);
  }, []);

  const closeCatsLater = useCallback(() => {
    if (catCloseTimer.current) {
      clearTimeout(catCloseTimer.current);
    }

    catCloseTimer.current = setTimeout(() => {
      setCatOpen(false);
    }, 180);
  }, []);

  useEffect(() => {
    return () => {
      if (catCloseTimer.current) {
        clearTimeout(catCloseTimer.current);
      }
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

  const handleSearchSubmit = useCallback((event) => {
    if (event) event.preventDefault();

    const query = searchQuery.trim();

    setShowSuggestions(false);
    setMobileSearchOpen(false);

    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();

    navigate(
      query
        ? `/shopping?q=${encodeURIComponent(query)}`
        : '/shopping'
    );
  }, [navigate, searchQuery]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);

    const visible =
      window.innerWidth >= 1024
        ? searchInputRef.current
        : mobileSearchInputRef.current;

    visible?.focus();
  }, []);

  const openMobileSearch = () => {
    setMobileSearchOpen(true);
    setShowSuggestions(false);

    requestAnimationFrame(() => {
      mobileSearchInputRef.current?.focus();
    });
  };

  // --------------------------------------------------
  // INFORMATIONS UTILISATEUR
  // --------------------------------------------------

  const userName = useMemo(() => {
    return (
      user?.userFirstname ||
      user?.firstname ||
      user?.name ||
      user?.userName ||
      ''
    );
  }, [user]);

  const userInitial = (userName || 'M').charAt(0).toUpperCase();

  const onHome = location.pathname === '/';
  const onCart = location.pathname.startsWith('/cart');

  const onAccount =
    location.pathname.startsWith('/mes-commandes') ||
    location.pathname.startsWith('/login');

  // --------------------------------------------------
  // SUGGESTIONS
  // --------------------------------------------------

  const trimmedQuery = searchQuery.trim();

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
            <p className="px-4 py-4 text-sm text-slate-400">
              Recherche en cours...
            </p>
          )}

          {suggestions.length > 0 && (
            <ul className="py-1">
              {suggestions.map((product) => {
                const id = product._id || product.id;
                const name = product.name || product.title || 'Produit';
                const image = getProductImage(product);

                return (
                  <li key={id}>
                    <Link
                      to={`/product/${id}`}
                      onClick={() => setShowSuggestions(false)}
                      className="flex items-center gap-3 px-3 py-3 transition hover:bg-[#FFF7F0]"
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
                          <Package
                            size={18}
                            className="text-slate-300"
                          />
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
            className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold text-[#F68B1E] transition hover:bg-[#FFF7F0]"
          >
            <Search size={16} />

            <span className="truncate">
              Voir tous les résultats pour « {trimmedQuery} »
            </span>
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
        className={`fixed left-0 right-0 top-0 z-40 bg-white transition-shadow duration-200 ${
          scrolled
            ? 'shadow-[0_2px_12px_rgba(0,0,0,0.06)]'
            : ''
        }`}
        style={{
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        {user && (
          <PhoneUpdateBanner
            user={user}
            onUpdated={setUser}
          />
        )}

        {/* ==========================================
            MOBILE ET TABLETTE
            LOGO + RECHERCHE
        ========================================== */}

        <div className="lg:hidden">
          <div className="flex h-[62px] items-center justify-between px-4 sm:px-6">
            <BrandLogo onClick={() => navigate('/')} />

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openMobileSearch}
                aria-label="Ouvrir la recherche"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-700 transition hover:bg-slate-100 active:scale-95"
              >
                <Search size={23} strokeWidth={1.9} />
              </button>

              {user ? (
                <Link
                  to="/mes-commandes"
                  aria-label="Mon compte"
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FFF1E5] text-sm font-black text-[#F68B1E]"
                >
                  {userInitial}
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 transition hover:text-[#F68B1E]"
                >
                  Connexion
                </Link>
              )}
            </div>
          </div>

          <AnimatePresence>
            {mobileSearchOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-visible px-3 pb-3"
              >
                <div className="flex items-center gap-2">
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

                  <button
                    type="button"
                    onClick={() => {
                      setMobileSearchOpen(false);
                      setShowSuggestions(false);
                    }}
                    aria-label="Fermer la recherche"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ==========================================
            DESKTOP
        ========================================== */}

        <div className="mx-auto hidden h-[76px] max-w-[1440px] items-center gap-5 px-6 lg:flex xl:gap-7 xl:px-10">
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
              onClick={() => setCatOpen((value) => !value)}
              aria-expanded={catOpen}
              className={`flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-semibold transition ${
                catOpen
                  ? 'bg-[#FFF5ED] text-[#F68B1E]'
                  : 'text-slate-800 hover:bg-slate-50'
              }`}
            >
              <Menu size={19} strokeWidth={1.9} />

              <span>Toutes les catégories</span>

              <ChevronDown
                size={15}
                className={`transition-transform ${
                  catOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>

          {/* À PROPOS */}
          <Link
            to="/about"
            className="shrink-0 whitespace-nowrap text-sm font-medium text-slate-700 transition hover:text-[#F68B1E]"
          >
            À propos de Dango import
          </Link>

          {/* RECHERCHE DESKTOP */}
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
            className={`group relative flex h-11 shrink-0 items-center gap-2 rounded-lg px-3 transition hover:bg-[#FFF5ED] hover:text-[#F68B1E] ${
              onCart ? 'text-[#F68B1E]' : 'text-slate-800'
            }`}
          >
            <span className="relative">
              <ShoppingCart size={22} strokeWidth={1.8} />

              {cartCount > 0 && (
                <span className="absolute -right-2.5 -top-2.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[10px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>

            <span className="text-sm font-semibold">Panier</span>
          </Link>

          {/* COMPTE */}
          <div
            className="relative shrink-0"
            ref={accountRef}
          >
            {user ? (
              <button
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                aria-expanded={accountOpen}
                className="flex h-11 max-w-[190px] items-center gap-2.5 rounded-lg px-2.5 text-sm font-semibold text-slate-800 transition hover:bg-slate-50"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FFF1E5] text-sm font-black text-[#F68B1E]">
                  {userInitial}
                </span>

                <span className="truncate">
                  {userName || 'Mon compte'}
                </span>

                <ChevronDown
                  size={14}
                  className={`shrink-0 text-slate-400 transition-transform ${
                    accountOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>
            ) : (
              <Link
                to="/login"
                className="flex h-11 items-center justify-center rounded-lg bg-[#F68B1E] px-5 text-sm font-bold text-white transition hover:bg-[#E77B10]"
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
                  className="absolute right-0 top-full z-[80] mt-3 w-64 overflow-hidden rounded-xl bg-white p-2 shadow-[0_10px_35px_rgba(0,0,0,0.12)]"
                >
                  <div className="px-3 py-3">
                    <p className="truncate text-sm font-bold text-slate-900">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.userEmail || user.email}
                    </p>
                  </div>

                  <div className="my-1 h-px bg-slate-100" />

                  <Link
                    to="/mes-commandes"
                    onClick={() => setAccountOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#FFF5ED] hover:text-[#F68B1E]"
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

        {/* ==========================================
            MEGA MENU CATÉGORIES DESKTOP
        ========================================== */}

        <AnimatePresence>
          {catOpen && (
            <motion.div
              ref={catPanelRef}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.18 }}
              onMouseEnter={openCats}
              onMouseLeave={closeCatsLater}
              className="absolute left-0 right-0 top-full z-50 hidden h-[min(620px,75vh)] bg-white shadow-[0_15px_35px_rgba(0,0,0,0.12)] lg:flex"
            >
              {/* LISTE DES CATÉGORIES */}
              <div className="w-[290px] shrink-0 overflow-y-auto bg-[#FAFAFA] py-5">
                <h3 className="px-5 pb-3 text-sm font-bold text-slate-900">
                  Toutes les catégories
                </h3>

                {catLoading && (
                  <p className="px-5 py-6 text-sm text-slate-400">
                    Chargement...
                  </p>
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
                    activeCategory &&
                    (activeCategory.slug || activeCategory.name) === key;

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
                      className={`flex w-full items-center justify-between px-5 py-3 text-left text-sm font-semibold transition ${
                        selected
                          ? 'bg-white text-[#F68B1E]'
                          : 'text-slate-700 hover:bg-white hover:text-[#F68B1E]'
                      }`}
                    >
                      <span className="truncate">{cat.name}</span>

                      <ChevronRight
                        size={16}
                        className="shrink-0 text-slate-400"
                      />
                    </button>
                  );
                })}
              </div>

              {/* APERÇU PRODUITS */}
              <div className="flex min-w-0 flex-1 flex-col overflow-hidden p-7">
                {activeCategory ? (
                  <>
                    <div className="flex items-end justify-between pb-5">
                      <div>
                        <h3 className="text-2xl font-bold text-slate-900">
                          {activeCategory.name}
                        </h3>

                        <p className="mt-1 text-sm text-slate-500">
                          Découvrez les produits de cette catégorie.
                        </p>
                      </div>

                      <Link
                        to={buildCategoryHref(
                          activeCategory.name,
                          activeCategory.slug
                        )}
                        onClick={() => setCatOpen(false)}
                        className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm font-bold text-[#F68B1E] transition hover:bg-[#FFF5ED]"
                      >
                        Tout voir
                        <ChevronRight size={16} />
                      </Link>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto pt-3">
                      {productsLoading ? (
                        <div className="grid grid-cols-4 gap-5 xl:grid-cols-5">
                          {Array.from({ length: 8 }).map((_, index) => (
                            <div key={index} className="animate-pulse">
                              <div className="aspect-square rounded-lg bg-slate-100" />
                              <div className="mt-3 h-3 w-3/4 rounded bg-slate-100" />
                            </div>
                          ))}
                        </div>
                      ) : categoryProducts.length > 0 ? (
                        <div className="grid grid-cols-4 gap-5 xl:grid-cols-5">
                          {categoryProducts.slice(0, 10).map((product) => {
                            const image = getProductImage(product);
                            const productName =
                              product.name || product.title || 'Produit';
                            const productId = product._id || product.id;

                            return (
                              <Link
                                key={productId}
                                to={`/product/${productId}`}
                                onClick={() => setCatOpen(false)}
                                title={productName}
                                className="group flex min-w-0 flex-col"
                              >
                                <div className="aspect-square overflow-hidden rounded-lg bg-[#F6F6F6]">
                                  {image ? (
                                    <img
                                      src={image}
                                      alt={productName}
                                      referrerPolicy="no-referrer"
                                      loading="lazy"
                                      className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                                    />
                                  ) : (
                                    <div className="flex h-full items-center justify-center text-xs text-slate-400">
                                      Image indisponible
                                    </div>
                                  )}
                                </div>

                                <span className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-slate-800 transition group-hover:text-[#F68B1E]">
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
                            to={buildCategoryHref(
                              activeCategory.name,
                              activeCategory.slug
                            )}
                            onClick={() => setCatOpen(false)}
                            className="rounded-lg bg-[#F68B1E] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#E77B10]"
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
      </header>

      {/* ==========================================
          PANNEAU CATÉGORIES MOBILE ET TABLETTE
      ========================================== */}

      <AnimatePresence>
        {catOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-x-0 z-50 bg-black/35 lg:hidden"
            style={{
              top: 'var(--header-h, 70px)',
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
              className="flex h-full w-[85%] max-w-[380px] flex-col overflow-hidden bg-white shadow-2xl"
            >
              <div className="flex shrink-0 items-center justify-between px-5 py-4">
                <h3 className="text-lg font-bold text-slate-900">
                  Toutes les catégories
                </h3>

                <button
                  type="button"
                  onClick={() => setCatOpen(false)}
                  aria-label="Fermer les catégories"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto overscroll-contain">
                {catLoading && (
                  <p className="px-5 py-6 text-sm text-slate-400">
                    Chargement des catégories...
                  </p>
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
                    className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-800 transition hover:bg-[#FFF7F0] hover:text-[#F68B1E]"
                  >
                    <span>{cat.name}</span>

                    <ChevronRight
                      size={17}
                      className="shrink-0 text-slate-400"
                    />
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ESPACEUR DU HEADER FIXE */}

      <div
        aria-hidden="true"
        style={{
          height: 'var(--header-h, 70px)',
        }}
      />

      {/* ==========================================
          NAVIGATION MOBILE
      ========================================== */}

      <nav
        className="fixed bottom-0 left-0 right-0 z-[60] bg-white shadow-[0_-3px_12px_rgba(0,0,0,0.05)] lg:hidden"
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        aria-label="Navigation principale"
      >
        <div className="mx-auto grid h-16 max-w-[600px] grid-cols-4">
          {/* ACCUEIL */}

          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onHome
                ? 'text-[#F68B1E]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home
              size={22}
              strokeWidth={onHome ? 2.3 : 1.8}
            />

            <span className="text-[10px] font-semibold">
              Accueil
            </span>
          </Link>

          {/* CATÉGORIES */}

          <button
            ref={mobileCatButtonRef}
            type="button"
            onClick={() => {
              setCatOpen((value) => !value);
              setShowSuggestions(false);
              setMobileSearchOpen(false);
            }}
            aria-expanded={catOpen}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              catOpen
                ? 'text-[#F68B1E]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Menu
              size={23}
              strokeWidth={catOpen ? 2.3 : 1.8}
            />

            <span className="text-[10px] font-semibold">
              Catégories
            </span>
          </button>

          {/* PANIER */}

          <Link
            to="/cart"
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onCart
                ? 'text-[#F68B1E]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <span className="relative">
              <ShoppingCart
                size={22}
                strokeWidth={onCart ? 2.3 : 1.8}
              />

              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[9px] font-bold text-white">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </span>

            <span className="text-[10px] font-semibold">
              Panier
            </span>
          </Link>

          {/* COMPTE */}

          <Link
            to={user ? '/mes-commandes' : '/login'}
            className={`flex flex-col items-center justify-center gap-1 transition ${
              onAccount
                ? 'text-[#F68B1E]'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <UserRound
              size={22}
              strokeWidth={onAccount ? 2.3 : 1.8}
            />

            <span className="text-[10px] font-semibold">
              Compte
            </span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default memo(Header);
