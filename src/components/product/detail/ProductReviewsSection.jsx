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

function AddReviewForm({ productId, onReviewAdded }) {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('dangoToken');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <div className="product-reviews__form-guest">
        <p>Vous devez être connecté pour écrire un commentaire.</p>
        <Link to="/login" className="product-reviews__login-link">
          Se connecter
        </Link>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Veuillez sélectionner une note de 1 à 5 étoiles.');
      return;
    }
    if (!comment.trim()) {
      toast.error('Veuillez écrire un commentaire.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          title: title.trim() || 'Avis client',
          comment: comment.trim(),
        }),
      });

      const resData = await response.json();
      if (resData.success) {
        toast.success('Votre commentaire a été publié avec succès !');
        setRating(0);
        setTitle('');
        setComment('');
        // Invalidate react-query cache to load fresh product ratings & reviews
        queryClient.invalidateQueries(['products', productId]);
        queryClient.invalidateQueries(['products', productId, 'reviews']);
      } else {
        toast.error(resData.message || "Impossible d'ajouter le commentaire.");
      }
    } catch (err) {
      console.error(err);
      toast.error('Une erreur de connexion est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="product-reviews__form">
      <h3 className="product-reviews__form-title">Donnez votre avis sur ce produit</h3>

      <div className="product-reviews__form-group">
        <label className="product-reviews__form-label">Note globale :</label>
        <div className="product-reviews__stars-selector">
          {Array.from({ length: 5 }).map((_, i) => {
            const starValue = i + 1;
            const isFilled = starValue <= (hoverRating || rating);
            return (
              <button
                key={i}
                type="button"
                className="product-reviews__star-btn"
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(starValue)}
              >
                <Star
                  size={20}
                  className={isFilled ? 'product-rating__star-full' : 'product-rating__star-empty'}
                  fill={isFilled ? '#FF6B00' : 'none'}
                  color={isFilled ? '#FF6B00' : '#d1d5db'}
                />
              </button>
            );
          })}
        </div>
      </div>

      <div className="product-reviews__form-group">
        <label htmlFor="review-title" className="product-reviews__form-label">
          Titre de l'avis (optionnel) :
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex: Excellent produit, Très satisfait..."
          className="product-reviews__input"
        />
      </div>

      <div className="product-reviews__form-group">
        <label htmlFor="review-comment" className="product-reviews__form-label">
          Votre commentaire :
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Qu'avez-vous aimé ou moins aimé ? Partagez votre expérience..."
          rows="4"
          className="product-reviews__textarea"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0 || !comment.trim()}
        className="product-reviews__submit-btn"
      >
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
    <section id="section-reviews" className="product-detail-section">
      <h2 className="product-detail-section__title">Commentaires &amp; Avis</h2>

      <div className="product-reviews__container">
        {/* Left Side: Rating Distribution & Reviews List */}
        <div className="product-reviews__content-side">
          {loading ? (
            <div className="product-detail-skeleton product-detail-skeleton--block" />
          ) : count <= 0 ? (
            <p className="product-detail-section__empty">Aucun avis pour ce produit pour le moment.</p>
          ) : (
            <>
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
            </>
          )}
        </div>

        {/* Right Side: Add Review Form */}
        <div className="product-reviews__form-side">
          <AddReviewForm productId={productId} />
        </div>
      </div>
    </section>
  );
}

export default React.memo(ProductReviewsSection);
