import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  User,
  Mail,
  Phone,
  Truck,
  ShieldCheck,
  Lock,
  CreditCard,
  Check,
  ChevronLeft,
  Smartphone,
  BadgeCheck,
  LocateFixed,
  AlertCircle,
  X,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

import toast from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';

import {
  initiateFedapayCheckout,
  buildCartFedapayPayload,
} from '../services/fedapayCheckout';

import { calculateDeliveryOptions } from '../api';
import { io as socketIOClient } from 'socket.io-client';


// ============================================================
// CONSTANTES
// ============================================================

const STEPS = [
  { id: 1, label: 'Adresse', icon: MapPin },
  { id: 2, label: 'Livraison', icon: Truck },
  { id: 3, label: 'Paiement', icon: CreditCard },
];

const GEO_STATUS = {
  idle: 'idle',
  loading: 'loading',
  success: 'success',
  error: 'error',
};

const SUCCESS_STATUSES = [
  'approved',
  'completed',
  'paid',
  'successful',
  'success',
];

const FAILED_STATUSES = [
  'failed',
  'cancelled',
  'canceled',
  'error',
  'declined',
];


// ============================================================
// STEPPER
// ============================================================

function StepperBar({ currentStep }) {
  return (
    <div className="w-full">
      <div className="relative flex items-center justify-between">

        <div className="absolute left-0 right-0 top-5 mx-9 h-[3px] rounded-full bg-gray-100 sm:mx-10" />

        <motion.div
          initial={false}
          animate={{
            width: ((currentStep - 1) / (STEPS.length - 1)) * 100 + '%',
          }}
          transition={{
            duration: 0.5,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="absolute left-0 top-5 mx-9 h-[3px] rounded-full bg-gradient-to-r from-[#F68B1E] to-[#FFA94D] sm:mx-10"
          style={{
            maxWidth: 'calc(100% - 2.25rem)',
          }}
        />

        {STEPS.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center gap-2"
            >
              <motion.div
                animate={
                  isActive
                    ? { scale: [1, 1.08, 1] }
                    : { scale: 1 }
                }
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
                {isCompleted ? (
                  <Check
                    className="h-4 w-4"
                    strokeWidth={3}
                  />
                ) : (
                  <Icon
                    className="h-4 w-4"
                    strokeWidth={2.5}
                  />
                )}
              </motion.div>

              <span
                className={[
                  'text-[11px] font-bold tracking-wide transition-colors duration-300',

                  isActive
                    ? 'text-[#F68B1E]'
                    : isCompleted
                    ? 'text-[#282828]'
                    : 'text-gray-300',
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


// ============================================================
// PAYMENT RESULT MODAL
// ============================================================

function PaymentResultModal({
  open,
  status,
  onClose,
}) {
  if (!open) return null;

  const success = status === 'success';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">

        <motion.div
          initial={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            scale: 0.92,
            y: 20,
          }}
          transition={{
            duration: 0.25,
            ease: 'easeOut',
          }}
          className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl"
        >

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200"
            aria-label="Fermer"
          >
            <X className="h-4 w-4" />
          </button>


          {/* Content */}
          <div className="px-6 pb-7 pt-9 text-center sm:px-8">

            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.1,
                type: 'spring',
                stiffness: 220,
                damping: 14,
              }}
              className={[
                'mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full',

                success
                  ? 'bg-emerald-50'
                  : 'bg-red-50',
              ].join(' ')}
            >
              {success ? (
                <CheckCircle2
                  className="h-12 w-12 text-emerald-500"
                  strokeWidth={2}
                />
              ) : (
                <XCircle
                  className="h-12 w-12 text-red-500"
                  strokeWidth={2}
                />
              )}
            </motion.div>


            {/* Title */}
            <h2 className="text-2xl font-black text-[#282828]">
              {success
                ? 'Merci pour votre commande !'
                : 'Paiement échoué'}
            </h2>


            {/* Message */}
            <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
              {success
                ? 'Votre paiement a été confirmé. Votre commande est maintenant prise en charge.'
                : 'Votre paiement n’a pas pu être confirmé. Aucun montant ne doit être considéré comme validé par Dango Import.'}
            </p>


            {/* Success message */}
            {success && (
              <div className="mt-6 space-y-3 text-left">
                <div className="rounded-2xl bg-emerald-50 px-4 py-4 text-sm font-medium text-emerald-700">
                  Votre commande a bien été enregistrée.
                </div>
                <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-900">
                  <p className="font-bold m-0">Email de confirmation</p>
                  <p className="mt-1 mb-0 leading-relaxed">
                    Un email avec vos codes QR et le détail de votre commande vient de vous être envoyé.
                    Vérifiez votre boîte mail et vos spams.
                  </p>
                </div>
              </div>
            )}


            {/* Failed message */}
            {!success && (
              <div className="mt-6 rounded-2xl bg-red-50 px-4 py-4 text-sm font-medium text-red-700">
                Vous pouvez réessayer le paiement.
              </div>
            )}


            {/* Button */}
            <button
              type="button"
              onClick={onClose}
              className={[
                'mt-6 w-full rounded-xl py-3.5 text-sm font-black text-white transition',

                success
                  ? 'bg-[#F68B1E] hover:bg-[#E67A0C]'
                  : 'bg-gray-900 hover:bg-gray-800',
              ].join(' ')}
            >
              {success
                ? 'Continuer'
                : 'Retour au paiement'}
            </button>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}


// ============================================================
// ORDER SUMMARY
// ============================================================

function OrderSummaryPanel({
  cartItems,
  itemUnitPrice,
  subtotal,
  shippingFee,
  preview,
  previewLoading,
  variant = 'sticky',
  isOpen,
  onToggle,
}) {
  const discount = Number(preview?.discount || 0);

  const total =
    Number(preview?.subtotal ?? subtotal) +
    shippingFee -
    discount;

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
            <p className="text-xs font-medium text-gray-500">
              Résumé de commande
            </p>

            <p className="text-sm font-black text-[#282828]">
              {cartItems.length} article
              {cartItems.length > 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-base font-black text-[#F68B1E]">
              {previewLoading
                ? '...'
                : `${total.toLocaleString('fr-FR')} FCFA`}
            </span>

            <span className="text-xs font-bold text-gray-400">
              {isOpen ? 'Masquer' : 'Afficher'}
            </span>
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 border-b border-gray-100 px-5 py-4">
          <div>
            <p className="text-sm font-black text-[#282828]">
              Résumé de commande
            </p>

            <p className="text-xs text-gray-400">
              {cartItems.length} article
              {cartItems.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>
      )}


      <div
        className={
          collapsible
            ? `overflow-hidden transition-all duration-300 ${
                isOpen
                  ? 'max-h-[600px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`
            : ''
        }
      >

        <div
          className={
            collapsible
              ? 'border-t border-gray-100 px-5 pb-5'
              : 'px-5 pb-5'
          }
        >

          {/* Products */}
          <div className="mt-4 max-h-[220px] space-y-3 overflow-y-auto pr-1">

            {cartItems.map((item) => (
              <div
                key={item._id || item.id}
                className="flex items-center gap-3"
              >

                <div className="relative shrink-0">

                  <img
                    src={
                      item.image ||
                      item.images?.[0]?.url
                    }
                    alt={item.name}
                    className="h-12 w-12 rounded-xl border border-gray-100 bg-gray-50 object-cover"
                  />

                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#F68B1E] px-1 text-[9px] font-black text-white ring-2 ring-white">
                    {item.quantity}
                  </span>

                </div>

                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-xs font-bold text-[#282828]">
                    {item.name}
                  </p>

                  <p className="text-[11px] text-gray-400">
                    Qté : {item.quantity}
                  </p>
                </div>

                <p className="shrink-0 text-xs font-black text-[#282828]">
                  {(
                    itemUnitPrice(item) *
                    Number(item.quantity || 1)
                  ).toLocaleString('fr-FR')}{' '}
                  F
                </p>

              </div>
            ))}

          </div>


          {/* Totals */}
          <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Sous-total
              </span>

              <span className="font-semibold text-[#282828]">
                {subtotal.toLocaleString('fr-FR')} F
              </span>
            </div>


            <div className="flex justify-between text-sm">
              <span className="text-gray-500">
                Livraison
              </span>

              <span
                className={
                  shippingFee === 0 && !previewLoading
                    ? 'font-black text-emerald-600'
                    : 'font-semibold text-[#282828]'
                }
              >
                {previewLoading
                  ? 'Calcul en cours...'
                  : shippingFee === 0
                  ? 'Gratuite'
                  : `${shippingFee.toLocaleString('fr-FR')} F`}
              </span>
            </div>


            {discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">
                  Réduction
                </span>

                <span className="font-bold text-emerald-600">
                  −{discount.toLocaleString('fr-FR')} F
                </span>
              </div>
            )}

          </div>


          {/* Total */}
          <div className="mt-4 flex items-center justify-between rounded-xl bg-gradient-to-br from-orange-50 to-amber-50/40 px-4 py-3">

            <span className="text-sm font-bold text-gray-600">
              Total
            </span>

            <span className="text-lg font-black text-[#F68B1E]">
              {previewLoading
                ? '...'
                : `${total.toLocaleString('fr-FR')} FCFA`}
            </span>

          </div>


          {!collapsible && (
            <div className="mt-5 space-y-2.5 border-t border-gray-100 pt-4 text-[11px] text-gray-500">

              <div className="flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Paiement 100% sécurisé
              </div>

              <div className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Données chiffrées de bout en bout
              </div>

              <div className="flex items-center gap-2">
                <Smartphone className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                Mobile Money & cartes acceptés
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}


// ============================================================
// ICON FIELD
// ============================================================

function IconField({
  icon: Icon,
  label,
  required,
  error,
  children,
}) {
  return (
    <div>

      <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
        {label}

        {required && (
          <span className="ml-0.5 text-[#F68B1E]">
            *
          </span>
        )}
      </label>

      <div className="relative">

        <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />

        {children}

      </div>

      {error && (
        <p className="mt-1 text-[11px] font-medium text-red-500">
          {error}
        </p>
      )}

    </div>
  );
}


const inputBaseCls = (hasError) =>
  [
    'w-full rounded-xl border-2 py-3 pl-10 pr-4 text-sm font-medium outline-none transition-all duration-200',

    hasError
      ? 'border-red-300 bg-red-50/50'
      : 'border-gray-100 bg-gray-50/50 focus:bg-white',
  ].join(' ');


const FIELD_ICONS = {
  firstName: User,
  lastName: User,
  email: Mail,
  phone: Phone,
};


// ============================================================
// STEP ADDRESS
// ============================================================

function StepAddress({
  form,
  setForm,
  errors,
  geoStatus,
  geoAddress,
  onGeolocate,
  addressQuery,
  setAddressQuery,
  addressSuggestions,
  onSelectSuggestion,
}) {
  const contactFields = [
    {
      key: 'firstName',
      label: 'Prénom',
      required: true,
    },
    {
      key: 'lastName',
      label: 'Nom',
      required: true,
    },
    {
      key: 'email',
      label: 'Email',
      type: 'email',
      required: true,
    },
    {
      key: 'phone',
      label: 'Téléphone',
      type: 'tel',
      required: true,
    },
    {
      key: 'country',
      label: 'Pays',
      type: 'select',
      required: true,
      options: [
        {
          value: '',
          label: 'Sélectionnez un pays',
        },
        {
          value: 'Bénin',
          label: 'Bénin',
        },
        {
          value: 'Togo',
          label: 'Togo',
        },
      ],
    },
  ];

  const geoLoading =
    geoStatus === GEO_STATUS.loading;

  return (
    <div className="space-y-6">

      {/* Contact */}
      <div>

        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-400">
          Informations de contact
        </p>

        <div className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">

          {contactFields.map(
            ({
              key,
              label,
              type = 'text',
              required,
              options,
            }) => (
              <IconField
                key={key}
                icon={
                  FIELD_ICONS[key] || MapPin
                }
                label={label}
                required={required}
                error={errors[key]}
              >

                {type === 'select' ? (
                  <select
                    value={form[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    className={inputBaseCls(
                      !!errors[key]
                    )}
                  >
                    {options?.map((option) => (
                      <option
                        key={
                          option.value || 'empty'
                        }
                        value={option.value}
                      >
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={type}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        [key]: e.target.value,
                      })
                    }
                    className={inputBaseCls(
                      !!errors[key]
                    )}
                    placeholder={label}
                  />
                )}

              </IconField>
            )
          )}

        </div>
      </div>


      {/* Location */}
      <div>

        <p className="mb-3 text-[11px] font-black uppercase tracking-wider text-gray-400">
          Position de livraison
        </p>

        <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-wider text-gray-500">
          Rechercher une adresse
        </label>

        <div className="relative flex items-center">

          <MapPin className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-300" />

          <input
            type="text"
            value={addressQuery}
            onChange={(e) =>
              setAddressQuery(e.target.value)
            }
            className={inputBaseCls(
              !!errors.location
            )}
            placeholder="Ex. Cotonou, Rue du 7 novembre..."
            style={{
              paddingLeft: '2.75rem',
              paddingRight: '10rem',
            }}
          />


          <div className="absolute right-2 top-1/2 -translate-y-1/2">

            <button
              type="button"
              onClick={onGeolocate}
              disabled={geoLoading}
              className={[
                'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-white transition',

                geoLoading
                  ? 'cursor-wait bg-blue-400'
                  : 'bg-blue-500 hover:bg-blue-600',
              ].join(' ')}
            >

              <LocateFixed className="h-4 w-4" />

              {geoLoading
                ? 'Localisation...'
                : 'Ma position'}

            </button>

          </div>
        </div>


        {/* Suggestions */}
        {addressSuggestions.length > 0 && (
          <div className="mt-2 max-h-52 overflow-auto rounded-2xl border border-gray-100 bg-white shadow-sm">

            {addressSuggestions.map(
              (suggestion) => (
                <button
                  key={`${suggestion.place_id}-${suggestion.display_name}`}
                  type="button"
                  onClick={() =>
                    onSelectSuggestion(
                      suggestion
                    )
                  }
                  className="flex w-full flex-col border-b border-gray-100 px-3 py-2.5 text-left transition hover:bg-orange-50/60 last:border-b-0"
                >

                  <span className="text-sm font-semibold text-[#282828]">
                    {suggestion.display_name}
                  </span>

                  <span className="mt-0.5 text-[11px] text-gray-500">
                    {suggestion.type || 'Adresse'}
                  </span>

                </button>
              )
            )}

          </div>
        )}


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


// ============================================================
// STEP SHIPPING
// ============================================================

function StepShipping({
  deliveryCalculation,
}) {
  const groups =
    Array.isArray(
      deliveryCalculation?.groups
    ) &&
    deliveryCalculation.groups.length
      ? deliveryCalculation.groups
      : null;

  const overallProvider =
    deliveryCalculation?.provider || null;

  return (
    <div className="space-y-5">

      <div className="space-y-2">

        <p className="text-[11px] font-black uppercase tracking-wider text-gray-400">
          Prise en charge de la livraison
        </p>

        {deliveryCalculation ? (
          groups ? (

            <div className="space-y-2">

              {groups.map((group, index) => {

                const isSeller =
                  group.provider === 'SELLER';

                return (
                  <div
                    key={index}
                    className={[
                      'flex items-start gap-3 rounded-2xl border p-4',

                      isSeller
                        ? 'border-blue-100 bg-blue-50/60'
                        : 'border-orange-100 bg-orange-50/60',
                    ].join(' ')}
                  >

                    <div
                      className={[
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',

                        isSeller
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-orange-100 text-[#F68B1E]',
                      ].join(' ')}
                    >
                      <Truck className="h-4 w-4" />
                    </div>


                    <div className="min-w-0 flex-1">

                      <p className="text-sm font-black text-[#282828]">
                        {isSeller
                          ? 'Livraison par le vendeur'
                          : 'Livraison par Dango Import'}
                      </p>

                      <p className="text-xs text-gray-500">
                        {group.storeName ||
                          'Vendeur'}

                        {group.estimatedDeliveryTime && (
                          <>
                            {' '}
                            •{' '}
                            {
                              group.estimatedDeliveryTime
                            }
                          </>
                        )}
                      </p>

                      {!isSeller &&
                        !group.sellerDeliveryAvailable && (
                          <p className="mt-1 text-[11px] text-gray-400">
                            Adresse hors zone vendeur —
                            Dango Import prend le relais
                            automatiquement.
                          </p>
                        )}

                    </div>


                    <BadgeCheck
                      className={[
                        'h-4 w-4 shrink-0',

                        isSeller
                          ? 'text-blue-500'
                          : 'text-[#F68B1E]',
                      ].join(' ')}
                    />

                  </div>
                );
              })}

            </div>

          ) : (

            <div
              className={[
                'flex items-start gap-3 rounded-2xl border p-4',

                overallProvider === 'SELLER'
                  ? 'border-blue-100 bg-blue-50/60'
                  : 'border-orange-100 bg-orange-50/60',
              ].join(' ')}
            >

              <div
                className={[
                  'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl',

                  overallProvider === 'SELLER'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-orange-100 text-[#F68B1E]',
                ].join(' ')}
              >
                <Truck className="h-4 w-4" />
              </div>


              <div className="min-w-0 flex-1">

                <p className="text-sm font-black text-[#282828]">
                  {overallProvider === 'SELLER'
                    ? 'Livraison par le vendeur'
                    : 'Livraison par Dango Import'}
                </p>

                <p className="text-xs text-gray-500">
                  Déterminé automatiquement selon
                  votre adresse
                </p>

              </div>


              <BadgeCheck
                className={[
                  'h-4 w-4 shrink-0',

                  overallProvider === 'SELLER'
                    ? 'text-blue-500'
                    : 'text-[#F68B1E]',
                ].join(' ')}
              />

            </div>
          )

        ) : (

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


// ============================================================
// STEP PAYMENT
// ============================================================

function StepPayment({
  acceptCGV,
  setAcceptCGV,
  submitting,
  handlePlaceOrder,
  computedTotal,
  previewLoading,
  form,
  geoAddress,
  deliveryCalculation,
}) {
  const provider =
    deliveryCalculation?.provider;
  const isCalculating = previewLoading;

  return (
    <div className="space-y-6">

      {/* Summary */}
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-5">

        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-400">
          Récapitulatif
        </p>

        <div className="space-y-3">

          <div className="flex items-start gap-3">

            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]">
              <MapPin className="h-3.5 w-3.5" />
            </div>

            <div className="min-w-0">

              <p className="text-xs font-bold text-[#282828]">
                Position de livraison
              </p>

              <p className="text-xs text-gray-500">
                {geoAddress ||
                  (form.lat
                    ? `${form.lat.toFixed(
                        5
                      )}, ${form.lng.toFixed(5)}`
                    : 'Non définie')}
              </p>

            </div>

          </div>


          <div className="flex items-start gap-3">

            <div className="mt-0.5 rounded-lg bg-orange-50 p-1.5 text-[#F68B1E]">
              <Truck className="h-3.5 w-3.5" />
            </div>

            <div>

              <p className="text-xs font-bold text-[#282828]">
                Responsable de livraison
              </p>

              <p className="text-xs text-gray-500">
                {provider === 'SELLER'
                  ? 'Le vendeur'
                  : provider === 'HYBRID'
                  ? 'Vendeur + Dango Import'
                  : 'Dango Import'}
              </p>

            </div>

          </div>

        </div>
      </div>


      {/* Secure payment */}
      <div className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50/50 px-4 py-3 text-gray-400">

        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Sécurisé
        </div>

        <span className="text-gray-200">
          •
        </span>

        <div className="flex items-center gap-1.5 text-[11px] font-bold">
          <Smartphone className="h-4 w-4 text-gray-400" />
          Mobile Money
        </div>

      </div>


      {/* CGV */}
      <label className="group flex cursor-pointer select-none items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/50 p-4 transition hover:bg-gray-50">

        <input
          type="checkbox"
          checked={acceptCGV}
          onChange={(e) =>
            setAcceptCGV(e.target.checked)
          }
          className="mt-1 h-5 w-5 rounded accent-[#F68B1E]"
        />

        <span className="text-sm leading-relaxed text-gray-600">
          J'ai lu et j'accepte les conditions
          générales de vente de Dango Import.
        </span>

      </label>


      {/* Payment button */}
      <button
        type="button"
        onClick={handlePlaceOrder}
        disabled={
          submitting || !acceptCGV || isCalculating
        }
        className={[
          'group relative w-full overflow-hidden rounded-xl py-4 text-sm font-black tracking-wide transition-all duration-200',

          submitting || !acceptCGV || isCalculating
            ? 'cursor-not-allowed bg-gray-200 text-gray-400'
            : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/50 hover:-translate-y-0.5 hover:bg-[#E67A0C]',
        ].join(' ')}
      >

        <span className="relative z-10 inline-flex items-center justify-center gap-2">

          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              Redirection vers le paiement...
            </>
          ) : isCalculating ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-500" />
              Calcul en cours...
            </>
          ) : (
            <>
              <Lock className="h-4 w-4" />
              Confirmer et payer{' '}
              {previewLoading
                ? '...'
                : `${computedTotal.toLocaleString(
                    'fr-FR'
                  )} FCFA`}
            </>
          )}

        </span>

        {!(
          submitting || !acceptCGV || isCalculating
        ) && (
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
        )}

      </button>


      <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">

        <Lock className="h-3 w-3" />

        Paiement sécurisé via FedaPay

      </p>

    </div>
  );
}


// ============================================================
// CHECKOUT PRINCIPAL
// ============================================================

export default function Checkout() {

  const navigate = useNavigate();

  const {
    cart: cartItems = [],
    clearCart,
  } = useCart();


  // ----------------------------------------------------------
  // AUTH
  // ----------------------------------------------------------

  const clearSession = useCallback(() => {
    localStorage.removeItem('dangoToken');
    localStorage.removeItem('dangoUser');
  }, []);


  const redirectToLogin =
    useCallback(() => {
      clearSession();

      navigate('/login', {
        state: {
          from: '/checkout',
        },
      });
    }, [
      clearSession,
      navigate,
    ]);


  // ----------------------------------------------------------
  // STATE
  // ----------------------------------------------------------

  const [currentStep, setCurrentStep] =
    useState(1);

  const [submitting, setSubmitting] =
    useState(false);

  const [previewLoading, setPreviewLoading] =
    useState(false);

  const [acceptCGV, setAcceptCGV] =
    useState(false);

  const [errors, setErrors] =
    useState({});

  const [preview, setPreview] =
    useState(null);

  const [promoCode] = useState(
    () =>
      localStorage.getItem(
        'dangoPromoCode'
      ) || ''
  );

  const [summaryOpen, setSummaryOpen] =
    useState(false);

  const [
    deliveryCalculation,
    setDeliveryCalculation,
  ] = useState(null);


  // ----------------------------------------------------------
  // GEOLOCATION
  // ----------------------------------------------------------

  const [geoStatus, setGeoStatus] =
    useState(GEO_STATUS.idle);

  const [geoAddress, setGeoAddress] =
    useState('');

  const [addressQuery, setAddressQuery] =
    useState('');

  const [
    addressSuggestions,
    setAddressSuggestions,
  ] = useState([]);


  // ----------------------------------------------------------
  // PAYMENT RESULT
  // ----------------------------------------------------------

  const [paymentResult, setPaymentResult] =
    useState(null);

  const [paymentResultOpen, setPaymentResultOpen] =
    useState(false);

  const [socket, setSocket] = useState(null);


  // ----------------------------------------------------------
  // FORM
  // ----------------------------------------------------------

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    country: '',
    lat: null,
    lng: null,
    addressQuery: '',
  });


  // ==========================================================
  // DELIVERY CALCULATION
  // ==========================================================

  useEffect(() => {
    if (!cartItems.length) {
      return;
    }

    let cancelled = false;

    const clientLocation =
      form.lat !== null && form.lng !== null
        ? {
            lat: Number(form.lat),
            lng: Number(form.lng),
          }
        : null;

    const run = async () => {
      setPreviewLoading(true);
      try {
        const response = await calculateDeliveryOptions({
          items: cartItems,
          clientLocation,
        });

        if (!cancelled && response?.data) {
          setDeliveryCalculation(response.data);
        }

        const token = localStorage.getItem('dangoToken');
        if (token) {
          const previewRes = await fetch(`${API_BASE_URL}/orders/preview`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              items: cartItems.map((it) => ({
                productId: it.productId || it._id || it.id,
                quantity: it.quantity,
              })),
              clientLocation,
              promoCode,
            }),
          });
          if (!cancelled && previewRes.ok) {
            const previewData = await previewRes.json();
            if (previewData.success && previewData.data) {
              setPreview(previewData.data);
            }
          }
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Erreur calcul livraison / preview:', error?.message || error);
        }
      } finally {
        if (!cancelled) {
          setPreviewLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [
    cartItems,
    form.lat,
    form.lng,
    promoCode,
  ]);


  // ==========================================================
  // GEOLOCATION
  // ==========================================================

  const setLocationFromCoordinates =
    useCallback(
      async (
        latitude,
        longitude,
        displayName
      ) => {

        setForm((previous) => ({
          ...previous,
          lat: Number(latitude),
          lng: Number(longitude),
        }));


        setGeoStatus(
          GEO_STATUS.success
        );


        const fallbackAddress =
          `${Number(latitude).toFixed(
            5
          )}, ${Number(longitude).toFixed(5)}`;


        const resolvedAddress =
          displayName ||
          fallbackAddress;


        setGeoAddress(
          resolvedAddress
        );

        setAddressQuery(
          resolvedAddress
        );


        // Reverse geocoding
        if (!displayName) {

          try {

            const response =
              await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                  headers: {
                    'Accept-Language':
                      'fr',
                  },
                }
              );


            if (response.ok) {

              const data =
                await response.json();

              const nextAddress =
                data?.display_name ||
                fallbackAddress;


              setGeoAddress(
                nextAddress
              );

              setAddressQuery(
                nextAddress
              );
            }

          } catch (error) {

            console.warn(
              'Reverse geocoding indisponible:',
              error
            );

          }
        }

        // If a socket is available, ask the server to recalc delivery
        try {
          if (socket && socket.connected && Array.isArray(cartItems) && cartItems.length) {
            console.log('[Checkout] emitting calculate_delivery_for_user', { lat: Number(latitude), lng: Number(longitude), items: cartItems.length });
            socket.emit('calculate_delivery_for_user', {
              lat: Number(latitude),
              lng: Number(longitude),
              items: cartItems,
            });
          }
        } catch (err) {
          // ignore
        }
      },
      [socket, cartItems]
    );


  // ----------------------------------------------------------
  // Manual geolocation
  // ----------------------------------------------------------

  const handleGeolocate =
    useCallback(() => {

      if (!navigator.geolocation) {

        setGeoStatus(
          GEO_STATUS.error
        );

        toast.error(
          'La géolocalisation n’est pas disponible sur cet appareil.'
        );

        return;
      }


      setGeoStatus(
        GEO_STATUS.loading
      );


      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const {
            latitude,
            longitude,
          } = position.coords;


          await setLocationFromCoordinates(
            latitude,
            longitude
          );

        },

        () => {

          setGeoStatus(
            GEO_STATUS.error
          );

          toast.error(
            'Impossible de récupérer votre position.'
          );
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        }
      );

    }, [
      setLocationFromCoordinates,
    ]);


  // Auto geolocation for logged user
  useEffect(() => {

    const token =
      localStorage.getItem(
        'dangoToken'
      );

    if (!token) {
      return;
    }


    if (
      navigator.geolocation &&
      form.lat === null &&
      form.lng === null
    ) {

      handleGeolocate();

    }

  }, [
    handleGeolocate,
    form.lat,
    form.lng,
  ]);


  // Socket: connect and listen for delivery updates
  useEffect(() => {
    const token = localStorage.getItem('dangoToken');
    if (!token) return undefined;

    const s = socketIOClient(API_BASE_URL, {
      transports: ['polling', 'websocket'],
      upgrade: true,
      reconnectionAttempts: 3,
      reconnectionDelay: 2000,
      timeout: 10000,
      withCredentials: true,
    });


    setSocket(s);

    s.on('connect', () => {
      console.log('[Checkout] socket connected', s.id);
      // Authenticate so server can join user room
      s.emit('authenticate', { token });
    });

    s.on('connect_error', (err) => {
      console.warn('[Checkout] socket connect_error', err?.message || err);
    });

    s.on('delivery_price_update', (payload) => {
      console.log('[Checkout] received delivery_price_update', payload);
      if (payload && payload.data) {
        // Update state
        setDeliveryCalculation(payload.data);

        // Compute a quick total fee from payload (groups or single fee)
        try {
          const d = payload.data;
          let totalFee = 0;
          if (Array.isArray(d.groups) && d.groups.length) {
            totalFee = d.groups.reduce((s, g) => s + Number(g.fee || 0), 0);
          } else if (Number.isFinite(Number(d.fee))) {
            totalFee = Number(d.fee);
          } else if (Number.isFinite(Number(d.shippingCost))) {
            totalFee = Number(d.shippingCost);
          }

          console.log('[Checkout] computed totalFee from socket payload:', totalFee);

          // Ensure UI uses socket result: update preview.shippingCost so shippingFee useMemo picks it
          setPreview((prev) => ({
            ...(prev || {}),
            shippingCost: totalFee,
            total:
              Number(prev?.subtotal ?? subtotal) + totalFee - Number(prev?.discount || 0),
          }));

          if (typeof toast === 'function') {
            toast.info(`Frais de livraison mis à jour : ${totalFee.toLocaleString('fr-FR')} FCFA`);
          }
        } catch (e) {
          console.warn('[Checkout] error computing fee from payload', e);
        }
      }
    });

    s.on('delivery_price_update_error', (err) => {
      console.warn('[Checkout] delivery_price_update_error', err);
    });

    return () => {
      s.removeAllListeners();
      s.close();
      setSocket(null);
    };
  }, []);


  // ==========================================================
  // ADDRESS SEARCH
  // ==========================================================

  const handleSelectSuggestion =
    useCallback(
      (suggestion) => {

        const latitude =
          Number(suggestion.lat);

        const longitude =
          Number(suggestion.lon);


        if (
          !Number.isFinite(latitude) ||
          !Number.isFinite(longitude)
        ) {

          setAddressSuggestions([]);

          return;
        }


        setAddressSuggestions([]);


        setLocationFromCoordinates(
          latitude,
          longitude,
          suggestion.display_name ||
            'Adresse sélectionnée'
        );
      },
      [
        setLocationFromCoordinates,
      ]
    );


  useEffect(() => {

    const query =
      addressQuery.trim();


    if (query.length < 3) {

      setAddressSuggestions([]);

      return;
    }


    const timer =
      setTimeout(
        async () => {

          try {

            const response =
              await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&limit=6&q=${encodeURIComponent(
                  query
                )}&countrycodes=bj,tg`,
                {
                  headers: {
                    'Accept-Language':
                      'fr',
                  },
                }
              );


            if (!response.ok) {
              return;
            }


            const data =
              await response.json();


            const suggestions = Array.isArray(data) ? data : [];
            setAddressSuggestions(suggestions);

            if (suggestions.length > 0) {
              const top = suggestions[0];
              const lat = Number(top.lat);
              const lon = Number(top.lon);
              if (Number.isFinite(lat) && Number.isFinite(lon)) {
                setForm((prev) => ({
                  ...prev,
                  lat,
                  lng: lon,
                }));
                setGeoAddress(top.display_name || query);
              }
            }

          } catch {

            setAddressSuggestions([]);

          }
        },
        350
      );


    return () =>
      clearTimeout(timer);

  }, [
    addressQuery,
  ]);


  // ==========================================================
  // SHIPPING FEE
  // ==========================================================

  const shippingFee =
    useMemo(() => {

      /*
       * IMPORTANT :
       * On distingue maintenant :
       *   undefined/null = absent
       *   0 = livraison réellement gratuite
       */

      const previewShipping =
        preview?.shippingCost ??
        preview?.shippingFee;


      if (
        previewShipping !==
          undefined &&
        previewShipping !== null &&
        Number.isFinite(
          Number(previewShipping)
        )
      ) {

        return Number(
          previewShipping
        );
      }


      if (deliveryCalculation) {

        if (
          Array.isArray(
            deliveryCalculation.groups
          ) &&
          deliveryCalculation.groups.length
        ) {

          return deliveryCalculation.groups.reduce(
            (total, group) =>
              total +
              Number(
                group?.fee || 0
              ),
            0
          );
        }


        const singleFee =
          deliveryCalculation.fee ??
          deliveryCalculation.shippingCost;


        if (
          singleFee !==
            undefined &&
          singleFee !== null &&
          Number.isFinite(
            Number(singleFee)
          )
        ) {

          return Number(singleFee);
        }
      }


      return 0;

    }, [
      preview,
      deliveryCalculation,
    ]);


  // ==========================================================
  // ITEM PRICE
  // ==========================================================

  const itemUnitPrice =
    useCallback((item) => {

      const normalPrice =
        Number(item?.price || 0);


      const promoPrice =
        Number(item?.promoPrice || 0);


      const salePrice =
        Number(item?.salePrice || 0);


      // Promo price
      if (
        promoPrice > 0 &&
        promoPrice < normalPrice
      ) {

        return promoPrice;
      }


      // Sale price seulement s'il est
      // inférieur au prix normal
      if (
        salePrice > 0 &&
        (
          normalPrice === 0 ||
          salePrice < normalPrice
        )
      ) {

        return salePrice;
      }


      return Number.isFinite(
        normalPrice
      )
        ? normalPrice
        : 0;

    }, []);


  const subtotal =
    useMemo(
      () =>
        cartItems.reduce(
          (sum, item) =>
            sum +
            itemUnitPrice(item) *
              Number(
                item.quantity || 1
              ),
          0
        ),
      [
        cartItems,
        itemUnitPrice,
      ]
    );


  const computedTotal =
    Number(
      preview?.subtotal ??
        subtotal
    ) +
    shippingFee -
    Number(
      preview?.discount || 0
    );


  const getShippingLabel =
    () =>
      deliveryCalculation?.provider ===
      'SELLER'
        ? 'Vendeur'
        : 'Dango Import';


  // ==========================================================
  // PAYMENT STATUS HANDLER
  // ==========================================================

  const showPaymentResult =
    useCallback(
      (status) => {

        setPaymentResult(
          status
        );

        setPaymentResultOpen(
          true
        );

      },
      []
    );


  const handleClosePaymentResult =
    useCallback(() => {

      const currentResult =
        paymentResult;


      setPaymentResultOpen(
        false
      );


      /*
       * Après succès :
       * le panier est déjà vidé.
       * On laisse l'utilisateur continuer.
       */

      if (
        currentResult ===
        'success'
      ) {

        navigate(
          '/shopping',
          {
            replace: true,
          }
        );

      }

    }, [
      paymentResult,
      navigate,
    ]);


  // ==========================================================
  // PAYMENT RETURN + POLLING
  // ==========================================================

  useEffect(() => {

    let pollId = null;

    let timeoutId = null;

    let stopped = false;


    const finishSuccess =
      () => {

        if (stopped) {
          return;
        }


        stopped = true;


        if (pollId) {
          clearInterval(
            pollId
          );
        }


        if (timeoutId) {
          clearTimeout(
            timeoutId
          );
        }


        clearCart();


        localStorage.removeItem(
          'pendingFedapay'
        );

        localStorage.removeItem(
          'pendingFedapayCartBackup'
        );

        localStorage.removeItem(
          'dangoPromoCode'
        );


        setSubmitting(false);


        showPaymentResult(
          'success'
        );
      };


    const finishFailed =
      () => {

        if (stopped) {
          return;
        }


        stopped = true;


        if (pollId) {
          clearInterval(
            pollId
          );
        }


        if (timeoutId) {
          clearTimeout(
            timeoutId
          );
        }


        localStorage.removeItem(
          'pendingFedapay'
        );


        setSubmitting(false);


        showPaymentResult(
          'failed'
        );
      };


    const run =
      async () => {

        const params =
          new URLSearchParams(
            window.location.search
          );


        const urlStatus =
          (
            params.get('status') ||
            ''
          ).toLowerCase();


        /*
         * Retour direct depuis FedaPay.
         */

        if (
          SUCCESS_STATUSES.includes(
            urlStatus
          )
        ) {

          finishSuccess();

          return;
        }


        if (
          FAILED_STATUSES.includes(
            urlStatus
          )
        ) {

          finishFailed();

          return;
        }


        /*
         * Polling si l'utilisateur revient
         * sans status dans l'URL.
         */

        const pendingRaw =
          localStorage.getItem(
            'pendingFedapay'
          );


        if (!pendingRaw) {
          return;
        }


        let pending = null;


        try {

          pending =
            JSON.parse(
              pendingRaw
            );

        } catch (error) {

          console.error(
            'pendingFedapay invalide:',
            error
          );

          return;
        }


        if (
          !pending?.transactionId
        ) {
          return;
        }


        const check =
          async () => {

            if (stopped) {
              return;
            }


            try {

              const token =
                localStorage.getItem(
                  'dangoToken'
                );


              const response =
                await fetch(
                  `${API_BASE_URL}/api/fedapay/transaction/${pending.transactionId}`,
                  {
                    headers: token
                      ? {
                          Authorization:
                            `Bearer ${token}`,
                        }
                      : {},
                  }
                );


              const data =
                await response.json();


              if (!response.ok) {
                return;
              }


              const statusValue =
                String(
                  data?.data?.status ||
                    ''
                ).toLowerCase();


              /*
               * SUCCESS
               */

              if (
                SUCCESS_STATUSES.includes(
                  statusValue
                )
              ) {

                finishSuccess();

                return;
              }


              /*
               * FAILED
               */

              if (
                FAILED_STATUSES.includes(
                  statusValue
                )
              ) {

                finishFailed();

                return;
              }

            } catch (error) {

              console.error(
                'Erreur polling FedaPay:',
                error
              );

            }
          };


        /*
         * Première vérification immédiate.
         */

        await check();


        if (!stopped) {

          pollId =
            window.setInterval(
              check,
              3000
            );


          /*
           * Maximum 2 minutes.
           */

          timeoutId =
            window.setTimeout(
              () => {

                if (
                  pollId
                ) {

                  clearInterval(
                    pollId
                  );

                  pollId = null;
                }

                /*
                 * On ne déclare PAS automatiquement
                 * le paiement comme échoué simplement
                 * parce que le délai est dépassé.
                 *
                 * Le paiement peut encore être en cours.
                 */

              },
              2 * 60 * 1000
            );
        }
      };


    run();


    return () => {

      stopped = true;

      if (pollId) {
        clearInterval(
          pollId
        );
      }

      if (timeoutId) {
        clearTimeout(
          timeoutId
        );
      }

    };

  }, [
    clearCart,
    showPaymentResult,
  ]);


  // ==========================================================
  // LOAD USER
  // ==========================================================

  useEffect(() => {

    const token =
      localStorage.getItem(
        'dangoToken'
      );


    if (!token) {

      redirectToLogin();

      return;
    }


    try {

      const userData =
        JSON.parse(
          localStorage.getItem(
            'dangoUser'
          ) || '{}'
        );


      setForm((previous) => ({
        ...previous,

        firstName:
          userData.userFirstname ||
          userData.firstname ||
          previous.firstName,

        lastName:
          userData.userSurname ||
          userData.lastName ||
          userData.surname ||
          previous.lastName,

        email:
          userData.userEmail ||
          userData.email ||
          previous.email,

        phone:
          userData.userPhone ||
          userData.phone ||
          previous.phone,
      }));

    } catch (error) {

      console.error(
        'Erreur chargement utilisateur:',
        error
      );

    }

  }, [
    redirectToLogin,
  ]);


  // ==========================================================
  // PREVIEW
  // ==========================================================

  useEffect(() => {

    const loadPreview =
      async () => {

        if (!cartItems.length) {
          return;
        }


        const token =
          localStorage.getItem(
            'dangoToken'
          );


        if (!token) {
          return;
        }


        setPreviewLoading(
          true
        );


        try {

          const response =
            await fetch(
              `${API_BASE_URL}/api/orders/preview`,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',

                  Authorization:
                    `Bearer ${token}`,
                },

                body: JSON.stringify({
                  items:
                    cartItems.map(
                      (item) => ({
                        productId:
                          item._id ||
                          item.id,

                        quantity:
                          item.quantity ||
                          1,
                      })
                    ),

                  promoCode,
                }),
              }
            );


          const data =
            await response.json();


          if (
            response.status ===
              401 ||
            response.status ===
              403
          ) {

            redirectToLogin();

            return;
          }


          if (!response.ok) {

            throw new Error(
              data?.message ||
                'Impossible de calculer le total'
            );
          }


          setPreview(
            data?.data || null
          );


        } catch (error) {

          console.error(
            'Erreur preview:',
            error
          );

        } finally {

          setPreviewLoading(
            false
          );
        }
      };


    const timer =
      window.setTimeout(
        loadPreview,
        250
      );


    return () =>
      window.clearTimeout(
        timer
      );

  }, [
    cartItems,
    promoCode,
    redirectToLogin,
  ]);


  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm =
    () => {

      const nextErrors = {};


      if (
        !form.firstName.trim()
      ) {

        nextErrors.firstName =
          'Le prénom est requis';
      }


      if (
        !form.lastName.trim()
      ) {

        nextErrors.lastName =
          'Le nom est requis';
      }


      if (
        !form.email.trim()
      ) {

        nextErrors.email =
          "L'email est requis";
      }


      if (
        !form.phone.trim() ||
        form.phone.replace(
          /\D/g,
          ''
        ).length < 8
      ) {

        nextErrors.phone =
          'Téléphone valide requis';
      }


      if (
        !form.country ||
        !form.country.trim()
      ) {

        nextErrors.country =
          'Le pays est requis';
      }


      if (
        form.lat === null ||
        form.lng === null
      ) {

        nextErrors.location =
          'Veuillez autoriser la géolocalisation pour continuer';
      }


      setErrors(
        nextErrors
      );


      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };


  // ==========================================================
  // PLACE ORDER
  // ==========================================================

  const handlePlaceOrder =
    async () => {

      if (!acceptCGV) {

        toast.error(
          'Veuillez accepter les conditions générales de vente.'
        );

        return;
      }


      if (
        form.lat === null ||
        form.lng === null ||
        !addressQuery.trim()
      ) {

        toast.error(
          'Veuillez partager votre position et renseigner votre adresse.'
        );

        return;
      }


      setSubmitting(
        true
      );


      const token =
        localStorage.getItem(
          'dangoToken'
        );


      const toastId =
        toast.loading(
          'Préparation du paiement...'
        );


      try {
        const finalShippingFee =
          Number(shippingFee) ||
          Number(
            deliveryCalculation?.shippingCost ||
              preview?.shippingCost ||
              0
          ) ||
          0;

        const total =
          Number(
            preview?.subtotal ??
              subtotal
          ) +
          finalShippingFee -
          Number(
            preview?.discount || 0
          );


        const payload =
          buildCartFedapayPayload({
            form: {
              ...form,

              fullAddress:
                geoAddress ||
                `${form.lat}, ${form.lng}`,

              city:
                geoAddress
                  ? geoAddress.split(
                      ','
                    )[0]
                  : '',

              country:
                form.country ||
                'Togo',

              addressQuery,
            },

            cartItems,

            subtotal,

            shippingFee:
              finalShippingFee,

            total,

            shippingLabel:
              getShippingLabel(),

            description:
              'Commande Dango Import',

            type: 'cart',
          });


        const data =
          await initiateFedapayCheckout(
            payload,
            token
          );


        if (!data?.url) {

          throw new Error(
            'URL de paiement FedaPay introuvable.'
          );
        }


        /*
         * Les données techniques sont conservées
         * uniquement localement pour permettre
         * au polling de vérifier le paiement.
         *
         * Elles ne sont jamais affichées.
         */

        localStorage.setItem(
          'pendingFedapay',
          JSON.stringify({
            transactionId:
              data.transactionId,

            localTransactionId:
              data.localTransactionId,
          })
        );


        localStorage.setItem(
          'pendingFedapayCartBackup',
          JSON.stringify(
            cartItems
          )
        );


        toast.update(
          toastId,
          {
            render:
              'Redirection vers le paiement...',
            type: 'info',
            isLoading: false,
            autoClose: 2000,
          }
        );


        window.location.href =
          data.url;

      } catch (error) {

        console.error(
          'Erreur paiement:',
          error
        );


        toast.update(
          toastId,
          {
            render:
              error?.message ||
              'Impossible de lancer le paiement.',
            type: 'error',
            isLoading: false,
            autoClose: 4000,
          }
        );


        setSubmitting(
          false
        );
      }
    };


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const goNext =
    () => {

      if (
        currentStep === 1
      ) {

        if (
          !validateForm()
        ) {

          toast.error(
            'Veuillez renseigner vos informations et activer la géolocalisation.'
          );

          return;
        }
      }


      setCurrentStep(
        (previous) =>
          Math.min(
            previous + 1,
            3
          )
      );


      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };


  const goBack =
    () => {

      if (
        currentStep === 1
      ) {

        navigate('/cart');

        return;
      }


      setCurrentStep(
        (previous) =>
          Math.max(
            previous - 1,
            1
          )
      );


      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };


  // ==========================================================
  // EMPTY CART
  // ==========================================================

  if (!cartItems.length) {

    return (
      <>
        <Header />

        <div className="flex min-h-[70vh] items-center justify-center bg-[#FAFAFA] pt-28">

          <div className="px-6 text-center">

            <h2 className="mb-2 text-xl font-black text-gray-900">
              Votre panier est vide
            </h2>

            <p className="mx-auto mb-6 max-w-xs text-sm text-gray-500">
              Ajoutez des produits avant de
              finaliser votre commande.
            </p>

            <button
              onClick={() =>
                navigate('/shopping')
              }
              className="rounded-xl bg-[#F68B1E] px-8 py-3.5 font-black text-white transition-all hover:-translate-y-0.5 hover:bg-[#E67A0C]"
            >
              Continuer le shopping
            </button>

          </div>

        </div>

        <Footer />
      </>
    );
  }


  // ==========================================================
  // TITLES / ANIMATION
  // ==========================================================

  const stepTitles = {
    1: 'Informations de contact',
    2: 'Livraison',
    3: 'Confirmation & paiement',
  };


  const stepVariants = {
    enter: {
      opacity: 0,
      x: 16,
    },

    center: {
      opacity: 1,
      x: 0,
    },

    exit: {
      opacity: 0,
      x: -16,
    },
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="min-h-screen bg-[#FAFAFA]">

      <Header />


      {/* Payment result popup */}
      <PaymentResultModal
        open={
          paymentResultOpen
        }
        status={
          paymentResult
        }
        onClose={
          handleClosePaymentResult
        }
      />


      {/* Header */}
      <div className="border-b border-gray-100 bg-white">

        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">

          <div className="mb-5 flex items-center justify-between">

            <div>

              <h1 className="text-lg font-black text-[#282828] sm:text-xl">
                Finaliser votre commande
              </h1>

              <p className="text-xs text-gray-400">
                Étape {currentStep} sur 3
              </p>

            </div>


            <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 sm:flex">

              <ShieldCheck className="h-3.5 w-3.5" />

              Paiement sécurisé

            </div>

          </div>


          <StepperBar
            currentStep={
              currentStep
            }
          />

        </div>
      </div>


      {/* Main */}
      <main className="mx-auto max-w-6xl px-4 py-6 pb-32 sm:px-6 lg:pb-12">

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">

          <div>

            {/* Mobile summary */}
            <div className="mb-6 lg:hidden">

              <OrderSummaryPanel
                variant="collapsible"
                cartItems={
                  cartItems
                }
                itemUnitPrice={
                  itemUnitPrice
                }
                subtotal={
                  subtotal
                }
                shippingFee={
                  shippingFee
                }
                preview={
                  preview
                }
                previewLoading={
                  previewLoading
                }
                isOpen={
                  summaryOpen
                }
                onToggle={() =>
                  setSummaryOpen(
                    (value) =>
                      !value
                  )
                }
              />

            </div>


            {/* Step card */}
            <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

              <div className="border-b border-gray-100 px-6 py-5">

                <div className="flex items-center gap-3">

                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#F68B1E] text-sm font-black text-white">
                    {currentStep}
                  </div>

                  <h2 className="text-base font-black text-[#282828]">
                    {stepTitles[
                      currentStep
                    ]}
                  </h2>

                </div>

              </div>


              <div className="p-6">

                <AnimatePresence mode="wait">

                  <motion.div
                    key={currentStep}
                    variants={
                      stepVariants
                    }
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      duration: 0.25,
                      ease: 'easeOut',
                    }}
                  >

                    {currentStep ===
                      1 && (
                      <StepAddress
                        form={form}
                        setForm={
                          setForm
                        }
                        errors={
                          errors
                        }
                        geoStatus={
                          geoStatus
                        }
                        geoAddress={
                          geoAddress
                        }
                        onGeolocate={
                          handleGeolocate
                        }
                        addressQuery={
                          addressQuery
                        }
                        setAddressQuery={
                          setAddressQuery
                        }
                        addressSuggestions={
                          addressSuggestions
                        }
                        onSelectSuggestion={
                          handleSelectSuggestion
                        }
                      />
                    )}


                    {currentStep ===
                      2 && (
                      <StepShipping
                        deliveryCalculation={
                          deliveryCalculation
                        }
                      />
                    )}


                    {currentStep ===
                      3 && (
                      <StepPayment
                        acceptCGV={
                          acceptCGV
                        }
                        setAcceptCGV={
                          setAcceptCGV
                        }
                        submitting={
                          submitting
                        }
                        handlePlaceOrder={
                          handlePlaceOrder
                        }
                        computedTotal={
                          computedTotal
                        }
                        previewLoading={
                          previewLoading
                        }
                        form={
                          form
                        }
                        geoAddress={
                          geoAddress
                        }
                        deliveryCalculation={
                          deliveryCalculation
                        }
                      />
                    )}

                  </motion.div>

                </AnimatePresence>

              </div>

            </div>


            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between gap-3">

              <button
                type="button"
                onClick={
                  goBack
                }
                className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-600 transition-all hover:border-gray-300 hover:bg-gray-50"
              >

                <ChevronLeft className="h-4 w-4" />

                {currentStep ===
                1
                  ? 'Panier'
                  : 'Retour'}

              </button>


              {currentStep < 3 && (
                <button
                  type="button"
                  onClick={
                    goNext
                  }
                  disabled={previewLoading}
                  className={[
                    'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all',
                    previewLoading
                      ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                      : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/40 hover:-translate-y-0.5 hover:bg-[#E67A0C]',
                  ].join(' ')}
                >
                  {previewLoading ? 'Calcul...' : 'Continuer'}
                </button>
              )}

            </div>

          </div>


          {/* Desktop summary */}
          <div className="hidden lg:sticky lg:top-8 lg:block">

            <OrderSummaryPanel
              variant="sticky"
              cartItems={
                cartItems
              }
              itemUnitPrice={
                itemUnitPrice
              }
              subtotal={
                subtotal
              }
              shippingFee={
                shippingFee
              }
              preview={
                preview
              }
              previewLoading={
                previewLoading
              }
            />

          </div>

        </div>

      </main>


      {/* Mobile bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 lg:hidden">

        <div className="mx-auto flex max-w-2xl items-center justify-between">

          <div>

            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Total
            </p>

            <p className="text-base font-black text-[#F68B1E]">

              {previewLoading
                ? '...'
                : `${computedTotal.toLocaleString(
                    'fr-FR'
                  )} FCFA`}

            </p>

          </div>


          {currentStep < 3 ? (

            <button
              type="button"
              onClick={
                goNext
              }
              disabled={previewLoading}
              className={[
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all',
                previewLoading
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/40 hover:bg-[#E67A0C]',
              ].join(' ')}
            >
              {previewLoading ? 'Calcul...' : 'Continuer'}
            </button>

          ) : (

            <button
              type="button"
              onClick={
                handlePlaceOrder
              }
              disabled={
                submitting ||
                !acceptCGV ||
                previewLoading
              }
              className={[
                'flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-black transition-all',

                submitting ||
                !acceptCGV ||
                previewLoading
                  ? 'cursor-not-allowed bg-gray-200 text-gray-400'
                  : 'bg-[#F68B1E] text-white shadow-lg shadow-orange-200/40 hover:bg-[#E67A0C]',
              ].join(' ')}
            >

              {submitting
                ? 'Paiement...'
                : previewLoading
                ? 'Calcul...'
                : 'Payer'}

            </button>

          )}

        </div>

      </div>


      <Footer />

    </div>
  );
}
