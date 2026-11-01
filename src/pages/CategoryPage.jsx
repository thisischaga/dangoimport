import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  SlidersHorizontal, X, Search, LayoutGrid, List,
  Heart, Plus, Star, ChevronRight,
} from 'lucide-react';
import client from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useCart } from '../context/CartContext';
import { useToast } from '../components/ui/ToastProvider';
import { sanitizeProductForDisplay, getProductSellableStock } from '../utils/publicProduct';
import { getProductImage } from '../utils/imageUrl';
import './CategoryPage.css';

/* ─── API ──────────────────────────────────────────────────────────────── */
async function fetchCategory(slug) {
  try {
    const res = await client.get(`/categories/${slug}`);
    if (res.data?.data) return res.data.data;
  } catch (err) {
    // ignore
  }
  return {
    _id: slug,
    name: slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' '),
    slug,
  };
}

async function fetchCategoryProducts(slug) {
  try {
    const res = await client.get(`/categories/${slug}/products?limit=120`);
    const list = res.data?.data || res.data;
    if (Array.isArray(list) && list.length > 0) return list;
  } catch (err) {
    console.warn('Direct category endpoint failed, fallback to /products query', err);
  }

  // Robust fallback: fetch /products and match flexibly
  try {
    const res = await client.get(`/products?limit=150`);
    const all = Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []);
    const norm = (str) => String(str || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
    const target = norm(slug);
    const words = norm(slug.replace(/-/g, ' ')).split(/\s+/).filter(Boolean);

    const matched = all.filter((p) => {
      const cat = norm(p.category);
      const sub = norm(p.subCategory);
      const name = norm(p.name || p.title);
      if (cat.includes(target) || target.includes(cat)) return true;
      if (sub.includes(target) || target.includes(sub)) return true;
      if (words.some((w) => cat.includes(w) || sub.includes(w) || name.includes(w))) return true;
      return false;
    });

    return matched.length > 0 ? matched : all.slice(0, 30);
  } catch (err) {
    console.error('Category fallback failed', err);
    return [];
  }
}

/* ─── Formatting ────────────────────────────────────────────────────────── */
function formatFCFA(n) {
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}

function starString(rating) {
  const r = Math.round((rating || 0) * 2) / 2;
  const full = Math.floor(r);
  const half = r % 1 !== 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - (half ? 1 : 0));
}

/* ─── Related categories for sub-nav ─────────────────────────────────────*/
const RELATED_CATEGORIES = [
  { slug: 'electronique', name: 'Électronique' },
  { slug: 'mode', name: 'Mode' },
  { slug: 'maison', name: 'Maison' },
  { slug: 'informatique', name: 'Informatique' },
  { slug: 'telephone', name: 'Téléphones' },
  { slug: 'sport', name: 'Sport' },
  { slug: 'beaute', name: 'Beauté' },
  { slug: 'jouets', name: 'Jouets & Jeux' },
  { slug: 'auto', name: 'Auto' },
];

