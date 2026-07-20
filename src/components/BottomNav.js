import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaStore, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { name: 'Accueil', path: '/', icon: FaHome },
    { name: 'Boutique', path: '/shopping', icon: FaStore },
    { name: 'Panier', path: '/cart', icon: FaShoppingCart, badge: cartCount },
    { name: 'Profil', path: '/mes-commandes', icon: FaUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe">
      {/* Background with blur */}
      <div className="relative bg-white/90 dark:bg-gray-900/95 backdrop-blur-xl border-t border-gray-200/80 dark:border-gray-700/60 shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
        <div className="flex items-center justify-around px-2 py-1.5">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center relative py-1 px-3 rounded-2xl transition-all duration-200"
                style={{ minWidth: 56 }}
              >
                {/* Active pill background */}
                {isActive && (
                  <span className="absolute inset-0 bg-[#ffdc2b]/15 rounded-2xl" />
                )}

                {/* Icon wrapper */}
                <div className={`relative flex items-center justify-center w-10 h-7 rounded-xl transition-all duration-200 ${
                  isActive ? 'bg-[#ffdc2b]' : ''
                }`}>
                  <item.icon
                    size={18}
                    className={`transition-all duration-200 ${
                      isActive ? 'text-[#1a202c]' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black min-w-[16px] h-[16px] flex items-center justify-center rounded-full px-0.5 ring-2 ring-white dark:ring-gray-900">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                <span className={`text-[10px] mt-0.5 font-bold transition-colors duration-200 ${
                  isActive ? 'text-[#c9a800] dark:text-[#ffdc2b]' : 'text-gray-400 dark:text-gray-500'
                }`}>
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default BottomNav;
