import React from 'react';
import styles from './articleFive.module.css';
import Footer from '../components/Footer';


const ArticleFive = () => {

    return (
        <div className={styles.articlePage}>
            <div className={styles.articleContainer}>
                <div className={styles.articleHeader}>
                    <h1>L’intelligence financière : indispensable même si vous n’êtes pas entrepreneur</h1>
                </div>
                <main>
                    <div >
                        <div className={styles.intro}>
                            <p>
                                La vérité est simple : même si vous ne créez jamais d’entreprise, vous avez besoin de l’intelligence financière pour survivre et avancer.
                            </p>
                        </div>
                        <div className={styles.articleContent}>
                            <h2>Cela implique :</h2>
                            
                            <p>
                
                                <li>
                                    ✅ Savoir gérer son argent (budget, épargne, investissements).
                                </li>
                                <li>
                                    ✅ Développer un revenu parallèle (freelance, e-commerce, consulting).
                                </li>
                                <li>
                                    ✅ Comprendre les règles du business et du digital.
                                </li>
                                
                                
                            </p>
                            
                            <p>
                                💡 Dans une économie mondialisée, la sécurité n’est plus garantie par un diplôme ou un emploi fixe. Ce monde appartient à ceux qui apprennent et s’adaptent.
                            </p>
                               
                        </div>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    )    
}    

export default ArticleFive;