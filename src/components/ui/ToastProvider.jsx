import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3800;
const STATUS_STYLES = {
  success: { background: '#111827', color: '#fef3c7', border: '1px solid #f59e0b' },
  error: { background: '#111827', color: '#fecaca', border: '1px solid #f87171' },
  warning: { background: '#111827', color: '#fde68a', border: '1px solid #facc15' },
  info: { background: '#111827', color: '#d1d5db', border: '1px solid #93c5fd' },
};

const createToast = (type, message, duration = DEFAULT_DURATION) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  message,
  duration,
});

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const pushToast = useCallback((type, message, duration = DEFAULT_DURATION) => {
    if (!message) return null;
    const toast = createToast(type, message, duration);
    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      window.setTimeout(() => removeToast(toast.id), duration);
    }

    return toast.id;
  }, [removeToast]);

  useEffect(() => {
    const toastApi = {
      success: (message, duration) => pushToast('success', message, duration),
      error: (message, duration) => pushToast('error', message, duration),
      warning: (message, duration) => pushToast('warning', message, duration),
      info: (message, duration) => pushToast('info', message, duration),
      clear: () => setToasts([]),
    };

    if (typeof window !== 'undefined') {
      window.dangoToast = toastApi;
    }

    return () => {
      if (typeof window !== 'undefined' && window.dangoToast === toastApi) {
        delete window.dangoToast;
      }
    };
  }, [pushToast]);

  const contextValue = useMemo(
    () => ({ success: (msg, duration) => pushToast('success', msg, duration), error: (msg, duration) => pushToast('error', msg, duration), warning: (msg, duration) => pushToast('warning', msg, duration), info: (msg, duration) => pushToast('info', msg, duration), clear: () => setToasts([]) }),
    [pushToast]
  );

  if (typeof document === 'undefined') {
    return <ToastContext.Provider value={contextValue}>{children}</ToastContext.Provider>;
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {createPortal(
        <div style={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
          minWidth: 280,
          pointerEvents: 'none',
        }}>
          {toasts.map(({ id, type, message }) => (
            <div
              key={id}
              style={{
                pointerEvents: 'auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                borderRadius: 16,
                padding: '14px 16px',
                boxShadow: '0 20px 60px rgba(15, 23, 42, 0.16)',
                minHeight: 60,
                ...STATUS_STYLES[type],
              }}
            >
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5 }}>
                {message}
              </div>
              <button
                type="button"
                onClick={() => removeToast(id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontWeight: 700,
                  opacity: 0.7,
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
