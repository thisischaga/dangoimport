import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Truck } from 'lucide-react';
import ProductImage from './ProductImage';
import ProductRating from './ProductRating';
import { CornerSealBadge, getCornerBadge } from './ProductBadge';
import { formatCFA, calcDiscountPercent } from '../../utils/formatPrice';
import { getProductImages } from '../../utils/imageUrl';

function ProductCard({ product, onAddToCart }) {
  const [liked, setLiked] = useState(false);

  const productId = product?._id || product?.id;
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? calcDiscountPercent(price, promoPrice) : 0;

  const images = getProductImages(product, 2);
  const primaryImage = images[0] || product?.image || '';
  const hoverImage = images[1] || null;

  const stock = Number(product?.stock ?? 0) || 0;

  const initialStock = Number(
    product?.initialStock ??
    product?.stockInitial ??
    product?.originalStock ??
    product?.stock ??
    0
  ) || 0;

  const minStock = Number(product?.minStock ?? 10) || 10;

  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  const stockPercentage =
    initialStock > 0
      ? Math.min(100, Math.max(0, (stock / initialStock) * 100))
      : 0;

  const brand = product?.brand || '';
  const category = product?.category || '';

  const soldCount = Number(
    product?.soldCount ?? product?.sales ?? product?.totalSold ?? 0
  ) || 0;

  const freeShipping = Boolean(
    product?.freeShipping ?? product?.isFreeShipping
  );

  const deliveryZones = Array.isArray(product?.deliveryZones)
    ? product.deliveryZones
        .map((zone) =>
          typeof zone === 'string'
            ? zone
            : zone?.name || zone?.label || zone?.country || zone?.city || ''
        )
        .filter(Boolean)
    : [];

  const shippingInfo = String(product?.shippingInfo || '').trim();
  const deliveryInfo = deliveryZones.length > 0
    ? deliveryZones.join(', ')
    : shippingInfo;

  const rating = product?.rating != null ? Number(product.rating) : null;
  const reviewCount =
    product?.totalReviews != null ? Number(product.totalReviews) : null;

  const cornerBadge = getCornerBadge(product, { hasPromo, discount, isOutOfStock });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    onAddToCart?.({
      ...product,
      id: productId,
      _id: productId,
      price,
      promoPrice: hasPromo ? promoPrice : null,
      image: primaryImage,
      stock,
    });
  };

  const handleToggleLike = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((v) => !v);
  };

  return (
    <article className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}>
      <div className="product-card__image-wrap">
        <Link to={`/product/${productId}`} className="product-card__image-link">
          <ProductImage
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product?.name}
            isOutOfStock={isOutOfStock}
          />

          {!cornerBadge && hasPromo && discount > 0 && (
            <span className="product-card__discount-ribbon">-{discount}%</span>
          )}

          {isLowStock && !cornerBadge && (
            <span className="product-card__stock-badge">Plus que {stock}</span>
          )}
        </Link>

        <div className="product-card__actions">
          {/**<button
            type="button"
            className={`product-card__action-btn ${liked ? 'is-liked' : ''}`}
            onClick={handleToggleLike}
            aria-label="Ajouter aux favoris"
            aria-pressed={liked}
          >
            <Heart size={15} fill={liked ? 'currentColor' : 'none'} />
          </button> */}

          <button
            type="button"
            className="product-card__action-btn product-card__action-btn--cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Ajouter au panier"
          >
            <ShoppingCart size={15} />
          </button>
        </div>
      </div>

      <div className="product-card__body">
        <Link to={`/product/${productId}`} className="product-card__title-link">
          <h3 className="product-card__title" title={product?.name}>
            {product?.name || ''}
          </h3>
        </Link>

        {(brand || category) && (
          <p className="product-card__brand">{brand || category}</p>
        )}

        <div className="product-card__price-block">
          <span className="product-card__price">{formatCFA(displayPrice)}</span>
          {hasPromo && (
            <span className="product-card__price-old">{formatCFA(price)}</span>
          )}
        </div>

        <div className="product-card__meta-row">
          <ProductRating rating={rating} reviewCount={reviewCount} compact />
          {soldCount > 0 && (
            <span className="product-card__sold">
              {soldCount > 999 ? `${Math.floor(soldCount / 1000)}k+` : soldCount} vendus
            </span>
          )}
        </div>

        {(freeShipping || deliveryInfo) && (
          <div className="product-card__delivery-line">
            <Truck size={11} className="product-card__delivery-icon" />
            <span className={freeShipping ? 'is-free' : ''}>
              {freeShipping ? 'Livraison gratuite' : deliveryInfo}
            </span>
          </div>
        )}

        <div className="product-card__stock-progress">
          <div className="product-card__stock-header">
            <span className="product-card__stock-label">Stock</span>
            {isOutOfStock ? (
              <span className="product-card__stock-text is-out">Rupture de stock</span>
            ) : isLowStock ? (
              <span className="product-card__stock-text is-low">
                Plus que {stock} disponible{stock > 1 ? 's' : ''}
              </span>
            ) : (
              <span className="product-card__stock-text is-in">
                {stock} disponible{stock > 1 ? 's' : ''}
              </span>
            )}
          </div>

          <div
            className="product-card__stock-bar"
            aria-label={isOutOfStock ? 'Rupture de stock' : `${stock} produits disponibles`}
          >
            <div
              className={`product-card__stock-fill ${
                isOutOfStock ? 'is-out' : isLowStock ? 'is-low' : 'is-in'
              }`}
              style={{ width: `${stockPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);