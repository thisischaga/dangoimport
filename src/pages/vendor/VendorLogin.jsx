import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import API_BASE_URL from '../../apiConfig';
import { saveVendorSession } from '../../utils/vendorAuth';
import { Store } from 'lucide-react';

const VendorLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ userEmail: '', userPassword: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Connexion impossible');

      saveVendorSession({ token: data.token, user: data.user });
      toast.success('Connexion vendeur réussie');
      navigate(location.state?.from || '/vendeur/dashboard');
    } catch (err) {
      toast.error(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-12">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F68B1E] text-white">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-black text-[#0F172A]">Connexion vendeur</h1>
          <p className="mt-2 text-sm text-slate-600">Accédez à votre espace vendeur DANGOIMPORT</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Email</span>
            <input
              type="email"
              required
              value={form.userEmail}
              onChange={(e) => setForm({ ...form, userEmail: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#F68B1E]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold">Mot de passe</span>
            <input
              type="password"
              required
              value={form.userPassword}
              onChange={(e) => setForm({ ...form, userPassword: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-[#F68B1E]"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#F68B1E] py-3.5 text-sm font-bold text-white disabled:opacity-70"
          >
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
          Pas encore vendeur ?{' '}
          <Link to="/vendeur/register" className="font-semibold text-[#F68B1E]">Créer un compte</Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link to="/vendeur" className="text-slate-500 hover:text-[#0F172A]">← Retour</Link>
        </p>
      </div>
    </div>
  );
};

export default VendorLogin;
