import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import apiClient from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import toast from '../utils/toast';
import {
  Search,
  Package,
  CreditCard,
  Truck,
  ChevronDown,
  ChevronUp,
  Store,
  Clock,
  AlertTriangle,
  ArrowRight,
  Download,
} from 'lucide-react';

const normalizeOrdersResponse = (responseData) => {
  if (!responseData) return [];
  if (Array.isArray(responseData)) return responseData;
  if (Array.isArray(responseData.data)) return responseData.data;
  return [];
};

const fetchMyOrders = async () => {
  const token = localStorage.getItem('dangoToken');
  if (!token) {
    const err = new Error('AUTH_REQUIRED');
    err.code = 'AUTH_REQUIRED';
    throw err;
  }

  try {
    const res = await apiClient.get('/shop-orders/my-orders');
    if (res.data?.success === false) {
      const err = new Error(res.data?.message || 'Accès refusé');
      err.code = 'ORDERS_BLOCKED';
      throw err;
    }
    return normalizeOrdersResponse(res?.data);
  } catch (err) {
    const status = err.response?.status;
    if (status === 401) {
      const authErr = new Error('AUTH_REQUIRED');
      authErr.code = 'AUTH_REQUIRED';
      throw authErr;
    }
    if (status === 403) {
      const blockedErr = new Error(
        err.response?.data?.message ||
          'Le serveur refuse l\'accès aux commandes. Redéployez dangoimport-server avec la dernière version.'
      );
      blockedErr.code = 'ORDERS_BLOCKED';
      throw blockedErr;
    }
    throw err;
  }
};

function formatCurrency(value = 0) {
  try {
    return Number(value).toLocaleString('fr-FR');
  } catch {
    return String(value);
  }
}

