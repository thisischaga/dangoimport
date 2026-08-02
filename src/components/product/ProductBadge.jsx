import React from 'react';
import { motion } from 'framer-motion';

const BADGE_STYLES = {
  discount: {
    bg: '#FF4747',
    color: '#fff',
    fontWeight: 700,
  },
  bestSeller: {
    bg: '#FF6B00',
    color: '#fff',
    fontWeight: 700,
  },
  nouveau: {
    bg: '#22c55e',
    color: '#fff',
    fontWeight: 700,
  },
  populaire: {
    bg: '#8b5cf6',
    color: '#fff',
    fontWeight: 700,
  },
  boosted: {
    bg: 'rgba(0,0,0,0.75)',
    color: '#fff',
    fontWeight: 600,
  },
  rupture: {
    bg: 'rgba(0,0,0,0.7)',
    color: '#fff',
    fontWeight: 700,
  },
};

export function DiscountBadge({ discount }) {
  if (!discount || discount <= 0) return null;
  const style = BADGE_STYLES.discount;
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        background: style.bg,
        color: style.color,
        fontWeight: style.fontWeight,
        fontSize: '11px',
        borderRadius: '6px',
        padding: '3px 7px',
        lineHeight: 1.4,
        display: 'inline-block',
        letterSpacing: '0.02em',
      }}
    >
      -{discount}%
    </motion.span>
  );
}

export function LabelBadge({ type, label }) {
  const style = BADGE_STYLES[type] || BADGE_STYLES.boosted;
  if (!label) return null;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontWeight: style.fontWeight,
        fontSize: '10px',
        borderRadius: '6px',
        padding: '3px 7px',
        lineHeight: 1.4,
        display: 'inline-block',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      }}
    >
      {label}
    </span>
  );
}

export function RuptureBadge() {
  const style = BADGE_STYLES.rupture;
  return (
    <span
      style={{
        background: style.bg,
        color: style.color,
        fontWeight: style.fontWeight,
        fontSize: '12px',
        borderRadius: '8px',
        padding: '5px 12px',
        display: 'inline-block',
      }}
    >
      Rupture de stock
    </span>
  );
}

export default { DiscountBadge, LabelBadge, RuptureBadge };
