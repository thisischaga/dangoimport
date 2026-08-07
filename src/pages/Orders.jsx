import React, { useState, useMemo } from 'react';
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
  Store, Clock, AlertTriangle, Check, ArrowRight, Download 
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
    console.log('[Orders] fetched my-orders response', responseData);
    const orders = normalizeOrdersResponse(responseData);
    console.log('[Orders] parsed orders count', orders.length);

    if (orders.length === 0) {
      console.warn('[Orders] shop-orders returned empty, falling back to legacy orders');
      const fallback = await apiClient.get('/orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      const fallbackOrders = normalizeOrdersResponse(fallback.data);
      console.log('[Orders] fallback orders count', fallbackOrders.length);
      return fallbackOrders;
    }
    return orders;
  } catch (err) {
    console.error('[Orders] fetchMyOrders error', err?.response?.data || err.message || err);
    try {
      console.warn('[Orders] attempting fallback to /orders/my-orders');
      const token = localStorage.getItem('dangoToken');
      const fallback = await apiClient.get('/orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      console.warn('[Orders] fallback succeeded, returning legacy orders');
      const fallbackOrders = normalizeOrdersResponse(fallback.data);
      console.log('[Orders] fallback orders count (error path)', fallbackOrders.length);
      return fallbackOrders;
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

// Order flow steps mapper
const STATUS_STEPS = [
  { key: 'pending', label: 'Commandé' },
  { key: 'confirmed', label: 'Payé' },
  { key: 'processing', label: 'En préparation' },
  { key: 'shipped', label: 'Expédié' },
  { key: 'delivered', label: 'Livré' }
];

const getStatusStepIndex = (status) => {
  const norm = String(status).toLowerCase();
  if (norm === 'pending') return 0;
  if (norm === 'confirmed') return 1;
  if (norm === 'processing') return 2;
  if (norm === 'shipped' || norm === 'shipping') return 3;
  if (norm === 'delivered') return 4;
  return -1; // cancelled or refunded
};

const STATUS_BADGES = {
  pending: { bg: 'bg-orange-50 text-[#FF6B00] border-orange-200', label: 'En attente de paiement' },
  confirmed: { bg: 'bg-gray-900 text-white border-gray-900', label: 'Paiement confirmé' },
  processing: { bg: 'bg-orange-50 text-[#FF6B00] border-orange-200', label: 'En préparation' },
  shipping: { bg: 'bg-orange-50 text-[#FF6B00] border-orange-200', label: 'En livraison' },
  shipped: { bg: 'bg-orange-50 text-[#FF6B00] border-orange-200', label: 'Expédiée' },
  delivered: { bg: 'bg-gray-900 text-white border-gray-900', label: 'Livrée' },
  cancelled: { bg: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Annulée' },
  refunded: { bg: 'bg-gray-100 text-gray-500 border-gray-200', label: 'Remboursée' },
};

const Orders = () => {
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
      list = list.filter(o => String(o.status).toLowerCase() === String(statusFilter).toLowerCase());
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(o => (
        (o.orderNumber || '').toLowerCase().includes(q) ||
        (o.items || []).some(i => (i.productName || '').toLowerCase().includes(q)) ||
        (o.items || []).some(i => (i.vendorName || '').toLowerCase().includes(q))
      ));
    }
    if (sortBy === 'newest') list.sort((a,b)=> new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') list.sort((a,b)=> new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'amount_asc') list.sort((a,b)=> (a.total || 0) - (b.total || 0));
    else if (sortBy === 'amount_desc') list.sort((a,b)=> (b.total || 0) - (a.total || 0));
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
      await Promise.all(qrTokens.map(async t => {
        try {
          images.push({ 
            token: t.token, 
            img: await QRCode.toDataURL(String(t.token), { width: 300 }),
            status: t.status,
            vendorName: t.vendorName,
            vendorTotal: t.vendorTotal
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
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-gray-900 transition-colors duration-300">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        
        {/* Error alert banner */}
        {error && (
          <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-3 text-rose-800 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <span className="font-semibold">Erreur de chargement:</span> {String(error?.message || error)}. 
              Veuillez vérifier votre connexion ou réactualiser.
            </div>
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Mes commandes</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Suivez vos colis, téléchargez vos factures et récupérez vos codes QR de validation.</p>
          </div>
        </div>



        {/* Filters Controls */}
        <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-150 dark:border-gray-700/80 shadow-sm mb-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              value={query} 
              onChange={(e)=>setQuery(e.target.value)} 
              placeholder="Rechercher par numéro, produit ou boutique..." 
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:bg-white dark:focus:bg-gray-850 outline-none text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-[#FF6B00]/40 transition" 
            />
          </div>
          <div className="flex w-full sm:w-auto gap-3 shrink-0">
            <select 
              value={statusFilter} 
              onChange={(e)=>setStatusFilter(e.target.value)} 
              className="w-1/2 sm:w-44 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
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
              onChange={(e)=>setSortBy(e.target.value)} 
              className="w-1/2 sm:w-44 px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-[#FF6B00]/40 transition"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="amount_asc">Montant croissant</option>
              <option value="amount_desc">Montant décroissant</option>
            </select>
          </div>
        </div>

        {/* Orders List Container */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="w-10 h-10 border-4 border-[#FF6B00] border-t-transparent rounded-full animate-spin mb-4" />
              <span className="text-gray-500 dark:text-gray-400 font-medium">Chargement de votre historique...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl border border-gray-200 dark:border-gray-700 text-center shadow-sm">
              <Package className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-lg font-bold text-gray-800 dark:text-white">Aucune commande trouvée</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto mt-1">Vous n'avez pas de commande correspondant aux filtres ou n'avez pas encore acheté sur Dango Import.</p>
              <a href="/shop" className="inline-flex items-center gap-2 mt-5 px-6 py-3 bg-[#FF6B00] hover:bg-[#e05e00] text-white font-extrabold text-sm rounded-xl transition shadow-md">
                Parcourir les produits <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ) : filtered.map(order => {
            const currentStepIdx = getStatusStepIndex(order.status);
            const isCancelled = ['cancelled', 'refunded'].includes(String(order.status).toLowerCase());
            const badgeMeta = STATUS_BADGES[String(order.status).toLowerCase()] || { bg: 'bg-gray-100 text-gray-800 border-gray-200', label: order.status };

            return (
              <div key={order._id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-150 dark:border-gray-700/80 shadow-sm overflow-hidden transition hover:shadow-md duration-300">
                
                {/* Order Top Card Header */}
                <div className="bg-gray-55/60 dark:bg-gray-850/50 p-4 border-b border-gray-150 dark:border-gray-750 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">N° de commande</span>
                      <div className="font-bold text-sm text-gray-900 dark:text-white mt-0.5">
                        {order.orderNumber || (order._id||'').slice(-8).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Date</span>
                      <div className="font-medium text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Total</span>
                      <div className="font-black text-sm text-[#FF6B00] mt-0.5">
                        {formatCurrency(order.total || order.totalPrice || 0)} FCFA
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 dark:text-gray-500 tracking-wider">Statut</span>
                      <div className="mt-0.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold border ${badgeMeta.bg}`}>
                          {badgeMeta.label}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 self-end md:self-center">
                    <button 
                      onClick={() => downloadInvoice(order._id)} 
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-650 text-gray-700 dark:text-gray-200 font-bold text-xs rounded-xl transition duration-200"
                    >
                      <Download className="w-3.5 h-3.5" /> Facture PDF
                    </button>
                  </div>
                </div>

                {/* Progress Stepper Timeline */}
                {!isCancelled && currentStepIdx >= 0 && (
                  <div className="p-5 border-b border-gray-100 dark:border-gray-750 bg-white dark:bg-gray-800">
                    <div className="relative flex justify-between items-center max-w-2xl mx-auto my-2">
                      {STATUS_STEPS.map((step, idx) => {
                        const isActive = idx <= currentStepIdx;
                        const isCurrent = idx === currentStepIdx;
                        return (
                          <div key={idx} className="flex flex-col items-center z-10">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition duration-300 border-2 ${
                              isActive 
                                ? (isCurrent ? 'bg-[#FF6B00] text-white' : 'bg-gray-900 text-white')
                                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                            }`}>
                              {isActive && idx < currentStepIdx ? <Check className="w-4 h-4 stroke-[3px]" /> : <span>{idx + 1}</span>}
                            </div>
                            <span
                              className={`text-[10px] md:text-xs font-bold mt-2 no-underline ${
                                isActive
                                  ? 'text-gray-800 dark:text-gray-200'
                                  : 'text-gray-400 dark:text-gray-500'
                              }`}
                            >
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Cancelled Banner */}
                {isCancelled && (
                  <div className="p-3 bg-red-50 dark:bg-red-950/20 border-b border-red-100 dark:border-red-950/50 flex items-center gap-2 text-rose-800 dark:text-rose-300 text-xs font-semibold justify-center">
                    <AlertTriangle className="w-4 h-4" />
                    Cette commande a été annulée ou remboursée.
                  </div>
                )}

                {/* Vendor Grouping & Items inside Card */}
                <div className="p-4 space-y-4">
                  {Object.values((order.items||[]).reduce((acc,it)=>{
                    const vid = it.vendorId||'platform';
                    if (!acc[vid]) acc[vid]={vendorName: it.vendorName||'Dango Import', items:[]}; 
                    acc[vid].items.push(it); 
                    return acc;
                  },{})).map((g, idx)=> (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/40 border border-gray-150 dark:border-gray-700/50 rounded-2xl overflow-hidden p-3.5">
                      
                      {/* Vendor Store Header */}
                      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200/60 dark:border-gray-800/60">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-[#FF6B00]" />
                          <span className="font-extrabold text-sm text-gray-800 dark:text-gray-200">{g.vendorName}</span>
                        </div>
                        <button 
                          onClick={()=> window.location.href = `/shop/${encodeURIComponent(g.vendorName)}` } 
                          className="text-xs font-bold text-[#FF6B00] hover:underline inline-flex items-center gap-1"
                        >
                          Visiter boutique <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Items Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {g.items.map((p,pi)=> (
                          <div key={pi} className="flex gap-3 p-2 bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-750 rounded-xl items-center">
                            <div className="w-16 h-16 shrink-0 bg-gray-50 dark:bg-gray-900 rounded-lg p-1 border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                              <img src={p.productImage||p.image||''} alt={p.productName} className="max-w-full max-h-full object-contain" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 truncate">{p.productName}</h4>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">Qté: {p.quantity}</span>
                                <span className="text-xs text-gray-700 dark:text-gray-300 font-semibold">{formatCurrency(p.price || 0)} FCFA</span>
                              </div>
                            </div>
                            <a 
                              href={`/product/${p.productId}`} 
                              className="px-3 py-1.5 bg-gray-50 dark:bg-gray-750 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold text-xs rounded-lg transition"
                            >
                              Voir
                            </a>
                          </div>
                        ))}
                      </div>

                    </div>
                  ))}
                </div>

                {/* Bottom Toggle Control Panel */}
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-850/30 border-t border-gray-100 dark:border-gray-750 flex items-center justify-between">
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
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {(order.items||[]).reduce((s,i)=>s+(i.quantity||1),0)} article(s)
                  </span>
                </div>

                {/* Expanded Details Drawer Box */}
                {expanded === order._id && (
                  <div className="bg-gray-50/50 dark:bg-gray-850/20 p-5 border-t border-gray-150 dark:border-gray-750 space-y-5 animate-fadeIn">
                    
                    {/* Summary overview cards */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-150 dark:border-gray-750 rounded-2xl">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-3">Récapitulatif Financier</h4>
                        <div className="text-sm space-y-2 text-gray-600 dark:text-gray-300">
                          <div className="flex justify-between">
                            <span>Sous-total:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(order.subtotal || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Livraison:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">{formatCurrency(order.shippingCost || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Réduction:</span>
                            <span className="font-semibold text-gray-800 dark:text-gray-100">-{formatCurrency(order.discount || 0)} FCFA</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t font-bold text-gray-900 dark:text-white">
                            <span>Montant net payé:</span>
                            <span className="text-[#FF6B00]">{formatCurrency(order.total || order.totalPrice || 0)} FCFA</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-150 dark:border-gray-750 rounded-2xl flex flex-col justify-center">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-2">Suivi Temporel</h4>
                        <div className="text-xs space-y-1.5 text-gray-500 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            <span>Date d'achat : <strong className="text-gray-700 dark:text-gray-300">{new Date(order.createdAt || order.date).toLocaleString('fr-FR')}</strong></span>
                          </div>
                          {order.paymentDate && (
                            <div className="flex items-center gap-2">
                              <CreditCard className="w-3.5 h-3.5 text-[#FF6B00]" />
                              <span>Paiement validé : <strong className="text-gray-700 dark:text-gray-300">{new Date(order.paymentDate).toLocaleString('fr-FR')}</strong></span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5 text-[#FF6B00]" />
                            <span>Statut d'expédition global : <strong className="text-gray-700 dark:text-gray-300">{badgeMeta.label}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-800 p-4 border border-gray-150 dark:border-gray-750 rounded-2xl">
                        <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">Bons de Livraison & Retrait (Codes QR)</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Présentez le code QR correspondant à chaque boutique pour retirer ou faire valider vos articles.</p>
                      </div>
                    </div>

                    {/* QR Code Validation Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700/80 pt-4">
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
                                className={`p-4 bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-300 flex flex-col items-center text-center relative overflow-hidden ${
                                  isUsed 
                                    ? 'border-gray-200 dark:border-gray-700 opacity-90' 
                                    : 'border-orange-200 dark:border-orange-900/60 shadow-sm'
                                }`}
                              >
                                {/* Header Info */}
                                <div className="w-full flex justify-between items-center mb-3">
                                  <span className="text-xs font-extrabold text-gray-800 dark:text-gray-200 truncate max-w-[150px]">{q.vendorName || 'Boutique'}</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                                    isUsed 
                                      ? 'bg-gray-100 text-gray-800 border-gray-200' 
                                      : 'bg-orange-50 text-[#FF6B00] border-orange-200'
                                  }`}>
                                    {isUsed ? 'Déjà livré / Remis' : 'Actif'}
                                  </span>
                                </div>

                                {/* QR Image Container with Watermark */}
                                <div className="relative w-40 h-40 bg-gray-50 dark:bg-gray-900/50 rounded-xl p-2 border border-gray-100 dark:border-gray-700 flex items-center justify-center mb-2">
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

                                {/* Instructions */}
                                <div className="mt-2 text-xs">
                                  {isUsed ? (
                                    <p className="text-gray-400 dark:text-gray-500 font-medium">Validation effectuée. Les produits ont été remis.</p>
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
                        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-medium">
                          {qrData[order._id]?.error || 'Erreur lors de la récupération du QR.'}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-2">Aucun QR code disponible pour cette commande.</p>
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
