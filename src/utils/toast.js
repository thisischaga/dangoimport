const noop = (message) => {
  if (typeof window !== 'undefined' && window.console) {
    console.warn('Toast fallback:', message);
  }
};

const getToastApi = () => {
  if (typeof window !== 'undefined' && window.dangoToast) {
    return window.dangoToast;
  }
  return {
    success: noop,
    error: noop,
    warning: noop,
    info: noop,
    clear: () => {},
  };
};

export const toast = {
  success: (message, duration) => getToastApi().success(message, duration),
  error: (message, duration) => getToastApi().error(message, duration),
  warning: (message, duration) => getToastApi().warning(message, duration),
  info: (message, duration) => getToastApi().info(message, duration),
  clear: () => getToastApi().clear(),
};
