import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, List, Search, ShoppingCart, Package, Truck, ShieldCheck,
  ChevronLeft, ChevronRight, ArrowRight, Tag, Image as ImageIcon, Check,
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
import { getProductImage, getProductImages } from '../utils/imageUrl';
import { getMoqRules } from '../utils/importMoq';
import { useToast } from '../components/ui/ToastProvider';
import homeBgImg from '../images/homebg.png';
import './HomeNew.css';

/* ── Styles (style Alibaba : fond blanc, prix noir, accent orange) ───── */
const CSS = `
:root {
  --hb: #1f63d6;
  --hb-dark: #144aa8;
  --hb-soft: #eef5ff;
  --hb-ink: #222222;
  --hb-mute: #757575;
  --or: #ff6a00;
  --line: #ececec;
}

.hn-page { background: #f5f5f5; -webkit-tap-highlight-color: transparent; overscroll-behavior-y: none; }
.hn-page button, .hn-page a { touch-action: manipulation; }
.hm-wrap { width: 100%; max-width: 1280px; margin: 0 auto; padding: 0 20px; }

/* Barre de catégories */
.hm-catbar { background: #fff; border-bottom: 1px solid var(--line); }
.hm-pills { display: flex; gap: 10px; padding: 14px 0; overflow-x: auto; scrollbar-width: none; scroll-behavior: smooth; }
.hm-pills::-webkit-scrollbar { display: none; }
.hm-chip { flex-shrink: 0; height: 36px; padding: 0 18px; border-radius: 999px; border: 1px solid #e0e0e0; background: #fff; font-family: inherit; font-size: 14px; font-weight: 500; color: #333; cursor: pointer; white-space: nowrap; transition: all .18s ease; }
.hm-chip:hover { border-color: var(--or); color: var(--or); }
.hm-chip--on { background: var(--or); border-color: var(--or); color: #fff; font-weight: 600; }

/* Boutons */
.hm-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 42px; padding: 0 22px; border-radius: 999px; border: 1.5px solid transparent; font-family: inherit; font-size: 14px; font-weight: 700; cursor: pointer; white-space: nowrap; text-decoration: none; transition: background .15s ease, color .15s ease, border-color .15s ease, transform .12s ease; }
.hm-pill:active { transform: scale(.97); }
.hm-pill--primary { background: var(--or); color: #fff; }
.hm-pill--primary:hover { background: #e85f00; }
.hm-pill--light { background: #fff; color: var(--hb-ink); }
.hm-pill--light:hover { background: #f5f5f5; }
.hm-pill--dark { background: var(--hb-ink); color: #fff; }
.hm-pill--dark:hover { background: #000; }
.hm-pill--ghost { background: transparent; border-color: #d9d9d9; color: var(--hb-ink); height: 36px; font-size: 13px; }
.hm-pill--ghost:hover { background: var(--or); border-color: var(--or); color: #fff; }
.hm-arrow { width: 34px; height: 34px; padding: 0; border-radius: 50%; border: 1px solid #d9d9d9; background: #fff; color: var(--hb-ink); display: inline-flex; align-items: center; justify-content: center; cursor: pointer; }
.hm-arrow:hover { background: var(--or); border-color: var(--or); color: #fff; }

/* Hero */
.hm-hero { background: linear-gradient(180deg, #fff3ea 0%, #ffffff 100%); padding: 64px 0 56px; overflow: hidden; }
.hm-hero__wrap { max-width: 1400px; padding-left: 48px; padding-right: 48px; }
.hm-hero__grid { display: grid; grid-template-columns: 1fr; gap: 36px; align-items: center; }
@media (min-width: 900px) { .hm-hero__grid { grid-template-columns: 1.05fr 0.95fr; gap: 64px; } }
.hm-hero__copy { max-width: 620px; }
.hm-hero__eyebrow { display: inline-block; font-size: 14px; font-weight: 800; letter-spacing: .1em; text-transform: uppercase; color: var(--or); margin-bottom: 18px; }
.hm-hero__title { margin: 0; font-size: clamp(44px, 5.8vw, 88px); font-weight: 900; line-height: 1.02; letter-spacing: -0.035em; color: var(--hb-ink); }
.hm-hero__lead { margin: 22px 0 0; max-width: 560px; font-size: clamp(17px, 1.5vw, 21px); line-height: 1.6; color: #555; }
.hm-cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 34px; }
.hm-hero .hm-pill { height: 54px; padding: 0 32px; font-size: 16px; }
.hm-hero__media { display: flex; align-items: center; justify-content: center; min-width: 0; }
.hm-hero__img { width: 100%; max-width: 640px; height: auto; max-height: 560px; object-fit: contain; filter: drop-shadow(0 24px 40px rgba(0,0,0,.14)); user-select: none; pointer-events: none; }

.hm-bento { display: grid; grid-template-columns: 1.2fr 1fr; grid-template-rows: 180px 180px; gap: 12px; }
.hm-bento > :nth-child(1) { grid-row: 1 / span 2; }
.hm-tile { position: relative; display: block; overflow: hidden; border-radius: 12px; background: #fff; cursor: pointer; color: var(--hb-ink); }
.hm-tile__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; padding: 14px; transition: transform .5s ease; }
@media (hover: hover) { .hm-tile:hover .hm-tile__img { transform: scale(1.05); } }
.hm-tile__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,.55), rgba(0,0,0,0) 55%); }
.hm-tile__go { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; border-radius: 50%; background: #fff; color: var(--hb-ink); display: flex; align-items: center; justify-content: center; }
.hm-tile__text { position: absolute; left: 16px; right: 16px; bottom: 14px; display: flex; flex-direction: column; gap: 2px; color: #fff; }
.hm-tile__text strong { font-size: 17px; font-weight: 800; }
.hm-tile__text span { font-size: 12.5px; opacity: .9; }
.hm-offer { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: 22px; border-radius: 12px; background: #fff; color: var(--hb-ink); }
.hm-offer__tag { display: inline-flex; padding: 3px 10px; border-radius: 999px; background: #fff0e6; color: var(--or); font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.hm-offer p { margin: 0; font-size: 18px; line-height: 1.25; font-weight: 800; }

/* Réassurance */
.hm-trust { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; margin-top: -24px; position: relative; }
.hm-feat { display: flex; flex-direction: column; gap: 10px; padding: 18px; border-radius: 12px; background: #fff; border: 1px solid var(--line); box-shadow: 0 6px 18px -12px rgba(0,0,0,.18); transition: transform .25s ease, box-shadow .25s ease; }
@media (hover: hover) { .hm-feat:hover { transform: translateY(-3px); box-shadow: 0 12px 24px -12px rgba(255,106,0,.25); } }
.hm-feat__icon { width: 40px; height: 40px; border-radius: 10px; background: #fff3ea; color: var(--or); display: flex; align-items: center; justify-content: center; }
.hm-feat strong { display: block; font-size: 15px; color: var(--hb-ink); }
.hm-feat p { margin: 4px 0 0; font-size: 13px; line-height: 1.5; color: var(--hb-mute); }

/* Sections */
.hm-section { padding: 36px 0; scroll-margin-top: 110px; }
.hm-section--tint { background: #fff; }
.hm-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 18px; }
.hm-head__title { margin: 0; font-size: clamp(22px, 2.6vw, 28px); font-weight: 800; letter-spacing: -0.02em; color: var(--hb-ink); }
.hm-head__lead { margin: 6px 0 0; font-size: 14px; color: var(--hb-mute); }
.hm-head__nav { display: flex; gap: 8px; }

/* Bandeau sur-mesure */
.hm-banner { display: grid; grid-template-columns: 1fr 1fr; align-items: center; gap: 20px; padding: 40px; border-radius: 12px; background: linear-gradient(120deg, #e8f1ff, #fff); overflow: hidden; }
.hm-banner h3 { margin: 0; font-size: clamp(24px, 3vw, 32px); font-weight: 800; letter-spacing: -0.02em; color: var(--hb-ink); line-height: 1.15; }
.hm-banner p { margin: 12px 0 0; font-size: 15px; line-height: 1.6; color: #555; max-width: 420px; }
.hm-banner__img { justify-self: end; width: 100%; max-width: 360px; height: 220px; object-fit: contain; }

/* ── Carte produit (style Alibaba) ── */
.pc { position: relative; display: flex; flex-direction: column; min-width: 0; cursor: pointer; color: var(--hb-ink); background: #fff; border-radius: 8px; padding: 8px; border: 1px solid transparent; transition: border-color .2s ease, box-shadow .2s ease, transform .15s ease; }
@media (hover: hover) { .pc:hover { border-color: #e6e6e6; box-shadow: 0 6px 18px rgba(0,0,0,.08); } }
.pc:active { transform: scale(.97); }
.pc__frame { position: relative; border-radius: 6px; background: #fff; overflow: hidden; }
.pc__track { display: flex; width: 100%; aspect-ratio: 1 / 1; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; overscroll-behavior-x: contain; }
.pc__track::-webkit-scrollbar { display: none; }
.pc__slide { flex: 0 0 100%; height: 100%; scroll-snap-align: center; display: flex; align-items: center; justify-content: center; padding: 6px; }
.pc__img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; transition: transform .4s ease; }
@media (hover: hover) { .pc:hover .pc__img { transform: scale(1.03); } }
.pc__ph { color: #cfcfcf; }

.pc__tag { position: absolute; top: 8px; left: 8px; z-index: 3; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; color: #fff; background: var(--hb); pointer-events: none; }
.pc__tag--promo { background: #ff4d00; }
.pc__tag--new { background: var(--hb-ink); }

.pc__cart { position: absolute; top: 8px; right: 8px; z-index: 3; width: 34px; height: 34px; border: 0; border-radius: 50%; background: #fff; color: var(--hb-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.12); transition: background .15s ease, color .15s ease; }
.pc__cart:hover { background: var(--or); color: #fff; }
.pc__cart--done { background: var(--or); color: #fff; }

.pc__nav { position: absolute; top: 50%; z-index: 3; width: 26px; height: 26px; margin-top: -13px; padding: 0; border: 0; border-radius: 50%; background: rgba(255,255,255,.96); color: var(--hb-ink); display: none; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,.18); }
.pc__nav--prev { left: 6px; }
.pc__nav--next { right: 6px; }
@media (hover: hover) { .pc__nav { display: flex; opacity: 0; transition: opacity .2s ease; } .pc:hover .pc__nav { opacity: 1; } }

.pc__dots { display: flex; justify-content: center; gap: 5px; margin-top: 6px; min-height: 6px; }
.pc__dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 3px; background: #d6d6d6; cursor: pointer; transition: width .25s ease, background .25s ease; }
.pc__dot--on { width: 14px; background: var(--or); }

.pc__title { margin: 8px 0 0; font-size: 14px; line-height: 1.4; font-weight: 400; color: var(--hb-ink); display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 39px; }
.pc__price-row { display: flex; align-items: baseline; gap: 6px; margin-top: 4px; flex-wrap: wrap; }
.pc__price { font-size: 18px; font-weight: 800; color: var(--hb-ink); }
.pc__price--promo { color: #ff4d00; }
.pc__old { font-size: 12px; color: #9a9a9a; text-decoration: line-through; }
.pc__moq { margin: 2px 0 0; font-size: 12px; color: var(--hb-mute); }

/* Vue liste */
.hn-grid--list .pc { display: grid; grid-template-columns: 170px minmax(0, 1fr); column-gap: 20px; align-items: center; padding: 12px; border: 1px solid var(--line); border-radius: 8px; }
.hn-grid--list .pc__frame { border-radius: 6px; }
.hn-grid--list .pc__dots { display: none; }
.hn-grid--list .pc__title { margin-top: 0; font-size: 16px; min-height: 0; }

/* Grilles */
.hn-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
@media (min-width: 720px) { .hn-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 14px; } }
@media (min-width: 1040px) { .hn-grid { grid-template-columns: repeat(5, minmax(0, 1fr)); } }
.hn-grid--list { grid-template-columns: 1fr; gap: 12px; }

/* Rangée horizontale */
.hm-row { display: flex; gap: 12px; overflow-x: auto; scroll-snap-type: x mandatory; scrollbar-width: none; padding-bottom: 6px; -webkit-overflow-scrolling: touch; }
.hm-row::-webkit-scrollbar { display: none; }
.hm-row > .pc { flex: 0 0 200px; scroll-snap-align: start; }

/* Chargement */
@keyframes hnSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes hnBar { from { transform: translateX(-100%); } to { transform: translateX(380%); } }
.hn-sk { position: relative; overflow: hidden; background: #ededed; border-radius: 6px; }
.hn-sk::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255,255,255,.8), transparent); animation: hnSweep 1.3s infinite; }
.hn-loadbar { position: relative; height: 3px; margin: 0 0 12px; border-radius: 3px; background: #ffe7d6; overflow: hidden; }
.hn-loadbar span { position: absolute; top: 0; bottom: 0; left: 0; width: 28%; border-radius: 3px; background: var(--or); animation: hnBar 1.1s ease-in-out infinite; }

/* Barre d'outils */
.hm-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 18px; }
.hm-toolbar__count { margin: 6px 0 0; font-size: 13px; color: var(--hb-mute); }
.hm-toolbar__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.hm-sort-select { height: 36px; padding: 0 12px; border: 1px solid #d9d9d9; border-radius: 6px; background: #fff; color: var(--hb-ink); font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; outline: none; }
.hm-sort-select:focus { border-color: var(--or); }
.hm-view-toggle { display: flex; background: #f0f0f0; border-radius: 6px; padding: 3px; gap: 2px; }
.hm-view-btn { width: 30px; height: 30px; border: none; border-radius: 4px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #8a8a8a; }
.hm-view-btn--on { background: #fff; color: var(--or); box-shadow: 0 1px 3px rgba(0,0,0,.1); }
.hm-empty { text-align: center; padding: 70px 16px; color: var(--hb-mute); background: #fff; border-radius: 8px; }
.hm-empty strong { display: block; margin: 10px 0 6px; font-size: 18px; color: var(--hb-ink); }

/* ── Responsive : tablette ── */
@media (max-width: 1024px) {
  .hm-hero__wrap { padding-left: 32px; padding-right: 32px; }
}

/* ── Responsive : mobile (expérience app) ── */
@media (max-width: 899px) {
  .hm-hero { padding: 36px 0 40px; }
  .hm-hero__wrap { padding-left: 20px; padding-right: 20px; }
  .hm-hero__grid { gap: 28px; }
  .hm-hero__title { font-size: clamp(36px, 9.5vw, 52px); }
  .hm-hero__lead { font-size: 16px; margin-top: 16px; }
  .hm-hero__eyebrow { font-size: 12px; margin-bottom: 12px; }
  .hm-cta { margin-top: 24px; gap: 10px; }
  .hm-hero .hm-pill { flex: 1 1 calc(50% - 5px); height: 50px; font-size: 15px; padding: 0 16px; }
  .hm-hero__img { max-width: 420px; max-height: 340px; }
  .hm-bento { grid-template-rows: 160px 150px; gap: 8px; }
  .hm-trust { margin-top: -16px; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .hm-feat { padding: 14px; border-radius: 14px; }
  .hm-feat p { font-size: 12px; }
  .hm-banner { grid-template-columns: 1fr; padding: 28px; }
  .hm-banner__img { justify-self: center; }
  .hm-offer p { font-size: 16px; }
}

@media (max-width: 767px) {
  .hm-wrap { padding: 0 16px; }
  .hm-section { padding: 26px 0; scroll-margin-top: 90px; }
  .hm-head { margin-bottom: 14px; }
  .hm-head__title { font-size: 21px; }
  .hm-head__lead { font-size: 13px; }
  .hm-head__nav { display: none; }
  .hm-pill--ghost { height: 34px; font-size: 12px; }
  .hm-row { gap: 10px; margin: 0 -16px; padding: 0 16px 8px; scroll-padding: 0 16px; }
  .hm-row > .pc { flex-basis: 158px; }
  .hn-grid { gap: 10px; }
  .pc { padding: 6px; }
  .pc__title { font-size: 13px; min-height: 36px; }
  .pc__price { font-size: 16px; }
  .hm-toolbar { margin-bottom: 14px; }
  .hm-empty { padding: 48px 16px; }
  .hm-banner { padding: 22px; }
  .hm-banner h3 { font-size: 22px; }
}

@media (max-width: 520px) {
  .hm-hero__title { font-size: clamp(32px, 10vw, 42px); }
  .hm-hero .hm-pill { font-size: 14px; }
  .hm-hero__img { max-height: 280px; }
  .hm-bento { grid-template-rows: 150px 140px; }
  .hm-row > .pc { flex-basis: 150px; }
  .hn-grid--list .pc { grid-template-columns: 110px minmax(0, 1fr); column-gap: 12px; }
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

const discountOf = (p) => {
  const pr = Number(p?.price || 0);
  const pp = Number(p?.promoPrice || p?.salePrice || 0);
  return pp > 0 && pp < pr ? Math.round((1 - pp / pr) * 100) : 0;
};

/* ─── Carte produit : slides + points ───────────────────────────────── */
function ProductCard({ product, onAddToCart, index = 0 }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);
  const trackRef = useRef(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [failed, setFailed] = useState(() => new Set());

  const s = useMemo(() => sanitizeProductForDisplay(product) || product, [product]);
  const name = s.name || s.title || 'Produit';
  const price = Number(s.price || s.unitPrice || 0);
  const promoPrice = Number(s.promoPrice || s.salePrice || 0);
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const isNew = s.isNew || s.isNewArrival;
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

  let tag = null;
  if (discount > 0) tag = { label: `-${discount}%`, cls: 'pc__tag--promo' };
  else if (isNew) tag = { label: 'Nouveau', cls: 'pc__tag--new' };
  else if (isAlibabaProduct(s)) tag = { label: 'Import direct', cls: '' };

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
          {adding ? <Check size={17} strokeWidth={2} /> : <ShoppingCart size={17} strokeWidth={1.8} />}
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
              <ChevronLeft size={15} />
            </button>
            <button type="button" className="pc__nav pc__nav--next" aria-label="Image suivante" onClick={(e) => { stop(e); goTo(activeSlide + 1); }}>
              <ChevronRight size={15} />
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

      <div className="pc__price-row">
        {amountOf(displayPrice) && (
          <span className={`pc__price${hasPromo ? ' pc__price--promo' : ''}`}>{amountOf(displayPrice)} FCFA</span>
        )}
        {hasPromo && amountOf(price) && <span className="pc__old">{amountOf(price)} FCFA</span>}
      </div>

      {moq > 1 && <p className="pc__moq">MOQ : {moq} pièces</p>}
    </article>
  );
}

/* ─── Rangée horizontale avec flèches ───────────────────────────────── */
function ProductRow({ title, lead, items, onAddToCart, onAction, actionLabel }) {
  const rowRef = useRef(null);
  const scrollBy = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };
  return (
    <div>
      <div className="hm-head">
        <div>
          <h2 className="hm-head__title">{title}</h2>
          {lead && <p className="hm-head__lead">{lead}</p>}
        </div>
        <div className="hm-head__nav">
          {onAction && (
            <button type="button" className="hm-pill hm-pill--ghost" onClick={onAction}>{actionLabel} <ArrowRight size={14} /></button>
          )}
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
function Skeleton({ count = 12 }) {
  return (
    <div className="hn-grid" aria-busy="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i}>
          <div className="hn-sk" style={{ aspectRatio: '1 / 1', borderRadius: 8 }} />
          <div className="hn-sk" style={{ height: 14, width: '80%', marginTop: 12 }} />
          <div className="hn-sk" style={{ height: 12, width: '40%', marginTop: 8 }} />
        </div>
      ))}
    </div>
  );
}

/* ─── Hero : texte et image agrandis, marges latérales, responsive ─── */
function Hero({ onShop, onNew }) {
  return (
    <section className="hm-hero">
      <div className="hm-wrap hm-hero__wrap">
        <div className="hm-hero__grid">
          <div className="hm-hero__copy">
            <span className="hm-hero__eyebrow">Commandez depuis la Chine</span>
            <h1 className="hm-hero__title">Depuis la Chine, vers l'Afrique de l'Ouest</h1>
            <p className="hm-hero__lead">
              Faites connaître votre marque avec des articles de qualité, produits directement en usine et livrés rapidement au Togo et au Bénin.
            </p>
            <div className="hm-cta">
              <button type="button" className="hm-pill hm-pill--primary" onClick={onShop}>
                Voir les produits <ArrowRight size={16} />
              </button>
              <button type="button" className="hm-pill hm-pill--light" onClick={onNew}>
                Nouveautés
              </button>
            </div>
          </div>

          <div className="hm-hero__media">
            <img
              src={homeBgImg}
              alt="Dango Import Shopping"
              className="hm-hero__img"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Composant principal ───────────────────────────────────────────── */
const DEFAULT_FILTERS = {
  minPrice: '', maxPrice: '', rating: '',
  inStock: false, onlyPromo: false, newOnly: false, brand: '',
  sort: 'newest', categorySlug: '',
};

function HomeNew() {
  const location = useLocation();
  const { addToCart } = useCart();
  const toast = useToast();
  const gridRef = useRef(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [view, setView] = useState('grid');
  const [inlineSearch, setInlineSearch] = useState('');

  const scrollToGrid = useCallback(() => {
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []);

  const urlSearch = new URLSearchParams(location.search).get('q')?.trim() || '';
  const urlCategory = new URLSearchParams(location.search).get('category')?.trim() || '';

  useEffect(() => {
    if (urlCategory) {
      setFilters(f => ({ ...f, categorySlug: urlCategory }));
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

  const newItems = useMemo(() => products.filter((p) => p.isNew && imgOf(p)).slice(0, 12), [products]);
  const promoItems = useMemo(() => products.filter((p) => discountOf(p) > 0 && imgOf(p)).slice(0, 12), [products]);

  const handleReset = useCallback(() => { setFilters(DEFAULT_FILTERS); setInlineSearch(''); }, []);

  const handleAddToCart = useCallback((p, qty) => {
    addToCart(p, qty || 1);
    toast?.success?.('Ajouté au panier ✓');
  }, [addToCart, toast]);

  const catPills = useMemo(() => {
    const all = (Array.isArray(CATEGORY_LINKS) ? CATEGORY_LINKS : []).map(item => ({
      slug: item.slug,
      label: item.label || item.slug,
    }));
    (categoriesRaw || []).forEach(c => {
      if (!all.find(x => x.slug === c.slug)) all.push({ slug: c.slug, label: c.name });
    });
    return [{ slug: '', label: 'Tout' }, ...all.slice(0, 12)];
  }, [categoriesRaw]);

  const isHome = !urlSearch && !inlineSearch && !filters.categorySlug && !filters.onlyPromo && !filters.newOnly;

  const showPromos = useCallback(() => { setFilters(f => ({ ...f, onlyPromo: true })); scrollToGrid(); }, [scrollToGrid]);
  const showNew = useCallback(() => { setFilters(f => ({ ...f, newOnly: true })); scrollToGrid(); }, [scrollToGrid]);

  const activeCat = catPills.find((c) => c.slug && c.slug === filters.categorySlug);
  const gridTitle = urlSearch
    ? `Résultats pour « ${urlSearch} »`
    : filters.onlyPromo ? 'Promotions'
      : filters.newOnly ? 'Nouveautés'
        : activeCat ? activeCat.label
          : 'Tous les produits';
  const countLabel = `${filtered.length} produit${filtered.length !== 1 ? 's' : ''}`;

  return (
    <div className="hn-page">
      <Header />

      {isHome && (
        <Hero onShop={scrollToGrid} onPromo={showPromos} onNew={showNew} />
      )}


      {isHome && !loading && newItems.length > 0 && (
        <section className="hm-section">
          <div className="hm-wrap">
            <ProductRow title="Nouveautés" lead="Les derniers arrivages, prêts à personnaliser." items={newItems} onAddToCart={handleAddToCart} actionLabel="Tout voir" onAction={showNew} />
          </div>
        </section>
      )}


      {isHome && !loading && promoItems.length > 0 && (
        <section className="hm-section hm-section--tint">
          <div className="hm-wrap">
            <ProductRow title="Promotions" lead="Des prix réduits sur une sélection." items={promoItems} onAddToCart={handleAddToCart} actionLabel="Voir les offres" onAction={showPromos} />
          </div>
        </section>
      )}

      <section ref={gridRef} className="hm-section" id="produits">
        <div className="hm-wrap">
          {loading && <div className="hn-loadbar" role="progressbar" aria-label="Chargement des produits"><span /></div>}

          <div className="hm-toolbar">
            <div>
              <h2 className="hm-head__title">{gridTitle}</h2>
              <p className="hm-toolbar__count">
                {loading ? <span className="hn-sk" style={{ display: 'inline-block', width: 110, height: 14, verticalAlign: 'middle' }} /> : countLabel}
              </p>
            </div>
            
          </div>

          {loading ? (
            <Skeleton count={12} />
          ) : filtered.length === 0 ? (
            <div className="hm-empty">
              <Search size={44} strokeWidth={1.5} style={{ margin: '0 auto', color: '#cfcfcf' }} />
              <strong>Aucun produit trouvé</strong>
              <p>Essayez de modifier vos filtres ou votre recherche.</p>
              <button type="button" className="hm-pill hm-pill--primary" onClick={handleReset}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className={`hn-grid${view === 'list' ? ' hn-grid--list' : ''}`}>
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
                <div className="hm-cta">
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