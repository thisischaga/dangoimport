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
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe bottom-nav-wrapper">
      <div className="bottom-nav-bar">
        <div className="bottom-nav-items">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => navigate(item.path)}
                className="bottom-nav-item"
                style={{ minWidth: 56 }}
              >
                <div className={`bottom-nav-icon ${isActive ? 'is-active' : ''}`}> 
                  <item.icon
                    size={18}
                    className="bottom-nav-icon-svg"
                  />
                  {item.badge > 0 && (
                    <span className="bottom-nav-badge">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                <span className={`bottom-nav-label ${isActive ? 'is-active' : ''}`}>
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
