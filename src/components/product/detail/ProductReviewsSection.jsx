import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Star } from 'lucide-react';
import ProductRating from '../ProductRating';
import { resolveImageUrl } from '../../../utils/imageUrl';
import API_BASE_URL from '../../../apiConfig';
import { toast } from '../../../utils/toast';

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

function RatingSummary({ reviews, averageRating, count }) {
  const distribution = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    reviews.forEach((r) => {
      const star = Math.round(Number(r.rating));
      if (star >= 1 && star <= 5) counts[star - 1] += 1;
    });
    const total = reviews.length || 1;
    return counts
      .map((c, i) => ({
        stars: i + 1,
        count: c,
        pct: Math.round((c / total) * 100),
      }))
      .reverse();
  }, [reviews]);

  return (
    <div className="pdp-reviews__summary">
      <div className="pdp-reviews__score">
        <span className="pdp-reviews__score-value">
          {averageRating != null ? Number(averageRating).toFixed(1) : '—'}
        </span>
        <ProductRating rating={averageRating} reviewCount={count} size="lg" />
        <p className="pdp-reviews__score-label">{count} avis client{count > 1 ? 's' : ''}</p>
      </div>
      {reviews.length > 0 && (
        <div className="pdp-reviews__bars">
          {distribution.map(({ stars, count: starCount, pct }) => (
            <div key={stars} className="pdp-reviews__bar-row">
              <span>{stars}</span>
              <Star size={12} fill="#FF6B00" color="#FF6B00" />
              <div className="pdp-reviews__bar-track">
                <div className="pdp-reviews__bar-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="pdp-reviews__bar-count">{starCount}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AddReviewForm({ productId }) {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('dangoToken');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="pdp-reviews__guest">
        <p>Connectez-vous pour laisser un avis sur ce produit.</p>
        <Link to="/login" className="pdp-reviews__login-link">Se connecter</Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Choisissez une note entre 1 et 5.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Écrivez un commentaire.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || 'Avis client',
          comment: comment.trim(),
        }),
      });
      const resData = await response.json();
      if (resData.success) {
        toast.success('Merci ! Votre avis a été publié.');
        setRating(0);
        setTitle('');
        setComment('');
        queryClient.invalidateQueries(['products', productId]);
        queryClient.invalidateQueries(['products', productId, 'reviews']);
      } else {
        toast.error(resData.message || "Impossible d'ajouter l'avis.");
      }
    } catch {
      toast.error('Erreur de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="pdp-reviews__form">
      <h3 className="pdp-reviews__form-title">Donner votre avis</h3>

      <div className="pdp-reviews__stars-input">
        {Array.from({ length: 5 }).map((_, i) => {
          const starValue = i + 1;
          const filled = starValue <= (hoverRating || rating);
          return (
            <button
              key={i}
              type="button"
              className="pdp-reviews__star-btn"
              onMouseEnter={() => setHoverRating(starValue)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(starValue)}
              aria-label={`${starValue} étoiles`}
            >
              <Star size={22} fill={filled ? '#FF6B00' : 'none'} color={filled ? '#FF6B00' : '#d1d5db'} />
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Titre (optionnel)"
        className="pdp-reviews__input"
      />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Partagez votre expérience avec ce produit..."
        rows={4}
        className="pdp-reviews__textarea"
        required
      />
      <button type="submit" disabled={loading || rating === 0 || !comment.trim()} className="pdp-reviews__submit">
        {loading ? 'Publication...' : 'Publier mon avis'}
      </button>
    </form>
  );
}

function ProductReviewsSection({ productId, reviews = [], productRating, totalReviews, loading }) {
  const avgFromProduct =
    productRating != null && Number(productRating) > 0 ? Number(productRating) : null;
  const avgFromReviews =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length
      : null;
  const averageRating = avgFromProduct ?? avgFromReviews;
  const count = totalReviews > 0 ? totalReviews : reviews.length;

  return (
    <section id="section-reviews" className="pdp__section pdp-reviews">
      <h2 className="pdp__section-title">Avis clients</h2>

      {loading ? (
        <div className="pdp__skeleton pdp__skeleton--panel" style={{ height: 200 }} />
      ) : (
        <div className="pdp-reviews__layout">
          <div className="pdp-reviews__main">
            {count > 0 && averageRating != null ? (
              <RatingSummary reviews={reviews} averageRating={averageRating} count={count} />
            ) : (
              <p className="pdp__empty">Soyez le premier à noter ce produit.</p>
            )}

            {reviews.length > 0 && (
              <ul className="pdp-reviews__list">
                {reviews.map((review) => {
                  const id = review._id || review.id;
                  const imgs = Array.isArray(review.images)
                    ? review.images
                        .map((img) =>
                          typeof img === 'string' ? resolveImageUrl(img) : resolveImageUrl(img?.url)
                        )
                        .filter(Boolean)
                    : [];

                  return (
                    <li key={id} className="pdp-reviews__item">
                      <div className="pdp-reviews__item-head">
                        <div className="pdp-reviews__avatar">
                          {(review.userName || 'A').charAt(0).toUpperCase()}
                        </div>
                        <div className="pdp-reviews__item-meta">
                          <p className="pdp-reviews__author">{review.userName || 'Client'}</p>
                          <ProductRating rating={review.rating} reviewCount={1} showStars hideCount />
                        </div>
                        <time className="pdp-reviews__date">{formatReviewDate(review.createdAt)}</time>
                      </div>
                      {review.title && <p className="pdp-reviews__item-title">{review.title}</p>}
                      {review.comment && <p className="pdp-reviews__comment">{review.comment}</p>}
                      {imgs.length > 0 && (
                        <div className="pdp-reviews__photos">
                          {imgs.map((src, i) => (
                            <img key={i} src={src} alt="" className="pdp-reviews__photo" />
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className="pdp-reviews__aside">
            <AddReviewForm productId={productId} />
          </aside>
        </div>
      )}
    </section>
  );
}

export default React.memo(ProductReviewsSection);
