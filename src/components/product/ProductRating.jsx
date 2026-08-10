import React from 'react';
import { Star } from 'lucide-react';

function StarIcon({ filled, half, size = 12 }) {
  if (half) {
    return (
      <span className="product-rating__star-half" style={{ width: size, height: size }}>
        <Star size={size} fill="#e0e0e0" color="#e0e0e0" />
        <span className="product-rating__star-half-fill">
          <Star size={size} fill="#FF6B00" color="#FF6B00" />
        </span>
      </span>
    );
  }
  return (
    <Star
      size={size}
      style={{ color: filled ? '#FF6B00' : '#e0e0e0' }}
      fill={filled ? '#FF6B00' : '#e0e0e0'}
    />
  );
}

function ProductRating({ rating, reviewCount, size = 'sm', showStars = true, hideCount = false }) {
  const numRating = Number(rating);
  const numReviews = Number(reviewCount);

  if (!numRating || numRating <= 0 || !numReviews || numReviews <= 0) {
    return null;
  }

  const fullStars = Math.floor(numRating);
  const hasHalf = numRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
  const fontSize = size === 'lg' ? '13px' : '11px';

  return (
    <div className="product-rating" style={{ fontSize }}>
      {showStars && (
        <span className="product-rating__stars">
          {Array.from({ length: fullStars }).map((_, i) => (
            <StarIcon key={`f${i}`} filled size={size === 'lg' ? 14 : 12} />
          ))}
          {hasHalf && <StarIcon half size={size === 'lg' ? 14 : 12} />}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <StarIcon key={`e${i}`} filled={false} size={size === 'lg' ? 14 : 12} />
          ))}
        </span>
      )}
      <span className="product-rating__value">{numRating.toFixed(1)}</span>
      {!hideCount && (
        <span className="product-rating__count">({numReviews} avis)</span>
      )}
    </div>
  );
}

export default React.memo(ProductRating);
