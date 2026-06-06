import React, { useState, useEffect, useMemo } from "react";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import axios from "axios";
import Header from "../components/Header";
import Footer from "../components/Footer";
import BuyProduct from "./BuyProduct";
import { useCart } from '../context/CartContext';
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaTimes, FaSpinner, FaSearch, FaShoppingCart,
  FaUserCircle, FaFilter, FaSortAmountDown,
  FaHeart, FaEye, FaTag, FaCheckCircle,
  FaChevronLeft, FaChevronRight
} from 'react-icons/fa';
import { toast } from 'react-toastify';

import API_BASE_URL from '../apiConfig';
const API_BASE = API_BASE_URL;
const PAGE_SIZE = 12;

/* ── Helpers ─────────────────────────────────────── */
const getImgUrl = (img) => {
  if (!img) return '';
  if (img.startsWith('http') || img.startsWith('data:')) return img;
  return `${API_BASE}/images/${img}`;
};

const fmtPrice = (p) =>
  typeof p === 'number' ? p.toLocaleString('fr-FR') : p;

const StarRating = ({ value = 0, count }) => {
  if (value === 0) return null;
  const stars = [1, 2, 3, 4, 5].map(i => {
    if (i <= Math.floor(value)) return 'full';
    if (i - value < 1 && value % 1 >= 0.5) return 'half';
    return 'empty';
  });
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s, i) =>
        s === 'full' ? <FaStar key={i} size={10} className="text-yellow-400" /> :
          s === 'half' ? <FaStarHalfAlt key={i} size={10} className="text-yellow-400" /> :
            <FaRegStar key={i} size={10} className="text-gray-300" />
      )}
      {count != null && count > 0 && <span className="text-[10px] text-gray-400 ml-1.5">({count})</span>}
    </div>
  );
};

const SORT_OPTIONS = [
  { value: 'default', label: 'Mise en avant' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'A → Z' },
  { value: 'rating', label: 'Mieux notés' },
];

