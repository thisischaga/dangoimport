import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { FaMoneyBillWave, FaHistory, FaCheck, FaTimes, FaHourglassHalf, FaWallet } from 'react-icons/fa';

const VendorWithdrawal = ({ vendorEmail, userBalance }) => {
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  const [formData, setFormData] = useState({
    amount: '',
    accountHolder: '',
    accountNumber: '',
    bankName: '',
    iban: ''
  });

  useEffect(() => {
    fetchWithdrawalRequests();
  }, [vendorEmail]);

  const fetchWithdrawalRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/withdrawal-requests/${vendorEmail}`);
      setWithdrawalRequests(response.data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    // Validation
    if (!formData.amount || !formData.accountHolder || !formData.accountNumber || !formData.bankName) {
      setMessage({ type: 'error', text: 'Veuillez remplir tous les champs obligatoires.' });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      setMessage({ type: 'error', text: 'Le montant doit être supérieur à 0.' });
      return;
    }

    if (amount > userBalance) {
      setMessage({ type: 'error', text: `Votre solde (${userBalance} FCFA) est insuffisant.` });
      return;
    }

    try {
      setSubmitting(true);
      const response = await axios.post(`${API_BASE_URL}/api/withdrawal-requests`, {
        vendorEmail,
        amount,
        accountHolder: formData.accountHolder,
        accountNumber: formData.accountNumber,
        bankName: formData.bankName,
        iban: formData.iban
      });

      setMessage({ type: 'success', text: 'Demande de retrait créée avec succès !' });
      setFormData({
        amount: '',
        accountHolder: '',
        accountNumber: '',
        bankName: '',
        iban: ''
      });
      setShowForm(false);
      fetchWithdrawalRequests();
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.message || 'Erreur lors de la création de la demande.' 
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'pending':
        return <FaHourglassHalf className="text-yellow-500" />;
      case 'approved':
        return <FaCheck className="text-green-500" />;
      case 'rejected':
        return <FaTimes className="text-red-500" />;
      case 'completed':
        return <FaCheck className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'pending':
        return 'En attente';
      case 'approved':
        return 'Approuvé';
      case 'rejected':
        return 'Rejeté';
      case 'completed':
        return 'Complété';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-700';
      case 'approved':
        return 'bg-green-100 text-green-700';
      case 'rejected':
        return 'bg-red-100 text-red-700';
      case 'completed':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
            <FaMoneyBillWave />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Gestion des Retraits</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-bold text-sm transition-colors"
          >
            + Nouveau Retrait
          </button>
        )}
      </div>

      <div className="p-6">
        {/* Solde */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-3xl text-green-600 shadow-sm">
              <FaWallet />
            </div>
            <div>
              <p className="text-green-600 font-semibold text-sm uppercase tracking-wide mb-1">Solde Disponible</p>
              <p className="text-4xl font-black text-green-900">{userBalance} <span className="text-lg">FCFA</span></p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        {showForm && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Nouvelle Demande de Retrait</h3>
            
            {message.text && (
              <div className={`mb-4 p-4 rounded-lg ${
                message.type === 'error' 
                  ? 'bg-red-50 text-red-700 border border-red-200' 
                  : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Montant */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Montant (FCFA) *</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Ex: 50000"
                  min="0"
                  step="1000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Solde disponible: {userBalance} FCFA</p>
              </div>

              {/* Titulaire du compte */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Titulaire du Compte *</label>
                <input
                  type="text"
                  name="accountHolder"
                  value={formData.accountHolder}
                  onChange={handleInputChange}
                  placeholder="Nom complet"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Numéro de compte */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Numéro de Compte *</label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Numéro de compte bancaire"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* Nom de la banque */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Banque *</label>
                <input
                  type="text"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="Nom de la banque"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>

              {/* IBAN */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">IBAN (optionnel)</label>
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleInputChange}
                  placeholder="IBAN"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              {/* Boutons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {submitting ? 'En cours...' : 'Soumettre'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setMessage({ type: '', text: '' });
                    setFormData({
                      amount: '',
                      accountHolder: '',
                      accountNumber: '',
                      bankName: '',
                      iban: ''
                    });
                  }}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Historique */}
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FaHistory /> Historique des Demandes
          </h3>

          {loading ? (
            <div className="text-center py-8 text-gray-500">
              <p>Chargement...</p>
            </div>
          ) : withdrawalRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>Aucune demande de retrait pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawalRequests.map(request => (
                <div key={request._id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(request.status)}
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </div>
                      <p className="text-lg font-black text-gray-900">{request.amount} FCFA</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Vers: {request.bankDetails.accountHolder} - {request.bankDetails.bankName}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {new Date(request.date).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      {request.rejectionReason && (
                        <p className="text-sm text-red-600 mt-2 bg-red-50 p-2 rounded border border-red-200">
                          Raison du rejet: {request.rejectionReason}
                        </p>
                      )}
                      {request.transactionReference && (
                        <p className="text-sm text-gray-600 mt-2">
                          Ref. transaction: {request.transactionReference}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorWithdrawal;
