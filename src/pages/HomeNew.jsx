import React, { useCallback, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal, X, Heart, Plus, Star,
  LayoutGrid, List, ChevronDown, Search,
  ShoppingCart, Package, Truck, ShieldCheck,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import Header, { CATEGORY_LINKS } from '../components/Header';
import Footer from '../components/Footer';
import {
  getProductSellableStock,
  sanitizeProductForDisplay,
  isAlibabaProduct,
} from '../utils/publicProduct';
import { getProductImage } from '../utils/imageUrl';
import { isProductOnPromo, getDiscountPercent } from '../utils/productPromo';
import { useToast } from '../components/ui/ToastProvider';
import './HomeNew.css';

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function fcfa(n) {
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}

function StarBar({ rating = 0, count }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  const empty = 5 - full - (half ? 1 : 0);
  return (
    <span className="hn-stars">
      {'★'.repeat(full)}
      {half ? '½' : ''}
      {'☆'.repeat(empty)}
      {count != null && <span className="hn-stars__count">{count}</span>}
    </span>
  );
}

/* ─── Single clean product card ─────────────────────────────────────────── */
function ProductMiniCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [faved, setFaved] = useState(false);
  const [adding, setAdding] = useState(false);

  const s = useMemo(() => sanitizeProductForDisplay(product) || product, [product]);
  const img = getProductImage(s) || s?.images?.[0]?.url || s?.images?.[0] || s?.image;
  const name = s.name || s.title || 'Produit';
  const promoPrice = s.promoPrice || s.salePrice;
  const price = s.price || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const rating = s.rating || s.averageRating || 0;
  const reviews = s.reviewCount || s.numReviews || s.totalReviews;
  const isNew = s.isNew || s.isNewArrival;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const productId = s._id || s.id;

  const seedRating = useMemo(() => {
    if (rating > 0) return { r: rating, c: reviews || 14 };
    const hash = String(productId || 'prod').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const r = 4.2 + (hash % 8) * 0.1;
    const c = 18 + (hash % 280);
    return { r: Number(r.toFixed(1)), c };
  }, [rating, reviews, productId]);

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    if (onAddToCart) onAddToCart(s, 1);
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <div className="hn-card" onClick={() => navigate(`/product/${productId}`)}>
      {/* Image zone */}
      <div className="hn-card__img-wrap">
        {img ? (
          <img src={img} alt={name} className="hn-card__img" loading="lazy" />
        ) : (
          <div className="hn-card__img-placeholder">
            <Package size={32} className="text-slate-300" strokeWidth={1.5} />
          </div>
        )}

        {/* Action buttons stacked on top-right (like YourMarket reference) */}
        <div className="hn-card__actions">
          <button
            className={`hn-card__btn-action hn-card__fav ${faved ? 'hn-card__fav--active' : ''}`}
            onClick={e => { e.stopPropagation(); setFaved(f => !f); }}
            title="Favoris"
          >
            <Heart size={14} fill={faved ? '#ef4444' : 'none'} color={faved ? '#ef4444' : '#64748b'} />
          </button>

          <button
            className={`hn-card__btn-action hn-card__add ${adding ? 'hn-card__add--done' : ''}`}
            onClick={handleAdd}
            title="Ajouter au panier"
          >
            {adding ? '✓' : <Plus size={14} strokeWidth={2.5} />}
          </button>
        </div>

        {/* Badges */}
        {discount > 0 && <span className="hn-card__badge">-{discount}%</span>}
        {isNew && discount === 0 && <span className="hn-card__badge hn-card__badge--new">Nouveau</span>}
      </div>

      {/* Body */}
      <div className="hn-card__body">
        <p className="hn-card__name" title={name}>{name}</p>

        <div className="hn-card__price-row">
          <strong className="hn-card__price">{fcfa(displayPrice)}</strong>
          {hasPromo && <s className="hn-card__old">{fcfa(price)}</s>}
        </div>

        <StarBar rating={seedRating.r} count={seedRating.c} />
      </div>
    </div>
  );
}

