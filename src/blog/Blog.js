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
  const [countdown, setCountdown] = useState(5); 

  const handleClick = (e, url) => {
    e.preventDefault();
    setRedirectUrl(url);
    setShowAd(true);
    setCountdown(5);
  };

  useEffect(() => {
    let timer;
    if (showAd && countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [showAd, countdown]);

  useEffect(() => {
    if (showAd) {
      const adContainer = document.getElementById("ad-container");
      if (adContainer) {
        adContainer.innerHTML = `
          <!-- annonce1 -->
          <ins class="adsbygoogle"
               style="display:block"
               data-ad-client="ca-pub-2759671915983740"
               data-ad-slot="9954163361"
               data-ad-format="auto"
               data-full-width-responsive="true"></ins>
        `;
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
          console.error("AdSense error:", e);
        }
      }

      return () => {
        if (adContainer) adContainer.innerHTML = ""; 
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

          <div id="ad-container" className={styles.adFullScreen}></div>
        </div>
      )}
    </div>
  );
};

export default Blog;
