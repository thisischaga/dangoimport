import React, { useEffect, useState } from "react";
import logo from '../images/logo.jpeg';
import slide1 from '../images/slide1.jpg';
import slide2 from '../images/slide2.jpg';
import slide3 from '../images/slide3.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import styles from './header.module.css';
import expressing from '../images/header-img1.png';

const Header = ()=>{
    const location = useLocation();

    const isActive = (path) => location.pathname === path;
    const navigate = useNavigate();

    /*const [isSlideOne, setIsSlideOne] = useState(true);
    const [isSlideTwo, setIsSlideTwo] = useState(false);
    const [isSlideThree, setIsSlideThree] = useState(false);
*/
    const toHome = ()=>{
        navigate('/')
    };
    const toAbout = ()=>{
        navigate('/about')
    }
    const toServices = ()=>{
        navigate('/services')
    }
    const toBlog = ()=>{
        navigate('/blog/articles')
    }
    /*const toEcom = ()=>{
        navigate('/shopping')
    }*/
    const toAdminLogin = ()=>{
        window.open('https://www.dangoimport.com/admin', '_blank')
    }

    /*const showSlide2 = ()=>{
        //setIsSlideOne(!isSlideOne);
        setTimeout(()=>{
            setIsSlideTwo(!isSlideTwo);
        }, 4000);
        //setIsSlideThree(!isSlideThree);
    }
    const showSlide3 = ()=>{
        //setIsSlideOne(!isSlideOne);
        //setIsSlideTwo(!isSlideTwo);
        setTimeout(()=>{
            setIsSlideThree(!isSlideThree);
        }, 8000);
    }
    
    showSlide1();
    showSlide2();
    showSlide3();
    useEffect(() => {
        if (isSlideOne === true) {
            setTimeout(()=>{
                setIsSlideOne(!isSlideOne);
            }, 4000);
            setIsSlideTwo(false);
            setIsSlideThree(false);
        }
        if (isSlideTwo === false) {
            setTimeout(()=>{
                setIsSlideTwo(!isSlideTwo);
            }, 4000);
            setIsSlideOne(false);
            setIsSlideThree(false);
        }
    }, [])*/

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
                            <li className={isActive("/blog/articles") ? styles.active : ""} onClick={toBlog}>Articles</li>
                            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
                            <button className={styles.pc}>Acheter nos produits</button>
                        </ul>
                        
                    </nav>
                    
                </div>
                <div className={styles.mobile}>
                    <button className={styles.mobile} onClick={()=>alert("Ce service n'est pas encore disponible !")}>Acheter nos produits</button>
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