import React, { useEffect, useState } from "react";
import logo from '../images/logo.jpeg';
import Slider from "react-slick";
import styles from './Ecom.module.css';
import Footer from "../components/Footer";
import slide1 from '../images/product1.jpg';
import slide2 from '../images/product2.jpg';
import slide3 from '../images/slide3.jpg';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BuyProduct from "./BuyProduct";
import axios from "axios";

const Ecom = () => {
  const slides = [slide1, slide2, slide3];

  const [productDetailImg, setProductDetailImg] = useState('');
  const [productDetailPrice, setProductDetailPrice] = useState('');
  const [productDetailName, setProductDetailName] = useState('');
  const [productDescription, setProductDescription] = useState('');
  const [showForm, setShowForm] = useState(false);
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
    const fetchData = async () => {
      try {
        const response = await axios.get(
          'https://dangoimport-server.onrender.com/api/products'
        );
        setProducts(response.data);
      } catch (err) {
        console.error('Erreur', err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    return () => clearTimeout(t);
  }, []);

  console.log(products); 

  return (
    <div>
      <header>
        <div className={styles.headerNav}>
          <div>
            <div className={styles.logo}>
              <img src={logo} alt="logo" />
              <h3>Dango Import</h3>
            </div>
          </div>
        </div>
        <div className={styles.acceuil}>
          <div className={styles.texts}>
            <h1>Achetez les meilleurs produits de Dango Import</h1>
            <h2>
              Nous avons les meilleurs produits adaptés à vos besoins, commandez vos
              produits à un prix abordable
            </h2>
          </div>
          <div className={styles.sliderContainer}>
            <Slider {...settings} className={styles.slider}>
              {slides.map((s, i) => (
                <div key={i} className={styles.slideItem}>
                  <img
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
        {showForm === false && (
          <div className={styles.items}>
            <div>
              <div className={styles.productContainer}>
                {products.map((item) => (
                  <div className={styles.item} key={item.id || item._id}>
                    <img src={item.productImg} alt="productImg" />
                    <div>
                      <p>
                        {item.name} <span>{item.price} fcfa</span>
                      </p>
                      <p>
                        <button
                          onClick={() => {
                            setShowForm(true);
                            setProductDetailImg(item.productImg);
                            setProductDetailPrice(item.price);
                            setProductDetailName(item.name);
                            setProductDescription(item.description);
                          }}
                        >
                          Acheter
                        </button>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <BuyProduct
            image={productDetailImg}
            name={productDetailName}
            price={productDetailPrice}
            description={productDescription}
            isVisibled={showForm}
        />
      </main>

      <Footer />
    </div>
  );
};

export default Ecom;
