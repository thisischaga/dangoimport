import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FaArrowLeft, FaTrash, FaMinus, FaPlus,
  FaShoppingCart, FaTruck, FaShieldAlt, FaLock,
  FaCheckCircle, FaSpinner
} from 'react-icons/fa';
import { toast } from 'react-toastify';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [loading, setLoading] = useState(false);

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

  /* ── Empty state ──────────────────────── */
  if (!cart || cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center max-w-md mx-auto animate-fade-in-up">
            {/* Illustration */}
            <div className="relative mx-auto w-36 h-36 mb-8">
              <div className="w-36 h-36 bg-[#ffdc2b]/15 rounded-full flex items-center justify-center border-4 border-[#ffdc2b]/40">
                <FaShoppingCart size={52} className="text-gray-900" />
              </div>
              <div className="absolute -top-2 -right-2 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 font-black text-sm border-2 border-white">
                0
              </div>
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">Panier vide</h1>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Vous n'avez encore rien ajouté à votre panier. Découvrez nos produits !
            </p>
            <button
              onClick={() => navigate('/shopping')}
              className="btn-brand font-black px-8 py-4 rounded-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2.5 mx-auto w-fit"
            >
              <FaShoppingCart size={16} /> Explorer la boutique
            </button>
            <button
              onClick={() => navigate(-1)}
              className="mt-4 flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm font-semibold mx-auto"
            >
              <FaArrowLeft size={12} /> Retour
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  /* ── Cart with items ──────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <div className="flex-1">
        {/* Top bar */}
        <div className="bg-white border-b border-gray-200 py-4 px-4 sm:px-6 sticky top-[104px] z-30">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <button
              onClick={() => navigate('/shopping')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-semibold text-sm transition-colors"
            >
              <FaArrowLeft size={14} /> Continuer les achats
            </button>
            <div className="flex items-center gap-2 text-gray-700">
              <FaShoppingCart size={16} className="text-gray-900" />
              <span className="font-black text-base">Mon Panier</span>
              <span className="bg-[#fffbeb] text-[#2d3748] border border-[#ffdc2b]/40 text-xs font-black px-2 py-0.5 rounded-full">
                {cart.length}
              </span>
            </div>
            <button
              onClick={() => { clearCart && clearCart(); }}
              className="text-red-400 hover:text-red-600 text-xs font-bold transition-colors"
            >
              Vider le panier
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* ── Cart items ────────────────── */}
            <div className="lg:col-span-2 space-y-4">
              {cart.map((item, idx) => (
                <div
                  key={item._id || idx}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex gap-4 hover:shadow-md transition-all duration-200 group animate-fade-in-up"
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name || item.productName}
                        className="w-full h-full object-contain mix-blend-multiply"
                      />
                    ) : (
                      <FaShoppingCart className="text-gray-200 text-2xl" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-1">
                      {item.name || item.productName}
                    </h3>
                    {item.vendorName && (
                      <p className="text-[11px] text-gray-400 font-medium mb-2">
                        Vendu par <span className="text-blue-500">{item.vendorName}</span>
                      </p>
                    )}

                    {/* Options */}
                    {item.selectedOptions && (
                      <div className="flex gap-3 text-xs text-gray-500 mb-2">
                        {item.selectedOptions.color && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                            Couleur: <strong>{item.selectedOptions.color}</strong>
                          </span>
                        )}
                        {item.selectedOptions.size && (
                          <span className="bg-gray-100 px-2 py-0.5 rounded-full">
                            Taille: <strong>{item.selectedOptions.size}</strong>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Quantity + price row */}
                    <div className="flex items-center justify-between mt-3">
                      {/* Qty controls */}
                      <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity
                            ? updateQuantity(item._id, (item.quantity || 1) - 1)
                            : null
                          }
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-40"
                          disabled={(item.quantity || 1) <= 1}
                        >
                          <FaMinus size={10} className="text-gray-600" />
                        </button>
                        <span className="w-8 text-center font-black text-sm text-gray-900">
                          {item.quantity || 1}
                        </span>
                        <button
                          onClick={() => updateQuantity
                            ? updateQuantity(item._id, (item.quantity || 1) + 1)
                            : null
                          }
                          className="w-7 h-7 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors"
                        >
                          <FaPlus size={10} className="text-gray-600" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-black text-gray-900 text-base">
                          {fmtCFA(item.price * (item.quantity || 1))} <span className="text-xs font-bold text-gray-400">FCFA</span>
                        </p>
                        <p className="text-[11px] text-gray-400">
                          {fmtCFA(item.price)} × {item.quantity || 1}
                        </p>
                      </div>

                      {/* Remove */}
                      <button
                        onClick={() => removeFromCart && removeFromCart(item._id)}
                        className="ml-2 w-8 h-8 rounded-xl bg-red-50 text-red-400 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center opacity-0 group-hover:opacity-100"
                        title="Supprimer"
                      >
                        <FaTrash size={11} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Order summary ─────────────── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sticky top-44">
                <h2 className="text-lg font-black text-gray-900 mb-5">Résumé de la commande</h2>

                {/* Line items */}
                <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Sous-total ({cart.length} article{cart.length > 1 ? 's' : ''})</span>
                    <span className="font-bold text-gray-900">{fmtCFA(totalPrice)} FCFA</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 font-medium">Livraison</span>
                    <span className="text-gray-600 font-bold text-xs">Calculée au checkout</span>
                  </div>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-base font-black text-gray-900">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-gray-900">{fmtCFA(totalPrice)}</span>
                    <span className="text-sm font-bold text-gray-400 ml-1">FCFA</span>
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={handleCheckout}
                  disabled={loading}
                  className="w-full btn-brand font-black py-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 mb-3 disabled:opacity-50"
                >
                  {loading ? <FaSpinner className="animate-spin" /> : <FaLock size={14} />}
                  Commander — FedaPay ou livraison
                </button>
                <button
                  onClick={() => navigate('/shopping')}
                  className="w-full btn-brand-outline font-bold py-3 rounded-2xl transition-all text-sm"
                >
                  Continuer les achats
                </button>

                {/* Trust indicators */}
                <div className="mt-6 space-y-2">
                  {[
                    { text: 'Vendeurs vérifiés' },
                    { text: 'FedaPay ou paiement à la livraison' },
                    { text: 'Livraison rapide au Bénin & Togo' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                      <span className="w-1 h-1 rounded-full bg-[#ffdc2b]" />
                      {item.text}
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
