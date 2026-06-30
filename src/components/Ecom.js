import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import Header from "../components/Header";
import { useProductsCatalog } from '../hooks/useProducts';
import Footer from "../components/Footer";
import { useCart } from '../context/CartContext';
import {
  FaStar, FaStarHalfAlt, FaRegStar,
  FaSearch, FaShoppingCart,
  FaUserCircle, FaFilter, FaSortAmountDown,
  FaHeart, FaEye, FaTag, FaCheckCircle,
  FaChevronLeft, FaChevronRight, FaFire, FaMedal, FaClock,
  FaShieldAlt, FaTruck, FaTimes, FaBolt, FaPercent,
} from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getProductImage } from '../utils/imageUrl';

const PAGE_SIZE = 16;

const SORT_OPTIONS = [
  { value: 'default', label: 'Mise en avant' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'A → Z' },
  { value: 'rating', label: 'Mieux notés' },
];

const QUICK_FILTERS = [
  { id: 'all', label: 'Tous', icon: FaTag },
  { id: 'featured', label: 'Vedettes', icon: FaFire },
  { id: 'new', label: 'Nouveautés', icon: FaClock },
  { id: 'bestseller', label: 'Top ventes', icon: FaMedal },
  { id: 'promo', label: 'Promos', icon: FaPercent },
];

const TRUST_BADGES = [
  { icon: FaShieldAlt, text: 'Paiement sécurisé' },
  { icon: FaTruck, text: 'Livraison 24h' },
  { icon: FaBolt, text: 'Vendeurs vérifiés' },
];

const getPrice = (p) => Number(p?.salePrice ?? p?.price ?? 0);
const fmtPrice = (n) => Number(n).toLocaleString('fr-FR');

const StarRating = ({ value = 0, count }) => {
  if (!value) return null;
  const stars = [1, 2, 3, 4, 5].map((i) =>
    i <= Math.floor(value) ? 'full' : (i - value < 1 && value % 1 >= 0.5) ? 'half' : 'empty'
  );
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s, i) =>
        s === 'full' ? <FaStar key={i} size={9} className="text-[#ffdc2b]" /> :
        s === 'half' ? <FaStarHalfAlt key={i} size={9} className="text-[#ffdc2b]" /> :
        <FaRegStar key={i} size={9} className="text-gray-200" />
      )}
      {count > 0 && <span className="text-[9px] text-gray-400 ml-0.5">({count})</span>}
    </div>
  );
};

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="aspect-square skeleton" />
      <div className="p-3 space-y-2">
        <div className="skeleton h-3 rounded w-3/4" />
        <div className="skeleton h-4 rounded w-1/2" />
        <div className="skeleton h-8 rounded-lg w-full" />
      </div>
    </div>
  );
}

