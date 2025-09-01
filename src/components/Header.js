import React from "react";
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
    fade: true, // transition en fondu
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
            <li className={isActive("/blog/articles") ? styles.active : ""} onClick={toBlog}>Articles</li>
            <li className={isActive("/about") ? styles.active : ""} onClick={toAbout}>A propos</li>
            <button className={styles.pc}>Acheter nos produits</button>
          </ul>
        </nav>
      </div>

      <div className={styles.content}>
        <div className={styles.headerIntro}>
          <h2>Vos achats en Chine, <br />livrés en Afrique de l'Ouest</h2>
          <h3>Importer depuis la Chine, <br />on s'occupe du reste !</h3>
        </div>

        {/* Slider */}
        <div className={styles.slider}>
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
