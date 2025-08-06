//import React, { useState } from "react";
import logo from '../images/logo.jpeg';
import expressing from '../images/header-img1.png'
import { useLocation, useNavigate } from "react-router-dom";
import styles from './header.module.css';

const Header = ()=>{
    const location = useLocation(); // <-- pour détecter l'URL active

    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate();
    const toHome = ()=>{
        navigate('/')
    };
    const toAbout = ()=>{
        navigate('/about')
    }
    const toServices = ()=>{
        navigate('/services')
    }
    const toAdminLogin = ()=>{
        window.open('dango-import.vercel.app/admin', '_blank')
    }
    return(
        <header>
            <div className={styles.container}>
                <div className={styles.headerNav}>
                    <div>
                        <div className={styles.logo}>
                            <img src={logo} alt="logo"/>
                            <h3 onClick={toAdminLogin}>Dango Import</h3>
                        </div>
                    </div>
                    <nav> 
                        <ul>                    
                            <li className={isActive("/") ? styles.active : ""} onClick={toHome}>Acceuil</li>
                            <li className={isActive("/services") ? styles.active : ""} onClick={toServices}>Service</li>
                            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
                            <button className={styles.pc} onClick={()=>alert("Ce service n'est pas encore disponible !")}>Acheter nos produits</button>
                        </ul>
                        
                    </nav>
                    
                </div>
                <div className={styles.mobile}>
                    <button onClick={()=>alert("Ce service n'est pas encore disponible !")}>Acheter nos produits</button>
                </div>
                <div className={styles.content}>
                    <div className={styles.headerIntro}>
                        <h2>Vos achats en chine, <br/>livrés en Afrique de l'Ouest</h2>
                        <h3>Importer depuis la Chine, <br/>on s'occupe du reste !</h3>
                    </div>
                    <img  src={expressing} alt="expressing"/>
                </div>
            </div>
        </header>
    )
}

export default Header;