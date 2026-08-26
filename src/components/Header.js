import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Search, ChevronDown, Menu, X, Cpu, Shirt, Home as HomeIcon,
  Sparkles, Smartphone, Laptop, Headphones, Dumbbell, User, ShoppingCart,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../apiClient';
import { getProductImage } from '../utils/imageUrl';
import logo from '../images/logo.png';
import { useCart } from '../context/CartContext';

const SEARCH_FALLBACK_TERMS = ['T-shirt', 'Chaussures', 'Sac à dos', 'Smartphone', 'Parfum', 'Montre', 'Chargeur', 'Écouteurs'];

const CATEGORY_LINKS = [
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

/** Mega menu catégories (desktop uniquement) */
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
    <div className="relative" ref={menuRef} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-bold transition ${
          open ? 'bg-[#FFF1E5] text-[#FF6B00]' : 'text-slate-700 hover:bg-slate-50'
        }`}
      >
        <Menu size={15} />
        Toutes les catégories
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            onMouseEnter={() => setOpen(true)}
            className="absolute left-0 top-full z-40 mt-2 flex w-[720px] max-w-[90vw] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
          >
            <div className="w-56 shrink-0 border-r border-slate-100 bg-slate-50/60 py-2">
              {CATEGORY_LINKS.map(({ label, slug }) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  onMouseEnter={() => setActiveSlug(slug)}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition ${
                    activeSlug === slug ? 'bg-white text-[#FF6B00]' : 'text-slate-700 hover:bg-white/70'
                  }`}
                >
                  {/**<Icon size={16} className={activeSlug === slug ? 'text-[#FF6B00]' : 'text-slate-400'} /> */}
                  {label}
                </Link>
              ))}
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">{activeCategory?.name || activeLabel}</h4>
                <Link to={`/category/${activeSlug}`} onClick={() => setOpen(false)} className="text-xs font-bold text-[#FF6B00] hover:underline">
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
                        className="group rounded-lg border border-slate-100 p-2 transition hover:border-slate-200 hover:shadow-sm"
                      >
                        <div className="aspect-square w-full overflow-hidden rounded-md bg-slate-100">
                          {image && <img src={image} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />}
                        </div>
                        <p className="mt-1.5 truncate text-[11px] font-semibold text-slate-700">{p.name}</p>
                        {price > 0 && <p className="text-[11px] font-black text-[#FF6B00]">{price.toLocaleString('fr-FR')} FCFA</p>}
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-xs text-slate-400">Aucun produit à afficher pour le moment.</p>
              )}

              {brands.length > 0 && (
                <div className="mt-5 border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Marques disponibles</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {brands.map((b) => (
                      <Link
                        key={b}
                        to={`/category/${activeSlug}`}
                        onClick={() => setOpen(false)}
                        className="rounded-full border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-600 hover:border-[#FF6B00] hover:text-[#FF6B00]"
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
            className="fixed inset-0 z-[110] bg-black/40 md:hidden"
          />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            className="fixed left-0 top-0 z-[120] h-full w-[80vw] max-w-xs overflow-y-auto bg-white shadow-2xl md:hidden"
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4">
              <span className="text-sm font-black text-slate-900">Catégories</span>
              <button type="button" onClick={onClose} className="rounded-full p-1 text-slate-500 hover:bg-slate-100">
                <X size={20} />
              </button>
            </div>

            <nav className="py-2">
              {CATEGORY_LINKS.map(({ label, slug, Icon }) => (
                <Link
                  key={slug}
                  to={`/category/${slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
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

const Header = () => {
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
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const suggestionTimer = useRef(null);
  const accountRef = useRef(null);
  const mobileSearchInputRef = useRef(null);

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
      setSuggestions([]);
      setSuggestionLoading(false);
      return;
    }

    setSuggestionLoading(true);

    suggestionTimer.current = window.setTimeout(async () => {
      try {
        const response = await client.get(`/products?limit=10&search=${encodeURIComponent(trimmed)}`);
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
        setSuggestions(
          SEARCH_FALLBACK_TERMS.filter(
            (t) => t.toLowerCase().includes(trimmed.toLowerCase()) && t.toLowerCase() !== trimmed.toLowerCase()
          )
        );
      } finally {
        setSuggestionLoading(false);
      }
    }, 250);

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

  // Ferme le tiroir + la recherche mobile si on repasse en desktop
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) {
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Focus auto sur le champ dès qu'il s'ouvre sur mobile
  useEffect(() => {
    if (mobileSearchOpen) {
      const t = window.setTimeout(() => mobileSearchInputRef.current?.focus(), 150);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [mobileSearchOpen]);

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
    setMobileSearchOpen(false);
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const handleSuggestionSelect = (term) => {
    const normalizedTerm = String(term || '').trim();
    if (!normalizedTerm) return;
    setSearchQuery(normalizedTerm);
    setShowSuggestions(false);
    setMobileSearchOpen(false);
    navigate(`/shopping?q=${encodeURIComponent(normalizedTerm)}`);
  };

  const userDisplayName = user?.userFirstname || user?.firstname || user?.userName || user?.name || 'Compte';
  const userEmail = user?.userEmail || user?.email || '';
  const userSurname = user?.userSurname || user?.surname || '';
  const userAvatar = user?.profileImage || user?.avatar || user?.photoURL || user?.picture || user?.userProfileImage || '';
  const userInitial = (userDisplayName || 'U').charAt(0).toUpperCase();

  const SearchForm = ({ className = '', inputRef }) => (
    <form onSubmit={handleSearch} className={`w-full items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm flex ${className}`}>
      <Search size={16} className="text-slate-500" />
      <input
        ref={inputRef}
        className="ml-2 min-w-0 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none focus:outline-none focus:ring-0 focus:border-transparent placeholder:text-slate-400"
        placeholder="Cherchez un produit, une marque ou une catégorie"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setShowSuggestions(true)}
        onBlur={() => window.setTimeout(() => setShowSuggestions(false), 150)}
      />
      <button className="rounded-full bg-[#FF6B00] px-4 py-2 text-sm font-semibold text-white cursor-pointer whitespace-nowrap" type="submit">
        Rechercher
      </button>
    </form>
  );

  const SuggestionsPanel = () => (
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
            {SEARCH_FALLBACK_TERMS.filter((t) => t.toLowerCase() !== searchQuery.toLowerCase()).map((term) => (
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
  );

  const AccountMenu = () => (
    <div className="relative shrink-0" ref={accountRef}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={accountOpen}
        onPointerDown={(e) => e.stopPropagation()}
        onClick={() => setAccountOpen((prev) => !prev)}
        className="flex h-10 w-10 sm:w-auto items-center justify-center sm:justify-start gap-2 rounded-full border border-slate-200 bg-white px-0 sm:px-3 text-sm font-semibold text-slate-700 cursor-pointer shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userDisplayName}
            className="h-8 w-8 rounded-full object-cover border border-slate-200 bg-slate-100"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextSibling?.style?.setProperty('display', 'flex');
            }}
          />
        ) : null}

        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 font-bold text-sm ${userAvatar ? 'hidden' : 'flex'}`}
          style={{ display: userAvatar ? 'none' : 'flex' }}
        >
          {user ? userInitial : <User size={16} />}
        </span>

        {user && (
          <span className="hidden sm:inline truncate max-w-[120px] text-left">
            {userDisplayName}
          </span>
        )}
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
            className="absolute right-0 mt-2 w-72 max-w-[90vw] z-50 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl"
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
                  onClick={() => { navigate('/mes-commandes'); setAccountOpen(false); }}
                  className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-700 hover:bg-slate-200 cursor-pointer flex justify-center items-center"
                >
                  Mes commandes
                </button>
              )}

              {user ? (
                <button
                  type="button"
                  onClick={() => { handleLogout(); setAccountOpen(false); }}
                  className="w-full rounded-2xl bg-[#FFF7F1] px-4 py-3 text-center text-sm font-semibold text-[#FF6B00] hover:bg-[#FEF1E6] cursor-pointer flex justify-center items-center"
                >
                  Déconnexion
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => { navigate('/login'); setAccountOpen(false); }}
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
  );

  return (
    <header
      className="border-b border-slate-200"
      style={{
        position: 'fixed', width: '100%', top: 0, left: 0, right: 0, zIndex: 100,
        paddingBottom: '10px', backgroundColor: '#fff', borderBottom: '1px solid #E5E7EB',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8">
        {/* Ligne principale */}
        <div className="flex items-center gap-2 sm:gap-3 py-2">
          {/* Bouton catégories mobile */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-700 hover:bg-slate-100"
            aria-label="Catégories"
          >
            <Menu size={22} />
          </button>

          {/* Logo + nom du site */}
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2.5 shrink-0 min-w-0">
            <img
              src={logo}
              alt="logo dangoimport"
              className=" shrink-0  object-contain"
              width={100}
            />
            <span className="flex flex-col items-start leading-none min-w-0">
              <span className="hidden sm:inline text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">
                Marketplace
              </span>
            </span>
          </button>

          

          {/* Icônes à droite */}
          <div className="ml-auto flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Icône recherche mobile */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen((v) => !v)}
              className={`md:hidden flex h-10 w-10 items-center justify-center rounded-full transition ${
                mobileSearchOpen ? 'bg-[#FFF1E5] text-[#FF6B00]' : 'text-slate-700 hover:bg-slate-100'
              }`}
              aria-label="Rechercher"
              aria-expanded={mobileSearchOpen}
            >
              {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
            </button>

            {/* Bouton Panier (desktop + mobile) */}
            <button
              type="button"
              onClick={() => navigate('/cart')}
              className="
                relative
                hidden
                md:flex
                h-10
                w-10
                items-center
                justify-center
                rounded-full
                text-slate-700
                transition
                hover:bg-slate-100
              "
              aria-label="Panier"
            >
              <ShoppingCart size={20} />

              {cartCount > 0 && (
                <span
                  className="
                    absolute
                    -top-0.5
                    -right-0.5
                    flex
                    h-5
                    w-5
                    items-center
                    justify-center
                    rounded-full
                    bg-[#FF6B00]
                    text-[10px]
                    font-black
                    text-white
                  "
                >
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </button>

            <AccountMenu />
          </div>
        </div>

        {/* Recherche mobile (repliée par défaut, ouverte au clic sur l'icône) */}
        <AnimatePresence initial={false}>
          {mobileSearchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative md:hidden overflow-visible"
            >
              <div className="pb-2 pt-1">
                <SearchForm inputRef={mobileSearchInputRef} />
              </div>
              {showSuggestions && <SuggestionsPanel />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation secondaire desktop */}
      <div className="hidden md:block bg-white border-b border-slate-100">
        <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-8 flex items-center justify-between text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1">
            <CategoryMegaMenu />
            <span className="mx-2 h-4 w-px bg-slate-200" />
          </div>
          {/* Recherche desktop (inline) */}
          <div className="relative hidden md:flex flex-1 min-w-0">
            <SearchForm />
            {showSuggestions && <SuggestionsPanel />}
          </div>
          <div className="flex items-center gap-4 text-slate-500 font-medium">
            <h1 className='text-[#FF6B00] text-lg font-bold ml-3'>Livraison gratuite possible</h1>
          </div>
        </div>
      </div>

      {/* Tiroir catégories mobile */}
      <MobileCategoryDrawer open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </header>
  );
};

export default Header;