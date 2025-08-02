import Header from "../components/Header";
import styles from './about.module.css';
import logo from '../images/logo.jpeg'
import Footer from "../components/Footer";


const About = () => {
    return(
      <div>
        <Header/>
        <main>
          <div className={styles.container}>
            <div>
              <h2>A propos de Dango Import</h2>
              <h3>
                Dango Import - Votre partenaire fiable pour l'importation de vos produits
                <br/>depuis la chine vers le Bénin, le Togo et le Ghana.
              </h3>
              <div className={styles.flex}>
                <img src={logo} alt="colis"/>
              </div>
              <div className={styles.functions}>
                <div>
                  <h3>Qui sommes-nous?</h3>
                  <p>
                    <strong>Dango Import est un service d'accompagnement personnalisé à l'importation, </strong>
                    <br/>crée pour aider les particuliers, commerçants et jeune entrepreneurs à commander
                    facilement <br/>des produits depuis la chine, sans stress ni de mauvaises suprises.
                    <br/>Notre objectif est simple: <strong>vous permettre d'importer des articles 
                    de qualité (vêtements, <br/>accessoires, gadgets, équipements...) depuis la Chine en 
                    toute sécurité,</strong> <br/>avec un suivi professionnel de A à Z.
                    
                  </p>
                </div>
              </div>
              <div  className={styles.functions}>
                <h3>Pourquoi ce projet?</h3>
                <p>
                  Le fondateur de Dango Import a lui-même connu les <strong>tracas de l'importation: </strong>
                  anarques, produits <br/>de mauvaise qualité, blocages à la douane... C'est en
                  vivant ces difficultes qu'il a décidé de créer <br/>une solution fiable et accessible
                  pour tous ce qui souhaitent se lancer dans l'importation sans tomber<br/> dans les pièges
                  classiques
                </p>
              </div>
              <div  className={styles.functions}>
                <h3>Ce que nous faisons</h3>
                <p>
                  Nous vous accompagnons dans toutes les étapes: 
                  <ul>
                    <li>Recherche des founisseurs fiables en Chine</li>
                    <li>Devis clairs et rapides</li>
                    <li>Achat en votre nom</li>
                    <li>Transport, dedouanement et livraison</li>
                    <li>Suivi personnalisé et communication transparente</li>
                  </ul>
                </p>
              </div>
              <div  className={styles.functions}>
                <h3>Nos engagements</h3>
                <ul>
                  <li><strong>Sécurités des paiements</strong></li>
                  <li><strong>Respect des délais</strong></li>
                  <li><strong>Qualité des produits</strong></li>
                  <li><strong>Accompagnement humain et transparent</strong></li>
                </ul>
              </div>
              <p>
                Que vous êtes au Bénin, au Togo ou au Ghana, <br/>Dango Import est là pour vous
                guider et livrer vos commandes à domicile.
              </p>
              <h3>En résumé</h3>
              <p>
                Dango Import, c'est la solution simple, fiable et professionnelle pour vos achats en Chine.<br/>
                Nous vous aidons à concrétiser vos projets d'importation sans risque et à construire 
                un business <br/>durable.
              </p>
            
            </div>
            
          </div>
          
        </main>
        <Footer/>
      </div>
    )
  }
  
  export default About;