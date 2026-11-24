import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { formatCFA } from '../utils/formatPrice';
import { getUnitPrice, getMoqRules } from '../utils/importMoq';
import { getProductImage } from '../utils/imageUrl';
import {
  buildCartFedapayPayload,
  initiateFedapayCheckout,
} from '../services/fedapayCheckout';
import {
  fetchDropshippingTransportOptions,
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
  const p = getUnitPrice(item);
  if (Number.isFinite(p) && p > 0) return p;
  const rawPrice = Number(item?.price || item?.unitPrice || item?.salePrice || item?.promoPrice || 0);
  return Number.isFinite(rawPrice) && rawPrice > 0 ? rawPrice : 0;
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
  const [transportOptions, setTransportOptions] = useState([]);
  const [transportMode, setTransportMode] = useState('');
  const [transportLoading, setTransportLoading] = useState(false);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [error, setError] = useState('');

  const dropItems = useMemo(
    () => (Array.isArray(cart) ? cart : []),
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
  const internationalShippingFee = Number(
    breakdown?.internationalShippingCost ?? breakdown?.shippingBaseCost ?? 0,
  );
  const localDeliveryFee = Number(breakdown?.localDeliveryFee ?? 0);

  const checkoutLines = useMemo(
    () => dropItems.map(mapCartItemToCheckoutLine),
    [dropItems],
  );

  useEffect(() => {
    let active = true;
    setTransportOptions([]);
    setTransportMode('');
    setQuote(null);
    setShippingOptionId('');
    if (!checkoutLines.length) return undefined;

    setTransportLoading(true);
    fetchDropshippingTransportOptions({
      items: checkoutLines,
      countryCode: form.countryCode,
    }).then((data) => {
      if (active) setTransportOptions(data.options || []);
    }).catch((err) => {
      if (active) {
        setError(err.response?.data?.message || err.message || 'Impossible de charger les modes de transport.');
      }
    }).finally(() => {
      if (active) setTransportLoading(false);
    });

    return () => { active = false; };
  }, [checkoutLines, form.countryCode]);

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
    }
  }, [cart, navigate]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setQuote(null);
    setShippingOptionId('');
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
    if (transportOptions.length && !transportMode) return 'Choisissez un mode de transport.';
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
        transportMode: transportMode || undefined,
        destination: {
          country: form.countryCode,
          city: form.city.trim(),
          district: form.district.trim(),
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
    if (!quote?.quoteId) {
      setError('Le devis de livraison a expiré. Recalculez les frais avant le paiement.');
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
        importQuoteId: quote.quoteId,
        callbackUrl: `${window.location.origin}/checkout/result?checkoutMode=dropshipping`,
        countryCode: form.countryCode,
        paymentMode: 'redirect',
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
          shippingCost: shippingFee,
        }),
      );

      if (!data.url) {
        throw new Error('URL de paiement FedaPay indisponible.');
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err.message || 'Impossible d’initialiser le paiement.');
      setPayLoading(false);
    }
  };

  const summaryBlock = (
    <aside className="ds-summary">
      <h2 className="ds-summary__title">Résumé de la commande</h2>
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
              <p className="ds-summary__quantity">
                {getMoqRules(item).soldAsLot
                  ? `Lot de ${getMoqRules(item).packSize} · Quantité ${item.quantity || 1}`
                  : `Quantité ${item.quantity || 1}`}
                {Number(item.quantity) > 1
                  ? ` · ${formatCFA(getItemPrice(item))} / unité`
                  : ''}
              </p>
              <p className="ds-summary__item-price">
                {formatCFA(getItemPrice(item) * (item.quantity || 1))}
              </p>
            </div>
          </div>
        );
      })}
      <div className="ds-summary__fees">
        <div className="ds-summary__line">
          <span>Prix des produits</span>
          <span>{formatCFA(productTotal)}</span>
        </div>
        <div className="ds-summary__line">
          <span>Transport international (transitaire)</span>
          <span>{quote ? formatCFA(internationalShippingFee) : 'Calculé après adresse'}</span>
        </div>
        <div className="ds-summary__line">
          <span>Livraison locale</span>
          <span>{quote ? formatCFA(localDeliveryFee) : 'Calculée après adresse'}</span>
        </div>
      </div>
      <div className="ds-summary__total">
        <span>Total à payer</span>
        <span>{formatCFA(total)}</span>
      </div>
      <p className="ds-trust">
        Paiement sécurisé par Mobile Money et Carte Bancaire. Dango Import traite votre commande en toute sécurité.
      </p>
    </aside>
  );

  return (
    <div className="ds-checkout">
      <Header />
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
          <h1 className="text-lg sm:text-xl font-bold m-0">Checkout livraison internationale</h1>
          <Link to="/cart" className="text-sm font-semibold text-[#FF6B00] whitespace-nowrap">
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

                {transportOptions.length > 0 && (
                  <section className="ds-section">
                    <h2>Mode de transit *</h2>
                    <p className="text-sm text-gray-600">
                      Choisissez le mode disponible pour le pays de livraison avant le calcul des frais.
                    </p>
                    {transportOptions.map((option) => (
                      <label key={option.id} className="ds-shipping-option">
                        <input
                          type="radio"
                          name="transportMode"
                          value={option.id}
                          checked={transportMode === option.id}
                          onChange={() => {
                            setTransportMode(option.id);
                            setQuote(null);
                            setShippingOptionId('');
                          }}
                        />
                        <span className="ds-shipping-option__title">{option.label}</span>
                      </label>
                    ))}
                  </section>
                )}

                <section className="ds-section">
                  <h2>Adresse de livraison</h2>
                  <p className="text-sm text-gray-600">Indiquez au moins la ville ou le quartier.</p>
                  <div className="ds-row-2">
                    <div className="ds-field">
                      <label htmlFor="ds-city">Ville</label>
                      <input
                        id="ds-city"
                        value={form.city}
                        onChange={(e) => updateField('city', e.target.value)}
                        placeholder="Lomé, Cotonou…"
                      />
                    </div>
                    <div className="ds-field">
                      <label htmlFor="ds-district">Quartier</label>
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
                  className="ds-btn-primary mt-6"
                  disabled={quoteLoading || transportLoading}
                  onClick={loadQuote}
                >
                  {transportLoading ? 'Chargement des modes…' : quoteLoading ? 'Calcul des frais…' : 'Continuer'}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <section className="ds-section">
                  <h2>Paiement</h2>
                  <p className="ds-payment__intro">
                    Votre commande est prête. Vous allez régler <strong>{formatCFA(total)}</strong> en toute sécurité.
                  </p>
                  <button
                    type="button"
                    className="ds-btn-primary mt-4"
                    disabled={payLoading || !shippingOptionId}
                    onClick={handlePay}
                  >
                    {payLoading ? 'Redirection en cours…' : 'Payer ma commande'}
                  </button>
                  <button
                    type="button"
                    className="ds-btn-secondary"
                    onClick={() => setStep(1)}
                  >
                    Modifier mes informations
                  </button>
                </section>
              </>
            )}
          </div>

          <div>{summaryBlock}</div>
        </div>
      </main>

      <div className="ds-mobile-bar md:hidden">
        {step === 1 && (
          <button
            type="button"
            className="ds-btn-primary m-0"
            disabled={quoteLoading || transportLoading}
            onClick={loadQuote}
          >
            {transportLoading ? 'Chargement…' : quoteLoading ? 'Calcul…' : `Continuer vers le paiement · ${formatCFA(subtotal)}`}
          </button>
        )}
        {step === 2 && (
          <button
            type="button"
            className="ds-btn-primary m-0"
            disabled={payLoading || !shippingOptionId}
            onClick={handlePay}
          >
            {payLoading ? 'Redirection en cours...' : `Procéder au paiement · ${formatCFA(total)}`}
          </button>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default DropshippingCheckout;
