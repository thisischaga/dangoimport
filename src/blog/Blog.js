import { useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import styles from "./blog.module.css";
import financePerso from "../images/financePerso.jpg";
import une_personne from "../images/une-personne.png";
import epargne from "../images/epargne.jpg";

const Blog = () => {
  const [showAd, setShowAd] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState(null);
  const [canSkip, setCanSkip] = useState(false);

  // Quand l’utilisateur clique sur un article
  const handleClick = (e, url) => {
    e.preventDefault();
    setRedirectUrl(url);
    setShowAd(true);
    setCanSkip(false);

    // Autoriser le skip après 5 secondes
    setTimeout(() => setCanSkip(true), 5000);
  };

  // Quand la vidéo est terminée
  const handleAdFinished = () => {
    setShowAd(false);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  return (
    <div className={styles.blogPage}>
      
      {!showAd && 
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
        </div>
      }
      

      {/* Vidéo en plein écran */}
      {showAd && (
        <div className={styles.videoOverlay}>
          <video
            width="100%"
            height="100%"
            autoPlay
            controls={false}
            onEnded={handleAdFinished}
          >
            <source
              src="https://www.w3schools.com/html/mov_bbb.mp4"
              type="video/mp4"
            />
            Votre navigateur ne supporte pas la vidéo.
          </video>

          {/* Bouton Skip (désactivé avant 5s) */}
          {canSkip && (
            <button className={styles.skipButton} onClick={handleAdFinished}>
              Passer la pub
            </button>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default Blog;
