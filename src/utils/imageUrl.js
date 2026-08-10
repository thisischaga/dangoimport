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

export function getProductImages(product, max = 5) {
  if (!product) return [];
  const raw = product.images || [];
  const resolved = raw
    .map((img) => (typeof img === 'string' ? resolveImageUrl(img) : resolveImageUrl(img?.url)))
    .filter(Boolean);
  if (resolved.length === 0) {
    const single = getProductImage(product);
    if (single) return [single];
  }
  return resolved.slice(0, max);
}
