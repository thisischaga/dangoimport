import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from '../../utils/toast';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import API_BASE_URL from '../../apiConfig';
import { getVendorToken, isVendor, saveVendorSession, vendorAuthHeaders } from '../../utils/vendorAuth';
import { CheckCircle, Store, TrendingUp, Users } from 'lucide-react';

const WHY = [
  { icon: Users, title: 'Large audience', text: 'Clients actifs au Togo et au Bénin' },
  { icon: TrendingUp, title: 'Croissance rapide', text: 'Mettez vos produits en ligne en quelques minutes' },
  { icon: CheckCircle, title: '0F de commission', text: 'Gardez 100% de vos marges sur vos ventes' },
];

const STEPS = [
  { n: '1', title: 'Créez votre compte', text: 'Inscription vendeur en 2 minutes' },
  { n: '2', title: 'Ajoutez vos produits', text: 'Photos, prix, stock et catégorie' },
  { n: '3', title: 'Vendez', text: 'Recevez vos commandes et livrez vos clients' },
];

const VendorLanding = () => {
  const navigate = useNavigate();
  const loggedIn = Boolean(getVendorToken());

  const handleBecomeVendor = async () => {
    if (!loggedIn) {
      navigate('/vendeur/register');
      return;
    }

    if (isVendor()) {
      navigate('/vendeur/dashboard');
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/vendor/become-vendor`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...vendorAuthHeaders() },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || 'Activation impossible');

      saveVendorSession({ token: data.token, user: data.user });
      toast.success('Bienvenue dans l’espace vendeur !');
      navigate('/vendeur/dashboard');
    } catch (err) {
      toast.error(err.message || 'Erreur');
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0F172A]">
      <Header />

      <section className="border-b border-slate-100 bg-[#0F172A] text-white">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-[#F68B1E]">Programme vendeur</p>
          <h1 className="text-4xl font-black leading-tight sm:text-5xl">
            Vendez vos produits sur DANGOIMPORT
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-300">
            Rejoignez des milliers de vendeurs et touchez des clients au Togo et Bénin
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleBecomeVendor}
              className="rounded-xl bg-[#F68B1E] px-8 py-4 text-base font-bold text-white transition hover:bg-[#e07b12]"
            >
              {loggedIn && !isVendor() ? 'Devenir vendeur maintenant' : 'Créer un compte vendeur'}
            </button>
            <Link
              to="/vendeur/login"
              className="rounded-xl border border-white/20 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10"
            >
              Se connecter
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-center text-3xl font-black">Pourquoi nous choisir</h2>
          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {WHY.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#FFF3EA] text-[#F68B1E]">
                  <Icon size={22} />
                </div>
                <h3 className="font-bold">{title}</h3>
                <p className="mt-2 text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-4xl px-6">
          <h2 className="text-center text-3xl font-black">Comment ça marche</h2>
          <div className="mt-12 space-y-4">
            {STEPS.map((step) => (
              <div key={step.n} className="flex gap-4 rounded-2xl border border-slate-200 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F172A] text-sm font-bold text-white">
                  {step.n}
                </div>
                <div>
                  <h3 className="font-bold">{step.title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#FFF3EA] py-16">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <Store className="mx-auto mb-4 text-[#F68B1E]" size={36} />
          <h2 className="text-2xl font-black sm:text-3xl">Frais 0F de commission</h2>
          <p className="mt-3 text-slate-600">
            Aucune commission prélevée sur vos ventes. Vous fixez vos prix, vous gardez vos revenus.
          </p>
          <button
            type="button"
            onClick={handleBecomeVendor}
            className="mt-8 rounded-xl bg-[#F68B1E] px-8 py-3.5 text-sm font-bold text-white hover:bg-[#e07b12]"
          >
            Lancer ma boutique
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VendorLanding;
