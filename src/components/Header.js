import React from "react";
import Slider from "react-slick";
import logo from '../images/logo.jpeg';
import slide1 from '../images/slide1.jpg';
import slide2 from '../images/slide2.jpg';
import slide3 from '../images/slide3.jpg';
import { useLocation, useNavigate } from "react-router-dom";
import styles from './header.module.css';

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
    dots: true,           // Points de navigation
    infinite: true,       // Slide infini
    speed: 500,           // Vitesse de transition
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,  // 4 secondes
    arrows: true          // flèches gauche/droite
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.headerNav}>
          <div className={styles.logo}>
            <img src={logo} alt="logo" />
            <h3 onClick={toAdminLogin}>Dango Import</h3>
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
          <button className={styles.mobile} onClick={() => alert("Ce service n'est pas encore disponible !")}>Acheter nos produits</button>
        </div>

        {/* Slider */}
        <div className={styles.sliderContainer}>
          <Slider {...settings}>
            {slides.map((slide, index) => (
              <div key={index}>
                <img src={slide} alt={`slide${index+1}`} className={styles.slideImage}/>
              </div>
            ))}
          </Slider>
        </div>

      </div>
    </header>
  );
};

export default Header;
