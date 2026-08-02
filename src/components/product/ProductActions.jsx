import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart } from 'lucide-react';

function ProductActions({ product, onAddToCart, isOutOfStock, show }) {
  const [liked, setLiked] = useState(false);
  const [addedAnim, setAddedAnim] = useState(false);

  const handleAddToCart = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (isOutOfStock) return;
      onAddToCart?.(product);
      setAddedAnim(true);
      setTimeout(() => setAddedAnim(false), 700);
    },
    [product, onAddToCart, isOutOfStock]
  );

  const handleLike = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setLiked((prev) => !prev);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.18 }}
          style={{ display: 'flex', gap: '8px', width: '100%' }}
        >
          {/* Add to cart */}
          <motion.button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            whileTap={{ scale: 0.94 }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              background: isOutOfStock ? '#e5e5e5' : addedAnim ? '#22c55e' : '#FF6B00',
              color: isOutOfStock ? '#aaa' : '#fff',
              border: 'none',
              borderRadius: '0',
              padding: '9px 12px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              transition: 'background 0.25s',
              lineHeight: 1,
              whiteSpace: 'nowrap',
            }}
            aria-label="Ajouter au panier"
          >
            <AnimatePresence mode="wait">
              {addedAnim ? (
                <motion.span
                  key="added"
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  ✓ Ajouté
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
                >
                  <ShoppingCart size={13} />
                  {isOutOfStock ? 'Indisponible' : 'Ajouter'}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Wishlist */}
          <motion.button
            onClick={handleLike}
            whileTap={{ scale: 0.8 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: liked ? '#fff1f1' : '#f5f5f5',
              border: liked ? '1.5px solid #ffb3b3' : '1.5px solid #ebebeb',
              borderRadius: '0',
              padding: '9px 10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            aria-label={liked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <motion.span animate={{ scale: liked ? [1, 1.35, 1] : 1 }} transition={{ duration: 0.3 }}>
              <Heart size={15} fill={liked ? '#FF4747' : 'none'} style={{ color: liked ? '#FF4747' : '#9a9a9a' }} />
            </motion.span>
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default React.memo(ProductActions);
