import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from '../utils/toast';
import QRCode from 'qrcode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { initiateFedapayCheckout, buildCartFedapayPayload } from '../services/fedapayCheckout';
import { fetchOrderQrTokens } from '../services/qrService';

/* ─── Données des formules ─── */
const SHIPPING_PLANS = [
  {
    value: 'standard',
    label: 'Standard',
    tagline: 'Économique',
    price: 0,
    priceLabel: 'Gratuit',
    delay: '3 à 7 jours ouvrés',
    color: 'emerald',
    features: [
      'Commandes regroupées par zone',
      'Tournées planifiées et optimisées',
      'Délai communiqué avant l\'expédition',
      'Pas de priorité de traitement',
    ],
  },
  {
    value: 'express',
    label: 'Express',
    tagline: 'Prioritaire',
    price: 2250,
    priceLabel: '2 250 FCFA',
    delay: 'Sous 24 heures',
    color: 'amber',
    features: [
      'Livreur dédié pour votre commande',
      'Traitement immédiat à la validation',
      'Prioritaire dans la file d\'attente',
      'Suivi disponible à la demande',
    ],
  },
  {
    value: 'premium',
    label: 'Premium',
    tagline: 'Ultra-rapide',
    price: 5000,
    priceLabel: '5 000 FCFA',
    delay: 'Immédiate ',
    color: 'purple',
    features: [
      'Livraison dans la journée garantie',
      'Livreur exclusivement dédié',
      'Livraison de nuit possible',
      'Assistance téléphonique incluse',
    ],
  },
];

const STEPS = [
  { id: 1, label: 'Adresse', shortLabel: 'Adresse' },
  { id: 2, label: 'Livraison', shortLabel: 'Livraison' },
  { id: 3, label: 'Paiement', shortLabel: 'Paiement' },
];

