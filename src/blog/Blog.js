
import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './blog.module.css';
import financePerso from '../images/financePerso.jpg';
import une_personne from '../images/une-personne.png';
import epargne from '../images/epargne.jpg';

const Blog = () => {

 

  return(

    <div className={styles.blogPage} >
        <Header/>
        <main>
            <div className={styles.mainContainer} >
 
                <section className={styles.blogs}>
                    <div className={styles.blog}>                        
                        <div className={styles.item}>
                            <img src={financePerso} alt="financePerso"/>
                            <p>
                                <a href="/blog/finance personnelle">
                                    Les principes fondamentaux de la finance personnelle : Gérer son argent au quotidien
                                </a>
                            </p>
                        </div>
                        
                        <div className={styles.item}>
                            <img src={epargne} alt="image_epargne"/>
                            <p>
                                <a href="/blog/epargne">
                                    L’Épargne : Comment Protéger et Faire Croître Votre Argent
                                </a>
                            </p>
                        </div>
                        <div className={styles.item}>
                            <img src={une_personne} alt="une personne"/>
                            <p>
                                Pourquoi choisir Dango Import pour vos achats depuis la Chine?
                            </p>
                        </div>
                    </div>
                </section>

            </div>
        </main>
        <Footer/>
    </div>
)
}

export default Blog;