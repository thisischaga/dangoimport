import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './services.module.css';
//import useInView from '../components/UseInView';
const Service = () => {

//const [ref, isVisible] = useInView();

  return(

    <div className={styles.servicesPage} >
        <Header/>
        <main>
            <div className={styles.mainContainer} >
                <div className={styles.intro}>
                    <h2>
                        Nos services
                    </h2>
                    <h3>
                        Chez Dango Import, nous vous accompagnons dans toutes les étapes de votre
                        importation <br/>depuis la Chine vers le Bénin, le Togo et le Ghana. <br/>
                        Que vous soyez commerçant, entrepreneur ou particulier, nous vous offrons un
                        service <br/>de mesure, sécurisé et fiable.
                    </h3>
                </div>
                <div className={styles.content}>
                    
                    <div className={styles.services}>
                        <div className={styles.servicesContainer}>
                            <div>
                                <h4>*<br/>Assistance à la recherche de founisseurs</h4>
                                <p>
                                    Vous nous indiquer ce que vous voulez commander. <br/>
                                   Nous trouvons pour vous les meilleurs founisseurs <br/>fiables
                                   en Chine, avec des prix compétitifs.
                                </p>
                            </div>
                            
                        </div>
                        <div className={styles.servicesContainer}>
                            <div>
                                <h4>* <br/> Elaboration de devis personnalisé</h4>
                                <p>
                                    Après avoir analysé votre demande, nous vous envoyons 
                                    <br/>un devis clair incluant:<br/>
                                    options de livraison,
                                    le coût du produit,
                                    les frais de transport et
                                    les delais estimé
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.services}>
                        <div className={styles.servicesContainer}>
                            <div>
                                <h4>* <br/> Suivis de la commande & contôle qualité</h4>
                                <p>
                                    Une fois le devis accepté, nous passons<br/>
                                    la commande pour vous. <br/>
                                    Nous assurons un suivis complet: paiement, <br/>vérification des articles,
                                    préparation à l'expédition.
                                </p>
                            </div>
                        </div>
                        <div className={styles.servicesContainer}>
                            <div>
                                <h4>* <br/> Livraison à domicile ou point relais</h4>
                                <p>
                                    Nous livrons directement au Bénin, au Togo<br/>
                                    ou au Ghana. <br/>
                                    Vous êtes informés à chaque étape du processus<br/>
                                    jusqu'à la reception finale.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div>
                        <h3>Pourquoi choisir Dango Import ?</h3>
                        <p>Votre partenaire fiable pour vos achats en Chine, livrés en Afrique de l'Ouest.</p>
                    </div>
                    <div className={styles.flex}>
                
                        <div>
                            <h3>Etudes Newsletter</h3>
                            <ul>
                                <li>Accès prioritaire aux offres spéciales</li>
                                <li>Conseils d'experts sur l'achat en Chine</li>
                                <li>Communication claire et accompagnement personnalisé</li>
                                <li>Tendancs du marché asiatique</li>
                                <li>Suivi des delais & processus d'importation</li>
                                <li>Histoires de clients & témoignages inspirants</li>
                                <li>Guides pratiques & tutoriels</li>
                            </ul>
                        </div>
                        <div>
                            <h3>Ce qui nous distingue</h3>
                            <ul>
                                <li>Livraison directe et sécurisée</li>
                                <li>Sourcing fiable de founisseurs</li>
                                <li>Communication claire et accompagnement <br/>personnalisé</li>
                                <li>Gains de temps et économies</li>
                                <li>Satisfaction garantie</li>
                            </ul>
                        </div>
                    </div>
                    <div>
                        <button>S'abonner à la newsletter</button>
                    </div>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
)
}

export default Service;