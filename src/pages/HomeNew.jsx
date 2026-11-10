import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Package, Check, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import client from '../apiClient';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getProductSellableStock, sanitizeProductForDisplay } from '../utils/publicProduct';
import { getProductImage, getProductImages } from '../utils/imageUrl';
import { getMoqRules } from '../utils/importMoq';
import { useToast } from '../components/ui/ToastProvider';
import homeBgImg from '../images/homebg.png';
import './HomeNew.css';

/* ── Styles : maquette Dango import, sans promotions ─────────────────── */
const CSS = `
:root {
  --or: #ff6a00;
  --ink: #111111;
  --mute: #6b6b6b;
  --line: #ececec;
}

.hn-page {
  background: #ffffff;
  min-height: 100vh;
  -webkit-tap-highlight-color: transparent;
  overscroll-behavior-y: none;
}
.hn-page button, .hn-page a { touch-action: manipulation; }
.hm-wrap { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 24px; }

/* Hero */
.hm-hero { position: relative; overflow: hidden; padding: 40px 0 0; background: #fff; }
.hm-hero::before {
  content: ''; position: absolute; right: -180px; top: -220px; width: 720px; height: 720px;
  border-radius: 50%; background: radial-gradient(circle at 30% 30%, #ffb27a 0%, #ff6a00 75%);
  opacity: .16; pointer-events: none;
}
.hm-hero__grid { position: relative; display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 32px; }
.hm-hero__copy { position: relative; z-index: 1; padding: 16px 0; }
.hm-hero__title { margin: 0; font-size: clamp(44px, 5.4vw, 80px); font-weight: 900; line-height: 1.02; letter-spacing: -0.035em; color: var(--ink); }
.hm-hero__accent { color: var(--or); }
.hm-hero__lead { margin: 22px 0 0; max-width: 520px; font-size: clamp(17px, 1.4vw, 20px); line-height: 1.55; color: #444; }
.hm-hero__media { position: relative; display: flex; justify-content: flex-end; }
.hm-hero__img { width: 100%; max-width: 620px; max-height: 540px; margin-left: auto; object-fit: contain; user-select: none; pointer-events: none; }

.hm-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 50px; padding: 0 28px; border-radius: 999px; border: 0; font-family: inherit; font-size: 15px; font-weight: 800; cursor: pointer; white-space: nowrap; text-decoration: none; transition: background .15s ease, transform .12s ease; }
.hm-pill:active { transform: scale(.97); }
.hm-pill--primary { background: var(--or); color: #fff; margin-top: 30px; }
.hm-pill--primary:hover { background: #e85f00; }
.hm-pill--dark { background: var(--ink); color: #fff; }
.hm-pill--dark:hover { background: #000; }

/* Réassurance : texte seul */
.hm-features { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 56px; border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.hm-feature { padding: 22px 24px; border-left: 1px solid var(--line); }
.hm-feature:first-child { border-left: 0; }
.hm-feature strong { display: block; font-size: 16px; font-weight: 800; color: var(--ink); }
.hm-feature span { display: block; margin-top: 4px; font-size: 13px; color: var(--mute); }

/* Sections */
.hm-section { padding: 40px 0; scroll-margin-top: calc(var(--header-h, 120px) + 16px); }
.hm-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 22px; }
.hm-head__title { position: relative; margin: 0; padding-bottom: 12px; font-size: clamp(24px, 2.6vw, 32px); font-weight: 900; letter-spacing: -0.02em; color: var(--ink); }
.hm-head__title::after { content: ''; position: absolute; left: 0; bottom: 0; width: 56px; height: 4px; border-radius: 4px; background: var(--or); }
.hm-link { font-size: 15px; font-weight: 800; color: var(--or); text-decoration: none; white-space: nowrap; }
.hm-link:hover { text-decoration: underline; }
.hm-arrow { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #d9d9d9; background: #fff; color: var(--ink); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.hm-arrow:hover { background: var(--or); border-color: var(--or); color: #fff; }
.hm-head__nav { display: flex; gap: 8px; align-items: center; }
.hm-row { display: flex; gap: 14px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
.hm-row::-webkit-scrollbar { display: none; }
.hm-row > .pc { flex: 0 0 220px; scroll-snap-align: start; }

/* Grille produits */
.hn-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
@media (min-width: 720px) { .hn-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 18px; } }
@media (min-width: 1040px) { .hn-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }

/* Carte produit */
.pc { position: relative; display: flex; flex-direction: column; min-width: 0; cursor: pointer; color: var(--ink); background: #fff; }
.pc__frame { position: relative; aspect-ratio: 1 / 1; border-radius: 14px; background: #f6f6f6; overflow: hidden; }
.pc__track { display: flex; width: 100%; height: 100%; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.pc__track::-webkit-scrollbar { display: none; }
.pc__slide { flex: 0 0 100%; height: 100%; scroll-snap-align: center; display: flex; align-items: center; justify-content: center; padding: 14px; }
.pc__img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; transition: transform .35s ease; }
@media (hover: hover) { .pc:hover .pc__img { transform: scale(1.04); } }
.pc__ph { color: #cfcfcf; }
.pc__cart { position: absolute; right: 10px; bottom: 10px; z-index: 3; width: 40px; height: 40px; border: 0; border-radius: 10px; background: var(--or); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 12px rgba(255,106,0,.35); transition: background .15s ease, transform .12s ease; }
.pc__cart:hover { background: #e85f00; }
.pc__cart:active { transform: scale(.94); }
.pc__cart--done { background: #111; }
.pc__nav { position: absolute; top: 50%; z-index: 3; width: 30px; height: 30px; margin-top: -15px; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,.96); color: var(--ink); display: none; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.15); }
.pc__nav--prev { left: 8px; }
.pc__nav--next { right: 8px; }
@media (hover: hover) { .pc__nav { display: flex; opacity: 0; transition: opacity .2s ease; } .pc:hover .pc__nav { opacity: 1; } }
.pc__dots { display: flex; justify-content: center; gap: 5px; margin-top: 8px; min-height: 6px; }
.pc__dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 3px; background: #d6d6d6; cursor: pointer; transition: width .25s ease, background .25s ease; }
.pc__dot--on { width: 16px; background: var(--or); }
.pc__title { margin: 12px 2px 0; font-size: 15px; line-height: 1.35; font-weight: 800; color: var(--ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; }
.pc__price { margin: 4px 2px 0; font-size: 17px; font-weight: 900; color: var(--or); }
.pc__moq { margin: 2px 2px 0; font-size: 12px; color: var(--mute); }

/* Chargement */
@keyframes hnSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes hnBar { from { transform: translateX(-100%); } to { transform: translateX(380%); } }
.hn-sk { position: relative; overflow: hidden; background: #efefef; border-radius: 10px; }
.hn-sk::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent); animation: hnSweep 1.3s infinite; }
.hn-loadbar { position: relative; height: 3px; margin: 0 0 14px; border-radius: 3px; background: #ffe7d6; overflow: hidden; }
.hn-loadbar span { position: absolute; top: 0; bottom: 0; left: 0; width: 28%; border-radius: 3px; background: var(--or); animation: hnBar 1.1s ease-in-out infinite; }

.hm-empty { text-align: center; padding: 70px 16px; color: var(--mute); }
.hm-empty strong { display: block; margin: 12px 0 6px; font-size: 18px; color: var(--ink); }

.hm-banner { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 24px; padding: 44px; border-radius: 18px; background: linear-gradient(120deg, #fff1e6, #ffffff); overflow: hidden; }
.hm-banner h3 { margin: 0; font-size: clamp(26px, 3vw, 34px); font-weight: 900; letter-spacing: -0.02em; color: var(--ink); line-height: 1.15; }
.hm-banner p { margin: 12px 0 0; font-size: 15px; line-height: 1.6; color: #555; max-width: 420px; }
.hm-banner__img { justify-self: end; width: 100%; max-width: 340px; height: 220px; object-fit: contain; }

/* ── Tablette ── */
@media (max-width: 1023px) {
  .hm-wrap { padding: 0 20px; }
  .hm-hero__grid { gap: 20px; }
  .hm-features { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .hm-feature:nth-child(3) { border-left: 0; }
  .hm-feature:nth-child(n+3) { border-top: 1px solid var(--line); }
}

/* ── Mobile : hero et sections en expérience application ── */
@media (max-width: 767px) {
  .hn-page { padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
  .hm-wrap { padding: 0 18px; }

  .hm-hero { padding: 14px 0 0; }
  .hm-hero::before { width: 460px; height: 460px; top: -180px; right: -200px; opacity: .12; }
  .hm-hero__grid { grid-template-columns: 1fr; gap: 0; }
  .hm-hero__copy { padding: 8px 0 0; }
  .hm-hero__title { font-size: clamp(38px, 11vw, 48px); line-height: 1.04; letter-spacing: -0.03em; }
  .hm-hero__lead { margin-top: 14px; font-size: 15px; line-height: 1.55; max-width: none; }
  .hm-pill--primary { width: 100%; height: 54px; margin-top: 22px; font-size: 16px; border-radius: 14px; }
  .hm-hero__media { justify-content: center; margin-top: 18px; }
  .hm-hero__img { max-width: 440px; max-height: 360px; margin: 0 auto; }

  .hm-features { grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 24px; }
  .hm-feature { padding: 16px 14px; }
  .hm-feature:nth-child(3) { border-left: 0; }
  .hm-feature:nth-child(n+3) { border-top: 1px solid var(--line); }
  .hm-feature strong { font-size: 14px; }
  .hm-feature span { font-size: 12px; }

  .hm-section { padding: 28px 0; }
  .hm-head { margin-bottom: 14px; }
  .hm-head__title { font-size: 22px; }
  .hm-head__nav { display: none; }
  .hm-row { gap: 12px; margin: 0 -18px; padding: 0 18px 6px; scroll-padding: 0 18px; }
  .hm-row > .pc { flex-basis: 160px; }
  .hn-grid { gap: 14px 10px; }
  .pc__title { font-size: 13px; min-height: 36px; }
  .pc__price { font-size: 15px; }
  .pc__cart { width: 34px; height: 34px; right: 8px; bottom: 8px; }

  .hm-empty { padding: 48px 16px; }
  .hm-banner { grid-template-columns: 1fr; padding: 24px; }
  .hm-banner__img { justify-self: center; height: 160px; }
}

@media (max-width: 380px) {
  .hm-hero__title { font-size: 34px; }
}
`;

