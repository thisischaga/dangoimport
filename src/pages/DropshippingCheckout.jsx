import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { isDropshippingProduct } from '../utils/publicProduct';
import { formatCFA } from '../utils/formatPrice';
import { getUnitPrice, getMoqRules } from '../utils/importMoq';
import { getProductImage } from '../utils/imageUrl';
import toast from '../utils/toast';
import {
  buildCartFedapayPayload,
  initiateFedapayCheckout,
} from '../services/fedapayCheckout';
import {
  fetchDropshippingShippingOptions,
  getVariantLabel,
  mapCartItemToCheckoutLine,
} from '../services/dropshippingCheckout';
import './DropshippingCheckout.css';

const COUNTRY_OPTIONS = [
  { code: 'TG', label: 'Togo', dial: '+228' },
  { code: 'BJ', label: 'Bénin', dial: '+229' },
];

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  phoneLocal: '',
  countryCode: 'TG',
  city: '',
  district: '',
  fullAddress: '',
  landmark: '',
  instructions: '',
};

function getItemPrice(item) {
  return getUnitPrice(item);
}

function formatPhoneFull(countryCode, localDigits) {
  const dial = COUNTRY_OPTIONS.find((c) => c.code === countryCode)?.dial || '+228';
  const digits = String(localDigits || '').replace(/\D/g, '');
  if (digits.length >= 8) {
    const core = digits.slice(-8);
    return `${dial} ${core.slice(0, 2)} ${core.slice(2, 4)} ${core.slice(4, 6)} ${core.slice(6, 8)}`.trim();
  }
  return `${dial} ${digits}`.trim();
}

