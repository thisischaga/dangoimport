import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';
import { useCart } from '../context/CartContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FedapayCard from '../components/FedapayCard';
import {
    initiateFedapayCheckout,
    buildCartFedapayPayload,
    buildCartOrderPayload,
    submitDirectOrder,
} from '../services/fedapayCheckout';

const getImgUrl = (img) => {
    if (!img) return '';
    if (img.startsWith('http') || img.startsWith('data:')) return img;
    return `${API_BASE_URL}/images/${img}`;
};

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

// ─── Icons inline pour éviter les dépendances ────────────────────────────────
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
        <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
);

// ─── Options livraison avec frais fixes ───────────────────────────────────────
const SHIPPING_OPTIONS = [
    {
        value: 'standard',
        label: 'Livraison standard',
        delay: '5 – 7 jours ouvrés',
        fee: 2500,
        icon: <TruckIcon />,
    },
    {
        value: 'express',
        label: 'Livraison express',
        delay: '2 – 3 jours ouvrés',
        fee: 5000,
        icon: <ZapIcon />,
    },
    {
        value: 'pickup',
        label: 'Retrait en magasin',
        delay: 'Disponible sous 24h',
        fee: 0,
        icon: <StoreIcon />,
    },
];

// ─── Steps config ─────────────────────────────────────────────────────────────
const STEPS = ['Informations', 'Livraison', 'Paiement', 'Confirmation'];

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

    const [form, setForm] = useState({
        firstName: '', lastName: '', email: '', phone: '',
        country: 'Togo', city: '', neighborhood: '', address: '', postalCode: '', instructions: '',
    });
    const [shippingMethod, setShippingMethod] = useState('standard');

    // ─── Load cart API + user ────────────────────────────────────────────────
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
                        lastName: u.lastName || u.surname || '',
                        email: u.email || u.userEmail || '',
                        phone: u.userPhone || u.phone || '',
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

    // Retour après paiement FedaPay
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
    const shippingFee = selectedShipping?.fee ?? 0;
    const total = subtotal + shippingFee;

    // ─── Validation étape 1 ───────────────────────────────────────────────────
    const validateStep1 = () => {
        const required = ['firstName', 'email', 'phone', 'country', 'city', 'address'];
        const missing = required.filter(k => !form[k]?.trim());
        if (missing.length) {
            // highlight manquants visuellement via state
            setErrors(missing);
            return false;
        }
        setErrors([]);
        return true;
    };
    const [errors, setErrors] = useState([]);

    const handleNext = () => {
        if (step === 1 && !validateStep1()) return;
        setStep(s => s + 1);
    };

    // ─── Passer la commande ──────────────────────────────────────────────────
    const handlePlaceOrder = async () => {
        if (!cartItems.length) return;

        if (!form.phone || form.phone.replace(/\D/g, '').length < 8) {
            toast.warning('Veuillez renseigner un numéro de téléphone valide.');
            return;
        }

        const token = localStorage.getItem('dangoToken');
        setSubmitting(true);

        if (paymentMethod === 'fedapay') {
            const toastId = toast.loading('Redirection vers FedaPay...');
            try {
                const payload = buildCartFedapayPayload({
                    form,
                    cartItems,
                    subtotal,
                    shippingFee,
                    total,
                    shippingLabel: selectedShipping?.label,
                });

                const data = await initiateFedapayCheckout(payload, token);

                toast.update(toastId, {
                    render: 'Ouverture du paiement sécurisé FedaPay...',
                    type: 'success',
                    isLoading: false,
                    autoClose: 2000,
                });

                setTimeout(() => {
                    window.location.href = data.url;
                }, 600);
            } catch (err) {
                console.error(err);
                toast.update(toastId, {
                    render: err.message || 'Impossible de démarrer le paiement FedaPay.',
                    type: 'error',
                    isLoading: false,
                    autoClose: 4000,
                });
                setSubmitting(false);
            }
            return;
        }

        const toastId = toast.loading('Enregistrement de votre commande...');
        try {
            const payload = buildCartOrderPayload({
                form,
                cartItems,
                subtotal,
                shippingFee,
                total,
                shippingLabel: selectedShipping?.label,
            });

            const data = await submitDirectOrder(payload, token);

            clearCart?.();
            setOrder({
                orderNumber: data.achatId
                    ? `#${String(data.achatId).slice(-8).toUpperCase()}`
                    : 'Confirmée',
            });
            setStep(4);

            toast.update(toastId, {
                render: 'Commande enregistrée ! Notre équipe vous contactera pour la livraison.',
                type: 'success',
                isLoading: false,
                autoClose: 4000,
            });
        } catch (err) {
            console.error(err);
            toast.update(toastId, {
                render: err.message || 'Impossible de finaliser la commande.',
                type: 'error',
                isLoading: false,
                autoClose: 4000,
            });
        } finally {
            setSubmitting(false);
        }
    };

    // ─── Field helper ─────────────────────────────────────────────────────────
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
                        ? 'border-gray-900 ring-1 ring-gray-300'
                        : 'border-gray-200 focus:border-gray-900 focus:ring-2 focus:ring-[#ffdc2b]/30'}
          placeholder:text-gray-400`}
            />
        </div>
    );

    // ─── Guards ───────────────────────────────────────────────────────────────
    if (loading) return (
        <>
            <Header />
            <div className="min-h-[60vh] flex items-center justify-center bg-[#f8f9fa]">
                <div className="w-10 h-10 border-2 border-gray-200 border-t-gray-900 rounded-full animate-spin" />
            </div>
            <Footer />
        </>
    );

    if (!cartItems.length) return (
        <>
            <Header />
            <div className="min-h-[60vh] bg-[#f8f9fa] flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                        <PackageIcon />
                    </div>
                    <p className="font-semibold text-gray-700">Votre panier est vide</p>
                    <button
                        type="button"
                        onClick={() => navigate('/shopping')}
                        className="btn-brand px-6 py-2.5 rounded-xl text-sm"
                    >
                        Continuer mes achats
                    </button>
                </div>
            </div>
            <Footer />
        </>
    );

    return (
        <div className="min-h-screen bg-[#f8f9fa] flex flex-col" style={{ fontFamily: "'Outfit', sans-serif" }}>
            <Header />

            {/* ── Barre checkout ─────────────────────────────────────────────────── */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
                    <button
                        type="button"
                        onClick={() => (step > 1 ? setStep((s) => s - 1) : navigate('/cart'))}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition text-sm font-medium"
                    >
                        <ArrowLeft />
                        <span className="hidden sm:inline">{step > 1 ? 'Étape précédente' : 'Retour au panier'}</span>
                    </button>
                    <span className="font-bold text-gray-900 text-sm sm:text-base">Finaliser la commande</span>
                    <div className="w-20 sm:w-28" />
                </div>
            </div>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">

                {/* ── Stepper ──────────────────────────────────────────────────────── */}
                <div className="flex items-center justify-center mb-8 sm:mb-10">
                    {STEPS.map((label, i) => {
                        const num = i + 1;
                        const done = step > num;
                        const active = step === num;
                        return (
                            <React.Fragment key={num}>
                                <div className="flex flex-col items-center gap-1.5">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300
                    ${done ? 'bg-[#2d3748] text-[#ffdc2b]' :
                                            active ? 'bg-[#fffbeb] text-[#2d3748] ring-4 ring-[#ffdc2b]/20 border border-[#ffdc2b]/40' :
                                                'bg-gray-200 text-gray-400'}`}>
                                        {done ? <CheckIcon /> : num}
                                    </div>
                                    <span className={`text-xs font-medium hidden sm:block transition-colors
                    ${active ? 'text-gray-900' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                                        {label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 sm:mx-3 mb-4 transition-colors duration-500 max-w-[60px]
                    ${step > num ? 'bg-[#fff0a0]' : 'bg-gray-200'}`} />
                                )}
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* ── Grid ─────────────────────────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

                    {/* ── Colonne principale ──────────────────────────────────────────── */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">

                            {/* ÉTAPE 1 — Informations ───────────────────────────────────── */}
                            {step === 1 && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Vos informations</h2>
                                    <div className="space-y-3.5">
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('firstName', 'Prénom *')}
                                            {field('lastName', 'Nom')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('email', 'Email *', 'email')}
                                            {field('phone', 'Téléphone *', 'tel')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('country', 'Pays *')}
                                            {field('city', 'Ville *')}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {field('neighborhood', 'Quartier')}
                                            {field('postalCode', 'Code postal')}
                                        </div>
                                        {field('address', 'Adresse complète *', 'text', 'col-span-full')}
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
                                        <p className="mt-4 text-xs text-gray-700 font-medium">
                                            Veuillez remplir tous les champs obligatoires (*).
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ÉTAPE 2 — Livraison ──────────────────────────────────────── */}
                            {step === 2 && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-6">Mode de livraison</h2>
                                    <div className="space-y-3">
                                        {SHIPPING_OPTIONS.map(opt => (
                                            <label
                                                key={opt.value}
                                                onClick={() => setShippingMethod(opt.value)}
                                                className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                          ${shippingMethod === opt.value
                                                        ? 'border-gray-900 bg-[#ffdc2b]/10'
                                                        : 'border-gray-200 hover:border-gray-400 bg-white'}`}
                                            >
                                                <div className={`p-2 rounded-xl transition-colors
                          ${shippingMethod === opt.value ? 'bg-[#2d3748] text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                    {opt.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-gray-900 text-sm">{opt.label}</p>
                                                    <p className="text-xs text-gray-500 mt-0.5">{opt.delay}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className={`font-bold text-sm ${shippingMethod === opt.value ? 'text-gray-900' : 'text-gray-700'}`}>
                                                        {opt.fee === 0 ? 'Gratuit' : `${opt.fee.toLocaleString('fr-FR')} F`}
                                                    </p>
                                                </div>
                                                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-all
                          ${shippingMethod === opt.value ? 'border-gray-900' : 'border-gray-300'}`}>
                                                    {shippingMethod === opt.value && (
                                                        <div className="w-2 h-2 rounded-full bg-gray-900" />
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* ÉTAPE 3 — Paiement ───────────────────────────────────────── */}
                            {step === 3 && (
                                <div className="p-6 sm:p-8">
                                    <h2 className="text-lg font-bold text-gray-900 mb-2">Paiement</h2>
                                    <p className="text-sm text-gray-500 mb-6">
                                        Choisissez votre mode de paiement. Pour payer en ligne, vous serez redirigé vers FedaPay.
                                    </p>

                                    <div className="space-y-3">
                                        <label
                                            className={`block cursor-pointer rounded-xl transition-all ${
                                                paymentMethod === 'fedapay' ? 'ring-2 ring-gray-900' : ''
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="fedapay"
                                                checked={paymentMethod === 'fedapay'}
                                                onChange={() => setPaymentMethod('fedapay')}
                                                className="sr-only"
                                            />
                                            <FedapayCard selected={paymentMethod === 'fedapay'} />
                                        </label>

                                        <label
                                            className={`block cursor-pointer rounded-xl border-2 p-4 flex items-start gap-4 transition-all ${
                                                paymentMethod === 'cash'
                                                    ? 'border-gray-900 bg-[#fffbeb]'
                                                    : 'border-gray-200 bg-white hover:border-gray-300'
                                            }`}
                                        >
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                value="cash"
                                                checked={paymentMethod === 'cash'}
                                                onChange={() => setPaymentMethod('cash')}
                                                className="sr-only"
                                            />
                                            <div className="w-10 h-10 rounded-lg bg-[#2d3748] text-[#ffdc2b] flex items-center justify-center shrink-0">
                                                <TruckIcon />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-semibold text-gray-900 text-sm">Paiement à la livraison</p>
                                                <p className="text-xs text-gray-600 mt-1">
                                                    Réglez en espèces ou Mobile Money à la réception. La commande est enregistrée sans paiement en ligne.
                                                </p>
                                            </div>
                                            {paymentMethod === 'cash' && (
                                                <div className="w-4 h-4 rounded-full border-2 border-gray-900 flex items-center justify-center shrink-0">
                                                    <div className="w-2 h-2 rounded-full bg-gray-900" />
                                                </div>
                                            )}
                                        </label>
                                    </div>

                                    <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1.5 text-sm">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Sous-total</span>
                                            <span className="font-medium text-gray-900">{subtotal.toLocaleString('fr-FR')} F</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Livraison — {selectedShipping?.label}</span>
                                            <span className="font-medium text-gray-900">
                                                {shippingFee === 0 ? 'Gratuit' : `${shippingFee.toLocaleString('fr-FR')} F`}
                                            </span>
                                        </div>
                                        <div className="flex justify-between pt-2 border-t border-gray-200 font-bold text-gray-900">
                                            <span>Total à payer</span>
                                            <span className="text-base bg-[#fff0a0] border border-[#f5dc7a] px-2 py-0.5 rounded">{total.toLocaleString('fr-FR')} F</span>
                                        </div>
                                    </div>

                                    <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                        </svg>
                                        Commande sécurisée — vos données sont protégées
                                    </p>
                                </div>
                            )}

                            {/* ÉTAPE 4 — Confirmation ───────────────────────────────────── */}
                            {step === 4 && order && (
                                <div className="p-8 text-center">
                                    <div className="w-16 h-16 bg-[#fffbeb] text-[#2d3748] border border-[#ffdc2b]/35 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                            <polyline points="20 6 9 18 4 13" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-2">Commande confirmée !</h2>
                                    <p className="text-gray-500 text-sm mb-1">Numéro de commande</p>
                                    <p className="text-gray-900 font-bold text-lg mb-6">{order.orderNumber}</p>
                                    <p className="text-sm text-gray-500 mb-6">
                                        {paymentMethod === 'cash'
                                            ? <>Nous vous contacterons au <strong>{form.phone}</strong> pour confirmer la livraison.</>
                                            : <>Un email de confirmation vous a été envoyé à <strong>{form.email}</strong>.</>}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => navigate('/mes-commandes')}
                                        className="btn-brand px-8 py-3 rounded-xl text-sm"
                                    >
                                        Suivre mes commandes
                                    </button>
                                </div>
                            )}

                            {/* ── Navigation boutons ──────────────────────────────────── */}
                            {step < 4 && (
                                <div className="px-6 sm:px-8 pb-6 sm:pb-8 flex gap-3">
                                    {step > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => setStep((s) => s - 1)}
                                            className="flex-1 btn-brand-outline py-3 rounded-xl text-sm"
                                        >
                                            Retour
                                        </button>
                                    )}
                                    {step < 3 ? (
                                        <button
                                            type="button"
                                            onClick={handleNext}
                                            className="flex-1 btn-brand py-3 rounded-xl text-sm"
                                        >
                                            Continuer
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handlePlaceOrder}
                                            disabled={submitting}
                                            className="flex-1 btn-brand disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <div className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                                                    {paymentMethod === 'fedapay' ? 'Redirection…' : 'Enregistrement…'}
                                                </>
                                            ) : paymentMethod === 'fedapay' ? (
                                                <>
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
                                                    </svg>
                                                    Payer {total.toLocaleString('fr-FR')} F via FedaPay
                                                </>
                                            ) : (
                                                <>
                                                    <CheckIcon />
                                                    Confirmer — {total.toLocaleString('fr-FR')} F à la livraison
                                                </>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Résumé commande (sidebar) ──────────────────────────────────── */}
                    <aside className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 p-5 sticky top-28">
                            <h3 className="font-bold text-gray-900 text-sm mb-4 flex items-center gap-2 pb-3 border-b border-gray-100">
                                <span className="w-7 h-7 rounded-lg bg-[#2d3748] flex items-center justify-center text-[#ffdc2b]">
                                    <PackageIcon />
                                </span>
                                Votre commande
                            </h3>

                            {/* Articles */}
                            <ul className="space-y-3 mb-4 pb-4 border-b border-gray-100 max-h-72 overflow-y-auto">
                                {cartItems.map((item) => (
                                    <li key={item.id} className="flex gap-3 items-start">
                                        <div className="w-12 h-12 rounded-lg border border-gray-100 bg-gray-50 shrink-0 overflow-hidden flex items-center justify-center">
                                            {item.image ? (
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-contain"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            ) : (
                                                <PackageIcon />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-gray-800 line-clamp-2">
                                                {item.name}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                Qté : {item.quantity}
                                                {item.selectedOptions?.color && ` · ${item.selectedOptions.color}`}
                                                {item.selectedOptions?.size && ` · ${item.selectedOptions.size}`}
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

                            {/* Totaux */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between text-gray-500">
                                    <span>Sous-total</span>
                                    <span className="font-medium text-gray-800">{subtotal.toLocaleString('fr-FR')} F</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>Livraison</span>
                                    <span className="font-medium text-gray-800">
                                        {shippingFee === 0 ? <span className="text-gray-900 font-semibold">Gratuit</span> : `${shippingFee.toLocaleString('fr-FR')} F`}
                                    </span>
                                </div>
                            </div>

                            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200 bg-gray-50 -mx-5 px-5 py-3 rounded-b-2xl">
                                <span className="font-bold text-gray-900">Total</span>
                                <span className="font-bold text-gray-900 text-lg">{total.toLocaleString('fr-FR')} F</span>
                            </div>

                            <div className="mt-4 space-y-2">
                                {[
                                    'Paiement en ligne FedaPay',
                                    'Paiement à la livraison',
                                    'Livraison suivie',
                                ].map((label) => (
                                    <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-1 h-1 rounded-full bg-[#ffdc2b]" />
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