if (typeof document !== 'undefined') {
  let styleEl = document.getElementById('pc-home-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'pc-home-styles';
    document.head.appendChild(styleEl);
  }
  if (styleEl.textContent !== CSS) styleEl.textContent = CSS;
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
const amountOf = (n) => {
  const x = Number(n);
  return Number.isFinite(x) && x > 0 ? x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : null;
};

const imgOf = (p) => getProductImage(p) || p?.mainImage || p?.image || p?.images?.[0]?.url || p?.images?.[0] || '';

/* ─── Carte produit : galerie, prix, bouton panier ──────────────────── */
function ProductCard({ product, onAddToCart, index = 0 }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const trackRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [failed, setFailed] = useState(() => new Set());

  const s = useMemo(() => sanitizeProductForDisplay(product) || product, [product]);
  const name = s.name || s.title || 'Produit';
  const price = Number(s.price || s.unitPrice || 0);
  const productId = s._id || s.id;
  const moq = Number(getMoqRules(s).moq || 1);

  const gallery = useMemo(() => {
    let list = [];
    try { list = getProductImages(s, 6) || []; } catch (e) { list = []; }
    if (!list.length && Array.isArray(s?.images)) {
      list = s.images.map((x) => (typeof x === 'string' ? x : x?.url)).filter(Boolean);
    }
    const first = getProductImage(s) || s?.image || '';
    return Array.from(new Set([first, ...list].filter(Boolean))).slice(0, 6);
  }, [s]);

  const slides = gallery.filter((src) => !failed.has(src));
  const count = slides.length;

  const goTo = (i) => {
    const el = trackRef.current;
    if (!el || count < 1) return;
    const next = ((i % count) + count) % count;
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
    setActiveSlide(next);
  };

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    setActiveSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    if (onAddToCart) onAddToCart(s, 1);
    setTimeout(() => setAdding(false), 900);
  };

  const stop = (e) => { e.stopPropagation(); e.preventDefault(); };

  return (
    <article className="pc" style={{ animationDelay: `${Math.min(index, 14) * 40}ms` }} onClick={() => navigate(`/product/${productId}`)}>
      <div className="pc__frame">
        <button type="button" className={`pc__cart${adding ? ' pc__cart--done' : ''}`} onClick={handleAdd} aria-label="Ajouter au panier">
          {adding ? <Check size={18} strokeWidth={2.2} /> : <ShoppingCart size={18} strokeWidth={2} />}
        </button>

        {count === 0 ? (
          <div className="pc__track"><div className="pc__slide pc__ph"><Package size={36} strokeWidth={1.4} /></div></div>
        ) : (
          <div ref={trackRef} className="pc__track" onScroll={onScroll}>
            {slides.map((src, i) => (
              <div className="pc__slide" key={src}>
                <img
                  src={src}
                  alt={i === 0 ? name : `${name} (${i + 1})`}
                  className="pc__img"
                  loading={i === 0 ? 'eager' : 'lazy'}
                  referrerPolicy="no-referrer"
                  draggable={false}
                  onError={() => setFailed((prev) => new Set(prev).add(src))}
                />
              </div>
            ))}
          </div>
        )}

        {count > 1 && (
          <>
            <button type="button" className="pc__nav pc__nav--prev" aria-label="Image précédente" onClick={(e) => { stop(e); goTo(activeSlide - 1); }}>
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="pc__nav pc__nav--next" aria-label="Image suivante" onClick={(e) => { stop(e); goTo(activeSlide + 1); }}>
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="pc__dots">
          {slides.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Image ${i + 1}`}
              className={`pc__dot${i === activeSlide ? ' pc__dot--on' : ''}`}
              onClick={(e) => { stop(e); goTo(i); }}
            />
          ))}
        </div>
      )}

      <h3 className="pc__title" title={name}>{name}</h3>
      {amountOf(price) && <p className="pc__price">{amountOf(price)} FCFA</p>}
      {moq > 1 && <p className="pc__moq">MOQ : {moq} pièces</p>}
    </article>
  );
}

/* ─── Rangée horizontale ────────────────────────────────────────────── */
function ProductRow({ title, items, onAddToCart, onAction, actionLabel }) {
  const rowRef = useRef(null);
  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };
  return (
    <div>
      <div className="hm-head">
        <h2 className="hm-head__title">{title}</h2>
        <div className="hm-head__nav">
          {onAction && <button type="button" className="hm-link" onClick={onAction}>{actionLabel} →</button>}
          <button type="button" className="hm-arrow" aria-label="Précédent" onClick={() => scrollBy(-1)}><ChevronLeft size={18} /></button>
          <button type="button" className="hm-arrow" aria-label="Suivant" onClick={() => scrollBy(1)}><ChevronRight size={18} /></button>
        </div>
      </div>
      <div ref={rowRef} className="hm-row">
        {items.map((p, i) => (
          <ProductCard key={p._id || p.id} product={p} onAddToCart={onAddToCart} index={i} />
        ))}
      </div>
    </div>
  );
}

/* ─── Chargement ────────────────────────────────────────────────────── */
function Skeleton({ count = 10 }) {
  return (
    <div className="hn-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="hn-sk" style={{ aspectRatio: '1 / 1' }} />
          <div className="hn-sk" style={{ height: 14, width: '80%', marginTop: 12 }} />
          <div className="hn-sk" style={{ height: 12, width: '40%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Hero : texte + image, adapté à chaque écran ───────────────────── */
function Hero({ onShop }) {
  return (
    <section className="hm-hero">
      <div className="hm-wrap">
        <div className="hm-hero__grid">
          <div className="hm-hero__copy">
            <h1 className="hm-hero__title">
              Acheter malin<br />
              livrez vite avec<br />
              <span className="hm-hero__accent">Dango import</span>
            </h1>
            <p className="hm-hero__lead">
              Des produits de qualité, à prix imbattables, livrés partout au Togo et au Bénin.
            </p>
            <button type="button" onClick={onShop} className="hm-pill hm-pill--primary">
              Découvrir maintenant <ArrowRight size={16} />
            </button>
          </div>

          <div className="hm-hero__media">
            <img src={homeBgImg} alt="Dango import" className="hm-hero__img" draggable={false} />
          </div>
        </div>

        <div className="hm-features">
          {[
            ['Livraison rapide', 'Partout au Togo & Bénin'],
            ['Paiement sécurisé', 'En toute confiance'],
            ['Support réactif', 'Nous sommes là pour vous'],
            ['Meilleurs prix', 'Achetez plus, économisez plus'],
          ].map(([title, desc]) => (
            <div key={title} className="hm-feature">
              <strong>{title}</strong>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Composant principal ───────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  minPrice: '', maxPrice: '', rating: '',
  inStock: false, newOnly: false, brand: '',
  sort: 'newest', categorySlug: '',
};

function HomeNew() {
  const location = useLocation();
  const { addToCart } = useCart();
  const toast = useToast();
  const gridRef = useRef(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [inlineSearch] = useState('');

  const scrollToGrid = useCallback(() => {
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []);

  const urlSearch = new URLSearchParams(location.search).get('q')?.trim() || '';
  const urlCategory = new URLSearchParams(location.search).get('category')?.trim() || '';

  useEffect(() => {
    if (urlCategory) {
      setFilters((f) => ({ ...f, categorySlug: urlCategory }));
      scrollToGrid();
    }
  }, [urlCategory, scrollToGrid]);

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
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.data?.products)) return res.data.products;
      if (Array.isArray(res?.data?.data?.products)) return res.data.data.products;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const { data: categoriesRaw = [] } = useQuery({
    queryKey: ['homeCategories'],
    queryFn: async () => {
      const res = await client.get('/categories');
      if (Array.isArray(res?.data?.data)) return res.data.data;
      if (Array.isArray(res?.data?.categories)) return res.data.categories;
      if (Array.isArray(res?.data)) return res.data;
      return [];
    },
    staleTime: 300_000,
  });

  const products = useMemo(() => {
    return (productsRaw || []).map((p) => {
      const s = sanitizeProductForDisplay(p) || p;
      const price = Number(s.price || 0);
      return {
        ...s,
        id: s._id || s.id,
        price,
        image: getProductImage(s) || s?.images?.[0]?.url || s?.images?.[0] || s?.image,
        stock: getProductSellableStock(s),
        isNew: s.isNew || s.isNewArrival,
      };
    });
  }, [productsRaw]);

  const filtered = useMemo(() => {
    let r = [...products];
    const q = (urlSearch || inlineSearch || '').toLowerCase().trim();
    if (q) r = r.filter((p) => (p.name || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q));
    if (filters.minPrice) r = r.filter((p) => (p.price || 0) >= Number(filters.minPrice));
    if (filters.maxPrice) r = r.filter((p) => (p.price || 0) <= Number(filters.maxPrice));
    if (filters.rating) r = r.filter((p) => (p.rating || p.averageRating || 0) >= Number(filters.rating));
    if (filters.inStock) r = r.filter((p) => p.stock > 0);
    if (filters.newOnly) r = r.filter((p) => p.isNew);
    if (filters.brand) r = r.filter((p) => (p.brand || '').toLowerCase().includes(filters.brand.toLowerCase()));

    if (filters.sort === 'price-asc') r.sort((a, b) => (a.price || 0) - (b.price || 0));
    else if (filters.sort === 'price-desc') r.sort((a, b) => (b.price || 0) - (a.price || 0));
    else if (filters.sort === 'popular') r.sort((a, b) => Number(b.isBoosted || b.isBestSeller || 0) - Number(a.isBoosted || a.isBestSeller || 0));
    else r.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return r;
  }, [products, filters, urlSearch, inlineSearch]);

  const newItems = useMemo(() => products.filter((p) => p.isNew && imgOf(p)).slice(0, 12), [products]);
  const featured = useMemo(() => products.filter((p) => imgOf(p)).slice(0, 5), [products]);

  const handleReset = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  const handleAddToCart = useCallback((p, qty) => {
    addToCart(p, qty || 1);
    toast?.success?.('Ajouté au panier ✓');
  }, [addToCart, toast]);

  const showNew = useCallback(() => {
    setFilters((f) => ({ ...f, newOnly: true }));
    scrollToGrid();
  }, [scrollToGrid]);

  const isHome = !urlSearch && !inlineSearch && !filters.categorySlug && !filters.newOnly;

  const activeCat = categoriesRaw.find((c) => c.slug && c.slug === filters.categorySlug);
  const gridTitle = urlSearch
    ? `Résultats pour « ${urlSearch} »`
    : filters.newOnly ? 'Nouveautés'
      : activeCat ? activeCat.name
        : 'Tous les produits';

  return (
    <div className="hn-page">
      <Header />

      {isHome && <Hero onShop={scrollToGrid} />}

      {isHome && !loading && featured.length > 0 && (
        <section className="hm-section">
          <div className="hm-wrap">
            <div className="hm-head">
              <h2 className="hm-head__title">Nos produits phares</h2>
              <Link to="/shopping" className="hm-link">Voir tout →</Link>
            </div>
            <div className="hn-grid">
              {featured.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isHome && !loading && newItems.length > 0 && (
        <section className="hm-section" style={{ paddingTop: 0 }}>
          <div className="hm-wrap">
            <ProductRow title="Nouveautés" items={newItems} onAddToCart={handleAddToCart} actionLabel="Tout voir" onAction={showNew} />
          </div>
        </section>
      )}

      <section ref={gridRef} className="hm-section" id="produits" style={{ paddingTop: isHome ? 0 : 28 }}>
        <div className="hm-wrap">
          {loading && <div className="hn-loadbar" role="progressbar" aria-label="Chargement des produits"><span /></div>}

          <div className="hm-head">
            <h2 className="hm-head__title">{gridTitle}</h2>
          </div>

          {loading ? (
            <Skeleton count={10} />
          ) : filtered.length === 0 ? (
            <div className="hm-empty">
              <Search size={44} strokeWidth={1.5} style={{ margin: '0 auto', color: '#cfcfcf' }} />
              <strong>Aucun produit trouvé</strong>
              <p>Essayez de modifier vos filtres ou votre recherche.</p>
              <button type="button" className="hm-pill hm-pill--primary" style={{ marginTop: 16 }} onClick={handleReset}>
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="hn-grid">
              {filtered.map((p, i) => (
                <ProductCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      {isHome && (
        <section className="hm-section" style={{ paddingTop: 0 }}>
          <div className="hm-wrap">
            <div className="hm-banner">
              <div>
                <h3>Vous ne trouvez pas ce que vous cherchez ?</h3>
                <p>Un article spécifique, une création sur mesure ? Notre équipe peut sourcer des produits et les personnaliser pour votre marque.</p>
                <div style={{ marginTop: 22 }}>
                  <Link to="/contact" className="hm-pill hm-pill--dark">Nous contacter <ArrowRight size={14} /></Link>
                </div>
              </div>
              {newItems[0] && <img src={imgOf(newItems[0])} alt="" className="hm-banner__img" loading="lazy" referrerPolicy="no-referrer" />}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}

export default HomeNew;