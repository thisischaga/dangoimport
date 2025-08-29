//import React, { useState } from "react";
import logo from '../images/logo.jpeg';
//import { useLocation, useNavigate } from "react-router-dom";
import styles from './Ecom.module.css';
import Footer from "../components/Footer";
import home_img from '../images/home-img.jpg';
import whatsapp from '../images/whatsapp.jpg';
import business from '../images/business.jpg';
import batimat from '../images/batimat.png';
import expressing from '../images/header-img1.png';
import une_personne from '../images/une-personne.png';

const Ecom = ()=>{

    
    return(
        <div>
            <header>
                <div className={styles.headerNav}>
                    <div >
                        <div className={styles.logo}>
                            <img src={logo} alt="logo"/>
                            <h3 >Dango Import</h3>
                        </div>
                    </div>
                    <div> 
                        <input className={styles.searchInput} name='searching' type='text' placeholder='Rechercher un produit...' />
                        <button className={styles.searchBtn}>Rechercher</button>          
                    </div>   
                              
                </div>
                <div className={styles.acceuil}>
                    <div className={styles.texts}>
                        <h1>Achetez les meilleurs produits <br/>de Dango Import</h1>
                        <h2>Nous avons les meilleurs produits adaptés à <br/>vos besoins, commandez vos produits à un prix abordable
                        </h2>
                    </div>
                    <img  src={expressing} alt="expressing"/>
                </div>  
            </header>
            <main>
                <div className={styles.items}>
                    <div >
                        <div className={styles.productContainer}>
                            <div className={styles.item}>
                                <img src={logo} alt="logo"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={home_img} alt="home_img"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={whatsapp} alt="whatsapp"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={une_personne} alt="une_personne"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={business} alt="business"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={batimat} alt="batimat"/>
                                <div>
                                    <p>addidas <span>1000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>  
            </main>
            <Footer/>
        </div>
    )
}

export default Ecom;