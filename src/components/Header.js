import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronDown, Menu, X, Cpu, Shirt, Home as HomeIcon,
  Sparkles, Smartphone, Laptop, Headphones, Dumbbell, User, ShoppingCart, LayoutGrid, LogOut,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../apiClient';
import { getProductImage } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';

/* ------------------------------------------------------------------ */
/* Tokens partagés — un seul jeu de règles pour tout le header, afin   */
/* que le style reste cohérent d'un composant à l'autre.              */
/* ------------------------------------------------------------------ */

// Un seul style d'anneau de focus clavier, partout.
const FOCUS_RING = 'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/50 focus-visible:ring-offset-1';

// Les panneaux flottants (mega menu, suggestions, compte) partagent la
// même carte : bordure fine, ombre légère, coins modérément arrondis —
// pas de glow ni de rayon extrême, pour rester sobre.
const PANEL = 'rounded-lg border border-slate-200 bg-white shadow-md shadow-slate-900/[0.06]';

/** Calcule et expose la hauteur du header via la variable CSS --header-h */
function useHeaderHeight(headerRef) {
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const update = () =>
      document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, [headerRef]);
}

const SEARCH_FALLBACK_TERMS = ['T-shirt', 'Chaussures', 'Sac à dos', 'Smartphone', 'Parfum', 'Montre', 'Chargeur', 'Écouteurs'];

export const CATEGORY_LINKS = [
  { label: 'Électronique', slug: 'electronique', Icon: Cpu },
  { label: 'Mode', slug: 'mode', Icon: Shirt },
  { label: 'Maison', slug: 'maison', Icon: HomeIcon },
  { label: 'Beauté', slug: 'beaute', Icon: Sparkles },
  { label: 'Téléphones', slug: 'telephones', Icon: Smartphone },
  { label: 'Informatique', slug: 'informatique', Icon: Laptop },
  { label: 'Accessoires', slug: 'accessoires', Icon: Headphones },
  { label: 'Sport', slug: 'sport', Icon: Dumbbell },
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
    if (normalizedName.includes(normalizedQuery)) unique.add(trimmedName);
  }

  return Array.from(unique).slice(0, 6).map(String);
}

/**
 * Logo "Dango import" — wordmark seul. La distinction entre les deux mots
 * se fait par la graisse ET la couleur (pas juste la couleur), ce qui lit
 * comme un choix typographique plutôt qu'un simple mot souligné en orange.
 */
