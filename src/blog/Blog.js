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
                      >
                        L’entrepreneuriat : rêve de liberté ou véritable école
                        de survie ?
                      </a>
                    </p>
                  </div>

                  {/*<div className={styles.item}>
                    <img src={articleFour} alt="une personne" />
                    <p>
                      <a
                        href="/blog/histoire-de-mamadou"
                      >
                        L’histoire de Mamadou : apprendre par l’échec
                      </a>
                    </p>
                  </div>*/}

                  <div className={styles.item}>
                    <img src={articleFive} alt="une personne" />
                    <p>
                      <a
                        href="/blog/la prise de risque en entreprenneuriat"
                      >
                        La prise de risque en entreprenneuriat: art de miser sans se perdre
                      </a>
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </main>
          <Footer />
      </div>
  );
}

export default Blog;
