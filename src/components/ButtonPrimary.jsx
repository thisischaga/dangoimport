import React from 'react';

function ButtonPrimary({ children, className = '', ...props }) {
  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center rounded-full bg-[#FF6B00] px-4 py-2.5 font-semibold text-white transition hover:bg-[#e45f00] ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default ButtonPrimary;
