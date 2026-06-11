import API_BASE_URL from '../apiConfig';

export function resolveImageUrl(img) {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, '').replace(/^images\/+/, '').replace(/^static\/media\//, '');
  if (clean.includes('static/media/')) {
    return trimmed.startsWith('/') ? trimmed : `/${trimmed}`;
  }
  return `${API_BASE_URL}/images/${clean}`;
}

export function getProductImage(product) {
  const raw = product?.images?.[0]?.url || product?.images?.[0] || product?.image;
  if (typeof raw === 'string') return resolveImageUrl(raw);
  if (raw?.url) return resolveImageUrl(raw.url);
  return null;
}
