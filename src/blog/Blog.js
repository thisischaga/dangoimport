import { useEffect, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./blog.module.css";
import financePerso from "../images/financePerso.jpg";
import epargne from "../images/epargne.jpg";
import articleThree from "../images/article3.jpeg";
import articleFour from "../images/article4.jpeg";
import articleFive from "../images/article5.jpeg";

const Blog = () => {
  const [showAd, setShowAd] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [countdown, setCountdown] = useState(5);

  const handleClick = (e, url) => {
    e.preventDefault();
    setRedirectUrl(url);
    setShowAd(true);
    setCountdown(5);
  };

  // Compte à rebours
  useEffect(() => {
    if (!showAd) return;
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [showAd, countdown]);

  // Chargement du script de publicité
  useEffect(() => {
    if (!showAd) return;

    const adContainer = document.getElementById("ad-container");
    if (adContainer) {
      // Nettoyage avant ajout
      adContainer.innerHTML = "";

      // Script de configuration
      const configScript = document.createElement("script");
      configScript.type = "text/javascript";
      configScript.innerHTML = `
        atOptions = {
          'key': 'a75182f28931d1c30b3fb4990a516b63',
          'format': 'iframe',
          'height': 250,
          'width': 300,
          'params': {}
        };
      `;

      // Script d’appel de la pub
      const invokeScript = document.createElement("script");
      invokeScript.type = "text/javascript";
      invokeScript.src =
        "//www.highperformanceformat.com/a75182f28931d1c30b3fb4990a516b63/invoke.js";

      // Ajout au DOM
      adContainer.appendChild(configScript);
      adContainer.appendChild(invokeScript);
    }

    // Nettoyage quand la pub disparaît
    return () => {
      if (adContainer) adContainer.innerHTML = "";
    };
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
                        Les principes fondamentaux de la finance personnelle :
                        Gérer son argent au quotidien
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
                        L’Épargne : Comment Protéger et Faire Croître Votre
                        Argent
                      </a>
                    </p>
                  </div>

                  <div className={styles.item}>
                    <img src={articleThree} alt="une personne" />
                    <p>
                      <a
                        href="/blog/entreprendre"
                        onClick={(e) => handleClick(e, "/blog/entreprendre")}
                      >
                        L’entrepreneuriat : rêve de liberté ou véritable école
                        de survie ?
                      </a>
                    </p>
                  </div>

                  <div className={styles.item}>
                    <img src={articleFour} alt="une personne" />
                    <p>
                      <a
                        href="/blog/histoire-de-mamadou"
                        onClick={(e) =>
                          handleClick(e, "/blog/histoire-de-mamadou")
                        }
                      >
                        L’histoire de Mamadou : apprendre par l’échec
                      </a>
                    </p>
                  </div>

                  <div className={styles.item}>
                    <img src={articleFive} alt="une personne" />
                    <p>
                      <a
                        href="/blog/intelligence-financière"
                        onClick={(e) =>
                          handleClick(e, "/blog/intelligence-financière")
                        }
                      >
                        L’intelligence financière : indispensable même si vous
                        n’êtes pas entrepreneur
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
          <div className={styles.adContent}>
            <h3>Annonce</h3>
            <div id="ad-container" className={styles.adBox}></div>
            <p>La pub se ferme dans {countdown} secondes...</p>
            {countdown === 0 && (
              <button
                className={styles.skipButton}
                onClick={() => {
                  setShowAd(false);
                  if (redirectUrl) window.location.href = redirectUrl;
                }}
              >
                Fermer et continuer
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
