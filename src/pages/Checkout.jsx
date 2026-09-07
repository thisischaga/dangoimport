import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, User, Mail, Phone,
  Truck, ShieldCheck, Lock, CreditCard, Check, ChevronLeft,
  Smartphone, BadgeCheck, LocateFixed, AlertCircle,
} from 'lucide-react';
import toast from '../utils/toast';
import QRCode from 'qrcode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { initiateFedapayCheckout, buildCartFedapayPayload } from '../services/fedapayCheckout';
import { fetchOrderQrTokens } from '../services/qrService';
import { calculateDeliveryOptions } from '../api';



const STEPS = [
  { id: 1, label: 'Adresse', icon: MapPin },
  { id: 2, label: 'Livraison', icon: Truck },
  { id: 3, label: 'Paiement', icon: CreditCard },
];

/* ─── Stepper Progress Bar (premium) ─── */
function StepperBar({ currentStep }) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">
        <div className="absolute left-0 right-0 top-5 mx-9 h-[3px] rounded-full bg-gray-100 sm:mx-10" />
        <motion.div
          initial={false}
          animate={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="absolute left-0 top-5 mx-9 h-[3px] rounded-full bg-gradient-to-r from-[#F68B1E] to-[#FFA94D] sm:mx-10"
          style={{ maxWidth: 'calc(100% - 2.25rem)' }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;
          const Icon = step.icon;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
              <motion.div
                animate={isActive ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
                className={[
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-black transition-all duration-300',
                  isCompleted
                    ? 'border-[#F68B1E] bg-[#F68B1E] text-white shadow-md shadow-orange-200'
                    : isActive
                    ? 'border-[#F68B1E] bg-white text-[#F68B1E] shadow-md shadow-orange-100 ring-4 ring-orange-50'
                    : 'border-gray-200 bg-white text-gray-300',
                ].join(' ')}
              >
                {isCompleted ? <Check className="h-4 w-4" strokeWidth={3} /> : <Icon className="h-4 w-4" strokeWidth={2.5} />}
              </motion.div>
              <span
                className={[
                  'text-[11px] font-bold tracking-wide transition-colors duration-300',
                  isActive ? 'text-[#F68B1E]' : isCompleted ? 'text-[#282828]' : 'text-gray-300',
                ].join(' ')}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Résumé de commande — panneau unique (mobile: repliable / desktop: fixe) ─── */
function OrderSummaryPanel({ cartItems, itemUnitPrice, subtotal, shippingFee, preview, previewLoading, variant = 'sticky', isOpen, onToggle }) {
  const discount = Number(preview?.discount || 0);
  const total = Number(preview?.subtotal ?? subtotal) + shippingFee - discount;
  const collapsible = variant === 'collapsible';

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between px-5 py-4 transition hover:bg-gray-50/50"
        >
          <div className="text-left">
            <p className="text-xs font-medium text-gray-500">Résumé de commande</p>
            <p className="text-sm font-black text-[#282828]">
              {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-base font-black text-[#F68B1E]">
              {previewLoading ? '...' : `${total.toLocaleString('fr-FR')} FCFA`}
            </span>
            <span className="text-xs font-bold text-gray-400">{isOpen ? 'Masquer' : 'Afficher'}</span>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-black text-[#282828]">Résumé de commande</p>
            <p className="text-xs text-gray-400">
              {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}

      <div
        className={
          collapsible
            ? `overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`
            : ''
        }
      >
        <div className={collapsible ? 'border-t border-gray-100 px-5 pb-5' : 'px-5 pb-5'}>
          <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">
            {cartItems.map((item) => (
              <div key={item._id || item.id} className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <img
                    src={item.image || item.images?.[0]?.url}
                    alt={item.name}
                    className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                  />
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {item.quantity}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-[#282828]">{item.name}</p>
                  <p className="text-[11px] text-gray-400">Qté : {item.quantity}</p>
                </div>
                <p className="shrink-0 text-xs font-black text-[#282828]">
                  {(itemUnitPrice(item) * Number(item.quantity || 1)).toLocaleString('fr-FR')} F
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Sous-total</span>
              <span className="font-semibold text-[#282828]">{subtotal.toLocaleString('fr-FR')} F</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Livraison</span>
              <span className={shippingFee === 0 ? 'font-black text-emerald-600' : 'font-semibold text-[#282828]'}>
                {shippingFee === 0 ? 'Calculée à la livraison' : `${shippingFee.toLocaleString('fr-FR')} F`}
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Réduction</span>
                <span className="font-bold text-emerald-600">−{discount.toLocaleString('fr-FR')} F</span>
              </div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/40 px-4 py-3">
            <span className="text-sm font-bold text-gray-600">Total</span>
            <span className="text-lg font-black text-[#F68B1E]">
              {previewLoading ? '...' : `${total.toLocaleString('fr-FR')} FCFA`}
            </span>
          </div>

          {!collapsible && (
            <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-[11px] text-gray-500">
              <div className="flex items-center gap-2"><ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Paiement 100% sécurisé</div>
              <div className="flex items-center gap-2"><Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Données chiffrées de bout en bout</div>
              <div className="flex items-center gap-2"><Smartphone className="h-3.5 w-3.5 shrink-0 text-emerald-600" /> Mobile Money & cartes acceptés</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── Champ avec icône ─── */
function IconField({ icon: Icon, label, required, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}
        {required && <span className="ml-0.5 text-[#F68B1E]">*</span>}
      </label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
        {children}
      </div>
      {error && <p className="mt-1 text-[11px] font-medium text-red-500">{error}</p>}
    </div>
  );
}

const inputBaseCls = (hasError) =>
  [
    'w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:border-transparent focus:ring-0 focus:shadow-none',
    hasError
      ? 'border-red-300 bg-red-50/50 focus:border-red-300'
      : 'border-gray-100 bg-gray-50/50 focus:bg-white',
  ].join(' ');

const FIELD_ICONS = { firstName: User, lastName: User, email: Mail, phone: Phone };

/* ─── Statuts géolocalisation ─── */
const GEO_STATUS = { idle: 'idle', loading: 'loading', success: 'success', error: 'error' };

/* ─── Step 1 : Informations de contact + géolocalisation ─── */
function StepAddress({ form, setForm, errors, geoStatus, geoAddress, onGeolocate, addressQuery, setAddressQuery, addressSuggestions, onSelectSuggestion }) {
  const contactFields = [
    { key: 'firstName', label: 'Prénom', required: true },
    { key: 'lastName', label: 'Nom', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Téléphone', type: 'tel', required: true },
    {
      key: 'country',
      label: 'Pays',
      type: 'select',
      required: true,
      options: [
        { value: '', label: 'Sélectionnez un pays' },
        { value: 'Bénin', label: 'Bénin' },
        { value: 'Togo', label: 'Togo' },
      ],
    },
  ];

  const geoReady = geoStatus === GEO_STATUS.success;
  const geoLoading = geoStatus === GEO_STATUS.loading;
  const geoError = geoStatus === GEO_STATUS.error;

  return (
    <div className="space-y-6">
      {/* Informations de contact */}
      <div>
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-400">Informations de contact</p>
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {contactFields.map(({ key, label, type = 'text', required, placeholder, options }) => (
            <IconField key={key} icon={FIELD_ICONS[key] || MapPin} label={label} required={required} error={errors[key]}>
              {type === 'select' ? (
                <select
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputBaseCls(!!errors[key])}
                >
                  {options.map((option) => (
                    <option key={option.value || 'empty'} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={type}
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className={inputBaseCls(!!errors[key])}
                  placeholder={placeholder || label}
                />
              )}
            </IconField>
          ))}
        </div>
      </div>

      {/* Géolocalisation de livraison */}
      <div>
        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-400">Position de livraison</p>

        <div className="mb-4">
          <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
            Rechercher une adresse
          </label>
          <div className="relative">
            <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />
            <input
              type="text"
              value={addressQuery}
              onChange={(e) => setAddressQuery(e.target.value)}
              className={inputBaseCls(!!errors.location)}
              placeholder="Ex. Cotonou, Rue du 7 novembre..."
              style={{ paddingLeft: '2.75rem' }}
            />
          </div>

          {addressSuggestions.length > 0 && (
            <div className="mt-2 max-h-52 overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
              {addressSuggestions.map((suggestion) => (
                <button
                  key={`${suggestion.place_id}-${suggestion.display_name}`}
                  type="button"
                  onClick={() => onSelectSuggestion(suggestion)}
                  className="flex w-full flex-col border-b border-gray-100 px-3 py-2.5 text-left transition hover:bg-orange-50/60 last:border-b-0"
                >
                  <span className="text-sm font-semibold text-[#282828]">{suggestion.display_name}</span>
                  <span className="mt-0.5 text-[11px] text-gray-500">{suggestion.type || 'Adresse'}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {errors.location && (
          <p className="mt-2 flex items-center gap-1.5 text-[11px] font-medium text-red-500">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {errors.location}
          </p>
        )}
      </div>
    </div>
  );
}

/* ─── Step 2 : Livraison automatique ─── */
function StepShipping({ deliveryCalculation }) {
  // Résoudre le ou les responsables de livraison depuis le calcul backend
  const deliveryGroups = deliveryCalculation?.groups?.length ? deliveryCalculation.groups : null;
  const overallProvider = deliveryCalculation?.provider || null;

  return (
    <div className="space-y-5">

      {/* Carte : Responsable(s) de livraison — calculé automatiquement */}
      <div className="space-y-2">
        <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">Prise en charge de la livraison</p>

        {deliveryCalculation ? (
          <>
            {deliveryGroups ? (
              <div className="space-y-2">
                {deliveryGroups.map((grp, idx) => {
                  const isSeller = grp.provider === 'SELLER';
                  return (
                    <div
                      key={idx}
                      className={[
                        'flex items-start gap-3 rounded-2xl border p-4',
                        isSeller
                          ? 'border-blue-100 bg-blue-50/60'
                          : 'border-orange-100 bg-orange-50/60',
                      ].join(' ')}
                    >
                      <div className={['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', isSeller ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-[#F68B1E]'].join(' ')}>
                        <Truck className="h-4 w-4" strokeWidth={2} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-black text-[#282828]">
                          {isSeller ? 'Livraison par le vendeur' : 'Livraison par DangoImport'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {grp.storeName || 'Vendeur'}
                          {grp.estimatedDeliveryTime && (
                            <> &bull; {grp.estimatedDeliveryTime}</>
                          )}
                        </p>
                        {!isSeller && !grp.sellerDeliveryAvailable && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            Adresse hors zone vendeur — DangoImport prend le relais automatiquement.
                          </p>
                        )}
                      </div>
                      <BadgeCheck className={['h-4 w-4 shrink-0', isSeller ? 'text-blue-500' : 'text-[#F68B1E]'].join(' ')} />
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                className={[
                  'flex items-start gap-3 rounded-2xl border p-4',
                  overallProvider === 'SELLER' ? 'border-blue-100 bg-blue-50/60' : 'border-orange-100 bg-orange-50/60',
                ].join(' ')}
              >
                <div className={['mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl', overallProvider === 'SELLER' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-[#F68B1E]'].join(' ')}>
                  <Truck className="h-4 w-4" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black text-[#282828]">
                    {overallProvider === 'SELLER' ? 'Livraison par le vendeur' : 'Livraison par DangoImport'}
                  </p>
                  <p className="text-xs text-gray-500">Déterminé automatiquement selon votre adresse</p>
                </div>
                <BadgeCheck className={['h-4 w-4 shrink-0', overallProvider === 'SELLER' ? 'text-blue-500' : 'text-[#F68B1E]'].join(' ')} />
              </div>
            )}
          </>
        ) : (
          /* État chargement */
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
            <div className="h-8 w-8 animate-pulse rounded-xl bg-gray-200" />
            <div className="space-y-1.5">
              <div className="h-3 w-32 animate-pulse rounded bg-gray-200" />
              <div className="h-2.5 w-48 animate-pulse rounded bg-gray-100" />
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

/* ─── Step 3 : Paiement ─── */
function StepPayment({ acceptCGV, setAcceptCGV, submitting, handlePlaceOrder, computedTotal, previewLoading, form, geoAddress, deliveryCalculation }) {
  const overallProvider = deliveryCalculation?.provider;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Récapitulatif</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]"><MapPin className="h-3.5 w-3.5" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#282828]">Position de livraison</p>
              <p className="text-xs text-gray-500">
                {geoAddress || (form.lat ? `${form.lat.toFixed(5)}, ${form.lng.toFixed(5)}` : 'Non définie')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]"><Truck className="h-3.5 w-3.5" /></div>
            <div>
              <p className="text-xs font-bold text-[#282828]">Responsable de livraison</p>
              <p className="text-xs text-gray-500">
                {overallProvider === 'SELLER' ? 'Le vendeur' : overallProvider === 'HYBRID' ? 'Vendeur + DangoImport' : 'DangoImport'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-gray-400">
        <div className="flex items-center gap-1.5 text-[11px] font-bold"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Sécurisé</div>
        <span className="text-gray-200">•</span>
        <div className="flex items-center gap-1.5 text-[11px] font-bold"><Smartphone className="h-4 w-4 text-gray-400" /> Mobile Money</div>
      </div>

      <label className="group flex cursor-pointer select-none items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50">
        <input
          type="checkbox"
          checked={acceptCGV}
          onChange={(e) => setAcceptCGV(e.target.checked)}
          className="mt-1 h-5 w-5 rounded accent-[#F68B1E]"
        />
        <span className="text-sm leading-relaxed text-gray-600">
          J'ai lu et j'accepte les conditions générales de vente de Dangoimport.
        </span>
      </label>

      <button
        onClick={handlePlaceOrder}
        disabled={submitting || !acceptCGV}
        className={[
          'group relative w-full overflow-hidden rounded-xl py-4 text-sm font-black tracking-wide transition-all duration-200',
          submitting || !acceptCGV
            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
            : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/50 hover:-translate-y-0.5 hover:bg-[#E67A0C] hover:shadow-xl hover:shadow-orange-200/60',
        ].join(' ')}
      >
        <span className="relative z-10 inline-flex items-center justify-center gap-2">
          {submitting ? (
            'Redirection en cours...'
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Confirmer et payer {previewLoading ? '...' : `${computedTotal.toLocaleString('fr-FR')} FCFA`}
            </>
          )}
        </span>
        {!(submitting || !acceptCGV) && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}
      </button>

      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
        <Lock className="h-3 w-3" /> Paiement sécurisé via FedaPay
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
  const [promoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [paymentMethod] = useState('fedapay');
  const [qrTokens, setQrTokens] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [showQrPanel, setShowQrPanel] = useState(false);
  const [pendingFedapay, setPendingFedapay] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [deliveryCalculation, setDeliveryCalculation] = useState(null);
  const [geoStatus, setGeoStatus] = useState(GEO_STATUS.idle);
  const [geoAddress, setGeoAddress] = useState('');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    lat: null,
    lng: null,
  });

  useEffect(() => {
    if (!cartItems.length) return;

    let cancelled = false;
    const clientLocation = form.lat && form.lng ? { lat: form.lat, lng: form.lng } : null;

    calculateDeliveryOptions({ items: cartItems, clientLocation })
      .then((res) => {
        if (!cancelled && res?.data) {
          setDeliveryCalculation(res.data);
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [cartItems, form.lat, form.lng]);

  /* ─── Géolocalisation GPS ─── */
  const setLocationFromCoordinates = useCallback(async (latitude, longitude, displayName) => {
    setForm((prev) => ({ ...prev, lat: latitude, lng: longitude }));
    setGeoStatus(GEO_STATUS.success);

    const resolvedAddress = displayName || `${Number(latitude).toFixed(5)}, ${Number(longitude).toFixed(5)}`;
    setGeoAddress(resolvedAddress);
    setAddressQuery(resolvedAddress);

    try {
      if (!displayName) {
        const resp = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await resp.json();
        const nextAddress = data.display_name || resolvedAddress;
        setGeoAddress(nextAddress);
        setAddressQuery(nextAddress);
      }
    } catch {
      // keep resolved fallback
    }
  }, []);

  const handleGeolocate = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus(GEO_STATUS.error);
      return;
    }
    setGeoStatus(GEO_STATUS.loading);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        await setLocationFromCoordinates(latitude, longitude);
      },
      () => {
        setGeoStatus(GEO_STATUS.error);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [setLocationFromCoordinates]);

  const handleSelectSuggestion = useCallback((suggestion) => {
    const latitude = Number(suggestion.lat);
    const longitude = Number(suggestion.lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      setAddressSuggestions([]);
      return;
    }
    setAddressSuggestions([]);
    setLocationFromCoordinates(latitude, longitude, suggestion.display_name || 'Adresse sélectionnée');
  }, [setLocationFromCoordinates]);

  useEffect(() => {
    if (addressQuery.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(addressQuery)}&countrycodes=bj,tg`,
          { headers: { 'Accept-Language': 'fr' } }
        );
        const data = await response.json();
        setAddressSuggestions(Array.isArray(data) ? data : []);
      } catch {
        setAddressSuggestions([]);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [addressQuery]);

  const shippingFee = 0; // Calculé à la livraison selon le fournisseur déterminé automatiquement

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

  const getShippingLabel = () => deliveryCalculation?.provider === 'SELLER' ? 'Vendeur' : 'DangoImport';

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
              const statusValue = (data.data?.status || '').toLowerCase();
              const orderId = data.data?.orderId || null;
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
      if (userData.userFirstname || userData.firstname) {
        setForm((prev) => ({
          ...prev,
          firstName: userData.userFirstname || userData.firstname || '',
          lastName: userData.userSurname || userData.lastName || userData.surname || '',
          email: userData.userEmail || userData.email || '',
          phone: userData.userPhone || userData.phone || '',
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
  }, [cartItems, promoCode]);

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
    if (!form.country || !form.country.trim()) e.country = 'Le pays est requis';
    if (!form.lat || !form.lng) e.location = 'Veuillez autoriser la géolocalisation pour continuer';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* ─── Paiement ─── */
  const handlePlaceOrder = async () => {
    if (!acceptCGV) {
      toast.error('Veuillez accepter les conditions générales de vente');
      return;
    }
    if (!form.lat || !form.lng) {
      toast.error('Veuillez partager votre position pour la livraison');
      return;
    }
    setSubmitting(true);
    const token = localStorage.getItem('dangoToken');
    const toastId = toast.loading('Préparation du paiement...');
    try {
      const computedTotal = Number(preview?.subtotal ?? subtotal) + shippingFee - Number(preview?.discount || 0);
      const payload = buildCartFedapayPayload({
        form: {
          ...form,
          fullAddress: geoAddress || `${form.lat}, ${form.lng}`,
          city: geoAddress ? geoAddress.split(',')[0] : '',
          country: form.country || 'Togo',
        },
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
        toast.error('Veuillez renseigner vos informations et activer la géolocalisation.');
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
        <div className="flex min-h-[70vh] items-center justify-center bg-[#FAFAFA] pt-28">
          <div className="px-6 text-center">
            <h2 className="mb-2 text-xl font-black text-gray-900">Votre panier est vide</h2>
            <p className="mx-auto mb-6 max-w-xs text-sm text-gray-500">
              Ajoutez des produits avant de finaliser votre commande.
            </p>
            <button
              onClick={() => navigate('/shopping')}
              className="rounded-xl bg-[#F68B1E] px-8 py-3.5 font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#E67A0C] hover:shadow-lg hover:shadow-orange-200/50"
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
    1: 'Informations de contact',
    2: 'Livraison',
    3: 'Confirmation & paiement',
  };

  const stepVariants = {
    enter: { opacity: 0, x: 16 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -16 },
  };

  /* ─── Rendu principal ─── */
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Header />

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h1 className="text-lg font-black text-[#282828] sm:text-xl">Finaliser votre commande</h1>
              <p className="text-xs text-gray-400">Étape {currentStep} sur 3</p>
            </div>
            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:flex">
              <ShieldCheck className="h-3.5 w-3.5" /> Paiement sécurisé
            </div>
          </div>
          <StepperBar currentStep={currentStep} />
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-4 py-6 pb-32 sm:px-6 lg:pb-12">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
          <div>
            {/* Mobile summary — collapsible */}
            <div className="mb-6 lg:hidden">
              <OrderSummaryPanel
                variant="collapsible"
                cartItems={cartItems}
                itemUnitPrice={itemUnitPrice}
                subtotal={subtotal}
                shippingFee={shippingFee}
                preview={preview}
                previewLoading={previewLoading}
                isOpen={summaryOpen}
                onToggle={() => setSummaryOpen(!summaryOpen)}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
              <div className="border-b border-gray-100 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F68B1E] text-sm font-black text-white">
                    {currentStep}
                  </div>
                  <h2 className="text-base font-black text-[#282828]">{stepTitles[currentStep]}</h2>
                </div>
              </div>

              <div className="p-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    variants={stepVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    {currentStep === 1 && (
                      <StepAddress
                        form={form}
                        setForm={setForm}
                        errors={errors}
                        geoStatus={geoStatus}
                        geoAddress={geoAddress}
                        onGeolocate={handleGeolocate}
                        addressQuery={addressQuery}
                        setAddressQuery={setAddressQuery}
                        addressSuggestions={addressSuggestions}
                        onSelectSuggestion={handleSelectSuggestion}
                      />
                    )}
                    {currentStep === 2 && (
                      <StepShipping
                        deliveryCalculation={deliveryCalculation}
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
                        geoAddress={geoAddress}
                        deliveryCalculation={deliveryCalculation}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={goBack}
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? 'Panier' : 'Retour'}
              </button>

              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex items-center gap-2 rounded-xl bg-[#F68B1E] px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200/40 transition-all hover:-translate-y-0.5 hover:bg-[#E67A0C] hover:shadow-xl hover:shadow-orange-200/50"
                >
                  Continuer
                </button>
              )}
            </div>
          </div>

          {/* Desktop summary — persistent, sticky */}
          <div className="hidden lg:sticky lg:top-8 lg:block">
            <OrderSummaryPanel
              variant="sticky"
              cartItems={cartItems}
              itemUnitPrice={itemUnitPrice}
              subtotal={subtotal}
              shippingFee={shippingFee}
              preview={preview}
              previewLoading={previewLoading}
            />
          </div>
        </div>
      </main>

      {/* Mobile bottom bar — total always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Total</p>
            <p className="text-base font-black text-[#F68B1E]">
              {previewLoading ? '...' : `${computedTotal.toLocaleString('fr-FR')} FCFA`}
            </p>
          </div>
          {currentStep < 3 ? (
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 rounded-xl bg-[#F68B1E] px-6 py-3 text-sm font-black text-white shadow-lg shadow-orange-200/40 transition-all hover:bg-[#E67A0C]"
            >
              Continuer
            </button>
          ) : (
            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={submitting || !acceptCGV}
              className={[
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all',
                submitting || !acceptCGV
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/40 hover:bg-[#E67A0C]',
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