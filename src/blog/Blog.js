import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import financePerso from "../images/financePerso.jpg";
import epargne from "../images/epargne.jpg";
import articleThree from "../images/article3.jpeg";
import articleFive from "../images/article5.jpeg";
import { FaClock, FaTag, FaArrowRight } from "react-icons/fa";

const ARTICLES = [
  {
    slug: "/blog/finance-personnelle",
    img: financePerso,
    category: "Finance",
    readTime: "8 min",
    title: "Les principes fondamentaux de la finance personnelle",
    excerpt: "Gérer son argent au quotidien n'est pas réservé aux experts. Découvrez les bases pour atteindre la stabilité financière, épargner intelligemment et investir dès aujourd'hui.",
  },
  {
    slug: "/blog/epargne",
    img: epargne,
    category: "Épargne",
    readTime: "6 min",
    title: "L'Épargne : Comment protéger et faire croître votre argent",
    excerpt: "L'épargne est le socle de toute liberté financière. Découvrez les meilleures stratégies pour mettre de l'argent de côté et le faire fructifier efficacement.",
  },
  {
    slug: "/blog/entreprendre",
    img: articleThree,
    category: "Entrepreneuriat",
    readTime: "7 min",
    title: "L'entrepreneuriat : rêve de liberté ou véritable école de survie ?",
    excerpt: "Entreprendre, c'est choisir l'incertitude contre la sécurité. Mais c'est aussi la voie vers une vie construite selon ses propres règles. On vous dit tout.",
  },
  {
    slug: "/blog/la prise de risque en entreprenneuriat",
    img: articleFive,
    category: "Entrepreneuriat",
    readTime: "5 min",
    title: "La prise de risque en entrepreneuriat : l'art de miser sans se perdre",
    excerpt: "Risquer n'est pas jouer. Les entrepreneurs qui réussissent ne fuient pas le risque — ils le calculent, le maîtrisent et en font leur allié.",
  },
];

const CATEGORY_COLORS = {
  Finance:        "bg-blue-100 text-blue-700",
  Épargne:        "bg-emerald-100 text-emerald-700",
  Entrepreneuriat:"bg-violet-100 text-violet-700",
};

export default function Blog() {
  const [featured, ...rest] = ARTICLES;

  return (
    <div className="bg-white min-h-screen font-sans">
      <Header />

      {/* ── Hero ─────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 to-gray-800 py-20 px-6 xl:px-20">
        <div className="max-w-6xl mx-auto">
          <span className="text-yellow-400 text-xs font-black uppercase tracking-[0.3em] block mb-3">Le Magazine Dango</span>
          <h1 className="text-4xl md:text-5xl font-black text-white leading-tight max-w-2xl">
            Finance, Épargne & Entrepreneuriat
          </h1>
          <p className="text-gray-400 mt-4 text-base max-w-xl leading-relaxed">
            Des articles concrets pour vous aider à mieux gérer votre argent et développer vos projets en Afrique de l'Ouest.
          </p>
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 xl:px-20 py-16 space-y-16">

        {/* ── Featured Article ──────────────────── */}
        <Link to={featured.slug} className="group block">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 shadow-lg hover:shadow-2xl transition-all duration-300">
            <div className="h-64 lg:h-auto overflow-hidden">
              <img
                src={featured.img}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="bg-white p-8 lg:p-12 flex flex-col justify-center gap-4">
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${CATEGORY_COLORS[featured.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {featured.category}
                </span>
                <span className="text-xs text-gray-400 flex items-center gap-1"><FaClock size={10} /> {featured.readTime} de lecture</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight group-hover:text-yellow-600 transition-colors">
                {featured.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed">{featured.excerpt}</p>
              <span className="inline-flex items-center gap-2 text-yellow-600 font-black text-sm mt-2 group-hover:gap-3 transition-all">
                Lire l'article <FaArrowRight size={12} />
              </span>
            </div>
          </div>
        </Link>

        {/* ── Article Grid ──────────────────────── */}
        <div>
          <h2 className="text-xl font-black text-gray-900 mb-8">Tous les articles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {rest.map((a, i) => (
              <Link
                key={i}
                to={a.slug}
                className="group bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={a.img}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col gap-3 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider ${CATEGORY_COLORS[a.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {a.category}
                    </span>
                    <span className="text-[11px] text-gray-400 flex items-center gap-1"><FaClock size={9} /> {a.readTime}</span>
                  </div>
                  <h3 className="font-black text-gray-900 leading-snug line-clamp-2 group-hover:text-yellow-600 transition-colors">
                    {a.title}
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 flex-1">{a.excerpt}</p>
                  <span className="inline-flex items-center gap-1.5 text-yellow-600 font-black text-xs mt-auto group-hover:gap-2.5 transition-all">
                    Lire <FaArrowRight size={10} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
