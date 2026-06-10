import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from '../context/CartContext';
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaTimes, FaSearch, FaShoppingCart,
  FaUserCircle, FaFilter, FaSortAmountDown,
  FaHeart, FaEye, FaTag, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaFire, FaBolt
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import API_BASE_URL from '../apiConfig';

const API_BASE  = API_BASE_URL;
const PAGE_SIZE = 12;

/* ── Helpers ─────────────────────────────── */
const getImgUrl = (img) => {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http') || trimmed.startsWith('data:')) return trimmed;
  return `${API_BASE}/images/${trimmed}`;
};

const getProductImg = (p) => {
  if (p?.images?.length) return getImgUrl(p.images[0]?.url || p.images[0]);
  return getImgUrl(p?.image);
};
const getPrice = (p) => Number(p?.salePrice ?? p?.price ?? 0);
const fmtPrice = (p) => typeof p === 'number' ? p.toLocaleString('fr-FR') : p;

const StarRating = ({ value = 0, count }) => {
  if (value === 0) return null;
  const stars = [1,2,3,4,5].map(i =>
    i <= Math.floor(value) ? 'full' : (i - value < 1 && value % 1 >= 0.5) ? 'half' : 'empty'
  );
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s, i) =>
        s === 'full' ? <FaStar key={i} size={10} className="text-[#ffdc2b]" /> :
        s === 'half' ? <FaStarHalfAlt key={i} size={10} className="text-[#ffdc2b]" /> :
        <FaRegStar key={i} size={10} className="text-gray-200" />
      )}
      {count != null && count > 0 && (
        <span className="text-[10px] text-gray-400 ml-1">({count})</span>
      )}
    </div>
  );
};

