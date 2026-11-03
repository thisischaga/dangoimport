import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';

import ProductImage from './ProductImage';
import { formatSoftS } from '../../utils/formatPrice';
import {
  getProductSellableStock,
  getDisplayProductName,
  isDropshippingProduct,
  isAlibabaProduct,
  isMarketplaceProduct,
} from '../../utils/publicProduct';
import { getProductImages } from '../../utils/imageUrl';
import { getCardDisplayPrice, getMoqRules, getUnitPrice } from '../../utils/importMoq';

/* ── Styles intégrés au composant ─────────────────────────
   Injectés une seule fois dans <head> (id « pc3-styles »), après les autres
   feuilles : ils passent donc devant l'ancien style. Aucun fichier CSS requis. */
const PC3_CSS = `
/* ── Carte ─────────────────────────────────────────────── */
.pc3 {
  --pc-ink: #12222e; --pc-soft: #4a5b68; --pc-mute: #8a959d; --pc-orange: #ff6b00;
  position: relative; display: flex; flex-direction: column; width: 100%; min-width: 0;
  container-type: inline-size;
  padding: 14px 16px 16px; border-radius: 24px; background: #fff; color: var(--pc-ink);
  box-shadow: 0 16px 36px -10px rgba(18, 34, 46, 0.18), 0 2px 8px rgba(18, 34, 46, 0.05);
  transition: box-shadow 0.25s ease, transform 0.25s ease;
}
.pc3 *, .pc3 *::before, .pc3 *::after { box-sizing: border-box; }
@media (hover: hover) {
  .pc3:hover { transform: translateY(-4px); box-shadow: 0 24px 48px -12px rgba(18, 34, 46, 0.24), 0 4px 12px rgba(18, 34, 46, 0.06); }
}
.pc3--oos { opacity: 0.72; }

/* Pastille inclinée, en haut à gauche */
.pc3__tag { position: absolute; top: 14px; left: 12px; z-index: 3; padding: 4px 12px; border-radius: 4px; font-size: 13px; font-weight: 600; line-height: 1.25; color: #fff; transform: rotate(-3deg); box-shadow: 0 3px 6px rgba(18, 34, 46, 0.16); pointer-events: none; white-space: nowrap; }
.pc3__tag--blue { background: #0a63d6; }
.pc3__tag--yellow { background: #ffd400; color: #12222e; }
.pc3__tag--gray { background: #6b7780; }

/* Panier, en haut à droite */
.pc3__cart { position: absolute; top: 10px; right: 10px; z-index: 3; width: 40px; height: 40px; padding: 0; border: 0; border-radius: 50%; background: transparent; color: var(--pc-ink); display: flex; align-items: center; justify-content: center; cursor: pointer; transition: color 0.15s ease, background 0.15s ease, transform 0.15s ease; }
.pc3__cart:hover { color: #fff; background: var(--pc-orange); }
.pc3__cart:active { transform: scale(0.92); }
.pc3__cart:focus-visible { outline: 2px solid var(--pc-orange); outline-offset: 2px; }

/* Produit au centre : le fond blanc des photos se fond dans la carte */
.pc3__media { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; margin-top: 18px; overflow: hidden; border-radius: 16px; text-decoration: none; }
.pc3__media > *, .pc3__media img { width: 100%; height: 100%; }
.pc3__media img { object-fit: contain !important; mix-blend-mode: multiply; transition: transform 0.4s ease; }
@media (hover: hover) { .pc3:hover .pc3__media img { transform: scale(1.05) rotate(-1deg); } }

/* Bas de carte : nom à gauche, prix à droite */
.pc3__foot { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 10px; min-width: 0; }
.pc3__text { flex: 1 1 0; min-width: 0; }
.pc3__title-link { color: inherit; text-decoration: none; }
.pc3__title { margin: 0; font-size: 16px; line-height: 1.25; font-weight: 700; letter-spacing: -0.01em; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; overflow-wrap: anywhere; }
.pc3__sub { margin: 3px 0 0; font-size: 13px; line-height: 1.3; color: var(--pc-mute); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pc3__meta { display: flex; align-items: center; gap: 8px; margin: 3px 0 0; font-size: 12px; line-height: 1.3; color: var(--pc-mute); }
.pc3__rating { display: inline-flex; align-items: center; gap: 3px; color: var(--pc-ink); font-weight: 600; }
.pc3__rating svg { color: #f5a623; }

.pc3__pricebox { flex: 0 0 auto; display: flex; flex-direction: column; align-items: flex-end; }
.pc3__price { display: inline-flex; align-items: flex-end; gap: 2px; color: var(--pc-ink); }
.pc3__price--promo { color: var(--pc-orange); }
.pc3__amount { font-size: 24px; font-size: clamp(18px, 11cqw, 32px); font-weight: 800; line-height: 1; letter-spacing: -0.04em; white-space: nowrap; }
.pc3__amount--text { font-size: 16px; letter-spacing: 0; }
/* Devise en petit, écrite à la verticale à droite du prix */
.pc3__unit { writing-mode: vertical-rl; transform: rotate(180deg); font-size: 12px; font-weight: 400; line-height: 1; letter-spacing: 0.04em; color: var(--pc-mute); }
.pc3__old { margin-top: 4px; font-size: 12px; color: var(--pc-mute); text-decoration: line-through; white-space: nowrap; }

/* Version compacte (panneau « Offres du jour ») */
.pc3--compact { padding: 10px 12px 12px; border-radius: 18px; }
.pc3--compact .pc3__tag { top: 10px; left: 8px; font-size: 11px; padding: 3px 9px; }
.pc3--compact .pc3__cart { top: 6px; right: 6px; width: 34px; height: 34px; }
.pc3--compact .pc3__media { margin-top: 14px; }
.pc3--compact .pc3__title { font-size: 13px; }
.pc3--compact .pc3__sub { font-size: 11px; }

@media (max-width: 639px) {
  .pc3 { padding: 10px 12px 12px; border-radius: 20px; }
  .pc3__tag { top: 10px; left: 8px; font-size: 11px; padding: 3px 9px; }
  .pc3__cart { top: 6px; right: 6px; width: 34px; height: 34px; }
  .pc3__cart svg { width: 19px; height: 19px; }
  .pc3__media { margin-top: 14px; }
  .pc3__title { font-size: 14px; }
  .pc3__sub { font-size: 12px; }
}

/* ── Grille du catalogue (l'id garde la priorité sur l'ancien <style> intégré) ── */
div#product-grid-main { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 12px; align-items: start; padding-bottom: 20px; }
@media (min-width: 640px) { div#product-grid-main { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px 18px; } }
@media (min-width: 1000px) { div#product-grid-main { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 28px 22px; } }

/* ── Onglets du catalogue : soulignés ── */
.dango-tabs { display: flex; gap: 26px; margin: 0 0 22px; padding: 0 12px; border-bottom: 1px solid #e6e9ea; overflow-x: auto; scrollbar-width: none; }
.dango-tabs::-webkit-scrollbar { display: none; }
.dango-tabs__item { flex-shrink: 0; padding: 12px 2px; border: 0; border-bottom: 3px solid transparent; margin-bottom: -1px; background: none; font: inherit; font-size: 15px; font-weight: 500; color: #7b8994; cursor: pointer; white-space: nowrap; transition: color 0.15s ease; }
.dango-tabs__item:hover { color: #12222e; }
.dango-tabs__item.is-active { color: #12222e; font-weight: 700; border-bottom-color: #ff6b00; }
.dango-tabs__item:focus-visible { outline: 2px solid #ff6b00; outline-offset: 2px; border-radius: 4px; }
@media (min-width: 640px) { .dango-tabs { padding: 0; } }
`;

