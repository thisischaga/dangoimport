/**
 * Toast API — style admin (TikTok), via ToastProvider / window.dangoToast.
 * Remplace react-toastify dans tout le site client.
 */

function push(type, message, duration) {
  if (!message) return;
  const api = typeof window !== 'undefined' ? window.dangoToast : null;
  if (api?.[type]) {
    api[type](message, duration);
    return;
  }
  console.warn(`[toast:${type}]`, message);
}

export const toast = {
  success: (message, duration) => push('success', message, duration),
  error: (message, duration) => push('error', message, duration),
  warning: (message, duration) => push('warning', message, duration),
  // legacy alias used across the codebase
  warn: (message, duration) => push('warning', message, duration),
  info: (message, duration) => push('info', message, duration),
  loading: (message, duration) => {
    push('info', message, duration);
    return `loading-${Date.now()}`;
  },
  update: (id, opts = {}) => {
    const text = opts.render || opts.message;
    const type = opts.type || 'info';
    if (text) {
      push(type, text, opts.autoClose || 3200);
    }
  },
  dismiss: () => window.dangoToast?.clear?.(),
  clear: () => window.dangoToast?.clear?.(),
};

export default toast;
