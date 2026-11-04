import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, List, Search, ShoppingCart, Package, Truck, ShieldCheck,
  ChevronLeft, ChevronRight, ArrowRight, Factory, CreditCard,
  Check,
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
import { isProductOnPromo, getDiscountPercent } from '../utils/productPromo';
import { useToast } from '../components/ui/ToastProvider';
import './HomeNew.css';

/* ── Style de la carte produit, intégré au composant ─────────────────────
   Injecté une seule fois dans <head> (id « pc3-home-styles »), après HomeNew.css :
   il passe donc devant l'ancien style .hn-card. */
const CARD_CSS = `
.pc3 {
  --pc-ink: #12222e; --pc-mute: #8a959d; --pc-orange: #ff6b00;
  position: relative; display: flex; flex-direction: column; width: 100%; min-width: 0;
  container-type: inline-size; cursor: pointer;
  padding: 14px 16px 16px; border-radius: 24px; background: #fff; color: var(--pc-ink);
  border: 1px solid #eef0f4;
  box-shadow: 0 10px 28px -14px rgba(18, 34, 46, 0.16), 0 1px 4px rgba(18, 34, 46, 0.05);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.pc3 *, .pc3 *::before, .pc3 *::after { box-sizing: border-box; }
@media (hover: hover) {
  .pc3:hover { transform: translateY(-4px); box-shadow: 0 18px 38px -14px rgba(18, 34, 46, 0.2), 0 2px 8px rgba(18, 34, 46, 0.06); }
}

.pc3__tag { position: absolute; top: 14px; left: 12px; z-index: 3; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600; line-height: 1.25; color: #fff; transform: rotate(-3deg); box-shadow: 0 3px 6px rgba(18, 34, 46, 0.16); pointer-events: none; white-space: nowrap; }
.pc3__tag--red { background: #e5202e; }
.pc3__tag--blue { background: #0a63d6; }
.pc3__tag--yellow { background: #ffd400; color: #12222e; }
.pc3__tag--gray { background: #6b7780; }

.pc3__btn { position: absolute; right: 10px; z-index: 3; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--pc-ink); display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: 700; cursor: pointer; transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease; }
.pc3__btn:hover { color: #fff; background: var(--pc-orange); }
.pc3__btn:active { transform: scale(0.92); }
.pc3__btn:focus-visible { outline: 2px solid var(--pc-orange); outline-offset: 2px; }
.pc3__cart { top: 10px; }
.pc3__cart--done { color: #fff; background: #0f8a5f; }

.pc3__media { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; margin-top: 18px; overflow: hidden; border-radius: 16px; }
.pc3__img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; transition: transform 0.4s ease; display: block; }
.pc3__ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #cbd5e1; }
@media (hover: hover) { .pc3:hover .pc3__img { transform: scale(1.05) rotate(-1deg); } }

.pc3__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 10px; min-width: 0; }
.pc3__text { flex: 1 1 0; min-width: 0; }
.pc3__title { margin: 0; font-size: 16px; line-height: 1.25; font-weight: 700; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.pc3__sub { margin: 3px 0 0; font-size: 13px; line-height: 1.3; color: var(--pc-mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

.pc3__pricebox { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; }
.pc3__price { display: inline-flex; align-items: flex-end; gap: 2px; color: var(--pc-ink); }
.pc3__price--promo { color: var(--pc-orange); }
.pc3__amount { font-size: 24px; font-size: clamp(18px, 11cqw, 32px); font-weight: 800; line-height: 1; letter-spacing: -0.04em; white-space: nowrap; }
.pc3__unit { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 12px; font-weight: 400; line-height: 1; letter-spacing: 0.04em; color: var(--pc-mute); }
.pc3__old { margin-top: 4px; font-size: 12px; color: var(--pc-mute); text-decoration: line-through; white-space: nowrap; }

/* Grille de l'accueil : plus d'air pour laisser respirer les ombres */
.hn-page .hn-grid { gap: 26px 18px; padding-bottom: 8px; }

/* Vue liste : carte horizontale */
.hn-page .hn-grid--list { gap: 18px; }
.hn-grid--list .pc3 { display: grid; grid-template-columns: 150px minmax(0, 1fr); align-items: center; column-gap: 20px; }
.hn-grid--list .pc3__media { grid-column: 1; margin-top: 0; }
.hn-grid--list .pc3__foot { grid-column: 2; margin-top: 0; padding-right: 48px; }
.hn-grid--list .pc3__title { font-size: 17px; }

@media (max-width: 639px) {
  .hn-page .hn-grid { gap: 18px 10px; }
  .pc3 { padding: 10px 12px 12px; border-radius: 20px; }
  .pc3__tag { top: 10px; left: 8px; font-size: 11px; padding: 3px 9px; }
  .pc3__btn { right: 6px; width: 34px; height: 34px; }
  .pc3__cart { top: 6px; }
  .pc3__media { margin-top: 14px; }
  .pc3__title { font-size: 14px; }
  .pc3__sub { font-size: 12px; }
  .hn-grid--list .pc3 { grid-template-columns: 110px minmax(0, 1fr); column-gap: 12px; }
}

/* ── Entrée en cascade des cartes ── */
@keyframes pc3In { from { opacity: 0; transform: translateY(16px) scale(0.98); } to { opacity: 1; transform: none; } }
.pc3 { animation: pc3In 0.5s cubic-bezier(0.22, 0.9, 0.3, 1) backwards; animation-delay: calc(var(--i, 0) * 45ms); }

/* ── Slides : images secondaires du produit ── */
.pc3__media { background: #f4f5f6; }
.pc3__track { display: flex; width: 100%; height: 100%; overflow-x: auto; overflow-y: hidden; scroll-snap-type: x mandatory; overscroll-behavior-x: contain; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
.pc3__track::-webkit-scrollbar { display: none; }
.pc3__slide { flex: 0 0 100%; height: 100%; scroll-snap-align: center; scroll-snap-stop: always; }
/* L'image apparaît en fondu net une fois chargée */
.pc3__img { opacity: 0; filter: blur(8px); transform: scale(1.06); transition: opacity 0.5s ease, filter 0.5s ease, transform 0.6s ease; }
.pc3__img.is-loaded { opacity: 1; filter: none; transform: none; }
.pc3__media--loading::after { content: ''; position: absolute; inset: 0; z-index: 1; pointer-events: none; background: linear-gradient(100deg, transparent 20%, rgba(255, 255, 255, 0.8) 50%, transparent 80%); animation: hnSweep 1.3s infinite; }

.pc3__nav { position: absolute; top: 50%; z-index: 3; width: 30px; height: 30px; padding: 0; margin-top: -15px; border: 0; border-radius: 50%; background: rgba(255, 255, 255, 0.96); color: #12222e; display: none; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 2px 8px rgba(18, 34, 46, 0.2); transition: background 0.15s ease, color 0.15s ease, opacity 0.2s ease; opacity: 0; }
.pc3__nav:hover { background: #ff6b00; color: #fff; }
.pc3__nav--prev { left: 6px; }
.pc3__nav--next { right: 6px; }
@media (hover: hover) {
  .pc3__nav { display: flex; }
  .pc3:hover .pc3__nav { opacity: 1; }
}
.pc3__dots { position: absolute; left: 0; right: 0; bottom: 8px; z-index: 3; display: flex; justify-content: center; gap: 5px; pointer-events: none; }
.pc3__dot { width: 6px; height: 6px; padding: 0; border: 0; border-radius: 3px; background: rgba(18, 34, 46, 0.28); cursor: pointer; pointer-events: auto; transition: width 0.25s ease, background 0.25s ease; }
.pc3__dot--on { width: 18px; background: #ff6b00; }

/* ── Page de chargement animée ── */
@keyframes hnSweep { from { transform: translateX(-100%); } to { transform: translateX(100%); } }
@keyframes hnFloat { 0%, 100% { transform: translateY(0) rotate(-4deg) scale(1); } 50% { transform: translateY(-10px) rotate(4deg) scale(1.06); } }
@keyframes hnBar { from { transform: translateX(-100%); } to { transform: translateX(380%); } }
.hn-sk { position: relative; overflow: hidden; background: #eceff1; border-radius: 8px; }
.hn-sk::after { content: ''; position: absolute; inset: 0; background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent); animation: hnSweep 1.3s infinite; }
.hn-loadbar { position: relative; height: 3px; margin: 0 0 12px; border-radius: 3px; background: #ffe7d6; overflow: hidden; }
.hn-loadbar span { position: absolute; top: 0; bottom: 0; left: 0; width: 28%; border-radius: 3px; background: #ff6b00; animation: hnBar 1.1s ease-in-out infinite; }

.pc3-sk { pointer-events: none; cursor: default; }
.pc3-sk__tag { position: absolute; top: 16px; left: 14px; z-index: 3; width: 76px; height: 24px; border-radius: 4px; transform: rotate(-3deg); }
.pc3-sk__cart { position: absolute; top: 12px; right: 12px; z-index: 3; width: 34px; height: 34px; border-radius: 50%; }
.pc3-sk__media { display: flex; align-items: center; justify-content: center; border-radius: 16px; }
.pc3-sk__icon { position: relative; z-index: 1; color: #c3ccd2; animation: hnFloat 2.6s ease-in-out infinite; animation-delay: calc(var(--i, 0) * 120ms); }
.pc3-sk__line { display: block; height: 14px; margin-bottom: 8px; }
.pc3-sk__line--short { width: 55%; height: 11px; margin-bottom: 0; }
.pc3-sk__price { width: 64px; height: 30px; flex: 0 0 auto; }

@media (prefers-reduced-motion: reduce) {
  .pc3, .hn-sk::after, .pc3__media--loading::after, .pc3-sk__icon, .hn-loadbar span { animation: none !important; }
  .pc3__img { transition: none; filter: none; transform: none; opacity: 1; }
}

/* ═════════ Accueil : mélange marketplace (Alibaba) et mode éditorial ═════════ */
.hn-page { background: #fff; }
.hm-wrap { width: 100%; max-width: 1320px; margin: 0 auto; padding: 0 20px; }

.hm-pills { display: flex; gap: 8px; padding: 14px 0; overflow-x: auto; scrollbar-width: none; }
.hm-pills::-webkit-scrollbar { display: none; }
.hm-chip { flex-shrink: 0; height: 34px; padding: 0 18px; border-radius: 999px; border: 1.5px solid #e3e6ec; background: #fff; font-family: inherit; font-size: 13px; font-weight: 600; color: #4a5b68; cursor: pointer; white-space: nowrap; transition: all 0.18s ease; letter-spacing: 0.01em; }
.hm-chip:hover { border-color: #ff6b00; color: #ff6b00; background: #fff4ec; }
.hm-chip--on { background: #ff6b00; border-color: #ff6b00; color: #fff; font-weight: 700; }

.hm-pill { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 40px; padding: 0 20px; border-radius: 999px; border: 1px solid transparent; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease; }
.hm-pill--primary { background: #ff6b00; color: #fff; }
.hm-pill--primary:hover { background: #e55f00; }
.hm-pill--dark { background: #12222e; color: #fff; }
.hm-pill--dark:hover { background: #1f3647; }
.hm-pill--ghost { background: transparent; border-color: #cfd5dd; color: #12222e; }
.hm-pill--ghost:hover { background: #12222e; border-color: #12222e; color: #fff; }

/* Hero */
.hm-hero { background: #111827; padding: 56px 0 48px; }
.hm-hero__top { display: flex; justify-content: space-between; align-items: flex-start; gap: 28px; flex-wrap: wrap; margin-bottom: 36px; }
.hm-hero__eyebrow { display: inline-block; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #ff6b00; margin-bottom: 14px; }
.hm-hero__title { margin: 0; max-width: 680px; font-size: clamp(34px, 5vw, 60px); font-weight: 900; line-height: 1.0; letter-spacing: -0.04em; color: #ffffff; text-transform: uppercase; }
.hm-hero__title em { font-style: normal; color: #ff6b00; }
.hm-hero__lead { margin: 16px 0 0; max-width: 340px; font-size: 14px; line-height: 1.65; color: #9ca3af; }
.hm-cta { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 28px; }

.hm-bento { display: grid; grid-template-columns: 1.3fr 1fr 1fr; grid-template-rows: 200px 200px; gap: 14px; }
.hm-bento > :nth-child(1) { grid-row: 1 / span 2; }
.hm-bento > :nth-child(4) { grid-row: 1 / span 2; grid-column: 3; }
.hm-bento > :nth-child(2) { grid-column: 2; grid-row: 1; }
.hm-bento > :nth-child(3) { grid-column: 2; grid-row: 2; }

.hm-tile { position: relative; display: block; overflow: hidden; border-radius: 12px; background: linear-gradient(135deg, #1e2d3e, #12222e); cursor: pointer; color: #fff; text-align: left; }
.hm-tile__img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
@media (hover: hover) { .hm-tile:hover .hm-tile__img { transform: scale(1.06); } }
.hm-tile__shade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0) 55%); }
.hm-tile__go { position: absolute; top: 14px; right: 14px; width: 36px; height: 36px; border-radius: 50%; background: rgba(255, 107, 0, 0.9); color: #fff; display: flex; align-items: center; justify-content: center; }
.hm-tile__text { position: absolute; left: 18px; right: 18px; bottom: 16px; display: flex; flex-direction: column; gap: 2px; }
.hm-tile__text strong { font-size: 18px; font-weight: 800; letter-spacing: -0.02em; text-transform: uppercase; }
.hm-tile__text span { font-size: 12px; opacity: 0.75; }

.hm-offer { display: flex; flex-direction: column; align-items: flex-start; justify-content: space-between; padding: 22px; border-radius: 12px; background: #ff6b00; color: #fff; }
.hm-offer__tag { display: inline-flex; padding: 3px 10px; border-radius: 999px; border: 1px solid rgba(255,255,255,0.4); font-size: 11px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; }
.hm-offer p { margin: 0; font-size: 18px; line-height: 1.25; font-weight: 800; letter-spacing: -0.02em; }

/* Bande de confiance (réassurance) */
.hm-trust { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 22px 0; }
.hm-trust__item { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 500; color: #4a5b68; line-height: 1.35; }
.hm-trust__item svg { flex-shrink: 0; width: 34px; height: 34px; padding: 8px; border-radius: 50%; background: #fff1e6; color: #ff6b00; }

/* Sections */
.hm-section { padding: 56px 0; scroll-margin-top: 96px; }
.hm-section--tint { background: #f7f8fa; }
.hm-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 28px; }
.hm-head__eyebrow { font-size: 11px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #ff6b00; margin-bottom: 8px; display: block; }
.hm-head__title { margin: 0; font-size: clamp(26px, 3vw, 36px); font-weight: 900; letter-spacing: -0.03em; color: #111827; text-transform: uppercase; }
.hm-head__lead { margin: 8px 0 0; font-size: 14px; color: #6b7280; }

/* Catégories en mosaïque */
.hm-cats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); grid-auto-rows: 170px; gap: 12px; }
.hm-cats > :nth-child(1) { grid-row: span 2; }
.hm-cats > :nth-child(2) { grid-column: span 3; }
.hm-tile__label { position: absolute; left: 14px; bottom: 14px; display: inline-flex; align-items: center; gap: 6px; height: 36px; padding: 0 16px; border-radius: 999px; background: rgba(18, 34, 46, 0.78); backdrop-filter: blur(6px); color: #fff; font-size: 13px; font-weight: 600; }

/* Collections */
.hm-coll { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.hm-coll__card { position: relative; display: flex; align-items: center; min-height: 240px; padding: 32px; border-radius: 12px; background: #111827; overflow: hidden; }
.hm-coll__text { position: relative; z-index: 1; max-width: 54%; display: flex; flex-direction: column; align-items: flex-start; gap: 10px; }
.hm-coll__text h3 { margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.03em; color: #fff; text-transform: uppercase; }
.hm-coll__text p { margin: 0; font-size: 13px; line-height: 1.6; color: #9ca3af; }
.hm-coll__img { position: absolute; right: 0; top: 0; bottom: 0; width: 55%; height: 100%; object-fit: cover; -webkit-mask-image: linear-gradient(to right, transparent, #000 40%); mask-image: linear-gradient(to right, transparent, #000 40%); }

/* Barre d'outils des produits */
.hm-toolbar { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 14px; margin-bottom: 24px; }
.hm-toolbar__count { margin: 6px 0 0; font-size: 13px; color: #6b7280; }
.hm-toolbar__controls { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
.hm-clear { height: 34px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #12222e; background: #fff; color: #12222e; font-family: inherit; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; }
.hm-clear:hover { background: #12222e; color: #fff; }
.hm-empty { text-align: center; padding: 70px 16px; color: #6b7280; }
.hm-empty strong { display: block; margin: 10px 0 6px; font-size: 18px; color: #111827; }
.hm-sort-select { height: 36px; padding: 0 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: #fff; color: #111827; font-family: inherit; font-size: 13px; font-weight: 600; cursor: pointer; outline: none; transition: border-color 0.15s; }
.hm-sort-select:focus { border-color: #ff6b00; }
.hm-view-toggle { display: flex; background: #f3f4f6; border-radius: 8px; padding: 3px; gap: 2px; }
.hm-view-btn { width: 30px; height: 30px; border: none; border-radius: 6px; background: transparent; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #9ca3af; transition: all 0.15s; }
.hm-view-btn--on { background: #fff; color: #ff6b00; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }

/* Grille de produits : plus d'air */
.hm-section .hn-grid { gap: 28px 18px; }

@media (max-width: 900px) {
  .hm-bento { grid-template-columns: 1fr 1fr; grid-template-rows: 210px 190px 190px 210px; }
  .hm-bento > :nth-child(1) { grid-column: 1 / span 2; grid-row: 1; }
  .hm-bento > :nth-child(2) { grid-column: 1; grid-row: 2; }
  .hm-bento > :nth-child(3) { grid-column: 2; grid-row: 2; }
  .hm-bento > :nth-child(4) { grid-column: 1 / span 2; grid-row: 3; }
  .hm-cats { grid-template-columns: repeat(2, minmax(0, 1fr)); grid-auto-rows: 150px; }
  .hm-cats > :nth-child(1), .hm-cats > :nth-child(2) { grid-column: span 1; grid-row: span 1; }
  .hm-coll { grid-template-columns: 1fr; }
  .hm-trust { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 520px) {
  .hm-wrap { padding: 0 14px; }
  .hm-hero { padding: 26px 0 24px; }
  .hm-bento { grid-template-rows: 190px 170px 170px 190px; gap: 10px; }
  .hm-offer p { font-size: 17px; }
  .hm-coll__text { max-width: 60%; }
  .hm-section { padding: 30px 0; }
}
`;

