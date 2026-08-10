import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

const FALLBACK =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=800&q=80';

function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const [fullscreen, setFullscreen] = useState(false);

  const validImages = useMemo(() => {
    const list = images.filter(Boolean);
    return list.length > 0 ? list.slice(0, 5) : [FALLBACK];
  }, [images]);

  const goPrev = useCallback(() => {
    setActive((i) => (i <= 0 ? validImages.length - 1 : i - 1));
  }, [validImages.length]);

  const goNext = useCallback(() => {
    setActive((i) => (i >= validImages.length - 1 ? 0 : i + 1));
  }, [validImages.length]);

  const handleMouseMove = useCallback((e) => {
    if (!zoom) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  }, [zoom]);

  const current = validImages[active];

  return (
    <>
      <div className="product-gallery">
        <div
          className="product-gallery__main"
          onMouseEnter={() => setZoom(true)}
          onMouseLeave={() => setZoom(false)}
          onMouseMove={handleMouseMove}
          onClick={() => setFullscreen(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setFullscreen(true)}
          aria-label="Agrandir l'image"
        >
          <img
            src={current}
            alt={name || 'Produit'}
            className="product-gallery__img"
            style={{
              transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
              transform: zoom ? 'scale(1.8)' : 'scale(1)',
            }}
          />
          <span className="product-gallery__zoom-hint md:hidden">
            <ZoomIn size={16} /> Appuyer pour agrandir
          </span>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                className="product-gallery__nav product-gallery__nav--prev"
                onClick={(e) => { e.stopPropagation(); goPrev(); }}
                aria-label="Image précédente"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="product-gallery__nav product-gallery__nav--next"
                onClick={(e) => { e.stopPropagation(); goNext(); }}
                aria-label="Image suivante"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {validImages.length > 1 && (
          <div className="product-gallery__thumbs">
            {validImages.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`product-gallery__thumb ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Image ${i + 1}`}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      {fullscreen && (
        <div
          className="product-gallery__fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie produit"
        >
          <button
            type="button"
            className="product-gallery__fullscreen-close"
            onClick={() => setFullscreen(false)}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <img src={current} alt={name || 'Produit'} className="product-gallery__fullscreen-img" />
          {validImages.length > 1 && (
            <div className="product-gallery__fullscreen-dots">
              {validImages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  className={i === active ? 'is-active' : ''}
                  onClick={() => setActive(i)}
                  aria-label={`Image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}

export default React.memo(ProductGallery);
