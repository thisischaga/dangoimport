import React, { useEffect, useState } from 'react';
import { FaGoogle, FaFacebookF } from 'react-icons/fa';

const TextInput = ({ label, type = 'text', value, onChange, placeholder }) => (
  <label className="block">
    <span className="text-sm font-medium text-[#374151]">{label}</span>
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="mt-2 w-full rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#F68B1E]"
    />
  </label>
);

export default function Auth() {
  const [tab, setTab] = useState('login');

  // Login fields
  const [loginId, setLoginId] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Register fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    const id = 'roboto-font';
    if (!document.getElementById(id)) {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  const onLogin = (e) => {
    e.preventDefault();
    // placeholder: handle login
    console.log('login', { loginId, loginPass });
  };

  const onRegister = (e) => {
    e.preventDefault();
    // placeholder: handle register
    console.log('register', { name, email, phone, password, confirm, accepted });
  };

  return (
    <div className="min-h-screen bg-[#F1F1F1] flex items-center justify-center px-4" style={{ fontFamily: 'Roboto, system-ui, Arial' }}>
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 pt-6">
            <div className="flex items-center justify-between">
              <div className="text-xl font-extrabold text-[#111827] flex items-center gap-2">
                <span>Dangoimport</span>
                <span className="w-2 h-2 rounded-full bg-[#F68B1E] inline-block" />
              </div>
            </div>

            <div className="mt-6 bg-transparent">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTab('login')}
                  className={`flex-1 text-sm font-bold py-3 text-center ${tab === 'login' ? 'text-[#111827]' : 'text-[#6b7280]'}`}
                >
                  CONNEXION
                </button>
                <button
                  onClick={() => setTab('register')}
                  className={`flex-1 text-sm font-bold py-3 text-center ${tab === 'register' ? 'text-[#111827]' : 'text-[#6b7280]'}`}
                >
                  INSCRIPTION
                </button>
              </div>
              <div className="mt-1 h-0.5 bg-transparent">
                <div className={`transition-all duration-200 ${tab === 'login' ? 'w-1/2 translate-x-0' : 'w-1/2 translate-x-full'}`} style={{ height: 3 }}>
                  <div className="bg-[#F68B1E] h-3 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 pb-8">
            {tab === 'login' ? (
              <form onSubmit={onLogin} className="space-y-4 mt-6">
                <TextInput label="Email / Téléphone" value={loginId} onChange={(e) => setLoginId(e.target.value)} placeholder="ex: you@example.com ou 69000000" />
                <TextInput label="Mot de passe" type="password" value={loginPass} onChange={(e) => setLoginPass(e.target.value)} placeholder="Entrez votre mot de passe" />

                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-[#6b7280] hover:text-[#111827]">Mot de passe oublié ?</button>
                </div>

                <button type="submit" className="w-full mt-2 bg-[#F68B1E] text-white font-bold py-3 rounded-2xl">SE CONNECTER</button>

                <div className="mt-3 flex items-center gap-3">
                  <hr className="flex-1 border-t border-gray-200" />
                  <span className="text-xs text-gray-400">ou</span>
                  <hr className="flex-1 border-t border-gray-200" />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button type="button" className="flex items-center justify-center gap-2 border rounded-2xl py-2 text-sm hover:shadow-sm">
                    <FaGoogle className="text-red-500" /> Continuer avec Google
                  </button>
                  <button type="button" className="flex items-center justify-center gap-2 border rounded-2xl py-2 text-sm hover:shadow-sm">
                    <FaFacebookF className="text-blue-600" /> Continuer avec Facebook
                  </button>
                </div>

                <div className="text-center text-sm text-[#6b7280] mt-4">
                  Nouveau ? <button type="button" onClick={() => setTab('register')} className="text-[#F68B1E] font-semibold">Créer un compte</button>
                </div>
              </form>
            ) : (
              <form onSubmit={onRegister} className="space-y-4 mt-6">
                <TextInput label="Nom complet" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ton nom complet" />
                <TextInput label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
                <TextInput label="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="69000000" />
                <TextInput label="Mot de passe" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mot de passe" />
                <TextInput label="Confirmer le mot de passe" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirmer mot de passe" />

                <label className="flex items-start gap-3 text-sm">
                  <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1" />
                  <span>J'accepte les <button type="button" className="text-[#F68B1E]">CGU</button> et la politique de confidentialité.</span>
                </label>

                <button type="submit" className="w-full mt-2 bg-[#F68B1E] text-white font-bold py-3 rounded-2xl">CRÉER MON COMPTE</button>

                <div className="text-center text-sm text-[#6b7280] mt-2">
                  Déjà un compte ? <button type="button" onClick={() => setTab('login')} className="text-[#F68B1E] font-semibold">Se connecter</button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