if (typeof document !== 'undefined') {
  let styleEl = document.getElementById('pc3-home-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'pc3-home-styles';
    document.head.appendChild(styleEl);
  }
  if (styleEl.textContent !== CARD_CSS) styleEl.textContent = CARD_CSS;
}

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function formatXOF(n) {
  if (!n && n !== 0) return '';
  return Number(n).toLocaleString('fr-FR') + ' XOF';
}

const amountOf = (n) => {
  const x = Number(n);
  return Number.isFinite(x) && x > 0 ? x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : null;
};

export function getProductMetaTags(product) {
  const s = sanitizeProductForDisplay(product) || product;
  const moq = Number(getMoqRules(s).moq || 1);

  if (moq <= 1) return [];
  return [`MOQ ${moq}`];
}

function ProductMetaLine({ product }) {
  const tags = getProductMetaTags(product);

  if (!tags.length) return null;
  return (
    <div className="hn-card__meta">
      {tags.map((tag, index) => (
        <span key={`${tag}-${index}`} className="hn-card__meta-item">{tag}</span>
      ))}
    </div>
  );
}

/* ─── Slides d'images : image principale + images secondaires ────────────
   Glisser au doigt (mobile), flèches et points, défilement automatique au survol. */
function CardSlider({ images, name }) {
  const trackRef = useRef(null);
  const idxRef = useRef(0);
  const timerRef = useRef(null);
  const goToRef = useRef(() => {});
  const [index, setIndex] = useState(0);
  const [loaded, setLoaded] = useState(() => new Set());
  const [failed, setFailed] = useState(() => new Set());

  const slides = useMemo(() => images.filter((src) => !failed.has(src)), [images, failed]);
  const count = slides.length;

  const markLoaded = useCallback((src) => {
    setLoaded((prev) => (prev.has(src) ? prev : new Set(prev).add(src)));
  }, []);

  const goTo = useCallback((i) => {
    const el = trackRef.current;
    if (!el || count < 1) return;
    const next = ((i % count) + count) % count;
    const wrapped = Math.abs(next - idxRef.current) > 1;
    idxRef.current = next;
    setIndex(next);
    el.scrollTo({ left: next * el.clientWidth, behavior: wrapped ? 'auto' : 'smooth' });
  }, [count]);
  goToRef.current = goTo;

  const onScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== idxRef.current) { idxRef.current = i; setIndex(i); }
  };

  /* images déjà en cache : pas d'attente du onLoad */
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    el.querySelectorAll('img').forEach((im) => {
      if (im.complete && im.naturalWidth) markLoaded(im.getAttribute('src'));
    });
  }, [slides, markLoaded]);

  const stopAuto = useCallback((reset) => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    if (reset && idxRef.current !== 0) goToRef.current(0);
  }, []);
  const startAuto = () => {
    if (count < 2 || timerRef.current) return;
    slides.slice(1).forEach((src) => { const im = new Image(); im.src = src; });
    timerRef.current = setInterval(() => goToRef.current(idxRef.current + 1), 1300);
  };
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const stop = (e) => { e.stopPropagation(); e.preventDefault(); };

  return (
    <div
      className={`pc3__media${loaded.size === 0 && count > 0 ? ' pc3__media--loading' : ''}`}
      onMouseEnter={startAuto}
      onMouseLeave={() => stopAuto(true)}
    >
      {count === 0 ? (
        <div className="pc3__ph"><Package size={32} strokeWidth={1.5} /></div>
      ) : (
        <div ref={trackRef} className="pc3__track" onScroll={onScroll}>
          {slides.map((src, i) => (
            <div className="pc3__slide" key={src}>
              <img
                src={src}
                alt={i === 0 ? name : `${name} (${i + 1})`}
                className={`pc3__img${loaded.has(src) ? ' is-loaded' : ''}`}
                loading={i === 0 ? 'eager' : 'lazy'}
                draggable={false}
                onLoad={() => markLoaded(src)}
                onError={() => setFailed((prev) => new Set(prev).add(src))}
              />
            </div>
          ))}
        </div>
      )}

      {count > 1 && (
        <>
          <button type="button" className="pc3__nav pc3__nav--prev" aria-label="Image précédente" onClick={(e) => { stop(e); stopAuto(false); goTo(idxRef.current - 1); }}>
            <ChevronLeft size={16} />
          </button>
          <button type="button" className="pc3__nav pc3__nav--next" aria-label="Image suivante" onClick={(e) => { stop(e); stopAuto(false); goTo(idxRef.current + 1); }}>
            <ChevronRight size={16} />
          </button>
          <div className="pc3__dots">
            {slides.map((src, i) => (
              <button
                key={src}
                type="button"
                aria-label={`Image ${i + 1}`}
                className={`pc3__dot${i === index ? ' pc3__dot--on' : ''}`}
                onClick={(e) => { stop(e); stopAuto(false); goTo(i); }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Carte produit : carte arrondie, pastille inclinée, gros prix ───────── */
function ProductMiniCard({ product, onAddToCart, index = 0 }) {
  const navigate = useNavigate();
  const [adding, setAdding] = useState(false);

  const s = useMemo(() => sanitizeProductForDisplay(product) || product, [product]);
  const img = getProductImage(s) || s?.images?.[0]?.url || s?.images?.[0] || s?.image;
  const name = s.name || s.title || 'Produit';
  const promoPrice = s.promoPrice || s.salePrice;
  const price = s.price || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const isNew = s.isNew || s.isNewArrival;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const productId = s._id || s.id;

  /* Image principale puis images secondaires (6 au maximum, sans doublon) */
  const gallery = useMemo(() => {
    let list = [];
    try { list = getProductImages(s, 6) || []; } catch (e) { list = []; }
    if (!list.length && Array.isArray(s?.images)) {
      list = s.images.map((x) => (typeof x === 'string' ? x : x?.url)).filter(Boolean);
    }
    const merged = [img, ...list].filter((x) => typeof x === 'string' && x);
    return Array.from(new Set(merged)).slice(0, 6);
  }, [s, img]);

  /* Pastille : promo, sinon nouveau, sinon produit importé */
  let tag = null;
  if (discount > 0) tag = { label: `-${discount}%`, tone: 'red' };
  else if (isNew) tag = { label: 'Nouveau', tone: 'yellow' };
  else if (isAlibabaProduct(s)) tag = { label: 'Import direct', tone: 'blue' };

  /* Détail sous le nom : commande minimum, sinon marque, sinon catégorie */
  const moq = Number(getMoqRules(s).moq || 1);
  const categoryName = typeof s.category === 'string' ? s.category : s.category?.name;
  const subtitle = moq > 1 ? `Min. ${moq} unités` : (s.brand || categoryName || '');

  const amount = amountOf(displayPrice);
  const oldAmount = hasPromo ? amountOf(price) : null;

  const handleAdd = (e) => {
    e.stopPropagation();
    setAdding(true);
    if (onAddToCart) onAddToCart(s, 1);
    setTimeout(() => setAdding(false), 900);
  };

  return (
    <article className="pc3" style={{ '--i': Math.min(index, 14) }} onClick={() => navigate(`/product/${productId}`)}>
      {tag && <span className={`pc3__tag pc3__tag--${tag.tone}`}>{tag.label}</span>}

      <button
        type="button"
        className={`pc3__btn pc3__cart${adding ? ' pc3__cart--done' : ''}`}
        onClick={handleAdd}
        title="Ajouter au panier"
        aria-label="Ajouter au panier"
      >
        {adding ? <Check size={22} strokeWidth={1.75} /> : <ShoppingCart size={22} strokeWidth={1.75} />}
      </button>

      <CardSlider images={gallery} name={name} />

      <div className="pc3__foot">
        <div className="pc3__text">
          <h3 className="pc3__title" title={name}>{name}</h3>
          {subtitle && <p className="pc3__sub">{subtitle}</p>}
        </div>

        <div className="pc3__pricebox">
          {amount ? (
            <span className={`pc3__price${hasPromo ? ' pc3__price--promo' : ''}`}>
              <span className="pc3__amount">{amount}</span>
              <span className="pc3__unit">XOF</span>
            </span>
          ) : (
            <span className="pc3__price"><span className="pc3__amount" style={{ fontSize: 16 }}>{formatXOF(displayPrice)}</span></span>
          )}
          {oldAmount && <span className="pc3__old">{oldAmount} XOF</span>}
        </div>
      </div>
    </article>
  );
}

/* ─── Page de chargement : cartes animées, images qui flottent ──────────── */
function Skeleton({ count = 15 }) {
  return (
    <div className="hn-grid" aria-busy="true" aria-live="polite">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="pc3 pc3-sk" style={{ '--i': Math.min(i, 14) }}>
          <span className="hn-sk pc3-sk__tag" />
          <span className="hn-sk pc3-sk__cart" />
          <div className="pc3__media hn-sk pc3-sk__media">
            <Package size={46} strokeWidth={1.25} className="pc3-sk__icon" />
          </div>
          <div className="pc3__foot">
            <div className="pc3__text">
              <span className="hn-sk pc3-sk__line" />
              <span className="hn-sk pc3-sk__line pc3-sk__line--short" />
            </div>
            <span className="hn-sk pc3-sk__price" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Helpers accueil ───────────────────────────────────────────────────── */
const imgOf = (p) => getProductImage(p) || p?.images?.[0]?.url || p?.images?.[0] || p?.image || '';

const discountOf = (p) => {
  const pr = Number(p?.price || 0);
  const pp = Number(p?.promoPrice || p?.salePrice || 0);
  return pp > 0 && pp < pr ? Math.round((1 - pp / pr) * 100) : 0;
};

function SectionHead({ title, eyebrow, lead, actionLabel, onAction }) {
  return (
    <div className="hm-head">
      <div>
        {eyebrow && <span className="hm-head__eyebrow">{eyebrow}</span>}
        <h2 className="hm-head__title">{title}</h2>
        {lead && <p className="hm-head__lead">{lead}</p>}
      </div>
      {onAction && (
        <button type="button" className="hm-pill hm-pill--ghost" onClick={onAction}>
          {actionLabel} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

function Tile({ img, title, sub, onClick }) {
  return (
    <div
      className="hm-tile"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      {img ? <img src={img} alt="" className="hm-tile__img" loading="lazy" /> : null}
      <span className="hm-tile__shade" />
      <span className="hm-tile__go"><ArrowRight size={16} /></span>
      <div className="hm-tile__text">
        <strong>{title}</strong>
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

function CatTile({ img, label, onClick }) {
  return (
    <div
      className="hm-tile"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick?.(); } }}
    >
      {img ? <img src={img} alt="" className="hm-tile__img" loading="lazy" /> : null}
      <span className="hm-tile__label">{label} <ArrowRight size={14} /></span>
    </div>
  );
}

/* ─── Hero : titre + mosaïque de produits réels ─────────────────────────── */
function Hero({ products, loading, onShop, onPromo, onNew }) {
  const pick = useMemo(() => {
    const withImg = products.filter((p) => imgOf(p));
    const promo = [...withImg].filter((p) => discountOf(p) > 0).sort((a, b) => discountOf(b) - discountOf(a))[0];
    const fresh = withImg.find((p) => p.isNew && p !== promo);
    const imp = withImg.find((p) => isAlibabaProduct(p) && p !== promo && p !== fresh);
    const rest = withImg.filter((p) => p !== promo && p !== fresh && p !== imp);
    return {
      main: fresh || rest[0] || withImg[0],
      imp: imp || rest[1] || withImg[1],
      promo: promo || rest[2] || withImg[2],
      maxDiscount: promo ? discountOf(promo) : 0,
    };
  }, [products]);

  return (
    <section className="hm-hero">
      <div className="hm-wrap">
        <div className="hm-hero__top">
          <div>
            <h1 className="hm-hero__title">Direct de<br /><em>l&apos;usine</em><br />vers chez vous</h1>
            <div className="hm-cta">
              <button type="button" className="hm-pill hm-pill--primary" onClick={onShop}>Voir les produits <ArrowRight size={14} /></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="hm-bento" aria-busy="true">
            {[0, 1, 2, 3].map((i) => <div key={i} className="hn-sk" style={{ borderRadius: 18 }} />)}
          </div>
        ) : (
          <div className="hm-bento">
            <Tile img={pick.main && imgOf(pick.main)} title="Nouveautés" sub="Les derniers arrivages" onClick={onNew} />
            <Tile img={pick.imp && imgOf(pick.imp)} title="Import direct" sub="Fabriqué en usine" onClick={onShop} />
            <div className="hm-offer">
              <span className="hm-offer__tag">Offre spéciale</span>
              <p>{pick.maxDiscount > 0 ? `Jusqu'à -${pick.maxDiscount}% sur une sélection de produits.` : 'Retrouvez nos meilleures offres du moment.'}</p>
              <button type="button" className="hm-pill hm-pill--dark" onClick={onPromo}>Voir les offres</button>
            </div>
            <Tile img={pick.promo && imgOf(pick.promo)} title="Promotions" sub="Voir les offres" onClick={onPromo} />
          </div>
        )}

      </div>
    </section>
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
  const gridRef = useRef(null);

  const [filters, setFilters] = useState(DEFAULT_FILTERS);
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

  const handleReset = useCallback(() => { setFilters(DEFAULT_FILTERS); setInlineSearch(''); }, []);

  const handleAddToCart = useCallback((p, qty) => {
    addToCart(p, qty || 1);
    toast?.success?.('Ajouté au panier ✓');
  }, [addToCart, toast]);

  /* ─ Catégories ─ */
  const catPills = useMemo(() => {
    const all = (Array.isArray(CATEGORY_LINKS) ? CATEGORY_LINKS : []).map(item => ({
      slug: item.slug,
      label: item.label || item.slug,
    }));
    (categoriesRaw || []).forEach(c => {
      if (!all.find(x => x.slug === c.slug)) all.push({ slug: c.slug, label: c.name, image: c.image || c.imageUrl });
    });
    (categoriesRaw || []).forEach(c => {
      const hit = all.find(x => x.slug === c.slug);
      if (hit && !hit.image) hit.image = c.image || c.imageUrl;
    });
    return [{ slug: '', label: 'Tout' }, ...all.slice(0, 12)];
  }, [categoriesRaw]);

  /* Mosaïque de catégories : image de la catégorie, sinon image d'un de ses produits */
  const catTiles = useMemo(() => {
    const list = catPills.filter((c) => c.slug).map((c) => {
      const own = typeof c.image === 'string' && c.image ? c.image : '';
      const match = products.find((p) => {
        const cat = p.category;
        return p.categorySlug === c.slug || cat === c.slug || cat === c.label || cat?.slug === c.slug || cat?.name === c.label;
      });
      return { ...c, img: own || (match ? imgOf(match) : '') };
    });
    const withImg = list.filter((c) => c.img);
    return (withImg.length >= 4 ? withImg : list).slice(0, 5);
  }, [catPills, products]);

  const newProduct = useMemo(() => products.find((p) => p.isNew && imgOf(p)), [products]);
  const promoProduct = useMemo(() => products.find((p) => discountOf(p) > 0 && imgOf(p)), [products]);

  const isHome = !urlSearch && !inlineSearch && !filters.categorySlug && !filters.onlyPromo && !filters.newOnly;

  const scrollToGrid = useCallback(() => {
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
  }, []);
  const selectCategory = useCallback((slug) => {
    setFilters(f => ({ ...f, categorySlug: slug }));
    if (slug) scrollToGrid();
  }, [scrollToGrid]);
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

      {/* Catégories en pastilles */}
      <div className="hm-wrap">
        <nav className="hm-pills" aria-label="Catégories">
          {catPills.map((c) => (
            <button
              key={c.slug || 'all'}
              type="button"
              className={`hm-chip${filters.categorySlug === c.slug ? ' hm-chip--on' : ''}`}
              onClick={() => selectCategory(c.slug)}
            >
              {c.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Accueil : hero, catégories, collections (masqués pendant une recherche ou un filtre) */}
      {isHome && (
        <Hero
          products={products}
          loading={loading}
          onShop={scrollToGrid}
          onPromo={showPromos}
          onNew={showNew}
        />
      )}


      {isHome && !loading && catTiles.length > 0 && (
        <section className="hm-section">
          <div className="hm-wrap">
            <SectionHead title="Nos catégories" eyebrow="Explorer" lead="Parcourez le catalogue par univers." actionLabel="Tout voir" onAction={scrollToGrid} />
            <div className="hm-cats">
              {catTiles.map((c) => (
                <CatTile key={c.slug} img={c.img} label={c.label} onClick={() => selectCategory(c.slug)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {isHome && !loading && (newProduct || promoProduct) && (
        <section className="hm-section hm-section--tint">
          <div className="hm-wrap">
            <SectionHead title="À ne pas manquer" eyebrow="Sélection" lead="Les nouveautés et les offres du moment." />
            <div className="hm-coll">
              {newProduct && (
                <div className="hm-coll__card">
                  <div className="hm-coll__text">
                    <h3>Nouveautés</h3>
                    <p>Les derniers produits ajoutés au catalogue.</p>
                    <button type="button" className="hm-pill hm-pill--dark" onClick={showNew}>Voir <ArrowRight size={14} /></button>
                  </div>
                  <img src={imgOf(newProduct)} alt="" className="hm-coll__img" loading="lazy" />
                </div>
              )}
              {promoProduct && (
                <div className="hm-coll__card">
                  <div className="hm-coll__text">
                    <h3>Promotions</h3>
                    <p>Des prix réduits sur une sélection de produits.</p>
                    <button type="button" className="hm-pill hm-pill--dark" onClick={showPromos}>Voir <ArrowRight size={14} /></button>
                  </div>
                  <img src={imgOf(promoProduct)} alt="" className="hm-coll__img" loading="lazy" />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Produits */}
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
            <div className="hm-toolbar__controls">
              <select
                className="hm-sort-select"
                value={filters.sort}
                onChange={e => setFilters(f => ({ ...f, sort: e.target.value }))}
                aria-label="Trier par"
              >
                <option value="newest">Plus récents</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="popular">Popularité</option>
              </select>
              <div className="hm-view-toggle">
                <button type="button" className={`hm-view-btn${view === 'grid' ? ' hm-view-btn--on' : ''}`} onClick={() => setView('grid')} aria-label="Grille"><LayoutGrid size={16} /></button>
                <button type="button" className={`hm-view-btn${view === 'list' ? ' hm-view-btn--on' : ''}`} onClick={() => setView('list')} aria-label="Liste"><List size={16} /></button>
              </div>
            </div>
          </div>

          {loading ? (
            <Skeleton count={15} />
          ) : filtered.length === 0 ? (
            <div className="hm-empty">
              <Search size={44} strokeWidth={1.5} style={{ margin: '0 auto', color: '#cbd5e1' }} />
              <strong>Aucun produit trouvé</strong>
              <p>Essayez de modifier vos filtres ou votre recherche.</p>
              <button type="button" className="hm-pill hm-pill--primary" onClick={handleReset}>Réinitialiser les filtres</button>
            </div>
          ) : (
            <div className={`hn-grid${view === 'list' ? ' hn-grid--list' : ''}`}>
              {filtered.map((p, i) => (
                <ProductMiniCard key={p._id || p.id} product={p} onAddToCart={handleAddToCart} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

export default HomeNew;