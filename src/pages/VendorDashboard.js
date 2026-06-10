import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VendorWithdrawal from '../components/VendorWithdrawal';
import API_BASE_URL from '../apiConfig';
import { FaStore, FaMoneyBillWave, FaChartLine, FaBoxOpen, FaSpinner, FaWallet } from 'react-icons/fa';

const VendorDashboard = () => {
  const [achats, setAchats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [products, setProducts] = useState([]);
  const [userBalance, setUserBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('dangoUser'));
  // Assume vendorName is stored in user profile or derives from firstname + surname
  const vendorName = user ? `${user.firstname || ''} ${user.surname || ''}`.trim() : '';

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchVendorData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/vendor-dashboard/${encodeURIComponent(vendorName)}`);
        setAchats(response.data.achats || []);
        setCommandes(response.data.commandes || []);
        setProducts(response.data.products || []);
        
        // Récupérer les infos utilisateur (solde)
        const userResponse = await axios.get(`${API_BASE_URL}/api/users/me/${user.email}`);
        setUserBalance(userResponse.data.balance || 0);
      } catch (error) {
        console.error("Erreur de récupération des données vendeur :", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (vendorName) {
      fetchVendorData();
    } else {
      setLoading(false);
    }
  }, [navigate, vendorName, user]);

  // Calculs statistiques
  const totalSalesCount = achats.length + commandes.length;
  const totalRevenue = [...achats, ...commandes]
    .filter(item => item.status === 'Payé')
    .reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Tableau de Bord Vendeur</h1>
            <p className="text-gray-500 mt-1">Bienvenue sur votre espace de gestion, {vendorName}.</p>
          </div>
          <button 
            onClick={() => navigate(`/vendor/${encodeURIComponent(vendorName)}`)}
            className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
          >
            <FaStore /> Voir ma page publique
          </button>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FaSpinner className="animate-spin text-4xl mb-4 text-[#e6c600]" />
            <p>Chargement de vos données...</p>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-10">
              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-green-50 text-green-600 rounded-lg flex items-center justify-center text-xl">
                    <FaMoneyBillWave />
                  </div>
                  <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Chiffre d'Affaires</h3>
                </div>
                <p className="text-3xl font-black text-gray-900 mt-2">{totalRevenue} <span className="text-lg font-bold">FCFA</span></p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                    <FaChartLine />
                  </div>
                  <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Ventes Totales</h3>
                </div>
                <p className="text-3xl font-black text-gray-900 mt-2">{totalSalesCount} <span className="text-lg font-bold text-gray-400">commandes</span></p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-[#fffbeb] text-[#e6c600] rounded-lg flex items-center justify-center text-xl">
                    <FaBoxOpen />
                  </div>
                  <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Produits en Ligne</h3>
                </div>
                <p className="text-3xl font-black text-gray-900 mt-2">{products.length} <span className="text-lg font-bold text-gray-400">articles</span></p>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-lg flex items-center justify-center text-xl">
                    <FaWallet />
                  </div>
                  <h3 className="text-gray-500 font-semibold text-sm uppercase tracking-wide">Solde Disponible</h3>
                </div>
                <p className="text-3xl font-black text-gray-900 mt-2">{userBalance} <span className="text-lg font-bold">FCFA</span></p>
              </div>
            </div>

            {/* Historique des ventes */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Dernières Ventes</h2>
              </div>
              
              {totalSalesCount === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p>Aucune vente enregistrée pour le moment.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Date</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Client</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Produit/Détail</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Montant</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {[...achats, ...commandes]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((sale, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(sale.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <p className="text-sm font-bold text-gray-900">{sale.userName}</p>
                            <p className="text-xs text-gray-500">{sale.userNumber || sale.userEmail}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm text-gray-800 line-clamp-1">{sale.userPref || sale.productDescription || 'Achat Direct'}</p>
                            <p className="text-xs text-gray-500">Qté: {sale.productQuantity}</p>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm font-black text-gray-900">{sale.totalPrice} F</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                              sale.status === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-[#fffbeb] text-[#e6c600]'
                            }`}>
                              {sale.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Withdrawal Section */}
            <div className="mt-10">
              <VendorWithdrawal vendorEmail={user.email} userBalance={userBalance} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default VendorDashboard;
