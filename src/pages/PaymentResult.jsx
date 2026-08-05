import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { toast } from 'react-toastify';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { fetchOrderQrTokens } from '../services/qrService';
import { useCart } from '../context/CartContext';

const PaymentResult = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { restoreCart } = useCart();
  const [status, setStatus] = useState('pending');
  const [orderId, setOrderId] = useState(null);
  const [transactionId, setTransactionId] = useState(null);
  const [message, setMessage] = useState('Chargement du résultat de paiement...');
  const [loading, setLoading] = useState(true);
  const [qrTokens, setQrTokens] = useState([]);
  const [qrImages, setQrImages] = useState({});
  const [cartRestored, setCartRestored] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const statusParam = (params.get('status') || 'success').toLowerCase();
    const orderIdParam = params.get('orderId');
    const transactionIdParam = params.get('transactionId');

    setStatus(statusParam);
    setOrderId(orderIdParam);
    setTransactionId(transactionIdParam);

    const token = localStorage.getItem('dangoToken');

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

    const loadOrderResult = async () => {
      setLoading(true);
      try {
        let currentOrderId = orderIdParam;
        if (!currentOrderId && transactionIdParam) {
          const response = await fetch(`${API_BASE_URL}/api/payments/verify/${transactionIdParam}`, {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          });
          const data = await response.json();
          if (response.ok) {
            currentOrderId = data.data?.local?.orderId || data.data?.local?.order_id || null;
            if (currentOrderId) {
              setOrderId(currentOrderId);
            }
          }
        }

        if (currentOrderId) {
          const qrResponse = await fetchOrderQrTokens(currentOrderId, token);
          const tokens = qrResponse.data?.qrTokens || [];
          setQrTokens(tokens);
          if (!tokens.length) {
            setMessage('Paiement réussi, mais aucun QR n’a encore été généré. Nous vous contacterons dès que possible.');
          } else {
            setMessage('Paiement réussi ! Vos codes QR sont prêts.');
          }
        } else {
          setMessage('Paiement réussi, validation de la commande en cours. Restez sur cette page quelques instants.');
        }
      } catch (err) {
        console.error('Erreur lors du chargement du résultat de paiement', err);
        toast.error(err.message || 'Impossible de charger le résultat de paiement.');
        setMessage('Impossible de charger le résultat de paiement pour le moment.');
      } finally {
        setLoading(false);
      }
    };

    if (['failed', 'cancelled', 'error'].includes(statusParam)) {
      setMessage('Le paiement a échoué ou a été annulé. Votre panier a été restauré.');
      restoreBackupCart();
      setLoading(false);
      return;
    }

    if (['success', 'approved', 'completed', 'paid'].includes(statusParam)) {
      setMessage('Paiement reçu. Nous vérifions votre commande.');
      loadOrderResult();
      return;
    }

    setMessage('Statut de paiement en attente. Nous vérifions l’état de la transaction.');
    loadOrderResult();
  }, [location.search, restoreCart]);

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
            <p className="text-base leading-7">{message}</p>
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
