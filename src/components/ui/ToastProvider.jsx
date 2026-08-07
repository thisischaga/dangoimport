import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3200;

const cleanMessage = (msg) => {
  if (typeof msg !== 'string') return String(msg ?? '');
  return msg.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}✓✔]\s*/u, '');
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type, message, duration = DEFAULT_DURATION) => {
    const text = cleanMessage(message);
    if (!text) return null;

    const id = `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setToasts((prev) => [...prev, { id, type, message: text }]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(id), duration);
    }

    return id;
  }, [removeToast]);

  const contextValue = useMemo(
    () => ({
      success: (msg, duration) => pushToast('success', msg, duration),
      error: (msg, duration) => pushToast('error', msg, duration),
      warning: (msg, duration) => pushToast('warning', msg, duration),
      info: (msg, duration) => pushToast('info', msg, duration),
      clear: () => setToasts([]),
    }),
    [pushToast]
  );

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.dangoToast = contextValue;
    }
    return () => {
      if (typeof window !== 'undefined' && window.dangoToast === contextValue) {
        delete window.dangoToast;
      }
    };
  }, [contextValue]);

  if (typeof document === 'undefined') {
    return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div className="tiktok-toast-container" aria-live="polite" aria-relevant="additions">
          {toasts.map(({ id, message }) => (
            <div key={id} className="tiktok-toast" role="status">
              {message}
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