function MarketplaceCard({ product, inCart, isWished, justAdded, onOpen, onGoCart, onAddCart, onToggleWish }) {
  const img = getProductImage(product);
  const hasPromo = product.salePrice > 0 && product.salePrice < product.price;
  const price = hasPromo ? product.salePrice : getPrice(product);

  return (
    <div
      onClick={onOpen}
      className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col group cursor-pointer transition-all hover:shadow-sm"
    >
      <div className="aspect-square product-img-container flex items-center justify-center p-3 relative overflow-hidden">
        {img ? (
          <img src={img} alt={product.name} className="product-img max-w-full max-h-full object-contain" loading="lazy" />
        ) : (
          <FaTag className="text-gray-200 text-3xl" />
        )}

        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
          <span className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md text-gray-700">
            <FaEye size={12} />
          </span>
        </div>

        {product.isFeatured && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#ffdc2b] text-white z-10">Top</span>
        )}
        {product.isNewArrival && !product.isFeatured && (
          <span className="absolute top-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#2563EB] text-white z-10">Nouveau</span>
        )}
        {hasPromo && (
          <span className="absolute bottom-2 left-2 text-[10px] font-bold px-1.5 py-0.5 bg-[#ffdc2b] text-white z-10 flex items-center gap-1">
            <FaFire size={9} /> Promo
          </span>
        )}

        <button
          type="button"
          onClick={onToggleWish}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            isWished ? 'bg-transparent text-[#ffdc2b]' : 'bg-transparent text-gray-300 hover:text-[#ffdc2b]'
          }`}
        >
          <FaHeart size={16} />
        </button>
      </div>

      <div className="p-3 flex flex-col flex-1">
        {product.category && (
          <p className="text-[10px] text-[#565959] dark:text-gray-400 mb-0.5 line-clamp-1">{product.category}</p>
        )}
        <h3 className="text-[13px] sm:text-[14px] text-[#000000] dark:text-gray-100 line-clamp-2 min-h-[2.25rem] group-hover:text-[#1D4ED8] dark:group-hover:text-blue-400 leading-snug">
          {product.name}
        </h3>

        <div className="mt-1 flex items-center gap-1 text-[12px]">
          <div className="flex text-[#FFA41C]">
            {[...Array(5)].map((_, i) => (
              <FaStar key={i} className={i < Math.floor(product.rating || 0) ? "text-[#FFA41C]" : "text-gray-300"} />
            ))}
          </div>
          {(product.totalReviews || 0) > 0 && (
            <span className="text-[#2563EB] hover:text-[#1D4ED8] hover:underline">{product.totalReviews}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-[10px] text-[#565959] mt-1">
          <FaUserCircle size={10} />
          <span className="line-clamp-1">
            {product.vendorName || 'Vendeur'}
          </span>
        </div>

        <div className="mt-auto pt-2">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-[17px] sm:text-[21px] font-medium text-[#B12704]">{fmtPrice(price)}</span>
            <span className="text-[12px] text-[#B12704]">FCFA</span>
          </div>
          {hasPromo && (
            <span className="text-[11px] text-[#565959] line-through flex items-center gap-1">
              Prix conseillé: {fmtPrice(product.price)} FCFA
            </span>
          )}

          {inCart ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onGoCart(); }}
              className="mt-3 w-full py-1.5 rounded-full text-[12px] text-[#000000] bg-[#ffdc2b] hover:bg-[#e6c627] border border-[#e6c627] shadow-sm"
            >
              Aller au panier
            </button>
          ) : (
            <button
              type="button"
              onClick={onAddCart}
              className={`mt-3 w-full py-1.5 rounded-full text-[12px] flex items-center justify-center gap-1.5 shadow-sm ${
                justAdded ? 'bg-green-600 text-white border border-green-600' : 'bg-[#ffdc2b] hover:bg-[#ffdc2b] text-[#000000] border border-[#ffdc2b]'
              }`}
            >
              {justAdded ? '✓ Ajouté au panier' : 'Ajouter au panier'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const Ecom = () => {
  const navigate = useNavigate();
  const { cart, addToCart } = useCart();
  const location = useLocation();

  const [sortBy, setSortBy] = useState('default');
  const [activeCategory, setActiveCategory] = useState('Tous');
  const [quickFilter, setQuickFilter] = useState('all');
  const [addedId, setAddedId] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [page, setPage] = useState(1);
  const [priceMax, setPriceMax] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const searchParams = new URLSearchParams(location.search);
  const query = searchParams.get('q');
  const categoryFromUrl = searchParams.get('category');
  const { data: products = [], isLoading: loading, isError } = useProductsCatalog({ search: query });

  useEffect(() => {
    setPage(1);
  }, [query, categoryFromUrl, quickFilter, activeCategory, sortBy, priceMax]);

  useEffect(() => {
    if (categoryFromUrl) setActiveCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  useEffect(() => {
    if (isError) toast.error('Impossible de charger les produits.');
  }, [isError]);

  const categories = useMemo(() => {
    const cats = [...new Set(products.map((p) => p.category).filter(Boolean))];
    return ['Tous', ...cats];
  }, [products]);

  const maxPrice = useMemo(() => Math.max(0, ...products.map(getPrice)), [products]);

  const filtered = useMemo(() => {
    let list = activeCategory === 'Tous' ? products : products.filter((p) => p.category === activeCategory);

    if (quickFilter === 'featured') list = list.filter((p) => p.isFeatured);
    if (quickFilter === 'new') list = list.filter((p) => p.isNewArrival);
    if (quickFilter === 'bestseller') list = list.filter((p) => p.isBestSeller);
    if (quickFilter === 'promo') list = list.filter((p) => p.salePrice > 0 && p.salePrice < p.price);

    if (priceMax) list = list.filter((p) => getPrice(p) <= priceMax);

    if (sortBy === 'price_asc') list = [...list].sort((a, b) => getPrice(a) - getPrice(b));
    if (sortBy === 'price_desc') list = [...list].sort((a, b) => getPrice(b) - getPrice(a));
    if (sortBy === 'name_asc') list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'rating') list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sortBy === 'default') {
      list = [...list].sort((a, b) => {
        const score = (p) => (p.isFeatured ? 4 : 0) + (p.isBestSeller ? 2 : 0) + (p.isNewArrival ? 1 : 0);
        return score(b) - score(a);
      });
    }

    return list;
  }, [products, activeCategory, quickFilter, sortBy, priceMax]);

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
    setWishlist((w) => (w.includes(id) ? w.filter((x) => x !== id) : [...w, id]));
  };

  const resetFilters = () => {
    setActiveCategory('Tous');
    setQuickFilter('all');
    setPriceMax(null);
    setSortBy('default');
    setPage(1);
    navigate('/shopping');
  };

  const setCategory = (cat) => {
    setActiveCategory(cat);
    setPage(1);
    const params = new URLSearchParams(location.search);
    if (cat === 'Tous') params.delete('category');
    else params.set('category', cat);
    const qs = params.toString();
    navigate(`/shopping${qs ? `?${qs}` : ''}`, { replace: true });
  };

  return (
    <div className="bg-[#f5f5f5] dark:bg-[#0f1115] min-h-screen font-sans">
      <Header />



      {/* Toolbar */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-[var(--header-offset,104px)] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
                {query ? `« ${query} »` : 'Marketplace'}
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {activeCategory !== 'Tous' && <span className="text-[#c9a800] font-bold">{activeCategory} · </span>}
                Achetez auprès de vendeurs locaux vérifiés
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-xs font-bold text-gray-700"
              >
                <FaFilter size={11} /> Filtres
              </button>
              <div className="flex items-center gap-2">
                <FaSortAmountDown className="text-gray-400 hidden sm:block" size={12} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#ffdc2b] cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="home-hide-scrollbar flex gap-2 overflow-x-auto pb-0.5">
            {QUICK_FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => { setQuickFilter(f.id); setPage(1); }}
                className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  quickFilter === f.id
                    ? 'bg-[#ffdc2b] text-[#2d3748] border border-[#e6c600]'
                    : 'bg-gray-100 text-gray-600 hover:bg-[#fffbeb] border border-transparent'
                }`}
              >
                <f.icon size={10} /> {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Catégories mobile */}
      <div className="lg:hidden bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-4 py-2.5 home-hide-scrollbar overflow-x-auto">
        <div className="flex gap-2 w-max">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeCategory === cat
                  ? 'bg-[#ffdc2b] text-[#2d3748]'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar */}
          <aside className={`${mobileFiltersOpen ? 'block' : 'hidden'} lg:block lg:w-56 shrink-0 space-y-5`}>
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
              <p className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <FaFilter size={9} /> Catégories
              </p>
              <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`text-left px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                      activeCategory === cat
                        ? 'bg-[#fffbeb] dark:bg-gray-800 text-[#2d3748] dark:text-white border-l-2 border-[#ffdc2b]'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    {cat}
                    <span className="text-[10px] text-gray-400 ml-1">
                      ({cat === 'Tous' ? products.length : products.filter((p) => p.category === cat).length})
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {maxPrice > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                  Budget max
                </p>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  step={500}
                  value={priceMax ?? maxPrice}
                  onChange={(e) => setPriceMax(Number(e.target.value))}
                  className="w-full accent-[#ffdc2b]"
                />
                <div className="flex justify-between text-xs font-semibold text-gray-500 mt-2">
                  <span>0 F</span>
                  <span className="text-[#c9a800]">{fmtPrice(priceMax ?? maxPrice)} F</span>
                </div>
                {priceMax && (
                  <button
                    type="button"
                    onClick={() => setPriceMax(null)}
                    className="mt-2 text-[10px] font-bold text-red-500 uppercase"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            )}

            {(activeCategory !== 'Tous' || quickFilter !== 'all' || priceMax || query) && (
              <button
                type="button"
                onClick={resetFilters}
                className="w-full py-2.5 rounded-lg border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-1.5"
              >
                <FaTimes size={10} /> Effacer les filtres
              </button>
            )}

            {wishlist.length > 0 && (
              <div className="bg-[#fffbeb] rounded-xl p-4 border border-[#ffdc2b]/40">
                <p className="text-[10px] font-black text-[#2d3748] uppercase flex items-center gap-1.5">
                  <FaHeart size={9} className="text-red-400" /> Favoris
                </p>
                <p className="text-sm font-black text-gray-800 mt-1">{wishlist.length} article{wishlist.length > 1 ? 's' : ''}</p>
              </div>
            )}
          </aside>

          {/* Grille produits */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : displayed.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
                <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-4 text-gray-300">
                  <FaSearch size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
                  {query ? `Aucun résultat pour « ${query} ».` : 'Essayez d\'autres filtres ou catégories.'}
                </p>
                <button type="button" onClick={resetFilters} className="btn-home px-6 py-2.5 rounded-lg text-sm font-bold">
                  Voir tout le catalogue
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                  {displayed.map((p) => (
                    <MarketplaceCard
                      key={p._id}
                      product={p}
                      inCart={cart.some((item) => item._id === p._id)}
                      isWished={wishlist.includes(p._id)}
                      justAdded={addedId === p._id}
                      onOpen={() => navigate(`/product/${p._id}`)}
                      onGoCart={() => navigate('/cart')}
                      onAddCart={(e) => handleAddToCart(e, p)}
                      onToggleWish={(e) => toggleWishlist(e, p._id)}
                    />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#ffdc2b]"
                    >
                      <FaChevronLeft size={11} />
                    </button>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let n;
                      if (totalPages <= 7) n = i + 1;
                      else if (page <= 4) n = i + 1;
                      else if (page >= totalPages - 3) n = totalPages - 6 + i;
                      else n = page - 3 + i;
                      return (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setPage(n)}
                          className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${
                            n === page
                              ? 'bg-[#ffdc2b] text-[#2d3748] border border-[#e6c600]'
                              : 'bg-white border border-gray-200 text-gray-500 hover:border-[#ffdc2b]'
                          }`}
                        >
                          {n}
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30 hover:border-[#ffdc2b]"
                    >
                      <FaChevronRight size={11} />
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
