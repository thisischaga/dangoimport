import React, { useEffect, useState, useCallback, memo } from "react";
import Slider from "react-slick";
import { useLocation, useNavigate } from "react-router-dom";
import styles from './header.module.css';

// Import des images
import logo from '../images/logo.jpeg';
import slide1 from '../images/product1.png';
import slide2 from '../images/avion.png';
import slide3 from '../images/slide3.jpg';

const StatItem = ({ value, label }) => (
  <div className={styles.statItem}>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </div>
);

const Header = ({setShowForm}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setMobileMenuOpen(false);
    window.scrollTo(0, 0);
  }, [navigate]);

  const navigationItems = [
    { path: '/', label: 'Accueil' },
    { path: '/services', label: 'Services' },
    { path: '/shopping', label: 'Boutique' },
    { path: '/blog/articles', label: 'Blog' },
    { path: '/about', label: 'À propos' }
  ];

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    fade: true,
    pauseOnHover: false,
    cssEase: "cubic-bezier(0.7, 0, 0.3, 1)"
  };

  return (
    <header className={styles.header}>
      {/* --- NAVBAR --- */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className={styles.navContainer}>
          <div className={styles.logo} onClick={() => handleNavigation('/')}>
            <div className={styles.logoImage}><img src={logo} alt="Logo" /></div>
            <div className={styles.logoText}>
              <span className={styles.logoName}>Dango Import</span>
              <span className={styles.logoTagline}>China to Africa</span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <ul className={styles.navLinks}>
            {navigationItems.map((item) => (
              <li 
                key={item.path}
                className={location.pathname === item.path ? styles.active : ""}
                onClick={() => handleNavigation(item.path)}
              >
                {item.label}
                <span className={styles.navIndicator}></span>
              </li>
            ))}
          </ul>

          <button className={styles.ctaButton} onClick={() => window.open('https://preview.mailerlite.io/preview/1579555/sites/156648060934423805/g4bOpM?fresh=1', '_blank')}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" strokeWidth="2"/>
            </svg>
            Newsletter
          </button>

          {/* Burger Button */}
          <div className={styles.mobileMenuBtn} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
            <span className={mobileMenuOpen ? styles.open : ''}></span>
          </div>
        </div>
      </nav>

      {/* --- MOBILE MENU (L'élément qui manquait) --- */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.open : ''}`}>
        {navigationItems.map((item) => (
          <div 
            key={item.path}
            className={`${styles.mobileMenuItem} ${location.pathname === item.path ? styles.active : ""}`}
            onClick={() => handleNavigation(item.path)}
          >
            {item.label}
          </div>
        ))}
        <button className={styles.mobileCtaButton}>Newsletter</button>
      </div>

      {/* --- HERO SECTION --- */}
      <div className={styles.hero}>
        <div className={styles.heroBackground}>
          <div className={styles.gradientOrb} style={{ top: '5%', left: '5%' }}></div>
          <div className={styles.gridPattern}></div>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.badge}>
              <div className={styles.badgeDot}></div>
              <span>Expert Logistique Chine-Afrique</span>
            </div>

            <h1 className={styles.heroTitle}>
              Vos achats en Chine,<br />
              <span className={styles.gradientText}>livrés en Afrique</span>
            </h1>

            <p className={styles.heroSubtitle}>
              Bénéficiez de prix d'usine sans quitter votre domicile. Nous gérons l'achat, l'inspection et le transport vers le Bénin, Togo et Ghana.
            </p>

            <div className={styles.heroActions}>
              <button className={styles.primaryButton} onClick={() => setShowForm(true)}>
                <span>Demander un devis</span>
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 7l5 5m0 0l-5 5m5-5H6" strokeWidth="2"/></svg>
              </button>
              <button className={styles.secondaryButton} onClick={() => handleNavigation('/shopping')}>
                Voir la boutique
              </button>
            </div>

            <div className={styles.stats}>
              <StatItem value="500+" label="Livraisons" />
              <div className={styles.statDivider}></div>
              <StatItem value="3" label="Pays" />
              <div className={styles.statDivider}></div>
              <StatItem value="98%" label="Satisfaction" />
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.sliderWrapper}>
              <div className={styles.sliderDecoration}></div>
              <Slider {...sliderSettings} className={styles.slider}>
                {[slide1, slide2, slide3].map((img, idx) => (
                  <div key={idx} className={styles.slideItem}>
                    <img src={img} alt={`Slide ${idx}`} className={styles.slideImage} />
                  </div>
                ))}
              </Slider>
              <div className={styles.floatingCard} style={{ top: '15%', right: '-5%' }}>
                <span>📦 Suivi en temps réel</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default memo(Header);