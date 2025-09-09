import React, { useEffect, useState } from "react";
import logo from '../images/logo.jpeg';
import Slider from "react-slick";
import styles from './Ecom.module.css';
import Footer from "../components/Footer";
import product1 from '../images/product1.png';
import product2 from '../images/product2.png';
import product3 from '../images/product3.png';
import slide1 from '../images/product1.jpg';
import slide2 from '../images/product2.jpg';
import slide3 from '../images/slide3.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BuyProduct from "./BuyProduct";


const Ecom = ()=>{
    const slides = [slide1, slide2, slide3];
    const [productDetailImg, setProductDetailImg] = useState('');
    const [productDetailPrice, setProductDetailPrice] = useState('');
    const [productDetailName, setProductDetailName] = useState('');
    const [productDescription, setProductDescription] = useState('');

    const [achat, setAchat] = useState(false);

    const [products, setProducts] = useState([]);

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
    fetch('https://dangoimport-server.onrender.com/api/products')
        .then(res => res.json())
        .then(data => setProducts(data))
        .catch(err => console.error(err));
    }, []);
    
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
                    {/* 
                    <div className={styles.form}> 
                        <input className={styles.searchInput} name='searching' type='text' placeholder='Rechercher un produit...' />
                        <button className={styles.searchBtn}>Rechercher</button>          
                    </div>   
                    */}
                              
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
                {!achat && 
                <div className={styles.items}>
                    <div >
                        <div className={styles.productContainer}>
                            {products.map(item=>
                                (
                                    <div className={styles.item} key={item.id}>
                                        <img src={item.productImg} alt="productImg"/>
                                        <div>
                                            <p>{item.name} <span>{item.price} fcfa</span></p>
                                            <p><button 
                                                onClick={()=>{
                                                    setAchat(true);
                                                    setProductDetailImg(item.productImg);
                                                    setProductDetailPrice(item.price);
                                                    setProductDetailName(item.name);
                                                    setProductDescription(item.description)
                                                }
                                                    
                                            }>Acheter</button></p>
                                        </div>
                                    </div>
                                )
                            )}
                            
                        </div>
                    </div>
                </div>  
                }
                {achat && <BuyProduct image={productDetailImg} 
                    name={productDetailName} price={productDetailPrice}
                    description={productDescription}
                />}
            </main>
            <Footer/>
        </div>
    )
}

export default Ecom;