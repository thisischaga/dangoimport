export const VENDOR_CATEGORIES = [
  'Électronique',
  'Beauté & Parfums',
  'Maison & Déco',
  'Mode & Textile',
  'Sport & Loisirs',
  'Alimentation',
  'Auto & Moto',
  'TV & Électroménager',
  'Enfants & Jouets',
  'Bijoux & Montres',
  'Sacs & Maroquinerie',
  'Agriculture',
];

export const getVendorUser = () => {
  try {
    return JSON.parse(localStorage.getItem('dangoUser') || '{}');
  } catch {
    return {};
  }
};

export const isVendor = (user = getVendorUser()) =>
  user?.role === 'vendor' || user?.isVendor === true;

export const getVendorToken = () => localStorage.getItem('dangoToken');

export const saveVendorSession = ({ token, user }) => {
  if (token) localStorage.setItem('dangoToken', token);
  if (user) localStorage.setItem('dangoUser', JSON.stringify(user));
  window.dispatchEvent(new Event('authChange'));
};

export const vendorAuthHeaders = () => {
  const token = getVendorToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const fileToDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Lecture fichier impossible'));
    reader.readAsDataURL(file);
  });
