import React, { useEffect } from "react";
import logo from '../images/logo.jpeg';
import Slider from "react-slick";
import styles from './Ecom.module.css';
import Footer from "../components/Footer";
import product1 from '../images/product1.jpg';
import product2 from '../images/product2.jpg';
import slide1 from '../images/product1.jpg';
import slide2 from '../images/product2.jpg';
import slide3 from '../images/slide3.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";


const Ecom = ()=>{
    const slides = [slide1, slide2, slide3];
    
    const settings = {
        dots: true,
        infinite: true,
        speed: 600,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 3800,
        arrows: true,
        adaptiveHeight: true,
    };
    
    useEffect(() => {
        const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
        return () => clearTimeout(t);
    }, []);
    
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
                    <div className={styles.form}> 
                        <input className={styles.searchInput} name='searching' type='text' placeholder='Rechercher un produit...' />
                        <button className={styles.searchBtn}>Rechercher</button>          
                    </div>   
                              
                </div>
                <div className={styles.acceuil}>
                    <div className={styles.texts}>
                        <h1>Achetez les meilleurs produits de Dango Import</h1>
                        <h2>Nous avons les meilleurs produits adaptés à vos besoins, commandez vos produits à un prix abordable
                        </h2>
                    </div>
                    <div className={styles.sliderContainer}>
                        <Slider {...settings} className={styles.slider}>
                          {slides.map((s, i) => (
                            <div key={i} className={styles.slideItem}>
                              {/* style inline minimal pour garantir affichage si CSS module a conflit */}                                      <img
                                src={s}
                                alt={`slide-${i + 1}`}
                                className={styles.slideImage}
                                style={{ display: "block" }}
                                />
                            </div>
                          ))}
                        </Slider>
                    </div>
                </div>  
            </header>
            <main>
                <div className={styles.items}>
                    <div >
                        <div className={styles.productContainer}>
                            <div className={styles.item}>
                                <img src={product1} alt="product1"/>
                                <div>
                                    <p>Gaecrolft <span>12000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={product2} alt="product2"/>
                                <div>
                                    <p>Gaecrolft <span>12000 fcfa</span></p>
                                    <p><button>Acheter</button></p>
                                </div>
                            </div>
                            <div className={styles.item}>
                                <img src={slide3} alt="product3"/>
                                <div>
                                    <p>Gaecrolft <span>12000 fcfa</span></p>
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