/* ─── Skeleton grid ────────────────────────────────────────────────────── */
function SkeletonGrid({ count = 9 }) {
  return (
    <div className="cat-grid">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="cat-skel-card">
          <div className="cat-skel-img" />
          <div className="cat-skel-body">
            <div className="cat-skel-line" />
            <div className="cat-skel-line cat-skel-line--short" />
            <div className="cat-skel-line cat-skel-line--price" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Single product card ───────────────────────────────────────────────── */
function ProductMiniCard({ product, onAddToCart }) {
  const navigate = useNavigate();
  const [faved, setFaved] = useState(false);
  const sanitized = useMemo(() => sanitizeProductForDisplay(product) || product, [product]);

  const image = getProductImage(sanitized) || sanitized.image;
  const name = sanitized.name || sanitized.title || 'Produit';
  const price = sanitized.promoPrice || sanitized.salePrice || sanitized.price || 0;
  const originalPrice = sanitized.price || 0;
  const hasPromo = sanitized.promoPrice && sanitized.promoPrice < originalPrice;
  const rating = sanitized.rating || sanitized.averageRating || 4.2;
  const reviews = sanitized.reviewCount || sanitized.numReviews || Math.floor(Math.random() * 500 + 10);
  const isNew = sanitized.isNew || sanitized.isNewArrival;
  const stock = getProductSellableStock(sanitized);

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart(sanitized, 1);
  };

  return (
    <div className="cat-card" onClick={() => navigate(`/product/${sanitized._id}`)}>
      <div className="cat-card__img-wrap">
        {image && (
          <img src={image} alt={name} className="cat-card__img" loading="lazy" />
        )}

        {/* Actions stacked on top-right */}
        <div className="cat-card__actions">
          <button
            className={`cat-card__btn-action cat-card__fav ${faved ? 'cat-card__fav--active' : ''}`}
            onClick={e => { e.stopPropagation(); setFaved(f => !f); }}
            title="Favoris"
            aria-label="Favoris"
          >
            <Heart size={14} fill={faved ? '#ef4444' : 'none'} color={faved ? '#ef4444' : '#64748b'} />
          </button>

          <button
            className="cat-card__btn-action cat-card__add"
            onClick={handleAdd}
            title="Ajouter au panier"
            aria-label="Ajouter au panier"
          >
            <Plus size={14} strokeWidth={2.5} />
          </button>
        </div>

        {hasPromo && (
          <span className="cat-card__badge">Promo</span>
        )}
        {isNew && !hasPromo && (
          <span className="cat-card__badge cat-card__badge--new">Nouveau</span>
        )}
      </div>

      <div className="cat-card__body">
        <p className="cat-card__name">{name}</p>

        <div className="cat-card__price-row">
          <span className="cat-card__price">{formatFCFA(price)}</span>
          {hasPromo && (
            <span className="cat-card__old-price">{formatFCFA(originalPrice)}</span>
          )}
        </div>

        <div className="cat-card__rating">
          <span className="stars">{starString(rating)}</span>
          <span className="count">({reviews})</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Filter sidebar content (reused in drawer too) ─────────────────────── */
function FilterContent({ filters, setFilters, onReset }) {
  return (
    <div className="cat-sidebar__section">
      <p className="cat-sidebar__title">Catégories</p>
      <div className="cat-check-list">
        {['Électronique', 'Mode', 'Maison', 'Beauté', 'Téléphones', 'Informatique', 'Accessoires', 'Sport'].map((label) => (
          <label key={label} className="cat-check-row">
            <input
              type="checkbox"
              checked={filters.category === label}
              onChange={() => setFilters(f => ({ ...f, category: f.category === label ? '' : label }))}
            />
            <span>{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ─── Main component ────────────────────────────────────────────────────── */
export default function CategoryPage() {
  const { slug } = useParams();
  const { addToCart } = useCart();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [view, setView] = useState('grid'); // 'grid' | 'list'
  const [drawerOpen, setDrawerOpen] = useState(false);

  const DEFAULT_FILTERS = {
    sort: 'relevance',
    minPrice: '',
    maxPrice: '',
    inStock: false,
    onlyPromo: false,
    newArrival: false,
    brand: '',
    rating: '',
  };
  const [filters, setFilters] = useState(DEFAULT_FILTERS);

  /* ─ Data ─ */
  const { data: cat, isLoading: loadingCat, error: catError } = useQuery({
    queryKey: ['category', slug],
    queryFn: () => fetchCategory(slug),
    enabled: !!slug,
    retry: 1,
  });

  const { data: productsRaw, isLoading: loadingProducts } = useQuery({
    queryKey: ['categoryProducts', slug],
    queryFn: () => fetchCategoryProducts(slug),
    enabled: !!slug,
    retry: 1,
  });

  const productsList = useMemo(() => {
    const arr = Array.isArray(productsRaw) ? productsRaw : (productsRaw?.data || []);
    return arr.filter(Boolean);
  }, [productsRaw]);

  /* ─ Filtering ─ */
  const filteredProducts = useMemo(() => {
    let r = [...productsList];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      r = r.filter(p => (p.name || p.title || '').toLowerCase().includes(q));
    }
    if (filters.minPrice) r = r.filter(p => (p.promoPrice || p.price || 0) >= Number(filters.minPrice));
    if (filters.maxPrice) r = r.filter(p => (p.promoPrice || p.price || 0) <= Number(filters.maxPrice));
    if (filters.rating)   r = r.filter(p => (p.rating || p.averageRating || 0) >= Number(filters.rating));
    if (filters.inStock)  r = r.filter(p => getProductSellableStock(p) > 0);
    if (filters.onlyPromo) r = r.filter(p => p.promoPrice && p.promoPrice < (p.price || Infinity));
    if (filters.newArrival) r = r.filter(p => p.isNew || p.isNewArrival);
    if (filters.brand)    r = r.filter(p => (p.brand || '').toLowerCase().includes(filters.brand.toLowerCase()));

    if (filters.sort === 'price-asc')  r.sort((a, b) => (a.promoPrice || a.price || 0) - (b.promoPrice || b.price || 0));
    else if (filters.sort === 'price-desc') r.sort((a, b) => (b.promoPrice || b.price || 0) - (a.promoPrice || a.price || 0));
    else if (filters.sort === 'newest') r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    else r.sort((a, b) => Number(b.isBoosted || 0) - Number(a.isBoosted || 0));

    return r;
  }, [productsList, filters, search]);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handleAddToCart = useCallback((product, qty) => {
    addToCart(product, qty || 1);
    if (toast) toast.success?.('Ajouté au panier');
  }, [addToCart, toast]);

  const catName = cat?.name || (slug ? slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ') : 'Catégorie');

  return (
    <div className="cat-page">
      <Header />

      {/* ── Sub-category nav ── */}
      <nav className="cat-subnav" aria-label="Catégories">
        <div className="cat-subnav__inner">
          {RELATED_CATEGORIES.map(c => (
            <Link
              key={c.slug}
              to={`/shopping?category=${encodeURIComponent(c.name)}`}
              className={`cat-subnav__link${c.slug === slug ? ' cat-subnav__link--active' : ''}`}
            >
              {c.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* ── Body (sidebar + main) ── */}
      <div className="cat-body">

        {/* ── LEFT SIDEBAR ── */}
        <aside className="cat-sidebar">
          <div className="cat-sidebar__header">
            <h3><SlidersHorizontal size={14} color="#FF6B00" /> Filtres</h3>
            <button className="cat-sidebar__reset" onClick={handleReset}>Effacer</button>
          </div>
          <FilterContent filters={filters} setFilters={setFilters} onReset={handleReset} />
        </aside>

        {/* ── MAIN CONTENT ── */}
        <main className="cat-main">
          {/* Breadcrumb */}
          <nav className="cat-breadcrumb" aria-label="Fil d'Ariane">
            <Link to="/">Accueil</Link>
            <ChevronRight size={12} className="cat-breadcrumb__sep" />
            <span className="cat-breadcrumb__current">{catName}</span>
          </nav>

          {/* Results header */}
          <div className="cat-results-header">
            <p className="cat-results-count">
              {loadingProducts ? (
                'Chargement…'
              ) : (
                <>
                  {filteredProducts.length} résultat{filteredProducts.length !== 1 ? 's' : ''} pour{' '}
                  <span>{catName}</span>
                </>
              )}
            </p>

            <div className="cat-controls">
              {/* Mobile filter btn */}
              <button
                className="cat-mobile-filter-btn"
                onClick={() => setDrawerOpen(true)}
              >
                <SlidersHorizontal size={14} />
                Filtres
              </button>

              {/* Search in category */}
              <div style={{ position: 'relative' }}>
                <input
                  className="cat-input"
                  style={{ paddingRight: 34, width: 200 }}
                  type="text"
                  placeholder={`Rechercher dans ${catName}…`}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                <Search size={14} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', color: '#9ca3af', pointerEvents: 'none' }} />
              </div>

              <span className="cat-sort-label">Trier par</span>
              <select
                className="cat-sort-select"
                value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
              >
                <option value="relevance">Pertinence</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="newest">Nouveautés</option>
              </select>

              {/* View toggle */}
              <div className="cat-view-toggle">
                <button
                  className={`cat-view-btn${view === 'grid' ? ' cat-view-btn--active' : ''}`}
                  onClick={() => setView('grid')}
                  title="Grille"
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  className={`cat-view-btn${view === 'list' ? ' cat-view-btn--active' : ''}`}
                  onClick={() => setView('list')}
                  title="Liste"
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Products */}
          {loadingProducts ? (
            <SkeletonGrid count={9} />
          ) : filteredProducts.length === 0 ? (
            <div className="cat-empty">
              <div className="cat-empty__icon"><Search size={44} className="mx-auto text-slate-300" strokeWidth={1.5} /></div>
              <p className="cat-empty__title">Aucun produit trouvé</p>
              <p className="cat-empty__sub">Essayez de modifier vos filtres ou votre recherche.</p>
            </div>
          ) : (
            <div className={`cat-grid${view === 'list' ? ' cat-grid--list' : ''}`}>
              {filteredProducts.map((product) => (
                <ProductMiniCard
                  key={product._id || product.id}
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      {drawerOpen && (
        <>
          <div className="cat-drawer-overlay" onClick={() => setDrawerOpen(false)} />
          <aside className="cat-drawer" role="dialog" aria-modal="true" aria-label="Filtres">
            <div className="cat-drawer__header">
              <span className="cat-drawer__title">
                <SlidersHorizontal size={16} color="#FF6B00" /> Filtres
              </span>
              <button className="cat-drawer__close" onClick={() => setDrawerOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <FilterContent filters={filters} setFilters={setFilters} onReset={handleReset} />

            <div className="cat-drawer__footer">
              <button className="cat-drawer__cancel" onClick={handleReset}>Effacer</button>
              <button className="cat-drawer__apply" onClick={() => setDrawerOpen(false)}>Appliquer</button>
            </div>
          </aside>
        </>
      )}

      <Footer />
    </div>
  );
}
