import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    userEmail: '',
    userPassword: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      
      localStorage.setItem('dangoToken', res.data.token);
      localStorage.setItem('dangoUser', JSON.stringify({ 
        email: res.data.user.userEmail,
        firstname: res.data.user.userFirstname,
        surname: res.data.user.userSurname,
        isVendor: res.data.user.isVendor || false,
        vendorName: res.data.user.vendorName || '',
        balance: res.data.user.balance || 0,
        bankDetails: res.data.user.bankDetails || {}
      }));
      
      toast.success('Connexion réussie !');
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
    <div className="min-h-screen flex flex-col bg-[#f5f5f5] dark:bg-[#0f1115]">
      {/* Simple Header */}
      <div className="w-full bg-white dark:bg-[#1a1d24] py-4 px-6 sm:px-10 shadow-sm flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Dango Import" className="h-9 w-9 rounded-lg border border-[#ffdc2b]/30 object-cover" />
          <div>
            <p className="text-[18px] font-black text-gray-900 dark:text-white leading-none">DANGO</p>
            <p className="text-[9px] font-black text-[#e6c600] tracking-[0.25em]">IMPORT</p>
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Nouveau ?{' '}
          <Link to="/register" className="font-bold text-gray-900 dark:text-white hover:text-[#ffdc2b] dark:hover:text-[#ffdc2b] transition-colors">
            S'inscrire
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px] bg-white dark:bg-[#1a1d24] rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          
          <div className="p-8 sm:p-10">
            <h1 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-1">Connexion</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-8">
              Accédez à votre espace Dango Import
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div>
                <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5">
                  Adresse Email
                </label>
                <div className="relative group">
                  <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e6c600] transition-colors text-sm" />
                  <input
                    required
                    type="email"
                    placeholder="votre@email.com"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-[15px] rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:border-[#ffdc2b] focus:ring-2 focus:ring-[#ffdc2b]/20 transition-all placeholder:text-gray-400"
                    value={formData.userEmail}
                    onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Mot de passe
                  </label>
                  <button type="button" className="text-xs font-bold text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors">
                    Oublié ?
                  </button>
                </div>
                <div className="relative group">
                  <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#e6c600] transition-colors text-sm" />
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-[15px] rounded-xl px-4 py-3.5 pl-11 pr-11 focus:outline-none focus:border-[#ffdc2b] focus:ring-2 focus:ring-[#ffdc2b]/20 transition-all placeholder:text-gray-400"
                    value={formData.userPassword}
                    onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-[#ffdc2b] hover:bg-[#e6c600] text-[#111] font-black py-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg text-[15px] flex items-center justify-center gap-2 mt-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[#111]/30 border-t-[#111] rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <FaSignInAlt size={14} />
                    Se connecter
                  </>
                )}
              </button>
            </form>

            
            
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <p className="text-[12px] text-gray-500">
              En vous connectant, vous acceptez nos <Link to="/cgu" className="underline hover:text-gray-900 dark:hover:text-white">CGU</Link> et notre <Link to="/politique-de-confidentialité" className="underline hover:text-gray-900 dark:hover:text-white">Politique de confidentialité</Link>.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Login;
