import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Search, ChevronDown, Menu, X, Cpu, Shirt, Home as HomeIcon,
  Sparkles, Smartphone, Laptop, Headphones, Dumbbell, User, ShoppingCart, LogOut,
  Tag, Flame, HelpCircle, ShoppingBag, MessageSquare,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../apiClient';
import { useCart } from '../context/CartContext';

/* ------------------------------------------------------------------ */
/* Tokens partagés — un seul jeu de règles pour tout le header, afin   */
/* que le style reste cohérent d'un composant à l'autre.              */
/* ------------------------------------------------------------------ */

// Pas de ring/bordure visible au focus dans le header
const FOCUS_RING = 'focus:outline-none focus-visible:outline-none';

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

const QUICK_NAV_LINKS = [
  { label: 'Boutique', to: '/shopping' },
  { label: 'Promotions', to: '/promotions' },
  { label: 'Nouveautés', to: '/nouveautes' },
  { label: 'Meilleures ventes', to: '/best-sellers' },
  { label: 'Centre d\'aide', to: '/centre-aide' },
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
      className={`flex shrink-0 items-center gap-2 rounded-md ${FOCUS_RING}`}
      aria-label="Dango import — accueil"
    >

      <span className="flex items-baseline gap-0.5 whitespace-nowrap text-lg tracking-tight sm:text-xl">
        <span className="font-extrabold text-slate-900">Dango</span>
        <span className="font-semibold text-[#FF6B00]">import</span>
      </span>
    </button>
  );
}

