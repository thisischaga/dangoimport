import React, { useState } from "react";
import Header from "../components/Header";
import styles from './home.module.css'
import home_img from '../images/home-img.jpg';
import whatsapp from '../images/whatsapp.jpg';
import devis from '../images/devis.jpg';
import validate from '../images/validate.jpg';
import livraison from '../images/livraison.jpg';
import Footer from "../components/Footer";
import DevisForm from "../components/DevisForm";

const Home = ()=>{
    const [isVisible, setIsvisible] = useState(false);
        
    const showForm = () => {
        setIsvisible(true);
    }
    
    return(
        <div>
            <Header/>
            <main>
                <div>
                    <div className={styles.intro}>
                        <h2>
                            Nous sommes une agence spécialisée dans l'import de tous<br/>
                            types de produits depuis la Chine.
                        </h2>
                        <h3>
                            Nous nous occupons de la recherche, du devis, de la commande
                            et de la livraison.<br/> Rapide - Sécurisé - Transparant.
                        </h3>
                        <button className={isVisible? 'hidden': styles.devisBtn} onClick={showForm}>Demande de devis</button>
                        
                        <div className={!isVisible? 'hidden': ''}>
                            <DevisForm showForm={setIsvisible} />
                        </div>
                    </div>
                    <div className={styles.flex}>
                        <img src={home_img} alt="colis"/>
                    </div>
                    <div className={styles.stepsIntro}>
                        <h3>Comment ça marche?</h3>
                        <p>
                            Chez Dango Import, nous avons simplifié l'importation depuis
                            la Chine en 4 étapes claires. Vous nous dites ce que <br/>vous chercher,
                            et nous nous occupons du reste.
                        </p>
                    </div>
                    <div className={styles.content}>
                        
                        <div className={styles.steps}>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>1- Vous nous contactez</h4>
                                    <p>
                                        Vous remplissez notre formulaire de devis <br/>
                                        ou nous écrivez sur WhatsApp et nous <br/>indiquez
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
                                        un devis personnalisé avec:<br/>
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
                                        Si le devis vous convient, vous confirmer<br/>
                                        la commande. <br/>
                                        Nous effectuons l'achat pour vous, en lien <br/>direct
                                        avec le founisseur.
                                    </p>
                                </div>
                                <img src={validate} alt="icone-validation-form"/>
                            </div>
                            <div className={styles.stepsContainer}>
                                <div>
                                    <h4>4- Livraison chez vous</h4>
                                    <p>
                                        Nous suivons l'envoi jusqu'à la livraison<br/> au Bénin
                                        Togo ou Ghana. <br/>
                                        Vous êtes informés à chaque étape par e-mail<br/>
                                        ou WhatsApp
                                    </p>
                                </div>
                                <img src={livraison} alt="icone-livraison-express"/>
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