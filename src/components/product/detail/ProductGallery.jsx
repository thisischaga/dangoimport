import React, { useState, useCallback, useMemo } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

const FALLBACK =
  'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80';

function ProductGallery({ images = [], name }) {
  const [active, setActive] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);

  const validImages = useMemo(() => {
    const list = images.filter(Boolean);
    return list.length > 0 ? list.slice(0, 6) : [FALLBACK];
  }, [images]);

  const goPrev = useCallback(() => {
    setActive((i) => (i <= 0 ? validImages.length - 1 : i - 1));
  }, [validImages.length]);

  const goNext = useCallback(() => {
    setActive((i) => (i >= validImages.length - 1 ? 0 : i + 1));
  }, [validImages.length]);

  const current = validImages[active];

  return (
    <>
      <div className="pdp-gallery">
        {validImages.length > 1 && (
          <div className="pdp-gallery__thumbs" aria-label="Miniatures produit">
            {validImages.map((img, i) => (
              <button
                key={i}
                type="button"
                className={`pdp-gallery__thumb ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Image ${i + 1}`}
                aria-current={i === active ? 'true' : undefined}
              >
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        )}

        <div className="pdp-gallery__stage">
          <button
            type="button"
            className="pdp-gallery__main"
            onClick={() => setFullscreen(true)}
            aria-label="Agrandir l'image"
          >
            <img src={current} alt={name || 'Produit'} className="pdp-gallery__img" />
          </button>

          {validImages.length > 1 && (
            <>
              <button
                type="button"
                className="pdp-gallery__nav pdp-gallery__nav--prev"
                onClick={goPrev}
                aria-label="Image précédente"
              >
                <ChevronLeft size={22} />
              </button>
              <button
                type="button"
                className="pdp-gallery__nav pdp-gallery__nav--next"
                onClick={goNext}
                aria-label="Image suivante"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}
        </div>
      </div>

      {fullscreen && (
        <div
          className="pdp-gallery__fullscreen"
          role="dialog"
          aria-modal="true"
          aria-label="Galerie produit"
        >
          <button
            type="button"
            className="pdp-gallery__fullscreen-close"
            onClick={() => setFullscreen(false)}
            aria-label="Fermer"
          >
            <X size={24} />
          </button>
          <img src={current} alt={name || 'Produit'} className="pdp-gallery__fullscreen-img" />
          {validImages.length > 1 && (
            <div className="pdp-gallery__fullscreen-dots">
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
