import React from 'react';
import { Truck } from 'lucide-react';

function formatCFA(value) {
  return `${Number(value || 0).toLocaleString('fr-FR')} FCFA`;
}

function ProductPrice({
  price,
  promoPrice,
  freeShipping = false,
  deliveryDays = '2-5',
  shippingInfo = '',
  deliveryZones = [],
}) {
  const hasPromo = promoPrice && promoPrice > 0 && promoPrice < price;
  const displayPrice = hasPromo ? promoPrice : price;
  const discount = hasPromo ? Math.round((1 - promoPrice / price) * 100) : 0;
  const deliveryRegion = String(shippingInfo || '')
    .trim()
    .replace(/^Livraison[:\s]+/i, '')
    .trim();

  const zoneSummary = Array.isArray(deliveryZones)
    ? deliveryZones
        .map((zone) => {
          const locality = zone?.locality || zone?.area || zone?.country;
          const deliveryTime = zone?.deliveryTime || '';
          return locality ? `${locality}${deliveryTime ? ` • ${deliveryTime}` : ''}` : null;
        })
        .filter(Boolean)
        .slice(0, 2)
        .join(' · ')
    : '';

  const hasFreeShippingZone = Array.isArray(deliveryZones) && deliveryZones.some((zone) => zone?.freeShipping === true);
  const deliveryLabel = zoneSummary || deliveryRegion || '';
  const shouldShowFreeShipping = Boolean(freeShipping || hasFreeShippingZone);

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

          </>
        )}
      </div>

      {deliveryLabel && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minHeight: '18px' }}>
          <Truck size={12} style={{ color: '#FF6B00', flexShrink: 0 }} />
          <span style={{ fontSize: '11px', color: '#7a7a7a', fontWeight: 600 }}>
            {shouldShowFreeShipping ? 'Livraison gratuite' : 'Livraison'} · {deliveryLabel}
          </span>
        </div>
      )}
    </div>
  );
}

export default React.memo(ProductPrice);
