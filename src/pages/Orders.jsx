import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import QRCode from 'qrcode';
import API_BASE_URL from '../apiConfig';

const fetchMyOrders = async () => {
  try {
    const token = localStorage.getItem('dangoToken');
    const res = await apiClient.get('/shop-orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
    // debug
    console.debug('[Orders] fetched my-orders response', res?.data);
    return res.data.data || [];
  } catch (err) {
    console.error('[Orders] fetchMyOrders error', err?.response?.data || err.message || err);
    // Try fallback to legacy orders endpoint for diagnostics
    try {
      console.warn('[Orders] attempting fallback to /orders/my-orders');
      const token = localStorage.getItem('dangoToken');
      const fallback = await apiClient.get('/orders/my-orders', { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      console.warn('[Orders] fallback succeeded, returning legacy orders');
      return fallback.data.data || [];
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

const Orders = () => {
  const { data: orders = [], isLoading, error } = useQuery({ queryKey: ['my-orders'], queryFn: fetchMyOrders, staleTime: 1000 * 60 * 30 });

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [periodFilter, setPeriodFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expanded, setExpanded] = useState(null);
  const [qrModal, setQrModal] = useState({ open: false, images: [], tokens: [], orderId: null });

  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? orders.slice() : [];
    if (statusFilter !== 'all') list = list.filter(o => String(o.status).toLowerCase() === String(statusFilter).toLowerCase());
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
    try {
      const token = localStorage.getItem('dangoToken');
      const headers = token ? { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
      const res = await fetch(`${API_BASE_URL}/api/qr/generate/${orderId}`, { method: 'POST', headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur');
      const qrTokens = data.data?.qrTokens || [];
      const images = [];
      await Promise.all(qrTokens.map(async t => {
        try { images.push({ token: t.token, img: await QRCode.toDataURL(String(t.token), { width: 300 }) }); }
        catch (e) { console.error('QR gen', e); }
      }));
      setQrModal({ open: true, images, tokens: qrTokens, orderId });
    } catch (err) {
      console.error('loadQrForOrder', err);
      setQrModal({ open: true, images: [], tokens: [], orderId, error: err.message });
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
      alert(err.message || 'Erreur téléchargement facture');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="max-w-6xl mx-auto p-4">
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700">
            Erreur chargement commandes: {String(error?.message || error)}. Vérifiez la console réseau et que vous êtes connecté.
          </div>
        )}
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Mes commandes</h1>
          <p className="text-sm text-gray-500">Retrouvez toutes vos commandes et leur statut.</p>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-4">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Rechercher par numéro, produit ou vendeur" className="flex-1 p-2 rounded border" />
          <select value={statusFilter} onChange={(e)=>setStatusFilter(e.target.value)} className="p-2 rounded border">
            <option value="all">Toutes</option>
            <option value="pending">En attente</option>
            <option value="confirmed">Paiement confirmé</option>
            <option value="processing">En préparation</option>
            <option value="shipped">Expédiée</option>
            <option value="shipping">En livraison</option>
            <option value="delivered">Livrée</option>
            <option value="cancelled">Annulée</option>
            <option value="refunded">Remboursée</option>
          </select>
          <select value={sortBy} onChange={(e)=>setSortBy(e.target.value)} className="p-2 rounded border">
            <option value="newest">Plus récentes</option>
            <option value="oldest">Plus anciennes</option>
            <option value="amount_asc">Montant croissant</option>
            <option value="amount_desc">Montant décroissant</option>
          </select>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mb-6">
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">Total</div><div className="font-bold text-lg">{orders.length}</div></div>
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">En attente</div><div className="font-bold text-lg">{orders.filter(o=>o.status==='pending').length}</div></div>
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">Préparation</div><div className="font-bold text-lg">{orders.filter(o=>o.status==='processing').length}</div></div>
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">Expédiées</div><div className="font-bold text-lg">{orders.filter(o=>o.status==='shipped').length}</div></div>
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">Livrées</div><div className="font-bold text-lg">{orders.filter(o=>o.status==='delivered').length}</div></div>
          <div className="bg-white p-3 rounded shadow text-center"><div className="text-xs text-gray-500">Annulées</div><div className="font-bold text-lg">{orders.filter(o=>o.status==='cancelled').length}</div></div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {isLoading ? <div>Chargement...</div> : (filtered.length === 0 ? (
            <div className="bg-white p-8 rounded text-center">
              <p className="text-lg font-semibold">Vous n'avez encore effectué aucune commande.</p>
              <a href="/shopping" className="inline-block mt-4 px-4 py-2 bg-yellow-400 rounded">Découvrir les produits</a>
            </div>
          ) : filtered.map(order => (
            <div key={order._id} className="bg-white rounded shadow p-4">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-sm text-gray-500">N° {order.orderNumber || (order._id||'').slice(-8).toUpperCase()}</div>
                  <div className="font-bold text-lg">{(order.items||[]).slice(0,1)[0]?.productName || 'Commande'}</div>
                  <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString('fr-FR')}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-lg">{formatCurrency(order.total || order.totalPrice || 0)} FCFA</div>
                  <div className="text-xs text-gray-500">{(order.items||[]).reduce((s,i)=>s+(i.quantity||1),0)} article(s)</div>
                </div>
              </div>

              {/* Vendor grouping */}
              <div className="mt-3 border-t pt-3 space-y-2">
                {Object.values((order.items||[]).reduce((acc,it)=>{
                  const vid = it.vendorId||'platform';
                  if (!acc[vid]) acc[vid]={vendorName: it.vendorName||'Dango Import', items:[]}; acc[vid].items.push(it); return acc;
                },{})).map((g, idx)=> (
                  <div key={idx} className="p-2 bg-gray-50 rounded">
                    <div className="flex justify-between items-center">
                      <div className="font-medium">{g.vendorName}</div>
                      <div className="flex gap-2">
                        <button onClick={()=> window.location.href = `/shop/${g.vendorName}` } className="text-sm text-blue-600">Voir la boutique</button>
                        <button onClick={()=> alert('Contact vendeur: utilisez la messagerie ou email')} className="text-sm text-gray-600">Contacter</button>
                      </div>
                    </div>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {g.items.map((p,pi)=> (
                        <div key={pi} className="flex items-center gap-3 p-2 bg-white rounded border">
                          <img src={p.productImage||p.image||''} alt={p.productName} className="w-16 h-16 object-contain" />
                          <div className="flex-1">
                            <div className="font-medium text-sm line-clamp-2">{p.productName}</div>
                            <div className="text-xs text-gray-500">x{p.quantity} • {(p.price||0).toLocaleString('fr-FR')} FCFA</div>
                          </div>
                          <div>
                            <a href={`/product/${p.productId}`} className="text-sm text-blue-600">Voir</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-3">
                <button onClick={()=> setExpanded(expanded===order._id?null:order._id)} className="px-3 py-1 bg-gray-100 rounded">Voir les détails</button>
                <button onClick={()=> downloadInvoice(order._id)} className="px-3 py-1 bg-gray-100 rounded">Télécharger la facture</button>
                <button onClick={()=> loadQrForOrder(order._id)} className="px-3 py-1 bg-gray-100 rounded">Afficher le QR Code</button>
                <button onClick={()=> alert('Contacter le support via centre d\'aide')} className="px-3 py-1 bg-gray-100 rounded">Contacter le support</button>
              </div>

              {expanded === order._id && (
                <div className="mt-4 bg-gray-50 p-3 rounded">
                  <h4 className="font-semibold">Timeline</h4>
                  <ul className="text-sm text-gray-600 mt-2 space-y-2">
                    <li>Commande créée — {new Date(order.createdAt).toLocaleString('fr-FR')}</li>
                    {order.paymentDate && <li>Paiement confirmé — {new Date(order.paymentDate).toLocaleString('fr-FR')}</li>}
                    {order.updatedAt && <li>Dernière mise à jour — {new Date(order.updatedAt).toLocaleString('fr-FR')}</li>}
                  </ul>
                  <div className="mt-3 text-sm">
                    <div>Sous-total: {formatCurrency(order.subtotal||0)} FCFA</div>
                    <div>Livraison: {formatCurrency(order.shippingCost||0)} FCFA</div>
                    <div>Réduction: {formatCurrency(order.discount||0)} FCFA</div>
                    <div className="font-bold">Montant payé: {formatCurrency(order.total||order.totalPrice||0)} FCFA</div>
                    <div>Référence FedaPay: {order.paymentReference || order.transactionId || '-'}</div>
                  </div>
                </div>
              )}
            </div>
          ))) }
        </div>

        {/* QR Modal */}
        {qrModal.open && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded max-w-2xl w-full">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">QR Codes</h3>
                <button onClick={()=>setQrModal({open:false,images:[],tokens:[],orderId:null})}>Fermer</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {qrModal.images.length ? qrModal.images.map((q, i)=> (
                  <div key={i} className="p-2 bg-gray-50 rounded text-center">
                    <img src={q.img} alt={`qr-${i}`} className="mx-auto" />
                    <div className="text-xs text-gray-500 mt-2">Token: {q.token}</div>
                  </div>
                )) : (<div>Aucun QR disponible</div>)}
              </div>
            </div>
          </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default Orders;
