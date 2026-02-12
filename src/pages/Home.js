import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import styles from './home.module.css';
import livraisons from "../images/livraisons.png";
import validation from "../images/validation.png";
import devis from "../images/devis.jpg";
import whatsapp from "../images/whatsapp.jpg";

// 1. Données extraites pour la performance (évite la recréation au render)
const STEPS = [
  {
    id: 1,
    title: "Vous nous contactez",
    desc: "Remplissez notre formulaire ou écrivez-nous sur WhatsApp avec vos liens produits.",
    color: "#25D366",
    image: whatsapp,
    icon: <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  },
  {
    id: 2,
    title: "On vous envoie un devis",
    desc: "Prix du produit, frais de port et douane inclus. Pas de surprise.",
    color: "#3b82f6",
    image: devis,
    features: ["Coût produit", "Frais logistiques", "Délais"],
    icon: <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  },
  {
    id: 3,
    title: "Validation & Achat",
    desc: "Après paiement, nous commandons immédiatement auprès des fournisseurs chinois.",
    color: "#10b981",
    image: validation,
    icon: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
  {
    id: 4,
    title: "Livraison sécurisée",
    desc: "Réceptionnez vos colis au Bénin, Togo ou Ghana avec un suivi en temps réel.",
    color: "#f59e0b",
    image: livraisons,
    icon: <path d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  // Scroll fluide vers le formulaire quand on l'active
  const toggleForm = () => {
    setShowForm(!showForm);
    if (!showForm) {
      setTimeout(() => {
        window.scrollTo({ top: 100, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div className={styles.pageWrapper}>
      <Header setShowForm={setShowForm}/>

    <main>
        {/* HERO / CTA SECTION */}
        <div>
            <section className={styles.ctaSection}>
                <div className={styles.container}>
                    <div className={styles.ctaContent}>
                    <div className={styles.ctaText}>
                        <span className={styles.badge}>Dango Import Business</span>
                        <h2>Importez de Chine sans stress.</h2>
                        <p>Nous gérons tout : du sourcing à la livraison finale dans vos entrepôts.</p>
                    </div>
                    <div className={styles.ctaButtons}>
                        <button className={styles.primaryBtn} onClick={toggleForm}>
                        {showForm ? "Fermer le formulaire" : "Demander un devis gratuit"}
                        </button>
                        <button className={styles.secondaryBtn} onClick={() => navigate('/shopping')}>
                        Catalogue produits
                        </button>
                    </div>
                    </div>
                </div>
                </section>

                {/* FORM SECTION */}
                {showForm && (
                <section className={styles.formSection}>
                    <div className={styles.container}>
                    <DevisForm showForm={setShowForm} />
                    </div>
                </section>
                )}

                {/* HOW IT WORKS SECTION */}
                
                <section className={styles.stepsSection}>
                    <div className={styles.container}>
                        <div className={styles.sectionHeader}>
                        <h2>Comment ça marche ?</h2>
                        <p>Une logistique simplifiée pour booster votre commerce.</p>
                        </div>

                        <div className={styles.stepsGrid}>
                        {STEPS.map((step) => (
                            <div key={step.id} className={styles.stepCard}>
                            <div className={styles.stepNumber} style={{ background: step.color }}>{step.id}</div>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={step.color} strokeWidth="2">
                                {step.icon}
                            </svg>
                            <h3>{step.title}</h3>
                            <p>{step.desc}</p>
                            {step.features && (
                                <ul style={{ listStyle: 'none', padding: 0, fontSize: '14px', color: '#b8c5d6' }}>
                                {step.features.map(f => <li key={f}>✓ {f}</li>)}
                                </ul>
                            )}
                            <div className={styles.stepImage}>
                                <img src={step.image} alt={step.title} loading="lazy" />
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </section>
        </div>
    </main>

    <Footer />
    </div>
  );
};

export default Home;