/* ─── Stepper Progress Bar ─── */
function StepperBar({ currentStep }) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between relative">
        {/* Background line */}
        <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 mx-8" />
        {/* Progress line */}
        <div
          className="absolute top-5 left-0 h-[2px] bg-[#F68B1E] mx-8 transition-all duration-500 ease-out"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`, maxWidth: 'calc(100% - 4rem)' }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center relative z-10">
              <div
                className={[
                  'w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all duration-300 border-2',
                  isCompleted
                    ? 'bg-[#F68B1E] border-[#F68B1E] text-white shadow-lg shadow-orange-200'
                    : isActive
                    ? 'bg-white border-[#F68B1E] text-[#F68B1E] shadow-lg shadow-orange-100'
                    : 'bg-white border-gray-200 text-gray-400',
                ].join(' ')}
              >
                {step.id}
              </div>
              <span
                className={[
                  'mt-2 text-xs font-bold transition-colors duration-300',
                  isActive ? 'text-[#F68B1E]' : isCompleted ? 'text-[#282828]' : 'text-gray-400',
                ].join(' ')}
              >
                {step.shortLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Mini Order Summary (floating panel) ─── */
function MiniOrderSummary({ cartItems, itemUnitPrice, subtotal, shippingFee, shippingMethod, preview, previewLoading, isOpen, onToggle }) {
  const plan = SHIPPING_PLANS.find((p) => p.value === shippingMethod);
  const discount = Number(preview?.discount || 0);
  const total = Number(preview?.subtotal ?? subtotal) + shippingFee - discount;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300">
      {/* Header — toujours visible */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="text-left">
            <p className="text-xs text-gray-500 font-medium">Résumé de commande</p>
            <p className="text-sm font-black text-[#282828]">
              {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-base font-black text-[#F68B1E]">
            {previewLoading ? '...' : `${total.toLocaleString('fr-FR')} FCFA`}
          </span>
          <span className="text-xs font-bold text-gray-400">
            {isOpen ? 'Masquer' : 'Afficher'}
          </span>
        </div>
      </button>

      {/* Expanded content */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 pb-5 border-t border-gray-100">
          {/* Product list */}
          <div className="space-y-3 mt-4 max-h-[200px] overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item._id || item.id} className="flex gap-3 items-center">
                <img
                  src={item.image || item.images?.[0]?.url}
                  alt={item.name}
                  className="w-11 h-11 rounded-lg object-cover bg-gray-100 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-[#282828] line-clamp-1">{item.name}</p>
                  <p className="text-[11px] text-gray-400">Qté : {item.quantity}</p>
                </div>
                <p className="text-xs font-black text-[#282828] shrink-0">
                  {itemUnitPrice(item).toLocaleString('fr-FR')} F
                </p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-semibold text-[#282828]">{subtotal.toLocaleString('fr-FR')} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Livraison ({plan?.label || 'Standard'})</span>
              <span className={shippingFee === 0 ? 'font-black text-emerald-600' : 'font-semibold text-[#282828]'}>
                {shippingFee === 0 ? 'Gratuit' : `${shippingFee.toLocaleString('fr-FR')} F`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Réduction</span>
                <span className="font-bold text-emerald-600">−{discount.toLocaleString('fr-FR')} F</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 1 : Adresse de livraison ─── */
function StepAddress({ form, setForm, errors, savedAddresses, selectedAddressId, handleSelectAddress }) {
  const fields = [
    { key: 'firstName', label: 'Prénom', required: true, half: true },
    { key: 'lastName', label: 'Nom', required: true, half: true },
    { key: 'email', label: 'Email', type: 'email', required: true, half: true },
    { key: 'phone', label: 'Téléphone', type: 'tel', required: true, half: true },
  ];

  return (
    <div className="space-y-6">
      {/* Saved addresses */}
      {savedAddresses.length > 0 && (
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Adresses enregistrées</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {savedAddresses.map((address) => {
              const id = address._id || address.id || 'default';
              const isActive = selectedAddressId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectAddress(address)}
                  className={[
                    'text-left p-4 rounded-xl border-2 transition-all duration-200 group',
                    isActive
                      ? 'border-[#F68B1E] bg-gradient-to-br from-orange-50 to-amber-50/30 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          {address.label || 'Adresse'}
                        </span>
                        {address.isDefault && (
                          <span className="text-[9px] rounded-full bg-[#F68B1E] text-white px-2 py-0.5 font-bold">
                            Défaut
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#282828]">{address.city}</p>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{address.fullAddress}</p>
                    </div>
                    <div
                      className={[
                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-all',
                        isActive ? 'border-[#F68B1E] bg-[#F68B1E]' : 'border-gray-300',
                      ].join(' ')}
                    >
                      {isActive && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Form */}
      <div>
        {savedAddresses.length > 0 && (
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Ou renseigner manuellement</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          {fields.map(({ key, label, type = 'text', required }) => (
            <div key={key}>
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                {label}{required && <span className="text-[#F68B1E] ml-0.5">*</span>}
              </label>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={[
                  'w-full px-4 py-3 border-2 rounded-xl text-sm font-medium outline-none transition-all duration-200',
                  errors[key]
                    ? 'border-red-300 bg-red-50/50 focus:border-red-300'
                    : 'border-gray-100 bg-gray-50/50 focus:border-gray-100 focus:bg-white focus:shadow-sm',
                ].join(' ')}
                placeholder={label}
              />
              {errors[key] && (
                <p className="text-red-500 text-[11px] mt-1 font-medium flex items-center gap-1">
                  {errors[key]}
                </p>
              )}
            </div>
          ))}

          {/* Country */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Pays<span className="text-[#F68B1E] ml-0.5">*</span>
            </label>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl text-sm font-medium outline-none focus:border-gray-100 focus:bg-white transition-all duration-200 appearance-none cursor-pointer"
            >
              <option>Togo</option>
              <option>Bénin</option>
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Ville<span className="text-[#F68B1E] ml-0.5">*</span>
            </label>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={[
                'w-full px-4 py-3 border-2 rounded-xl text-sm font-medium outline-none transition-all duration-200',
                errors.city
                  ? 'border-red-300 bg-red-50/50 focus:border-red-300'
                  : 'border-gray-100 bg-gray-50/50 focus:border-gray-100 focus:bg-white focus:shadow-sm',
              ].join(' ')}
              placeholder="Ville"
            />
            {errors.city && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.city}</p>}
          </div>

          {/* Neighborhood */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Quartier</label>
            <input
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl text-sm font-medium outline-none focus:border-gray-100 focus:bg-white transition-all duration-200"
              placeholder="Quartier"
            />
          </div>

          {/* Postal code */}
          <div>
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Code postal</label>
            <input
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl text-sm font-medium outline-none focus:border-gray-100 focus:bg-white transition-all duration-200"
              placeholder="Code postal"
            />
          </div>

          {/* Full address */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
              Adresse complète<span className="text-[#F68B1E] ml-0.5">*</span>
            </label>
            <input
              value={form.fullAddress}
              onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
              className={[
                'w-full px-4 py-3 border-2 rounded-xl text-sm font-medium outline-none transition-all duration-200',
                errors.fullAddress
                  ? 'border-red-300 bg-red-50/50 focus:border-red-300'
                  : 'border-gray-100 bg-gray-50/50 focus:border-gray-100 focus:bg-white focus:shadow-sm',
              ].join(' ')}
              placeholder="Numéro, rue, bâtiment..."
            />
            {errors.fullAddress && <p className="text-red-500 text-[11px] mt-1 font-medium">{errors.fullAddress}</p>}
          </div>

          {/* Instructions */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Instructions de livraison</label>
            <textarea
              rows="2"
              value={form.instructions}
              onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-100 bg-gray-50/50 rounded-xl text-sm font-medium outline-none focus:border-gray-100 focus:bg-white transition-all duration-200 resize-none"
              placeholder="Bâtiment, code d'accès, remarques..."
            />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 : Formule de livraison ─── */
function StepShipping({ shippingMethod, setShippingMethod }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
    purple: { bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 mb-2">
        Choisissez le mode d'acheminement de votre commande.
      </p>

      <div className="space-y-3">
        {SHIPPING_PLANS.map((plan) => {
          const isSelected = shippingMethod === plan.value;
          const colors = colorMap[plan.color];

          return (
            <button
              key={plan.value}
              type="button"
              onClick={() => setShippingMethod(plan.value)}
              className={[
                'w-full text-left rounded-2xl border-2 transition-all duration-300 group overflow-hidden',
                isSelected
                  ? `border-[#F68B1E] shadow-lg shadow-orange-100/40`
                  : 'border-gray-100 hover:border-gray-200 hover:shadow-sm',
              ].join(' ')}
            >
              {/* Main row */}
              <div className="flex items-center gap-4 px-5 py-4">
                {/* Radio indicator */}
                <div
                  className={[
                    'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200',
                    isSelected ? 'border-[#F68B1E] bg-[#F68B1E]' : 'border-gray-300 group-hover:border-gray-400',
                  ].join(' ')}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-black text-[#282828]">{plan.label}</span>
                    <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${colors.badge}`}>
                      {plan.tagline}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{plan.delay}</p>
                </div>

                {/* Price */}
                <div className="text-right shrink-0">
                  <span className={`text-base font-black ${plan.price === 0 ? 'text-emerald-600' : 'text-[#282828]'}`}>
                    {plan.priceLabel}
                  </span>
                </div>
              </div>

              {/* Expanded features */}
              <div
                className={`transition-all duration-300 ease-in-out overflow-hidden ${isSelected ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-5 pb-4 pt-0">
                  <div className={`rounded-xl ${colors.bg} p-3`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Step 3 : Paiement ─── */
function StepPayment({ acceptCGV, setAcceptCGV, submitting, handlePlaceOrder, computedTotal, previewLoading, form, shippingMethod }) {
  const plan = SHIPPING_PLANS.find((p) => p.value === shippingMethod);

  return (
    <div className="space-y-6">
      {/* Recap card */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Récapitulatif</p>
        <div className="space-y-2">
          <div className="flex flex-col">
            <p className="text-xs font-bold text-[#282828]">Livraison à :</p>
            <p className="text-xs text-gray-500">
              {form.fullAddress}{form.city ? `, ${form.city}` : ''}{form.country ? ` — ${form.country}` : ''}
            </p>
          </div>
          <div className="flex flex-col pt-2">
            <p className="text-xs font-bold text-[#282828]">Mode de livraison :</p>
            <p className="text-xs text-gray-500">{plan?.label || 'Standard'} — {plan?.delay}</p>
          </div>
        </div>
      </div>


      {/* CGV */}
      <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 bg-gray-50/50 cursor-pointer select-none hover:bg-gray-50 transition group">
        <input
          type="checkbox"
          checked={acceptCGV}
          onChange={(e) => setAcceptCGV(e.target.checked)}
          className="mt-1 h-5 w-5 accent-[#F68B1E] rounded"
        />
        <span className="text-sm text-gray-600 leading-relaxed">
          J'ai lu et j'accepte les conditions générales de vente de Dangoimport.
        </span>
      </label>

      {/* Submit */}
      <button
        onClick={handlePlaceOrder}
        disabled={submitting || !acceptCGV}
        className={[
          'w-full font-black py-4 rounded-xl transition-all duration-200 text-sm tracking-wide relative overflow-hidden group',
          submitting || !acceptCGV
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-[#F68B1E] hover:bg-[#E67A0C] text-white shadow-lg shadow-orange-200/50 hover:shadow-xl hover:shadow-orange-200/60 hover:-translate-y-0.5',
        ].join(' ')}
      >
        {submitting ? (
          'Redirection en cours...'
        ) : (
          `Confirmer et payer — ${previewLoading ? '...' : `${computedTotal.toLocaleString('fr-FR')} FCFA`}`
        )}
      </button>

      <p className="text-center text-[11px] text-gray-400">
        Paiement sécurisé via FedaPay
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   COMPOSANT PRINCIPAL — CHECKOUT WIZARD
   ═══════════════════════════════════════════════════════════════ */
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

  /* ─── State ─── */
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [acceptCGV, setAcceptCGV] = useState(false);
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(null);
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod] = useState('fedapay');
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [qrTokens, setQrTokens] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [pendingFedapay, setPendingFedapay] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
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

  const shippingFee = SHIPPING_PLANS.find((p) => p.value === shippingMethod)?.price ?? 0;

  /* ─── Helpers ─── */
  const itemUnitPrice = (item) => {
    const price =
      Number(item.promoPrice) > 0 && Number(item.promoPrice) < Number(item.price || 0)
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

  const getShippingLabel = () => SHIPPING_PLANS.find((p) => p.value === shippingMethod)?.label || 'Standard';

  /* ─── Effects ─── */
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlStatus = (urlParams.get('status') || '').toLowerCase();
    const pendingRawFromStorage = localStorage.getItem('pendingFedapay');

    if (['approved', 'completed', 'paid', 'successful', 'success'].includes(urlStatus)) {
      const pending = pendingRawFromStorage ? JSON.parse(pendingRawFromStorage) : null;
      const txId = pending?.transactionId || urlParams.get('transactionId');
      clearCart();
      localStorage.removeItem('pendingFedapay');
      localStorage.removeItem('dangoPromoCode');
      navigate(`/checkout/result?status=success${txId ? `&transactionId=${encodeURIComponent(txId)}` : ''}`, { replace: true });
      return;
    }

    if (['failed', 'cancelled', 'error'].includes(urlStatus)) {
      const pending = pendingRawFromStorage ? JSON.parse(pendingRawFromStorage) : null;
      const txId = pending?.transactionId || urlParams.get('transactionId');
      navigate(`/checkout/result?status=failed${txId ? `&transactionId=${encodeURIComponent(txId)}` : ''}`, { replace: true });
      return;
    }

    let pollId;
    if (pendingRawFromStorage) {
      try {
        const pending = JSON.parse(pendingRawFromStorage);
        if (pending && pending.transactionId) {
          const check = async () => {
            try {
              const token = localStorage.getItem('dangoToken');
              const res = await fetch(`${API_BASE_URL}/api/fedapay/transaction/${pending.transactionId}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
              });
              const data = await res.json();
              const statusValue = (data.data?.local?.status || data.data?.remote?.status || '').toLowerCase();
              const orderId = data.data?.local?.orderId || data.data?.local?.order_id || null;
              if (res.ok && ['approved', 'completed', 'paid', 'successful', 'success'].includes(statusValue)) {
                if (orderId) {
                  let tokens = [];
                  try {
                    setQrLoading(true);
                    setQrError(null);
                    const qrResponse = await fetchOrderQrTokens(orderId, token);
                    tokens = qrResponse.qrTokens || [];
                    setQrTokens(tokens);
                    if (tokens.length) setShowQrPanel(true);
                  } catch (qrErr) {
                    setQrError(qrErr.message || 'Erreur QR');
                  } finally {
                    setQrLoading(false);
                  }
                  clearCart();
                  localStorage.removeItem('pendingFedapay');
                  localStorage.removeItem('dangoPromoCode');
                  if (tokens.length === 0) toast.error('Paiement reçu, mais aucun QR généré.');
                  if (pollId) clearInterval(pollId);
                }
              }
            } catch (err) {
              console.error('Error polling FedaPay status', err);
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

    const pendingRaw = localStorage.getItem('pendingFedapay');
    if (pendingRaw) {
      try {
        const pending = JSON.parse(pendingRaw);
        if (pending && pending.transactionId) setPendingFedapay(pending);
      } catch (e) { /* noop */ }
    }

    const token = localStorage.getItem('dangoToken');
    if (!token) { redirectToLogin(); return; }

    try {
      const userData = JSON.parse(localStorage.getItem('dangoUser') || '{}');
      const userAddresses = Array.isArray(userData.addresses) ? userData.addresses : [];
      setSavedAddresses(userAddresses);

      if (userData.userFirstname || userData.firstname) {
        setForm((prev) => ({
          ...prev,
          firstName: userData.userFirstname || userData.firstname || '',
          lastName: userData.userSurname || userData.lastName || userData.surname || '',
          email: userData.userEmail || userData.email || '',
          phone: userData.userPhone || userData.phone || '',
        }));
      }

      const defaultAddress = userAddresses.find((a) => a.isDefault) || userAddresses[0];
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

    return () => { if (pollId) clearInterval(pollId); };
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
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            items: cartItems.map((item) => ({ productId: item._id || item.id, quantity: item.quantity || 1 })),
            shippingMethod,
            promoCode,
          }),
        });
        const data = await response.json();
        if (response.status === 401 || response.status === 403) { redirectToLogin(); return; }
        if (!response.ok) throw new Error(data.message || 'Impossible de calculer le total');
        setPreview(data.data || null);
        if (promoCode?.trim()) localStorage.setItem('dangoPromoCode', promoCode.trim().toUpperCase());
        else localStorage.removeItem('dangoPromoCode');
      } catch (error) {
        console.error('Erreur preview:', error);
      } finally {
        setPreviewLoading(false);
      }
    };
    const timer = window.setTimeout(loadPreview, 250);
    return () => window.clearTimeout(timer);
  }, [cartItems, shippingMethod, promoCode]);

  useEffect(() => {
    if (!qrTokens.length) { setQrImages({}); return; }
    qrTokens.forEach((tokenData) => {
      const key = tokenData.vendorId || tokenData.vendorName || tokenData.token;
      QRCode.toDataURL(tokenData.token, { width: 280, margin: 2 })
        .then((url) => setQrImages((prev) => ({ ...prev, [key]: url })))
        .catch(console.error);
    });
  }, [qrTokens]);

  /* ─── Validation ─── */
  const validateForm = () => {
    const e = {};
    if (!form.firstName.trim()) e.firstName = 'Le prénom est requis';
    if (!form.lastName.trim()) e.lastName = 'Le nom est requis';
    if (!form.email.trim()) e.email = "L'email est requis";
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8) e.phone = 'Téléphone valide requis';
    if (!form.country.trim()) e.country = 'Le pays est requis';
    if (!form.city.trim()) e.city = 'La ville est requise';
    if (!form.fullAddress.trim()) e.fullAddress = "L'adresse est requise";
    setErrors(e);
    return Object.keys(e).length === 0;
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

  /* ─── Paiement ─── */
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Veuillez remplir correctement les informations de livraison');
      return;
    }
    if (!acceptCGV) {
      toast.error('Veuillez accepter les conditions générales de vente');
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem('dangoToken');
    const toastId = toast.loading('Préparation du paiement...');
    try {
      const computedTotal = Number(preview?.subtotal ?? subtotal) + shippingFee - Number(preview?.discount || 0);
      const payload = buildCartFedapayPayload({
        form,
        cartItems,
        subtotal,
        shippingFee,
        total: computedTotal,
        shippingLabel: getShippingLabel(),
        description: 'Commande Dangoimport',
        type: 'cart',
      });

      const data = await initiateFedapayCheckout(payload, token);
      if (!data?.url) throw new Error('URL de paiement FedaPay introuvable.');

      toast.update(toastId, { render: 'Redirection vers FedaPay...', type: 'info', isLoading: false, autoClose: 2000 });

      try {
        localStorage.setItem('pendingFedapay', JSON.stringify({ transactionId: data.transactionId, localTransactionId: data.localTransactionId }));
        localStorage.setItem('pendingFedapayCartBackup', JSON.stringify(cartItems));
      } catch (e) { console.warn('Impossible de sauvegarder le panier de secours', e); }

      window.location.href = data.url;
    } catch (error) {
      console.error('Erreur paiement:', error);
      toast.update(toastId, { render: `${error.message}`, type: 'error', isLoading: false, autoClose: 4000 });
    } finally {
      setSubmitting(false);
    }
  };

  /* ─── Navigation entre étapes ─── */
  const goNext = () => {
    if (currentStep === 1) {
      if (!validateForm()) {
        toast.error('Veuillez remplir les champs obligatoires.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (currentStep === 1) {
      navigate('/cart');
      return;
    }
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  /* ─── Panier vide ─── */
  if (!cartItems.length) {
    return (
      <>
        <Header />
        <div className="min-h-[70vh] bg-[#FAFAFA] flex items-center justify-center pt-28">
          <div className="text-center px-6">
            <h2 className="text-xl font-black text-gray-900 mb-2">Votre panier est vide</h2>
            <p className="text-gray-500 text-sm mb-6 max-w-xs mx-auto">
              Ajoutez des produits avant de finaliser votre commande.
            </p>
            <button
              onClick={() => navigate('/shopping')}
              className="bg-[#F68B1E] hover:bg-[#E67A0C] text-white font-black px-8 py-3.5 rounded-xl transition-all hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5"
            >
              Continuer le shopping
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const computedTotal = Number(preview?.subtotal ?? subtotal) + shippingFee - Number(preview?.discount || 0);

  const stepTitles = {
    1: 'Adresse de livraison',
    2: 'Formule de livraison',
    3: 'Confirmation & paiement',
  };

  /* ─── Rendu principal ─── */
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 pt-24 sm:pt-28">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-4">
          <StepperBar currentStep={currentStep} />
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-32">
        {/* Order summary (collapsible) */}
        <div className="mb-6">
          <MiniOrderSummary
            cartItems={cartItems}
            itemUnitPrice={itemUnitPrice}
            subtotal={subtotal}
            shippingFee={shippingFee}
            shippingMethod={shippingMethod}
            preview={preview}
            previewLoading={previewLoading}
            isOpen={summaryOpen}
            onToggle={() => setSummaryOpen(!summaryOpen)}
          />
        </div>

        {/* Step content card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Step header */}
          <div className="px-6 py-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#F68B1E] flex items-center justify-center text-white text-sm font-black">
                {currentStep}
              </div>
              <h2 className="text-base font-black text-[#282828]">{stepTitles[currentStep]}</h2>
            </div>
          </div>

          {/* Step body */}
          <div className="p-6">
            {currentStep === 1 && (
              <StepAddress
                form={form}
                setForm={setForm}
                errors={errors}
                savedAddresses={savedAddresses}
                selectedAddressId={selectedAddressId}
                handleSelectAddress={handleSelectAddress}
              />
            )}
            {currentStep === 2 && (
              <StepShipping
                shippingMethod={shippingMethod}
                setShippingMethod={setShippingMethod}
              />
            )}
            {currentStep === 3 && (
              <StepPayment
                acceptCGV={acceptCGV}
                setAcceptCGV={setAcceptCGV}
                submitting={submitting}
                handlePlaceOrder={handlePlaceOrder}
                computedTotal={computedTotal}
                previewLoading={previewLoading}
                form={form}
                shippingMethod={shippingMethod}
              />
            )}
          </div>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 gap-3">
          <button
            type="button"
            onClick={goBack}
            className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold text-gray-600 bg-white border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            {currentStep === 1 ? 'Panier' : 'Retour'}
          </button>

          {currentStep < 3 && (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-[#F68B1E] hover:bg-[#E67A0C] shadow-lg shadow-orange-200/40 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-0.5 transition-all"
            >
              Continuer
            </button>
          )}
        </div>
      </main>

      {/* Mobile bottom bar — total always visible */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 z-50 lg:hidden">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div>
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total</p>
            <p className="text-base font-black text-[#F68B1E]">
              {previewLoading ? '...' : `${computedTotal.toLocaleString('fr-FR')} FCFA`}
            </p>
          </div>
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black text-white bg-[#F68B1E] hover:bg-[#E67A0C] shadow-lg shadow-orange-200/40 transition-all"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || !acceptCGV}
              className={[
                'flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-black transition-all',
                submitting || !acceptCGV
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-[#F68B1E] hover:bg-[#E67A0C] text-white shadow-lg shadow-orange-200/40',
              ].join(' ')}
            >
              {submitting ? 'Paiement...' : 'Payer'}
            </button>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
