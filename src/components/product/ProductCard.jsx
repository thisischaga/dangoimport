import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import ProductImage from './ProductImage';
import ProductPrice from './ProductPrice';
import ProductActions from './ProductActions';
import { CornerSealBadge, getCornerBadge } from './ProductBadge';

function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false);

  const productId = product?._id || product?.id;
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const image = product?.image || product?.images?.[0]?.url || product?.images?.[0] || '';
  const sellerName = product?.sellerName || product?.vendorName || '';
  const hasStockValue = Number.isFinite(Number(product?.stock));
  const stock = hasStockValue ? Number(product.stock) : null;
  const isOutOfStock = hasStockValue ? stock <= 0 : false;
  const isLowStock = hasStockValue && !isOutOfStock && stock <= 10;
  const deliverySummary = Array.isArray(product?.deliveryZones)
    ? product.deliveryZones
        .map((zone) => zone?.locality || zone?.area || zone?.country)
        .filter(Boolean)
        .slice(0, 2)
        .join(' · ')
    : '';

  const cornerBadge = getCornerBadge(product, { hasPromo, discount, isOutOfStock });

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.11)' }}
      className="product-card"
    >
      <Link
        to={`/product/${productId}`}
        className="product-card__image-link"
        tabIndex={-1}
      >
        {cornerBadge ? (
          <CornerSealBadge type={cornerBadge.type} label={cornerBadge.label} />
        ) : null}
        <ProductImage src={image} alt={product?.name} isOutOfStock={isOutOfStock} />
      </Link>

      <div className="product-card__body">
        {sellerName ? (
          <div className="product-card__seller">
            <span className="product-card__seller-name">{sellerName}</span>
            {product?.sellerVerified ? (
              <BadgeCheck size={12} style={{ color: '#FF6B00', flexShrink: 0 }} />
            ) : null}
          </div>
        ) : null}

        <Link to={`/product/${productId}`} className="product-card__title-link">
          <h3 className="product-card__title">{product?.name || ''}</h3>
        </Link>

        <ProductPrice
          price={price}
          promoPrice={hasPromo ? promoPrice : null}
          freeShipping={product?.freeShipping ?? false}
          shippingInfo={product?.shippingInfo}
          deliveryZones={product?.deliveryZones}
        />

        <div className="product-card__meta">
          {product?.category ? (
            <p className="product-card__category">{product.category}</p>
          ) : null}
          {deliverySummary ? (
            <p className="product-card__delivery">Livraison: {deliverySummary}</p>
          ) : null}
          {hasStockValue && !isOutOfStock ? (
            <p className={`product-card__stock ${isLowStock ? 'is-low' : ''}`}>
              {isLowStock ? `Plus que ${stock} en stock` : `Stock restant : ${stock}`}
            </p>
          ) : null}
        </div>

        <div className="product-card__actions" style={{ minHeight: hovered ? 'auto' : '0' }}>
          <ProductActions
            product={product}
            onAddToCart={onAddToCart}
            isOutOfStock={isOutOfStock}
            show={hovered}
          />
        </div>
      </div>
    </motion.article>
  );
}

export default React.memo(ProductCard);
