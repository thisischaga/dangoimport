/*import React from "react";
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
  const toAdminLogin = () => window.open('https://www.dangoimport.com/admin', '_blank');

  const slides = [slide1, slide2, slide3];
  const settings = {
    dots: true,
    infinite: true,
    speed: 700,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: true,
  };

  return (
    <header className={styles.container}>
      <div className={styles.headerNav}>
        <div className={styles.logo}>
          <img src={logo} alt="logo" />
          <h3 onClick={toAdminLogin}>Dango Import</h3>
        </div>
        <nav>
          <ul>
            <li className={isActive("/") ? styles.active : ""} onClick={toHome}>Acceuil</li>
            <li className={isActive("/services") ? styles.active : ""} onClick={toServices}>Service</li>
            <li className={isActive("/blog/articles") ? styles.active : ""} onClick={toBlog}>Blog</li>
            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
            <button className={styles.pc}>Acheter nos produits</button>
          </ul>
        </nav>
      </div>

      <div className={styles.content}>
        <div className={styles.headerIntro}>
          <h2>Vos achats en Chine,<br />livrés en Afrique de l'Ouest</h2>
          <h3>Importer depuis la Chine,<br />on s'occupe du reste !</h3>
        </div>
        <div className={styles.sliderContainer}>
          <div className={styles.slider}>
            <Slider {...settings}>
                {slides.map((slide, index) => (
                <div key={index}>
                    <img src={slide} alt={`slide${index + 1}`} className={styles.slideImage}/>
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
*/
import React, { useEffect } from "react";
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
  const toAdminLogin = () => window.open('https://www.dangoimport.com/admin', '_blank');

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

  // force reflow / resize pour que slick calcule correctement la taille (utile après mount)
  useEffect(() => {
    const t = setTimeout(() => window.dispatchEvent(new Event('resize')), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <header className={styles.container}>
      <div className={styles.headerNav}>
        <div className={styles.logo} onClick={toHome}>
          <img src={logo} alt="logo" />
          <h3 onClick={toAdminLogin}>Dango Import</h3>
        </div>

        <nav>
          <ul>
            <li className={isActive("/") ? styles.active : ""} onClick={toHome}>Acceuil</li>
            <li className={isActive("/services") ? styles.active : ""} onClick={toServices}>Service</li>
            <li className={isActive("/blog/articles") ? styles.active : ""} onClick={toBlog}>Blog</li>
            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
            <button className={styles.pc}>Acheter nos produits</button>
          </ul>
        </nav>
      </div>

      <div className={styles.content}>
        <div className={styles.headerIntro}>
          <h2>Vos achats en Chine,<br />livrés en Afrique de l'Ouest</h2>
          <h3>Importer depuis la Chine,<br />on s'occupe du reste !</h3>
        </div>

        <div className={styles.sliderContainer}>
          <Slider {...settings} className={styles.slider}>
            {slides.map((s, i) => (
              <div key={i} className={styles.slideItem}>
                {/* style inline minimal pour garantir affichage si CSS module a conflit */}
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
  );
};

export default Header;