function formatOrderNumber(order) {
  if (order?.orderNumber) return String(order.orderNumber);
  const id = String(order?._id || '');
  return id ? `#${id.slice(-8).toUpperCase()}` : 'Commande';
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

export default function Orders() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [expanded, setExpanded] = useState(null);

  const { data: orders = [], isLoading, error, refetch } = useQuery({
    queryKey: ['my-orders'],
    queryFn: fetchMyOrders,
    staleTime: 1000 * 60 * 2,
    retry: (count, err) => err?.code !== 'AUTH_REQUIRED' && count < 1,
  });

  useEffect(() => {
    if (error?.code === 'AUTH_REQUIRED') {
      navigate('/login', { state: { from: '/mes-commandes' }, replace: true });
    }
  }, [error, navigate]);

  const filtered = useMemo(() => {
    let list = Array.isArray(orders) ? orders.slice() : [];

    if (statusFilter !== 'all') {
      list = list.filter(
        (order) => String(order.status).toLowerCase() === String(statusFilter).toLowerCase()
      );
    }

    if (query.trim()) {
      const q = query.trim().toLowerCase();
      list = list.filter(
        (order) =>
          formatOrderNumber(order).toLowerCase().includes(q) ||
          (order.items || []).some((item) =>
            String(item.productName || '').toLowerCase().includes(q)
          ) ||
          (order.items || []).some((item) =>
            String(item.vendorName || '').toLowerCase().includes(q)
          )
      );
    }

    if (sortBy === 'newest') list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === 'oldest') list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === 'amount_asc') list.sort((a, b) => (a.total || 0) - (b.total || 0));
    else if (sortBy === 'amount_desc') list.sort((a, b) => (b.total || 0) - (a.total || 0));

    return list;
  }, [orders, statusFilter, query, sortBy]);

  const downloadInvoice = async (orderId) => {
    try {
      const token = localStorage.getItem('dangoToken');
      const res = await fetch(`${API_BASE_URL}/api/shop-orders/${orderId}/invoice`, {
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });
      if (!res.ok) throw new Error('Facture indisponible');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `facture-${formatOrderNumber({ _id: orderId })}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err.message || 'Erreur lors du téléchargement');
    }
  };

  if (error?.code === 'AUTH_REQUIRED') {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      <Header />
      <main className="mx-auto max-w-6xl px-4 pb-10 pt-6">
        {error && error.code !== 'AUTH_REQUIRED' && (
          <div className="mb-6 flex items-start justify-between gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
              <p className="text-sm">
                {error.code === 'ORDERS_BLOCKED'
                  ? error.message
                  : 'Impossible de charger vos commandes pour le moment.'}
              </p>
            </div>
            {error.code !== 'ORDERS_BLOCKED' && (
              <button
                type="button"
                onClick={() => refetch()}
                className="shrink-0 text-xs font-bold underline"
              >
                Réessayer
              </button>
            )}
          </div>
        )}

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">
            Historique des commandes
          </h1>
          <p className="mt-1 text-gray-500">
            Retrouvez vos achats, leur statut et téléchargez vos factures.
          </p>
        </div>

        <div className="mb-6 flex flex-col items-center gap-4 rounded-2xl border border-gray-150 bg-white p-4 shadow-sm sm:flex-row">
          <div className="relative w-full sm:flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher par numéro, produit ou boutique..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm text-gray-900 outline-none transition focus:bg-white focus:ring-2 focus:ring-[#FF6B00]/40"
            />
          </div>
          <div className="flex w-full shrink-0 gap-3 sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-1/2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/40 sm:w-44"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">Paiement en attente</option>
              <option value="confirmed">Confirmée</option>
              <option value="processing">En préparation</option>
              <option value="shipped">Expédiée</option>
              <option value="delivered">Livrée</option>
              <option value="cancelled">Annulée</option>
              <option value="refunded">Remboursée</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-1/2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#FF6B00]/40 sm:w-44"
            >
              <option value="newest">Plus récentes</option>
              <option value="oldest">Plus anciennes</option>
              <option value="amount_asc">Montant croissant</option>
              <option value="amount_desc">Montant décroissant</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-12 shadow-sm">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-[#FF6B00] border-t-transparent" />
              <span className="font-medium text-gray-500">Chargement de votre historique...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-12 text-center shadow-sm">
              <Package className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-lg font-bold text-gray-800">Aucune commande trouvée</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
                Vous n&apos;avez pas encore passé de commande ou aucun résultat ne correspond à votre recherche.
              </p>
              <Link
                to="/shopping"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#FF6B00] px-6 py-3 text-sm font-extrabold text-white shadow-md transition hover:bg-[#e05e00]"
              >
                Parcourir la boutique <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            filtered.map((order) => {
              const statusKey = String(order.status || '').toLowerCase();
              const isCancelled = ['cancelled', 'refunded'].includes(statusKey);
              const badgeMeta = STATUS_BADGES[statusKey] || {
                bg: 'bg-gray-100 text-gray-800 border-gray-200',
                label: order.status || 'Statut inconnu',
              };
              const itemCount = (order.items || []).reduce(
                (sum, item) => sum + (item.quantity || 1),
                0
              );

              return (
                <article
                  key={order._id}
                  className="overflow-hidden rounded-2xl border border-gray-150 bg-white shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col justify-between gap-4 border-b border-gray-150 bg-gray-50/60 p-4 md:flex-row md:items-center">
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Commande
                        </span>
                        <div className="mt-0.5 text-sm font-bold text-gray-900">
                          {formatOrderNumber(order)}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Date
                        </span>
                        <div className="mt-0.5 text-sm font-medium text-gray-700">
                          {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Total
                        </span>
                        <div className="mt-0.5 text-sm font-black text-[#FF6B00]">
                          {formatCurrency(order.total || order.totalPrice || 0)} FCFA
                        </div>
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                          Statut
                        </span>
                        <div className="mt-0.5">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-extrabold ${badgeMeta.bg}`}
                          >
                            {badgeMeta.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadInvoice(order._id)}
                      className="inline-flex items-center gap-1.5 self-end rounded-xl bg-gray-100 px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:bg-gray-200 md:self-center"
                    >
                      <Download className="h-3.5 w-3.5" /> Facture
                    </button>
                  </div>

                  {isCancelled && (
                    <div className="flex items-center justify-center gap-2 border-b border-red-100 bg-red-50 p-3 text-xs font-semibold text-rose-800">
                      <AlertTriangle className="h-4 w-4" />
                      Cette commande a été annulée ou remboursée.
                    </div>
                  )}

                  <div className="space-y-4 p-4">
                    {Object.values(
                      (order.items || []).reduce((acc, item) => {
                        const vendorKey = item.vendorName || 'Dango Import';
                        if (!acc[vendorKey]) {
                          acc[vendorKey] = { vendorName: vendorKey, items: [] };
                        }
                        acc[vendorKey].items.push(item);
                        return acc;
                      }, {})
                    ).map((group) => (
                      <div
                        key={group.vendorName}
                        className="overflow-hidden rounded-2xl border border-gray-150 bg-gray-50 p-3.5"
                      >
                        <div className="mb-3 flex items-center gap-2 border-b border-gray-200/60 pb-2">
                          <Store className="h-4 w-4 text-[#FF6B00]" />
                          <span className="text-sm font-extrabold text-gray-800">
                            {group.vendorName}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {group.items.map((item, index) => (
                            <div
                              key={`${item.productId || item.productName}-${index}`}
                              className="flex items-center gap-3 rounded-xl border border-gray-150 bg-white p-2"
                            >
                              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-1">
                                {item.productImage || item.image ? (
                                  <img
                                    src={item.productImage || item.image}
                                    alt={item.productName || 'Produit'}
                                    className="max-h-full max-w-full object-contain"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-gray-300" />
                                )}
                              </div>
                              <div className="min-w-0 flex-1">
                                <h4 className="truncate text-sm font-bold text-gray-800">
                                  {item.productName || 'Produit'}
                                </h4>
                                <div className="mt-1 flex items-center gap-3">
                                  <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-bold text-gray-500">
                                    Qté: {item.quantity || 1}
                                  </span>
                                  <span className="text-xs font-semibold text-gray-700">
                                    {formatCurrency(item.price || 0)} FCFA
                                  </span>
                                </div>
                              </div>
                              {item.productId && (
                                <Link
                                  to={`/product/${item.productId}`}
                                  className="rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 transition hover:bg-gray-100"
                                >
                                  Voir
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-3">
                    <button
                      type="button"
                      onClick={() =>
                        setExpanded((current) => (current === order._id ? null : order._id))
                      }
                      className="inline-flex items-center gap-1 rounded-xl bg-[#FF6B00] px-4 py-2 text-xs font-extrabold text-white shadow-sm transition hover:bg-[#e05e00]"
                    >
                      {expanded === order._id ? (
                        <>
                          Masquer le détail <ChevronUp className="h-3.5 w-3.5" />
                        </>
                      ) : (
                        <>
                          Voir le détail <ChevronDown className="h-3.5 w-3.5" />
                        </>
                      )}
                    </button>
                    <span className="text-xs text-gray-400">
                      {itemCount} article{itemCount > 1 ? 's' : ''}
                    </span>
                  </div>

                  {expanded === order._id && (
                    <div className="space-y-4 border-t border-gray-150 bg-gray-50/50 p-5">
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <div className="rounded-2xl border border-gray-150 bg-white p-4">
                          <h4 className="mb-3 text-sm font-extrabold text-gray-900">Récapitulatif</h4>
                          <dl className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                              <dt>Sous-total</dt>
                              <dd className="font-semibold text-gray-800">
                                {formatCurrency(order.subtotal || 0)} FCFA
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Livraison</dt>
                              <dd className="font-semibold text-gray-800">
                                {formatCurrency(order.shippingCost || 0)} FCFA
                              </dd>
                            </div>
                            <div className="flex justify-between">
                              <dt>Réduction</dt>
                              <dd className="font-semibold text-gray-800">
                                -{formatCurrency(order.discount || 0)} FCFA
                              </dd>
                            </div>
                            <div className="flex justify-between border-t pt-2 font-bold text-gray-900">
                              <dt>Total payé</dt>
                              <dd className="text-[#FF6B00]">
                                {formatCurrency(order.total || order.totalPrice || 0)} FCFA
                              </dd>
                            </div>
                          </dl>
                        </div>

                        <div className="rounded-2xl border border-gray-150 bg-white p-4">
                          <h4 className="mb-3 text-sm font-extrabold text-gray-900">Suivi</h4>
                          <ul className="space-y-2 text-xs text-gray-500">
                            <li className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-gray-400" />
                              <span>
                                Commande passée le{' '}
                                <strong className="text-gray-700">
                                  {new Date(order.createdAt || order.date).toLocaleString('fr-FR')}
                                </strong>
                              </span>
                            </li>
                            {order.paymentDate && (
                              <li className="flex items-center gap-2">
                                <CreditCard className="h-3.5 w-3.5 text-[#FF6B00]" />
                                <span>
                                  Paiement validé le{' '}
                                  <strong className="text-gray-700">
                                    {new Date(order.paymentDate).toLocaleString('fr-FR')}
                                  </strong>
                                </span>
                              </li>
                            )}
                            <li className="flex items-center gap-2">
                              <Truck className="h-3.5 w-3.5 text-[#FF6B00]" />
                              <span>
                                Statut actuel :{' '}
                                <strong className="text-gray-700">{badgeMeta.label}</strong>
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
