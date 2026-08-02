import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const STEPS = [
  {
    n: '01',
    title: 'Décrivez',
    text: 'Dites-nous ce que vous cherchez',
  },
  {
    n: '02',
    title: 'On cherche',
    text: 'On contacte des fournisseurs vérifiés',
  },
  {
    n: '03',
    title: 'Vous recevez',
    text: 'Rapport complet avec prix et délais',
  },
];

const CtaButton = ({ className = '' }) => (
  <Link
    to="/sourcing/form"
    className={`inline-flex items-center justify-center rounded-xl bg-[#F68B1E] px-8 py-4 text-base font-bold text-white transition hover:bg-[#e07b12] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F68B1E] focus-visible:ring-offset-2 ${className}`}
  >
    Faire une demande de sourcing
  </Link>
);

const SourcingLanding = () => (
  <div className="min-h-screen bg-white text-[#0F172A]">
    <Header />

    <main>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-slate-100">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 20%, #F68B1E 0, transparent 40%), radial-gradient(circle at 80% 0%, #0F172A 0, transparent 35%)',
          }}
        />
        <div className="relative mx-auto flex min-h-[78vh] max-w-4xl flex-col items-start justify-center px-6 py-20 sm:px-8 lg:py-28">
          <p className="mb-6 text-sm font-semibold tracking-wide text-[#F68B1E]">
            Frais d&apos;étude: 5000F — Réponse en 48h
          </p>
          <h1 className="max-w-3xl text-4xl font-black leading-[1.1] tracking-tight text-[#0F172A] sm:text-5xl lg:text-6xl">
            On trouve vos produits à votre place
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
            Vous décrivez ce que vous voulez. Nous trouvons les meilleurs fournisseurs pour vous au Togo et Bénin.
          </p>
          <div className="mt-10">
            <CtaButton />
          </div>
        </div>
      </section>

      {/* COMMENT ÇA MARCHE */}
      <section className="bg-[#F8FAFC]">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:px-8 lg:py-24">
          <h2 className="text-center text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
            Comment ça marche
          </h2>
          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.n} className="text-center sm:text-left">
                <div className="text-sm font-bold tracking-widest text-[#F68B1E]">{step.n}</div>
                <h3 className="mt-3 text-xl font-bold text-[#0F172A]">{step.title}</h3>
                <p className="mt-2 text-slate-600 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* POURQUOI PAYER */}
      <section>
        <div className="mx-auto max-w-3xl px-6 py-20 sm:px-8 lg:py-24">
          <h2 className="text-3xl font-black tracking-tight text-[#0F172A] sm:text-4xl">
            Pourquoi payer 5000F
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            Ce frais couvre le temps de recherche, la négociation et la vérification des fournisseurs. Déduit de votre commande.
          </p>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="bg-[#0F172A]">
        <div className="mx-auto flex max-w-3xl flex-col items-center px-6 py-20 text-center sm:px-8 lg:py-24">
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Prêt à lancer votre recherche ?
          </h2>
          <p className="mt-3 max-w-lg text-slate-300">
            Remplissez le formulaire et payez 5000F pour démarrer l&apos;étude.
          </p>
          <div className="mt-8">
            <CtaButton />
          </div>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default SourcingLanding;
