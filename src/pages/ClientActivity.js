import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { getProductImage } from '../utils/imageUrl';

const ClientActivity = () => {
  const [achats, setAchats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
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

  const allOrders = [...commandes, ...achats].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#0f1115] min-h-screen font-sans flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-12">
        
        {/* Content */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">
            Mes commandes
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-[14px]">
            Suivez l'état de vos achats et gérez vos commandes en cours.
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 text-sm font-medium">Chargement...</p>
          </div>
        ) : allOrders.length === 0 ? (
          <div className="bg-white dark:bg-[#1a1d24] rounded-2xl border border-gray-100 dark:border-gray-800 p-12 text-center flex flex-col items-center justify-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Aucune commande</h2>
            <p className="text-gray-500 mb-8 max-w-sm text-[14px]">Vous n'avez pas encore passé de commandes. Parcourez la boutique pour découvrir nos offres.</p>
            <button 
              onClick={() => navigate('/shopping')}
              className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-3 rounded-full font-bold text-[13px] shadow-sm hover:bg-gray-800 transition-colors"
            >
              Découvrir la boutique
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {allOrders.map((cmd) => {
              const isPanier = cmd.products !== undefined;
              const date = new Date(cmd.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
              
              // Define title intelligently based on product details or fallbacks
              let title = 'Achat Direct';
              if (isPanier) title = 'Commande Groupée';
              else if (cmd.productName || cmd.name) title = cmd.productName || cmd.name;
              else if (cmd.userPref && cmd.userPref.length < 30) title = `Produit (${cmd.userPref})`;
              
              const qty = cmd.productQuantity || (cmd.products ? cmd.products.reduce((acc, p) => acc + (p.quantity || 1), 0) : 1);
              
              // Fix image rendering
              const imgUrl = getProductImage(cmd) || cmd.picture;
              
              let statusColor = "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300";
              if (cmd.status === 'Payé') statusColor = "bg-green-50 text-green-700 border border-green-200";
              else if (cmd.status?.toLowerCase().includes('en attente')) statusColor = "bg-yellow-50 text-yellow-700 border border-yellow-200";
              else if (cmd.status?.toLowerCase().includes('livr')) statusColor = "bg-blue-50 text-blue-700 border border-blue-200";

              return (
                <div key={cmd._id} className="bg-white dark:bg-[#1a1d24] p-6 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors flex flex-col sm:flex-row gap-6 sm:items-center shadow-sm">
                  
                  {/* Image Placeholder or Actual Image */}
                  <div className="w-20 h-20 bg-gray-50 dark:bg-gray-900 rounded-xl overflow-hidden flex items-center justify-center shrink-0 border border-gray-100 dark:border-gray-800">
                    {imgUrl ? (
                      <img src={imgUrl} alt="Produit" className="w-full h-full object-contain p-2" />
                    ) : (
                      <div className="w-full h-full bg-gray-100 dark:bg-gray-800" />
                    )}
                  </div>
                  
                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${statusColor}`}>
                        {cmd.status || 'En attente'}
                      </span>
                      <span className="text-[12px] text-gray-500 font-medium">{date}</span>
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-[16px] line-clamp-1 mb-1">{title}</h3>
                    <div className="flex items-center gap-4 text-[13px] text-gray-500">
                      <p>N° <span className="font-medium text-gray-900 dark:text-gray-300">{cmd._id?.slice(-8).toUpperCase()}</span></p>
                      <span className="w-1 h-1 bg-gray-300 rounded-full" />
                      <p>{qty} article{qty > 1 ? 's' : ''}</p>
                    </div>
                  </div>

                  {/* Price & Actions */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 pt-4 sm:pt-0 sm:pl-6">
                    <div className="text-left sm:text-right">
                      <p className="text-[11px] text-gray-400 font-medium mb-1">Total</p>
                      <span className="text-[18px] font-black text-gray-900 dark:text-white leading-none">
                        {cmd.totalPrice} <span className="text-[12px] font-bold text-gray-500">FCFA</span>
                      </span>
                    </div>
                    <button 
                      onClick={() => setExpandedOrder(expandedOrder === cmd._id ? null : cmd._id)}
                      className="text-[13px] font-bold text-gray-900 dark:text-white underline hover:text-[#ffdc2b] transition-colors"
                    >
                      {expandedOrder === cmd._id ? 'Fermer' : 'Détails'}
                    </button>
                  </div>

                </div>
                
                {expandedOrder === cmd._id && (
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Détails de la commande</h4>
                    
                    {/* Products List */}
                    {cmd.products && cmd.products.length > 0 ? (
                      <div className="space-y-3 mb-6">
                        {cmd.products.map((p, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-white dark:bg-[#1a1d24] p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                              <span className="font-medium text-sm text-gray-900 dark:text-white line-clamp-1 max-w-[200px] sm:max-w-sm">{p.name || p.productName || 'Produit sans nom'}</span>
                              <span className="text-xs text-gray-500 font-bold px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded-md">x{p.quantity || 1}</span>
                            </div>
                            <span className="text-sm font-black text-gray-900 dark:text-white whitespace-nowrap">{(p.price || 0).toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 italic">Achat direct - Aucun détail de produit disponible</p>
                    )}

                    {/* Shipping Info */}
                    {(cmd.firstName || cmd.address || cmd.phone) && (
                      <div className="bg-white dark:bg-[#1a1d24] p-4 rounded-xl border border-gray-100 dark:border-gray-800 text-sm">
                        <p className="font-bold text-gray-900 dark:text-white mb-2">Informations de livraison</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Destinataire</p>
                            <p className="text-gray-900 dark:text-gray-300 font-medium">{cmd.firstName} {cmd.lastName}</p>
                            <p className="text-gray-900 dark:text-gray-300">{cmd.phone}</p>
                          </div>
                          <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Adresse</p>
                            <p className="text-gray-900 dark:text-gray-300 font-medium">{cmd.address}</p>
                            <p className="text-gray-900 dark:text-gray-300">{cmd.city}, {cmd.country}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientActivity;