if (typeof document !== 'undefined') {
  let el = document.getElementById('pc3-styles');
  if (!el) {
    el = document.createElement('style');
    el.id = 'pc3-styles';
    document.head.appendChild(el);
  }
  if (el.textContent !== PC3_CSS) el.textContent = PC3_CSS;
}

/* =========================================================
   PRODUCT CARD : carte arrondie à grande ombre douce
   pastille inclinée en haut à gauche, panier en haut à droite,
   produit au centre, nom + détail à gauche, gros prix à droite.
   (Le libellé « feature » promo / livraison gratuite reste désactivé :
   la promo se voit par le prix orange et l'ancien prix barré.)
========================================================= */

const fmt = (v) => {
  const x = Number(v);
  return Number.isFinite(x) && x > 0 ? x.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) : null;
};

function ProductCard({ product, onAddToCart, isForPromoSection }) {
  /* ── Données de base ─────────────────────────────────── */
  const productId = product?._id || product?.id;
  const price = getUnitPrice(product);
  const isDropship = isDropshippingProduct(product) || product?.importFeesAtCheckout;
  const { moq, soldAsLot, packSize } = getMoqRules(product);

  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = !isDropship && promoPrice > 0 && promoPrice < price;
  const displayPrice = isDropship ? getCardDisplayPrice(product) : (hasPromo ? promoPrice : price);
  const amount = fmt(displayPrice);
  const oldAmount = hasPromo ? fmt(price) : null;

  /* ── Images ──────────────────────────────────────────── */
  const images = getProductImages(product, 2);
  const primaryImage = images[0] || product?.image || '';
  const hoverImage = images[1] || null;

  /* ── Stock ───────────────────────────────────────────── */
  const stock = getProductSellableStock(product);
  const isAlibaba = isAlibabaProduct(product);
  const isOutOfStock = !isAlibaba && stock <= 0;

  const displayName = getDisplayProductName(product);

  /* ── Pastille (origine du produit) ───────────────────── */
  let tag = null;
  if (isOutOfStock) tag = { label: 'Rupture', tone: 'gray' };
  else if (isAlibaba || isDropship) tag = { label: 'Import direct', tone: 'blue' };
  else if (isMarketplaceProduct(product)) tag = { label: 'Marketplace', tone: 'yellow' };

  /* ── Détail sous le nom ──────────────────────────────── */
  let orderNote = '';
  if (isDropship) {
    if (soldAsLot || packSize > 1) orderNote = `Lot de ${packSize} unités`;
    else if (moq > 1) orderNote = `Min. ${moq} unités`;
  }
  const categoryName = typeof product?.category === 'string' ? product.category : product?.category?.name;
  const subtitle = orderNote || product?.brand || categoryName || '';

  const soldCount = Number(product?.soldCount ?? product?.sales ?? product?.totalSold ?? product?.totalSales ?? 0) || 0;
  const rating = product?.rating != null ? Number(product.rating) : 0;
  const showMeta = !isForPromoSection && (rating > 0 || soldCount > 0);

  const handleQuickAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddToCart) onAddToCart({ ...product, name: displayName });
  };

  const to = `/product/${productId}`;

  return (
    <article className={`pc3${isForPromoSection ? ' pc3--compact' : ''}${isOutOfStock ? ' pc3--oos' : ''}`}>
      {tag && <span className={`pc3__tag pc3__tag--${tag.tone}`}>{tag.label}</span>}

      {!isOutOfStock && onAddToCart && (
        <button type="button" onClick={handleQuickAddToCart} className="pc3__cart" title="Ajouter au panier" aria-label="Ajouter au panier">
          <ShoppingCart size={22} strokeWidth={1.75} />
        </button>
      )}

      <Link to={to} className="pc3__media" aria-label={displayName || 'Voir le produit'}>
        <ProductImage
          src={primaryImage}
          hoverSrc={hoverImage}
          alt={displayName || 'Produit'}
          isOutOfStock={isOutOfStock}
        />
      </Link>

      <div className="pc3__foot">
        <div className="pc3__text">
          <Link to={to} className="pc3__title-link">
            <h3 className="pc3__title" title={displayName}>{displayName}</h3>
          </Link>
          {subtitle && <p className="pc3__sub">{subtitle}</p>}
          {showMeta && (
            <p className="pc3__meta">
              {rating > 0 && <span className="pc3__rating"><Star size={11} fill="currentColor" strokeWidth={0} />{rating.toFixed(1)}</span>}
              {soldCount > 0 && <span>{soldCount} vendus</span>}
            </p>
          )}
        </div>

        <div className="pc3__pricebox">
          {amount ? (
            <span className={`pc3__price${hasPromo ? ' pc3__price--promo' : ''}`}>
              <span className="pc3__amount">{amount}</span>
              <span className="pc3__unit">FCFA</span>
            </span>
          ) : (
            <span className="pc3__price"><span className="pc3__amount pc3__amount--text">{formatSoftS(displayPrice)}</span></span>
          )}
          {oldAmount && <span className="pc3__old">{oldAmount} FCFA</span>}
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);