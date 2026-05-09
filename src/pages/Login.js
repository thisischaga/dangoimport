import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt } from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      
      // Sauvegarde du token et de l'utilisateur
      localStorage.setItem('dangoToken', res.data.token);
      localStorage.setItem('dangoUser', JSON.stringify({ 
        email: res.data.user.userEmail,
        firstname: res.data.user.userFirstname,
        surname: res.data.user.userSurname
      }));
      
      toast.success('Connexion réussie !');
      
      // Déclencher un événement global pour que le Header se mette à jour
      window.dispatchEvent(new Event('authChange'));
      
      const origin = location.state?.from || '/shopping';
      navigate(origin);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-2xl shadow-xl border border-gray-100 my-auto">
        
        {/* En-tête */}
        <div className="flex flex-col items-center">
          <img src={logo} alt="Dango Import" className="h-16 w-16 rounded-xl border border-gray-200 mb-6 cursor-pointer" onClick={() => navigate('/')} />
          <h2 className="text-center text-3xl font-black text-gray-900">
            Bon retour
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Connectez-vous pour accéder à votre compte Dango Import
          </p>
        </div>

        {/* Formulaire */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
                Adresse Email
              </label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="email"
                  placeholder="votre@email.com"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-sm"
                  value={formData.userEmail}
                  onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Mot de passe
                </label>
                <a href="#" className="text-xs font-bold text-yellow-600 hover:text-yellow-500">
                  Mot de passe oublié ?
                </a>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  required
                  type="password"
                  placeholder="••••••••"
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:bg-white transition-all text-sm"
                  value={formData.userPassword}
                  onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                />
              </div>
            </div>

          </div>

          <div>
            <button
              disabled={loading}
              type="submit"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-all disabled:opacity-50 shadow-[0_4px_14px_rgba(247,201,72,0.4)]"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaSignInAlt className="h-5 w-5 text-yellow-600 group-hover:text-yellow-700" />
              </span>
              {loading ? 'CONNEXION...' : 'SE CONNECTER'}
            </button>
          </div>
        </form>

        {/* Inscription Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Nouveau sur Dango Import ?{' '}
          <Link to="/register" className="font-bold text-yellow-600 hover:text-yellow-500 hover:underline">
            Créer un compte
          </Link>
        </div>
        
      </div>
    </div>
  );
};

export default Login;
