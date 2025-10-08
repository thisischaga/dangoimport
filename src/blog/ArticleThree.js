import React from 'react';
import styles from './articleThree.module.css';
import Footer from '../components/Footer';


const ArticleThree = () => {

    return (
        <div className={styles.articlePage}>
            <div className={styles.articleContainer}>
                <div className={styles.articleHeader}>
                    <h1>L’entrepreneuriat : rêve de liberté ou véritable école de survie ?</h1>
                </div>
                <main>
                    <div >
                        <div className={styles.intro}>
                            <p>
                                Tout le monde en parle, beaucoup en rêvent, mais peu mesurent ce que cela exige vraiment.
                                Dans l’imaginaire collectif, l’entrepreneur est libre, autonome, maître de son destin. Mais derrière l’image séduisante se cache une réalité bien plus rude : 
                                l’entrepreneuriat est une opportunité immense… mais aussi un terrain hostile.
                            </p>
                        </div>
                        <div className={styles.articleContent}>
                            <h2>La face cachée de l’entrepreneuriat</h2>
                            
                            <p>
                
                                <li>
                                    <strong>C’est dur :</strong>
                                    C’est dur : construire une entreprise exige discipline, endurance mentale 
                                    et une tolérance élevée à l’échec.
                                </li>
                                <li>
                                    <strong>C’est instable :  </strong>
                                     les revenus fluctuent, les clients changent, les marchés se retournent sans prévenir
                                </li>
                                <li>
                                    <strong>C’est risqué :  </strong>
                                    l’argent, le temps, l’énergie sont investis sans garantie de retour
                                </li>
                                Beaucoup sous-estiment cette réalité. Pourtant, la lucidité 
                                est la première arme d’un entrepreneur.
                                
                            </p>
                            <h2>Des chiffres qui parlent : pourquoi tant d’entreprises échouent</h2>
                            <p>
                                Il existe plusieurs manières de mettre de l’argent de côté, adaptées à différents profils et objectifs.
                                <li>
                                    <strong>L’épargne traditionnelle : </strong>
                                    Cette méthode consiste à placer l’argent dans des comptes bancaires sécurisés, comme un compte 
                                    d’épargne ou un livret réglementé. Ces comptes offrent généralement une faible rémunération mais 
                                    garantissent la sécurité du capital et sa disponibilité immédiate.
                                </li>
                                <p>
                                    📊 Selon l’INSEE, 49,5 % des entreprises françaises 
                                    ferment dans les 5 premières années.
                                </p>
                                <p>
                                    📊 Dans le cas des startups, certains chiffres avancent jusqu’à 90 % d’échecs (même si ce 
                                    taux varie selon les secteurs et pays).
                                </p>
                                <strong>📊 Parmi les causes principales :</strong><br/>
                                <li>
                                    Absence de demande réelle (42 %).
                                </li>
                                <li>
                                    Problèmes de trésorerie (29 %)
                                </li>
                                <li>
                                    Équipe inadaptée ou conflits internes.
                                </li>
                                <li>
                                    Mauvaise tarification et concurrence trop forte.
                                </li>
                                
                            </p>
                            
                            <p>
                                👉 Ces chiffres doivent alerter mais pas décourager. La leçon, c’est qu’entreprendre sans 
                                préparation revient à s’exposer inutilement
                            </p>
                        </div>
                    </div>
                </main>
            </div>
            <Footer/>
        </div>
    )    
}    

export default ArticleThree;