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

  // Injection du script de pub RevenueCPM
  useEffect(() => {
    if (!showAd) return;

    const adContainer = document.getElementById("ad-container");
    if (adContainer) {
      adContainer.innerHTML = "";

      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src =
        "//pl27546767.revenuecpmgate.com/32/6e/6c/326e6c39bd5847b383f209f01c2a3d69.js";
      script.async = true;

      adContainer.appendChild(script);
    }

    return () => {
      if (document.getElementById("ad-container")) {
        document.getElementById("ad-container").innerHTML = "";
      }
    };
  }, [showAd]);

  return (
    <div className={styles.blogPage}>
      {!showAd && (
        <>
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
        </>
      )}


    </div>
  );
};

export default Blog;
