import React, { useState } from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import { useNavigate } from "react-router-dom";
import whatsapp from '../images/whatsapp.jpg';
import devis from '../images/devis.jpg';
import validation from '../images/validation.png';
import livraisons from '../images/livraisons.png';
import styles from './home.module.css';

const Home = () => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);
    
    const steps = [
        {
            id: 1,
            title: "Vous nous contactez",
            description: "Remplissez notre formulaire de devis ou écrivez-nous sur WhatsApp avec les détails des produits souhaités (quantité, type, lien si possible).",
            image: whatsapp,
            alt: "Contact WhatsApp"
        },
        {
            id: 2,
            title: "On vous envoie un devis clair",
            description: "Nous analysons votre demande et vous envoyons un devis personnalisé incluant:",
            features: [
                "Le coût du produit",
                "Les frais de livraison",
                "Les délais",
                "Les options disponibles"
            ],
            image: devis,
            alt: "Devis personnalisé"
        },
        {
            id: 3,
            title: "Validation & commande",
            description: "Si le devis vous convient, vous confirmez la commande. Nous effectuons l'achat pour vous, en lien direct avec le fournisseur.",
            image: validation,
            alt: "Validation commande"
        },
        {
            id: 4,
            title: "Livraison chez vous",
            description: "Nous suivons l'envoi jusqu'à la livraison au Bénin, Togo ou Ghana. Vous êtes informés à chaque étape par e-mail ou WhatsApp.",
            image: livraisons,
            alt: "Livraison express"
        }
    ];

    const advantages = [
        "Livraison directe et sécurisée",
        "Sourcing fiable de fournisseurs",
        "Communication claire et accompagnement personnalisé",
        "Gains de temps et économies",
        "Satisfaction garantie"
    ];

    const newsletterBenefits = [
        "Accès prioritaire aux offres spéciales",
        "Conseils d'experts sur l'achat en Chine",
        "Communication claire et accompagnement personnalisé",
        "Tendances du marché asiatique",
        "Suivi des délais & processus d'importation",
        "Histoires de clients & témoignages inspirants",
        "Guides pratiques & tutoriels"
    ];

    const handleShowForm = () => setIsVisible(true);
    const handleNavigateShop = () => navigate('/shopping');

    return (
        <div>
            <Header />
            
            <main>
                <div>
                    <div className={styles.intro}>
                        <div>
                            <h2>
                                Nous sommes une agence spécialisée dans l'import de tous
                                types de produits depuis la Chine.
                            </h2>
                            <h3>
                                Nous nous occupons de la recherche, du devis, de la commande
                                et de la livraison. Rapide - Sécurisé - Transparent.
                            </h3>
                            <div className={styles.btns}>
                                <button 
                                    className={isVisible ? 'hidden' : styles.devisBtn} 
                                    onClick={handleShowForm}
                                >
                                    Demande de devis
                                </button>
                                <button 
                                    className={isVisible ? 'hidden' : styles.forMobile} 
                                    onClick={handleNavigateShop}
                                >
                                    Acheter nos produits
                                </button>
                            </div>
                            
                            <div className={!isVisible ? 'hidden' : ''}>
                                <DevisForm showForm={setIsVisible} />
                            </div>
                        </div>
                    </div>

                    <div className={styles.stepsIntro}>
                        <div>
                            <h3>Comment ça marche?</h3>
                            <p>
                                Chez Dango Import, nous avons simplifié l'importation depuis
                                la Chine en 4 étapes claires. Vous nous dites ce que vous cherchez,
                                et nous nous occupons du reste.
                            </p>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.steps}>
                            {steps.slice(0, 2).map((step) => (
                                <div key={step.id} className={styles.stepsContainer}>
                                    <div>
                                        <h4>{step.id}. {step.title}</h4>
                                        <p>{step.description}</p>
                                        {step.features && (
                                            <ul>
                                                {step.features.map((feature, index) => (
                                                    <li key={index}>{feature}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                    <img 
                                        src={step.image} 
                                        alt={step.alt}
                                        className={step.id === 1 ? styles.whatsapp : ''}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className={styles.steps}>
                            {steps.slice(2, 4).map((step) => (
                                <div key={step.id} className={styles.stepsContainer}>
                                    <div>
                                        <h4>{step.id}. {step.title}</h4>
                                        <p>{step.description}</p>
                                    </div>
                                    <img src={step.image} alt={step.alt} width="100%" height="100%"/>
                                </div>
                            ))}
                        </div>

                        <div className={styles.finalTexts}>
                            <h3>Pourquoi choisir Dango Import ?</h3>
                            <p>Votre partenaire fiable pour vos achats en Chine, livrés en Afrique de l'Ouest.</p>
                        </div>

                        <div className={styles.flex}>
                            <div>
                                <h3>Études Newsletter</h3>
                                <ul>
                                    {newsletterBenefits.map((benefit, index) => (
                                        <li key={index}>{benefit}</li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3>Ce qui nous distingue</h3>
                                <ul>
                                    {advantages.map((advantage, index) => (
                                        <li key={index}>{advantage}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            
            <Footer />
        </div>
    );
}

export default Home;