import React from 'react';

export default function CartSkeleton() {
  return (
    <div className="space-y-4">
      {[1,2,3].map(n => (
        <div key={n} className="bg-white rounded-2xl p-5 animate-pulse h-28" />
      ))}
    </div>
  );
}
