import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';
import { resolveImageUrl } from '../utils/imageUrl';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FedapayCard from '../components/FedapayCard';
import {
    initiateFedapayDirectPay,
    checkFedapayTransactionStatus,
    buildCartFedapayPayload,
    buildCartOrderPayload,
    submitDirectOrder,
} from '../services/fedapayCheckout';

import { NETWORK_LOGOS, FEDAPAY_COUNTRIES,  } from '../utils/fedapayConfig';
import { calculateDeliveryFee } from '../utils/deliveryPricing';

const getImgUrl = (img) => resolveImageUrl(img) || '';

const normalizeCartItems = (raw) => {
    if (!raw) return [];
    const list = Array.isArray(raw) ? raw : (raw.items || []);
    return list.map((item, index) => {
        const id = item._id || item.productId?._id || item.productId || `item-${index}`;
        const name = item.name || item.productName || item.productId?.name || 'Produit';
        const image = item.image || item.productImage || item.productId?.image || item.images?.[0]?.url || '';
        const price = Number(item.price ?? item.productId?.salePrice ?? item.productId?.price ?? 0);
        const quantity = Number(item.quantity || 1);
        return {
            id,
            name,
            image: getImgUrl(image),
            price,
            quantity,
            lineTotal: price * quantity,
            selectedOptions: item.selectedOptions || {},
            vendorName: item.vendorName || item.productId?.vendorName || '',
        };
    });
};

// ─── Icons inline ─────────────────────────────────────────────────────────────
const ArrowLeft = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5M12 5l-7 7 7 7" />
    </svg>
);
const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 18 4 13" />
    </svg>
);
const TruckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1" /><path d="M16 8h4l3 5v4h-7V8z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
);
const StoreIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l1-6h16l1 6" /><path d="M21 9H3v11a1 1 0 001 1h16a1 1 0 001-1V9z" /><path d="M9 21v-6a3 3 0 016 0v6" />
    </svg>
);
const ZapIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
);
const PackageIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);
const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
    </svg>
);
const PhoneIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

// ─── Options livraison ────────────────────────────────────────────────────────
const SHIPPING_OPTIONS = [
    { value: 'standard', label: 'Livraison standard', delay: '5 – 7 jours ouvrés', fee: 0, icon: <TruckIcon /> },
    { value: 'express',  label: 'Livraison express',  delay: '2 – 3 jours ouvrés', fee: 0, icon: <ZapIcon />   },
    { value: 'pickup',   label: 'Retrait en magasin', delay: 'Disponible sous 24h', fee: 0, icon: <StoreIcon /> },
];

const STEPS = ['Informations', 'Paiement', 'Confirmation'];
const DEFAULT_CENTER = { lat: 6.3703, lng: 2.4336 };

