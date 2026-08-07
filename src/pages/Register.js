import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../apiConfig';
import toast from '../utils/toast';
import { FaUser, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';
import logo from '../images/logo.jpeg';

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ userFirstname: '', userSurname: '', userEmail: '', userPassword: '', otp: '' });

  useEffect(() => {
    const id = 'roboto-font-register';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE_URL}/api/auth/send-otp`, { userEmail: formData.userEmail });
      toast.info('Un code de vérification a été envoyé à votre email.');
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de l\'email');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyAndSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/signup`, formData);
      localStorage.setItem('dangoToken', res.data.token);
      localStorage.setItem('dangoUser', JSON.stringify(res.data.user || {}));
      toast.success('Compte créé et vérifié avec succès ! Bienvenue.');
      window.dispatchEvent(new Event('authChange'));
      navigate('/shopping');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Code incorrect ou erreur serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F1F1F1] py-8 px-4 sm:px-6 lg:px-8" style={{ fontFamily: 'Roboto, system-ui, Arial' }}>
      <div className="w-full max-w-md">
        <div className="mb-4 bg-white rounded-t-2xl shadow-sm px-6 py-3 border border-b-0 border-gray-100">
          <div className="flex">
            <div onClick={() => navigate('/login')} className="flex-1 text-sm font-black py-3 text-center text-gray-500">CONNEXION</div>
            <div onClick={() => navigate('/register')} className="flex-1 text-sm font-black py-3 text-center">INSCRIPTION</div>
          </div>
          <div className="mt-1 h-0.5">
            <div className="w-1/2" style={{ marginLeft: '50%' }}>
              <div className="bg-[#F68B1E] h-1 rounded-full" />
            </div>
          </div>
        </div>

        <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-b-2xl shadow-xl border border-gray-100 my-auto">
          <div className="flex flex-col items-center">
            <img src={logo} alt="Dango Import" className="h-16 w-16 rounded-xl border border-gray-200 mb-6 cursor-pointer" onClick={() => navigate('/')} />
            <h2 className="text-center text-3xl font-black text-gray-900">{step === 1 ? 'Créer un compte' : 'Vérifiez votre email'}</h2>
            <p className="mt-2 text-center text-sm text-gray-600">{step === 1 ? 'Rejoignez Dango Import et commencez à importer.' : `Nous avons envoyé un code à ${formData.userEmail}`}</p>
          </div>

          {step === 1 ? (
            <form className="mt-8 space-y-6" onSubmit={handleSendOTP}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Prénom</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" placeholder="Prénom" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.userFirstname} onChange={(e) => setFormData({ ...formData, userFirstname: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Nom</label>
                    <div className="relative">
                      <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input required type="text" placeholder="Nom" className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.userSurname} onChange={(e) => setFormData({ ...formData, userSurname: e.target.value })} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Adresse Email</label>
                  <div className="relative">
                    <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="email" placeholder="votre@email.com" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.userEmail} onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">Mot de passe</label>
                  <div className="relative">
                    <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input required type="password" placeholder="••••••••" className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm" value={formData.userPassword} onChange={(e) => setFormData({ ...formData, userPassword: e.target.value })} />
                  </div>
                </div>
              </div>

              <button disabled={loading} type="submit" className="w-full py-3 px-4 text-sm font-bold rounded-xl bg-[#F68B1E] text-white">{loading ? 'ENVOI DU CODE...' : 'CONTINUER'}</button>
            </form>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyAndSignup}>
              <div className="space-y-4">
                <label className="block text-center text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4">Code à 6 chiffres</label>
                <div className="relative">
                  <FaShieldAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required type="text" maxLength={6} placeholder="000000" className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl text-center text-2xl font-black tracking-[0.5em]" value={formData.otp} onChange={(e) => setFormData({ ...formData, otp: e.target.value })} />
                </div>
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-xs font-bold text-[#F68B1E] uppercase tracking-widest">Modifier l'email</button>
              </div>
              <button disabled={loading} type="submit" className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl bg-[#F68B1E] text-white">{loading ? 'VÉRIFICATION...' : "VÉRIFIER ET S'INSCRIRE"}</button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">Vous avez déjà un compte ? <Link to="/login" className="font-bold text-[#F68B1E]">Se connecter</Link></div>
        </div>
      </div>
    </div>
  );
};

export default Register;
