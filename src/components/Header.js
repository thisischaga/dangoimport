import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Store, UserCircle2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '../context/CartContext';

const navItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Boutique', to: '/shopping' },
  { label: 'Mes commandes', to: '/mes-commandes' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
];

const Header = () => {
  const navigate = useNavigate();
  const { getCartCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState(null);


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
    navigate(q ? `/shopping?q=${encodeURIComponent(q)}` : '/shopping');
  };

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const cartCount = getCartCount();


  return (
    <header className="border-b border-slate-200 bg-[#FFF7F1]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        {/* Mobile: hamburger + logo */}
        <div className="flex items-center gap-3">
          <button aria-label="Ouvrir le menu" onClick={() => setDrawerOpen(true)} className="md:hidden p-2 rounded-md text-slate-700">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>

          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-3 text-left">
            <div className="rounded-2xl bg-[#FF6B00] p-2 text-white shadow-sm">
              <Store size={18} />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#FF6B00]">Marketplace</p>
              <h1 className="text-lg font-black text-[#111827]">Dangoimport.com</h1>
            </div>
          </button>

          <div className="hidden lg:flex items-center gap-3 ml-4">
            {navItems.map((item) => (
              <button
                key={item.to}
                onClick={() => navigate(item.to)}
                className="text-sm font-semibold text-slate-700 hover:text-[#FF6B00] transition"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile compact actions */}
        <div className="flex-1 flex items-center justify-center md:justify-start">
          <form onSubmit={handleSearch} className="w-full md:hidden flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 shadow-sm max-w-xl">
            <Search size={14} className="text-slate-500" />
            <input
              className="ml-2 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Rechercher"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <form onSubmit={handleSearch} className="hidden flex-1 items-center rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm md:flex md:max-w-2xl md:mx-6">
            <Search size={16} className="text-slate-500" />
            <input
              className="ml-2 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
              placeholder="Cherchez un produit, une marque ou une catégorie"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="rounded-full bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white" type="submit">Rechercher</button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setMobileSearchOpen(true)} className="md:hidden rounded-full border border-slate-200 bg-white p-2 text-slate-600">
            <Search size={18} />
          </button>

          <button onClick={() => navigate('/cart')} className="flex items-center gap-2 rounded-full bg-[#FF6B00] px-3 py-2 text-sm font-semibold text-white">
            <ShoppingCart size={16} />
            <span className="hidden sm:inline">Panier</span>
            <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-bold text-[#111827]">{cartCount > 99 ? '99+' : cartCount}</span>
          </button>

          {user ? (
            <button onClick={handleLogout} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600">
              <UserCircle2 size={18} />
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="rounded-full border border-slate-200 bg-white p-2 text-slate-600">
              <UserCircle2 size={18} />
            </button>
          )}
        </div>
      </div>


      {/* Drawer + mobile search overlays */}
      <AnimatePresence>
        {drawerOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <motion.aside initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 20 }} className="relative w-80 max-w-full h-full bg-white shadow-xl">
              <div className="p-4 flex items-center justify-between border-b">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-[#FF6B00] p-2 text-white"><Store size={18} /></div>
                  <div>
                    <p className="text-xs font-semibold uppercase text-[#FF6B00]">Marketplace</p>
                    <h2 className="font-black">Dangoimport</h2>
                  </div>
                </div>
                <button aria-label="Fermer" onClick={() => setDrawerOpen(false)} className="p-2">
                  <X size={18} />
                </button>
              </div>

              <nav className="px-4 py-6 space-y-3">
                {navItems.map((item) => (
                  <button
                    key={item.to}
                    onClick={() => {
                      navigate(item.to);
                      setDrawerOpen(false);
                    }}
                    className="w-full text-left rounded-2xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-auto border-t px-4 py-5 space-y-3">
                {user ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setDrawerOpen(false);
                    }}
                    className="w-full rounded-full border border-slate-200 bg-[#FFF7F1] px-4 py-3 text-sm font-semibold text-[#FF6B00]"
                  >
                    Déconnexion
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate('/login');
                      setDrawerOpen(false);
                    }}
                    className="w-full rounded-full border border-slate-200 bg-[#FFF7F1] px-4 py-3 text-sm font-semibold text-[#FF6B00]"
                  >
                    Se connecter
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate('/cart');
                    setDrawerOpen(false);
                  }}
                  className="w-full rounded-full bg-[#FF6B00] px-4 py-3 text-sm font-semibold text-white"
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
                <input autoFocus className="ml-2 flex-1 border-none bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400" placeholder="Cherchez un produit, une marque ou une catégorie" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
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
