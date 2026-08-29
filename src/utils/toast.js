/**
 * Toast API — style admin (TikTok), via ToastProvider / window.dangoToast.
 * Remplace react-toastify dans tout le site client.
 */

function push(type, message, duration) {
  if (!message) return;

  let cleanMessage = message;

  // Remplacer les expressions réservées aux développeurs par une phrase compréhensible pour les visiteurs
  if (type === 'error' || type === 'warning') {
    const devKeywords = [
      'cannot find module', 'referenceerror', 'typeerror', 'mongo', 'database', 
      'internal server error', 'server error', 'syntaxerror', 'stack', 'undefined',
      'null', 'http', 'render', 'localhost', 'network error', 'axio', 'failed to fetch',
      'fetch failed'
    ];
    const lowerMsg = String(cleanMessage).toLowerCase();
    const isDevMsg = devKeywords.some(keyword => lowerMsg.includes(keyword)) || lowerMsg.includes('error:') || lowerMsg.includes('exception:');

    if (isDevMsg) {
      cleanMessage = "Une erreur technique est survenue. Veuillez réessayer plus tard.";
    }
  }

  const api = typeof window !== 'undefined' ? window.dangoToast : null;
  if (api?.[type]) {
    api[type](cleanMessage, duration);
    return;
  }
  console.warn(`[toast:${type}]`, cleanMessage);
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
