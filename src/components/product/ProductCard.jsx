import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BadgeCheck, Star, Heart, ShoppingCart } from 'lucide-react';
import ProductImage from './ProductImage';

function formatCFA(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function ProductCard({ product, onAddToCart }) {
  const [hovered, setHovered] = useState(false);
  const [liked, setLiked] = useState(false);

  const productId = product?._id || product?.id;
  const price = Number(product?.price ?? 0) || 0;
  const promoPrice = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  const hasPromo = promoPrice > 0 && promoPrice < price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const image = product?.image || product?.images?.[0]?.url || product?.images?.[0] || '';
  const sellerName = product?.sellerName || product?.vendorName || '';
  const isOutOfStock = Number(product?.stock ?? 0) <= 0;

  const rating = product?.rating ? Number(product.rating) : null;
  const totalSales = product?.totalSales ? Number(product.totalSales) : null;

  return (
    <motion.article
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="bg-white border border-slate-100 rounded-none overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col relative w-full h-full"
      style={{
        opacity: isOutOfStock ? 0.75 : 1,
      }}
    >
      {/* ── IMAGE SECTION ── */}
      <div className="relative aspect-square w-full bg-slate-50 overflow-hidden group">
        <Link to={`/product/${productId}`} className="block w-full h-full">
          <ProductImage src={image} alt={product?.name} isOutOfStock={isOutOfStock} />
        </Link>

        {/* Wishlist Heart Overlay */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setLiked(!liked);
          }}
          className="absolute top-2.5 right-2.5 p-2 bg-white/90 backdrop-blur-[2px] rounded-full text-slate-400 hover:text-rose-500 hover:bg-white shadow-sm transition"
          aria-label="Ajouter aux favoris"
        >
          <Heart size={15} fill={liked ? '#F43F5E' : 'none'} className={liked ? 'text-rose-500' : ''} />
        </button>

        {/* Discount Overlay Badge */}
        {hasPromo && (
          <span className="absolute bottom-2.5 left-2.5 bg-[#FF6B00] text-white text-[10px] font-black px-2 py-0.5 rounded-none shadow-sm">
            -{discount}%
          </span>
        )}

      </div>

      {/* ── CONTENT SECTION ── */}
      <div className="p-3 flex flex-col flex-1 gap-2 justify-between">
        <div className="space-y-1.5">
          {/* Seller / Store name */}
          {sellerName && (
            <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 truncate">
              <span>{sellerName}</span>
              {product?.sellerVerified && <BadgeCheck size={11} className="text-[#FF6B00] shrink-0" />}
            </div>
          )}

          {/* Product name */}
          <Link to={`/product/${productId}`} className="block group">
            <h3 className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed min-h-[34px] hover:text-[#FF6B00] transition duration-200">
              {product?.name || ''}
            </h3>
          </Link>

          {/* Rating & Sales count row */}
          {(rating || totalSales) && (
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
              {rating && (
                <div className="flex items-center text-amber-500 gap-0.5">
                  <Star size={11} fill="currentColor" />
                  <span className="font-bold text-slate-700">{rating.toFixed(1)}</span>
                </div>
              )}
              {rating && totalSales && <span className="text-slate-300">·</span>}
              {totalSales && <span>{totalSales} vendus</span>}
            </div>
          )}

          {/* Price Block */}
          <div className="space-y-0.5">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[15px] font-black text-[#FF6B00] tracking-tight">
                {formatCFA(hasPromo ? promoPrice : price)}
              </span>
              {hasPromo && (
                <span className="text-[11px] text-slate-400 line-through font-normal">
                  {formatCFA(price)}
                </span>
              )}
            </div>

            {/* Delivery Info */}
            <div className="text-[10px] font-bold text-emerald-600">
              {product?.freeShipping || price >= 50000 ? 'Livraison gratuite' : 'Livraison rapide'}
            </div>
          </div>
        </div>

        {/* Quick Add To Cart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isOutOfStock) return;
            onAddToCart?.(product);
          }}
          disabled={isOutOfStock}
          className={`w-full mt-2 rounded-none py-2 px-3 text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer ${
            isOutOfStock
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
              : 'bg-slate-900 text-white hover:bg-[#FF6B00]'
          }`}
        >
          <ShoppingCart size={13} />
          {isOutOfStock ? 'Rupture' : 'Ajouter'}
        </button>
      </div>
    </motion.article>
  );
}

export default React.memo(ProductCard);
