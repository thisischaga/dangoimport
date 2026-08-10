import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
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
  const minStock = Number(product?.minStock ?? 10) || 10;
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= minStock;

  const brand = product?.brand || '';

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

  return (
    <article
      className={`product-card ${isOutOfStock ? 'is-out-of-stock' : ''}`}
    >
      <div className="product-card__image-wrap">
        <Link to={`/product/${productId}`} className="product-card__image-link">
          <ProductImage
            src={primaryImage}
            hoverSrc={hoverImage}
            alt={product?.name}
            isOutOfStock={isOutOfStock}
          />

          {isLowStock && !cornerBadge && (
            <span className="product-card__stock-badge">Plus que {stock}</span>
          )}
        </Link>

        <div className="product-card__actions">
          <button
            type="button"
            className={`product-card__action-btn ${liked ? 'is-liked' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setLiked((v) => !v);
            }}
            aria-label="Ajouter aux favoris"
          >
            <Heart size={16} fill={liked ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            className="product-card__action-btn product-card__action-btn--cart"
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            aria-label="Ajouter au panier"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>

      <div className="product-card__body">
        <Link to={`/product/${productId}`} className="product-card__title-link">
          <h3 className="product-card__title" title={product?.name}>
            {product?.name || ''}
          </h3>
        </Link>

        {brand && <p className="product-card__brand">{brand}</p>}

        <ProductRating rating={rating} reviewCount={reviewCount} />

        <div className="product-card__price-block">
          <span className="product-card__price">{formatCFA(displayPrice)}</span>
          {hasPromo && (
            <>
              <span className="product-card__price-old">{formatCFA(price)}</span>
              {discount > 0 && (
                <span className="product-card__discount">-{discount}%</span>
              )}
            </>
          )}
        </div>

        {isLowStock && cornerBadge && (
          <p className="product-card__stock is-low">Plus que {stock} disponibles</p>
        )}
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
