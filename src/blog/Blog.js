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

  // Quand l’utilisateur clique sur un article
  const handleClick = (e, url) => {
    e.preventDefault(); // on empêche la redirection directe
    setRedirectUrl(url);
    setShowAd(true); // on affiche la pub
  };

  // Quand la pub est terminée
  const handleAdFinished = () => {
    setShowAd(false);
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

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
                  <a href="/blog/epargne" onClick={(e) => handleClick(e, "/blog/epargne")}>
                    L’Épargne : Comment Protéger et Faire Croître Votre Argent
                  </a>
                </p>
              </div>

              <div className={styles.item}>
                <img src={une_personne} alt="une personne" />
                <p>
                  <a href="/blog/dango" onClick={(e) => handleClick(e, "/blog/dango")}>
                    Pourquoi choisir Dango Import pour vos achats depuis la Chine?
                  </a>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>
      <Footer />

      {/* Modal de pub 
        <video
              width="100%"
              controls
              autoPlay
              onEnded={handleAdFinished}
            >
              <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4" />
              Votre navigateur ne supporte pas la vidéo.
            </video>
        */}
      {showAd && (
        <div className={styles.adOverlay}>
          <div className={styles.adContainer}>
            <script type='text/javascript' src='//pl27546767.revenuecpmgate.com/32/6e/6c/326e6c39bd5847b383f209f01c2a3d69.js'></script>
            
            <p>La vidéo se terminera avant l’ouverture de l’article...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;
