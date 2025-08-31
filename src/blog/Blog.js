import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./blog.module.css";
import financePerso from "../images/financePerso.jpg";
import une_personne from "../images/une-personne.png";
import epargne from "../images/epargne.jpg";

const Blog = () => {
  const [showAd, setShowAd] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [countdown, setCountdown] = useState(20); // ⏳ 5 secondes

  const handleClick = (e, url) => {
    e.preventDefault();
    setRedirectUrl(url);
    setShowAd(true);
    setCountdown(20);
  };

    // Gestion du countdown
    useEffect(() => {
    let timer;
    if (showAd && countdown > 0) {
        timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
    }, [showAd, countdown]);


  // Charger dynamiquement le script Adsterra pour la bannière 728x90
  useEffect(() => {
    if (showAd) {
      // Définir atOptions
      window.atOptions = {
        key: "3aaeaf494b1a9119d81d64c1f8fcd306",
        format: "iframe",
        height: 90,
        width: 728,
        params: {},
      };

      // Créer et ajouter le script
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "//www.highperformanceformat.com/3aaeaf494b1a9119d81d64c1f8fcd306/invoke.js";
      script.async = true;

      const adContainer = document.getElementById("ad-container");
      if (adContainer) {
        adContainer.appendChild(script);
      }

      return () => {
        if (adContainer) adContainer.innerHTML = ""; // Nettoyer à la fermeture
      };
    }
  }, [showAd]);

  return (
    <div className={styles.blogPage}>
      {!showAd && (
        <div>
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
        </div>
      )}

      {showAd && (
        <div className={styles.adOverlay}>
            <p>La pub se ferme dans {countdown} secondes...</p>
            
            {/* Bouton visible quand le timer est fini */}
            {countdown === 0 && (
            <button
                className={styles.skipButton}
                onClick={() => {
                setShowAd(false); // ferme la pub
                if (redirectUrl) window.location.href = redirectUrl; // puis redirige
                }}
            >
                Fermer et continuer
            </button>
            )}
            
            <div id="ad-container" className={styles.adFullScreen}></div>
        </div>
        )}

    </div>
  );
};

export default Blog;
