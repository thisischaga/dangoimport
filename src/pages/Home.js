import React, { useState } from "react";
import Header from "../components/Header";
import styles from './home.module.css'
import home_img from '../images/home-img.jpg';
import whatsapp from '../images/whatsapp.jpg';
import devis from '../images/devis.jpg';
import validation from '../images/validation.png';
import livraisons from '../images/livraisons.png';
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";
import { useNavigate } from "react-router-dom";

const Home = ()=>{
    const navigate = useNavigate();
    const [isVisible, setIsvisible] = useState(false);
        
    const showForm = () => {
        setIsvisible(true);
    }
    const toEcom = ()=>{
        navigate('/shopping');
    }
    return(
        <div>
            <Header/>
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
                                et de la livraison. Rapide - Sécurisé - Transparant.
                            </h3>
                            <div className={styles.btns}>
                                <button className={isVisible? 'hidden': styles.devisBtn} onClick={showForm}>Demande de devis</button>
                                <button className= {isVisible? 'hidden': styles.forMobile} onClick={toEcom}>Acheter nos produits</button>
                            </div>
                            
                            <div className={!isVisible? 'hidden': ''}>
                                <DevisForm showForm={setIsvisible} />
                            </div>
                        </div>
                    </div>
                    <div className={styles.stepsIntro}>
                        <div>
                            <h3>Comment ça marche?</h3>
                            <p>
                                Chez Dango Import, nous avons simplifié l'importation depuis
                                la Chine en 4 étapes claires. Vous nous dites ce que vous chercher,
                                et nous nous occupons du reste.
                            </p>
                        </div>
                    </div>
                    <div className={styles.content}>
                        
                        <div className={styles.steps}>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>1- Vous nous contactez</h4>
                                    <p>
                                        Vous remplissez notre formulaire de devis 
                                        ou nous écrivez sur  <br/>WhatsApp et nous indiquez
                                        les produits que vous souhaitez <br/>commander 
                                        (quantité, type, lien si possible).
                                    </p>
                                </div>
                                <img src={whatsapp} alt="icone-whatsApp" className={styles.whatsapp} />
                            </div>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>2- On vous envoie un devis clair</h4>
                                    <p>
                                        Nous analysons votre demande et nous vous envoyons
                                        un devis <br/>personnalisé avec:
                                        <li>le coût du produit</li>
                                        <li>les frais de livraison</li>
                                        <li>les delais </li>
                                        <li>les options disponibles</li>
                                    </p>
                                </div>
                                <img src={devis} alt="icone-devis"/>
                            </div>
                        </div>
                        <div className={styles.steps}>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>3- Validation & commande</h4>
                                    <p>
                                        Si le devis vous convient, vous confirmer
                                        la commande. <br/>
                                        Nous effectuons l'achat pour vous, en lien direct
                                        avec le founisseur.
                                    </p>
                                </div>
                                <img src={validation} alt="icone-validation-form"/>
                            </div>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>4- Livraison chez vous</h4>
                                    <p>
                                        Nous suivons l'envoi jusqu'à la livraison au Bénin
                                        Togo ou Ghana. <br/>
                                        Vous êtes informés à chaque étape par e-mail
                                        ou WhatsApp
                                    </p>
                                </div>
                                <img src={livraisons} alt="icone-livraison-express"/>
                            </div>
                        </div>
                        <div>
                        <h3>Pourquoi choisir Dango Import ?</h3>
                        <p>Votre partenaire fiable pour vos achats en Chine, livrés en Afrique de l'Ouest.</p>
                    </div>
                    <div className={styles.flex}>
                
                        <div>
                            <h3>Etudes Newsletter</h3>
                            <ul>
                                <li>Accès prioritaire aux offres spéciales</li>
                                <li>Conseils d'experts sur l'achat en Chine</li>
                                <li>Communication claire et accompagnement personnalisé</li>
                                <li>Tendancs du marché asiatique</li>
                                <li>Suivi des delais & processus d'importation</li>
                                <li>Histoires de clients & témoignages inspirants</li>
                                <li>Guides pratiques & tutoriels</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Ce qui nous distingue</h3>
                            <ul>
                                <li>Livraison directe et sécurisée</li>
                                <li>Sourcing fiable de founisseurs</li>
                                <li>Communication claire et accompagnement <br/>personnalisé</li>
                                <li>Gains de temps et économies</li>
                                <li>Satisfaction garantie</li>
                            </ul>
                        </div>
                    </div>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    )
}

export default Home;