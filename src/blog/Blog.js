import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./blog.module.css";
import financePerso from "../images/financePerso.jpg";
import une_personne from "../images/une-personne.png";
import epargne from "../images/epargne.jpg";

const Blog = () => {
  const [showAd, setShowAd] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);

  // Quand l’utilisateur clique sur un article
  const handleClick = (e, url) => {
    e.preventDefault(); // empêcher redirection directe
    setRedirectUrl(url);
    setShowAd(true); // afficher la pub
  };

  // Injection dynamique du script Adsterra
  useEffect(() => {
    if (showAd) {
      const script = document.createElement("script");
      script.src =
        "//pl27546767.revenuecpmgate.com/32/6e/6c/326e6c39bd5847b383f209f01c2a3d69.js";
      script.async = true;
      document.getElementById("ad-container")?.appendChild(script);

      // Simuler fin de la pub (10 secondes)
      const timer = setTimeout(() => {
        setShowAd(false);
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [showAd, redirectUrl]);

  return (
    <div className={styles.blogPage}>
      <Header />
      <main>
        <div className={styles.mainContainer}>
          <section className={styles.blogs}>
            <div className={styles.blog}>
              <div className={styles.item}>
                <img src={financePerso} alt="financePerso" />
                <p>
                  <a
                    href="/blog/finance-personnelle"
                    onClick={(e) =>
                      handleClick(e, "/blog/finance-personnelle")
                    }
                  >
                    Les principes fondamentaux de la finance personnelle : Gérer
                    son argent au quotidien
                  </a>
                </p>
              </div>

              <div className={styles.item}>
                <img src={epargne} alt="image_epargne" />
                <p>
                  <a
                    href="/blog/epargne"
                    onClick={(e) => handleClick(e, "/blog/epargne")}
                  >
                    L’Épargne : Comment Protéger et Faire Croître Votre Argent
                  </a>
                </p>
              </div>

              <div className={styles.item}>
                <img src={une_personne} alt="une personne" />
                <p>
                  <a
                    href="/blog/dango"
                    onClick={(e) => handleClick(e, "/blog/dango")}
                  >
                    Pourquoi choisir Dango Import pour vos achats depuis la
                    Chine?
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* Overlay Pub */}
      {showAd && (
        <div className={styles.adOverlay}>
          <div className={styles.adContainer} id="ad-container">
            <p>Votre article s’ouvrira après la publicité (10s)...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
