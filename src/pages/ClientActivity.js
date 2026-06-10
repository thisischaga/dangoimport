import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import API_BASE_URL from '../apiConfig';
import { FaBoxOpen, FaSpinner, FaShoppingBag } from 'react-icons/fa';

const ClientActivity = () => {
  const [achats, setAchats] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActivities = async () => {
      const user = JSON.parse(localStorage.getItem('dangoUser'));
      if (!user || !user.email) {
        navigate('/login');
        return;
      }
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user-activities/${user.email}`);
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

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-8 tracking-tight">Mon Historique d'Achats</h1>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FaSpinner className="animate-spin text-4xl mb-4 text-[#e6c600]" />
            <p>Chargement de vos commandes...</p>
          </div>
        ) : achats.length === 0 && commandes.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-3xl mb-6">
              <FaShoppingBag />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Aucune activité récente</h2>
            <p className="text-gray-500 mb-8 max-w-md">Vous n'avez pas encore passé de commandes. Parcourez la boutique pour découvrir nos produits locaux.</p>
            <button 
              onClick={() => navigate('/shopping')}
              className="bg-[#ffdc2b] hover:bg-[#e6c600] text-gray-900 px-6 py-3 rounded-lg font-bold transition-colors"
            >
              Découvrir la boutique
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            {commandes.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaBoxOpen className="text-[#e6c600]" /> Commandes Globales (Panier)
                </h2>
                <div className="grid gap-4">
                  {commandes.map((cmd) => (
                    <div key={cmd._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                          Le {new Date(cmd.date).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-gray-900 text-lg">{cmd.productDescription || 'Panier'}</h3>
                        <p className="text-sm text-gray-500">Quantité : {cmd.productQuantity}</p>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <span className="text-xl font-black text-gray-900">{cmd.totalPrice} FCFA</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          cmd.status === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-[#fffbeb] text-[#e6c600]'
                        }`}>
                          {cmd.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {achats.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaShoppingBag className="text-[#e6c600]" /> Achats Directs
                </h2>
                <div className="grid gap-4">
                  {achats.map((achat) => (
                    <div key={achat._id} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        {achat.picture && (
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center shrink-0">
                            <img src={achat.picture} alt="Produit" className="max-h-full max-w-full object-contain mix-blend-multiply" />
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">
                            Le {new Date(achat.date).toLocaleDateString()}
                          </span>
                          <h3 className="font-bold text-gray-900 text-lg">{achat.userPref || 'Achat Direct'}</h3>
                          <p className="text-sm text-gray-500">Quantité : {achat.productQuantity}</p>
                        </div>
                      </div>
                      <div className="flex flex-col md:items-end gap-2">
                        <span className="text-xl font-black text-gray-900">{achat.totalPrice} FCFA</span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          achat.status === 'Payé' ? 'bg-green-100 text-green-700' : 'bg-[#fffbeb] text-[#e6c600]'
                        }`}>
                          {achat.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default ClientActivity;
