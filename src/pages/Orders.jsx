import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QRCode from 'qrcode';
import API_BASE_URL from '../apiConfig';
import { fetchOrderQrTokens } from '../services/qrService';
import toast from '../utils/toast';
import {
  Search, Package, CreditCard, CheckCircle2, Truck,
  ChevronDown, ChevronUp, ExternalLink, FileText,
  Store, Clock, AlertTriangle, Check, ArrowRight, Download,
} from 'lucide-react';

const normalizeOrdersResponse = (responseData) => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.data)) return responseData.data;
  if (Array.isArray(responseData.data?.data)) return responseData.data.data;
  if (Array.isArray(responseData.data?.orders)) return responseData.data.orders;
  if (Array.isArray(responseData.orders)) return responseData.orders;
  return [];
};

const fetchMyOrders = async () => {
  try {
    const token = localStorage.getItem('dangoToken');
    const res = await apiClient.get('/shop-orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    const responseData = res?.data;
    const orders = normalizeOrdersResponse(responseData);

    if (orders.length === 0) {
      const fallback = await apiClient.get('/orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return normalizeOrdersResponse(fallback.data);
    }
    return orders;
  } catch (err) {
    console.error('[Orders] fetchMyOrders error', err?.response?.data || err.message || err);
    try {
      const token = localStorage.getItem('dangoToken');
      const fallback = await apiClient.get('/orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      return normalizeOrdersResponse(fallback.data);
    } catch (fbErr) {
      console.error('[Orders] fallback error', fbErr?.response?.data || fbErr.message || fbErr);
    }
    throw err;
  }
};

function formatCurrency(x = 0) {
  try {
    return Number(x).toLocaleString('fr-FR');
  } catch (e) { return String(x); }
}

/** Réserve dynamiquement l'espace occupé par le header fixe */
function useHeaderOffset() {
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return undefined;

    const setVar = () => {
      document.documentElement.style.setProperty('--header-h', `${headerEl.offsetHeight}px`);
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(headerEl);
    window.addEventListener('resize', setVar);

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);
}

const STATUS_BADGES = {
  pending: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Paiement en attente' },
  confirmed: { bg: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Paiement confirmé' },
  processing: { bg: 'bg-purple-50 text-purple-700 border-purple-200', label: 'En préparation' },
  shipping: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'En livraison' },
  shipped: { bg: 'bg-orange-50 text-orange-700 border-orange-200', label: 'Expédiée' },
  ready: { bg: 'bg-amber-50 text-amber-700 border-amber-200', label: 'Prête pour retrait' },
  delivered: { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', label: 'Livrée' },
  completed: { bg: 'bg-green-50 text-green-700 border-green-200', label: 'Terminée' },
  cancelled: { bg: 'bg-rose-50 text-rose-700 border-rose-200', label: 'Annulée' },
  refunded: { bg: 'bg-gray-100 text-gray-700 border-gray-200', label: 'Remboursée' },
};

const Orders = () => {
  useHeaderOffset();

  const { data: orders = [], isLoading, error } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders, staleTime: 1000 * 60 * 30 });

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expanded, setExpanded] = useState(null);
  const [qrData, setQrData] = useState({});
  const [qrLoading, setQrLoading] = useState({});

  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? orders.slice() : [];
    if (statusFilter !== 'all') {
      list = list.filter((o) => String(o.status).toLowerCase() === String(statusFilter).toLowerCase());
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter((o) => (
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.items || []).some((i) => (i.productName || '').toLowerCase().includes(q)) ||
        (o.items || []).some((i) => (i.vendorName || '').toLowerCase().includes(q))
      ));
    }
    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'amount_asc') list.sort((a, b) => (a.total || 0) - (b.total || 0));
    else if (sortBy === 'amount_desc') list.sort((a, b) => (b.total || 0) - (a.total || 0));
    return list;
  }, [orders, statusFilter, query, sortBy]);

  const loadQrForOrder = async (orderId) => {
    if (qrData[orderId]) return;
    setQrLoading((s) => ({ ...s, [orderId]: true }));
    try {
      const token = localStorage.getItem('dangoToken');
      const qrResponse = await fetchOrderQrTokens(orderId, token);
      const qrTokens = qrResponse.qrTokens || [];
      const images = [];
      await Promise.all(qrTokens.map(async (t) => {
        try {
          images.push({
            token: t.token,
            img: await QRCode.toDataURL(String(t.token), { width: 300 }),
            status: t.status,
            vendorName: t.vendorName,
            vendorTotal: t.vendorTotal,
          });
        } catch (e) {
          console.error('QR gen', e);
        }
      }));
      setQrData((s) => ({ ...s, [orderId]: { images, tokens: qrTokens } }));
    } catch (err) {
      console.error('loadQrForOrder', err);
      setQrData((s) => ({ ...s, [orderId]: { images: [], tokens: [], error: err.message } }));
    } finally {
      setQrLoading((s) => ({ ...s, [orderId]: false }));
    }
  };

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('dangoToken');
      const res = await fetch(`${API_BASE_URL}/api/orders/${orderId}/invoice`, { headers: { Authorization: token ? `Bearer ${token}` : '' } });
      if (!res.ok) throw new Error('Facture indisponible');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `invoice-${orderId}.pdf`; document.body.appendChild(a); a.click(); a.remove();
    } catch (err) {
      console.error('downloadInvoice', err);
      toast.error(err.message || 'Erreur téléchargement facture');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />
      <main
        className="max-w-6xl mx-auto px-4 pb-8"
        style={{ paddingTop: 'calc(var(--header-h, 96px) + 24px)' }}
      >

        {/* Bannière d'erreur */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-800">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Erreur de chargement :</span> {String(error?.message || error)}.
              Veuillez vérifier votre connexion ou réactualiser.
            </div>
          </div>
        )}

        {/* En-tête de page */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Mes commandes</h1>
            <p className="text-gray-500 mt-1">Suivez vos colis, téléchargez vos factures et récupérez vos codes QR de validation.</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-white p-4 rounded-2xl border border-gray-150 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par numéro, produit ou boutique..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white outline-none text-sm text-gray-900 focus:ring-2 focus:ring-[#FF6B00]/40 transition"
            />
          </div>
          <div className="flex w-full sm:w-auto gap-3 shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/2 sm:w-44 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">Paiement en attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="processing">En préparation</option>
              <option value="shipped">Expédiée</option>
              <option value="shipping">En livraison</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-1/2 sm:w-44 px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="amount_asc">Montant croissant</option>
              <option value="amount_desc">Montant décroissant</option>
            </select>
          </div>
        </div>

        {/* Liste des commandes */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white rounded-2xl border border-gray-200 shadow-sm">
              <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-gray-500 font-medium">Chargement de votre historique...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-200 text-center shadow-sm">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-800">Aucune commande trouvée</p>
              <p className="text-gray-500 text-sm max-w-md mx-auto mt-1">Vous n'avez pas de commande correspondant aux filtres ou n'avez pas encore acheté sur Dango Import.</p>
              <a href="/shop" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-sm rounded-xl transition shadow-md">
                Parcourir les produits <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : filtered.map((order) => {
            const isCancelled = ['cancelled', 'refunded'].includes(String(order.status).toLowerCase());
            const badgeMeta = STATUS_BADGES[String(order.status).toLowerCase()] || { bg: 'bg-gray-100 text-gray-800 border-gray-200', label: order.status };

            return (
              <div key={order._id} className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden transition hover:shadow-md duration-300">

                {/* En-tête de la commande */}
                <div className="bg-gray-50/60 p-4 border-b border-gray-150 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">N° de commande</span>
                      <div className="font-bold text-sm text-gray-900 mt-0.5">
                        {order.orderNumber || (order._id || '').slice(-8).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Date</span>
                      <div className="font-medium text-sm text-gray-700 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Total</span>
                      <div className="font-black text-sm text-[#FF6B00] mt-0.5">
                        {formatCurrency(order.total || order.totalPrice || 0)} FCFA
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Statut</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-extrabold border ${badgeMeta.bg}`}>
                          {badgeMeta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end md:self-center">
                    <button
                      onClick={() => downloadInvoice(order._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition duration-200"
                    >
                      <Download className="w-3.5 h-3.5" /> Facture PDF
                    </button>
                  </div>
                </div>

                {/* Bannière annulée */}
                {isCancelled && (
                  <div className="p-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-rose-800 text-xs font-semibold justify-center">
                    <AlertTriangle className="w-4 h-4" />
                    Cette commande a été annulée ou remboursée.
                  </div>
                )}

                {/* Regroupement par vendeur */}
                <div className="p-4 space-y-4">
                  {Object.values((order.items || []).reduce((acc, it) => {
                    const vid = it.vendorId || 'platform';
                    if (!acc[vid]) acc[vid] = { vendorName: it.vendorName || 'Dango Import', items: [] };
                    acc[vid].items.push(it);
                    return acc;
                  }, {})).map((g, idx) => (
                    <div key={idx} className="bg-gray-50 border border-gray-150 rounded-2xl overflow-hidden p-3.5">

                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200/60">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#FF6B00]" />
                          <span className="font-extrabold text-sm text-gray-800">{g.vendorName}</span>
                        </div>
                        <button
                          onClick={() => { window.location.href = `/shop/${encodeURIComponent(g.vendorName)}`; }}
                          className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1"
                        >
                          Visiter boutique <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {g.items.map((p, pi) => (
                          <div key={pi} className="flex gap-3 p-2 bg-white border border-gray-150 rounded-xl items-center">
                            <div className="w-16 h-16 shrink-0 bg-gray-50 rounded-lg p-1 border border-gray-100 flex items-center justify-center">
                              <img src={p.productImage || p.image || ''} alt={p.productName} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-800 truncate">{p.productName}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">Qté: {p.quantity}</span>
                                <span className="text-xs text-gray-700 font-semibold">{formatCurrency(p.price || 0)} FCFA</span>
                              </div>
                            </div>
                            <a 
                              href={`/product/${p.productId}`}
                              className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 font-bold text-xs rounded-lg transition"
                            >
                              Voir
                            </a>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

                {/* Panneau de contrôle */}
                <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => {
                      const next = expanded === order._id ? null : order._id;
                      setExpanded(next);
                      if (next) loadQrForOrder(order._id);
                    }}
                    className="inline-flex items-center gap-1 px-4 py-2 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-xs rounded-xl shadow-sm transition"
                  >
                    {expanded === order._id ? (
                      <>Masquer les détails <ChevronUp className="w-3.5 h-3.5" /></>
                    ) : (
                      <>Détails & Codes QR <ChevronDown className="w-3.5 h-3.5" /></>
                    )}
                  </button>
                  <span className="text-xs text-gray-400">
                    {(order.items || []).reduce((s, i) => s + (i.quantity || 1), 0)} article(s)
                  </span>
                </div>

                {/* Détails déployés */}
                {expanded === order._id && (
                  <div className="bg-gray-50/50 p-5 border-t border-gray-150 space-y-5 animate-fadeIn">

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white p-4 border border-gray-150 rounded-2xl">
                        <h4 className="font-extrabold text-sm text-gray-900 mb-3">Récapitulatif financier</h4>
                        <div className="text-sm space-y-2 text-gray-600">
                          <div className="flex justify-between">
                            <span>Sous-total :</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(order.subtotal || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Livraison :</span>
                            <span className="font-semibold text-gray-800">{formatCurrency(order.shippingCost || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Réduction :</span>
                            <span className="font-semibold text-gray-800">-{formatCurrency(order.discount || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-bold text-gray-900">
                            <span>Montant net payé :</span>
                            <span className="text-[#FF6B00]">{formatCurrency(order.total || order.totalPrice || 0)} FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 border border-gray-150 rounded-2xl flex flex-col justify-center">
                        <h4 className="font-extrabold text-sm text-gray-900 mb-2">Suivi temporel</h4>
                        <div className="text-xs space-y-1.5 text-gray-500">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Date d'achat : <strong className="text-gray-700">{new Date(order.createdAt || order.date).toLocaleString('fr-FR')}</strong></span>
                          </div>
                          {order.paymentDate && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>Paiement validé : <strong className="text-gray-700">{new Date(order.paymentDate).toLocaleString('fr-FR')}</strong></span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                            <span>Statut d'expédition global : <strong className="text-gray-700">{badgeMeta.label}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 border border-gray-150 rounded-2xl">
                        <h4 className="font-extrabold text-sm text-gray-900 mb-1">Bons de livraison & retrait (Codes QR)</h4>
                        <p className="text-xs text-gray-500">Présentez le code QR correspondant à chaque boutique pour retirer ou faire valider vos articles.</p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      {qrLoading[order._id] ? (
                        <div className="flex items-center justify-center p-6 gap-2.5 text-sm text-gray-500">
                          <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                          Génération des codes sécurisés...
                        </div>
                      ) : qrData[order._id]?.images?.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {(qrData[order._id]?.images || []).map((q, i) => {
                            const isUsed = String(q.status).toLowerCase() === 'used';

                            return (
                              <div
                                key={i}
                                className={`p-4 bg-white rounded-2xl border transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden ${
                                  isUsed
                                    ? 'border-gray-200 opacity-90'
                                    : 'border-orange-200 shadow-sm'
                                }`}
                              >
                                <div className="w-full flex justify-between items-center mb-3">
                                  <span className="text-xs font-extrabold text-gray-800 truncate max-w-[150px]">{q.vendorName || 'Boutique'}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    isUsed
                                      ? 'bg-gray-100 text-gray-800 border-gray-200'
                                      : 'bg-orange-50 text-[#FF6B00] border-orange-200'
                                  }`}>
                                    {isUsed ? 'Déjà livré / Remis' : 'Actif'}
                                  </span>
                                </div>

                                <div className="relative w-40 h-40 bg-gray-50 rounded-xl p-2 border border-gray-100 flex items-center justify-center mb-2">
                                  <img
                                    src={q.img}
                                    alt={`Code QR validation ${q.vendorName}`}
                                    className={`w-full h-full object-contain transition-opacity duration-300 ${
                                      isUsed ? 'opacity-20 filter blur-[1px]' : 'opacity-100'
                                    }`}
                                  />
                                  {isUsed && (
                                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                      <span className="bg-gray-950 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg shadow-lg tracking-wider uppercase transform -rotate-12 border-2 border-white">
                                        DÉJÀ SCANNÉ
                                      </span>
                                    </div>
                                  )}
                                </div>

                                <div className="mt-2 text-xs">
                                  {isUsed ? (
                                    <p className="text-gray-400 font-medium">Validation effectuée. Les produits ont été remis.</p>
                                  ) : (
                                    <p className="text-[#FF6B00] font-bold">Faites scanner ce code par le vendeur lors de la remise des articles.</p>
                                  )}
                                  <span className="block mt-1 font-mono text-[9px] text-gray-400">{q.token}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : qrData[order._id]?.error ? (
                        <div className="p-4 bg-rose-50 text-rose-600 text-xs rounded-xl font-medium">
                          {qrData[order._id]?.error || 'Erreur lors de la récupération du QR.'}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 text-center py-2">Aucun QR code disponible pour cette commande.</p>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </main>
      <Footer />
    </div>
  );
};

export default Orders;