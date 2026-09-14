import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Home } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function VerificationSuccess() {
  const [searchParams] = useSearchParams();

  const isVerified = searchParams.get('verified') === '1';
  const errorMessage = searchParams.get('error');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between font-sans">
      <Header />

      <main className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center">
          {isVerified ? (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-50">
                <CheckCircle2 size={48} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                Email vérifié avec succès !
              </h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Votre adresse email a été confirmée. Vous pouvez désormais profiter pleinement de votre compte Dango Import.
              </p>

              <Link
                to="/"
                className="w-full py-3.5 px-6 bg-[#FF6B00] hover:bg-[#E85F00] text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={18} />
                <span>Retourner à l'accueil</span>
              </Link>
            </div>
          ) : (
            <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50">
                <AlertCircle size={48} />
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">
                Lien invalide ou expiré
              </h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                {errorMessage || "Le lien de vérification sur lequel vous avez cliqué n'est plus valide ou a expiré."}
              </p>

              <Link
                to="/"
                className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Home size={18} />
                <span>Retourner à l'accueil</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
