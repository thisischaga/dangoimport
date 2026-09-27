import API_BASE_URL from '../apiConfig';

export function resolveImageUrl(img) {
  if (!img || typeof img !== 'string') return null;
  const trimmed = img.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    if (trimmed.startsWith('http://')) {
      return `https://${trimmed.slice(7)}`;
    }
    return trimmed;
  }
  if (trimmed.startsWith('//')) {
    return `https:${trimmed}`;
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

export function getProductImages(product, max = 8) {
  if (!product) return [];
  const raw = product.images || [];
  const resolved = raw
    .map((img) => (typeof img === 'string' ? resolveImageUrl(img) : resolveImageUrl(img?.url)))
    .filter(Boolean);

  const scrapeFromImageField = () => {
    const field = product.image;
    if (!field || typeof field !== 'string') return [];
    const trimmed = field.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((entry) => (typeof entry === 'string' ? entry : entry?.url))
            .map((u) => resolveImageUrl(u))
            .filter(Boolean);
        }
      } catch {
        /* fallback regex below */
      }
    }
    const matches = trimmed.match(/https?:\/\/[^\s"'\\[\],]+/gi) || [];
    return [...new Set(matches.map((u) => resolveImageUrl(u)).filter(Boolean))];
  };

  const merged = [...new Set([...resolved, ...scrapeFromImageField()])];
  if (merged.length === 0) {
    const single = getProductImage(product);
    if (single) return [single];
  }
  return merged.slice(0, max);
}
