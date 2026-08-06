import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import QRCode from 'qrcode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { initiateFedapayCheckout, buildCartFedapayPayload } from '../services/fedapayCheckout';
import { fetchOrderQrTokens } from '../services/qrService';

const MapPin = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
const CreditCard = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></svg>;
const ShoppingBag = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" /></svg>;
const ChevronRight = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>;
const Check = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 18 4 13" /></svg>;
const ArrowLeft = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>;
const Truck = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 7h11v10H3z" /><path d="M14 9h3l4 4v4h-7" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;

const paymentOptions = [
  { id: 'fedapay', label: 'FedaPay', helper: 'Paiement en ligne via FedaPay' },
];

const shippingMethods = [
  { value: 'standard', label: 'Livraison standard', helper: 'Livraison 2 à 5 jours', fee: 'Selon le poids' },
  { value: 'express', label: 'Livraison express', helper: 'Livraison rapide sous 48h', fee: '+10% du sous-total' },
  { value: 'pickup', label: 'Retrait en point relais', helper: 'À retirer chez un partenaire', fee: 'Gratuit' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart: cartItems = [], clearCart } = useCart();

  const clearSession = useCallback(() => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
  }, []);

  const redirectToLogin = useCallback(() => {
    clearSession();
    navigate('/login', { state: { from: '/checkout' } });
  }, [clearSession, navigate]);

  const [submitting, setSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod, setPaymentMethod] = useState('fedapay');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [qrTokens, setQrTokens] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [pendingFedapay, setPendingFedapay] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: 'Togo',
    city: '',
    neighborhood: '',
    fullAddress: '',
    postalCode: '',
    instructions: '',
  });

  const itemUnitPrice = (item) => {
    const price = Number(item.promoPrice) > 0 && Number(item.promoPrice) < Number(item.price || 0)
      ? Number(item.promoPrice)
      : Number(item.salePrice) > 0
      ? Number(item.salePrice)
      : Number(item.price || 0);

    return Number.isFinite(price) ? price : 0;
  };

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + itemUnitPrice(item) * Number(item.quantity || 1), 0),
    [cartItems]
  );

  const groupedProducts = useMemo(() => {
    const groups = {};
    for (const item of cartItems) {
      const vendorKey = item.vendorName || item.vendor || 'Dango Import';
      if (!groups[vendorKey]) groups[vendorKey] = [];
      groups[vendorKey].push(item);
    }
    return Object.entries(groups);
  }, [cartItems]);

  const getShippingLabel = () => shippingMethods.find((method) => method.value === shippingMethod)?.label || 'Livraison standard';

  useEffect(() => {
    // Check URL parameters if redirected back from FedaPay return_url
    const urlParams = new URLSearchParams(window.location.search);
    const urlStatus = (urlParams.get('status') || '').toLowerCase();
    const pendingRawFromStorage = localStorage.getItem('pendingFedapay');
    if (['approved', 'completed', 'paid', 'successful', 'success'].includes(urlStatus)) {
      const pending = pendingRawFromStorage ? JSON.parse(pendingRawFromStorage) : null;
      const txId = pending?.transactionId || urlParams.get('transactionId');
      navigate(`/checkout/result?status=success${txId ? `&transactionId=${encodeURIComponent(txId)}` : ''}`, { replace: true });
      return;
    }

    if (['failed', 'cancelled', 'error'].includes(urlStatus)) {
      const pending = pendingRawFromStorage ? JSON.parse(pendingRawFromStorage) : null;
      const txId = pending?.transactionId || urlParams.get('transactionId');
      navigate(`/checkout/result?status=failed${txId ? `&transactionId=${encodeURIComponent(txId)}` : ''}`, { replace: true });
      return;
    }

    // If we returned from FedaPay with a pending transaction, poll its status
    let pollId;
    if (pendingRawFromStorage) {
      try {
        const pending = JSON.parse(pendingRawFromStorage);
        if (pending && pending.transactionId) {
          const check = async () => {
            try {
              const token = localStorage.getItem('dangoToken');
              const res = await fetch(`${API_BASE_URL}/api/payments/verify/${pending.transactionId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              const data = await res.json();
              const statusValue = (data.data?.local?.status || data.data?.remote?.status || '').toLowerCase();
              const txStatus = statusValue;
              const orderId = data.data?.local?.orderId || data.data?.local?.order_id || null;
              if (res.ok && ['approved', 'completed', 'paid', 'successful', 'success'].includes(txStatus)) {
                if (orderId) {
                  let tokens = [];
                  try {
                    setQrLoading(true);
                    setQrError(null);
                    const qrResponse = await fetchOrderQrTokens(orderId, token);
                    tokens = qrResponse.qrTokens || [];
                    setQrTokens(tokens);
                    if (tokens.length) {
                      setShowQrPanel(true);
                    }
                  } catch (qrErr) {
                    console.error('Unable to fetch QR tokens after payment', qrErr);
                    setQrError(qrErr.message || 'Erreur lors de la récupération du QR.');
                  } finally {
                    setQrLoading(false);
                  }

                  clearCart();
                  localStorage.removeItem('pendingFedapay');
                  localStorage.removeItem('dangoPromoCode');
                  if (tokens.length === 0) {
                    toast.error('Paiement reçu, mais aucun code QR n’a pu être généré pour le moment.');
                  }
                  if (pollId) clearInterval(pollId);
                } else {
                  console.log('FedaPay approved, waiting for order creation/webhook to attach orderId');
                }
              }
            } catch (err) {
              console.error('Error checking Fedapay transaction status', err);
            }
          };
          check();
          pollId = setInterval(check, 3000);
          setTimeout(() => { if (pollId) clearInterval(pollId); }, 2 * 60 * 1000);
        }
      } catch (e) {
        console.error('pendingFedapay parse error', e);
      }
    }
    const token = localStorage.getItem('dangoToken');
    const pendingRaw = localStorage.getItem('pendingFedapay');
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        if (pending && pending.transactionId) {
          setPendingFedapay(pending);
        }
      } catch (e) {
        console.error('pendingFedapay parse error', e);
      }
    }

    if (!token) {
      redirectToLogin();
      return;
    }

    try {
      const userData = JSON.parse(localStorage.getItem('dangoUser') || '{}');
      const userAddresses = Array.isArray(userData.addresses) ? userData.addresses : [];
      setSavedAddresses(userAddresses);

      if (userData.userFirstname || userData.firstname) {
        const firstName = userData.userFirstname || userData.firstname || '';
        const lastName = userData.userSurname || userData.lastName || userData.surname || '';
        setForm((prev) => ({
          ...prev,
          firstName,
          lastName,
          email: userData.userEmail || userData.email || '',
          phone: userData.userPhone || userData.phone || '',
        }));
      }

      const defaultAddress = userAddresses.find((address) => address.isDefault) || userAddresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id || defaultAddress.id || 'default');
        setForm((prev) => ({
          ...prev,
          country: defaultAddress.country || prev.country,
          city: defaultAddress.city || prev.city,
          neighborhood: defaultAddress.neighborhood || prev.neighborhood,
          fullAddress: defaultAddress.fullAddress || prev.fullAddress,
          postalCode: defaultAddress.postalCode || prev.postalCode,
        }));
      }
    } catch (error) {
      console.error('Erreur chargement utilisateur:', error);
    }
  }, [navigate, redirectToLogin]);

  useEffect(() => {
    const loadPreview = async () => {
      if (!cartItems.length) return;
      const token = localStorage.getItem('dangoToken');
      if (!token) return;

      setPreviewLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cartItems.map((item) => ({
              productId: item._id || item.id,
              quantity: item.quantity || 1,
            })),
            shippingMethod,
            promoCode,
          }),
        });

        const data = await response.json();
        if (response.status === 401 || response.status === 403) {
          redirectToLogin();
          throw new Error(data.message || 'Session expirée, veuillez vous reconnecter.');
        }

        if (!response.ok) {
          throw new Error(data.message || 'Impossible de calculer le total');
        }
        setPreview(data.data || null);
        if (promoCode?.trim()) {
          localStorage.setItem('dangoPromoCode', promoCode.trim().toUpperCase());
        } else {
          localStorage.removeItem('dangoPromoCode');
        }
      } catch (error) {
        console.error('Erreur preview:', error);
        toast.error(error.message || 'Erreur de calcul du total');
        if (!promoCode?.trim()) {
          localStorage.removeItem('dangoPromoCode');
        }
      } finally {
        setPreviewLoading(false);
      }
    };

    const timer = window.setTimeout(loadPreview, 250);
    return () => window.clearTimeout(timer);
  }, [cartItems, shippingMethod, promoCode]);

  const validateStep1 = () => {
    const newErrors = {};
    if (!form.firstName.trim()) newErrors.firstName = 'Le prénom est requis';
    if (!form.lastName.trim()) newErrors.lastName = 'Le nom est requis';
    if (!form.email.trim()) newErrors.email = 'L’email est requis';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8) newErrors.phone = 'Téléphone valide requis';
    if (!form.country.trim()) newErrors.country = 'Le pays est requis';
    if (!form.city.trim()) newErrors.city = 'La ville est requise';
    if (!form.fullAddress.trim()) newErrors.fullAddress = 'L’adresse est requise';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSelectAddress = (address) => {
    setSelectedAddressId(address._id || address.id || 'default');
    setForm((prev) => ({
      ...prev,
      country: address.country || prev.country,
      city: address.city || prev.city,
      neighborhood: address.neighborhood || '',
      fullAddress: address.fullAddress || prev.fullAddress,
      postalCode: address.postalCode || '',
    }));
  };

  const handlePlaceOrder = async () => {
    if (!acceptCGV) {
      toast.error('Vous devez accepter les conditions avant de confirmer');
      return;
    }

    if (!validateStep1()) {
      return;
    }

    setSubmitting(true);
    const token = localStorage.getItem('dangoToken');
    const toastId = toast.loading('Préparation du paiement...');

    try {
      if (paymentMethod === 'fedapay') {
        const payload = buildCartFedapayPayload({
          form,
          cartItems,
          subtotal,
          shippingFee: Number(preview?.shippingCost || 0),
          total: Number(preview?.total || subtotal),
          shippingLabel: getShippingLabel(),
          description: 'Commande Dango Import',
          type: 'cart',
        });

        const data = await initiateFedapayCheckout(payload, token);
        if (!data?.url) {
          throw new Error('URL de paiement FedaPay introuvable.');
        }

        toast.update(toastId, {
          render: 'Redirection vers FedaPay...',
          type: 'info',
          isLoading: false,
          autoClose: 2000,
        });

        try {
          localStorage.setItem('pendingFedapay', JSON.stringify({ transactionId: data.transactionId, localTransactionId: data.localTransactionId }));
          localStorage.setItem('pendingFedapayCartBackup', JSON.stringify(cartItems));
        } catch (e) {
          console.warn('Impossible de sauvegarder le panier de secours', e);
        }

        window.location.href = data.url;
        return;
      }
      // Only FedaPay is supported for online payments. Other flows are deprecated.
      toast.update(toastId, {
        render: 'Seul FedaPay est supporté pour le paiement en ligne.',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
      setSubmitting(false);
      return;
    } catch (error) {
      console.error('Erreur création commande:', error);
      toast.update(toastId, {
        render: `❌ ${error.message}`,
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!qrTokens.length) {
      setQrImages({});
      return;
    }

    qrTokens.forEach((tokenData) => {
      const key = tokenData.vendorId || tokenData.vendorName || tokenData.token;
      QRCode.toDataURL(tokenData.token, { width: 280, margin: 2 })
        .then((url) => {
          setQrImages((prev) => ({ ...prev, [key]: url }));
        })
        .catch((err) => {
          console.error('QRCode generation failed:', err);
        });
    });
  }, [qrTokens]);

  if (!cartItems.length) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-[#f5f5f5] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300"><ShoppingBag /></div>
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

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-2">
          <button onClick={() => navigate('/cart')} className="flex items-center gap-1 text-[#282828] hover:text-[#F68B1E] transition text-sm font-semibold">
            <ArrowLeft /> Retour au panier
          </button>
        </div>
      </div>

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <h1 className="text-2xl sm:text-3xl font-black text-[#282828]">Paiement et livraison</h1>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
              <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center gap-3 mb-5">
                  <MapPin />
                  <h2 className="text-xl font-black text-[#282828]">1. Adresse de livraison</h2>
                </div>

                {savedAddresses.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                    {savedAddresses.map((address) => (
                      <button
                        key={address._id || address.id || `${address.city}-${address.fullAddress}`}
                        onClick={() => handleSelectAddress(address)}
                        className={`text-left p-4 border rounded-xl transition ${
                          selectedAddressId === (address._id || address.id || 'default')
                            ? 'border-[#F68B1E] bg-orange-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-black text-gray-500 uppercase">{address.label || 'Adresse'}</span>
                          {address.isDefault && <span className="text-[10px] rounded-full bg-[#F68B1E] text-white px-2 py-1">Par défaut</span>}
                        </div>
                        <p className="text-sm font-bold text-[#282828]">{address.city}</p>
                        <p className="text-sm text-gray-600">{address.fullAddress}</p>
                      </button>
                    ))}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Prénom *</label>
                    <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Nom *</label>
                    <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Téléphone *</label>
                    <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Pays *</label>
                    <select value={form.country} onChange={(e) => setForm({ ...form, country: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm bg-white">
                      <option>Togo</option>
                      <option>Bénin</option>
                    </select>
                    {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Ville *</label>
                    <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Quartier</label>
                    <input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-2">Code postal</label>
                    <input value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Adresse complète *</label>
                    <input value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                    {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-gray-700 mb-2">Instructions de livraison</label>
                    <textarea rows="3" value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} className="w-full px-3 py-2.5 border rounded-md text-sm" />
                  </div>
                  <div className="md:col-span-2 flex items-start gap-3 mt-4">
                    <label className="flex items-center gap-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={acceptCGV}
                        onChange={(e) => setAcceptCGV(e.target.checked)}
                        className="h-4 w-4 text-[#F68B1E] border-gray-300 rounded"
                      />
                      <span>J’accepte les conditions générales de vente (CGV)</span>
                    </label>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button onClick={() => navigate('/cart')} className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-900 font-black py-3 rounded-md transition">Retour au panier</button>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={submitting}
                    className={`flex-1 font-black py-3 rounded-md transition ${submitting ? 'bg-gray-400 cursor-not-allowed text-white' : 'bg-[#F68B1E] hover:bg-[#E67A0C] text-white'}`}
                  >
                    {submitting ? 'Redirection...' : 'Suivant'}
                  </button>
                </div>
              </section>
          </div>

          <aside className="lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <ShoppingBag />
                <h3 className="text-lg font-black text-[#282828]">Résumé commande</h3>
              </div>

              <div className="space-y-4 mt-4 max-h-[360px] overflow-y-auto pr-1">
                {groupedProducts.map(([vendorName, items]) => (
                  <div key={vendorName} className="border border-gray-100 rounded-xl p-3 bg-gray-50">
                    <p className="text-xs font-black text-gray-500 uppercase mb-2">{vendorName}</p>
                    <div className="space-y-3">
                      {items.map((item) => (
                        <div key={item._id || item.id} className="flex gap-3">
                          <img src={item.image || item.images?.[0]?.url} alt={item.name} className="w-14 h-14 rounded-lg object-cover bg-white" />
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-[#282828] line-clamp-2">{item.name}</p>
                            <p className="text-xs text-gray-500 mt-1">Qté: {item.quantity}</p>
                            <p className="text-sm font-black text-[#F68B1E] mt-1">{itemUnitPrice(item).toLocaleString('fr-FR')} F</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-5 border-t border-gray-100 mt-5">
                <div className="flex justify-between text-sm"><span className="text-gray-600">Sous-total</span><span className="font-bold">{subtotal.toLocaleString('fr-FR')} F</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Livraison</span><span className="font-bold">{previewLoading ? '...' : `${Number(preview?.shippingCost || 0).toLocaleString('fr-FR')} F`}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Taxes</span><span className="font-bold">{previewLoading ? '...' : `${Number(preview?.tax || 0).toLocaleString('fr-FR')} F`}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-600">Réduction</span><span className="font-bold text-green-600">-{previewLoading ? '...' : `${Number(preview?.discount || 0).toLocaleString('fr-FR')} F`}</span></div>
                <div className="flex justify-between text-lg font-black text-[#282828] border-t border-gray-100 pt-3"><span>Total</span><span className="text-[#F68B1E]">{previewLoading ? '...' : `${Number(preview?.total ?? subtotal).toLocaleString('fr-FR')} F`}</span></div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
