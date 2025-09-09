import React, { useEffect, } from "react";
import Slider from "react-slick";
import logo from '../images/logo.jpeg';
import slide1 from '../images/slide1.jpg';
import slide2 from '../images/slide2.jpg';
import slide3 from '../images/slide3.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import styles from './header.module.css';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (path) => location.pathname === path;
  const toHome = () => navigate('/');
  const toAbout = () => navigate('/about');
  const toServices = () => navigate('/services');
  const toBlog = () => navigate('/blog/articles');
  /*const toAdminLogin = () => window.open('https://www.dangoimport.com/admin', '_blank');*/
  const tooglleNewsletter = () => window.open('https://preview.mailerlite.io/preview/1579555/sites/156648060934423805/g4bOpM?fresh=1', '_blank');

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
  const toEcom = ()=>{
    navigate('/shopping');
  }
  return (
    <header className={styles.container}>
      <div className={styles.headerNav}>
        <div className={styles.logo} onClick={toHome}>
          <img src={logo} alt="logo" />
          <h3>Dango Import</h3>
        </div>

        <nav>
          <ul>
            <li className={isActive("/") ? styles.active : ""} onClick={toHome}>Acceuil</li>
            <li className={isActive("/services") ? styles.active : ""} onClick={toServices}>Service</li>
            <li className={isActive("/blog/articles") ? styles.active : ""} onClick={toBlog}>Blog</li>
            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
            <button className={styles.pc} onClick={toEcom}>Acheter nos produits</button>
          </ul>
        </nav>
      </div>

      <div >
        <div className={styles.content}>
          <div className={styles.headerIntro}>
            <div className={styles.headerTexts}>
              <h2>Vos achats en Chine, livrés en Afrique de l'Ouest</h2>
              <h3>Importer depuis la Chine, on s'occupe du reste !</h3>
            </div>
            <div>
              <p>Abonnez-vous à la newsletter</p>
              <button onClick={tooglleNewsletter} className={styles.newsletter}>Newsletter</button>
            </div>
              
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
      </div>
    </header>
  );
};

export default Header;
