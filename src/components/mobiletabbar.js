import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  LayoutGrid,
  ShoppingCart,
  ShoppingBag,
} from 'lucide-react';
import { useCart } from '../context/CartContext';

const tabs = [
  {
    label: 'Accueil',
    to: '/',
    icon: Home,
    exact: true,
  },
  /**{
    label: 'Catégories',
    to: '/toutes-les-categories',
    icon: LayoutGrid,
  }, */
  {
    label: 'Panier',
    to: '/cart',
    icon: ShoppingCart,
    cart: true,
  },
  {
    label: 'Commandes',
    to: '/mes-commandes',
    icon: ShoppingBag,
  },
];

export default function MobileTabBar() {
  const location = useLocation();
  const { cartCount } = useCart();

  const isActive = (tab) => {
    if (tab.exact) {
      return location.pathname === '/';
    }

    return (
      location.pathname === tab.to ||
      location.pathname.startsWith(`${tab.to}/`)
    );
  };

  return (
    <nav
      className="
        fixed
        bottom-0
        left-0
        right-0
        z-[100]
        border-t
        border-slate-200
        bg-white/95
        backdrop-blur-md
        shadow-[0_-4px_20px_rgba(0,0,0,0.08)]
        md:hidden
      "
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {/* 4 colonnes maintenant */}
      <div className="mx-auto grid max-w-md grid-cols-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab);

          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={`
                relative
                flex
                min-h-[62px]
                flex-col
                items-center
                justify-center
                gap-1
                transition-all
                duration-250
                active:scale-95
                hover:scale-105
                transform
                ${
                  active
                    ? 'text-[#FF6B00]'
                    : 'text-slate-500 hover:text-[#FF6B00]'
                }
              `}
              aria-label={tab.label}
            >
              {active && (
                <span
                  className="
                    absolute
                    top-0
                    h-[3px]
                    w-8
                    rounded-b-full
                    bg-[#FF6B00]
                  "
                />
              )}

              <div className="relative">
                <Icon
                  size={21}
                  strokeWidth={active ? 2.6 : 2}
                />

                {tab.cart && cartCount > 0 && (
                  <span
                    className="
                      absolute
                      -right-3
                      -top-2
                      flex
                      h-[17px]
                      min-w-[17px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#FF6B00]
                      px-1
                      text-[9px]
                      font-black
                      text-white
                      ring-2
                      ring-white
                    "
                  >
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>

              <span
                className={`
                  text-[10px]
                  leading-none
                  ${
                    active
                      ? 'font-bold text-[#FF6B00]'
                      : 'font-medium text-slate-500'
                  }
                `}
              >
                {tab.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}