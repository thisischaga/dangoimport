import React from 'react';
import { Truck } from 'lucide-react';

function formatCFA(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function ProductPrice({
  price,
  promoPrice,
  freeShipping = true,
  deliveryDays = '2-5',
}) {
  const hasPromo = promoPrice && promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
      {/* Main price row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: '17px',
            fontWeight: 800,
            color: '#FF6B00',
            lineHeight: 1,
            letterSpacing: '-0.02em',
          }}
        >
          {formatCFA(displayPrice)}
        </span>

        {hasPromo && (
          <>
            <span
              style={{
                fontSize: '12px',
                color: '#b0b0b0',
                textDecoration: 'line-through',
                fontWeight: 400,
              }}
            >
              {formatCFA(price)}
            </span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                color: '#FF4747',
                background: '#fff1f1',
                borderRadius: '4px',
                padding: '1px 5px',
              }}
            >
              -{discount}%
            </span>
          </>
        )}
      </div>

      {/* Shipping */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        {freeShipping ? (
          <span
            style={{
              fontSize: '11px',
              color: '#22c55e',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '3px',
            }}
          >
            <Truck size={11} />
            Livraison gratuite
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: '#9a9a9a' }}>
            Livraison payante
          </span>
        )}
        <span style={{ color: '#d5d5d5', fontSize: '11px' }}>·</span>
        <span style={{ fontSize: '11px', color: '#9a9a9a' }}>
          {deliveryDays} jours
        </span>
      </div>
    </div>
  );
}

export default React.memo(ProductPrice);
