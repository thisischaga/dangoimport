import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, duration = 3000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast TikTok Style Container */}
      <div className="tiktok-toast-wrapper">
        {toasts.map((t) => (
          <div key={t.id} className="tiktok-toast-item">
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
