import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search, ChevronDown, Menu, X, Cpu, Shirt, Home as HomeIcon,
  Sparkles, Smartphone, Laptop, Headphones, Dumbbell, User, ShoppingCart, LogOut,
  Tag, Flame, HelpCircle, ShoppingBag, Store, Package, ArrowUpRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../apiClient';
import { useCart } from '../context/CartContext';
import PhoneUpdateBanner from './PhoneUpdateBanner';

/* ------------------------------------------------------------------ */
/* Messages de réassurance : UN seul endroit à modifier.               */
/* Garde-les alignés avec la fiche produit (frais d'import calculés    */
/* au checkout) et ne promets que ce que tu peux tenir.               */
/* ------------------------------------------------------------------ */
const TRUST_ITEMS = [
  'Import direct depuis la Chine',
  'Paiement Mobile Money',
  "Frais d'importation calculés au checkout",
  'Garantie et support local',
];
// Un message de plus apparaît à chaque palier d'écran
const TRUST_VISIBILITY = ['', 'hidden sm:block', 'hidden md:block', 'hidden lg:block'];

const SELLER_URL = process.env.NODE_ENV === 'production'
  ? 'https://business.dangoimport.com'
  : 'http://localhost:5173/seller';

// Panneaux flottants : même carte partout
const PANEL = 'rounded-lg border border-slate-200 bg-white shadow-md shadow-slate-900/[0.06]';

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

const NAV_LINKS = [
  { label: 'Accueil', to: '/', Icon: HomeIcon },
  { label: 'Boutique', to: '/shopping', Icon: ShoppingBag },
  { label: 'À importer', to: '/a-importer', Icon: Package },
  { label: 'Marketplace', to: '/marketplace', Icon: Store },
  { label: 'Nouveautés', to: '/nouveautes', Icon: Sparkles },
  { label: 'Meilleures ventes', to: '/best-sellers', Icon: Flame },
  { label: 'Promotions', to: '/promotions', Icon: Tag },
  { label: 'Panier', to: '/cart', Icon: ShoppingCart, cart: true },
  { label: "Centre d'aide", to: '/centre-aide', Icon: HelpCircle },
];

export function buildCategoryHref(label, slug = '') {
  const safeLabel = (label || slug || '').trim();
  if (!safeLabel) return '/shopping';
  return `/shopping?category=${encodeURIComponent(safeLabel)}`;
}

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

const fallbackFor = (trimmed) => SEARCH_FALLBACK_TERMS.filter(
  (t) => t.toLowerCase().includes(trimmed.toLowerCase()) && t.toLowerCase() !== trimmed.toLowerCase(),
);

/**
 * Expose deux hauteurs en variables CSS :
 *  --header-h         hauteur complète (sert à l'espaceur, ne bouge pas au scroll)
 *  --header-sticky-h  hauteur réellement visible (à utiliser pour les éléments sticky)
 *  --header-bar-h     hauteur de la barre de messages (celle qui se replie)
 */
function useHeaderHeight(headerRef, barRef, barHidden) {
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return undefined;
    const root = document.documentElement;
    const update = () => {
      const full = el.offsetHeight;
      const bar = barRef.current?.offsetHeight || 0;
      root.style.setProperty('--header-h', `${full}px`);
      root.style.setProperty('--header-bar-h', `${bar}px`);
      root.style.setProperty('--header-sticky-h', `${barHidden ? full - bar : full}px`);
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener('resize', update);
    return () => { ro.disconnect(); window.removeEventListener('resize', update); };
  }, [headerRef, barRef, barHidden]);
}

function BrandLogo({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex shrink-0 items-center rounded-lg px-1 py-1"
      aria-label="Dango Import, accueil"
    >
      <span className="flex items-center gap-1.5 whitespace-nowrap" style={{ fontFamily: "'Inter', 'Plus Jakarta Sans', system-ui, sans-serif" }}>
        <span className="text-[20px] font-black uppercase leading-none tracking-[-0.03em] text-white sm:text-[24px]">Dango</span>
        <span className="rounded bg-white px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#FF6B00] sm:text-[12px]">Import</span>
      </span>
    </button>
  );
}

