import React from 'react';
import ArticleLayout from './ArticleLayout';
import heroImg from '../images/financePerso.jpg';
import epargneImg from '../images/epargne.jpg';
import articleThreeImg from '../images/article3.jpeg';

const RELATED = [
  { title: "L'Épargne : Comment protéger et faire croître votre argent", slug: "/blog/epargne", img: epargneImg, category: "Épargne" },
  { title: "L'entrepreneuriat : rêve de liberté ou véritable école de survie ?", slug: "/blog/entreprendre", img: articleThreeImg, category: "Entrepreneuriat" },
];

export default function PerFinance() {
  return (
    <ArticleLayout
      title="Finance personnelle : Comment mieux gérer son argent et préparer l'avenir"
      category="Finance"
      readTime="8 min"
      date="1er mai 2026"
      heroImage={heroImg}
      relatedArticles={RELATED}
    >
      <p>
        La finance personnelle est l'art de gérer son argent au quotidien. Elle ne concerne pas uniquement les grandes fortunes ou les experts en économie, mais chaque individu : étudiant, salarié, entrepreneur ou retraité. Savoir bien gérer ses revenus et ses dépenses est une compétence essentielle pour atteindre la stabilité financière, réaliser ses projets et vivre sereinement.
      </p>

      <h2>1. Qu'est-ce que la finance personnelle ?</h2>
      <p>La finance personnelle regroupe toutes les décisions financières qu'un individu prend dans sa vie quotidienne. Cela inclut :</p>
      <ul>
        <li>La gestion des revenus et des dépenses</li>
        <li>L'épargne et la constitution d'un fonds de sécurité</li>
        <li>Les investissements</li>
        <li>La préparation de la retraite</li>
        <li>L'assurance et la protection financière</li>
      </ul>
      <p>L'objectif est simple : utiliser l'argent de manière intelligente afin d'améliorer sa qualité de vie actuelle et future.</p>

      <h2>2. Pourquoi la finance personnelle est-elle importante ?</h2>
      <p>Une mauvaise gestion financière peut avoir des conséquences graves : stress, surendettement, impossibilité de réaliser ses projets. À l'inverse, une bonne gestion :</p>
      <ul>
        <li>Apporte la tranquillité d'esprit</li>
        <li>Permet de faire face aux imprévus</li>
        <li>Aide à atteindre ses objectifs (acheter une maison, financer les études, voyager, créer une entreprise)</li>
        <li>Construit une sécurité financière durable</li>
      </ul>

      <h2>3. Les piliers de la finance personnelle</h2>
      <p><strong>a- Le budget</strong><br />Établir un budget est la première étape. Il consiste à suivre ses revenus et ses dépenses pour savoir où part l'argent. Un budget réaliste permet de limiter les excès et de dégager une capacité d'épargne.</p>
      <p><strong>b- L'épargne</strong><br />Épargner, c'est mettre de côté une partie de ses revenus. L'idéal est de constituer un fonds d'urgence équivalant à 3 à 6 mois de dépenses.</p>
      <p><strong>c- L'investissement</strong><br />L'argent épargné doit ensuite être investi pour générer des revenus passifs. Les placements varient selon le profil de risque : immobilier, actions, obligations, fonds communs, crypto-monnaies, etc.</p>
      <p><strong>d- La gestion des dettes</strong><br />Avoir des dettes n'est pas forcément négatif si elles sont maîtrisées. Mais il faut éviter les crédits à la consommation avec des taux d'intérêt élevés.</p>

      <h2>4. Comment établir un budget efficace ?</h2>
      <p>La méthode la plus connue est la <strong>règle 50/30/20</strong> :</p>
      <ul>
        <li><strong>50 %</strong> des revenus pour les besoins essentiels (logement, nourriture, transport)</li>
        <li><strong>30 %</strong> pour les envies (loisirs, voyages, shopping)</li>
        <li><strong>20 %</strong> pour l'épargne et le remboursement des dettes</li>
      </ul>

      <h2>5. L'épargne : construire sa sécurité financière</h2>
      <p>L'épargne doit être régulière, même si elle est petite. Mieux vaut commencer avec 5 000 FCFA par mois que de ne rien mettre de côté. Quelques conseils pratiques :</p>
      <ul>
        <li>Mettre en place un virement automatique vers un compte épargne</li>
        <li>Épargner en priorité (se payer soi-même d'abord)</li>
        <li>Avoir plusieurs enveloppes : fonds d'urgence, projets court terme, projets long terme</li>
      </ul>

      <h2>6. L'investissement : faire travailler son argent</h2>
      <p>Une fois le fonds d'urgence constitué, il faut investir. Les options les plus courantes :</p>
      <ul>
        <li><strong>Immobilier :</strong> acheter un bien pour le louer</li>
        <li><strong>Bourse :</strong> investir dans des actions, obligations, ETF</li>
        <li><strong>Épargne retraite :</strong> préparer sa pension</li>
        <li><strong>Crypto-monnaies :</strong> un marché risqué mais avec un fort potentiel</li>
        <li><strong>Entrepreneuriat :</strong> investir dans sa propre activité</li>
      </ul>
      <p>Le secret est de <strong>diversifier</strong> pour limiter les risques.</p>

      <h2>7. Les erreurs à éviter</h2>
      <ul>
        <li>Ne pas avoir de budget</li>
        <li>Vivre au-dessus de ses moyens</li>
        <li>Ne pas épargner dès le premier salaire</li>
        <li>S'endetter pour des biens de consommation</li>
        <li>Investir sans se former</li>
        <li>Dépendre d'une seule source de revenus</li>
      </ul>

      <p>La finance personnelle est une discipline qui demande rigueur, patience et vision. Bien gérer son argent ne signifie pas se priver, mais mettre ses ressources au service de ses objectifs. Il n'est jamais trop tard pour commencer — que tu sois étudiant, salarié ou entrepreneur, les principes s'appliquent à tous. <strong>L'essentiel est de passer à l'action dès aujourd'hui.</strong></p>
    </ArticleLayout>
  );
}