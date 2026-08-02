import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';

// ─── Icons ──────────────────────────────────────────────────────────────────
const MapPin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const CreditCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>;
const ShoppingBag = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 18 4 13" /></svg>;
const ArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;

export default function Checkout() {
  const navigate = useNavigate();
  const { cart: cartItems = [], clearCart, getCartTotal } = useCart();
  
  // ─── État ───────────────────────────────────────────────────────────────
  const [step, setStep] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Formulaire
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Togo',
    city: '',
    address: '',
  });

  // Paiement
  const [paymentMethod, setPaymentMethod] = useState('cash');
  
  // Validation
  const [errors, setErrors] = useState({});
  
  // CGV Modal
  const [acceptCGV, setAcceptCGV] = useState(false);

  // ─── Chargement données utilisateur ──────────────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('dangoToken');
    if (!token) {
      navigate('/login', { state: { from: '/checkout' } });
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('dangoUser') || '{}');
      if (userData.userFirstname || userData.firstname) {
        setForm(prev => ({
          ...prev,
          firstName: userData.userFirstname || userData.firstname || '',
          lastName: userData.surname || userData.lastName || '',
          email: userData.userEmail || userData.email || '',
          phone: userData.userPhone || userData.phone || '',
        }));
      }
    } catch (e) {
      console.error('Erreur chargement utilisateur:', e);
    }
  }, [navigate]);

  // ─── Validation ─────────────────────────────────────────────────────────
  const validateStep1 = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Prénom requis';
    if (!form.email.trim()) newErrors.email = 'Email requis';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Téléphone valide requis';
    if (!form.city.trim()) newErrors.city = 'Ville requise';
    if (!form.address.trim()) newErrors.address = 'Adresse requise';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    return paymentMethod === 'cash' || paymentMethod === 'online';
  };

  // ─── Soumettre commande ──────────────────────────────────────────────────
  const handleSubmitOrder = async () => {
    if (!acceptCGV) {
      toast.error('Acceptez les conditions avant de continuer');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading('Traitement de votre commande...');
    const token = localStorage.getItem('dangoToken');

    try {
      const totalAmount = getCartTotal?.();
      
      if (paymentMethod === 'cash') {
        // Créer commande directe (paiement à la livraison)
        const orderPayload = {
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            selectedOptions: {},
          })),
          shippingAddress: {
            firstName: form.firstName,
            lastName: form.lastName,
            email: form.email,
            phone: form.phone,
            country: form.country,
            city: form.city,
            address: form.address,
          },
          shippingMethod: 'standard',
          paymentMethod: 'cash',
        };

        const res = await fetch(`${API_BASE_URL}/api/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(orderPayload),
        });

        if (!res.ok) throw new Error('Impossible de créer la commande');
        
        clearCart?.();
        toast.update(toastId, { 
          render: '✅ Commande confirmée ! Vous serez contacté sous peu.', 
          type: 'success', 
          isLoading: false, 
          autoClose: 3000 
        });
        setTimeout(() => navigate('/mes-commandes'), 3000);
      } else {
        // Paiement en ligne via FedaPay
        const paymentPayload = {
          amount: Math.round(totalAmount),
          currency: 'XOF',
          description: `Commande DangoImport - ${form.country}`,
          callback_url: `${window.location.origin}/checkout`,
          customer: {
            firstname: form.firstName,
            lastname: form.lastName,
            email: form.email,
            phone: form.phone,
          },
          deliveryCountry: form.country,
        };

        const res = await fetch(`${API_BASE_URL}/api/payment/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify(paymentPayload),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.message || 'Erreur paiement FedaPay');
        }

        const data = await res.json();
        if (data.payment_url) {
          toast.update(toastId, { 
            render: 'Redirection vers FedaPay...', 
            type: 'info', 
            isLoading: false, 
            autoClose: 1500 
          });
          setTimeout(() => {
            window.location.href = data.payment_url;
          }, 1500);
        } else {
          throw new Error('URL paiement indisponible');
        }
      }
    } catch (err) {
      console.error(err);
      toast.update(toastId, { 
        render: `❌ ${err.message}`, 
        type: 'error', 
        isLoading: false, 
        autoClose: 3000 
      });
      setSubmitting(false);
    }
  };

  // ─── Render panier ───────────────────────────────────────────────────────
  const cartTotal = getCartTotal?.() || 0;

  if (!cartItems.length) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-[#f5f5f5] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <ShoppingBag />
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Panier vide</h2>
            <p className="text-gray-500 text-sm mb-6">Ajoutez des produits avant de finaliser</p>
            <button onClick={() => navigate('/shopping')} className="bg-[#F68B1E] hover:bg-[#E67A0C] text-white font-black px-8 py-3 rounded-lg transition">
              Continuer le shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2">
          <button 
            onClick={() => navigate('/cart')} 
            className="flex items-center gap-1 text-[#282828] hover:text-[#F68B1E] transition text-sm font-semibold"
          >
            <ArrowLeft /> Retour au panier
          </button>
        </div>
      </div>

      {/* Titre */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#282828]">Finaliser la commande</h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex justify-center">
          <div className="flex items-center justify-center gap-0 w-full max-w-md">
            {[
              { num: 1, label: 'Informations' },
              { num: 2, label: 'Paiement' },
              { num: 3, label: 'Confirmation' },
            ].map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition-all ${
                    step > s.num ? 'bg-[#F68B1E] text-white' :
                    step === s.num ? 'bg-[#F68B1E] text-white ring-4 ring-[#F68B1E]/20' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {step > s.num ? <Check /> : s.num}
                  </div>
                  <span className={`text-xs font-bold hidden sm:block transition ${step >= s.num ? 'text-[#282828]' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-5 transition max-w-[60px] ${step > s.num ? 'bg-[#F68B1E]' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Contenu Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne Gauche - Formulaire */}
          <div className="lg:col-span-2">
            
            {/* ────── ÉTAPE 1: INFORMATIONS DE LIVRAISON ──────── */}
            {step === 1 && (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin />
                  <h2 className="text-xl font-black text-[#282828]">Informations de livraison</h2>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Nom complet *</label>
                    <input
                      type="text"
                      placeholder="Jean Dupont"
                      value={`${form.firstName} ${form.lastName}`.trim()}
                      onChange={(e) => {
                        const [first, last] = e.target.value.trim().split(' ');
                        setForm(prev => ({ ...prev, firstName: first || '', lastName: last || '' }));
                        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: null }));
                      }}
                      className={`w-full px-3 py-2.5 border rounded-md outline-none transition text-sm font-medium ${
                        errors.firstName ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#F68B1E]'
                      }`}
                    />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Téléphone *</label>
                    <input
                      type="tel"
                      placeholder="+228 97 XXXXXX"
                      value={form.phone}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, phone: e.target.value }));
                        if (errors.phone) setErrors(prev => ({ ...prev, phone: null }));
                      }}
                      className={`w-full px-3 py-2.5 border rounded-md outline-none transition text-sm font-medium ${
                        errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#F68B1E]'
                      }`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      placeholder="jean@example.com"
                      value={form.email}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, email: e.target.value }));
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                      }}
                      className={`w-full px-3 py-2.5 border rounded-md outline-none transition text-sm font-medium ${
                        errors.email ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#F68B1E]'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Pays *</label>
                      <select
                        value={form.country}
                        onChange={(e) => setForm(prev => ({ ...prev, country: e.target.value }))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-md outline-none transition text-sm font-medium focus:border-[#F68B1E] bg-white"
                      >
                        <option>Togo</option>
                        <option>Bénin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2">Ville *</label>
                      <input
                        type="text"
                        placeholder="Lomé"
                        value={form.city}
                        onChange={(e) => {
                          setForm(prev => ({ ...prev, city: e.target.value }));
                          if (errors.city) setErrors(prev => ({ ...prev, city: null }));
                        }}
                        className={`w-full px-3 py-2.5 border rounded-md outline-none transition text-sm font-medium ${
                          errors.city ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#F68B1E]'
                        }`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Adresse *</label>
                    <input
                      type="text"
                      placeholder="Rue / Quartier"
                      value={form.address}
                      onChange={(e) => {
                        setForm(prev => ({ ...prev, address: e.target.value }));
                        if (errors.address) setErrors(prev => ({ ...prev, address: null }));
                      }}
                      className={`w-full px-3 py-2.5 border rounded-md outline-none transition text-sm font-medium ${
                        errors.address ? 'border-red-500 bg-red-50' : 'border-gray-200 focus:border-[#F68B1E]'
                      }`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <button
                    onClick={() => {
                      if (validateStep1()) setStep(2);
                    }}
                    className="w-full bg-[#F68B1E] hover:bg-[#E67A0C] text-white font-black py-3 rounded-md transition"
                  >
                    Continuer
                  </button>
                </div>
              </div>
            )}

            {/* ────── ÉTAPE 2: MÉTHODE DE PAIEMENT ──────── */}
            {step === 2 && (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard />
                  <h2 className="text-xl font-black text-[#282828]">Méthode de paiement</h2>
                </div>
                <p className="text-gray-600 text-sm mb-6">Comment souhaitez-vous payer ?</p>

                <div className="space-y-4">
                  
                  {/* Option 1: Paiement à la livraison */}
                  <button
                    onClick={() => setPaymentMethod('cash')}
                    className={`w-full p-4 rounded-md border-2 transition text-left ${
                      paymentMethod === 'cash' ? 'border-[#F68B1E] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'cash' ? 'border-[#F68B1E]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'cash' && <div className="w-2.5 h-2.5 rounded-full bg-[#F68B1E]" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#282828]">Paiement à la livraison</p>
                        <p className="text-xs text-gray-500 mt-0.5">Payez en espèces au livreur</p>
                      </div>
                    </div>
                  </button>

                  {/* Option 2: Paiement en ligne */}
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className={`w-full p-4 rounded-md border-2 transition text-left ${
                      paymentMethod === 'online' ? 'border-[#F68B1E] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${
                        paymentMethod === 'online' ? 'border-[#F68B1E]' : 'border-gray-300'
                      }`}>
                        {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-[#F68B1E]" />}
                      </div>
                      <div>
                        <p className="font-bold text-[#282828]">Paiement en ligne</p>
                        <p className="text-xs text-gray-500 mt-0.5">Carte, TMoney, Flooz, MTN, Moov via FedaPay</p>
                      </div>
                    </div>
                  </button>

                </div>

                <div className="flex gap-3 mt-8">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-900 font-black py-3 rounded-md transition"
                  >
                    ← Retour
                  </button>
                  <button
                    onClick={() => {
                      if (validateStep2()) setStep(3);
                    }}
                    className="flex-1 bg-[#F68B1E] hover:bg-[#E67A0C] text-white font-black py-3 rounded-md transition flex items-center justify-center gap-2"
                  >
                    Continuer <ChevronRight />
                  </button>
                </div>
              </div>
            )}

            {/* ────── ÉTAPE 3: PLACEHOLDER (Modal appear dans overlay) ──────── */}
            {step === 3 && (
              <div className="bg-white rounded-md shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-black text-[#282828] mb-6">Prêt à confirmer ?</h2>
                <p className="text-gray-600 mb-6">Cliquez sur le bouton ci-dessous pour afficher le récapitulatif et valider votre commande.</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full bg-[#F68B1E] hover:bg-[#E67A0C] text-white font-black py-4 rounded-md transition"
                >
                  Afficher le récapitulatif
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="w-full mt-3 border border-gray-300 hover:bg-gray-50 text-gray-900 font-black py-3 rounded-md transition"
                >
                  ← Retour
                </button>
              </div>
            )}
          </div>

          {/* Colonne Droite - Commande (Sticky) */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-md shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                <ShoppingBag />
                <h3 className="text-lg font-black text-[#282828]">Votre commande</h3>
              </div>

              {/* Liste produits */}
              <div className="space-y-4 mb-6 max-h-72 overflow-y-auto">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-100">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 rounded-md object-cover bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#282828] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qté: {item.quantity}</p>
                      <p className="text-sm font-bold text-[#282828] mt-1">{item.price.toLocaleString('fr-FR')} F</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totaux */}
              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Sous-total</span>
                  <span className="font-bold text-[#282828]">{cartTotal.toLocaleString('fr-FR')} F</span>
                </div>
                <div className="flex justify-between text-lg font-black text-[#282828] pt-3 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#F68B1E]">{cartTotal.toLocaleString('fr-FR')} F</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ────── MODAL DE CONFIRMATION ──────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-md shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-black text-[#282828]">Confirmer votre commande</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition text-2xl font-bold leading-none"
              >
                ✕
              </button>
            </div>

            {/* Contenu Modal */}
            <div className="p-6 space-y-6">
              
              {/* Récap Adresse */}
              <div className="pb-6 border-b border-gray-200">
                <p className="text-xs font-black text-gray-500 mb-3">ADRESSE DE LIVRAISON</p>
                <p className="font-bold text-[#282828]">{form.firstName} {form.lastName}</p>
                <p className="text-sm text-gray-600 mt-2">{form.address}</p>
                <p className="text-sm text-gray-600">{form.city}, {form.country}</p>
              </div>

              {/* Récap Paiement */}
              <div className="pb-6 border-b border-gray-200">
                <p className="text-xs font-black text-gray-500 mb-3">MÉTHODE DE PAIEMENT</p>
                <p className="font-bold text-[#282828]">
                  {paymentMethod === 'cash' ? 'Paiement à la livraison' : 'Paiement en ligne (FedaPay)'}
                </p>
              </div>

              {/* Total */}
              <div className="pb-6 border-b border-gray-200">
                <p className="text-xs font-black text-gray-500 mb-3">MONTANT TOTAL</p>
                <p className="text-2xl font-black text-[#F68B1E]">{cartTotal.toLocaleString('fr-FR')} FCFA</p>
              </div>

              {/* Checkbox CGV */}
              <label className="flex items-start gap-3 p-4 bg-gray-50 rounded-md border border-gray-200">
                <input
                  type="checkbox"
                  checked={acceptCGV}
                  onChange={(e) => setAcceptCGV(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-gray-300 text-[#F68B1E] outline-none cursor-pointer"
                />
                <span className="text-xs text-gray-600 leading-relaxed">
                  Je confirme les informations et j'accepte les CGV et la politique de confidentialité
                </span>
              </label>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-900 font-black py-3 rounded-md transition"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmitOrder}
                  disabled={submitting || !acceptCGV}
                  className={`flex-1 font-black py-3 rounded-md transition ${
                    submitting || !acceptCGV
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-[#F68B1E] hover:bg-[#E67A0C] text-white'
                  }`}
                >
                  {submitting ? 'Traitement...' : 'Confirmer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
