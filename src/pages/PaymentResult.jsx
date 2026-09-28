import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import toast from '../utils/toast';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { fetchOrderQrTokens } from '../services/qrService';
import { useCart } from '../context/CartContext';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restoreCart, clearCart } = useCart();
  const [status, setStatus] = useState('pending');
  const [orderId, setOrderId] = useState(null);
  const [dropshipMode, setDropshipMode] = useState(false);
  const [dropshipSummary, setDropshipSummary] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [message, setMessage] = useState('Chargement du résultat de paiement...');
  const [loading, setLoading] = useState(true);
  const [qrTokens, setQrTokens] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [cartRestored, setCartRestored] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = String(params.get('status') || 'pending').toLowerCase();
    const orderIdParam = params.get('orderId');
    const transactionIdParam = params.get('transactionId') || params.get('id');
    const checkoutModeParam = (params.get('checkoutMode') || '').toLowerCase();

    setStatus(statusParam);
    setOrderId(orderIdParam);
    setTransactionId(transactionIdParam);

    const pendingRaw = localStorage.getItem('pendingFedapay');
    let pendingMode = checkoutModeParam === 'dropshipping';
    try {
      if (pendingRaw) {
        const pending = JSON.parse(pendingRaw);
        if (pending.checkoutMode === 'dropshipping') pendingMode = true;
      }
    } catch {
      /* ignore */
    }
    setDropshipMode(pendingMode);
    try {
      const summaryRaw = localStorage.getItem('pendingDropshipCheckoutSummary');
      if (summaryRaw) setDropshipSummary(JSON.parse(summaryRaw));
    } catch {
      /* ignore */
    }

    const token = localStorage.getItem('dangoToken');
    let mounted = true;
    let timerId = null;
    const maxAttempts = 40;
    let attempts = 0;

    const restoreBackupCart = () => {
      const backupRaw = localStorage.getItem('pendingFedapayCartBackup');
      if (!backupRaw) return false;
      try {
        const parsed = JSON.parse(backupRaw);
        if (!Array.isArray(parsed) || parsed.length === 0) return false;
        restoreCart(parsed.map((item) => ({ ...item, _id: item._id || item.id })));
        localStorage.removeItem('pendingFedapayCartBackup');
        setCartRestored(true);
        return true;
      } catch (err) {
        console.error('Impossible de restaurer le panier:', err);
        return false;
      }
    };

    const finishDropshipSuccess = (resolvedOrderId, resolvedOrderNumber) => {
      clearCart();
      let summary = null;
      try {
        summary = JSON.parse(localStorage.getItem('pendingDropshipCheckoutSummary') || 'null');
      } catch {
        summary = null;
      }
      localStorage.removeItem('pendingDropshipCheckoutSummary');
      const totalLabel = summary?.total
        ? `${Number(summary.total).toLocaleString('fr-FR')} FCFA`
        : null;
      const eta = summary?.estimatedDelivery;
      const ref = resolvedOrderNumber || resolvedOrderId;
      setStatus('success');
      setMessage(
        [
          '✓ Commande confirmée',
          '',
          'Merci pour votre commande.',
          ref ? `Votre commande ${ref} a bien été enregistrée.` : 'Votre commande a bien été enregistrée.',
          'Notre équipe va maintenant la traiter et préparer son expédition.',
          eta ? `Livraison estimée : ${eta}` : null,
          totalLabel ? `Total : ${totalLabel}` : null,
        ].filter(Boolean).join('\n'),
      );
      setLoading(false);
      return true;
    };

    const finishPaymentFailed = (text) => {
      setStatus('failed');
      setOrderId(null);
      setMessage(text);
      restoreBackupCart();
      setLoading(false);
      return true;
    };

    const fetchQrTokensForOrder = async (currentOrderId, isDropship, orderNumber) => {
      if (isDropship) {
        return finishDropshipSuccess(currentOrderId, orderNumber);
      }
      try {
        const qrResponse = await fetchOrderQrTokens(currentOrderId, token);
        const tokens = qrResponse.qrTokens || [];
        setQrTokens(tokens);
        if (!tokens.length) {
          setMessage('Commande confirmée, mais les codes QR ne sont pas encore prêts. Nous réessayons.');
          return false;
        }
        setMessage('Paiement réussi ! Vos codes QR sont prêts. Un email récapitulatif avec vos QR codes vient de vous être envoyé — pensez à vérifier votre boîte mail (et vos spams).');
        return true;
      } catch (err) {
        console.error('Erreur de récupération des QR:', err);
        setMessage('Commande confirmée, mais impossible de récupérer le QR pour le moment. Nouvel essai en cours.');
        return false;
      }
    };

    const currentTransactionId = transactionIdParam;
    const checkOrder = async () => {
      if (!currentTransactionId) {
        setMessage('Aucune transaction trouvée. Vérifiez votre commande plus tard.');
        setLoading(false);
        return false;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/fedapay/transaction/${currentTransactionId}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const data = await response.json();

        if (!response.ok) {
          console.error('verify response error', data);
          setMessage('Impossible de vérifier l’état du paiement. Nous réessayons.');
          return false;
        }

        const payload = data.data || {};
        const paid = payload.paid === true;
        const localStatus = String(payload.status || '').toLowerCase();
        const providerStatus = String(payload.providerStatus || '').toLowerCase();
        const paymentStatus = String(payload.paymentStatus || '').toLowerCase();
        const currentOrderId = paid ? (payload.orderId || null) : null;

        if (paid && currentOrderId) {
          setOrderId(currentOrderId);
          localStorage.removeItem('pendingFedapay');
          localStorage.removeItem('pendingFedapayCartBackup');
          return await fetchQrTokensForOrder(
            currentOrderId,
            pendingMode,
            payload.orderNumber,
          );
        }

        if (localStatus === 'approved' && paymentStatus !== 'completed') {
          setMessage('Paiement validé, la commande est en cours de finalisation. Patientez encore quelques instants.');
          return false;
        }

        if (
          ['failed', 'canceled', 'cancelled'].includes(localStatus)
          || ['failed', 'canceled', 'cancelled'].includes(providerStatus)
        ) {
          return finishPaymentFailed('Le paiement n’a pas abouti. Aucune commande n’a été confirmée. Votre panier a été restauré.');
        }

        setMessage('Vérification du paiement en cours. Ne fermez pas cette page…');
        return false;
      } catch (err) {
        console.error('Erreur lors de la vérification de paiement', err);
        setMessage('Erreur serveur lors de la vérification. Nouvel essai en cours.');
        return false;
      }
    };

    const startPolling = async () => {
      setLoading(true);
      const poll = async () => {
        if (!mounted) return;
        attempts += 1;
        const finished = await checkOrder();
        if (finished) {
          setLoading(false);
          return;
        }

        if (attempts >= maxAttempts) {
          finishPaymentFailed('Le paiement n’a pas abouti dans les délais. Aucune commande n’a été confirmée. Votre panier a été restauré.');
          return;
        }

        timerId = window.setTimeout(poll, 3000);
      };
      await poll();
    };

    if (['failed', 'cancelled', 'canceled', 'error', 'declined', 'rejected'].includes(statusParam)) {
      finishPaymentFailed('Le paiement a échoué ou a été annulé. Votre panier a été restauré.');
      return () => {
        mounted = false;
        if (timerId) clearTimeout(timerId);
      };
    }

    setMessage('Vérification du paiement FedaPay. Nous confirmons uniquement si le paiement a réellement abouti.');
    startPolling();

    return () => {
      mounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [location.search, restoreCart, clearCart]);

  useEffect(() => {
    if (!qrTokens.length) {
      setQrImages({});
      return;
    }

    qrTokens.forEach((tokenData) => {
      QRCode.toDataURL(tokenData.token, { width: 280, margin: 2 })
        .then((url) => {
          setQrImages((prev) => ({ ...prev, [tokenData.token]: url }));
        })
        .catch((err) => {
          console.error('Échec génération QRCode :', err);
        });
    });
  }, [qrTokens]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      <Header />
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          <h1 className="text-3xl font-black text-[#282828]">Résultat de votre paiement</h1>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8">
          <div className="space-y-4 text-gray-700">
            <p className="text-base leading-7 whitespace-pre-line">{message}</p>
            {dropshipMode && !loading && status === 'success' && orderId && (
              <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 px-4 py-3 m-0">
                Vous recevrez des nouvelles par email ou téléphone. Aucune action n’est requise de votre côté chez un fournisseur externe.
              </p>
            )}
            {!loading && status === 'failed' && (
              <p className="text-sm text-rose-800 bg-rose-50 border border-rose-200 px-4 py-3 m-0">
                Le paiement FedaPay n’a pas été validé. Vous pouvez réessayer depuis le panier.
              </p>
            )}
            {loading && <p className="text-sm text-gray-500">Chargement en cours...</p>}
            {!loading && transactionId && (
              <p className="text-sm text-gray-500">Transaction FedaPay : <span className="font-semibold">{transactionId}</span></p>
            )}
            {!loading && orderId && (
              <p className="text-sm text-gray-500">Numéro de commande : <span className="font-semibold">{orderId}</span></p>
            )}
            {cartRestored && (
              <p className="text-sm text-emerald-700">Votre panier a été restauré avec succès.</p>
            )}
          </div>

          {qrTokens.length > 0 && (
            <div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 text-sm text-orange-900">
              <p className="font-bold m-0">Email de confirmation envoyé</p>
              <p className="mt-1 mb-0 leading-relaxed">
                Vos codes QR et le récapitulatif de commande vous ont été envoyés par email.
                Vérifiez votre boîte de réception et vos courriers indésirables.
              </p>
            </div>
          )}

          {qrTokens.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-black text-[#282828] mb-4">Vos codes QR</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {qrTokens.map((tokenData) => (
                  <div key={tokenData.token} className="rounded-2xl border border-gray-200 p-4 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-3">Vendeur : {tokenData.vendorName || tokenData.vendorId || 'Dango Import'}</p>
                    <div className="aspect-square overflow-hidden rounded-2xl bg-white p-4 flex items-center justify-center">
                      {qrImages[tokenData.token] ? (
                        <img src={qrImages[tokenData.token]} alt="QR code" className="max-w-full max-h-full" />
                      ) : (
                        <span className="text-sm text-gray-500">Génération du QR…</span>
                      )}
                    </div>
                    <p className="mt-3 text-xs text-gray-500 break-all">{tokenData.token}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => navigate('/shopping')}
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-[#F68B1E] px-6 py-3 text-white font-black shadow-sm hover:bg-[#E67A0C] transition"
            >
              Continuer mes achats
            </button>
            <Link
              to="/mes-commandes"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-gray-300 px-6 py-3 text-gray-900 font-black hover:bg-gray-50 transition"
            >
              Voir mes commandes
            </Link>
            {cartRestored && (
              <Link
                to="/cart"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-[#F68B1E] px-6 py-3 text-[#F68B1E] font-black hover:bg-[#FFF4E6] transition"
              >
                Voir mon panier restauré
              </Link>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PaymentResult;