const DropshippingCheckout = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(emptyForm);
  const [quote, setQuote] = useState(null);
  const [shippingOptionId, setShippingOptionId] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState('');

  const dropItems = useMemo(
    () => cart.filter((item) => isDropshippingProduct(item)),
    [cart],
  );

  const subtotal = useMemo(
    () => dropItems.reduce((sum, item) => sum + getItemPrice(item) * (item.quantity || 1), 0),
    [dropItems],
  );

  const selectedShipping = useMemo(
    () => quote?.options?.find((o) => o.id === shippingOptionId) || null,
    [quote, shippingOptionId],
  );

  const shippingFee = Number(quote?.shippingCost ?? selectedShipping?.cost ?? 0);
  const productTotal = Number(quote?.subtotal ?? subtotal);
  const total = Number(quote?.total ?? Math.round(productTotal + shippingFee));
  const estimatedDelivery = selectedShipping?.estimatedDelivery || quote?.estimatedDeliveryLabel || null;
  const breakdown = quote?.importBreakdown || null;

  const checkoutLines = useMemo(
    () => dropItems.map(mapCartItemToCheckoutLine),
    [dropItems],
  );

  const prefillFromUser = useCallback(() => {
    try {
      const raw = localStorage.getItem('dangoUser');
      if (!raw) return;
      const user = JSON.parse(raw);
      setForm((prev) => ({
        ...prev,
        firstName: user.firstName || user.firstname || prev.firstName,
        lastName: user.lastName || user.lastname || prev.lastName,
        email: user.email || prev.email,
        phoneLocal: user.phone || user.phoneNumber || prev.phoneLocal,
      }));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    prefillFromUser();
  }, [prefillFromUser]);

  useEffect(() => {
    if (!cart.length) {
      navigate('/cart', { replace: true });
      return;
    }
    const hasLocal = cart.some((item) => !isDropshippingProduct(item));
    if (hasLocal) {
      toast.error('Panier mixte : finalisez d’abord les produits locaux ou dropshipping séparément.');
      navigate('/cart', { replace: true });
    }
  }, [cart, navigate]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const validateStep1 = () => {
    if (!form.firstName.trim() || !form.lastName.trim()) {
      return 'Prénom et nom sont obligatoires.';
    }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return 'Email valide requis.';
    }
    const phoneDigits = String(form.phoneLocal).replace(/\D/g, '');
    if (phoneDigits.length < 8) {
      return 'Numéro de téléphone valide requis (8 chiffres minimum).';
    }
    if (!form.city.trim()) return 'Ville requise.';
    if (!form.district.trim()) return 'Quartier requis.';
    if (!form.fullAddress.trim()) return 'Adresse détaillée requise.';
    return '';
  };

  const loadQuote = async () => {
    const validationError = validateStep1();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setQuoteLoading(true);
    try {
      const data = await fetchDropshippingShippingOptions({
        items: checkoutLines,
        destination: {
          country: form.countryCode,
          city: form.city.trim(),
        },
      });
      setQuote(data);
      const optionId = data.options?.[0]?.id || 'dango-import:transit';
      setShippingOptionId(optionId);
      if (!data.options?.length) {
        setError(data.message || 'Impossible de calculer les frais d’importation.');
        return;
      }
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur livraison.');
    } finally {
      setQuoteLoading(false);
    }
  };

  const handlePay = async () => {
    if (!shippingOptionId || !selectedShipping) {
      setError('Choisissez un mode de livraison.');
      return;
    }
    setPayLoading(true);
    setError('');
    const token = localStorage.getItem('dangoToken');
    const phoneFull = formatPhoneFull(form.countryCode, form.phoneLocal);
    const countryLabel = COUNTRY_OPTIONS.find((c) => c.code === form.countryCode)?.label || 'Togo';

    const cartItemsForPayload = dropItems.map((item) => ({
      ...item,
      price: getItemPrice(item),
      selectedOptions: mapCartItemToCheckoutLine(item).selectedOptions,
    }));

    try {
      const payload = buildCartFedapayPayload({
        form: {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: phoneFull,
          country: countryLabel,
          city: form.city.trim(),
          neighborhood: form.district.trim(),
          district: form.district.trim(),
          fullAddress: form.fullAddress.trim(),
          landmark: form.landmark.trim(),
          instructions: form.instructions.trim(),
        },
        cartItems: cartItemsForPayload,
        subtotal,
        shippingFee,
        total,
        shippingLabel: shippingOptionId,
        shippingOptionId,
        description: 'Commande dropshipping Dango Import',
        type: 'dropshipping',
        checkoutMode: 'dropshipping',
        estimatedDeliveryLabel: estimatedDelivery,
        shippingCost: shippingFee,
        callbackUrl: `${window.location.origin}/checkout/result?checkoutMode=dropshipping`,
      });

      const data = await initiateFedapayCheckout(payload, token);

      localStorage.setItem(
        'pendingFedapay',
        JSON.stringify({
          transactionId: data.transactionId,
          localTransactionId: data.localTransactionId,
          checkoutMode: 'dropshipping',
        }),
      );
      localStorage.setItem('pendingFedapayCartBackup', JSON.stringify(dropItems));
      localStorage.setItem(
        'pendingDropshipCheckoutSummary',
        JSON.stringify({
          total,
          estimatedDelivery,
          phone: phoneFull,
          productTotal,
          billedWeight: breakdown?.billedWeight,
          ratePerKg: breakdown?.ratePerKg,
          shippingBaseCost: breakdown?.shippingBaseCost,
          shippingCost: shippingFee,
        }),
      );

      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Impossible d’initialiser le paiement.');
      setPayLoading(false);
    }
  };

  const summaryBlock = (
    <aside className="ds-summary">
      <h2 className="text-base font-bold m-0 mb-3">Votre commande</h2>
      {dropItems.map((item) => {
        const img = getProductImage(item) || item.image;
        const variant = getVariantLabel(item);
        return (
          <div key={item._id || item.id} className="ds-summary__item">
            {img ? (
              <img src={img} alt="" className="ds-summary__thumb" />
            ) : (
              <div className="ds-summary__thumb bg-gray-100" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold m-0 leading-snug">{item.name}</p>
              {variant && <p className="text-xs text-gray-600 m-0 mt-0.5">{variant}</p>}
              <p className="text-xs text-gray-500 m-0 mt-1">
                {getMoqRules(item).soldAsLot
                  ? `Lot de ${getMoqRules(item).packSize} · Qté ${item.quantity || 1}`
                  : `Qté ${item.quantity || 1}`}
              </p>
              {Number(item.quantity) > 1 && (
                <p className="text-xs text-gray-500 m-0">Soit {formatCFA(getItemPrice(item))} / unité</p>
              )}
              <p className="text-sm font-bold m-0 mt-1">
                {formatCFA(getItemPrice(item) * (item.quantity || 1))}
              </p>
            </div>
          </div>
        );
      })}
      <div className="ds-summary__line">
        <span>Produit</span>
        <span>{formatCFA(productTotal)}</span>
      </div>
      {breakdown ? (
        <div className="ds-summary__import">
          <p className="ds-summary__import-title">Détail importation</p>
          <div className="ds-summary__line ds-summary__line--muted">
            <span>Poids facturé</span>
            <span>{breakdown.billedWeight} kg</span>
          </div>
          {(breakdown.items || []).length > 1 && breakdown.items.map((row, index) => (
            <div key={`w-${index}`} className="ds-summary__line ds-summary__line--muted">
              <span>Produit {index + 1} × {row.quantity}</span>
              <span>{row.billedWeight} kg</span>
            </div>
          ))}
          <div className="ds-summary__line ds-summary__line--muted">
            <span>Frais d&apos;importation</span>
            <span>{formatCFA(breakdown.shippingCost)}</span>
          </div>
        </div>
      ) : null}
      <div className="ds-summary__line">
        <span>Importation / livraison</span>
        <span>{quote ? formatCFA(shippingFee) : '—'}</span>
      </div>
      {estimatedDelivery && (
        <p className="text-xs text-gray-600 mt-2 mb-0">Délai estimé : {estimatedDelivery}</p>
      )}
      <div className="ds-summary__total">
        <span>TOTAL</span>
        <span>{formatCFA(total)}</span>
      </div>
      <p className="ds-trust">
        Paiement sécurisé via FedaPay. Dango Import traite votre commande ; vous ne serez jamais redirigé vers un site fournisseur.
      </p>
    </aside>
  );

  return (
    <div className="ds-checkout">
      <Header />
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-bold m-0">Checkout livraison internationale</h1>
          <Link to="/cart" className="text-sm font-semibold text-[#f68b1e] whitespace-nowrap">
            Retour au panier
          </Link>
        </div>
      </div>

      <main className="ds-checkout__main">
        <div className="ds-checkout__steps" aria-label="Étapes">
          <div className={`ds-checkout__step ${step >= 1 ? 'is-active' : ''} ${step > 1 ? 'is-done' : ''}`}>
            1 · Livraison
          </div>
          <div className={`ds-checkout__step ${step >= 2 ? 'is-active' : ''}`}>2 · Paiement</div>
          <div className="ds-checkout__step">3 · Confirmation</div>
        </div>

        {error && <p className="ds-error" role="alert">{error}</p>}

        <div className="ds-checkout__grid">
          <div>
            {step === 1 && (
              <>
                <section className="ds-section">
                  <h2>Vos informations</h2>
                  <div className="ds-row-2">
                    <div className="ds-field">
                      <label htmlFor="ds-first">Prénom *</label>
                      <input
                        id="ds-first"
                        value={form.firstName}
                        onChange={(e) => updateField('firstName', e.target.value)}
                        autoComplete="given-name"
                      />
                    </div>
                    <div className="ds-field">
                      <label htmlFor="ds-last">Nom *</label>
                      <input
                        id="ds-last"
                        value={form.lastName}
                        onChange={(e) => updateField('lastName', e.target.value)}
                        autoComplete="family-name"
                      />
                    </div>
                  </div>
                  <div className="ds-field">
                    <label htmlFor="ds-email">Email *</label>
                    <input
                      id="ds-email"
                      type="email"
                      value={form.email}
                      onChange={(e) => updateField('email', e.target.value)}
                      autoComplete="email"
                    />
                  </div>
                  <div className="ds-row-2">
                    <div className="ds-field">
                      <label htmlFor="ds-country">Pays *</label>
                      <select
                        id="ds-country"
                        value={form.countryCode}
                        onChange={(e) => updateField('countryCode', e.target.value)}
                      >
                        {COUNTRY_OPTIONS.map((c) => (
                          <option key={c.code} value={c.code}>{c.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="ds-field">
                      <label htmlFor="ds-phone">Téléphone *</label>
                      <div className="flex gap-1">
                        <span className="flex items-center px-2 border border-gray-300 text-sm bg-gray-50 shrink-0">
                          {COUNTRY_OPTIONS.find((c) => c.code === form.countryCode)?.dial}
                        </span>
                        <input
                          id="ds-phone"
                          inputMode="numeric"
                          placeholder="XX XX XX XX"
                          value={form.phoneLocal}
                          onChange={(e) => updateField('phoneLocal', e.target.value)}
                          autoComplete="tel-national"
                          className="flex-1 min-w-0"
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className="ds-section">
                  <h2>Adresse de livraison</h2>
                  <div className="ds-row-2">
                    <div className="ds-field">
                      <label htmlFor="ds-city">Ville *</label>
                      <input
                        id="ds-city"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Lomé, Cotonou…"
                      />
                    </div>
                    <div className="ds-field">
                      <label htmlFor="ds-district">Quartier *</label>
                      <input
                        id="ds-district"
                        value={form.district}
                        onChange={(e) => updateField('district', e.target.value)}
                        placeholder="Agoè, Akpakpa…"
                      />
                    </div>
                  </div>
                  <div className="ds-field">
                    <label htmlFor="ds-address">Adresse *</label>
                    <input
                      id="ds-address"
                      value={form.fullAddress}
                      onChange={(e) => updateField('fullAddress', e.target.value)}
                      placeholder="Rue, numéro, immeuble…"
                    />
                  </div>
                  <div className="ds-field">
                    <label htmlFor="ds-landmark">Point de repère</label>
                    <input
                      id="ds-landmark"
                      value={form.landmark}
                      onChange={(e) => updateField('landmark', e.target.value)}
                      placeholder="Près du marché, en face de…"
                    />
                  </div>
                  <div className="ds-field">
                    <label htmlFor="ds-instructions">Instructions de livraison</label>
                    <textarea
                      id="ds-instructions"
                      value={form.instructions}
                      onChange={(e) => updateField('instructions', e.target.value)}
                      placeholder="Appelez-moi avant la livraison…"
                    />
                  </div>
                </section>

                <button
                  type="button"
                  className="ds-btn-primary hidden md:block"
                  disabled={quoteLoading}
                  onClick={loadQuote}
                >
                  {quoteLoading ? 'Calcul des frais d’importation…' : 'Continuer vers le paiement'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <section className="ds-section">
                  <h2>Importation / livraison</h2>
                  <p className="text-sm text-gray-600 m-0 mb-3">
                    Les frais d&apos;importation sont calculés sur le poids total de la commande.
                  </p>
                  {breakdown && (
                    <div className="ds-import-details">
                      <div className="ds-summary__line">
                        <span>Poids total</span>
                        <span>{breakdown.billedWeight} kg</span>
                      </div>
                      {(breakdown.items || []).map((row, index) => (
                        <div key={`item-w-${index}`} className="ds-summary__line ds-summary__line--muted">
                          <span>Poids produit {index + 1} (×{row.quantity})</span>
                          <span>{row.billedWeight} kg</span>
                        </div>
                      ))}
                      <div className="ds-summary__line">
                        <span>Frais d&apos;importation</span>
                        <span>{formatCFA(breakdown.shippingCost)}</span>
                      </div>
                      {breakdown.estimatedDeliveryLabel && (
                        <p className="text-xs text-gray-600 mt-2 mb-0">
                          Délai estimé : {breakdown.estimatedDeliveryLabel}
                        </p>
                      )}
                    </div>
                  )}
                  {(quote?.options || []).map((opt) => (
                    <label key={opt.id} className="ds-shipping-option">
                      <input
                        type="radio"
                        name="shipping"
                        checked={shippingOptionId === opt.id}
                        readOnly
                      />
                      <span className="ds-shipping-option__title">{opt.label || 'Importation / livraison'}</span>
                      {opt.estimatedDelivery && (
                        <div className="ds-shipping-option__meta">
                          Délai estimé : {opt.estimatedDelivery}
                        </div>
                      )}
                      <div className="ds-shipping-option__meta font-semibold text-gray-800">
                        {formatCFA(opt.cost)}
                      </div>
                    </label>
                  ))}
                </section>

                <section className="ds-section">
                  <h2>Paiement</h2>
                  <p className="text-sm text-gray-700 m-0 leading-relaxed">
                    Vous serez redirigé vers FedaPay pour régler{' '}
                    <strong>{formatCFA(total)}</strong>. Le montant est recalculé et vérifié côté serveur avant validation.
                  </p>
                  <button
                    type="button"
                    className="ds-btn-primary mt-4 hidden md:block"
                    disabled={payLoading || !shippingOptionId}
                    onClick={handlePay}
                  >
                    {payLoading ? 'Redirection…' : 'Payer avec FedaPay'}
                  </button>
                  <button
                    type="button"
                    className="ds-btn-secondary hidden md:block"
                    onClick={() => setStep(1)}
                  >
                    Modifier mes informations
                  </button>
                </section>
              </>
            )}
          </div>

          <div className="hidden md:block">{summaryBlock}</div>
        </div>
      </main>

      <div className="ds-mobile-bar md:hidden">
        {step === 1 && (
          <button
            type="button"
            className="ds-btn-primary m-0"
            disabled={quoteLoading}
            onClick={loadQuote}
          >
            {quoteLoading ? 'Calcul…' : `Continuer · ${formatCFA(subtotal)}`}
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            className="ds-btn-primary m-0"
            disabled={payLoading || !shippingOptionId}
            onClick={handlePay}
          >
            {payLoading ? 'Redirection…' : `Payer ${formatCFA(total)}`}
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DropshippingCheckout;
