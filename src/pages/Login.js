import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ userEmail: '', userPassword: '' });

  useEffect(() => {
    const id = 'roboto-font-login';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      localStorage.setItem('dangoToken', res.data.token);
      localStorage.setItem('dangoUser', JSON.stringify(res.data.user || {}));
      toast.success('Connexion réussie !');
      window.dispatchEvent(new Event('authChange'));
      const origin = location.state?.from || '/shopping';
      navigate(origin);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F1F1]" style={{ fontFamily: 'Roboto, system-ui, Arial' }}>
      <div className="w-full bg-white py-4 px-6 sm:px-10 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => navigate('/')}>
          <img src={logo} alt="Dango Import" className="h-9 w-9 rounded-lg object-cover" />
          <div>
            <p className="text-[18px] font-black text-gray-900 leading-none">DANGO</p>
            <p className="text-[9px] font-black text-[#F68B1E] tracking-[0.25em]">IMPORT</p>
          </div>
        </div>
        <div className="text-sm text-gray-500">
          Nouveau ?{' '}
          <Link to="/register" className="font-bold text-gray-900 hover:text-[#F68B1E]">S'inscrire</Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[420px]">
          <div className="mb-4 bg-white rounded-t-2xl shadow-sm px-6 py-3 border border-b-0 border-gray-100">
            <div className="flex">
              <div className="flex-1 text-sm font-black text-center">CONNEXION</div>
              <div className="flex-1 text-sm font-black text-center text-gray-500">INSCRIPTION</div>
            </div>
            <div className="mt-1 h-0.5">
              <div className="w-1/2">
                <div className="bg-[#F68B1E] h-1 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-b-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-8 sm:p-10">
              <h1 className="text-2xl font-black text-gray-900 text-center mb-1">Connexion</h1>
              <p className="text-sm text-gray-500 text-center mb-8">Accédez à votre espace Dango Import</p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Adresse Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type="email"
                      placeholder="votre@email.com"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pl-11 focus:outline-none"
                      value={formData.userEmail}
                      onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest">Mot de passe</label>
                    <button type="button" className="text-xs font-bold text-gray-500">Oublié ?</button>
                  </div>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      required
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3.5 pl-11 pr-11 focus:outline-none"
                      value={formData.userPassword}
                      onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  disabled={loading}
                  type="submit"
                  className="w-full bg-[#F68B1E] text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 mt-2"
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

            <div className="bg-gray-50 p-4 border-t border-gray-100 text-center">
              <p className="text-[12px] text-gray-500">En vous connectant, vous acceptez nos <Link to="/cgu" className="underline">CGU</Link> et notre <Link to="/politique-de-confidentialité" className="underline">Politique de confidentialité</Link>.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
