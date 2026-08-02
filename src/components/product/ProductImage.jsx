import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FALLBACK =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

function ProductImage({ src, alt, isOutOfStock = false }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const imgSrc = errored || !src ? FALLBACK : src;

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '1 / 1',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      {/* Shimmer skeleton while loading */}
      {!loaded && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.4s infinite linear',
          }}
        />
      )}

      <motion.img
        src={imgSrc}
        alt={alt || 'Produit'}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
        whileHover={{ scale: 1.06 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {isOutOfStock && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              background: 'rgba(0,0,0,0.75)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '12px',
              borderRadius: '8px',
              padding: '5px 12px',
              letterSpacing: '0.04em',
            }}
          >
            Rupture de stock
          </span>
        </div>
      )}

      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export default React.memo(ProductImage);
