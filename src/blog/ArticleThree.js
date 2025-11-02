import React from 'react';
import styles from './articleThree.module.css';
import Footer from '../components/Footer';


const ArticleThree = () => {

    return (
        <div className={styles.articlePage}>
            <div className={styles.articleContainer}>
                <div className={styles.articleHeader}>
                    
                </div>
                    <h1>L’entrepreneuriat : rêve de liberté ou véritable école de survie ?</h1>
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
                            <h2>L’histoire de Mamadou : apprendre par l’échec</h2>
                            <p>
                                Pour illustrer, prenons l’exemple de Mamadou (histoire inspirée 
                                de situations réelles dans l’import-export).<br/>

                                
                            </p>
                            <p> 
                               Mamadou, passionné de commerce, décide d’importer des ustensiles de cuisine depuis la Chine. Sa première commande : 500 pièces financées à crédit. Mais à l’arrivée, 20 % sont défectueuses, 
                                les frais de douane explosent et sa marge s’effondre.<br/> 

                                Échec cuisant ? Oui. Mais Mamadou ne baisse pas les bras. Il apprend à demander des échantillons, à négocier les MOQ, à contrôler la qualité avant expédition, et à tester la demande par de petites préventes. Deux ans plus tard, il relance avec un lot réduit dans une niche précise. Résultat : 
                                une activité viable et en croissance.<br/>

                                <strong>Moralité :</strong> ce qui tue une entreprise n’est pas l’échec en soi, 
                                mais l’incapacité à apprendre de ses erreurs.<br/>
                            </p>

                            <h2>L’intelligence financière : indispensable même si vous n’êtes pas entrepreneur</h2>
                            <p>
                                La vérité est simple : même si vous ne créez jamais d’entreprise, vous avez besoin de l’intelligence financière pour survivre et avancer.
                            </p>

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

export default ArticleThree;