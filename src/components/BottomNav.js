import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaHome, FaSearch, FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const navItems = [
    { name: 'Accueil', path: '/', icon: FaHome },
    { name: 'Recherche', path: '/shopping', icon: FaSearch },
    { name: 'Panier', path: '/cart', icon: FaShoppingCart, badge: cartCount },
    { name: 'Profil', path: '/mes-commandes', icon: FaUser },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-[100] pb-safe">
      <div className="flex items-center justify-between px-6 py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center justify-center relative w-12 h-12 transition-colors ${
                isActive ? 'text-[#0F1111]' : 'text-gray-400 hover:text-gray-700'
              }`}
            >
              <item.icon size={22} className={isActive ? 'text-[#007185]' : ''} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-bold text-[#0F1111]' : 'font-medium'}`}>
                {item.name}
              </span>
              {item.badge > 0 && (
                <span className="absolute top-0 right-1 bg-[#CC0C39] text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center rounded-full ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;
