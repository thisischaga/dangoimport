import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, User, Mail, Phone, Home, Navigation, Hash, Globe, MessageSquare,
  Truck, Zap, Crown, Leaf, ShieldCheck, Lock, CreditCard, Check, ChevronLeft,
  Sparkles, Package, Smartphone, BadgeCheck,
} from 'lucide-react';
import toast from '../utils/toast';
import QRCode from 'qrcode';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import { initiateFedapayCheckout, buildCartFedapayPayload } from '../services/fedapayCheckout';
import { fetchOrderQrTokens } from '../services/qrService';
import { getVendorDeliveryZonesByVendor } from '../api';

/* ─── Données des formules ─── */
const SHIPPING_PLANS = [
  {
    value: 'standard',
    label: 'Standard',
    tagline: 'Économique',
    price: 1500,
    priceLabel: '1 500 FCFA',
    delay: '3 à 7 jours ouvrés',
    color: 'emerald',
    icon: Leaf,
    features: [
      'Commandes regroupées par zone',
      'Tournées planifiées et optimisées',
      "Délai communiqué avant l'expédition",
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
    icon: Zap,
    features: [
      'Livreur dédié pour votre commande',
      'Traitement immédiat à la validation',
      "Prioritaire dans la file d'attente",
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
    icon: Crown,
    features: [
      'Livraison dans la journée garantie',
      'Livreur exclusivement dédié',
      'Livraison de nuit possible',
      'Assistance téléphonique incluse',
    ],
  },
];

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
function OrderSummaryPanel({ cartItems, itemUnitPrice, subtotal, shippingFee, shippingMethod, preview, previewLoading, variant = 'sticky', isOpen, onToggle }) {
  const plan = SHIPPING_PLANS.find((p) => p.value === shippingMethod);
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
    'w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200',
    hasError
      ? 'border-red-300 bg-red-50/50 focus:border-red-300'
      : 'border-gray-100 bg-gray-50/50 focus:border-orange-200 focus:bg-white focus:shadow-sm focus:ring-4 focus:ring-orange-50',
  ].join(' ');

const FIELD_ICONS = { firstName: User, lastName: User, email: Mail, phone: Phone };

/* ─── Step 1 : Adresse de livraison ─── */
function StepAddress({ form, setForm, errors, savedAddresses, selectedAddressId, handleSelectAddress }) {
  const fields = [
    { key: 'firstName', label: 'Prénom', required: true },
    { key: 'lastName', label: 'Nom', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'phone', label: 'Téléphone', type: 'tel', required: true },
  ];

  return (
    <div className="space-y-6">
      {savedAddresses.length > 0 && (
        <div>
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Adresses enregistrées</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {savedAddresses.map((address) => {
              const id = address._id || address.id || 'default';
              const isActive = selectedAddressId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleSelectAddress(address)}
                  className={[
                    'group rounded-xl border-2 p-4 text-left transition-all duration-200',
                    isActive
                      ? 'border-[#F68B1E] bg-gradient-to-br from-orange-50 to-amber-50/30 shadow-sm'
                      : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-sm',
                  ].join(' ')}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="mb-1 flex items-center gap-2">
                        <MapPin className={`h-3.5 w-3.5 ${isActive ? 'text-[#F68B1E]' : 'text-gray-300'}`} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {address.label || 'Adresse'}
                        </span>
                        {address.isDefault && (
                          <span className="rounded-full bg-[#F68B1E] px-2 py-0.5 text-[9px] font-bold text-white">Défaut</span>
                        )}
                      </div>
                      <p className="text-sm font-bold text-[#282828]">{address.city}</p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-gray-500">{address.fullAddress}</p>
                    </div>
                    <div
                      className={[
                        'mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                        isActive ? 'border-[#F68B1E] bg-[#F68B1E]' : 'border-gray-300',
                      ].join(' ')}
                    >
                      {isActive && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div>
        {savedAddresses.length > 0 && (
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-500">Ou renseigner manuellement</p>
        )}
        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
          {fields.map(({ key, label, type = 'text', required }) => (
            <IconField key={key} icon={FIELD_ICONS[key]} label={label} required={required} error={errors[key]}>
              <input
                type={type}
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                className={inputBaseCls(!!errors[key])}
                placeholder={label}
              />
            </IconField>
          ))}

          <IconField icon={Globe} label="Pays" required>
            <select
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              className={inputBaseCls(false) + ' cursor-pointer appearance-none'}
            >
              <option>Togo</option>
              <option>Bénin</option>
            </select>
          </IconField>

          <IconField icon={MapPin} label="Ville" required error={errors.city}>
            <input
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              className={inputBaseCls(!!errors.city)}
              placeholder="Ville"
            />
          </IconField>

          <IconField icon={Navigation} label="Quartier">
            <input
              value={form.neighborhood}
              onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
              className={inputBaseCls(false)}
              placeholder="Quartier"
            />
          </IconField>

          <IconField icon={Hash} label="Code postal">
            <input
              value={form.postalCode}
              onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
              className={inputBaseCls(false)}
              placeholder="Code postal"
            />
          </IconField>

          <div className="sm:col-span-2">
            <IconField icon={Home} label="Adresse complète" required error={errors.fullAddress}>
              <input
                value={form.fullAddress}
                onChange={(e) => setForm({ ...form, fullAddress: e.target.value })}
                className={inputBaseCls(!!errors.fullAddress)}
                placeholder="Numéro, rue, bâtiment..."
              />
            </IconField>
          </div>

          <div className="sm:col-span-2">
            <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Instructions de livraison
            </label>
            <div className="relative">
              <textarea
                rows="2"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                className="w-full resize-none rounded-xl border-2 border-gray-100 bg-gray-50/50 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200 focus:border-orange-200 focus:bg-white focus:ring-4 focus:ring-orange-50"
                placeholder="Bâtiment, code d'accès, remarques..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Step 2 : Formule de livraison ─── */
function StepShipping({ shippingMethod, setShippingMethod, vendorZonesByVendor = {}, selectedZonesByVendor = {}, onSelectZone }) {
  const colorMap = {
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700', iconWrap: 'bg-emerald-100 text-emerald-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', badge: 'bg-amber-100 text-amber-700', iconWrap: 'bg-amber-100 text-amber-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700', iconWrap: 'bg-purple-100 text-purple-600' },
  };

  const vendorGroups = Object.entries(vendorZonesByVendor).map(([vendorId, zones]) => ({
    vendorId,
    vendorName: zones?.[0]?.vendorName || 'Vendeur',
    zones: Array.isArray(zones) ? zones : [],
  }));

  return (
    <div className="space-y-4">
      <p className="mb-2 text-sm text-gray-500">Choisissez le mode d'acheminement de votre commande.</p>

      {vendorGroups.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
          <p className="text-[11px] font-black uppercase tracking-[0.12em] text-gray-500">Zones de livraison vendeur</p>
          {vendorGroups.map(({ vendorId, vendorName, zones }) => (
            <div key={vendorId} className="space-y-2">
              <p className="text-sm font-bold text-[#282828]">{vendorName}</p>
              {zones.map((zone) => {
                const isSelected = selectedZonesByVendor[vendorId]?._id === zone._id;
                const fee = Number(zone.deliveryFee || zone.fee || 0);
                const summary = `${zone.zoneName || zone.country || 'Zone'}${zone.city ? ` • ${zone.city}` : ''}${fee > 0 ? ` • ${fee.toLocaleString('fr-FR')} F` : ' • Gratuit'}`;
                return (
                  <button
                    key={`${vendorId}-${zone._id || zone.zoneName || zone.city}`}
                    type="button"
                    onClick={() => onSelectZone(vendorId, zone)}
                    className={[
                      'flex w-full items-center justify-between gap-4 rounded-xl border-2 px-3 py-2 text-left transition-all',
                      isSelected ? 'border-[#F68B1E] bg-white shadow-sm' : 'border-gray-200 bg-white hover:border-gray-300',
                    ].join(' ')}
                  >
                    <div>
                      <p className="text-sm font-bold text-[#282828]">{zone.zoneName || zone.country || 'Zone'}</p>
                      <p className="text-[11px] text-gray-500">{summary}</p>
                    </div>
                    <span className={['inline-flex h-5 w-5 items-center justify-center rounded-full border-2', isSelected ? 'border-[#F68B1E] bg-[#F68B1E]' : 'border-gray-300'].join(' ')}>
                      {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        {SHIPPING_PLANS.map((plan) => {
          const isSelected = shippingMethod === plan.value;
          const colors = colorMap[plan.color];
          const Icon = plan.icon;

          return (
            <button
              key={plan.value}
              type="button"
              onClick={() => setShippingMethod(plan.value)}
              className={[
                'group w-full overflow-hidden rounded-2xl border-2 text-left transition-all duration-300',
                isSelected ? 'border-[#F68B1E] shadow-lg shadow-orange-100/40' : 'border-gray-100 hover:border-gray-200 hover:shadow-sm',
              ].join(' ')}
            >
              <div className="flex items-center gap-4 px-5 py-4">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${colors.iconWrap}`}>
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-black text-[#282828]">{plan.label}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${colors.badge}`}>
                      {plan.tagline}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{plan.delay}</p>
                </div>

                <div className="shrink-0 text-right">
                  <span className={`text-base font-black ${plan.price === 0 ? 'text-emerald-600' : 'text-[#282828]'}`}>
                    {plan.priceLabel}
                  </span>
                </div>

                <div
                  className={[
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                    isSelected ? 'border-[#F68B1E] bg-[#F68B1E]' : 'border-gray-300 group-hover:border-gray-400',
                  ].join(' ')}
                >
                  {isSelected && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                </div>
              </div>

              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isSelected ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-5 pb-4 pt-0">
                  <div className={`rounded-xl ${colors.bg} p-3`}>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {plan.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs text-gray-600">
                          <Check className={`mt-0.5 h-3 w-3 shrink-0 ${colors.text}`} strokeWidth={3} />
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
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">Récapitulatif</p>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]"><MapPin className="h-3.5 w-3.5" /></div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-[#282828]">Livraison à</p>
              <p className="text-xs text-gray-500">
                {form.fullAddress}{form.city ? `, ${form.city}` : ''}{form.country ? ` — ${form.country}` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]"><Truck className="h-3.5 w-3.5" /></div>
            <div>
              <p className="text-xs font-bold text-[#282828]">Mode de livraison</p>
              <p className="text-xs text-gray-500">{plan?.label || 'Standard'} {plan?.delay}</p>
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
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [paymentMethod] = useState('fedapay');
  const [vendorZonesByVendor, setVendorZonesByVendor] = useState({});
  const [selectedZonesByVendor, setSelectedZonesByVendor] = useState({});
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

  useEffect(() => {
    const vendorIds = [...new Set(
      cartItems
        .map((item) => item.vendorId || item.vendor_id || item.sellerId || item.vendor)
        .filter(Boolean)
    )];

    if (!vendorIds.length) {
      setVendorZonesByVendor({});
      setSelectedZonesByVendor({});
      return undefined;
    }

    let cancelled = false;

    Promise.all(
      vendorIds.map(async (vendorId) => {
        try {
          const response = await getVendorDeliveryZonesByVendor(vendorId);
          return { vendorId, zones: Array.isArray(response?.data) ? response.data : [] };
        } catch (error) {
          return { vendorId, zones: [] };
        }
      })
    )
      .then((results) => {
        if (cancelled) return;
        const nextVendorZones = {};
        results.forEach(({ vendorId, zones }) => {
          if (zones.length) nextVendorZones[vendorId] = zones;
        });
        setVendorZonesByVendor(nextVendorZones);

        setSelectedZonesByVendor((prev) => {
          const next = { ...prev };
          Object.entries(nextVendorZones).forEach(([vendorId, zones]) => {
            if (!next[vendorId]) {
              const preferred = zones.find((zone) => zone.isDefault || Number(zone.deliveryFee || zone.fee || 0) === 0) || zones[0];
              if (preferred) next[vendorId] = preferred;
            }
          });
          return next;
        });
      })
      .catch(() => {
        if (!cancelled) {
          setVendorZonesByVendor({});
          setSelectedZonesByVendor({});
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cartItems]);

  const shippingFee = useMemo(() => {
    const zoneFees = Object.values(selectedZonesByVendor).reduce((sum, zone) => sum + Number(zone?.deliveryFee || zone?.fee || 0), 0);
    if (zoneFees > 0 || Object.keys(vendorZonesByVendor).length > 0) {
      return zoneFees;
    }
    return SHIPPING_PLANS.find((p) => p.value === shippingMethod)?.price ?? 0;
  }, [selectedZonesByVendor, shippingMethod, vendorZonesByVendor]);

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
    1: 'Adresse de livraison',
    2: 'Formule de livraison',
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
                shippingMethod={shippingMethod}
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
                        savedAddresses={savedAddresses}
                        selectedAddressId={selectedAddressId}
                        handleSelectAddress={handleSelectAddress}
                      />
                    )}
                    {currentStep === 2 && (
                      <StepShipping
                        shippingMethod={shippingMethod}
                        setShippingMethod={setShippingMethod}
                        vendorZonesByVendor={vendorZonesByVendor}
                        selectedZonesByVendor={selectedZonesByVendor}
                        onSelectZone={(vendorId, zone) => setSelectedZonesByVendor((prev) => ({ ...prev, [vendorId]: zone }))}
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
              shippingMethod={shippingMethod}
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