import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTools, FaHome, FaGlobe, FaEnvelope, FaSpinner, FaArrowLeft } from 'react-icons/fa';
import logo from '../images/logo.jpeg';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';

const Maintenance = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/newsletter/subscribe`, { email });
      toast.success("Parfait ! Vous serez prévenu dès la réouverture.");
      setEmail('');
    } catch (error) {
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ fontFamily: "'Outfit', sans-serif" }}>
      
      {/* Effets de lumière en arrière-plan */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[6000ms]"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse duration-[8000ms]"></div>

      {/* Bouton retour accueil flottant en haut à gauche */}
      <button 
        onClick={() => navigate('/')} 
        className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white bg-slate-900/60 hover:bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 backdrop-blur-sm shadow-lg group"
      >
        <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
        Retour au site
      </button>

      <div className="w-full max-w-xl z-10">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group cursor-pointer mb-3" onClick={() => navigate('/')}>
            <div className="absolute -inset-1.5 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
            <img 
              src={logo} 
              alt="Dango Import" 
              className="relative h-16 w-16 rounded-2xl border border-slate-800 object-cover shadow-xl"
            />
          </div>
          <h2 className="text-xl font-bold tracking-wider text-slate-300 uppercase">Dango Import</h2>
        </div>

        {/* Card principale */}
        <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/80 rounded-3xl p-8 md:p-10 shadow-2xl relative overflow-hidden">
          
          {/* Badge Maintenance */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {/* Cercle d'effet de vague pulsante */}
              <span className="absolute inline-flex h-16 w-16 rounded-full bg-yellow-400/20 animate-ping opacity-75"></span>
              <div className="relative w-16 h-16 bg-gradient-to-tr from-yellow-400 to-amber-500 text-slate-950 rounded-full flex items-center justify-center text-2xl shadow-lg shadow-yellow-500/20">
                <FaTools className="animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-black text-center mb-4 tracking-tight leading-tight">
            Espace Marketplace en <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-400">Maintenance</span>
          </h1>

          <p className="text-slate-300 text-center text-base leading-relaxed mb-8">
            Nous effectuons actuellement des améliorations techniques pour optimiser notre plateforme d'achat et vente locale. 
            <span className="block mt-2 text-slate-400 text-sm">
              Le service de Sourcing Chine ainsi que la soumission de devis restent opérationnels.
            </span>
          </p>

          {/* Formulaire d'inscription newsletter */}
          <div className="border-t border-slate-800/80 pt-8 mb-8">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest text-center mb-4 flex items-center justify-center gap-2">
              <FaEnvelope className="text-yellow-400" /> Être averti de la réouverture
            </h3>
            
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
              <input
                required
                type="email"
                placeholder="Votre adresse e-mail"
                className="flex-1 px-4 py-3 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400 transition-all duration-300 text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                disabled={loading}
                type="submit"
                className="bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-slate-950 px-6 py-3 rounded-xl font-bold text-sm tracking-wide transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-yellow-500/10 hover:shadow-yellow-500/20 whitespace-nowrap"
              >
                {loading ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  "M'abonner"
                )}
              </button>
            </form>
          </div>

          {/* Actions alternatives */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => navigate('/')}
              className="bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 text-slate-200 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm"
            >
              <FaHome className="text-slate-400" />
              Retour à l'accueil
            </button>
            <button
              onClick={() => navigate('/', { state: { openSourcing: true } })}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:text-white"
            >
              <FaGlobe className="text-yellow-400 animate-pulse" />
              Sourcing Chine / Devis
            </button>
          </div>

        </div>

        {/* Footer de la page */}
        <p className="text-center text-xs text-slate-500 mt-8">
          &copy; {new Date().getFullYear()} Dango Import. Tous droits réservés.
        </p>

      </div>
    </div>
  );
};

export default Maintenance;