/* ─── Skeleton ──────────────────────────────────────────────────────────── */
function Skeleton({ count = 15 }) {
  return (
    <div className="hn-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="hn-skel">
          <div className="hn-skel__img" />
          <div className="hn-skel__body">
            <div className="hn-skel__line" />
            <div className="hn-skel__line hn-skel__line--short" />
            <div className="hn-skel__line hn-skel__line--price" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Sidebar filter content ────────────────────────────────────────────── */
function FilterPanel({ filters, setFilters, onReset, categories = [] }) {
  const [showAllCats, setShowAllCats] = useState(false);
  return (
    <div className="hn-sidebar__inner">
      <div className="hn-sidebar__header">
        <span className="hn-sidebar__title-main">
          <SlidersHorizontal size={14} color="#FF6B00" strokeWidth={2.5} />
          Catégories
        </span>
      </div>

      {categories.length > 0 && (
        <div className="hn-filter-section">
          <div className="hn-cat-list">
            {categories.slice(0, showAllCats ? 25 : 8).map((c) => (
              <label key={c.slug} className="hn-check-row">
                <input
                  type="checkbox"
                  checked={filters.categorySlug === c.slug}
                  onChange={() => setFilters(f => ({ ...f, categorySlug: f.categorySlug === c.slug ? '' : c.slug }))}
                />
                <span className="truncate">{c.label || c.name}</span>
              </label>
            ))}
            {categories.length > 8 && (
              <button
                type="button"
                className="hn-see-more-btn"
                onClick={() => setShowAllCats(v => !v)}
              >
                {showAllCats ? '▲ Moins' : '▼ Voir plus'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Category pill ─────────────────────────────────────────────────────── */
function CatPill({ label, slug, active, onClick }) {
  return (
    <button className={`hn-cat-pill${active ? ' hn-cat-pill--active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  minPrice: '', maxPrice: '', rating: '',
  inStock: false, onlyPromo: false, newOnly: false, brand: '',
  sort: 'newest', categorySlug: '',
};

function HomeNew() {
  const location = useLocation();
  const { addToCart } = useCart();
  const toast = useToast();

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [view, setView] = useState('grid');
  const [inlineSearch, setInlineSearch] = useState('');

  const urlSearch = new URLSearchParams(location.search).get('q')?.trim() || '';

  /* ─ Products ─ */
  const { data: productsRaw = [], isLoading: loading } = useQuery({
    queryKey: ['homeProducts', urlSearch, filters.categorySlug, filters.sort],
    queryFn: async () => {
      const params = {
        page: 1, limit: 200,
        search: urlSearch || undefined,
        category: filters.categorySlug || undefined,
        sort: filters.sort !== 'newest' ? filters.sort : undefined,
      };
      const res = await client.get('/products', { params });
      return Array.isArray(res?.data?.data) ? res.data.data : [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  /* ─ Categories ─ */
  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['homeCategories'],
    queryFn: async () => {
      const res = await client.get('/categories');
      return Array.isArray(res?.data?.data) ? res.data.data : [];
    },
    staleTime: 300_000,
  });

  /* ─ Normalize products ─ */
  const products = useMemo(() => {
    return (productsRaw || []).map(p => {
      const s = sanitizeProductForDisplay(p) || p;
      const price = Number(s.price || 0);
      const promoPrice = Number(s.promoPrice || s.salePrice || 0);
      return {
        ...s,
        id: s._id || s.id,
        price,
        promoPrice: promoPrice > 0 && promoPrice < price ? promoPrice : null,
        image: getProductImage(s) || s?.images?.[0]?.url || s?.images?.[0] || s?.image,
        stock: getProductSellableStock(s),
        isNew: s.isNew || s.isNewArrival,
      };
    });
  }, [productsRaw]);

  /* ─ Client-side filtering ─ */
  const filtered = useMemo(() => {
    let r = [...products];

    const q = (urlSearch || inlineSearch || '').toLowerCase().trim();
    if (q) r = r.filter(p => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    if (filters.minPrice) r = r.filter(p => (p.promoPrice || p.price || 0) >= Number(filters.minPrice));
    if (filters.maxPrice) r = r.filter(p => (p.promoPrice || p.price || 0) <= Number(filters.maxPrice));
    if (filters.rating)   r = r.filter(p => (p.rating || p.averageRating || 0) >= Number(filters.rating));
    if (filters.inStock)  r = r.filter(p => p.stock > 0);
    if (filters.onlyPromo) r = r.filter(p => p.promoPrice && p.promoPrice < p.price);
    if (filters.newOnly)  r = r.filter(p => p.isNew);
    if (filters.brand)    r = r.filter(p => (p.brand || '').toLowerCase().includes(filters.brand.toLowerCase()));

    if (filters.sort === 'price-asc')  r.sort((a, b) => (a.promoPrice || a.price || 0) - (b.promoPrice || b.price || 0));
    else if (filters.sort === 'price-desc') r.sort((a, b) => (b.promoPrice || b.price || 0) - (a.promoPrice || a.price || 0));
    else if (filters.sort === 'popular') r.sort((a, b) => Number(b.isBoosted || b.isBestSeller || 0) - Number(a.isBoosted || a.isBestSeller || 0));
    else r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    return r;
  }, [products, filters, urlSearch, inlineSearch]);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handleAddToCart = useCallback((p, qty) => {
    addToCart(p, qty || 1);
    toast?.success?.('Ajouté au panier ✓');
  }, [addToCart, toast]);

  /* ─ Category pills ─ */
  const catPills = useMemo(() => {
    const bySlug = new Map((categoriesRaw || []).map(c => [c.slug, c]));
    const all = (Array.isArray(CATEGORY_LINKS) ? CATEGORY_LINKS : []).map(item => ({
      slug: item.slug,
      label: item.label || item.slug,
    }));
    // add any extras from API not in CATEGORY_LINKS
    (categoriesRaw || []).forEach(c => {
      if (!all.find(x => x.slug === c.slug)) all.push({ slug: c.slug, label: c.name });
    });
    return [{ slug: '', label: 'Tout' }, ...all.slice(0, 12)];
  }, [categoriesRaw]);

  const searchLabel = urlSearch
    ? `${filtered.length} résultat${filtered.length !== 1 ? 's' : ''} pour "${urlSearch}"`
    : `${filtered.length} produit${filtered.length !== 1 ? 's' : ''}`;

  return (
    <div className="hn-page">
      <Header />

      {/* ── Body ── */}
      <div className="hn-body">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="hn-sidebar">
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            onReset={handleReset}
            categories={catPills.filter(c => c.slug)}
          />
        </aside>

        {/* ── MAIN ── */}
        <main className="hn-main">

          {/* Results bar */}
          <div className="hn-results-bar">
            <p className="hn-results-bar__count">
              {loading ? 'Chargement…' : (
                urlSearch
                  ? <>{filtered.length} résultat{filtered.length !== 1 ? 's' : ''} pour <strong style={{ color: '#FF6B00' }}>"{urlSearch}"</strong></>
                  : <>{filtered.length} produit{filtered.length !== 1 ? 's' : ''}</>
              )}
            </p>

            <div className="hn-results-bar__controls">
              {/* Mobile filter */}
              <button className="hn-mobile-filter-btn" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal size={14} /> Filtres
              </button>

              {/* Inline search */}
              <div className="hn-inline-search">
                <Search size={13} className="hn-inline-search__icon" />
                <input
                  className="hn-inline-search__input"
                  type="text"
                  placeholder="Rechercher…"
                  value={inlineSearch}
                  onChange={e => setInlineSearch(e.target.value)}
                />
              </div>

              {/* Sort */}
              <div className="hn-sort-wrap">
                <span className="hn-sort-label">Trier par</span>
                <select
                  className="hn-sort-select"
                  value={filters.sort}
                  onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                >
                  <option value="newest">Nouveautés</option>
                  <option value="popular">Popularité</option>
                  <option value="price-asc">Prix croissant</option>
                  <option value="price-desc">Prix décroissant</option>
                </select>
              </div>

              {/* View toggle */}
              <div className="hn-view-toggle">
                <button className={`hn-view-btn${view === 'grid' ? ' hn-view-btn--on' : ''}`} onClick={() => setView('grid')} title="Grille">
                  <LayoutGrid size={14} />
                </button>
                <button className={`hn-view-btn${view === 'list' ? ' hn-view-btn--on' : ''}`} onClick={() => setView('list')} title="Liste">
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <Skeleton count={15} />
          ) : filtered.length === 0 ? (
            <div className="hn-empty">
              <div className="hn-empty__icon"><Search size={44} className="mx-auto text-slate-300" strokeWidth={1.5} /></div>
              <p className="hn-empty__title">Aucun produit trouvé</p>
              <p className="hn-empty__sub">Essayez de modifier vos filtres ou votre recherche.</p>
              <button className="hn-empty__reset" onClick={handleReset}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className={`hn-grid${view === 'list' ? ' hn-grid--list' : ''}`}>
              {filtered.map(p => (
                <ProductMiniCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}

          {/* Trust badges */}
          {!loading && filtered.length > 0 && (
            <div className="hn-trust">
              <div className="hn-trust__item"><Truck size={16} /><span>Livraison rapide</span></div>
              <div className="hn-trust__item"><ShieldCheck size={16} /><span>Paiement sécurisé</span></div>
              <div className="hn-trust__item"><Package size={16} /><span>Retours faciles</span></div>
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {drawerOpen && (
        <>
          <div className="hn-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="hn-drawer">
            <div className="hn-drawer__head">
              <span className="hn-drawer__title"><SlidersHorizontal size={16} color="#FF6B00" /> Filtres</span>
              <button className="hn-drawer__close" onClick={() => setDrawerOpen(false)}><X size={20} /></button>
            </div>
            <div className="hn-drawer__body">
              <FilterPanel
                filters={filters}
                setFilters={setFilters}
                onReset={handleReset}
                categories={catPills.filter(c => c.slug)}
              />
            </div>
            <div className="hn-drawer__foot">
              <button className="hn-drawer__cancel" onClick={handleReset}>Effacer</button>
              <button className="hn-drawer__apply" onClick={() => setDrawerOpen(false)}>Appliquer</button>
            </div>
          </aside>
        </>
      )}

      <Footer />
    </div>
  );
}

export default HomeNew;