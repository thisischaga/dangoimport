import React from 'react';

function ShimmerBox({ style = {} }) {
  return (
    <div
      style={{
        background: 'linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeletonShimmer 1.4s infinite linear',
        borderRadius: '8px',
        ...style,
      }}
    />
  );
}

function ProductSkeleton() {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '0',
        overflow: 'hidden',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
      aria-hidden="true"
    >
      {/* Image placeholder */}
      <ShimmerBox style={{ aspectRatio: '1/1', borderRadius: 0 }} />

      {/* Content */}
      <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {/* Seller line */}
        <ShimmerBox style={{ height: '10px', width: '50%' }} />
        {/* Product name */}
        <ShimmerBox style={{ height: '13px', width: '100%' }} />
        <ShimmerBox style={{ height: '13px', width: '75%' }} />
        {/* Stars */}
        <ShimmerBox style={{ height: '10px', width: '60%' }} />
        {/* Price */}
        <ShimmerBox style={{ height: '18px', width: '45%' }} />
        <ShimmerBox style={{ height: '10px', width: '55%' }} />
        {/* Button */}
        <ShimmerBox style={{ height: '36px', width: '100%', borderRadius: '10px', marginTop: '4px' }} />
      </div>

      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}

export default React.memo(ProductSkeleton);
