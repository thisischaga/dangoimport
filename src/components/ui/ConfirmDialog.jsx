import React, { useEffect, useRef, createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/* ───── Context ───── */
const ConfirmContext = createContext(null);

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolveRef = useRef(null);

  const confirm = useCallback(({ title = 'Confirmation', message, confirmText = 'Confirmer', cancelText = 'Annuler', danger = false }) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setState({ title, message, confirmText, cancelText, danger });
    });
  }, []);

  const handleConfirm = () => {
    resolveRef.current?.(true);
    setState(null);
  };

  const handleCancel = () => {
    resolveRef.current?.(false);
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AnimatePresence>
        {state && (
          <ConfirmDialog
            {...state}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
          />
        )}
      </AnimatePresence>
    </ConfirmContext.Provider>
  );
}

/* ───── Dialog Component ───── */
function ConfirmDialog({ title, message, confirmText, cancelText, danger, onConfirm, onCancel }) {
  const cancelRef = useRef(null);

  useEffect(() => {
    cancelRef.current?.focus();
    const handleKey = (e) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onCancel]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        onClick={onCancel}
        style={{
          position: 'fixed', inset: 0, zIndex: 99998,
          background: 'rgba(15, 23, 42, 0.5)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        role="dialog"
        aria-modal="true"
        style={{
          position: 'fixed', inset: 0,
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          width: '100%',
          maxWidth: 420,
          background: '#fff',
          borderRadius: 6,
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(15, 23, 42, 0.05)',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}>
          {/* Header */}
          <div style={{ padding: '24px 24px 0' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: 48, height: 48, borderRadius: 6, margin: '0 auto 16px',
              background: danger ? '#fef2f2' : '#fff7ed',
            }}>
              {danger ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f68b1e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              )}
            </div>
            <h3 style={{
              margin: 0, textAlign: 'center',
              fontSize: 18, fontWeight: 800, color: '#0f172a',
              letterSpacing: '-0.02em',
            }}>{title}</h3>
            <p style={{
              margin: '10px 0 0', textAlign: 'center',
              fontSize: 14, color: '#64748b', lineHeight: 1.6,
            }}>{message}</p>
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex', gap: 10,
            padding: '20px 24px 24px',
          }}>
            <button
              ref={cancelRef}
              onClick={onCancel}
              style={{
                flex: 1, padding: '12px 16px',
                border: '1px solid #e2e8f0', borderRadius: 4,
                background: '#fff', color: '#334155',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
              onMouseOut={(e) => e.currentTarget.style.background = '#fff'}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              style={{
                flex: 1, padding: '12px 16px',
                border: 'none', borderRadius: 4,
                background: danger ? '#ef4444' : '#f68b1e',
                color: '#fff',
                fontSize: 14, fontWeight: 700, cursor: 'pointer',
                transition: 'background 0.15s',
              }}
              onMouseOver={(e) => e.currentTarget.style.background = danger ? '#dc2626' : '#e07a15'}
              onMouseOut={(e) => e.currentTarget.style.background = danger ? '#ef4444' : '#f68b1e'}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default ConfirmDialog;