export default function Checkout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { cart: localCart, clearCart } = useCart();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [apiCart, setApiCart] = useState(null);
    const [order, setOrder] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('fedapay');
    const [fedapayCountry, setFedapayCountry] = useState('BJ');
    const [fedapayNetwork, setFedapayNetwork] = useState('mtn');
    const [fedapayPhone, setFedapayPhone] = useState('');
    const [errors, setErrors] = useState([]);
    const [deliveryLocation, setDeliveryLocation] = useState(DEFAULT_CENTER);
    const [showTaxModal, setShowTaxModal] = useState(false);
    const [taxAgreement, setTaxAgreement] = useState(false);
    const [addressSuggestions, setAddressSuggestions] = useState([]);
    const [addressSearching, setAddressSearching] = useState(false);

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        country: 'Togo', city: '', neighborhood: '', address: '', postalCode: '', instructions: '',
    });
    const [shippingMethod, setShippingMethod] = useState('standard');

    // ─── Chargement panier + utilisateur ─────────────────────────────────────
    useEffect(() => {
        const token = localStorage.getItem('dangoToken');
        if (!token) { navigate('/login'); return; }

        const load = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/cart`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    toast.warning('Session expirée. Connectez-vous à nouveau.');
                    navigate('/login', { state: { from: '/checkout' } });
                    return;
                }
                const data = await res.json();
                if (data.success && data.data?.items?.length > 0) {
                    setApiCart(data.data);
                }
            } catch (e) {
                console.error('Erreur chargement panier API :', e);
            }

            try {
                const userData = localStorage.getItem('dangoUser');
                if (userData) {
                    const u = JSON.parse(userData);
                    setForm(prev => ({
                        ...prev,
                        firstName: u.firstName || u.firstname || u.userFirstname || '',
                        lastName:  u.lastName  || u.surname  || '',
                        email:     u.email     || u.userEmail || '',
                        phone:     u.userPhone || u.phone    || '',
                    }));
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate]);

    useEffect(() => {
        if (!fedapayPhone && form.phone) {
            setFedapayPhone(form.phone);
        }
    }, [form.phone]);

    useEffect(() => {
        const searchQuery = form.address?.trim();
        if (!searchQuery || searchQuery.length < 3) {
            setAddressSuggestions([]);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            try {
                setAddressSearching(true);
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&addressdetails=1&accept-language=fr&q=${encodeURIComponent(searchQuery)}`,
                    {
                        signal: controller.signal,
                        headers: { Accept: 'application/json' },
                    }
                );
                const data = await response.json();
                setAddressSuggestions(data.map(item => ({
                    id: item.place_id,
                    label: item.display_name,
                    lat: Number(item.lat),
                    lng: Number(item.lon),
                    address: item.address || {},
                })));
            } catch {
                setAddressSuggestions([]);
            } finally {
                setAddressSearching(false);
            }
        }, 400);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [form.address]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('token') || params.get('status') === 'approved') {
            clearCart?.();
            toast.success('Paiement FedaPay réussi ! Votre commande est en cours de traitement.');
            window.history.replaceState({}, document.title, '/checkout');
        }
    }, [location.search, clearCart]);

    const cartItems = useMemo(() => {
        const apiItems = normalizeCartItems(apiCart);
        if (apiItems.length > 0) return apiItems;
        return normalizeCartItems(localCart);
    }, [apiCart, localCart]);

    const subtotal = useMemo(
        () => cartItems.reduce((sum, item) => sum + item.lineTotal, 0),
        [cartItems]
    );

    const selectedShipping = SHIPPING_OPTIONS.find(o => o.value === shippingMethod);
    const shippingFee = useMemo(() => calculateDeliveryFee({
        country: form.country,
        city: form.city,
        neighborhood: form.neighborhood,
        shippingMethod,
    }), [form.country, form.city, form.neighborhood, shippingMethod]);
    const total = subtotal + shippingFee;

    // ─── Validation étape 1 ───────────────────────────────────────────────────
    const validateStep1 = () => {
        const required = ['firstName', 'email', 'phone', 'country', 'city', 'address'];
        const missing = required.filter(k => !form[k]?.trim());
        if (missing.length) { setErrors(missing); return false; }
        setErrors([]);
        return true;
    };

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        setStep(s => s + 1);
    };

    // ─── Passer la commande ───────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (!cartItems.length) return;

        if (!form.phone || form.phone.replace(/\D/g, '').length < 8) {
            toast.warning('Veuillez renseigner un numéro de téléphone valide.');
            return;
        }

        const token = localStorage.getItem('dangoToken');
        setSubmitting(true);

        if (paymentMethod === 'fedapay') {
            if (!taxAgreement) {
                setShowTaxModal(true);
                toast.warning('Veuillez confirmer la fiche de taxe et les frais avant de continuer.');
                setSubmitting(false);
                return;
            }
            if (!fedapayPhone || !fedapayNetwork) {
                toast.warning('Veuillez renseigner votre réseau et numéro Mobile Money.');
                setSubmitting(false);
                return;
            }

            const selectedCountryObj = FEDAPAY_COUNTRIES.find(c => c.code === fedapayCountry);
            const countryCode = selectedCountryObj?.code || 'BJ';
            const toastId = toast.loading('Veuillez patienter... Envoi de la demande sur votre téléphone.');

            try {
                const payload = buildCartFedapayPayload({
                    form,
                    cartItems: apiCart?.items || cartItems,
                    shippingFee,
                    total,
                    network: fedapayNetwork,
                    fedapayPhone,
                    countryCode,
                });

                const data = await initiateFedapayDirectPay(payload, token);

                toast.update(toastId, {
                    render: 'Demande envoyée ! Confirmez le paiement sur votre téléphone (saisissez votre code secret).',
                    type: 'info',
                    isLoading: true,
                });

                let attempts = 0;
                const maxAttempts = 60;
                const interval = setInterval(async () => {
                    attempts++;
                    try {
                        const statusData = await checkFedapayTransactionStatus(data.transactionId);
                        if (statusData.status === 'approved') {
                            clearInterval(interval);
                            toast.update(toastId, { render: 'Paiement réussi ! Votre commande est validée.', type: 'success', isLoading: false, autoClose: 4000 });
                            clearCart?.();
                            setOrder({ orderNumber: data.orderId ? `#${String(data.orderId).slice(-8).toUpperCase()}` : 'Confirmée' });
                            setStep(4);
                            setSubmitting(false);
                        } else if (statusData.status === 'declined' || statusData.status === 'canceled') {
                            clearInterval(interval);
                            toast.update(toastId, { render: 'Le paiement a été refusé ou annulé.', type: 'error', isLoading: false, autoClose: 4000 });
                            setSubmitting(false);
                        } else if (attempts >= maxAttempts) {
                            clearInterval(interval);
                            toast.update(toastId, { render: "Délai d'attente dépassé.", type: 'warning', isLoading: false, autoClose: 4000 });
                            setSubmitting(false);
                        }
                    } catch (e) { /* keep polling */ }
                }, 5000);
            } catch (err) {
                console.error(err);
                toast.update(toastId, { render: err.message || 'Impossible de démarrer le paiement FedaPay.', type: 'error', isLoading: false, autoClose: 4000 });
                setSubmitting(false);
            }
            return;
        }

        const toastId = toast.loading('Enregistrement de votre commande...');
        try {
            const payload = buildCartOrderPayload({ form, cartItems, subtotal, shippingFee, total, shippingLabel: selectedShipping?.label });
            const data = await submitDirectOrder(payload, token);
            clearCart?.();
            setOrder({ orderNumber: data.achatId ? `#${String(data.achatId).slice(-8).toUpperCase()}` : 'Confirmée' });
            setStep(4);
            toast.update(toastId, { render: 'Commande enregistrée ! Notre équipe vous contactera pour la livraison.', type: 'success', isLoading: false, autoClose: 4000 });
        } catch (err) {
            console.error(err);
            toast.update(toastId, { render: err.message || 'Impossible de finaliser la commande.', type: 'error', isLoading: false, autoClose: 4000 });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Helper champ formulaire ──────────────────────────────────────────────
    const handleSelectLocation = (lat, lng) => {
        setDeliveryLocation({ lat, lng });
        setForm(prev => ({ ...prev, lat, lng }));
    };

    const handleSelectAddressSuggestion = (suggestion) => {
        const city = suggestion.address.city || suggestion.address.town || suggestion.address.village || '';
        const neighborhood = suggestion.address.suburb || suggestion.address.neighbourhood || suggestion.address.quarter || '';
        const country = suggestion.address.country || '';
        const postalCode = suggestion.address.postcode || '';

        setForm(prev => ({
            ...prev,
            address: suggestion.label,
            city,
            neighborhood,
            country,
            postalCode,
            lat: suggestion.lat,
            lng: suggestion.lng,
        }));
        setDeliveryLocation({ lat: suggestion.lat, lng: suggestion.lng });
        setAddressSuggestions([]);
    };

    const field = (name, placeholder, type = 'text', cls = '') => (
        <div className={`relative ${cls}`}>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                value={form[name]}
                onChange={e => {
                    setForm(prev => ({ ...prev, [name]: e.target.value }));
                    if (errors.includes(name)) setErrors(prev => prev.filter(k => k !== name));
                }}
                className={`w-full px-4 py-3 text-sm rounded-xl border bg-white outline-none transition-all
                    ${errors.includes(name)
                        ? 'border-red-400 ring-1 ring-red-200'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-[#ffdc2b]/30'}
                    placeholder:text-gray-400`}
            />
        </div>
    );

    const AddressSearchField = ({ className = '' }) => (
        <div className={`relative ${className}`}>
            <input
                type="text"
                value={form.address}
                onChange={(e) => {
                    setForm(prev => ({ ...prev, address: e.target.value }));
                    if (errors.includes('address')) setErrors(prev => prev.filter(k => k !== 'address'));
                }}
                placeholder="Rechercher une adresse, un quartier ou une ville"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition-all focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-[#ffdc2b]/30"
            />
            {addressSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400">Recherche…</div>
            )}
            {addressSuggestions.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl">
                    {addressSuggestions.map((suggestion) => (
                        <button
                            key={suggestion.id}
                            type="button"
                            onClick={() => handleSelectAddressSuggestion(suggestion)}
                            className="block w-full border-b border-gray-100 px-3 py-3 text-left transition hover:bg-gray-50 last:border-b-0"
                        >
                            <p className="text-sm font-semibold text-gray-900">{suggestion.label}</p>
                            <p className="mt-1 text-[11px] text-gray-500">Cliquez pour utiliser cette adresse</p>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // ─── Guards ───────────────────────────────────────────────────────────────
    if (loading) return (
        <>
            <Header />
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f5f5f5]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-3 border-gray-200 border-t-[#ffdc2b] rounded-full animate-spin" />
                    <p className="text-[13px] text-gray-400 font-medium">Chargement de votre panier…</p>
                </div>
            </div>
            <Footer />
        </>
    );

    if (!cartItems?.length) return (
        <>
            <Header />
            <div className="min-h-[60vh] bg-[#f5f5f5] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-24 h-24 bg-[#ffdc2b]/15 border-4 border-[#ffdc2b]/30 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-400">
                        <PackageIcon />
                    </div>
                    <p className="font-black text-gray-900 text-[18px] mb-2">Votre panier est vide</p>
                    <p className="text-gray-500 text-[13px] mb-6">Ajoutez des produits avant de finaliser votre commande.</p>
                    <button type="button" onClick={() => navigate('/shopping')} className="bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black px-8 py-3.5 rounded-full transition-all">
                        Explorer le catalogue
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );

    // ─── Pays actif ───────────────────────────────────────────────────────────
    const activeCountry = FEDAPAY_COUNTRIES.find(c => c.code === fedapayCountry);

    return (
        <div className="min-h-screen bg-[#f5f5f5] dark:bg-[#0f1115] flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Header />

            {/* ── Barre checkout ──────────────────────────────────────────────── */}
            <div className="bg-white dark:bg-[#1a1d24] border-b border-gray-200 dark:border-gray-800">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => (step > 1 ? setStep(s => s - 1) : navigate('/cart'))}
                        className="flex items-center gap-2 text-gray-500 hover:text-[#b8a000] transition text-[13px] font-semibold"
                    >
                        <ArrowLeft />
                        <span className="hidden sm:inline">{step > 1 ? 'Étape précédente' : 'Retour au panier'}</span>
                    </button>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[#ffdc2b]" />
                        <span className="font-black text-gray-900 dark:text-white text-[14px] sm:text-[15px]">Finaliser la commande</span>
                    </div>
                    <div className="w-20 sm:w-28" />
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
                {showTaxModal && (
                    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 px-4 py-6">
                        <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-xl">
                            <div className="border-b border-gray-200 px-5 py-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-500">Avant paiement</p>
                                        <h3 className="mt-1 text-lg font-black text-gray-900">Fiche de taxe et frais</h3>
                                    </div>
                                    <button type="button" onClick={() => setShowTaxModal(false)} className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700">✕</button>
                                </div>
                            </div>

                            <div className="space-y-4 p-5 text-sm text-gray-600">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Sous-total</p>
                                        <p className="mt-1 font-black text-gray-900">{subtotal.toLocaleString('fr-FR')} F</p>
                                    </div>
                                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                                        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-400">Total estimé</p>
                                        <p className="mt-1 font-black text-gray-900">{total.toLocaleString('fr-FR')} F</p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-200 bg-[#f9fafb] p-4">
                                    <p className="font-semibold text-gray-900">À savoir</p>
                                    <ul className="mt-2 space-y-1.5 text-sm text-gray-600">
                                        <li>• Les frais de livraison et les commissions peuvent varier selon la destination.</li>
                                        <li>• Le montant affiché est une estimation avant validation du paiement.</li>
                                    </ul>
                                </div>

                                <label className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
                                    <input type="checkbox" checked={taxAgreement} onChange={(e) => setTaxAgreement(e.target.checked)} className="mt-1 h-4 w-4 rounded border-gray-300 text-[#ffdc2b] focus:ring-[#ffdc2b]" />
                                    <span>Je confirme avoir pris connaissance de la fiche de taxe et accepte les frais estimés.</span>
                                </label>
                            </div>

                            <div className="flex justify-end gap-3 border-t border-gray-200 bg-gray-50 px-5 py-4">
                                <button type="button" onClick={() => setShowTaxModal(false)} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-white">Fermer</button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setTaxAgreement(true);
                                        setShowTaxModal(false);
                                        if (paymentMethod === 'fedapay') {
                                            document.getElementById('checkout-pay-button')?.click();
                                        }
                                    }}
                                    className="rounded-full bg-[#ffdc2b] px-4 py-2 text-sm font-black text-gray-900 transition hover:bg-[#e6c600]"
                                >
                                    Confirmer et envoyer l’USSD
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Stepper ─────────────────────────────────────────────────── */}
                <div className="flex items-center justify-center mb-8 sm:mb-10">
                    {STEPS.map((label, i) => {
                        const num = i + 1;
                        const done   = step > num;
                        const active = step === num;
                        return (
                            <React.Fragment key={num}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-black transition-all duration-300
                                        ${done   ? 'bg-[#ffdc2b] text-[#111] shadow-md'
                                               : active ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white ring-4 ring-gray-100 dark:ring-gray-800 shadow-md'
                                               : 'bg-gray-50 dark:bg-gray-900 text-gray-400'}`}>
                                        {done ? <CheckIcon /> : num}
                                    </div>
                                    <span className={`text-[11px] font-bold hidden sm:block transition-colors mt-1
                                        ${active ? 'text-gray-900 dark:text-white' : done ? 'text-gray-800 dark:text-gray-200' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-3 mb-5 transition-colors duration-500 max-w-[80px] rounded-full
                                        ${step > num ? 'bg-[#ffdc2b]' : 'bg-gray-200 dark:bg-gray-700'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ── Grid principal ───────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

                    {/* ── Colonne formulaire ───────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm">

                            {/* ── ÉTAPE 1 — Informations ───────────────────────── */}
                            {step === 1 && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Vos informations</h2>
                                    <div className="space-y-3.5">
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('firstName', 'Prénom *')}
                                            {field('lastName',  'Nom')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('email', 'Email *', 'email')}
                                            {field('phone', 'Téléphone *', 'tel')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('country', 'Pays *')}
                                            {field('city',    'Ville *')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('neighborhood', 'Quartier')}
                                            {field('postalCode',   'Code postal')}
                                        </div>
                                        <div className="col-span-full">
                                            <AddressSearchField />
                                        </div>
                                        <textarea
                                            name="instructions"
                                            placeholder="Instructions de livraison (optionnel)"
                                            value={form.instructions}
                                            onChange={e => setForm(prev => ({ ...prev, instructions: e.target.value }))}
                                            rows={3}
                                            className="w-full px-4 py-3 text-sm rounded-xl border border-gray-200 bg-white outline-none focus:border-gray-900 focus:ring-2 focus:ring-[#ffdc2b]/30 placeholder:text-gray-400 resize-none transition-all"
                                        />
                                    </div>
                                    {errors.length > 0 && (
                                        <p className="mt-4 text-xs text-red-600 font-medium">
                                            Veuillez remplir tous les champs obligatoires (*).
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── ÉTAPE 2 — Paiement ───────────────────────────── */}
                            {step === 2 && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-1">Paiement</h2>
                                    <p className="text-sm text-gray-500 mb-5">Choisissez votre mode de règlement.</p>

                                    <div className="space-y-3">

                                        {/* ── Option FedaPay / Mobile Money ─────── */}
                                        <div
                                            className={`rounded-xl border-2 overflow-hidden transition-all cursor-pointer
                                                ${paymentMethod === 'fedapay' ? 'border-gray-900' : 'border-gray-200 hover:border-gray-300'}`}
                                            onClick={() => setPaymentMethod('fedapay')}
                                        >
                                            {/* En-tête option */}
                                            <div className="flex items-center gap-3 p-4">
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900 text-sm">Mobile Money via FedaPay</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">MTN, Moov, Orange, Wave, T-Money…</p>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                                                    ${paymentMethod === 'fedapay' ? 'border-gray-900' : 'border-gray-300'}`}>
                                                    {paymentMethod === 'fedapay' && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                                </div>
                                            </div>

                                            {/* Formulaire FedaPay (visible si sélectionné) */}
                                            {paymentMethod === 'fedapay' && (
                                                <div
                                                    className="px-4 pb-4"
                                                    onClick={e => e.stopPropagation()}
                                                >
                                                    <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-5">

                                                        {/* Sélection pays */}
                                                        <div>
                                                            <div className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 mb-3">
                                                                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500">All categories</p>
                                                                <p className="text-[11px] text-gray-500">Featured selection</p>
                                                                <p className="text-[11px] text-gray-500">Help center</p>
                                                            </div>
                                                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">1 — Votre pays</p>
                                                            <div className="grid grid-cols-4 gap-1.5">
                                                                {FEDAPAY_COUNTRIES.map(country => (
                                                                    <button
                                                                        key={country.code}
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setFedapayCountry(country.code);
                                                                            setFedapayNetwork(country.networks[0].value);
                                                                        }}
                                                                        className={`py-2 px-1 rounded-lg border-2 flex flex-col items-center justify-center gap-1 transition-all
                                                                            ${fedapayCountry === country.code
                                                                                ? 'border-gray-900 bg-gray-900'
                                                                                : 'border-gray-200 bg-white hover:border-gray-400'}`}
                                                                    >
                                                                        <span className="text-base leading-none">{country.flag}</span>
                                                                        <span className={`text-[9px] font-bold uppercase tracking-wide text-center leading-tight
                                                                            ${fedapayCountry === country.code ? 'text-[#ffdc2b]' : 'text-gray-500'}`}>
                                                                            {country.name.split(' ')[0]}
                                                                        </span>
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Sélection opérateur */}
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2.5">2 — Opérateur Mobile Money</p>
                                                            <div className={`grid gap-2 ${activeCountry?.networks.length >= 4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
                                                                {activeCountry?.networks.map(net => (
                                                                    <button
                                                                        key={net.value}
                                                                        type="button"
                                                                        onClick={() => setFedapayNetwork(net.value)}
                                                                        className={`relative flex flex-col items-center gap-2 p-2.5 rounded-xl border-2 transition-all
                                                                            ${fedapayNetwork === net.value
                                                                                ? 'border-[#ffdc2b] bg-[#ffdc2b]/8 shadow-sm'
                                                                                : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                                                    >
                                                                        {/* Logo opérateur : SVG inline, 100% fiable */}

                                                                        <span className={`text-[11px] font-bold leading-tight text-center
                                                                            ${fedapayNetwork === net.value ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                            {net.label}
                                                                        </span>
                                                                        {fedapayNetwork === net.value && (
                                                                            <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#ffdc2b] rounded-full flex items-center justify-center shadow">
                                                                                <CheckIcon />
                                                                            </div>
                                                                        )}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>

                                                        {/* Numéro téléphone */}
                                                        <div>
                                                            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-2">3 — Numéro Mobile Money</p>
                                                            <div className="relative">
                                                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                                    <PhoneIcon />
                                                                </span>
                                                                <input
                                                                    type="tel"
                                                                    value={fedapayPhone}
                                                                    onChange={e => setFedapayPhone(e.target.value)}
                                                                    placeholder="Ex : 61 00 00 00"
                                                                    className="w-full pl-11 pr-4 py-3 text-sm font-semibold rounded-xl border-2 border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-[#ffdc2b]/30 outline-none transition-all bg-white"
                                                                />
                                                            </div>
                                                            <p className="text-[11px] text-gray-400 mt-2 flex items-center gap-1.5">
                                                                <ZapIcon />
                                                                Une demande USSD sera envoyée à ce numéro via FedaPay.
                                                            </p>
                                                        </div>

                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Option paiement à la livraison ────── */}
                                        <div
                                            className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                                                ${paymentMethod === 'cash'
                                                    ? 'border-gray-900 bg-[#fffbeb]'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'}`}
                                            onClick={() => setPaymentMethod('cash')}
                                        >
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">Paiement à la livraison</p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Réglez en espèces ou Mobile Money à la réception. La commande est enregistrée sans paiement en ligne.
                                                </p>
                                            </div>
                                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all
                                                ${paymentMethod === 'cash' ? 'border-gray-900' : 'border-gray-300'}`}>
                                                {paymentMethod === 'cash' && <div className="w-2 h-2 rounded-full bg-gray-900" />}
                                            </div>
                                        </div>

                                    </div>

                                    {/* Récap totaux */}
                                    <div className="mt-5 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-sm">
                                        <div className="flex justify-between text-gray-500">
                                            <span>Sous-total</span>
                                            <span className="font-semibold text-gray-900">{subtotal.toLocaleString('fr-FR')} F</span>
                                        </div>
                                        <div className="flex justify-between text-gray-500">
                                            <span>Livraison — {selectedShipping?.label}</span>
                                            <span className="font-semibold text-gray-900">{shippingFee > 0 ? `${shippingFee.toLocaleString('fr-FR')} F` : 'Gratuit'}</span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-200 font-bold text-gray-900">
                                            <span>Total à payer</span>
                                            <span className="text-lg">
                                                {total.toLocaleString('fr-FR')} F
                                            </span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-3 flex items-center gap-1.5">
                                        <LockIcon />
                                        Commande sécurisée — vos données sont protégées
                                    </p>
                                </div>
                            )}

                            {/* ── ÉTAPE 4 — Confirmation ───────────────────────── */}
                            {step === 3 && order && (
                                <div className="p-8 sm:p-12 text-center">
                                    <div className="w-20 h-20 bg-[#ffdc2b] rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 18 4 13" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Commande confirmée ! 🎉</h2>
                                    <p className="text-gray-500 text-[13px] mb-1">Numéro de commande</p>
                                    <p className="text-[#111] dark:text-white font-black text-[20px] bg-[#ffdc2b]/20 border border-[#ffdc2b]/40 px-4 py-2 rounded-xl inline-block mb-5">{order.orderNumber}</p>
                                    <p className="text-[14px] text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto leading-relaxed">
                                        {paymentMethod === 'cash'
                                            ? <>Nous vous contacterons au <strong className="text-gray-900 dark:text-white">{form.phone}</strong> pour confirmer la livraison.</>
                                            : <>Un email de confirmation a été envoyé à <strong className="text-gray-900 dark:text-white">{form.email}</strong>.</> }
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/mes-commandes')}
                                        className="bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black px-10 py-4 rounded-full transition-all hover:-translate-y-0.5 hover:shadow-lg text-[15px]"
                                    >
                                        Suivre mes commandes
                                    </button>
                                </div>
                            )}

                            {/* ── Boutons navigation ───────────────────────────── */}
                            {step < 3 && (
                                <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep(s => s - 1)}
                                            className="flex-1 border-2 border-gray-200 dark:border-gray-700 hover:border-[#ffdc2b] text-gray-700 dark:text-gray-300 font-bold py-3.5 rounded-full transition-all text-[14px]"
                                        >
                                            ← Retour
                                        </button>
                                    )}
                                    {step < 2 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-1 bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black py-3.5 rounded-full transition-all hover:shadow-lg text-[14px]"
                                        >
                                            Continuer →
                                        </button>
                                    ) : (
                                        <button
                                            id="checkout-pay-button"
                                            type="button"
                                            onClick={handlePlaceOrder}
                                            disabled={submitting}
                                            className="flex-1 bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed font-black py-3.5 rounded-full transition-all hover:shadow-lg text-[14px] flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin" />
                                                    {paymentMethod === 'fedapay' ? 'Envoi du Push USSD…' : 'Enregistrement…'}
                                                </>
                                            ) : paymentMethod === 'fedapay' ? (
                                                <>
                                                    <LockIcon />
                                                    Payer {total.toLocaleString('fr-FR')} FCFA
                                                </>
                                            ) : (
                                                <>
                                                    <CheckIcon />
                                                    Confirmer la commande
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Sidebar résumé commande ──────────────────────────────── */}
                    <aside className="lg:col-span-2">
                        <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 p-5 sticky top-28 shadow-sm">
                            <h3 className="font-black text-gray-900 dark:text-white text-[15px] mb-4 flex items-center gap-2.5 pb-3.5 border-b border-gray-100 dark:border-gray-800">
                                <span className="w-8 h-8 rounded-xl bg-[#ffdc2b] flex items-center justify-center text-[#111]">
                                    <PackageIcon />
                                </span>
                                Votre commande
                            </h3>

                            <ul className="space-y-3 mb-4 pb-4 border-b border-gray-100 max-h-72 overflow-y-auto">
                                {cartItems?.map(item => (
                                    <li key={item.id} className="flex gap-3 items-start">
                                        <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center">
                                            {item.image
                                                ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" onError={e => { e.target.style.display = 'none'; }} />
                                                : <PackageIcon />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 line-clamp-2">{item.name}</p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Qté : {item.quantity}
                                                {item.selectedOptions?.color && ` · ${item.selectedOptions.color}`}
                                                {item.selectedOptions?.size  && ` · ${item.selectedOptions.size}`}
                                            </p>
                                        </div>
                                        <p className="text-xs font-semibold text-gray-800 shrink-0">
                                            {item.lineTotal.toLocaleString('fr-FR')} F
                                        </p>
                                    </li>
                                ))}
                            </ul>

                            <p className="text-[11px] text-gray-400 mb-4">
                                {cartItems.length} article{cartItems.length > 1 ? 's' : ''}
                            </p>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Sous-total</span>
                                    <span className="font-semibold text-gray-800">{subtotal.toLocaleString('fr-FR')} F</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Livraison</span>
                                    <span className="font-semibold text-gray-900">{shippingFee > 0 ? `${shippingFee.toLocaleString('fr-FR')} F` : 'Gratuit'}</span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-5 px-5 py-3 rounded-b-2xl">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900 text-lg">{total.toLocaleString('fr-FR')} F</span>
                            </div>

                            <div className="mt-4 space-y-2">
                                {['Paiement en ligne FedaPay', 'Paiement à la livraison', 'Adresse enregistrée'].map(label => (
                                    <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-1 h-1 rounded-full bg-[#ffdc2b] shrink-0" />
                                        <span>{label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
            <Footer />
        </div>
    );
}