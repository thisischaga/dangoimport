import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

const ToastContext = createContext(null);

const DEFAULT_DURATION = 3800;
const STATUS_STYLES = {
  success: { background: '#111827', color: '#fef3c7', border: 'none' },
  error: { background: '#111827', color: '#fecaca', border: 'none' },
  warning: { background: '#111827', color: '#fde68a', border: 'none' },
  info: { background: '#111827', color: '#d1d5db', border: 'none' },
};

const cleanMessage = (msg) => {
  if (typeof msg !== 'string') return msg;
  return msg.replace(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}✓✔]\s*/u, '');
};

const createToast = (type, message, duration = DEFAULT_DURATION) => ({
  id: `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  type,
  message: cleanMessage(message),
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
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 10,
          maxWidth: '90vw',
          width: 'max-content',
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
                padding: '14px 20px',
                boxShadow: '0 20px 60px rgba(15, 23, 42, 0.16)',
                minHeight: 50,
                border: 'none',
                outline: 'none',
                ...STATUS_STYLES[type],
              }}
            >
              <div style={{ flex: 1, fontSize: 14, lineHeight: 1.5, textAlign: 'center' }}>
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