/** Menu mobile complet — navigation, compte et catégories */
function MobileNavDrawer({ open, onClose, user, cartCount, onLogout, navigate }) {
  const userName = user?.userFirstname || user?.firstname || user?.name || 'Mon compte';

  const go = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[110] bg-black/40 backdrop-blur-[2px] md:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.22 }}
            className="fixed left-0 top-0 z-[120] flex h-full w-[min(88vw,320px)] flex-col overflow-hidden bg-white shadow-2xl md:hidden"
            style={{ paddingTop: 'env(safe-area-inset-top)' }}
          >
            <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-4 py-4">
              <BrandLogo onClick={() => go('/')} />
              <button
                type="button"
                onClick={onClose}
                className={`rounded-lg p-2 text-slate-500 hover:bg-slate-100 ${FOCUS_RING}`}
                aria-label="Fermer le menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain">
              {/* Compte */}
              <div className="border-b border-slate-100 px-4 py-4">
                {user ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-900">Bonjour, {userName}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button type="button" onClick={() => go('/mes-commandes')} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700">
                        <ShoppingBag size={15} /> Commandes
                      </button>
                      <button type="button" onClick={() => go('/messages')} className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700">
                        <MessageSquare size={15} /> Messages
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => { onLogout(); onClose(); }}
                      className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-600"
                    >
                      <LogOut size={14} /> Déconnexion
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => go('/login')}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-3 text-sm font-semibold text-white"
                  >
                    <User size={16} /> Se connecter
                  </button>
                )}
              </div>

              {/* Navigation rapide */}
              <div className="border-b border-slate-100 px-2 py-2">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Navigation</p>
                {[
                  { label: 'Accueil', to: '/', Icon: HomeIcon },
                  { label: 'Boutique', to: '/shopping', Icon: ShoppingBag },
                  { label: 'Promotions', to: '/promotions', Icon: Tag },
                  { label: 'Nouveautés', to: '/nouveautes', Icon: Sparkles },
                  { label: 'Meilleures ventes', to: '/best-sellers', Icon: Flame },
                  { label: 'Panier', to: '/cart', Icon: ShoppingCart, badge: cartCount },
                  { label: 'Centre d\'aide', to: '/centre-aide', Icon: HelpCircle },
                ].map(({ label, to, Icon, badge }) => (
                  <Link
                    key={to}
                    to={to}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Icon size={18} className="text-slate-400" />
                    <span className="flex-1">{label}</span>
                    {badge > 0 && (
                      <span className="rounded-full bg-[#FF6B00] px-2 py-0.5 text-[10px] font-bold text-white">
                        {badge > 99 ? '99+' : badge}
                      </span>
                    )}
                  </Link>
                ))}
              </div>

              {/* Catégories */}
              <div className="px-2 py-2 pb-6">
                <p className="px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">Catégories</p>
                {CATEGORY_LINKS.map(({ label, slug, Icon }) => (
                  <Link
                    key={slug}
                    to={`/category/${slug}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Icon size={17} className="text-slate-400" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/** Bandeau de liens rapides — desktop uniquement */
function DesktopQuickNav({ pathname }) {
  return (
    <nav
      className="hidden border-t border-slate-100 bg-slate-50/80 md:block"
      aria-label="Navigation rapide"
    >
      <div className="mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-4 py-2 sm:px-6 lg:px-8">
        {QUICK_NAV_LINKS.map(({ label, to }) => {
          const active = pathname === to || pathname.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={`shrink-0 rounded-md px-3 py-1.5 text-xs font-semibold transition sm:text-sm ${
                active
                  ? 'bg-white text-[#FF6B00] shadow-sm ring-1 ring-slate-200'
                  : 'text-slate-600 hover:bg-white hover:text-slate-900'
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
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

            {user && (
              <div className="border-t border-slate-100 py-1">
                {[
                  { label: 'Mes commandes', to: '/mes-commandes', Icon: ShoppingBag },
                  { label: 'Messages', to: '/messages', Icon: MessageSquare },
                ].map(({ label, to, Icon }) => (
                  <button
                    key={to}
                    type="button"
                    onClick={() => { navigate(to); setAccountOpen(false); }}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                  >
                    <Icon size={15} className="text-slate-400" />
                    {label}
                  </button>
                ))}
              </div>
            )}

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
        className={`dango-header fixed left-0 right-0 top-0 z-40 border-b border-slate-200 bg-white/95 transition-all duration-200 ${
          scrolled ? 'shadow-md shadow-slate-900/[0.06] backdrop-blur-md' : 'backdrop-blur-sm'
        }`}
        style={{ paddingTop: 'env(safe-area-inset-top)' }}
      >
        <div className="mx-auto max-w-7xl px-3 py-2.5 sm:px-6 sm:py-3 lg:px-8">
          {/* Ligne principale */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-6">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 md:hidden ${FOCUS_RING}`}
              aria-label="Ouvrir le menu"
            >
              <Menu size={22} />
            </button>

            <BrandLogo onClick={() => navigate('/')} />

            {/* Recherche desktop */}
            <div className="hidden flex-1 items-center justify-center md:flex">
              <div className="relative w-full max-w-2xl">
                <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
                  <SearchForm
                    inputRef={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onSubmit={handleSearch}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={handleSearchBlur}
                  />
                </div>
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

            <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1">
              <button
                type="button"
                onClick={() => navigate('/cart')}
                className={`relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-700 transition hover:bg-slate-100 ${FOCUS_RING}`}
                aria-label="Panier"
              >
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#FF6B00] px-1 text-[10px] font-bold text-white ring-2 ring-white">
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

          {/* Recherche mobile — pleine largeur, sans bouton catégories dupliqué */}
          <div className="relative mt-2.5 md:hidden">
            <div className="flex h-11 items-stretch overflow-hidden rounded-lg border border-slate-300 bg-white shadow-sm">
              <SearchForm
                showLabel={false}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onSubmit={handleSearch}
                onFocus={() => setShowSuggestions(true)}
                onBlur={handleSearchBlur}
              />
            </div>
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

        <DesktopQuickNav pathname={location.pathname} />

        <MobileNavDrawer
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          user={user}
          cartCount={cartCount}
          onLogout={handleLogout}
          navigate={navigate}
        />
      </header>
      {/* Espaceur dynamique : pousse le contenu sous le header fixe */}
      <div aria-hidden="true" style={{ height: 'var(--header-h, 64px)' }} />
    </>
  );
};

export default Header;