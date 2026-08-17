import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';

import ProductImage from './ProductImage';
import { formatSoftS } from '../../utils/formatPrice';
import { getProductImages } from '../../utils/imageUrl';
import API_BASE_URL from '../../apiConfig';

/* =========================================================
   INTERACTIVE RATING
========================================================= */

function InteractiveRating({
  productId,
  rating,
  count,
}) {
  const [hover, setHover] = useState(0);
  const [userRating, setUserRating] = useState(0);
  const [toast, setToast] = useState('');

  const display =
    hover ||
    userRating ||
    rating ||
    0;

  const handleRate = async (event, value) => {
    event.preventDefault();
    event.stopPropagation();

    const token =
      localStorage.getItem('dangoToken');

    if (!token) {
      setToast('Connectez-vous !');

      setTimeout(() => {
        setToast('');
      }, 2000);

      return;
    }

    setUserRating(value);
    setToast('Envoi...');

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/products/${productId}/reviews`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            rating: value,
            title: 'Avis rapide',
            comment:
              'Noté depuis la carte produit.',
          }),
        }
      );

      const data =
        await response.json();

      if (data.success) {
        setToast('Merci !');
      } else {
        setToast(
          data.message || 'Erreur'
        );
      }
    } catch (error) {
      console.error(
        'Erreur rating:',
        error
      );

      setToast(
        'Erreur connexion'
      );
    }

    setTimeout(() => {
      setToast('');
    }, 2000);
  };

  return (
    <span
      className="pc2-rating"
      onClick={(event) =>
        event.preventDefault()
      }
    >
      <span className="pc2-rating__stars">
        {Array.from(
          { length: 5 },
          (_, index) => {
            const value = index + 1;

            const filled =
              value <=
              Math.round(display);

            return (
              <button
                key={value}
                type="button"
                className="pc2-rating__star-btn"
                onMouseEnter={() =>
                  setHover(value)
                }
                onMouseLeave={() =>
                  setHover(0)
                }
                onClick={(event) =>
                  handleRate(
                    event,
                    value
                  )
                }
                aria-label={`Noter ${value}`}
              >
                <Star
                  size={11}
                  strokeWidth={2}
                  className={
                    filled
                      ? 'pc2-rating__star--full'
                      : 'pc2-rating__star--empty'
                  }
                />
              </button>
            );
          }
        )}
      </span>

      {toast ? (
        <span className="pc2-rating__toast">
          {toast}
        </span>
      ) : (
        count != null &&
        count > 0 && (
          <span className="pc2-rating__count">
            ({count})
          </span>
        )
      )}
    </span>
  );
}

/* =========================================================
   PRODUCT CARD
========================================================= */

function ProductCard({
  product,
  onAddToCart,
}) {
  /* =======================================================
     BASIC PRODUCT DATA
  ======================================================= */

  const productId =
    product?._id ||
    product?.id;

  const price =
    Number(
      product?.price ?? 0
    ) || 0;

  const promoPrice =
    Number(
      product?.promoPrice ??
        product?.salePrice ??
        0
    ) || 0;

  const hasPromo =
    promoPrice > 0 &&
    promoPrice < price;

  const displayPrice =
    hasPromo
      ? promoPrice
      : price;

  /* =======================================================
     IMAGES
  ======================================================= */

  const images =
    getProductImages(
      product,
      2
    );

  const primaryImage =
    images[0] ||
    product?.image ||
    '';

  const hoverImage =
    images[1] ||
    null;

  /* =======================================================
     STOCK
  ======================================================= */

  const stock =
    Number(
      product?.stock ?? 0
    ) || 0;

  const initialStock =
    Number(
      product?.initialStock ??
        product?.stockInitial ??
        product?.originalStock ??
        product?.stock ??
        0
    ) || 0;

  const minStock =
    Number(
      product?.minStock ?? 10
    ) || 10;

  const isOutOfStock =
    stock <= 0;

  const isLowStock =
    !isOutOfStock &&
    stock <= minStock;

  /* =======================================================
     SELLER
  ======================================================= */

  const vendorName =
    product?.vendorName ||
    product?.vendor ||
    '';

  const country =
    product?.country ||
    product?.origin ||
    '';

  const yearsActive =
    product?.vendorYears ||
    null;

  const isVerified =
    product?.isVerified ??
    product?.verified ??
    false;

  /* =======================================================
     SALES
  ======================================================= */

  const soldCount =
    Number(
      product?.soldCount ??
        product?.sales ??
        product?.totalSold ??
        0
    ) || 0;

  /* =======================================================
     SHIPPING
  ======================================================= */

  const freeShipping =
    Boolean(
      product?.freeShipping ??
        product?.isFreeShipping
    );

  const deliveryZones =
    Array.isArray(
      product?.deliveryZones
    )
      ? product.deliveryZones
          .map((zone) =>
            typeof zone === 'string'
              ? zone
              : zone?.name ||
                zone?.label ||
                zone?.country ||
                ''
          )
          .filter(Boolean)
      : [];

  const shippingInfo =
    String(
      product?.shippingInfo ||
        ''
    ).trim();

  const deliveryInfo =
    deliveryZones.length > 0
      ? deliveryZones[0]
      : shippingInfo;

  /* =======================================================
     RATING
  ======================================================= */

  const rating =
    product?.rating != null
      ? Number(product.rating)
      : null;

  const reviewCount =
    product?.totalReviews != null
      ? Number(
          product.totalReviews
        )
      : null;

  /* =======================================================
     PRODUCT FEATURE
  ======================================================= */

  const getFeatureLabel = () => {
    if (freeShipping) {
      return {
        text: 'Livraison gratuite',
        type: 'shipping',
      };
    }

    if (hasPromo) {
      const discount =
        Math.round(
          (1 -
            promoPrice /
              price) *
            100
        );

      return {
        text: `-${discount}%`,
        type: 'promo',
      };
    }

    return null;
  };

  const feature =
    getFeatureLabel();

  /* =======================================================
     DISCOUNT
  ======================================================= */

  const discountPercent =
    hasPromo
      ? Math.round(
          (1 -
            promoPrice /
              price) *
            100
        )
      : 0;

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <>
      <style>{`

        /* =================================================
           PRODUCT CARD
        ================================================= */

        .pc2 {
          width: 100%;
          min-width: 0;
          height: auto;
          min-height: 0;
          align-self: start;

          background: #ffffff;

          overflow: hidden;

          /*
           * IMPORTANT :
           * aucune hauteur fixe.
           */
          display: block;

          box-sizing: border-box;
        }

        /*
         * Empêche le contenu interne de créer
         * artificiellement de grands espaces.
         */
        .pc2,
        .pc2 *,
        .pc2 *::before,
        .pc2 *::after {
          box-sizing: border-box;
        }

        /* =================================================
           IMAGE
        ================================================= */

        .pc2__img-wrap {
          position: relative;
          width: 100%;
          height: auto;
          overflow: hidden;

          background: #f8fafc;
        }

        .pc2__img-link {
          display: block;
          width: 100%;
          text-decoration: none;
        }

        /* =================================================
           BODY
        ================================================= */

        .pc2__body {
          width: 100%;
          height: auto;
          min-height: 0;

          padding: 8px 2px 4px;

          display: block;
        }

        /* =================================================
           TITLE
        ================================================= */

        .pc2__title-link {
          display: block;

          color: inherit;
          text-decoration: none;

          margin: 0;
          padding: 0;
        }

        .pc2__title {
          margin: 0;

          font-size: 14px;
          line-height: 1.35;

          /*
           * Nom du produit en gras.
           */
          font-weight: 700;

          color: #111827;

          /*
           * Pas de hauteur fixe.
           */
          height: auto;
          min-height: 0;

          overflow-wrap: anywhere;
        }

        .pc2__title-link:hover
        .pc2__title {
          color: #000000;
        }

        /* =================================================
           FEATURE
        ================================================= */

        .pc2__feature {
          margin: 4px 0 0;

          font-size: 10px;
          line-height: 1.3;

          font-weight: 600;

          white-space: normal;
        }

        .pc2__feature--shipping {
          color: #15803d;
        }

        .pc2__feature--promo {
          color: white;
          background-color: red;
          font-size: 10px;
          line-height: 1.3;
          border-radius: 2px;
          width: max-content;
          height: max-content;
          padding-left: 4px;
          padding-right: 4px;
        }

        /* =================================================
           PRICE
        ================================================= */

        .pc2__price-row {
          display: flex;
          align-items: baseline;

          flex-wrap: wrap;

          gap: 5px;

          margin-top: 5px;

          min-height: 0;
        }

        .pc2__price {
          font-size: 17px;
          line-height: 1.2;

          /*
           * Prix bien visible.
           */
          font-weight: 800;

          color: #111827;

          letter-spacing: -0.2px;

          white-space: nowrap;
        }

        .pc2__price-old {
          font-size: 12px;
          line-height: 1.2;

          font-weight: 500;

          color: #94a3b8;

          text-decoration: line-through;

          white-space: nowrap;
        }

        /* =================================================
           SALES
        ================================================= */

        .pc2__moq-sold {
          margin: 3px 0 0;

          font-size: 11px;
          line-height: 1.3;

          color: #64748b;

          font-weight: 500;
        }

        /* =================================================
           DELIVERY
        ================================================= */

        .pc2__delivery-zone {
          margin: 3px 0 0;

          font-size: 11px;
          line-height: 1.3;

          color: #64748b;

          font-weight: 500;

          overflow-wrap: anywhere;
        }

        /* =================================================
           RATING
        ================================================= */

        .pc2__rating-row {
          display: flex;
          align-items: center;

          margin-top: 4px;

          min-height: 0;
        }

        .pc2-rating {
          display: inline-flex;

          align-items: center;

          min-width: 0;

          font-size: 10px;
          line-height: 1;

          color: #64748b;
        }

        .pc2-rating__stars {
          display: inline-flex;

          align-items: center;

          gap: 1px;
        }

        .pc2-rating__star-btn {
          display: inline-flex;

          align-items: center;
          justify-content: center;

          width: 13px;
          height: 13px;

          padding: 0;

          border: 0;

          background: transparent;

          cursor: pointer;
        }

        .pc2-rating__star--full {
          color: #f59e0b;

          fill: currentColor;
        }

        .pc2-rating__star--empty {
          color: #cbd5e1;

          fill: transparent;
        }

        .pc2-rating__count {
          margin-left: 4px;

          color: #64748b;

          font-size: 10px;
        }

        .pc2-rating__toast {
          margin-left: 6px;

          color: #475569;

          font-size: 10px;
          font-weight: 600;

          white-space: nowrap;
        }

        /* =================================================
           VENDOR META
        ================================================= */

        .pc2__vendor-meta {
          display: flex;

          align-items: center;

          flex-wrap: wrap;

          gap: 4px;

          margin: 4px 0 0;

          font-size: 10px;
          line-height: 1.3;

          color: #64748b;
        }

        .pc2__verified {
          font-weight: 700;

          color: #15803d;
        }

        .pc2__meta-sep {
          color: #cbd5e1;
        }

        .pc2__country {
          color: #64748b;
        }

        /* =================================================
           OUT OF STOCK
        ================================================= */

        .pc2--oos {
          opacity: 0.78;
        }

        /* =================================================
           MOBILE
        ================================================= */

        @media (max-width: 639px) {
          .pc2__body {
            padding-top: 7px;
            padding-left: 1px;
            padding-right: 1px;
            padding-bottom: 3px;
          }

          .pc2__title {
            font-size: 13px;
            line-height: 1.35;
          }

          .pc2__price {
            font-size: 15px;
          }

          .pc2__price-old {
            font-size: 11px;
          }

          .pc2__moq-sold,
          .pc2__delivery-zone {
            font-size: 10px;
          }
        }

      `}</style>

      <article
        className={`pc2 ${
          isOutOfStock
            ? 'pc2--oos'
            : ''
        }`}
      >
        {/* =================================================
            PRODUCT IMAGE
        ================================================= */}

        <div className="pc2__img-wrap">
          <Link
            to={`/product/${productId}`}
            className="pc2__img-link"
          >
            <ProductImage
              src={primaryImage}
              hoverSrc={hoverImage}
              alt={
                product?.name ||
                'Produit'
              }
              isOutOfStock={
                isOutOfStock
              }
            />
          </Link>
        </div>

        {/* =================================================
            PRODUCT INFORMATION
        ================================================= */}

        <div className="pc2__body">

          {/* PRODUCT NAME */}

          <Link
            to={`/product/${productId}`}
            className="pc2__title-link"
          >
            <h3
              className="pc2__title"
              title={product?.name}
            >
              {product?.name || ''}
            </h3>
          </Link>

          {/* FEATURE */}

          {feature && (
            <p
              className={`
                pc2__feature
                pc2__feature--${feature.type}
              `}
            >
              {feature.text}
            </p>
          )}

          {/* PRICE */}

          <div className="pc2__price-row">

            {hasPromo && (
              <span className="pc2__price-old">
                {formatSoftS(price)}
              </span>
            )}

            <span className="pc2__price">
              {formatSoftS(
                displayPrice
              )}
            </span>

          </div>

          {/* SALES */}

          {soldCount > 0 && (
            <p className="pc2__moq-sold">
              {soldCount.toLocaleString(
                'fr-FR'
              )}{' '}
              vendus
            </p>
          )}

          {/* DELIVERY */}

          {deliveryInfo && (
            <p className="pc2__delivery-zone">
              Zone : {deliveryInfo}
            </p>
          )}

          {/* RATING */}

          <div className="pc2__rating-row">
            <InteractiveRating
              productId={
                productId
              }
              rating={rating}
              count={reviewCount}
            />
          </div>

          {/* VENDOR */}

          {(isVerified ||
            yearsActive ||
            country) && (
            <p className="pc2__vendor-meta">

              {isVerified && (
                <span className="pc2__verified">
                  ✓ Vérifié
                </span>
              )}

              {isVerified &&
                (yearsActive ||
                  country) && (
                  <span className="pc2__meta-sep">
                    ·
                  </span>
                )}

              {yearsActive && (
                <span>
                  {yearsActive} ans
                </span>
              )}

              {yearsActive &&
                country && (
                  <span className="pc2__meta-sep">
                    ·
                  </span>
                )}

              {country && (
                <span className="pc2__country">
                  {country}
                </span>
              )}

            </p>
          )}

        </div>
      </article>
    </>
  );
}

export default React.memo(
  ProductCard
);