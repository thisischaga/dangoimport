import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Share2, Trash2, Minus, Plus, ShoppingBag, ArrowLeft, Store, BadgeCheck, ChevronRight, Ticket, Truck, ShieldCheck, ShoppingCart } from 'lucide-react';
import toast from '../utils/toast';
import { useConfirm } from '../components/ui/ConfirmDialog';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import API_BASE_URL from '../apiConfig';
import client from '../apiClient';

const formatMoney = (value) => `${Number(value || 0).toLocaleString('fr-FR')} F`;

const quantitySelectorButton = 'h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition';

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, updateQuantity, subtotal, shipping, total, getCartCount } = useCart();
  const [promoCode, setPromoCode] = useState(() => localStorage.getItem('dangoPromoCode') || '');
  const [promoState, setPromoState] = useState({ loading: false, success: false, message: '' });
  const [promoPreview, setPromoPreview] = useState(null);
  const [recommended, setRecommended] = useState([]);
  const [recommendedLoading, setRecommendedLoading] = useState(true);
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
    const loadRecommendations = async () => {
      setRecommendedLoading(true);
      try {
        const category = cart[0]?.category || cart[0]?.subcategory || '';
        const response = await client.get('/products', {
          params: {
            limit: 4,
            ...(category ? { category } : {}),
          },
        });

        const items = Array.isArray(response?.data?.data) ? response.data.data : [];
        const deduped = items.filter((item) => !cart.some((cartItem) => (cartItem._id || cartItem.id) === (item._id || item.id))).slice(0, 4);
        setRecommended(deduped);
      } catch (error) {
        console.error('Recommendations error:', error);
        setRecommended([]);
      } finally {
        setRecommendedLoading(false);
      }
    };

    loadRecommendations();
  }, [cart]);

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
        <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm ring-1 ring-slate-200">
            <ShoppingCart className="h-10 w-10" />
          </div>
          <h1 className="mt-6 text-3xl font-black text-slate-900">Votre panier est vide</h1>
          <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500">Ajoutez des produits pour créer votre commande et poursuivre votre achat.</p>
          <button
            onClick={() => navigate('/shopping')}
            className="mt-8 rounded-full bg-[#FF6B00] px-6 py-3 text-sm font-black text-white shadow-sm transition hover:bg-[#E85F00]"
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
          <button onClick={() => navigate('/shopping')} className="inline-flex items-center gap-2 font-semibold text-slate-700 hover:text-[#FF6B00]">
            <ArrowLeft className="h-4 w-4" />
            Retour à la boutique
          </button>
        </div>

        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900 sm:text-4xl">Mon panier</h1>
            <p className="mt-1 text-sm text-slate-500">{cartCount} article(s) · {estimatedDelivery}</p>
          </div>
          <div className=" px-4 py-2 text-sm font-bold text-slate-700">Commande prête pour le checkout</div>
        </div>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
          <div className="space-y-5">
            {groupedByVendor.map((group) => (
              <motion.section
                key={group.vendorName}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
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
                        {group.items.some(i => i.isVendorCertified || i.isCertified) && (
                          <span style={{ background: '#2563eb', color: '#ffffff', fontSize: 10, fontWeight: 800, padding: '1px 5px', borderRadius: 4, display: 'inline-flex', alignItems: 'center', gap: 2 }} title="Vendeur Certifié">
                            ✓ Certifié
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="rounded-full bg-[#FFF7F1] px-3 py-1 text-xs font-bold text-[#FF6B00]">Groupe vendeur</div>
                </div>

                <div className="divide-y divide-slate-100">
                  {group.items.map((item) => {
                    const itemId = item._id || item.id;
                    const isFavorite = wishlist.includes(itemId);
                    const lineTotal = getItemPrice(item) * Number(item.quantity || 1);

                    return (
                      <div key={itemId} className="p-4 sm:p-5">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[180px_minmax(0,1fr)_auto]">
                          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-2">
                            <img src={item.image || item.images?.[0]?.url} alt={item.name} className="h-40 w-full rounded-xl object-cover" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-start justify-between gap-3">
                              <div className="min-w-0">
                                <Link to={`/product/${itemId}`} className="text-lg font-black text-slate-900 hover:text-[#FF6B00]">{item.name}</Link>
                                <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                                  {item.brand && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">{item.brand}</span>}
                                  {item.sku && <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold">SKU: {item.sku}</span>}
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-black text-slate-900">{formatMoney(lineTotal)}</p>
                                
                              </div>
                            </div>

                            <div className="mt-3 flex flex-wrap gap-2 text-xs">
                              <span className={`rounded-full px-2.5 py-1 font-bold ${item.stock > 5 ? 'bg-emerald-50 text-emerald-700' : item.stock > 0 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                                {item.stock > 5 ? 'En stock' : item.stock > 0 ? 'Stock faible' : item.stock > 0 ? 'Précommande' : 'Rupture'}
                              </span>
                              {item.color && <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">Couleur: {item.color}</span>}
                              {item.size && <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-600">Taille: {item.size}</span>}
                            </div>

                            <div className="mt-4 flex flex-wrap items-center gap-2">
                              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
                                <button onClick={() => updateQuantity(itemId, Number(item.quantity || 1) - 1)} className={quantitySelectorButton}>
                                  <Minus className="mx-auto h-3.5 w-3.5" />
                                </button>
                                <span className="w-8 text-center text-sm font-black text-slate-900">{item.quantity}</span>
                                <button onClick={() => updateQuantity(itemId, Number(item.quantity || 1) + 1)} className={quantitySelectorButton}>
                                  <Plus className="mx-auto h-3.5 w-3.5" />
                                </button>
                              </div>

                              {/**<button onClick={() => toggleWishlist(item)} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-bold transition ${isFavorite ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                                <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                                {isFavorite ? 'Favori' : 'Favoris'}
                              </button> */}

                              <button onClick={() => shareItem(item)} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                                <Share2 className="h-4 w-4" />
                                Partager
                              </button>

                              <button onClick={() => handleDelete(item)} className="inline-flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-600 transition hover:bg-rose-100">
                                <Trash2 className="h-4 w-4" />
                                Supprimer
                              </button>

                              <Link to={`/product/${itemId}`} className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-200">
                                Voir le produit
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.section>
            ))}

            <section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Code promo</h2>
                  <p className="text-sm text-slate-500">Appliquez votre code avant de passer au checkout.</p>
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="EX: DANGO10"
                    className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#FF6B00]"
                  />
                  <button onClick={applyPromoCode} className="rounded-xl bg-[#FF6B00] px-4 py-2.5 text-sm font-black text-white shadow-sm hover:bg-[#E85F00]">
                    {promoState.loading ? 'Application...' : 'Appliquer'}
                  </button>
                </div>
              </div>

              {promoState.message && (
                <div className={`mt-3 rounded-xl border px-3 py-2 text-sm ${promoState.success ? ' bg-emerald-50 text-emerald-700' : ' bg-rose-50 text-rose-700'}`}>
                  {promoState.message}
                </div>
              )}
            </section>

            {/**<section className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <BadgeCheck className="h-5 w-5 text-[#FF6B00]" />
                <h2 className="text-xl font-black text-slate-900">Vous pourriez aussi aimer</h2>
              </div>

              {recommendedLoading ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <div key={index} className="animate-pulse rounded-2xl border border-slate-200 bg-slate-50 p-3">
                      <div className="h-36 rounded-xl bg-slate-200" />
                      <div className="mt-3 h-4 w-2/3 rounded bg-slate-200" />
                      <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
                    </div>
                  ))}
                </div>
              ) : recommended.length > 0 ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {recommended.map((product) => (
                    <Link key={product._id || product.id} to={`/product/${product._id || product.id}`} className="rounded-2xl border border-slate-200 bg-slate-50 p-3 transition hover:-translate-y-0.5">
                      <img src={product.image || product.images?.[0]?.url} alt={product.name} className="h-36 w-full rounded-xl object-cover" />
                      <p className="mt-3 line-clamp-2 text-sm font-bold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm font-black text-[#FF6B00]">{formatMoney(product.salePrice || product.price || 0)}</p>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">Aucune suggestion disponible pour le moment.</p>
              )}
            </section> */}
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
                <div className="flex justify-between text-slate-600"><span>Sous-total</span><span className="font-bold text-slate-900">{formatMoney(subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Livraison estimée</span><span className="font-bold text-slate-900">{estimatedDelivery}</span></div>
                <div className="flex justify-between text-slate-600"><span>Taxes</span><span className="font-bold text-slate-900">{formatMoney(Number(promoPreview?.tax || 0))}</span></div>
                <div className="flex justify-between text-slate-600"><span>Réduction</span><span className="font-bold text-emerald-600">-{formatMoney(Number(promoPreview?.discount || 0))}</span></div>
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span>Montant final</span>
                  <span className="text-2xl font-black text-[#FF6B00]">{formatMoney(Number(promoPreview?.total || total))}</span>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <button onClick={handleCheckout} className="w-full rounded-2xl bg-[#FF6B00] px-4 py-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#E85F00]">Passer au paiement</button>
                <button onClick={() => navigate('/shopping')} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50">Continuer mes achats</button>
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
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-[6px] border-t border-slate-200 px-4 py-3.5 shadow-lg z-40 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total ({cartCount})</p>
          <p className="text-xl font-black text-[#FF6B00] mt-0.5">{formatMoney(Number(promoPreview?.total || total))}</p>
        </div>
        <button
          onClick={handleCheckout}
          className="rounded-xl bg-[#FF6B00] px-5 py-3 text-xs font-black text-white shadow hover:bg-[#E85F00] transition cursor-pointer"
        >
          Passer au paiement
        </button>
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
