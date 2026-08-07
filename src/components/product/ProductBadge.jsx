import React from 'react';

const BADGE_THEMES = {
  promo: { bg: '#FF4747', color: '#fff' },
  discount: { bg: '#FF4747', color: '#fff' },
  bestSeller: { bg: '#FF6B00', color: '#fff' },
  nouveau: { bg: '#22c55e', color: '#fff' },
  populaire: { bg: '#8b5cf6', color: '#fff' },
  boosted: { bg: '#1a1a1a', color: '#fff' },
  rupture: { bg: '#64748b', color: '#fff' },
};

/**
 * Scellé en quart de cercle — angle supérieur gauche de la carte produit.
 */
export function CornerSealBadge({ type = 'nouveau', label }) {
  if (!label) return null;
  const theme = BADGE_THEMES[type] || BADGE_THEMES.boosted;

  return (
    <div
      className="product-corner-seal"
      style={{ '--seal-bg': theme.bg, '--seal-color': theme.color }}
      aria-hidden={false}
    >
      <span className="product-corner-seal__text">{label}</span>
    </div>
  );
}

export function getCornerBadge(product, { hasPromo, discount, isOutOfStock }) {
  if (isOutOfStock) {
    return { type: 'rupture', label: 'Rupture' };
  }
  if (hasPromo && discount > 0) {
    return { type: 'promo', label: `-${discount}%` };
  }
  if (product?.isPromo && hasPromo) {
    return { type: 'promo', label: 'Promo' };
  }
  if (product?.isNew || product?.isNewArrival) {
    return { type: 'nouveau', label: 'Nouveau' };
  }
  if (product?.isBestSeller) {
    return { type: 'bestSeller', label: 'Best Seller' };
  }
  if (product?.isBoosted || product?.isFeatured) {
    return { type: 'populaire', label: 'Populaire' };
  }
  return null;
}

/* Legacy flat badges — kept for ProductDetail if needed */
export function DiscountBadge({ discount }) {
  if (!discount || discount <= 0) return null;
  return <CornerSealBadge type="promo" label={`-${discount}%`} />;
}

export function LabelBadge({ type, label }) {
  return <CornerSealBadge type={type} label={label} />;
}

export function RuptureBadge() {
  return <CornerSealBadge type="rupture" label="Rupture" />;
}

export default { CornerSealBadge, DiscountBadge, LabelBadge, RuptureBadge, getCornerBadge };