function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex shrink-0 items-baseline gap-0.5 whitespace-nowrap rounded-md text-xl tracking-tight sm:text-2xl ${FOCUS_RING}`}
      aria-label="Dango import — accueil"
    >
      <span className="font-extrabold text-slate-900">Dango</span>
      <span className="font-medium text-[#FF6B00]">import</span>
    </button>
  );
}

/** Mega menu catégories — déclencheur intégré à la barre de recherche */
function CategoryMegaMenu() {
  const [open, setOpen] = useState(false);
  const [activeSlug, setActiveSlug] = useState(CATEGORY_LINKS[0].slug);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setOpen(false);
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);

  const { data: activeCategory } = useQuery({
    queryKey: ['megaMenuCategory', activeSlug],
    queryFn: async () => (await client.get(`/categories/${activeSlug}`)).data.data,
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const { data: activeProductsRaw } = useQuery({
    queryKey: ['megaMenuProducts', activeSlug],
    queryFn: async () => {
      const res = await client.get(`/categories/${activeSlug}/products?limit=6`);
      return res.data.data || res.data;
    },
    enabled: open,
    staleTime: 5 * 60 * 1000,
  });

  const products = Array.isArray(activeProductsRaw) ? activeProductsRaw : activeProductsRaw?.data || [];

  const brands = useMemo(() => {
    const seen = new Map();
    for (const p of products) {
      const key = p?.brand ? String(p.brand).trim() : '';
      if (key) seen.set(key, true);
    }
    return Array.from(seen.keys()).slice(0, 8);
  }, [products]);

  const activeLabel = CATEGORY_LINKS.find((c) => c.slug === activeSlug)?.label;

  return (
    <div className="relative shrink-0" ref={menuRef} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex h-full items-center gap-1.5 rounded-l-md px-4 text-sm font-medium text-slate-700 transition hover:text-slate-900 ${FOCUS_RING}`}
      >
        Catégories
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            onMouseEnter={() => setOpen(true)}
            className={`absolute left-0 top-full z-40 mt-2 flex w-[720px] max-w-[90vw] overflow-hidden ${PANEL}`}
          >
            <div className="w-52 shrink-0 border-r border-slate-100 py-2">
              {CATEGORY_LINKS.map(({ label, slug, Icon }) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  onMouseEnter={() => setActiveSlug(slug)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${
                    activeSlug === slug ? 'bg-slate-50 font-medium text-slate-900' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={16} className="text-slate-400" />
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-slate-900">{activeCategory?.name || activeLabel}</h4>
                <Link to={`/category/${activeSlug}`} onClick={() => setOpen(false)} className="text-xs font-medium text-[#FF6B00] hover:underline">
                  Voir tout
                </Link>
              </div>

              {activeCategory?.description && <p className="mt-1 text-xs text-slate-500">{activeCategory.description}</p>}

              {products.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {products.slice(0, 6).map((p) => {
                    const image = getProductImage(p) || '';
                    const price = Number(p.promoPrice || p.price || 0);
                    return (
                      <Link
                        key={p._id || p.id}
                        to={`/category/${activeSlug}`}
                        onClick={() => setOpen(false)}
                        className="group rounded-md border border-transparent p-1.5 transition hover:border-slate-200"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                          {image && <img src={image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />}
                        </div>
                        <p className="mt-1.5 truncate text-xs text-slate-700">{p.name}</p>
                        {price > 0 && <p className="text-xs font-semibold text-slate-900">{price.toLocaleString('fr-FR')} FCFA</p>}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Aucun produit à afficher pour le moment.</p>
              )}

              {brands.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-xs font-medium text-slate-400">Marques disponibles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <Link
                        key={b}
                        to={`/category/${activeSlug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-md border border-slate-200 px-2.5 py-1 text-xs text-slate-600 hover:border-slate-300 hover:text-slate-900"
                      >
                        {b}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Tiroir catégories pour mobile */
function MobileCategoryDrawer({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/30 md:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="fixed left-0 top-0 z-[120] h-full w-[80vw] max-w-sm overflow-y-auto bg-white shadow-xl md:hidden"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-4 py-4">
              <span className="text-sm font-semibold text-slate-900">Catégories</span>
              <button
                type="button"
                onClick={onClose}
                className={`rounded-md p-1.5 text-slate-500 hover:bg-slate-100 ${FOCUS_RING}`}
                aria-label="Fermer"
              >
                <X size={20} />
              </button>
            </div>

            <nav className="py-2">
              {CATEGORY_LINKS.map(({ label, slug, Icon }) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm text-slate-700 hover:bg-slate-50"
                >
                  <Icon size={18} className="text-slate-400" />
                  {label}
                </Link>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/**
 * Défini au niveau module (et non dans Header) pour garder une identité de
 * composant stable entre les rendus : sinon React démonte/remonte l'input
 * à chaque frappe et le focus saute.
 */
function SearchForm({ className = '', inputRef, value, onChange, onSubmit, onFocus, onBlur, showLabel = true }) {
  return (
    <form onSubmit={onSubmit} data-search-widget className={`flex h-full flex-1 items-center gap-2 px-3 ${className}`}>
      <Search size={17} className="shrink-0 text-slate-400" />
      <input
        ref={inputRef}
        className="min-w-0 flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
        placeholder="Rechercher un produit, une marque..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
      />
      <button
        className={`flex shrink-0 items-center gap-1.5 rounded-md bg-[#FF6B00] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#E85F00] ${FOCUS_RING}`}
        type="submit"
        onMouseDown={(e) => e.preventDefault()}
        aria-label="Rechercher"
      >
        <Search size={15} className={showLabel ? 'hidden' : ''} />
        {showLabel && 'Rechercher'}
      </button>
    </form>
  );
}

function SuggestionsPanel({ suggestionLoading, suggestions, searchQuery, onSelect }) {
  return (
    <div data-suggestions-panel className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden ${PANEL}`}>
      <div className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-400">Suggestions</div>

      {suggestionLoading ? (
        <div className="px-4 py-3 text-sm text-slate-500">Recherche...</div>
      ) : suggestions.length > 0 ? (
        suggestions.map((term) => (
          <button
            key={term}
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onSelect(term)}
            className="block w-full px-4 py-2.5 text-left text-sm text-slate-700 transition hover:bg-slate-50"
          >
            {term}
          </button>
        ))
      ) : (
        <div className="space-y-2 px-4 py-3">
          <p className="text-sm text-slate-500">Pas de terme exact, essayez :</p>
          <div className="flex flex-wrap gap-2">
            {SEARCH_FALLBACK_TERMS.filter((t) => t.toLowerCase() !== searchQuery.toLowerCase()).map((term) => (
              <button
                key={term}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onSelect(term)}
                className="rounded-md border border-slate-200 px-2.5 py-1.5 text-xs text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AccountMenu({
  accountRef, accountOpen, setAccountOpen, user, showAvatarImage, userAvatar,
  userDisplayName, userInitial, setAvatarError, userSurname, userEmail,
  handleLogout, navigate,
}) {
  return (
    <div className="relative shrink-0" ref={accountRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setAccountOpen((prev) => !prev)}
        className={`flex h-10 w-10 items-center justify-center gap-2 rounded-md transition hover:bg-slate-100 sm:w-auto sm:justify-start sm:px-2 ${FOCUS_RING}`}
      >
        {showAvatarImage ? (
          <img
            src={userAvatar}
            alt={userDisplayName}
            className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
            {user ? userInitial : <User size={17} />}
          </span>
        )}

        {user && (
          <span className="hidden max-w-[110px] items-center gap-1 truncate text-sm text-slate-700 sm:flex">
            {userDisplayName}
            <ChevronDown size={13} className={`shrink-0 text-slate-400 transition-transform ${accountOpen ? 'rotate-180' : ''}`} />
          </span>
        )}
      </button>

      <AnimatePresence>
        {accountOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 z-50 mt-2 w-72 max-w-[90vw] overflow-hidden ${PANEL}`}
          >
            <div className="flex items-center gap-3 px-4 py-4">
              {user ? (
                <>
                  {showAvatarImage ? (
                    <img src={userAvatar} alt={userDisplayName} className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                      {userInitial}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{userDisplayName} {userSurname}</p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </>
              ) : (
                <p className="w-full py-1 text-center text-sm text-slate-500">Aucun utilisateur connecté</p>
              )}
            </div>

            <div className="border-t border-slate-100 px-4 py-3">
              {user ? (
                <button
                  type="button"
                  onClick={() => { handleLogout(); setAccountOpen(false); }}
                  className={`flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 ${FOCUS_RING}`}
                >
                  <LogOut size={15} />
                  Déconnexion
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { navigate('/login'); setAccountOpen(false); }}
                  className={`flex w-full items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#E85F00] ${FOCUS_RING}`}
                >
                  Se connecter
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const Header = () => {
  const headerRef = useRef(null);
  useHeaderHeight(headerRef);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const suggestionTimer = useRef(null);
  const suggestionRequestRef = useRef(0);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const loadUser = () => {
      const stored = localStorage.getItem('dangoUser');
      if (!stored) return setUser(null);
      try {
        setUser(JSON.parse(stored));
      } catch {
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
    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      suggestionRequestRef.current += 1;
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);
    const requestId = ++suggestionRequestRef.current;

    suggestionTimer.current = window.setTimeout(async () => {
      try {
        const response = await client.get(`/products?limit=10&search=${encodeURIComponent(trimmed)}`);
        if (requestId !== suggestionRequestRef.current) return;

        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        const terms = buildSearchSuggestions(items, trimmed).filter((t) => typeof t === 'string');

        setSuggestions(
          terms.length > 0
            ? terms
            : SEARCH_FALLBACK_TERMS.filter(
                (t) => t.toLowerCase().includes(trimmed.toLowerCase()) && t.toLowerCase() !== trimmed.toLowerCase()
              )
        );
      } catch {
        if (requestId !== suggestionRequestRef.current) return;

        setSuggestions(
          SEARCH_FALLBACK_TERMS.filter(
            (t) => t.toLowerCase().includes(trimmed.toLowerCase()) && t.toLowerCase() !== trimmed.toLowerCase()
          )
        );
      } finally {
        if (requestId === suggestionRequestRef.current) {
          setSuggestionLoading(false);
        }
      }
    }, 280);

    return () => {
      if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    };
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    window.addEventListener('pointerdown', handleClickOutside);
    return () => window.removeEventListener('pointerdown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileMenuOpen]);

  // Ferme le tiroir mobile si on repasse en desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileMenuOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Ombre du header uniquement une fois qu'on a scrollé, pour ne pas
  // écraser visuellement le contenu quand on est en haut de page.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Si l'utilisateur change (nouvelle connexion, avatar mis à jour...),
  // on redonne sa chance à la nouvelle image avant de retomber sur le repli.
  useEffect(() => {
    setAvatarError(false);
  }, [user]);

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
    searchInputRef.current?.blur();
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSuggestionSelect = (term) => {
    const normalizedTerm = String(term || '').trim();
    if (!normalizedTerm) return;
    setSearchQuery(normalizedTerm);
    setShowSuggestions(false);
    navigate(`/shopping?q=${encodeURIComponent(normalizedTerm)}`);
  };

  const handleSearchBlur = (event) => {
    const nextTarget = event?.relatedTarget;
    const currentInput = event?.currentTarget;
    const searchWidget = currentInput?.closest?.('[data-search-widget]');
    const suggestionPanel = searchWidget?.parentElement?.querySelector?.('[data-suggestions-panel]');

    if (nextTarget && searchWidget && searchWidget.contains(nextTarget)) return;
    if (nextTarget && suggestionPanel && suggestionPanel.contains(nextTarget)) return;

    window.setTimeout(() => {
      const currentActive = document.activeElement;
      const stillInsideSearch =
        (searchWidget && searchWidget.contains(currentActive)) ||
        (suggestionPanel && suggestionPanel.contains(currentActive));

      if (!stillInsideSearch) setShowSuggestions(false);
    }, 120);
  };

  const userDisplayName = user?.userFirstname || user?.firstname || user?.userName || user?.name || 'Compte';
  const userEmail = user?.userEmail || user?.email || '';
  const userSurname = user?.userSurname || user?.surname || '';
  const userAvatar = user?.profileImage || user?.avatar || user?.photoURL || user?.picture || user?.userProfileImage || '';
  const userInitial = (userDisplayName || 'U').charAt(0).toUpperCase();
  const showAvatarImage = Boolean(userAvatar) && !avatarError;

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white transition-shadow duration-200 ${
          scrolled ? 'shadow-sm shadow-slate-900/[0.05]' : ''
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          {/* Ligne principale : logo, barre Catégories + recherche (desktop), panier, compte */}
          <div className="flex items-center gap-3 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 md:hidden ${FOCUS_RING}`}
              aria-label="Ouvrir les catégories"
            >
              <Menu size={22} />
            </button>

            <BrandLogo onClick={() => navigate('/')} />

            {/* Barre Catégories + recherche fusionnée — desktop/tablette */}
            <div className="hidden flex-1 md:flex md:justify-center">
              <div className="relative flex h-11 w-full max-w-2xl items-stretch rounded-md border border-slate-300 bg-white ">
                <CategoryMegaMenu />
                <div className="my-2.5 w-px shrink-0 self-stretch bg-slate-200" />
                <SearchForm
                  inputRef={searchInputRef}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onSubmit={handleSearch}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={handleSearchBlur}
                />
                {showSuggestions && (
                  <SuggestionsPanel
                    suggestionLoading={suggestionLoading}
                    suggestions={suggestions}
                    searchQuery={searchQuery}
                    onSelect={handleSuggestionSelect}
                  />
                )}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className={`relative flex h-10 w-10 items-center justify-center rounded-md text-slate-700 transition hover:bg-slate-100 ${FOCUS_RING}`}
                aria-label="Panier"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-semibold text-white">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </button>

              <AccountMenu
                accountRef={accountRef}
                accountOpen={accountOpen}
                setAccountOpen={setAccountOpen}
                user={user}
                showAvatarImage={showAvatarImage}
                userAvatar={userAvatar}
                userDisplayName={userDisplayName}
                userInitial={userInitial}
                setAvatarError={setAvatarError}
                userSurname={userSurname}
                userEmail={userEmail}
                handleLogout={handleLogout}
                navigate={navigate}
              />
            </div>
          </div>

          {/* Barre Catégories + recherche — mobile, toujours visible sous le logo */}
          <div className="relative mt-3 flex h-11 items-stretch rounded-md border border-slate-300 bg-white md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`flex shrink-0 items-center gap-1.5 rounded-l-md pl-4 pr-3 text-slate-600 ${FOCUS_RING}`}
              aria-label="Ouvrir les catégories"
            >
              <LayoutGrid size={18} />
            </button>
            <div className="my-2.5 w-px shrink-0 self-stretch bg-slate-200" />
            <SearchForm
              showLabel={false}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onSubmit={handleSearch}
              onFocus={() => setShowSuggestions(true)}
              onBlur={handleSearchBlur}
            />
            {showSuggestions && (
              <SuggestionsPanel
                suggestionLoading={suggestionLoading}
                suggestions={suggestions}
                searchQuery={searchQuery}
                onSelect={handleSuggestionSelect}
              />
            )}
          </div>
        </div>

        <MobileCategoryDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
      </header>
      {/* Espaceur dynamique : pousse le contenu sous le header fixe */}
      <div aria-hidden="true" style={{ height: 'var(--header-h, 64px)' }} />
    </>
  );
};

export default Header;