/* ── Component ───────────────────────────────────── */
const Ecom = () => {
  const navigate = useNavigate();
  const { cart, addToCart, getCartCount } = useCart();
  const [showModal, setShowModal] = useState(false);
  const [productDetail, setProductDetail] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [addedId, setAddedId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(null);

  const location = useLocation();
  const query = new URLSearchParams(location.search).get('q');

  useEffect(() => {
    setLoading(true);
    setPage(1);
    const url = query
      ? `${API_BASE}/api/products/search?q=${encodeURIComponent(query)}`
      : `${API_BASE}/api/products`;
    axios.get(url)
      .then(r => {
        console.log('Produits reçus:', r.data);
        setProducts(r.data);
      })
      .catch(err => {
        console.error(err);
        toast.error("Impossible de charger les produits. Vérifiez votre connexion.");
      })
      .finally(() => setLoading(false));
  }, [query]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))];
    return ['Tous', ...cats];
  }, [products]);

  const maxPrice = useMemo(() => Math.max(...products.map(p => Number(p.price) || 0)), [products]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'Tous' ? products : products.filter(p => p.category === activeCategory);
    if (priceMax) list = list.filter(p => Number(p.price) <= priceMax);
    if (sortBy === 'price_asc') list = [...list].sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => b.price - a.price);
    if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 5) - (a.rating || 5));
    return list;
  }, [products, activeCategory, sortBy, priceMax]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const displayed = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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

  const openProduct = (p) => { setProductDetail(p); setShowModal(true); };

  const isMaintenance = false; // Maintenance terminée — boutique opérationnelle

  if (isMaintenance) {
    return (
      <div className="bg-gray-50 min-h-screen font-sans flex flex-col justify-between">
        <div>
          <Header />
          <main className="max-w-4xl mx-auto px-6 py-20">
            <div className="bg-white rounded-3xl p-8 md:p-12 border border-gray-100 shadow-[0_15px_50px_rgba(0,0,0,0.05)] text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-yellow-400/10 border border-yellow-400/20 rounded-2xl flex items-center justify-center mx-auto mb-8">
                <FaSpinner size={32} className="text-yellow-500 animate-spin" />
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-4">
                Marketplace en Maintenance
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                Notre espace Marketplace est actuellement en cours de maintenance technique pour améliorer votre expérience d'achat. L'accès au catalogue et la validation des paniers seront rétablis très prochainement.
              </p>
              <div className="bg-gray-50 rounded-2xl p-6 mb-8 text-left space-y-3">
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-wider">
                  Besoin d'importer un produit ?
                </p>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Notre service de sourcing personnalisé reste 100% opérationnel. Vous pouvez soumettre une demande gratuite depuis la page d'accueil.
                </p>
                <button
                  onClick={() => navigate('/')}
                  className="inline-flex items-center gap-2 text-xs font-black text-yellow-600 hover:text-yellow-700 transition-colors"
                >
                  Retourner à l'accueil pour faire une demande →
                </button>
              </div>
              <p className="text-xs text-gray-400 font-medium">
                Merci de votre patience ! Pour toute assistance :<br />
                <span className="font-bold text-gray-600">contact@dangoimport.com</span> ou par WhatsApp au <span className="font-bold text-gray-600">+229 01 58 26 63 42</span> / <span className="font-bold text-gray-600">+229 01 59 38 71 80</span>
              </p>
            </div>
          </main>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      <Header />

      {/* ── Sticky bar ─────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[80px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-semibold text-gray-900 leading-none">
              {query ? `Résultats pour "${query}"` : "Toute la boutique"}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              <span className="font-semibold text-gray-700">{filtered.length}</span> produit{filtered.length > 1 ? 's' : ''}
              {activeCategory !== 'Tous' && <> · <span className="text-yellow-600 font-semibold">{activeCategory}</span></>}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <FaSortAmountDown className="text-gray-400 text-xs" />
            <select
              value={sortBy}
              onChange={e => { setSortBy(e.target.value); setPage(1); }}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-yellow-400 cursor-pointer"
            >
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
      </div>



      {/* ── Mobile Category Pills ─────────────────── */}
      {categories.length > 2 && (
        <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-3 overflow-x-auto">
          <div className="flex gap-2 w-max">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setPage(1); }}
                className={`shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${activeCategory === cat
                  ? "bg-yellow-400 text-gray-900"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}


      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-16 py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ──────────────────────────── */}
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
                    className={`text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${activeCategory === cat
                      ? 'bg-yellow-400 text-gray-900 shadow-md shadow-yellow-400/25'
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

            {/* Price Filter */}
            {maxPrice > 0 && (
              <div>
                <p className="text-[10px] font-semibold text-gray-400 tracking-[0.2em] flex items-center gap-1.5 mb-3">
                  <FaTag size={8} /> Budget max
                </p>
                <div className="bg-white rounded-lg p-5 border border-gray-100 space-y-4">
                  <input
                    type="range"
                    min={0}
                    max={maxPrice}
                    step={500}
                    value={priceMax ?? maxPrice}
                    onChange={e => { setPriceMax(Number(e.target.value)); setPage(1); }}
                    className="w-full accent-yellow-400"
                  />
                  <div className="flex justify-between text-xs font-semibold text-gray-500">
                    <span>0</span>
                    <span className="text-yellow-600 font-semibold">{fmtPrice(priceMax ?? maxPrice)} F</span>
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

            {/* Wishlist */}
            {wishlist.length > 0 && (
              <div className="bg-red-50 rounded-2xl p-4 border border-red-100">
                <p className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
                  <FaHeart size={8} /> Liste de souhaits
                </p>
                <p className="text-sm font-black text-red-600">{wishlist.length} article{wishlist.length > 1 ? 's' : ''}</p>
              </div>
            )}
          </aside>

          {/* ── Grid ─────────────────────────────── */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 gap-6">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full border-4 border-gray-100 border-t-yellow-400 animate-spin" />
                  <FaShoppingCart className="absolute inset-0 m-auto text-yellow-400 text-lg" />
                </div>
                <p className="text-gray-400 font-semibold text-[10px]">Chargement du catalogue...</p>
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-32 max-w-md mx-auto">
                <div className="bg-white w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-8 text-gray-200 shadow">
                  <FaSearch size={36} />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-3">Aucun résultat</h3>
                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                  {query ? `Rien trouvé pour "${query}".` : "Aucun produit pour ces critères."}
                </p>
                <button
                  onClick={() => { setActiveCategory('Tous'); setPriceMax(null); navigate('/shopping'); }}
                  className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-2 rounded-lg font-semibold transition-all text-sm shadow"
                >
                  Voir toute la boutique
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
                  {displayed.map(p => (
                    <div
                      key={p._id}
                      onClick={() => openProduct(p)}
                      className="bg-white rounded-lg overflow-hidden border border-gray-100 shadow hover:shadow-md transition-all duration-200 flex flex-col group cursor-pointer relative"
                    >
                      {/* Image */}
                      <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6 relative overflow-hidden">
                        <img
                          src={getImgUrl(p.image)}
                          alt={p.name}
                          className="max-w-[85%] max-h-[85%] object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply"
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
                          <button
                            onClick={e => { e.stopPropagation(); openProduct(p); }}
                            className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow text-gray-700 hover:text-yellow-500 transition-colors"
                            title="Voir le détail"
                          >
                            <FaEye size={14} />
                          </button>
                        </div>
                        {/* Category badge */}
                        {p.category && (
                          <span className="absolute top-3 left-3 bg-gray-900/75 text-white text-[9px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
                            {p.category}
                          </span>
                        )}
                        {/* Parameters badge */}
                        {p.parameters && p.parameters.length > 0 && (
                          <span className="absolute top-10 left-3 bg-purple-600/85 text-white text-[9px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                            ⚙️ {p.parameters.length}
                          </span>
                        )}
                        {/* Wishlist */}
                        <button
                          onClick={e => toggleWishlist(e, p._id)}
                          className="absolute top-3 right-3 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow transition-transform hover:scale-105"
                        >
                          <FaHeart size={12} className={wishlist.includes(p._id) ? 'text-red-500' : 'text-gray-300'} />
                        </button>
                      </div>

                      {/* Info */}
                      <div className="p-5 flex flex-col gap-3 flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-yellow-600 transition-colors">
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

                        {/* Paramètres du produit */}
                        {p.parameters && p.parameters.length > 0 && (
                          <div className="text-[9px] space-y-1 py-2 border-y border-gray-100">
                            {p.parameters.slice(0, 2).map((param) => (
                              <div key={param.name} className="flex items-center gap-1.5">
                                <span className="font-semibold text-gray-600">{param.name}:</span>
                                <span className="text-gray-400">
                                  {param.options?.slice(0, 3).map(opt => opt.value).join(', ')}
                                  {param.options?.length > 3 && '...'}
                                </span>
                              </div>
                            ))}
                            {p.parameters.length > 2 && (
                              <div className="text-gray-400 italic">+{p.parameters.length - 2} autre(s)</div>
                            )}
                          </div>
                        )}

                        <div className="mt-auto pt-4 border-t border-gray-50">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-xl font-semibold text-gray-900">{fmtPrice(p.price)}</span>
                            <span className="text-xs text-gray-400">FCFA</span>
                          </div>
                          <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1 mb-3">
                            <FaCheckCircle size={9} className="text-yellow-400" /> Livraison calculée à l'achat
                          </p>
                          {cart.some(item => item._id === p._id) ? (
                            <button
                              onClick={e => { e.stopPropagation(); navigate('/cart'); }}
                              className="w-full py-2 rounded-lg text-xs font-semibold tracking-wide bg-emerald-100 text-emerald-700 border border-emerald-200 hover:bg-emerald-200 transition-all flex items-center justify-center gap-2"
                            >
                              <FaCheckCircle size={10} />
                              Déjà au panier
                            </button>
                          ) : (
                            <button
                              onClick={e => handleAddToCart(e, p)}
                              className={`w-full py-2 rounded-lg text-xs font-semibold tracking-wide transition-all flex items-center justify-center gap-2 active:scale-95 ${addedId === p._id
                                ? 'bg-emerald-500 text-white shadow-md'
                                : 'bg-yellow-400 hover:bg-yellow-300 text-gray-900'
                                }`}
                            >
                              <FaShoppingCart size={10} />
                              {addedId === p._id ? '✓ Ajouté au panier' : 'Ajouter au panier'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex items-center justify-center gap-2">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-yellow-400 hover:text-yellow-500 transition-all"
                    >
                      <FaChevronLeft size={12} />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                      <button
                        key={n}
                        onClick={() => setPage(n)}
                        className={`w-10 h-10 rounded-lg text-sm font-semibold transition-all ${n === page
                          ? 'bg-yellow-400 text-gray-900'
                          : 'bg-white border border-gray-200 text-gray-500 hover:border-yellow-400'
                          }`}
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-yellow-400 hover:text-yellow-500 transition-all"
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

      {/* ── Product Modal ─────────────────────────── */}
      {showModal && productDetail && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto relative shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 z-50 bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 p-2.5 rounded-full transition-colors"
            >
              <FaTimes size={16} />
            </button>
            <BuyProduct
              image={getImgUrl(productDetail.image)}
              name={productDetail.name}
              price={productDetail.price}
              vendorName={productDetail.vendorName}
              parameters={productDetail.parameters || []}
              isVisibled={setShowModal}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Ecom;
