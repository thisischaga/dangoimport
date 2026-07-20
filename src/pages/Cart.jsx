import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaArrowLeft, FaTrash, FaMinus, FaPlus,
  FaShoppingCart, FaTruck, FaShieldAlt, FaLock,
  FaCheckCircle, FaSpinner, FaTag
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [loading] = useState(false);

  const totalPrice = getCartTotal ? getCartTotal() : cart.reduce((sum, item) => sum + (item.price * (item.quantity || 1)), 0);
  const fmtCFA = (n) => Number(n).toLocaleString('fr-FR');

  const handleCheckout = () => {
    const token = localStorage.getItem('dangoToken');
    if (!token) {
      toast.warning('Veuillez vous connecter pour commander.');
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  /* ── Empty state */
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115] flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-sm mx-auto">
            <div className="w-32 h-32 bg-[#ffdc2b]/15 border-4 border-[#ffdc2b]/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShoppingCart size={44} className="text-gray-400" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-3">Panier vide</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8 text-[14px] leading-relaxed">
              Vous n'avez encore rien ajouté à votre panier. Découvrez nos produits !
            </p>
            <button
              onClick={() => navigate('/shopping')}
              className="bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black px-8 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg flex items-center gap-2 mx-auto w-fit"
            >
              <FaShoppingCart size={15} /> Explorer la boutique
            </button>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 flex items-center gap-1.5 text-gray-400 hover:text-gray-600 text-sm font-medium mx-auto"
            >
              <FaArrowLeft size={11} /> Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115] flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Breadcrumb bar */}
        <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-gray-800 py-3 px-4 sm:px-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/shopping')}
              className="flex items-center gap-2 text-[13px] text-gray-500 hover:text-[#b8a000] font-semibold transition-colors"
            >
              <FaArrowLeft size={12} /> Continuer les achats
            </button>
            <div className="flex items-center gap-2 text-gray-900 dark:text-white">
              <FaShoppingCart size={16} className="text-[#ffdc2b]" />
              <span className="font-black text-[15px]">Mon Panier</span>
              <span className="bg-[#ffdc2b] text-[#111] text-[11px] font-black px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => { clearCart && clearCart(); }}
              className="text-red-400 hover:text-red-600 text-[12px] font-bold transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart items ── */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex gap-4 hover:shadow-md transition-all duration-200 group"
                >
                  {/* Image */}
                  <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 dark:border-gray-700 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || item.productName}
                        className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    ) : (
                      <FaShoppingCart className="text-gray-300 text-2xl" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[14px] leading-snug line-clamp-2 mb-1">
                      {item.name || item.productName}
                    </h3>
                    {item.vendorName && (
                      <p className="text-[11px] text-gray-400 mb-2">
                        Vendu par <span className="text-[#b8a000] font-semibold">{item.vendorName}</span>
                      </p>
                    )}

                    {/* Options */}
                    {item.selectedOptions && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(item.selectedOptions).map(([key, value]) => value ? (
                          <span key={key} className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[11px] px-2 py-0.5 rounded-full">
                            {key}: <strong>{value}</strong>
                          </span>
                        ) : null)}
                      </div>
                    )}

                    {/* Qty + Price + Remove */}
                    <div className="flex items-center justify-between mt-2">
                      {/* Qty */}
                      <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity && updateQuantity(item._id, (item.quantity || 1) - 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <FaMinus size={10} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        <span className="w-8 text-center font-black text-[14px] text-gray-900 dark:text-white">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity && updateQuantity(item._id, (item.quantity || 1) + 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <FaPlus size={10} className="text-gray-600 dark:text-gray-300" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right flex-1 mx-4">
                        <p className="font-black text-gray-900 dark:text-white text-[16px]">
                          {fmtCFA(item.price * (item.quantity || 1))} <span className="text-[11px] font-semibold text-gray-400">FCFA</span>
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {fmtCFA(item.price)} × {item.quantity || 1}
                        </p>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => removeFromCart && removeFromCart(item._id)}
                        className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center"
                        title="Supprimer"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order Summary ── */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 sticky top-48">

                <h2 className="text-[17px] font-black text-gray-900 dark:text-white mb-5">Résumé de la commande</h2>

                <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 dark:border-gray-800">
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
                    <span className="font-bold text-gray-900 dark:text-white">{fmtCFA(totalPrice)} FCFA</span>
                  </div>
                  <div className="flex justify-between text-[13px]">
                    <span className="text-gray-500">Livraison</span>
                    <span className="font-semibold text-green-500 text-[12px]">Calculée au checkout</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-6 bg-[#fffbeb] dark:bg-[#2d2a00] p-3 rounded-xl">
                  <span className="font-black text-gray-900 dark:text-white text-[15px]">Total</span>
                  <div className="text-right">
                    <span className="text-[22px] font-black text-gray-900 dark:text-white">{fmtCFA(totalPrice)}</span>
                    <span className="text-[13px] font-bold text-gray-500 ml-1">FCFA</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black py-4 rounded-full transition-all hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2 mb-3 disabled:opacity-50 text-[15px]"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaLock size={14} />}
                  Passer la commande
                </button>
                <button
                  onClick={() => navigate('/shopping')}
                  className="w-full border-2 border-gray-200 dark:border-gray-700 hover:border-[#ffdc2b] text-gray-700 dark:text-gray-300 font-bold py-3 rounded-full transition-all text-[14px]"
                >
                  Continuer les achats
                </button>

                {/* Trust badges */}
                <div className="mt-6 space-y-2.5 pt-4 border-t border-gray-100 dark:border-gray-800">
                  {[
                    { icon: FaShieldAlt, text: 'Vendeurs vérifiés', color: 'text-blue-500' },
                    { icon: FaLock, text: 'Paiement 100% sécurisé', color: 'text-green-500' },
                    { icon: FaTruck, text: 'Livraison rapide — Bénin & Togo', color: 'text-orange-500' },
                    { icon: FaCheckCircle, text: 'Satisfait ou remboursé', color: 'text-purple-500' },
                  ].map(({ icon: Icon, text, color }) => (
                    <div key={text} className="flex items-center gap-2.5 text-[12px] text-gray-500 dark:text-gray-400">
                      <Icon size={12} className={color} />
                      {text}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
