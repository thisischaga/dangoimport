import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, PlusCircle, ShoppingBag, User, Store, LogOut } from 'lucide-react';
import { getVendorUser } from '../../utils/vendorAuth';

const NAV = [
  { to: '/vendeur/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/vendeur/produits', label: 'Mes Produits', icon: Package },
  { to: '/vendeur/produits/nouveau', label: 'Ajouter un produit', icon: PlusCircle },
  { to: '/vendeur/dashboard#commandes', label: 'Commandes', icon: ShoppingBag },
  { to: '/vendeur/dashboard#profil', label: 'Profil', icon: User },
];

const VendorLayout = ({ children, title, subtitle }) => {
  const navigate = useNavigate();
  const user = getVendorUser();
  const displayName = user.vendorName || `${user.userFirstname || ''} ${user.userSurname || ''}`.trim() || 'Vendeur';

  const handleLogout = () => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
    window.dispatchEvent(new Event('authChange'));
    navigate('/vendeur/login');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A]">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
          <button type="button" onClick={() => navigate('/')} className="flex items-center gap-2 text-left">
            <div className="rounded-xl bg-[#F68B1E] p-2 text-white">
              <Store size={18} />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#F68B1E]">Espace Vendeur</p>
              <p className="text-sm font-black text-[#0F172A]">Dangoimport</p>
            </div>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-slate-600 sm:inline">{displayName}</span>
            <button
              type="button"
              onClick={() => navigate('/shopping')}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:border-[#F68B1E] hover:text-[#F68B1E]"
            >
              Voir la boutique
            </button>
            <button type="button" onClick={handleLogout} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 lg:grid-cols-[240px_1fr] lg:px-8 lg:py-8">
        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <nav className="space-y-1">
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    isActive
                      ? 'bg-[#FFF3EA] text-[#F68B1E]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0F172A]'
                  }`
                }
              >
                <Icon size={16} />
                {label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <main className="min-w-0">
          {(title || subtitle) && (
            <div className="mb-6">
              {title && <h1 className="text-2xl font-black text-[#0F172A] sm:text-3xl">{title}</h1>}
              {subtitle && <p className="mt-1 text-slate-600">{subtitle}</p>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
