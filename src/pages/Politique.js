import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './cgu.module.css';

const Politique = () => {

  return(

    <div className={styles.servicesPage} >
        <Header/>
        <main>
            <div className={styles.cgu}>
                <div>
                    <div className={styles.header}>
                        <h1>POLITIQUE DE CONFIDENTIALITÉ</h1>
                        <p>
                            Dernière mis à jour : 7 juin 2025<br/>
                            Chez Dango Import, nous accordons une grande importance à la protection de vos données personnelles. <br/>Cette politique explique quelles
                             informations nous collectons, pourquoi nous les collectons, et comment elles sont utilisées <br/>dans le cadre de nos services d’importation de produits
                            depuis la Chine.

                        </p>
                    </div>
                    <div className={styles.content}>
                        <p>
                            <strong>1. Qui sommes-nous ?</strong><br/>
                            Dango Import est une entreprise spécialisée dans l’accompagnement à l’importation de biens depuis la Chine vers l’Afrique de l’Ouest,<br/> 
                            en particulier le Bénin et le Togo.

                        </p>
                        <p>
                            <strong>2. Données personnelles collectées</strong><br/>
                            Nous collectons des données uniquement lorsque vous :
                            <li> Remplissez un formulaire de demande de devis</li>
                            <li>Nous contactez via le formulaire, e-mail ou messagerie instantanée</li>
                            <li>Vous inscrivez à notre newsletter</li>
                            Les données peuvent inclure : 
                            <li>Nom et prénom</li>
                            <li>Adresse e-mail</li>
                            <li>Numéro de téléphone / WhatsApp</li>
                            <li> Informations sur la commande : produit, quantité, adresse de livraison</li>
                            <li>Adresse IP et données de navigation (si applicables)</li>

                        </p>
                        <p>
                            <strong>3. Finalités de la collecte</strong><br/>
                            Vos données sont utilisées pour :
                            <li> Traiter vos demandes de devis</li>
                            <li>Vous répondre par e-mail ou téléphone</li>
                            <li>Assurer le suivi des commandes et livraisons</li>
                            <li> Vous envoyer des informations commerciales si vous y avez consenti</li>
                            <li>Améliorer notre service et analyser les besoins des clients</li>
                        </p>
                        <p>
                            <strong>4. Partage de données</strong><br/>
                            Nous ne vendons ni ne louons vos données personnelles à des tiers.<br/>
                            Vos données peuvent être transmises uniquement à nos partenaires logistiques ou fournisseurs chinois dans le strict cadre <br/>du traitement de votre commande.

                        </p>
                        <p>
                            <strong>5. Durée de conservation</strong><br/>
                            Nous conservons vos données uniquement le temps nécessaire :
                            <li>Au traitement de votre commande</li>
                            <li>A la gestion de la relation commerciale</li>
                            <li>Ou jusqu’à ce que vous demandiez leur suppression</li>
                        </p>
                        <p>
                            <strong>6. Vos droits</strong><br/>
                            Conformément aux réglementations en vigueur, vous avez le droit de :
                            <li>Accéder à vos données</li>
                            <li>Les modifier ou corriger</li>
                            <li>En demander la suppression</li>
                            <li>Retirer votre consentement</li>
                            📧 Pour exercer vos droits : contact@dangoimport.com
                        </p>
                        <p>
                            <strong>7. Sécurité</strong><br/>
                            Chaque commande passe par : <br/>
                            Nous mettons en place des mesures raisonnables pour protéger vos données (serveurs sécurisés, contrôle d’accès, etc.). <br></br>Toutefois, aucun système en ligne 
                            n’est totalement à l’abri des risques.

                        </p>
                        <p>
                            <strong>8. Cookies</strong><br/>
                            Notre site peut utiliser des cookies techniques pour améliorer votre expérience. Vous pouvez 
                            désactiver les cookies dans les paramètres<br/> de votre navigateur.
                        </p>
                    </div>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
)
}

export default Politique;