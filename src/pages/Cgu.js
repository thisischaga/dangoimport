import Footer from '../components/Footer';
import Header from '../components/Header';
import styles from './cgu.module.css';

const Cgu = () => {

  return(

    <div className={styles.servicesPage} >
        <Header/>
        <main>
            <div className={styles.cgu}>
                <div>
                    <div className={styles.header}>
                        <h1>Conditions Générales d'Utilisation (CGU) - Dango Import</h1>
                        <p>Dernière mis à jour : 10 août 2025</p>
                    </div>
                    <div className={styles.content}>
                        <p>
                            Bienvenue sur le site de Dango Import. <br/>
                            En utilisant notre site vous acceptez les présentes Conditions Générales d'Utilisation (CGU) et vous engagez à les respecter. <br/>
                            Ces conditions définissent les règles juridiques encadrant l'utilisation de notre plateforme. 
                        </p>
                        <p>
                            <strong>1. Informations légales</strong><br/>
                            Le site permet aux utilisateurs de :
                            <li>Nom du site : Dango Import </li> 
                            <li>Responsable: Ayatoulaye DANGO NADEY </li> 
                            <li>Adresse E-mail : contact@dangoimport.com</li> 
                            <li>Hébergeur : </li> Hostinger <br/>
                            <li>Pays d'activité : Bénin - Togo - Ghana </li> 
                        </p>
                        <p>
                            <strong>2. Objet du site</strong><br/>
                            Le site permet aux utilisateurs de :
                            <li> Demander un devis personnalisé pour l’importation de produits depuis la Chine</li>
                            <li>Commander des produits directement disponibles en stock</li>
                            <li>S’informer via nos contenus éducatifs (articles, conseils, etc.)</li>
                        </p>
                        <p>
                            <strong>3. Conditions d'accès</strong><br/>
                            L'accès au site est <strong>gratuit</strong> et ouvert à tous sans inscription préalable. Toutefois, certaines fonctionnalités 
                            <br/>(formulaire de devis, abonnement newsletter) nécessitent que vous fournissez des données personnelles, dans le respect de <br/>notre  
                            <a href='/politique-de-confidentialite'> Politique de Confidentialité.</a>
                        </p>
                        <p>
                            <strong>4. Services proposés</strong><br/>
                            Nous offrons : 
                            <li>Un accompagnement personnalisé à l'achat de produits en Chine</li>
                            <li>Un service de recherche de fournisseurs, négociation et devis</li>
                            <li>Le suivi de commande et livraison à domicile</li>
                            <strong>Important : </strong> Aucun paiement ne se fait sans acceptation d'un devis préalable
                        </p>
                        <p>
                            <strong>5. Responsabiités de l'utilisateur</strong><br/>
                            L'utilisateur s'engage à : 
                            <li>Fournir des informations exactes dans les formulaires</li>
                            <li>Ne pas utiliser le site à des fins frauduleuses</li>
                            <li>Ne pas publier de contenus illicites ou malveillants</li>
                            En cas d'usage abusif, Dango Import se reserve le droit de susprendre l'accès à tout moment.
                        </p>
                        <p>
                            <strong>6. Responsabiités de Dango Import</strong><br/>
                            L'utilisateur s'engage à : 
                            <li>Proposer des services conformes aux descriptions</li>
                            <li>Garantir la confidentialité des informations transmises</li>
                            <li>Respecter les délais de traitement dans la mesure du possible</li>
                            Toutefois, la sociéte <strong>ne peut pas être tenue responsable en cas de : </strong>
                            <li>Retards liés à la douane ou au transport</li>
                            <li>Pertes dues à des tiers (transporteur, fournisseurs, etc...)</li>
                            <li>Dysfonctionnemenys du site indépendant de sa volonté</li>
                        </p>
                        <p>
                            <strong>7. Commande et paiement</strong><br/>
                            Chaque commande passe par : 
                            <li>Une demande via le formulaire ou WhatsApp</li>
                            <li>Une analyse de la faisabilité</li>
                            <li>L'émission d'undevis clair et détaillé</li>
                            <li>La validation par le client</li>
                            <li>Le paiement via les moyens proposés</li>
                            Aucune commande n'est engagée sans validation et paiement anticipé
                        </p>
                        <p>
                            <strong>8. Données personnelles</strong><br/>
                            Vos données sont collectées pour la gestion de vos demandes et l'amélioration de nos services.<br/>
                            La collecte et le traitement sont régis par notre Politique de confidentialité.
                        </p>
                        <p>
                            <strong>9. Propriété intellectuelle</strong><br/>
                            Tous les éléments du site (textes, logos, images, illustrations, etc) sont la propriété exclusive de Dango Import, sauf mentions contraires. <br/>
                            Toute reproduction partielle ou totale sans autorisation est interdite.
                        </p>
                        <p>
                            <strong>10. Modifications du CGU</strong><br/>
                            Dango Import peut modifier à tout moment les présentes CGU. <br/>
                            La version en ligne est la seule applicable. Nous vous invitons à les consulter régulièrement.
                        </p>
                        <p>
                            <strong>11. Liens externes</strong><br/>
                            Le site peut contenir des liens externes vers des sites tiers. Dango import ne peut être tenue responsable du contenu <br/>ou de la politique de ces sites
                            externes.
                        </p>
                        <p>
                            <strong>12. Droit applicable</strong><br/>
                            Les présentes CGU sont soumises au droit béninois (ou togolais/ghanéen selon ton activité).<br/>
                            En cas de litige, les tribunaux locaux seront seuls compétants, sauf accord amiable.
                        </p>
                        <p>
                            <strong>13. Contact</strong><br/>
                            Pour toute question ou remarque : 
                            <li>contact@dangoimport.com</li>
                            <li>WhatsApp : +229 01 59 38 71 80 / +228 99 17 38 54</li>
                            <li>Site : <a href='www.dangoimport.com'>www.dangoimport.com</a></li>
                        </p>
                    </div>
                </div>
            </div>
        </main>
        <Footer/>
    </div>
)
}

export default Cgu;