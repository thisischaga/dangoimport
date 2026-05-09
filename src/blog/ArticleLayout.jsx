import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import {
  FaArrowLeft, FaClock, FaTag, FaFacebook,
  FaTwitter, FaWhatsapp, FaArrowUp
} from "react-icons/fa";

/**
 * ArticleLayout — Layout réutilisable pour tous les articles du blog.
 * Props :
 *  - title       : titre de l'article
 *  - category    : ex. "Finance"
 *  - readTime    : ex. "8 min"
 *  - date        : ex. "1er mai 2026"
 *  - heroImage   : import de l'image (optionnel)
 *  - children    : contenu de l'article (JSX)
 *  - relatedArticles : [{ title, slug, img, category }] (optionnel)
 */
export default function ArticleLayout({
  title,
  category = "Article",
  readTime = "5 min",
  date,
  heroImage,
  children,
  relatedArticles = [],
}) {
  const [showTop, setShowTop] = useState(false);
  const [progress, setProgress] = useState(0);
  const url = window.location.href;

  const CATEGORY_COLOR = {
    Finance:        "bg-blue-100 text-blue-700",
    Épargne:        "bg-emerald-100 text-emerald-700",
    Entrepreneuriat:"bg-violet-100 text-violet-700",
  };

  useEffect(() => {
    const onScroll = () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (scrolled / total) * 100 : 0);
      setShowTop(scrolled > 500);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Reading progress bar */}
      <div
        className="fixed top-0 left-0 h-1 bg-yellow-400 z-[200] transition-all"
        style={{ width: `${progress}%` }}
      />

      <Header />

      {/* ── Hero ────────────────────────────────── */}
      {heroImage ? (
        <div className="relative h-[50vh] min-h-[360px] overflow-hidden">
          <img src={heroImage} alt={title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 xl:px-20 pb-10 max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-600'}`}>
                {category}
              </span>
              <span className="text-gray-300 text-xs flex items-center gap-1">
                <FaClock size={10} /> {readTime} de lecture
              </span>
              {date && <span className="text-gray-400 text-xs">{date}</span>}
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-white leading-tight">
              {title}
            </h1>
          </div>
        </div>
      ) : (
        <section className="bg-gradient-to-br from-slate-900 to-gray-800 py-20 px-6 xl:px-20">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider ${CATEGORY_COLOR[category] ?? 'bg-gray-100 text-gray-700'}`}>
                {category}
              </span>
              <span className="text-gray-400 text-xs flex items-center gap-1">
                <FaClock size={10} /> {readTime} de lecture
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight">{title}</h1>
          </div>
        </section>
      )}

      {/* ── Body ────────────────────────────────── */}
      <main className="max-w-4xl mx-auto px-6 xl:px-0 py-14">

        {/* Back link */}
        <Link
          to="/blog/articles"
          className="inline-flex items-center gap-2 text-xs font-black text-gray-400 hover:text-yellow-600 uppercase tracking-widest mb-10 transition-colors"
        >
          <FaArrowLeft size={10} /> Retour au blog
        </Link>

        {/* Article content */}
        <article className="
          prose prose-lg prose-gray max-w-none
          prose-headings:font-black prose-headings:text-gray-900 prose-headings:tracking-tight
          prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:border-l-4 prose-h2:border-yellow-400 prose-h2:pl-4
          prose-p:leading-relaxed prose-p:text-gray-600
          prose-li:text-gray-600 prose-li:leading-relaxed
          prose-strong:text-gray-900
        ">
          {children}
        </article>

        {/* Share */}
        <div className="mt-14 pt-8 border-t border-gray-100">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">Partager cet article</p>
          <div className="flex items-center gap-3">
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <FaFacebook /> Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <FaTwitter /> Twitter
            </a>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`}
              target="_blank" rel="noreferrer"
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              <FaWhatsapp /> WhatsApp
            </a>
          </div>
        </div>
      </main>

      {/* ── Related Articles ──────────────────── */}
      {relatedArticles.length > 0 && (
        <section className="bg-gray-50 py-16 px-6 xl:px-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-xl font-black text-gray-900 mb-8">Articles similaires</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedArticles.map((r, i) => (
                <Link
                  key={i}
                  to={r.slug}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden group flex flex-col"
                >
                  {r.img && (
                    <div className="h-44 overflow-hidden">
                      <img src={r.img} alt={r.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5 flex flex-col gap-2">
                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider self-start ${CATEGORY_COLOR[r.category] ?? 'bg-gray-100 text-gray-600'}`}>
                      {r.category}
                    </span>
                    <h3 className="font-black text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-yellow-600 transition-colors">
                      {r.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />

      {/* Scroll to top */}
      {showTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-yellow-400 hover:bg-yellow-300 text-gray-900 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        >
          <FaArrowUp size={14} />
        </button>
      )}
    </div>
  );
}