const SORT_OPTIONS = [
  { value: 'default',    label: 'Mise en avant' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc',label: 'Prix décroissant' },
  { value: 'name_asc',  label: 'A → Z' },
  { value: 'rating',    label: 'Mieux notés' },
];

/* ── Skeleton product card ───────────────── */
function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col">
      <div className="aspect-square skeleton" />
      <div className="p-5 space-y-3">
        <div className="skeleton h-4 rounded-full w-3/4" />
        <div className="skeleton h-3 rounded-full w-1/2" />
        <div className="skeleton h-8 rounded-lg w-full mt-2" />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════ */
const Ecom = () => {
  const navigate    = useNavigate();
  const { cart, addToCart } = useCart();
  const location    = useLocation();

  const [products, setProducts]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sortBy, setSortBy]             = useState('default');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [addedId, setAddedId]           = useState(null);
  const [wishlist, setWishlist]         = useState([]);
  const [page, setPage]                 = useState(1);
  const [priceMax, setPriceMax]         = useState(null);

  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const url = query
      ? `${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`
      : `${API_BASE}/api/products`;
    axios.get(url)
      .then((r) => {
        const raw = Array.isArray(r.data) ? r.data : (r.data?.data || []);
        setProducts(raw.filter((p) => p && p.isPublished !== false));
      })
      .catch(() => toast.error('Impossible de charger les produits. Vérifiez votre connexion.'))
      .finally(() => setLoading(false));
  }, [query]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['Tous', ...cats];
  }, [products]);

  const maxPrice = useMemo(() => Math.max(0, ...products.map(getPrice)), [products]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'Tous' ? products : products.filter(p => p.category === activeCategory);
    if (priceMax) list = list.filter(p => getPrice(p) <= priceMax);
    if (sortBy === 'price_asc')  list = [...list].sort((a, b) => getPrice(a) - getPrice(b));
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => getPrice(b) - getPrice(a));
    if (sortBy === 'name_asc')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'rating')     list = [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return list;
  }, [products, activeCategory, sortBy, priceMax]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleAddToCart = (e, p) => {
    e.stopPropagation();
    addToCart(p);
    setAddedId(p._id);
    setTimeout(() => setAddedId(null), 1800);
  };

  const toggleWishlist = (e, id) => {
    e.stopPropagation();
    setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);
  };

  // Determine if product is "new" (last 7 days)
  const isNew = (p) => {
    if (!p.createdAt) return false;
    const d = new Date(p.createdAt);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />

      {/* ── Sticky bar ────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[104px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-black text-gray-900 leading-none">
              {query ? `Résultats pour "${query}"` : "Toute la boutique"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-semibold text-gray-700">{filtered.length}</span> produit{filtered.length > 1 ? 's' : ''}
              {activeCategory !== 'Tous' && <> · <span className="text-[#e6c600] font-semibold">{activeCategory}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <FaSortAmountDown className="text-gray-400" size={12} />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* ── Mobile category pills ─────────────── */}
      {categories.length > 2 && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-[#2d3748] text-white shadow-md shadow-[#2d3748]/15'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ───────────────────────── */}
          <aside className="hidden lg:flex flex-col gap-6 w-52 shrink-0">
            {/* Categories */}
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-1.5 mb-3">
                <FaFilter size={8} /> Catégories
              </p>
              <div className="flex flex-col gap-1">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => { setActiveCategory(cat); setPage(1); }}
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#2d3748] text-white shadow-md shadow-[#2d3748]/15'
                        : 'text-gray-500 hover:bg-white hover:text-gray-900 hover:shadow-sm'
                    }`}
                  >
                    {cat}
                    <span className="ml-1.5 text-[10px] opacity-60">
                      ({cat === 'Tous' ? products.length : products.filter(p => p.category === cat).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Price filter */}
            {maxPrice > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] flex items-center gap-1.5 mb-3">
                  <FaTag size={8} /> Budget max
                </p>
                <div className="bg-white rounded-xl p-4 border border-gray-100 space-y-4">
                  <input
                    type="range" min={0} max={maxPrice} step={500}
                    value={priceMax ?? maxPrice}
                    onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                    className="w-full accent-[#ffdc2b]"
                  />
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>0</span>
                    <span className="text-[#e6c600]">{fmtPrice(priceMax ?? maxPrice)} F</span>
                  </div>
                  {priceMax && (
                    <button
                      onClick={() => setPriceMax(null)}
                      className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase tracking-widest"
                    >
                      Réinitialiser
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Wishlist count */}
            {wishlist.length > 0 && (
              <div className="bg-red-50 rounded-xl p-4 border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <FaHeart size={8} /> Souhaits
                </p>
                <p className="text-sm font-black text-red-600">{wishlist.length} article{wishlist.length > 1 ? 's' : ''}</p>
              </div>
            )}
          </aside>

          {/* ── Product grid ──────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-32 max-w-md mx-auto">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200 shadow-lg">
                  <FaSearch size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-3">Aucun résultat</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  {query ? `Rien trouvé pour "${query}".` : "Aucun produit pour ces critères."}
                </p>
                <button
                  onClick={() => { setActiveCategory('Tous'); setPriceMax(null); navigate('/shopping'); }}
                  className="btn-brand px-6 py-2.5 rounded-xl text-sm"
                >
                  Voir toute la boutique
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {displayed.map((p, idx) => {
                    const inCart   = cart.some(item => item._id === p._id);
                    const isWished = wishlist.includes(p._id);
                    const newProduct = isNew(p);

                    return (
                      <div
                        key={p._id}
                        onClick={() => navigate(`/product/${p._id}`)}
                        className="product-card bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer hover:-translate-y-1 animate-fade-in-up"
                        style={{ animationDelay: `${idx * 0.04}s` }}
                      >
                        {/* Image zone */}
                        <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-5 relative overflow-hidden">
                          {getProductImg(p) ? (
                            <img
                              src={getProductImg(p)}
                              alt={p.name}
                              className="product-img max-w-[85%] max-h-[85%] object-contain mix-blend-multiply"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          ) : (
                            <FaTag className="text-gray-200 text-3xl" />
                          )}

                          {/* Overlay on hover */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/8 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={e => { e.stopPropagation(); navigate(`/product/${p._id}`); }}
                              className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg text-gray-700 hover:text-[#e6c600] transition-colors"
                            >
                              <FaEye size={14} />
                            </button>
                          </div>

                          {/* Badges */}
                          {p.category && (
                            <span className="absolute top-3 left-3 bg-gray-900/70 text-white text-[9px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                              {p.category}
                            </span>
                          )}
                          {newProduct && (
                            <span className="badge-new absolute top-3 right-10">Nouveau</span>
                          )}
                          {p.salePrice > 0 && p.salePrice < p.price && (
                            <span className="absolute top-8 left-3 bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                              <FaFire size={8} /> Promo
                            </span>
                          )}

                          {/* Wishlist */}
                          <button
                            onClick={e => toggleWishlist(e, p._id)}
                            className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-all hover:scale-110 ${
                              isWished ? 'bg-red-500 text-white' : 'bg-white/90 text-gray-300 hover:text-red-400'
                            }`}
                          >
                            <FaHeart size={12} />
                          </button>
                        </div>

                        {/* Info */}
                        <div className="p-4 flex flex-col gap-2.5 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-[#e6c600] transition-colors">
                            {p.name}
                          </h3>
                          <StarRating value={p.rating ?? 5} count={p.reviews ?? 0} />
                          <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
                            <FaUserCircle className="text-gray-300" />
                            <span>Vendu par </span>
                            <Link
                              to={`/vendor/${p.vendorName}`}
                              className="text-blue-500 hover:underline font-semibold"
                              onClick={e => e.stopPropagation()}
                            >
                              {p.vendorName || 'Vendeur'}
                            </Link>
                          </div>

                          <div className="mt-auto pt-3 border-t border-gray-50">
                            <div className="flex items-baseline gap-2 mb-1">
                              {p.salePrice > 0 && p.salePrice < p.price ? (
                                <>
                                  <span className="text-lg font-black text-red-600">{fmtPrice(p.salePrice)}</span>
                                  <span className="text-xs text-gray-400 line-through">{fmtPrice(p.price)}</span>
                                  <span className="text-[10px] text-gray-400">FCFA</span>
                                </>
                              ) : (
                                <>
                                  <span className="text-lg font-black text-gray-900">{fmtPrice(getPrice(p))}</span>
                                  <span className="text-xs text-gray-400">FCFA</span>
                                </>
                              )}
                            </div>
                            <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1 mb-3">
                              <FaCheckCircle size={9} className="text-[#ffdc2b]" /> Livraison calculée à l'achat
                            </p>

                            {inCart ? (
                              <button
                                onClick={e => { e.stopPropagation(); navigate('/cart'); }}
                                className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                              >
                                <FaCheckCircle size={10} /> Déjà au panier
                              </button>
                            ) : (
                              <button
                                onClick={e => handleAddToCart(e, p)}
                                className={`w-full py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95 ${
                                  addedId === p._id
                                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                    : 'btn-brand hover:shadow-md'
                                }`}
                              >
                                <FaShoppingCart size={10} />
                                {addedId === p._id ? '✓ Ajouté !' : 'Ajouter au panier'}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#e6c600] hover:text-[#e6c600] transition-all"
                    >
                      <FaChevronLeft size={12} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                          n === page
                            ? 'bg-[#2d3748] text-white shadow-md shadow-[#2d3748]/15'
                            : 'bg-white border border-gray-200 text-gray-500 hover:border-[#e6c600]'
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#e6c600] hover:text-[#e6c600] transition-all"
                    >
                      <FaChevronRight size={12} />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Ecom;
