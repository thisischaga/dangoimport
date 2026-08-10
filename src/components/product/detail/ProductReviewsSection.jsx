import React, { useMemo } from 'react';
import ProductRating from '../ProductRating';
import { resolveImageUrl } from '../../../utils/imageUrl';

function formatReviewDate(dateStr) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function RatingDistribution({ reviews, averageRating }) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const star = Math.round(Number(r.rating));
      if (star >= 1 && star <= 5) counts[star - 1] += 1;
    });
    const total = reviews.length || 1;
    return counts
      .map((count, i) => ({
        stars: i + 1,
        count,
        pct: Math.round((count / total) * 100),
      }))
      .reverse();
  }, [reviews]);

  if (!reviews.length) return null;

  return (
    <div className="product-reviews__distribution">
      <div className="product-reviews__summary-score">
        <span className="product-reviews__avg">{Number(averageRating).toFixed(1)}</span>
        <ProductRating rating={averageRating} reviewCount={reviews.length} size="lg" />
      </div>
      <div className="product-reviews__bars">
        {distribution.map(({ stars, count, pct }) => (
          <div key={stars} className="product-reviews__bar-row">
            <span>{stars} ★</span>
            <div className="product-reviews__bar-track">
              <div className="product-reviews__bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <span className="product-reviews__bar-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProductReviewsSection({ reviews = [], productRating, totalReviews, loading }) {
  const avgFromProduct =
    productRating != null && Number(productRating) > 0 ? Number(productRating) : null;
  const avgFromReviews =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
      : null;
  const averageRating = avgFromProduct ?? avgFromReviews;
  const count = totalReviews > 0 ? totalReviews : reviews.length;

  if (loading) {
    return (
      <section id="section-reviews" className="product-detail-section">
        <h2 className="product-detail-section__title">Avis clients</h2>
        <div className="product-detail-skeleton product-detail-skeleton--block" />
      </section>
    );
  }

  if (!count || count <= 0) {
    return (
      <section id="section-reviews" className="product-detail-section">
        <h2 className="product-detail-section__title">Avis clients</h2>
        <p className="product-detail-section__empty">Aucun avis pour ce produit pour le moment.</p>
      </section>
    );
  }

  return (
    <section id="section-reviews" className="product-detail-section">
      <h2 className="product-detail-section__title">Avis clients</h2>

      {reviews.length > 0 && averageRating != null && (
        <RatingDistribution reviews={reviews} averageRating={averageRating} />
      )}

      {count > 0 && averageRating != null && reviews.length === 0 && (
        <div className="product-reviews__summary-only">
          <ProductRating rating={averageRating} reviewCount={count} size="lg" />
        </div>
      )}

      <ul className="product-reviews__list">
        {reviews.map((review) => {
          const id = review._id || review.id;
          const imgs = Array.isArray(review.images)
            ? review.images.map((img) =>
                typeof img === 'string' ? resolveImageUrl(img) : resolveImageUrl(img?.url)
              ).filter(Boolean)
            : [];

          return (
            <li key={id} className="product-reviews__item">
              <div className="product-reviews__item-head">
                <div className="product-reviews__avatar">
                  {(review.userName || 'A').charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="product-reviews__author">
                    {review.userName || 'Client'}
                  </p>
                  <ProductRating
                    rating={review.rating}
                    reviewCount={1}
                    showStars
                    hideCount
                  />
                </div>
                <time className="product-reviews__date">{formatReviewDate(review.createdAt)}</time>
              </div>
              {review.title && (
                <p className="product-reviews__title">{review.title}</p>
              )}
              {review.comment && (
                <p className="product-reviews__comment">{review.comment}</p>
              )}
              {imgs.length > 0 && (
                <div className="product-reviews__photos">
                  {imgs.map((src, i) => (
                    <img key={i} src={src} alt="" className="product-reviews__photo" />
                  ))}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export default React.memo(ProductReviewsSection);
