import React from 'react';
import styles from './articleFour.module.css';
import Footer from '../components/Footer';


const ArticleFour = () => {

    return (
        <div className={styles.articlePage}>
            <div className={styles.articleContainer}>
                <div className={styles.articleHeader}>
                    <h1>L’histoire de Mamadou : apprendre par l’échec</h1>
                </div>
                <main>
                    <div >
                        <div className={styles.intro}>
                            <p>
                                Pour illustrer, prenons l’exemple de Mamadou (histoire inspirée 
                                de situations réelles dans l’import-export).<br/>

                                
                            </p>
                                
                        </div>
                        <div className={styles.articleContent}>
                            <h2>La face cachée de l’entrepreneuriat</h2>
                            
                            <p> 
                               Mamadou, passionné de commerce, décide d’importer des ustensiles de cuisine depuis la Chine. Sa première commande : 500 pièces financées à crédit. Mais à l’arrivée, 20 % sont défectueuses, 
                                les frais de douane explosent et sa marge s’effondre.<br/> 

                                Échec cuisant ? Oui. Mais Mamadou ne baisse pas les bras. Il apprend à demander des échantillons, à négocier les MOQ, à contrôler la qualité avant expédition, et à tester la demande par de petites préventes. Deux ans plus tard, il relance avec un lot réduit dans une niche précise. Résultat : 
                                une activité viable et en croissance.<br/>

                                <strong>Moralité :</strong> ce qui tue une entreprise n’est pas l’échec en soi, 
                                mais l’incapacité à apprendre de ses erreurs.<br/>
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    )    
}    

export default ArticleFour;