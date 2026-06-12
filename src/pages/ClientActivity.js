import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import {
  FaBoxOpen, FaSpinner, FaShoppingBag, FaUserCircle,
  FaCog, FaBell, FaSignOutAlt, FaChevronRight, FaMapMarkerAlt
} from 'react-icons/fa';

const ClientActivity = () => {
  const [achats, setAchats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      const userData = JSON.parse(localStorage.getItem('dangoUser'));
      if (!userData || !userData.email) {
        navigate('/login');
        return;
      }
      setUser(userData);
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user-activities/${userData.email}`);
        setAchats(response.data.achats || []);
        setCommandes(response.data.commandes || []);
      } catch (error) {
        console.error("Erreur de récupération des activités :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('dangoUser');
    localStorage.removeItem('dangoToken');
    window.dispatchEvent(new Event('authChange'));
    navigate('/login');
  };

  const allOrders = [...commandes, ...achats].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-[#f8f9fa] min-h-screen font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col lg:flex-row gap-8">
        
        {/* Sidebar Dashboard */}
        <aside className="lg:w-72 shrink-0">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 bg-gradient-to-br from-gray-900 to-slate-800 text-center">
              <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/20">
                <FaUserCircle className="text-white/80 text-5xl" />
              </div>
              <h2 className="text-lg font-bold text-white line-clamp-1">{user?.nom || user?.name || 'Mon Compte'}</h2>
              <p className="text-sm text-gray-300 line-clamp-1">{user?.email}</p>
            </div>
            <nav className="p-3 space-y-1">
              <button className="w-full flex items-center justify-between px-4 py-3 bg-[#fffbeb] text-[#d4b000] rounded-xl font-bold transition-colors">
                <span className="flex items-center gap-3"><FaShoppingBag /> Mes commandes</span>
                <FaChevronRight size={10} />
              </button>
              <button onClick={() => navigate('/cart')} className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                <span className="flex items-center gap-3"><FaBoxOpen /> Mon panier</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                <span className="flex items-center gap-3"><FaMapMarkerAlt /> Adresses</span>
              </button>
              <button className="w-full flex items-center justify-between px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl font-medium transition-colors">
                <span className="flex items-center gap-3"><FaCog /> Paramètres</span>
              </button>
              <div className="h-px bg-gray-100 my-2 mx-4"></div>
              <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl font-medium transition-colors">
                <span className="flex items-center gap-3"><FaSignOutAlt /> Déconnexion</span>
              </button>
            </nav>
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Historique de commandes</h1>
            <p className="text-gray-500 text-sm mt-1">Consultez et suivez l'état de vos achats sur Dango Import.</p>
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-100">
              <FaSpinner className="animate-spin text-3xl mb-4 text-[#ffdc2b]" />
              <p className="text-gray-500 text-sm font-medium">Chargement de vos commandes...</p>
            </div>
          ) : allOrders.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 text-4xl mb-6">
                <FaShoppingBag />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Aucune commande trouvée</h2>
              <p className="text-gray-500 mb-8 max-w-md text-sm">Vous n'avez pas encore passé de commandes. Parcourez la boutique pour découvrir nos offres exclusives.</p>
              <button 
                onClick={() => navigate('/shopping')}
                className="btn-brand px-6 py-2.5 rounded-xl font-bold text-sm shadow-sm"
              >
                Découvrir la boutique
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {allOrders.map((cmd) => {
                const isPanier = cmd.products !== undefined;
                const date = new Date(cmd.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
                const title = isPanier ? 'Commande Groupée (Panier)' : (cmd.userPref || 'Achat Direct');
                const qty = cmd.productQuantity || (cmd.products ? cmd.products.reduce((acc, p) => acc + (p.quantity || 1), 0) : 1);
                
                let statusColor = "bg-gray-100 text-gray-600";
                if (cmd.status === 'Payé') statusColor = "bg-green-100 text-green-700";
                else if (cmd.status?.toLowerCase().includes('en attente')) statusColor = "bg-[#fffbeb] text-[#d4b000] border border-[#ffdc2b]/50";
                else if (cmd.status?.toLowerCase().includes('livr')) statusColor = "bg-blue-100 text-blue-700";

                return (
                  <div key={cmd._id} className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] hover:border-[#ffdc2b]/50 transition-colors flex flex-col sm:flex-row gap-5 sm:items-center">
                    
                    {/* Image / Icon */}
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-100">
                      {cmd.picture ? (
                        <img src={cmd.picture} alt="Produit" className="max-h-full max-w-full object-contain mix-blend-multiply p-2" />
                      ) : (
                        <FaBoxOpen className="text-gray-300 text-2xl" />
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${statusColor}`}>
                          {cmd.status || 'En attente'}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">Commandé le {date}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-base sm:text-lg line-clamp-1">{title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Numéro de commande : <span className="font-mono text-gray-400">#{cmd._id?.slice(-8).toUpperCase()}</span>
                      </p>
                      <p className="text-xs font-medium text-gray-600 mt-2">
                        {qty} article{qty > 1 ? 's' : ''}
                      </p>
                    </div>

                    {/* Price & Actions */}
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 pt-4 sm:pt-0 sm:pl-6">
                      <div className="text-left sm:text-right">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-0.5">Total</p>
                        <span className="text-xl font-black text-gray-900">{cmd.totalPrice} <span className="text-sm font-bold text-gray-500">FCFA</span></span>
                      </div>
                      <button className="text-xs font-bold text-[#d4b000] hover:text-[#c9a800] hover:underline flex items-center gap-1">
                        Détails <FaChevronRight size={8} />
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientActivity;
