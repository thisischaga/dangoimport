/** Prix affiché : promo si valide, sinon prix normal */
export function getEffectivePrice(product) {
  const price = Number(product?.price ?? 0) || 0;
  const promo = Number(product?.promoPrice ?? product?.salePrice ?? 0) || 0;
  if (promo > 0 && promo < price) return promo;
  return price;
}

export const DEFAULT_CATALOG_FILTERS = {
  category: '',
  minPrice: '',
  maxPrice: '',
  onlyPromo: false,
  inStock: false,
  newArrival: false,
  brand: '',
  condition: '',
};

export function countActiveFilters(filters = {}) {
  let n = 0;
  if (filters.category) n += 1;
  if (filters.minPrice) n += 1;
  if (filters.maxPrice) n += 1;
  if (filters.onlyPromo) n += 1;
  if (filters.inStock) n += 1;
  if (filters.newArrival) n += 1;
  if (filters.brand) n += 1;
  if (filters.condition) n += 1;
  return n;
}

export function applyProductFilters(products, filters = {}) {
  let result = [...(products || [])];

  if (filters.category) {
    const cat = String(filters.category).toLowerCase();
    result = result.filter(
      (p) => String(p.category || '').toLowerCase() === cat
    );
  }

  const min = filters.minPrice !== '' && filters.minPrice != null
    ? parseFloat(filters.minPrice)
    : null;
  const max = filters.maxPrice !== '' && filters.maxPrice != null
    ? parseFloat(filters.maxPrice)
    : null;

  if (min != null && !Number.isNaN(min)) {
    result = result.filter((p) => getEffectivePrice(p) >= min);
  }
  if (max != null && !Number.isNaN(max)) {
    result = result.filter((p) => getEffectivePrice(p) <= max);
  }

  if (filters.onlyPromo) {
    result = result.filter((p) => {
      const price = Number(p.price ?? 0);
      const promo = Number(p.promoPrice ?? p.salePrice ?? 0);
      return promo > 0 && promo < price;
    });
  }

  if (filters.inStock) {
    result = result.filter((p) => Number(p.stock ?? 0) > 0);
  }

  if (filters.newArrival) {
    result = result.filter(
      (p) => p.isNewArrival || p.isNew || p.isFeatured
    );
  }

  if (filters.brand) {
    const brand = String(filters.brand).toLowerCase();
    result = result.filter((p) =>
      String(p.brand || '').toLowerCase().includes(brand)
    );
  }

  if (filters.condition) {
    result = result.filter(
      (p) => String(p.condition || 'Neuf') === filters.condition
    );
  }

  return result;
}

export function buildProductQueryParams(filters = {}, searchQuery = '') {
  const params = new URLSearchParams({ limit: '100', page: '1' });
  if (searchQuery) params.set('search', searchQuery);
  if (filters.category) params.set('category', filters.category);
  if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice) params.set('maxPrice', String(filters.maxPrice));

  return params;
}