/** Menu mobile : se ferme avec Échap, prend le focus à l'ouverture */
function MobileNavDrawer({ open, onClose, user, cartCount, onLogout, navigate }) {
  const closeRef = useRef(null);
  const userName = user?.userFirstname || user?.firstname || user?.name || 'Mon compte';

  useEffect(() => {
    if (!open) return undefined;
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const go = (path) => { onClose(); navigate(path); };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px] md:hidden"
          />
          <motion.div
            role="dialog" aria-modal="true" aria-label="Menu principal" data-light-surface
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="fixed left-0 top-0 z-[120] flex h-full w-[min(88vw,320px)] flex-col overflow-hidden bg-white shadow-2xl md:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 bg-[#FF6B00] px-4 py-3">
              <BrandLogo onClick={() => go('/')} />
              <button ref={closeRef} type="button" onClick={onClose} className="rounded-lg p-2 text-white hover:bg-white/20" aria-label="Fermer le menu">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              <div className="border-b border-slate-100 px-4 py-4">
                {user ? (
                  <div className="space-y-2.5">
                    <p className="text-sm font-semibold text-slate-900">Bonjour, {userName}</p>
                    <button type="button" onClick={() => go('/mes-commandes')} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700">
                      <ShoppingBag size={15} /> Mes commandes
                    </button>
                    <button type="button" onClick={() => { onLogout(); onClose(); }} className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600">
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                ) : (
                  <button type="button" onClick={() => go('/login')} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-3 text-sm font-semibold text-white">
                    <User size={16} /> Se connecter
                  </button>
                )}
              </div>

              <nav className="border-b border-slate-100 px-2 py-2" aria-label="Navigation">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500">Navigation</p>
                {NAV_LINKS.map(({ label, to, Icon, cart }) => (
                  <Link key={to} to={to} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    <Icon size={18} className="text-slate-400" />
                    <span className="flex-1">{label}</span>
                    {cart && cartCount > 0 && (
                      <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[11px] font-bold text-white">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                  </Link>
                ))}
              </nav>

              <nav className="px-2 py-2" aria-label="Catégories">
                <p className="px-3 py-2 text-xs font-semibold text-slate-500">Catégories</p>
                {CATEGORY_LINKS.map(({ label, slug, Icon }) => (
                  <Link key={slug} to={buildCategoryHref(label, slug)} onClick={onClose} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50">
                    <Icon size={17} className="text-slate-400" />
                    <span>{label}</span>
                  </Link>
                ))}
                <a href={SELLER_URL} target="_blank" rel="noopener noreferrer" className="mt-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-semibold text-[#C24E00] hover:bg-orange-50">
                  <Store size={17} />
                  <span className="flex-1">Devenir vendeur ou B2B</span>
                  <ArrowUpRight size={15} />
                </a>
              </nav>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Défini hors de Header pour garder une identité stable (sinon l'input perd le focus à chaque frappe) */
function SearchForm({ inputRef, value, onChange, onSubmit, onFocus, onBlur, onKeyDown, showLabel = true, listId, expanded, activeId }) {
  return (
    <form role="search" onSubmit={onSubmit} data-search-widget className="flex h-full flex-1 items-center gap-2 px-3">
      <Search size={17} className="shrink-0 text-slate-400" aria-hidden />
      <input
        ref={inputRef}
        type="text"
        inputMode="search"
        role="combobox"
        aria-label="Rechercher un produit"
        aria-autocomplete="list"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-activedescendant={activeId || undefined}
        autoComplete="off"
        className="min-w-0 flex-1 border-none bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-500"
        placeholder="Rechercher un produit, une marque..."
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      <button
        className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#0f172a] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-[#1e293b]"
        type="submit"
        onMouseDown={(e) => e.preventDefault()}
        aria-label="Rechercher"
      >
        <Search size={15} className={showLabel ? 'hidden' : ''} aria-hidden />
        {showLabel && 'Rechercher'}
      </button>
    </form>
  );
}

function SuggestionsPanel({ listId, loading, suggestions, query, activeIndex, onSelect }) {
  const hasQuery = query.trim().length >= 2;
  const fallback = SEARCH_FALLBACK_TERMS.filter((t) => t.toLowerCase() !== query.trim().toLowerCase());
  return (
    <div data-suggestions-panel data-light-surface className={`absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden ${PANEL}`}>
      <p className="border-b border-slate-100 px-4 py-2 text-xs font-medium text-slate-500">
        {hasQuery ? 'Suggestions' : 'Idées de recherche'}
      </p>

      {hasQuery && loading ? (
        <p className="px-4 py-3 text-sm text-slate-500" role="status">Recherche en cours…</p>
      ) : hasQuery && suggestions.length > 0 ? (
        <ul id={listId} role="listbox" aria-label="Suggestions de recherche">
          {suggestions.map((term, i) => (
            <li
              key={term}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => onSelect(term)}
              className={`cursor-pointer px-4 py-2.5 text-sm text-slate-700 transition-colors hover:bg-slate-50 ${i === activeIndex ? 'bg-orange-50 font-medium text-slate-900' : ''}`}
            >
              {term}
            </li>
          ))}
        </ul>
      ) : (
        <div className="space-y-2 px-4 py-3">
          {hasQuery && <p className="text-sm text-slate-500">Aucune suggestion exacte, essayez :</p>}
          <div className="flex flex-wrap gap-2">
            {fallback.map((term) => (
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
  userDisplayName, userInitial, setAvatarError, userSurname, userEmail, handleLogout, navigate,
}) {
  return (
    <div className="relative shrink-0" ref={accountRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
        aria-label={user ? `Compte de ${userDisplayName}` : 'Se connecter'}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setAccountOpen((prev) => !prev)}
        className="flex h-10 items-center justify-center gap-2 rounded-lg transition hover:bg-white/20 sm:w-auto sm:justify-start sm:px-2"
      >
        {showAvatarImage ? (
          <img src={userAvatar} alt="" className="h-8 w-8 rounded-full border border-white/60 object-cover" onError={() => setAvatarError(true)} />
        ) : user ? (
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-black text-[#FF6B00]">{userInitial}</span>
        ) : (
          <span className="flex items-center gap-1.5 rounded-lg bg-white px-3 py-2 text-xs font-bold text-[#C24E00] shadow-sm transition hover:bg-orange-50">
            <User size={14} aria-hidden />
            <span className="hidden sm:inline">Se connecter</span>
          </span>
        )}
        {user && (
          <span className="hidden max-w-[110px] items-center gap-1 truncate text-xs font-bold text-white sm:flex">
            {userDisplayName}
            <ChevronDown size={13} className={`shrink-0 text-white/80 transition-transform ${accountOpen ? 'rotate-180' : ''}`} aria-hidden />
          </span>
        )}
      </button>

      <AnimatePresence>
        {accountOpen && (
          <motion.div
            role="menu" data-light-surface
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.12 }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            className={`absolute right-0 z-50 mt-2 w-72 max-w-[90vw] overflow-hidden text-slate-900 ${PANEL}`}
          >
            <div className="flex items-center gap-3 px-4 py-4">
              {user ? (
                <>
                  {showAvatarImage ? (
                    <img src={userAvatar} alt="" className="h-10 w-10 shrink-0 rounded-full border border-slate-200 object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">{userInitial}</span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">{userDisplayName} {userSurname}</p>
                    <p className="truncate text-xs text-slate-500">{userEmail}</p>
                  </div>
                </>
              ) : (
                <p className="w-full py-1 text-center text-sm text-slate-500">Vous n&apos;êtes pas connecté</p>
              )}
            </div>

            {user && (
              <div className="border-t border-slate-100 py-1">
                <button type="button" role="menuitem" onClick={() => { navigate('/mes-commandes'); setAccountOpen(false); }} className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50">
                  <ShoppingBag size={15} className="text-slate-400" aria-hidden />
                  Mes commandes
                </button>
              </div>
            )}

            <div className="border-t border-slate-100 px-4 py-3">
              {user ? (
                <button type="button" role="menuitem" onClick={() => { handleLogout(); setAccountOpen(false); }} className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600">
                  <LogOut size={15} aria-hidden />
                  Déconnexion
                </button>
              ) : (
                <button type="button" role="menuitem" onClick={() => { navigate('/login'); setAccountOpen(false); }} className="flex w-full items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#E85F00]">
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
  const barRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { cartCount } = useCart();

  const [barHidden, setBarHidden] = useState(false);
  useHeaderHeight(headerRef, barRef, barHidden);

  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);
  const [hasToken, setHasToken] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);

  const suggestionTimer = useRef(null);
  const suggestionRequestRef = useRef(0);
  const accountRef = useRef(null);
  const searchInputRef = useRef(null);
  const closeMobileMenu = React.useCallback(() => setMobileMenuOpen(false), []);

  // La barre de messages se replie quand on descend (avec hystérésis pour éviter le clignotement)
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        setBarHidden((prev) => (y > 96 ? true : y < 48 ? false : prev));
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get('q') || '');
  }, [location.search]);

  useEffect(() => {
    if (suggestionTimer.current) clearTimeout(suggestionTimer.current);
    const trimmed = searchQuery.trim();

    if (trimmed.length < 2) {
      suggestionRequestRef.current += 1;
      setSuggestions([]);
      setSuggestionLoading(false);
      return undefined;
    }

    setSuggestionLoading(true);
    const requestId = ++suggestionRequestRef.current;

    suggestionTimer.current = window.setTimeout(async () => {
      try {
        const response = await client.get(`/products?limit=10&search=${encodeURIComponent(trimmed)}`);
        if (requestId !== suggestionRequestRef.current) return;
        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        const terms = buildSearchSuggestions(items, trimmed);
        setSuggestions(terms.length > 0 ? terms : fallbackFor(trimmed));
      } catch {
        if (requestId !== suggestionRequestRef.current) return;
        setSuggestions(fallbackFor(trimmed));
      } finally {
        if (requestId === suggestionRequestRef.current) setSuggestionLoading(false);
      }
    }, 280);

    return () => { if (suggestionTimer.current) clearTimeout(suggestionTimer.current); };
  }, [searchQuery]);

  useEffect(() => { setActiveIndex(-1); }, [suggestions]);

  // Clic extérieur et touche Échap pour le menu compte
  useEffect(() => {
    const onPointerDown = (event) => {
      if (accountRef.current && !accountRef.current.contains(event.target)) setAccountOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') setAccountOpen(false); };
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previous; };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => { setAvatarError(false); }, [user]);

  const handleLogout = () => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    setUser(null);
    setHasToken(false);
    window.dispatchEvent(new Event('authChange'));
    navigate('/');
  };

  const handleSearch = (e) => {
    if (e) e.preventDefault();
    const q = searchQuery.trim();
    setShowSuggestions(false);
    (document.activeElement instanceof HTMLElement) && document.activeElement.blur();
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSuggestionSelect = (term) => {
    const t = String(term || '').trim();
    if (!t) return;
    setSearchQuery(t);
    setShowSuggestions(false);
    navigate(`/shopping?q=${encodeURIComponent(t)}`);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') { setShowSuggestions(false); setActiveIndex(-1); return; }
    if (!suggestions.length || searchQuery.trim().length < 2) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setShowSuggestions(true);
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault();
      handleSuggestionSelect(suggestions[activeIndex]);
    }
  };

  const handleSearchBlur = (event) => {
    const nextTarget = event?.relatedTarget;
    const widget = event?.currentTarget?.closest?.('[data-search-widget]');
    const panel = widget?.parentElement?.querySelector?.('[data-suggestions-panel]');
    if (nextTarget && ((widget && widget.contains(nextTarget)) || (panel && panel.contains(nextTarget)))) return;
    window.setTimeout(() => {
      const active = document.activeElement;
      if (!((widget && widget.contains(active)) || (panel && panel.contains(active)))) setShowSuggestions(false);
    }, 120);
  };

  const userDisplayName = user?.userFirstname || user?.firstname || user?.userName || user?.name || 'Compte';
  const userEmail = user?.userEmail || user?.email || '';
  const userSurname = user?.userSurname || user?.surname || '';
  const userAvatar = user?.profileImage || user?.avatar || user?.photoURL || user?.picture || user?.userProfileImage || '';
  const userInitial = (userDisplayName || 'U').charAt(0).toUpperCase();
  const showAvatarImage = Boolean(userAvatar) && !avatarError;

  const searchProps = {
    value: searchQuery,
    onChange: (e) => setSearchQuery(e.target.value),
    onSubmit: handleSearch,
    onFocus: () => setShowSuggestions(true),
    onBlur: handleSearchBlur,
    onKeyDown: handleSearchKeyDown,
  };
  const panelProps = { loading: suggestionLoading, suggestions, query: searchQuery, activeIndex, onSelect: handleSuggestionSelect };
  const listExpanded = showSuggestions && searchQuery.trim().length >= 2 && suggestions.length > 0;
  const activeId = (prefix) => (activeIndex >= 0 ? `${prefix}-${activeIndex}` : '');

  return (
    <>
      <header
        ref={headerRef}
        className="dango-header fixed left-0 right-0 top-0 z-40 bg-gradient-to-r from-[#FF6B00] via-[#FF5500] to-[#E64A00] text-white shadow-md shadow-orange-950/20 motion-reduce:transition-none"
        style={{
          paddingTop: 'env(safe-area-inset-top)',
          transform: barHidden ? 'translateY(calc(-1 * var(--header-bar-h, 0px)))' : 'none',
          transition: 'transform 0.2s ease',
        }}
      >

        {user && hasToken ? <PhoneUpdateBanner user={user} onUpdated={setUser} /> : null}

        <div className="mx-auto max-w-7xl px-2.5 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/20 sm:h-10 sm:w-10 md:hidden"
              aria-label="Ouvrir le menu"
              aria-haspopup="dialog"
            >
              <Menu size={22} />
            </button>

            <BrandLogo onClick={() => navigate('/')} />

            {/* Recherche desktop */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="relative w-full max-w-2xl">
                <div className="flex h-11 items-stretch overflow-hidden rounded-xl bg-white shadow-md transition-shadow focus-within:ring-2 focus-within:ring-white">
                  <SearchForm
                    inputRef={searchInputRef}
                    listId="search-list-desktop"
                    expanded={listExpanded}
                    activeId={activeId('search-list-desktop')}
                    {...searchProps}
                  />
                </div>
                {showSuggestions && <SuggestionsPanel listId="search-list-desktop" {...panelProps} />}
              </div>
            </div>

            <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-3">
              <Link to="/mes-commandes" className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/20 xl:flex">
                <Package size={17} aria-hidden />
                <span>Commandes</span>
              </Link>

              <button
                type="button"
                onClick={() => navigate('/cart')}
                className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
                aria-label={cartCount > 0 ? `Panier, ${cartCount} article${cartCount > 1 ? 's' : ''}` : 'Panier'}
              >
                <span className="relative">
                  <ShoppingCart size={20} aria-hidden />
                  {cartCount > 0 && (
                    <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-emerald-400 px-1 text-[10px] font-black text-slate-950 shadow-sm">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </span>
                <span className="hidden font-bold sm:inline">Panier</span>
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

          {/* Recherche mobile */}
          <div className="relative mt-2 md:hidden">
            <div className="flex h-10 items-stretch overflow-hidden rounded-xl bg-white shadow-sm transition-shadow focus-within:ring-2 focus-within:ring-white">
              <SearchForm
                showLabel={false}
                listId="search-list-mobile"
                expanded={listExpanded}
                activeId={activeId('search-list-mobile')}
                {...searchProps}
              />
            </div>
            {showSuggestions && <SuggestionsPanel listId="search-list-mobile" {...panelProps} />}
          </div>
        </div>

        <MobileNavDrawer
          open={mobileMenuOpen}
          onClose={closeMobileMenu}
          user={user}
          cartCount={cartCount}
          onLogout={handleLogout}
          navigate={navigate}
        />
      </header>

      {/* Espaceur : garde la hauteur complète pour que le contenu ne saute pas quand la barre se replie */}
      <div aria-hidden="true" style={{ height: 'var(--header-h, 64px)' }} />
    </>
  );
};

export default Header;