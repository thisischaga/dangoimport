import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Search, Truck } from 'lucide-react';
import ProductImage from './ProductImage';
import { formatCFA } from '../../utils/formatPrice';
import { getProductImages } from '../../utils/imageUrl';
import API_BASE_URL from '../../apiConfig';

/* ── Interactive Rating (Linked to Server) ─────────────── */
function InteractiveRating({ productId, rating, count }) {
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [toast, setToast] = useState('');
  const display = hover || userRating || rating || 0;

  const handleRate = async (e, val) => {
    e.preventDefault();
    e.stopPropagation();

    const token = localStorage.getItem('dangoToken');
    if (!token) {
      setToast('Connectez-vous !');
      setTimeout(() => setToast(''), 2000);
      return;
    }

    setUserRating(val);
    setToast('Envoi...');

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: val,
          title: 'Avis rapide',
          comment: 'Noté depuis la carte produit.'
        })
      });

      const resData = await response.json();
      if (resData.success) {
        setToast('Merci !');
      } else {
        setToast(resData.message || 'Erreur');
      }
    } catch (err) {
      console.error(err);
      setToast('Erreur connexion');
    }

    setTimeout(() => setToast(''), 2000);
  };

  return (
    <span className="pc2-rating" onClick={e => e.preventDefault()}>
      <span className="pc2-rating__stars">
        {Array.from({ length: 5 }, (_, i) => {
          const val = i + 1;
          const filled = val <= Math.round(display);
          return (
            <button
              key={i}
              type="button"
              className="pc2-rating__star-btn"
              onMouseEnter={() => setHover(val)}
              onMouseLeave={() => setHover(0)}
              onClick={(e) => handleRate(e, val)}
              aria-label={`Noter ${val}`}
            >
              <Star
                size={10}
                className={filled ? 'pc2-rating__star--full' : 'pc2-rating__star--empty'}
              />
            </button>
          );
        })}
      </span>
      {toast ? (
        <span className="pc2-rating__toast" style={{ marginLeft: 6 }}>{toast}</span>
      ) : (
        count != null && count > 0 && (
          <span className="pc2-rating__count" style={{ marginLeft: 4 }}>({count})</span>
        )
      )}
    </span>
  );
}

/* ── Product Card (Alibaba Model) ─────────────────────── */
function ProductCard({ product, onAddToCart }) {
  const productId = product?._id || product?.id;
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;

  const images = getProductImages(product, 2);
  const primaryImage = images[0] || product?.image || '';
  const hoverImage = images[1] || null;

  const stock = Number(product?.stock ?? 0) || 0;
  const initialStock = Number(
    product?.initialStock ?? product?.stockInitial ?? product?.originalStock ?? product?.stock ?? 0
  ) || 0;
  const minStock = Number(product?.minStock ?? 10) || 10;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  const vendorName = product?.vendorName || product?.vendor || '';
  const country = product?.country || product?.origin || '';

  const soldCount = Number(product?.soldCount ?? product?.sales ?? product?.totalSold ?? 0) || 0;
  const freeShipping = Boolean(product?.freeShipping ?? product?.isFreeShipping);

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount = product?.totalReviews != null ? Number(product.totalReviews) : null;

  // Delivery zones / origin
  const deliveryZones = Array.isArray(product?.deliveryZones)
    ? product.deliveryZones
        .map((z) => (typeof z === 'string' ? z : z?.name || z?.label || z?.country || ''))
        .filter(Boolean)
    : [];
  const shippingInfo = String(product?.shippingInfo || '').trim();
  const deliveryInfo = deliveryZones.length > 0 ? deliveryZones[0] : shippingInfo;

  // Alibaba feature label (strictly real data)
  const getFeatureLabel = () => {
    if (freeShipping) return { text: 'Livraison gratuite', type: 'shipping' };
    if (hasPromo) {
      const discount = Math.round((1 - promoPrice / price) * 100);
      return { text: `-${discount}% Prix inférieur aux similaires`, type: 'promo' };
    }
    return null;
  };

  const feature = getFeatureLabel();

  const yearsActive = product?.vendorYears || null;
  const isVerified = product?.isVerified ?? product?.verified ?? false;

  return (
    <article className={`pc2 ${isOutOfStock ? 'pc2--oos' : ''}`}>

      {/* IMAGE (Alibaba style with rounded corners & visual button) */}
      <div className="pc2__img-wrap">
        <Link to={`/product/${productId}`} className="pc2__img-link">
          <ProductImage
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product?.name}
            isOutOfStock={isOutOfStock}
          />
        </Link>

      </div>

      {/* BODY */}
      <div className="pc2__body">

        {/* Title (2 lines max) */}
        <Link to={`/product/${productId}`} className="pc2__title-link">
          <h3 className="pc2__title" title={product?.name}>{product?.name || ''}</h3>
        </Link>

        {/* Feature banner / Tag under title */}
        {feature && (
          <p className={`pc2__feature pc2__feature--${feature.type}`}>
            {feature.text}
          </p>
        )}

        {/* Price (Bold, large, crossed-out original next to it) */}
        <div className="pc2__price-row">
          {hasPromo ? (
            <>
              <span className="pc2__price-old" style={{ textDecoration: 'line-through', color: '#94A3B8', marginRight: '6px', fontSize: '13px' }}>
                {formatCFA(price)}
              </span>
              <span className="pc2__price">{formatCFA(promoPrice)}</span>
            </>
          ) : (
            <span className="pc2__price">{formatCFA(price)}</span>
          )}
        </div>

        {/* Sales */}
        {soldCount > 0 && (
          <p className="pc2__moq-sold" style={{ margin: 0 }}>
            {soldCount} vendus
          </p>
        )}
        {/* Delivery zone */}
        {deliveryInfo && (
          <p className="pc2__delivery-zone" style={{ margin: 0, fontSize: '11px', color: '#64748B', fontWeight: 600 }}>
            Zone: {deliveryInfo}
          </p>
        )}

        {/* Rating Row */}
        <div className="pc2__rating-row">
          <InteractiveRating productId={productId} rating={rating} count={reviewCount} />
        </div>

        {/* Vendor age / origin / Verified status (At the bottom) */}
        {(isVerified || yearsActive || country) && (
          <p className="pc2__vendor-meta">
            {isVerified && <span className="pc2__verified">Verified</span>}
            {isVerified && (yearsActive || country) && <span className="pc2__meta-sep">·</span>}
            {yearsActive && <span>{yearsActive} ans</span>}
            {yearsActive && country && <span className="pc2__meta-sep">·</span>}
            {country && <span className="pc2__country">{country}</span>}
          </p>
        )}

      </div>
    </article>
  );
}

export default React.memo(ProductCard);
