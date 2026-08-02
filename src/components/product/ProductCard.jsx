import React, { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck } from 'lucide-react';
import ProductImage from './ProductImage';
import ProductRating from './ProductRating';
import ProductPrice from './ProductPrice';
import ProductActions from './ProductActions';
import { DiscountBadge, LabelBadge } from './ProductBadge';

function getLabel(product) {
  if (product?.isBestSeller) return { type: 'bestSeller', label: 'Best Seller' };
  if (product?.isNew) return { type: 'nouveau', label: 'Nouveau' };
  if (product?.isBoosted || product?.isFeatured) return { type: 'populaire', label: 'Populaire' };
  return null;
}

function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false);

  const productId = product?._id || product?.id;
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const image = product?.image || product?.images?.[0]?.url || product?.images?.[0] || '';
  const sellerName = product?.sellerName || product?.vendorName || 'Vendeur indépendant';
  const stock = Number(product?.stock ?? 1);
  const isOutOfStock = stock <= 0;
  const isLowStock = !isOutOfStock && stock <= 10;

  const rating = product?.rating ?? 4.2;
  const reviewCount = product?.reviewCount ?? Math.floor(Math.random() * 800 + 20);
  const soldCount = product?.soldCount ?? Math.floor(Math.random() * 3000 + 50);

  const label = getLabel(product);

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      whileHover={{ y: -3, boxShadow: '0 8px 28px rgba(0,0,0,0.11)' }}
      style={{
        background: '#fff',
        borderRadius: '0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        opacity: isOutOfStock ? 0.72 : 1,
        filter: isOutOfStock ? 'grayscale(0.2)' : 'none',
        transition: 'box-shadow 0.25s, opacity 0.25s',
        cursor: 'pointer',
        minWidth: 0,
        width: '100%',
        maxWidth: '100%',
      }}
    >
      {/* ── IMAGE ── */}
      <Link
        to={`/product/${productId}`}
        style={{ display: 'block', textDecoration: 'none', position: 'relative' }}
        tabIndex={-1}
      >
        {/* Badges top-left */}
        <div style={{
          position: 'absolute', top: '8px', left: '8px', zIndex: 2,
          display: 'flex', flexDirection: 'column', gap: '4px',
        }}>
          {discount > 0 && <DiscountBadge discount={discount} />}
          {label && !isOutOfStock && <LabelBadge type={label.type} label={label.label} />}
          {isOutOfStock && <LabelBadge type="rupture" label="Rupture" />}
        </div>

        <ProductImage src={image} alt={product?.name} isOutOfStock={isOutOfStock} />
      </Link>

      {/* ── CONTENT ── */}
      <div style={{
        padding: '10px 10px 12px',
        display: 'flex', flexDirection: 'column', gap: '5px', flex: 1,
      }}>
        {/*Seller*/}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#9a9a9a', overflow: 'hidden' }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '120px' }}>
            Dangoimport
          </span>
          {product?.sellerVerified && (
            <BadgeCheck size={12} style={{ color: '#FF6B00', flexShrink: 0 }} />
          )}
        </div>

        {/* Product name */}
        <Link to={`/product/${productId}`} style={{ textDecoration: 'none', width: '100%' }}>
          <h3 style={{
            fontSize: '13px', fontWeight: 600, color: '#1a1a1a', margin: 0,
            lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '36px',
            wordBreak: 'break-word', overflowWrap: 'anywhere',
            maxWidth: '100%',
            width: '100%',
          }}>
            {product?.name || 'Produit premium'}
          </h3>
        </Link>

        {/* Rating 
        <ProductRating
          rating={Number(rating.toFixed ? rating.toFixed(1) : rating)}
          reviewCount={reviewCount}
        />

        {/* Price */}
        <ProductPrice
          price={price}
          promoPrice={hasPromo ? promoPrice : null}
          freeShipping={product?.freeShipping ?? true}
          deliveryDays={product?.deliveryDays ?? '2-5'}
        />

        {/* Stock restant */}
        {!isOutOfStock && (
          <p style={{ fontSize: '11px', color: isLowStock ? '#FF4747' : '#9a9a9a', margin: 0, fontWeight: isLowStock ? 600 : 400 }}>
            {isLowStock ? `⚠ Plus que ${stock} en stock` : `Stock restant : ${stock}`}
          </p>
        )}

        {/* Actions — hover only */}
        <div style={{ marginTop: '4px', minHeight: hovered ? 'auto' : '0' }}>
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
