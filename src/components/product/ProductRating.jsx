import React from 'react';
import { Star } from 'lucide-react';

function StarFull({ size }) {
  return <Star size={size} fill="#FF6B00" color="#FF6B00" />;
}

function StarEmpty({ size }) {
  return <Star size={size} fill="#e8e8e8" color="#e8e8e8" />;
}

function StarHalf({ size }) {
  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-flex',
        width: size,
        height: size,
        flexShrink: 0,
      }}
    >
      <Star size={size} fill="#e8e8e8" color="#e8e8e8" />
      <span
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: '50%',
          overflow: 'hidden',
          display: 'inline-flex',
        }}
      >
        <Star size={size} fill="#FF6B00" color="#FF6B00" />
      </span>
    </span>
  );
}

function ProductRating({
  rating,
  reviewCount,
  size = 'sm',
  showStars = true,
  hideCount = false,
}) {
  const numRating = Number(rating);
  const numReviews = Number(reviewCount);

  if (!numRating || numRating <= 0 || !numReviews || numReviews <= 0) {
    return null;
  }

  const starSize = size === 'lg' ? 15 : 13;
  const fullStars = Math.floor(numRating);
  const hasHalf = numRating - fullStars >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

  return (
    <div
      className="product-rating"
      style={{
        display: 'inline-flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flexWrap: 'nowrap',
        fontSize: size === 'lg' ? 13 : 11,
      }}
    >
      {showStars && (
        <span
          className="product-rating__stars"
          style={{
            display: 'inline-flex',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 1,
            flexShrink: 0,
          }}
        >
          {Array.from({ length: fullStars }).map((_, i) => (
            <StarFull key={`f${i}`} size={starSize} />
          ))}
          {hasHalf && <StarHalf size={starSize} />}
          {Array.from({ length: emptyStars }).map((_, i) => (
            <StarEmpty key={`e${i}`} size={starSize} />
          ))}
        </span>
      )}
      <span
        className="product-rating__value"
        style={{ fontWeight: 700, color: '#ff6b00', whiteSpace: 'nowrap' }}
      >
        {numRating.toFixed(1)}
      </span>
      {!hideCount && (
        <span
          className="product-rating__count"
          style={{ color: '#9a9a9a', whiteSpace: 'nowrap' }}
        >
          ({numReviews} avis)
        </span>
      )}
    </div>
  );
}

export default React.memo(ProductRating);
