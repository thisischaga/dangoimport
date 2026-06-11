import React, { useState } from 'react';
import API_BASE_URL from '../apiConfig';
import { resolveImageUrl } from '../utils/imageUrl';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BuyProduct from '../components/BuyProduct';
import { FaTrash, FaPlus, FaMinus, FaShoppingBag, FaArrowLeft, FaTimes } from 'react-icons/fa';

const CartPage = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getCartCount } = useCart();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);
  const [fedapayLoading, setFedapayLoading] = useState(false);

  const getImgUrl = (img) => resolveImageUrl(img) || '';

  const handleCheckout = () => {
    const user = localStorage.getItem('dangoUser');
    if (!user) {
      toast.warning("Veuillez vous connecter pour passer votre commande.");
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    setShowCheckout(true);
  };

  const handleFedapayPayment = async () => {
    const user = localStorage.getItem('dangoUser');
    if (!user) {
      toast.warning('Veuillez vous connecter pour payer en ligne.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }

    const parsedUser = JSON.parse(user || '{}');
    const itemsList = cart.map(i => `${i.name} x${i.quantity}`).join(', ');

    setFedapayLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/fedapay/checkout`, {
        userName: parsedUser.firstname ? `${parsedUser.firstname} ${parsedUser.surname || ''}` : parsedUser.userName || 'Client Dango',
        userNumber: parsedUser.phone || parsedUser.userNumber || '00000000', // A demander si manquant
        productQuantity: getCartCount(),
        picture: cart[0]?.image || 'logo.png', // Image par défaut pour le panier
        userEmail: parsedUser.email || parsedUser.userEmail || 'client@dangoimport.com',
        lat: 0,
        lng: 0,
        deliveryFee: 0,
        address: 'A compléter après paiement',
        city: 'A compléter',
        totalPrice: getCartTotal(),
        productPrice: getCartTotal(),
        description: `Panier Dango Import - ${itemsList}`,
        type: 'cart',
        vendorName: cart.map(item => item.vendorName || 'Vendeur Indépendant').join(', ')
      });

      if (response.data && response.data.url) {
        // Optionnel : ne pas vider le panier tout de suite, ou le vider
        // On pourrait vider le panier une fois le paiement confirmé
        window.location.href = response.data.url; // Redirection Hosted Checkout
      } else {
        toast.error('Erreur lors de la création du paiement FedaPay.');
        setFedapayLoading(false);
      }
    } catch (error) {
      console.error('Erreur FedaPay Checkout :', error);
      toast.error('Impossible de démarrer le paiement FedaPay.');
      setFedapayLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen">
        <Header />
        <main className="max-w-7xl mx-auto px-6 py-20 flex flex-col items-center justify-center text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center text-gray-400 text-4xl mb-6">
            <FaShoppingBag />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Votre panier est vide</h1>
          <p className="text-gray-600 mb-8 max-w-md">Il semble que vous n'ayez pas encore ajouté de produits. Parcourez notre boutique pour trouver des articles incroyables !</p>
          <button
            onClick={() => navigate('/shopping')}
            className="btn-brand px-8 py-3 rounded-full font-bold"
          >
            Retourner à la boutique
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-6 sm:mb-10">
          <button onClick={() => navigate('/shopping')} className="text-gray-500 hover:text-[#e6c600] transition-colors">
            <FaArrowLeft size={18} />
          </button>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 tracking-tight">Mon Panier <span className="text-gray-400 font-medium ml-2 text-base sm:text-xl">({getCartCount()} articles)</span></h1>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-1 space-y-4">
            {cart.map((item) => (
              <div key={item._id} className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                  <img src={getImgUrl(item.image)} alt={item.name} className="max-h-full max-w-full object-contain mix-blend-multiply" />
                </div>

                <div className="flex-1 min-w-0 w-full">
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <Link to={`/shopping`} className="text-base sm:text-lg font-bold text-gray-900 hover:text-[#e6c600] transition-colors line-clamp-2">{item.name}</Link>
                    <p className="text-base font-black text-gray-900 whitespace-nowrap">{item.price * item.quantity} F</p>
                  </div>
                  <p className="text-[10px] sm:text-xs text-gray-500 mb-3 uppercase tracking-wider">Vendu par <span className="font-bold text-gray-700">{item.vendorName}</span></p>

                  <div className="flex items-center justify-between sm:justify-start gap-4 sm:gap-6">
                    <div className="flex items-center gap-1.5 sm:gap-3 bg-gray-50 rounded-lg p-0.5 sm:p-1 border border-gray-100">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-[#fffbeb] transition-colors"
                      >
                        <FaMinus size={7} />
                      </button>
                      <span className="w-4 sm:w-6 text-center font-bold text-[10px] sm:text-sm">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        className="w-6 h-6 sm:w-8 sm:h-8 rounded-md bg-white shadow-sm flex items-center justify-center text-gray-600 hover:bg-[#fffbeb] transition-colors"
                      >
                        <FaPlus size={7} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item._id)}
                      className="text-gray-300 hover:text-red-500 transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider"
                    >
                      <FaTrash size={9} /> <span className="hidden xs:inline">Retirer</span>
                    </button>
                  </div>
                </div>

                <div className="text-right flex-shrink-0 hidden sm:block">
                  <p className="text-xl font-black text-gray-900">{item.price * item.quantity} FCFA</p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">{item.price} FCFA / unité</p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="w-full lg:w-96">
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-md border border-gray-100 sticky top-32">
              <h2 className="text-lg sm:text-xl font-black text-gray-900 mb-6 uppercase tracking-wider border-b border-gray-100 pb-4">Résumé</h2>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-gray-600 font-medium">
                  <span>Sous-total</span>
                  <span>{getCartTotal()} FCFA</span>
                </div>
                <div className="pt-4 border-t border-gray-100 flex justify-between items-end">
                  <span className="font-bold text-gray-900 uppercase text-[10px] tracking-widest">Total à payer</span>
                  <span className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{getCartTotal()} FCFA</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="w-full btn-brand py-5 sm:py-6 rounded-2xl sm:rounded-3xl text-lg sm:text-xl font-black uppercase tracking-widest transition-all hover:-translate-y-1 active:translate-y-0"
              >
                Passer la commande
              </button>



              <p className="text-[10px] text-center text-gray-400 mt-2 font-medium uppercase tracking-widest leading-relaxed">
                Paiement sécurisé via FedaPay ou à la livraison.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Drawer de commande latéral (plus moderne) */}
      <div className={`fixed inset-0 z-[100] transition-all duration-500 ${showCheckout ? 'visible' : 'invisible'}`}>
        {/* Backdrop overlay */}
        <div
          className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-500 ${showCheckout ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setShowCheckout(false)}
        />

        {/* Drawer Content */}
        <div className={`absolute top-0 right-0 h-full w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-500 ease-out ${showCheckout ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="h-full flex flex-col">
            {/* Header Drawer */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-xl font-black text-gray-900 uppercase tracking-widest">Finaliser la commande</h3>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <FaTimes size={20} />
              </button>
            </div>

            {/* Content Drawer */}
            <div className="flex-1 overflow-y-auto p-0">
              <BuyProduct
                image={cart[0].image}
                name={`Commande de ${getCartCount()} articles`}
                price={getCartTotal()}
                vendorName={cart.map(item => item.vendorName || 'Vendeur Indépendant').join(', ')}
                isVisibled={setShowCheckout}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
