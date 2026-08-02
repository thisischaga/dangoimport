import React from 'react';
import { Star } from 'lucide-react';

function StarIcon({ filled, half }) {
  if (half) {
    return (
      <span style={{ position: 'relative', display: 'inline-block', width: 12, height: 12 }}>
        <Star size={12} style={{ color: '#e0e0e0', position: 'absolute', top: 0, left: 0 }} fill="#e0e0e0" />
        <span style={{ position: 'absolute', top: 0, left: 0, overflow: 'hidden', width: '50%' }}>
          <Star size={12} style={{ color: '#FF6B00' }} fill="#FF6B00" />
        </span>
      </span>
    );
  }
  return (
    <Star
      size={12}
      style={{ color: filled ? '#FF6B00' : '#e0e0e0' }}
      fill={filled ? '#FF6B00' : '#e0e0e0'}
    />
  );
}

function ProductRating({ rating = 4.5, reviewCount, soldCount }) {
  const fullStars = Math.floor(rating);
  const hasHalf = rating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  const formatCount = (n) => {
    if (!n) return null;
    if (n >= 1000) return `${(n / 1000).toFixed(1).replace('.0', '')}k`;
    return String(n);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' }}>
      {/* Stars */}
      <span style={{ display: 'flex', alignItems: 'center', gap: '1px' }}>
        {Array.from({ length: fullStars }).map((_, i) => (
          <StarIcon key={`f${i}`} filled />
        ))}
        {hasHalf && <StarIcon half />}
        {Array.from({ length: emptyStars }).map((_, i) => (
          <StarIcon key={`e${i}`} filled={false} />
        ))}
      </span>

      {/* Rating number */}
      <span style={{ fontSize: '11px', fontWeight: 600, color: '#FF6B00' }}>
        {rating.toFixed(1)}
      </span>

      {/* Reviews */}
      {reviewCount > 0 && (
        <span style={{ fontSize: '11px', color: '#9a9a9a' }}>
          ({formatCount(reviewCount)})
        </span>
      )}

      {/* Sold */}
      {soldCount > 0 && (
        <>
          <span style={{ color: '#d5d5d5', fontSize: '11px' }}>·</span>
          <span style={{ fontSize: '11px', color: '#9a9a9a' }}>
            {formatCount(soldCount)} vendus
          </span>
        </>
      )}
    </div>
  );
}

export default React.memo(ProductRating);
