import React, { useState } from 'react';

const FALLBACK =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

function ProductImage({
  src,
  hoverSrc,
  alt,
  isOutOfStock = false,
  className = '',
  enableHoverSwap = true,
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const [hovered, setHovered] = useState(false);

  const primary = errored || !src ? FALLBACK : src;
  const secondary = hoverSrc && hoverSrc !== primary ? hoverSrc : null;
  const showSecondary = enableHoverSwap && hovered && secondary && loaded;

  return (
    <div
      className={`product-image ${className}`.trim()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {!loaded && <div className="product-image__skeleton" aria-hidden />}

      <img
        src={showSecondary ? secondary : primary}
        alt={alt || 'Produit'}
        loading="lazy"
        decoding="async"
        className={`product-image__img ${loaded ? 'is-loaded' : ''}`}
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
      />

      {isOutOfStock && (
        <div className="product-image__overlay">
          <span className="product-image__overlay-label">Rupture de stock</span>
        </div>
      )}
    </div>
  );
}

export default React.memo(ProductImage);
