import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Share2, Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Store, BadgeCheck, ChevronRight, Ticket, Truck, ShieldCheck, ShoppingCart, Sparkles, X } from 'lucide-react';
import toast from '../utils/toast';
import { useConfirm } from '../components/ui/ConfirmDialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../apiConfig';
import client from '../apiClient';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} F`;

const quantitySelectorButton =
  'h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100';

const getStockBadge = (stock) => {
  const n = Number(stock);
  if (!Number.isFinite(n) || n <= 0) return { label: 'Rupture de stock', cls: 'bg-rose-50 text-rose-700' };
  if (n <= 5) return { label: `Stock faible · ${n} restant(s)`, cls: 'bg-amber-50 text-amber-700' };
  return { label: 'En stock', cls: 'bg-emerald-50 text-emerald-700' };
};

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, subtotal, shipping, total, getCartCount } = useCart();
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [promoState, setPromoState] = useState({ loading: false, success: false, message: '' });
  const [promoPreview, setPromoPreview] = useState(null);
  const [wishlist, setWishlist] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('dangoWishlist') || '[]');
    } catch {
      return [];
    }
  });

  const getItemPrice = (item) => {
    const price = Number(item.promoPrice) > 0 && Number(item.promoPrice) < Number(item.price || 0)
      ? Number(item.promoPrice)
      : Number(item.salePrice) > 0
      ? Number(item.salePrice)
      : Number(item.price || 0);
    return Number.isFinite(price) ? price : 0;
  };

  const groupedByVendor = useMemo(() => {
    const groups = {};
    for (const item of cart) {
      const vendorName = item.vendorName || item.vendor || 'Dangoimport';
      const vendorLogo = item.vendorLogo || item.logo || '';
      if (!groups[vendorName]) {
        groups[vendorName] = { vendorName, vendorLogo, items: [] };
      }
      groups[vendorName].items.push(item);
    }
    return Object.values(groups);
  }, [cart]);

  const estimatedDelivery = useMemo(() => {
    if (subtotal >= 50000) return 'Livraison gratuite · 1 à 4 jours';
    return 'Livraison estimée · 1 à 4 jours';
  }, [subtotal]);

  const amountToFreeShipping = Math.max(0, 50000 - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / 50000) * 100);
  const cartCount = getCartCount();

  useEffect(() => {
    if (!cart.length) return;

    const token = localStorage.getItem('dangoToken');
    if (!token) return;

    const runPreview = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/orders/preview`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            items: cart.map((item) => ({
              productId: item._id || item.id,
              quantity: item.quantity || 1,
            })),
            shippingMethod: 'standard',
            promoCode,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'Calcul impossible');
        setPromoPreview(data.data || null);
        if (promoCode?.trim()) {
          localStorage.setItem('dangoPromoCode', promoCode.trim().toUpperCase());
        } else {
          localStorage.removeItem('dangoPromoCode');
        }
      } catch (error) {
        setPromoPreview(null);
        console.error('Promo preview error:', error);
      }
    };

    const timer = window.setTimeout(runPreview, 250);
    return () => window.clearTimeout(timer);
  }, [cart, promoCode]);

  useEffect(() => {
    localStorage.setItem('dangoWishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  const handleCheckout = () => {
    const user = localStorage.getItem('dangoUser');
    if (!user) {
      toast.warning('Veuillez vous connecter pour passer au checkout.');
      navigate('/login', { state: { from: '/cart' } });
      return;
    }
    navigate('/checkout');
  };

  const confirm = useConfirm();

  const handleDelete = async (item) => {
    const confirmed = await confirm({
      title: 'Retirer du panier',
      message: `Voulez-vous retirer « ${item.name} » de votre panier ?`,
      confirmText: 'Retirer',
      cancelText: 'Annuler',
      danger: true,
    });
    if (!confirmed) return;
    removeFromCart(item._id || item.id);
    toast.info('Produit retiré du panier');
  };

  const toggleWishlist = (product) => {
    const id = product._id || product.id;
    setWishlist((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        toast.info('Produit retiré des favoris');
        return prev.filter((value) => value !== id);
      }
      toast.success('Produit ajouté aux favoris');
      return [...prev, id];
    });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setPromoState({ loading: false, success: false, message: 'Saisissez un code promo.' });
      return;
    }

    setPromoState({ loading: true, success: false, message: '' });
    const token = localStorage.getItem('dangoToken');

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: cart.map((item) => ({
            productId: item._id || item.id,
            quantity: item.quantity || 1,
          })),
          shippingMethod: 'standard',
          promoCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Code promo invalide');
      }

      setPromoPreview(data.data || null);
      localStorage.setItem('dangoPromoCode', promoCode.trim().toUpperCase());
      setPromoState({
        loading: false,
        success: true,
        message: `Code appliqué avec succès · économie ${formatMoney(data.data?.discount || 0)}`,
      });
    } catch (error) {
      setPromoPreview(null);
      localStorage.removeItem('dangoPromoCode');
      setPromoState({ loading: false, success: false, message: error.message || 'Le code promo est invalide.' });
    }
  };

  const clearPromoCode = () => {
    setPromoCode('');
    localStorage.removeItem('dangoPromoCode');
    setPromoState({ loading: false, success: false, message: '' });
  };

  const shareItem = async (item) => {
    const productUrl = `${window.location.origin}/product/${item._id || item.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.name, url: productUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(productUrl);
        toast.info('Lien copié dans le presse-papiers');
      }
    } catch {
      toast.error('Impossible de partager ce produit');
    }
  };

  if (!cart.length) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.35 }}
            className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#FFF7F1] to-white text-[#FF6B00] shadow-sm ring-1 ring-slate-200"
          >
            <ShoppingCart className="h-12 w-12" strokeWidth={1.5} />
          </motion.div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Votre panier est vide</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">
            Ajoutez des produits pour créer votre commande et poursuivre votre achat.
          </p>
          <button
            onClick={() => navigate('/shopping')}
            className="mt-8 rounded-full bg-[#FF6B00] px-7 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-200 transition hover:bg-[#E85F00] hover:shadow-orange-300 active:scale-95"
          >
            Continuer mes achats
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <button
            onClick={() => navigate('/shopping')}
            className="inline-flex items-center gap-2 font-semibold text-slate-700 transition hover:text-[#FF6B00]"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </button>
        </div>

        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">Mon panier</h1>
            <p className="mt-1 text-sm text-slate-500">
              {cartCount} article{cartCount > 1 ? 's' : ''} · {groupedByVendor.length} vendeur{groupedByVendor.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {/* Free shipping progress */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          {amountToFreeShipping > 0 ? (
            <p className="text-sm font-semibold text-slate-700">
              Plus que <span className="text-[#FF6B00]">{formatMoney(amountToFreeShipping)}</span> pour bénéficier de la livraison gratuite
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-sm font-semibold text-emerald-700">
              <Truck className="h-4 w-4" /> Livraison gratuite débloquée
            </p>
          )}
          <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${freeShippingProgress}%` }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`h-full rounded-full ${freeShippingProgress >= 100 ? 'bg-emerald-500' : 'bg-[#FF6B00]'}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            <AnimatePresence initial={false}>
              {groupedByVendor.map((group) => (
                <motion.section
                  key={group.vendorName}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
                >
                  <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-slate-50 ring-1 ring-slate-200">
                        {group.vendorLogo ? (
                          <img src={group.vendorLogo} alt={group.vendorName} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5 text-slate-500" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-base font-black text-slate-900">{group.vendorName}</p>
                          {group.items.some((i) => i.isVendorCertified || i.isCertified) && (
                            <span className="inline-flex items-center gap-1 rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-extrabold text-white" title="Vendeur Certifié">
                              <BadgeCheck className="h-3 w-3" /> Certifié
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{group.items.length} article{group.items.length > 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="rounded-full bg-[#FFF7F1] px-3 py-1 text-xs font-bold text-[#FF6B00]">Groupe vendeur</div>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {group.items.map((item) => {
                      const itemId = item._id || item.id;
                      const isFavorite = wishlist.includes(itemId);
                      const quantity = Number(item.quantity || 1);
                      const lineTotal = getItemPrice(item) * quantity;
                      const stockBadge = getStockBadge(item.stock);
                      const atMax = Number.isFinite(Number(item.stock)) && quantity >= Number(item.stock);

                      return (
                        <motion.div layout key={itemId} className="p-4 sm:p-5">
                          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[140px_minmax(0,1fr)]">
                            <Link
                              to={`/product/${itemId}`}
                              className="block overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2 transition hover:border-slate-300"
                            >
                              <img
                                src={item.image || item.images?.[0]?.url}
                                alt={item.name}
                                className="h-32 w-full rounded-xl object-cover lg:h-36"
                              />
                            </Link>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <Link to={`/product/${itemId}`} className="text-base font-black text-slate-900 transition hover:text-[#FF6B00] sm:text-lg">
                                    {item.name}
                                  </Link>
                                  <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-slate-500">
                                    {item.brand && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">{item.brand}</span>}
                                    {item.sku && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">SKU: {item.sku}</span>}
                                    {item.color && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">Couleur: {item.color}</span>}
                                    {item.size && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">Taille: {item.size}</span>}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-lg font-black text-slate-900">{formatMoney(lineTotal)}</p>
                                  {quantity > 1 && (
                                    <p className="text-xs text-slate-400">{formatMoney(getItemPrice(item))} / unité</p>
                                  )}
                                </div>
                              </div>

                              <div className="mt-3">
                                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${stockBadge.cls}`}>{stockBadge.label}</span>
                              </div>

                              <div className="mt-4 flex flex-wrap items-center gap-2">
                                <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                  <button
                                    onClick={() => updateQuantity(itemId, quantity - 1)}
                                    disabled={quantity <= 1}
                                    className={quantitySelectorButton}
                                    aria-label="Diminuer la quantité"
                                  >
                                    <Minus className="mx-auto h-3.5 w-3.5" />
                                  </button>
                                  <span className="w-8 text-center text-sm font-black text-slate-900">{quantity}</span>
                                  <button
                                    onClick={() => updateQuantity(itemId, quantity + 1)}
                                    disabled={atMax}
                                    className={quantitySelectorButton}
                                    aria-label="Augmenter la quantité"
                                  >
                                    <Plus className="mx-auto h-3.5 w-3.5" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => toggleWishlist(item)}
                                  className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${
                                    isFavorite ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                  }`}
                                >
                                  <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                  {isFavorite ? 'Favori' : 'Favoris'}
                                </button>

                                <button
                                  onClick={() => shareItem(item)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200"
                                >
                                  <Share2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Partager</span>
                                </button>

                                <button
                                  onClick={() => handleDelete(item)}
                                  className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="hidden sm:inline">Supprimer</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.section>
              ))}
            </AnimatePresence>

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-[#FFF7F1] p-2 text-[#FF6B00]">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Code promo</h2>
                  <p className="text-xs text-slate-500">Appliquez votre code avant de passer au checkout.</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <div className="relative flex-1">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="EX: DANGO10"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 pr-9 text-sm uppercase outline-none transition focus:border-[#FF6B00] focus:ring-2 focus:ring-orange-100"
                  />
                  {promoCode && (
                    <button
                      onClick={clearPromoCode}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-300 transition hover:text-slate-500"
                      aria-label="Effacer le code promo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <button
                  onClick={applyPromoCode}
                  disabled={promoState.loading}
                  className="rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-[#E85F00] disabled:opacity-60"
                >
                  {promoState.loading ? 'Application...' : 'Appliquer'}
                </button>
              </div>

              <AnimatePresence>
                {promoState.message && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`mt-3 flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
                      promoState.success
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border-rose-100 bg-rose-50 text-rose-700'
                    }`}
                  >
                    {promoState.success ? <Sparkles className="h-4 w-4 shrink-0" /> : null}
                    {promoState.message}
                  </motion.div>
                )}
              </AnimatePresence>
            </section>
          </div>

          <aside className="xl:sticky xl:top-24 xl:self-start">
            <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                <div className="rounded-xl bg-[#FFF7F1] p-2 text-[#FF6B00]">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Résumé de commande</h2>
                  <p className="text-xs text-slate-500">{cartCount} article(s) · {groupedByVendor.length} vendeur(s)</p>
                </div>
              </div>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total</span>
                  <span className="font-bold text-slate-900">{formatMoney(subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Livraison estimée</span>
                  <span className="font-bold text-slate-900">{estimatedDelivery}</span>
                </div>
                {Number(promoPreview?.tax || 0) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Taxes</span>
                    <span className="font-bold text-slate-900">{formatMoney(Number(promoPreview?.tax || 0))}</span>
                  </div>
                )}
                {Number(promoPreview?.discount || 0) > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>Réduction</span>
                    <span className="font-bold text-emerald-600">-{formatMoney(Number(promoPreview?.discount || 0))}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Montant final</span>
                  <span className="text-2xl font-black text-[#FF6B00]">{formatMoney(Number(promoPreview?.total || total))}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full rounded-2xl bg-[#FF6B00] px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#E85F00] active:scale-[0.99]"
                >
                  Passer au paiement
                </button>
                <button
                  onClick={() => navigate('/shopping')}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                >
                  Continuer mes achats
                </button>
              </div>

              <div className="mt-5 space-y-3 text-xs text-slate-500">
                <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-600" /> Paiement sécurisé</div>
                <div className="flex items-center gap-2"><Truck className="h-4 w-4 text-emerald-600" /> Livraison calculée au checkout</div>
                <div className="flex items-center gap-2"><Ticket className="h-4 w-4 text-emerald-600" /> Code promo compatible</div>
              </div>
            </div>
          </aside>
        </div>

        {/* Spacer for Mobile Sticky checkout bar */}
        <div className="h-20 xl:hidden" />
      </main>

      {/* Sticky Mobile Checkout Bar */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-between border-t border-slate-200 bg-white/95 px-4 py-3.5 shadow-lg backdrop-blur-[6px]">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total ({cartCount})</p>
          <p className="mt-0.5 text-xl font-black text-[#FF6B00]">{formatMoney(Number(promoPreview?.total || total))}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="cursor-pointer rounded-xl bg-[#FF6B00] px-5 py-3 text-xs font-black text-white shadow transition hover:bg-[#E85F00]"
        >
          Passer au paiement
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;