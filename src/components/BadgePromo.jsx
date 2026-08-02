import React from 'react';

function BadgePromo({ children, className = '' }) {
  return (
    <span className={`rounded-full bg-[#FFF3EA] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#FF6B00] ${className}`.trim()}>
      {children}
    </span>
  );
}

export default BadgePromo;
